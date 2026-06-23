from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    gemini_api_key: str = "placeholder"
    aws_access_key_id: str = "placeholder"
    aws_secret_access_key: str = "placeholder"
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "ai-agent-docs-bucket"

    class Config:
        env_file = ".env"

settings = Settings()
