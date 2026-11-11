import os
import uuid
import re
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
from config import settings
from tasks.manager import job_manager
from engine.generator import verify_gemini_availability

app = FastAPI(
    title="Autonomous Codebase Documenter API",
    description="Intelligent documentation generation engine powered by Google GenAI",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ValidateKeyRequest(BaseModel):
    api_key: Optional[str] = None
    model: Optional[str] = None

class JobRequest(BaseModel):
    repo_url: str
    depth: Optional[str] = "in-depth" # "quick" | "in-depth"
    api_key: Optional[str] = None

@app.get("/api/health")
async def health_check():
    has_gemini = settings.gemini_api_key != "placeholder" and bool(settings.gemini_api_key)
    has_aws = settings.aws_access_key_id != "placeholder" and bool(settings.aws_access_key_id)
    return {
        "status": "online",
        "gemini_configured": has_gemini,
        "gemini_model": settings.gemini_model,
        "s3_configured": has_aws,
        "version": "2.0.0"
    }

@app.post("/api/gemini/validate")
async def validate_gemini_key(request: ValidateKeyRequest):
    key = request.api_key or settings.gemini_api_key
    model = request.model or settings.gemini_model
    is_available, message, error_code = verify_gemini_availability(api_key=key, model_name=model)
    return {
        "valid": is_available,
        "available": is_available,
        "message": message,
        "error_code": error_code,
        "model": model
    }

@app.post("/api/job", status_code=status.HTTP_202_ACCEPTED)
async def create_job(request: JobRequest):
    repo_url = request.repo_url.strip()

    # Validate GitHub URL
    if not re.match(r"^https?://(www\.)?github\.com/[\w.-]+/[\w.-]+/?$", repo_url):
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo)"
        )

    job_id = str(uuid.uuid4())
    depth = request.depth if request.depth in ["quick", "in-depth"] else "in-depth"

    # Initialize job in manager
    await job_manager.broadcast_event(
        job_id=job_id,
        status="QUEUED",
        message="Job queued for processing...",
        progress=5
    )

    # Spawn background task
    import asyncio
    asyncio.create_task(
        job_manager.process_job(
            job_id=job_id,
            repo_url=repo_url,
            depth=depth,
            custom_api_key=request.api_key
        )
    )

    return {"job_id": job_id, "status": "QUEUED"}

@app.get("/api/job/{job_id}")
async def get_job_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.get("/api/job/{job_id}/events")
async def stream_job_events(job_id: str):
    return StreamingResponse(
        job_manager.subscribe(job_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/job/{job_id}/download")
async def download_docs_zip(job_id: str):
    zip_path = os.path.join(settings.jobs_dir, job_id, f"{job_id}_docs.zip")
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="Documentation zip not found or expired")

    return FileResponse(
        path=zip_path,
        media_type="application/zip",
        filename=f"{job_id}_documentation.zip"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
