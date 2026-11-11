import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str = "placeholder"
    gemini_model: str = "gemini-3.8-flash"
    aws_access_key_id: str = "placeholder"
    aws_secret_access_key: str = "placeholder"
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "ai-agent-docs-bucket"
    jobs_dir: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "jobs_data")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
