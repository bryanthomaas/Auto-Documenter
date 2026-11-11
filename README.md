# Auto-Documenter

Web application that takes a public GitHub repository URL and generates interactive architecture diagrams, module breakdowns, and downloadable Markdown documentation.

![Landing Page](docs/assets/landing-page.png)

## How It Works

Paste any public GitHub URL and choose either **Fast** or **In-Depth** scope.

- **Without an API key**: Clones the repository locally, scans the file tree and manifest files (`package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`), detects the tech stack, and builds a structural preview with a Mermaid dependency diagram.
- **With a Gemini API key**: Runs full codebase synthesis (`gemini-3.8-flash` with fallback to `gemini-3.5-flash-lite` if rate-limited) to document module internals, component relationships, and API references. Keys can be pasted in the UI (stored in `localStorage`) or set in `.env`.

Once generated, you can browse the documentation by section, search across all files (`/` or `Ctrl+K`), pan and zoom the Mermaid flowchart, copy the full Markdown, or download the `.zip` bundle.

| Overview | Architecture & Flow |
| --- | --- |
| ![Workspace Overview](docs/assets/workspace-overview.png) | ![Workspace Architecture](docs/assets/workspace-architecture.png) |

## Stack

- **Backend**: Python, FastAPI, GitPython, Google GenAI SDK (`google-genai`), Server-Sent Events (SSE)
- **Frontend**: React 18, Vite, Tailwind CSS, Mermaid.js, GSAP

## Running Locally

### 1. Backend

Requires Python 3.11+ and `git` installed on `PATH`.

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Optional: create a `.env` file in the root or `backend/` folder if you want to set a default key on the server instead of entering it in the browser:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

### 2. Frontend

Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Docker

```bash
docker compose up --build
```

## License

MIT
