import os
import shutil
import subprocess
import json
import redis
import boto3
from botocore.exceptions import ClientError
from celery import Celery
from config import settings
from agent import run_documentation_agent

celery_app = Celery(
    "tasks",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend
)

redis_client = redis.from_url(settings.celery_result_backend)

# Files/folders to ignore during analysis
IGNORE_LIST = [
    ".git", "node_modules", "venv", "__pycache__", ".next", "dist", "build",
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    ".png", ".jpg", ".jpeg", ".mp4", ".gif", ".ico", ".svg", ".zip", ".tar.gz", ".pdf"
]

def update_status(job_id: str, status: str, message: str, progress: int, download_url: str = None):
    data = {
        "status": status,
        "message": message,
        "progress": progress,
        "download_url": download_url
    }
    redis_client.set(f"job_status:{job_id}", json.dumps(data))
    # Optionally expire after 24 hours
    redis_client.expire(f"job_status:{job_id}", 86400)

def should_ignore(path: str) -> bool:
    for ignore_item in IGNORE_LIST:
        if ignore_item in path:
            return True
    return False

def check_line_limit(repo_path: str, max_lines: int = 15000) -> bool:
    total_lines = 0
    for root, dirs, files in os.walk(repo_path):
        # Modify dirs in place to skip ignored directories
        dirs[:] = [d for d in dirs if not should_ignore(os.path.join(root, d))]
        
        for file in files:
            file_path = os.path.join(root, file)
            if should_ignore(file_path):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = sum(1 for _ in f)
                    total_lines += lines
            except UnicodeDecodeError:
                # Binary file or unsupported encoding, skip
                pass
                
            if total_lines > max_lines:
                return False
    return True

def ensure_s3_bucket_exists(s3_client, bucket_name, region):
    try:
        s3_client.head_bucket(Bucket=bucket_name)
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            # Bucket does not exist, try to create it
            try:
                if region == 'us-east-1':
                    s3_client.create_bucket(Bucket=bucket_name)
                else:
                    s3_client.create_bucket(
                        Bucket=bucket_name,
                        CreateBucketConfiguration={'LocationConstraint': region}
                    )
                # Set lifecycle rule to expire objects after 1 day
                s3_client.put_bucket_lifecycle_configuration(
                    Bucket=bucket_name,
                    LifecycleConfiguration={
                        'Rules': [
                            {
                                'ID': 'Delete old zips',
                                'Filter': {'Prefix': ''},
                                'Status': 'Enabled',
                                'Expiration': {'Days': 1}
                            }
                        ]
                    }
                )
            except ClientError as ce:
                raise Exception(f"Failed to create bucket: {ce}")
        else:
            raise Exception(f"Error checking bucket: {e}")

@celery_app.task(bind=True)
def process_repository(self, repo_url: str):
    job_id = self.request.id
    tmp_dir = f"/tmp/jobs/{job_id}"
    docs_dir = f"{tmp_dir}_docs"
    zip_path = f"{tmp_dir}_docs.zip"
    
    try:
        update_status(job_id, "PROCESSING", "Cloning repository...", 10)
        
        if os.path.exists(tmp_dir):
            shutil.rmtree(tmp_dir)
        os.makedirs(tmp_dir, exist_ok=True)
        os.makedirs(docs_dir, exist_ok=True)
        
        # Clone repository
        try:
            subprocess.run(
                ["git", "clone", "--depth", "1", repo_url, tmp_dir],
                check=True,
                capture_output=True,
                text=True
            )
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to clone repository: {e.stderr}")

        update_status(job_id, "PROCESSING", "Scanning repository size...", 20)
        
        # Guardrail check
        if not check_line_limit(tmp_dir, 15000):
            raise Exception("Repository exceeds the 15,000 line limit for API cost protection.")
            
        update_status(job_id, "PROCESSING", "Analyzing codebase via LangGraph engine...", 40)
        
        # Run LangGraph Agent
        run_documentation_agent(tmp_dir, docs_dir, job_id, update_status)
        
        update_status(job_id, "PROCESSING", "Compressing documentation...", 80)
        
        # Zip documentation
        shutil.make_archive(zip_path.replace('.zip', ''), 'zip', docs_dir)
        
        update_status(job_id, "PROCESSING", "Uploading to S3...", 90)
        
        # Upload to S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
        
        bucket_name = settings.s3_bucket_name
        ensure_s3_bucket_exists(s3_client, bucket_name, settings.aws_region)
        
        object_name = f"{job_id}/documentation.zip"
        s3_client.upload_file(zip_path, bucket_name, object_name)
        
        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': object_name},
            ExpiresIn=86400 # 24 hours
        )
        
        update_status(job_id, "COMPLETED", "Documentation successfully generated.", 100, presigned_url)
        return {"status": "SUCCESS", "download_url": presigned_url}

    except Exception as e:
        error_msg = str(e)
        update_status(job_id, "FAILED", f"Error: {error_msg}", 0)
        return {"status": "FAILED", "error": error_msg}
        
    finally:
        # Cleanup
        for path in [tmp_dir, docs_dir, zip_path]:
            if os.path.exists(path):
                if os.path.isdir(path):
                    shutil.rmtree(path, ignore_errors=True)
                else:
                    os.remove(path)
