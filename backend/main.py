from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Dict, Any
import redis
import json
from config import settings
from tasks import process_repository

app = FastAPI(title="Autonomous Codebase Documenter")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client = redis.from_url(settings.celery_result_backend)

class JobRequest(BaseModel):
    repo_url: HttpUrl

@app.post("/api/job", status_code=status.HTTP_202_ACCEPTED)
async def create_job(request: JobRequest):
    repo_url = str(request.repo_url)
    
    # Basic validation for github url
    if "github.com" not in repo_url:
        raise HTTPException(status_code=400, detail="Only GitHub URLs are supported.")
        
    # Trigger Celery task
    task = process_repository.delay(repo_url)
    
    # Initialize status in Redis
    initial_status = {
        "status": "QUEUED",
        "message": "Job added to queue.",
        "progress": 0,
        "download_url": None
    }
    redis_client.set(f"job_status:{task.id}", json.dumps(initial_status))
    
    return {"job_id": task.id, "status": "QUEUED"}

@app.get("/api/job/{job_id}")
async def get_job_status(job_id: str):
    status_data_raw = redis_client.get(f"job_status:{job_id}")
    
    if not status_data_raw:
        # Fallback to check celery task status directly if redis key expired/missing
        from tasks import celery_app
        res = celery_app.AsyncResult(job_id)
        if res.state == 'PENDING':
            return {"status": "QUEUED", "message": "Job is pending...", "progress": 0, "download_url": None}
        elif res.state != 'FAILURE':
            # Could be SUCCESS or PROGRESS if we used custom states
            info = res.info if isinstance(res.info, dict) else {}
            return {
                "status": res.state,
                "message": info.get("message", "Processing..."),
                "progress": info.get("progress", 0),
                "download_url": info.get("download_url", None)
            }
        else:
            return {"status": "FAILED", "message": str(res.info), "progress": 0, "download_url": None}

    return json.loads(status_data_raw)
