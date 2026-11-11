import os
import shutil
import zipfile
import json
import asyncio
import uuid
from typing import Dict, List, Optional, AsyncGenerator
from datetime import datetime, timezone
from config import settings
from engine.models import DocumentationPayload, JobStatusResponse
from engine.analyzer import clone_repository, scan_repository, detect_framework, extract_code_context
from engine.generator import generate_documentation, verify_gemini_availability

class JobManager:
    def __init__(self):
        self.jobs: Dict[str, Dict] = {}
        self.subscribers: Dict[str, List[asyncio.Queue]] = {}
        os.makedirs(settings.jobs_dir, exist_ok=True)

    def get_job(self, job_id: str) -> Optional[Dict]:
        return self.jobs.get(job_id)

    async def broadcast_event(self, job_id: str, status: str, message: str, progress: int, docs: Optional[DocumentationPayload] = None, download_url: Optional[str] = None, error: Optional[str] = None):
        job_data = {
            "job_id": job_id,
            "status": status,
            "message": message,
            "progress": progress,
            "download_url": download_url,
            "docs": docs.model_dump() if docs else (self.jobs.get(job_id, {}).get("docs")),
            "error": error,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        self.jobs[job_id] = job_data

        queues = self.subscribers.get(job_id, [])
        for q in queues:
            await q.put(job_data)

    async def subscribe(self, job_id: str) -> AsyncGenerator[str, None]:
        queue = asyncio.Queue()
        if job_id not in self.subscribers:
            self.subscribers[job_id] = []
        self.subscribers[job_id].append(queue)

        # Emit current status immediately if available
        if job_id in self.jobs:
            yield f"data: {json.dumps(self.jobs[job_id])}\n\n"

        try:
            while True:
                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"
                if data.get("status") in ["COMPLETED", "FAILED"]:
                    break
        finally:
            if job_id in self.subscribers and queue in self.subscribers[job_id]:
                self.subscribers[job_id].remove(queue)

    async def process_job(self, job_id: str, repo_url: str, depth: str, custom_api_key: Optional[str] = None):
        job_dir = os.path.join(settings.jobs_dir, job_id)
        repo_dir = os.path.join(job_dir, "repo")
        docs_dir = os.path.join(job_dir, "docs")
        zip_path = os.path.join(job_dir, f"{job_id}_docs.zip")

        os.makedirs(job_dir, exist_ok=True)

        try:
            # 1. Cloning
            await self.broadcast_event(job_id, "CLONING", "Connecting to GitHub & cloning repository...", 15)
            await asyncio.to_thread(clone_repository, repo_url, repo_dir)
            await asyncio.sleep(0.4)

            # 2. Analyzing
            await self.broadcast_event(job_id, "ANALYZING", "Scanning files, frameworks, and architecture...", 35)
            file_list, total_files, total_lines, lang_counts = await asyncio.to_thread(scan_repository, repo_dir)
            framework, languages = await asyncio.to_thread(detect_framework, repo_dir)
            code_context = await asyncio.to_thread(extract_code_context, repo_dir)
            await asyncio.sleep(0.4)

            repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")

            # 3. Synthesizing
            effective_key = (custom_api_key or settings.gemini_api_key or "").strip()
            model_name = settings.gemini_model or "gemini-3.8-flash"
            if "gemini-2.5" in model_name or "gemini-1.5" in model_name:
                model_name = "gemini-3.8-flash"

            if effective_key and effective_key != "placeholder":
                is_available, status_msg, err_code = await asyncio.to_thread(
                    verify_gemini_availability, effective_key, model_name
                )
                if not is_available:
                    if err_code == "503_UNAVAILABLE":
                        progress_msg = "Gemini service temporarily unavailable (503 high demand spike). Using structural heuristic preview..."
                    elif err_code == "INVALID_KEY":
                        progress_msg = "Gemini API key invalid or unauthorized. Using structural heuristic preview..."
                    else:
                        progress_msg = f"Gemini unavailable ({err_code or 'check failed'}). Using structural heuristic preview..."
                    await self.broadcast_event(job_id, "SYNTHESIZING", progress_msg, 65)
                else:
                    await self.broadcast_event(
                        job_id,
                        "SYNTHESIZING",
                        f"Generating multi-module documentation with Gemini ({framework})...",
                        65
                    )
            else:
                await self.broadcast_event(
                    job_id,
                    "SYNTHESIZING",
                    f"Generating structural heuristic preview ({framework})...",
                    65
                )

            docs = await asyncio.to_thread(
                generate_documentation,
                repo_name=repo_name,
                repo_url=repo_url,
                framework=framework,
                languages=languages,
                total_files=total_files,
                total_lines=total_lines,
                file_tree=file_list,
                code_context=code_context,
                depth=depth,
                custom_api_key=custom_api_key
            )
            await asyncio.sleep(0.4)

            # 4. Packaging
            await self.broadcast_event(job_id, "PACKAGING", "Assembling documentation files and ZIP archive...", 85, docs=docs)
            os.makedirs(docs_dir, exist_ok=True)

            with open(os.path.join(docs_dir, "README.md"), "w", encoding="utf-8") as f:
                f.write(docs.overview)
            with open(os.path.join(docs_dir, "ARCHITECTURE.md"), "w", encoding="utf-8") as f:
                f.write(docs.architecture + "\n\n```mermaid\n" + docs.mermaid_diagram + "\n```\n")
            with open(os.path.join(docs_dir, "API_REFERENCE.md"), "w", encoding="utf-8") as f:
                f.write(docs.api_reference)
            with open(os.path.join(docs_dir, "GETTING_STARTED.md"), "w", encoding="utf-8") as f:
                f.write(docs.getting_started)
            with open(os.path.join(docs_dir, "docs.json"), "w", encoding="utf-8") as f:
                json.dump(docs.model_dump(), f, indent=2)

            # Create Zip
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, _, files in os.walk(docs_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, docs_dir)
                        zipf.write(file_path, arcname)

            download_url = f"/api/job/{job_id}/download"

            # Optional S3 Upload if configured
            if settings.aws_access_key_id != "placeholder" and settings.aws_secret_access_key != "placeholder":
                try:
                    import boto3
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.aws_access_key_id,
                        aws_secret_access_key=settings.aws_secret_access_key,
                        region_name=settings.aws_region
                    )
                    object_name = f"{job_id}/documentation.zip"
                    s3_client.upload_file(zip_path, settings.s3_bucket_name, object_name)
                    s3_url = s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': settings.s3_bucket_name, 'Key': object_name},
                        ExpiresIn=86400
                    )
                    download_url = s3_url
                except Exception:
                    pass # Fallback remains direct local download url

            # 5. Completed
            await asyncio.sleep(0.35)
            await self.broadcast_event(
                job_id,
                "COMPLETED",
                "Documentation successfully generated!",
                100,
                docs=docs,
                download_url=download_url
            )

        except Exception as e:
            await self.broadcast_event(
                job_id,
                "FAILED",
                f"Generation failed: {str(e)}",
                0,
                error=str(e)
            )
        finally:
            # Clean up cloned repo directory to save disk space
            if os.path.exists(repo_dir):
                shutil.rmtree(repo_dir, ignore_errors=True)

job_manager = JobManager()
