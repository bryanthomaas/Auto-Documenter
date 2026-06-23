# Autonomous Codebase Documenter

A powerful full-stack application that autonomously generates comprehensive markdown documentation for any public GitHub repository. Built with React, FastAPI, Celery, and LangGraph.

## Architecture

* **Frontend**: React SPA using Vite and Tailwind CSS.
* **Backend**: FastAPI for robust and asynchronous API endpoints.
* **Task Queue**: Celery with Redis for scalable background processing.
* **Analysis Engine**: LangGraph orchestration for repository mapping and dependency analysis.
* **Storage**: AWS S3 for securely hosting the generated documentation zip files.

## Prerequisites

* Docker and Docker Compose
* An AWS Account (Access Key and Secret Key)
* A Gemini API Key (or other configured LLM provider)

## Environment Variables

To run the application, you need to provide your API keys. By default, the `docker-compose.yml` file uses placeholders or reads from your local environment variables.

You can create a `.env` file in the root directory (which is git-ignored) to store your keys safely:

```env
GEMINI_API_KEY=your_gemini_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

## Running the Application

Start the entire system using Docker Compose:

```bash
docker-compose up --build
```

The application will be available at:
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:8000`

## Features

* **Deep Git Integration**: Clones repositories shallowly for fast analysis.
* **Cost Protection Guardrails**: Automatically aborts processing if a repository exceeds a 15,000-line limit.
* **Real-time Status Tracking**: The UI polls the backend to display the current processing step via an animated stepper.
* **Secure Delivery**: Zips the final documentation and generates a 24-hour pre-signed AWS S3 download link.

## License

MIT License
