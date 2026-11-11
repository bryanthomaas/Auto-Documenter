import os
import shutil
import subprocess
import json
from typing import Dict, List, Tuple, Any

IGNORE_DIRS = {
    ".git", "node_modules", "venv", ".venv", "env", "__pycache__", ".next",
    "dist", "build", ".cache", ".idea", ".vscode", "target", "vendor"
}

IGNORE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
    ".zip", ".tar", ".gz", ".7z", ".rar",
    ".exe", ".dll", ".so", ".dylib", ".bin",
    ".mp4", ".mov", ".avi", ".mp3", ".wav",
    ".pdf", ".docx", ".xlsx",
    ".pyc", ".pyo", ".pyd",
    ".lock", "-lock.json", ".map"
}

KEY_FILE_NAMES = [
    "readme.md", "package.json", "requirements.txt", "pyproject.toml",
    "cargo.toml", "go.mod", "docker-compose.yml", "dockerfile",
    "main.py", "app.py", "index.js", "server.js", "index.ts", "server.ts",
    "src/app.jsx", "src/main.jsx", "src/app.tsx", "src/index.tsx",
    "src/main.rs", "main.go"
]

def clone_repository(repo_url: str, target_dir: str) -> None:
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    os.makedirs(target_dir, exist_ok=True)

    result = subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, target_dir],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"Failed to clone repository: {result.stderr or result.stdout}")

def scan_repository(repo_path: str, max_lines: int = 150000) -> Tuple[List[str], int, int, Dict[str, int]]:
    """
    Returns:
    - file_list: list of relative file paths
    - total_files: count of relevant files
    - total_lines: total lines of code scanned
    - language_counts: distribution of code lines by language/extension
    """
    file_list = []
    total_lines = 0
    language_counts: Dict[str, int] = {}

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]

        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in IGNORE_EXTENSIONS:
                continue

            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, repo_path).replace("\\", "/")
            file_list.append(rel_path)

            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                    lines = sum(1 for _ in fh)
                    total_lines += lines
                    lang_key = ext[1:].upper() if ext else "OTHER"
                    language_counts[lang_key] = language_counts.get(lang_key, 0) + lines
            except Exception:
                pass

    return file_list, len(file_list), total_lines, language_counts

def detect_framework(repo_path: str) -> Tuple[str, List[str]]:
    frameworks = []
    languages = []

    # Check Node / JavaScript / TypeScript
    pkg_path = os.path.join(repo_path, "package.json")
    if os.path.exists(pkg_path):
        languages.append("JavaScript/TypeScript")
        try:
            with open(pkg_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                if "next" in deps:
                    frameworks.append("Next.js")
                elif "react" in deps:
                    frameworks.append("React")
                elif "vue" in deps:
                    frameworks.append("Vue")
                elif "express" in deps:
                    frameworks.append("Express")
                elif "fastify" in deps:
                    frameworks.append("Fastify")
                elif "svelte" in deps:
                    frameworks.append("Svelte")
                else:
                    frameworks.append("Node.js")
        except Exception:
            frameworks.append("Node.js")

    # Check Python
    py_files = [f for f in ["requirements.txt", "pyproject.toml", "setup.py", "Pipfile"] if os.path.exists(os.path.join(repo_path, f))]
    if py_files or any(f.endswith(".py") for f in os.listdir(repo_path)):
        languages.append("Python")
        content = ""
        for pf in py_files:
            try:
                with open(os.path.join(repo_path, pf), "r", encoding="utf-8", errors="ignore") as f:
                    content += f.read().lower() + "\n"
            except Exception:
                pass
        if "fastapi" in content:
            frameworks.append("FastAPI")
        elif "django" in content:
            frameworks.append("Django")
        elif "flask" in content:
            frameworks.append("Flask")
        elif "torch" in content or "tensorflow" in content:
            frameworks.append("PyTorch/ML")
        else:
            frameworks.append("Python")

    # Check Go
    if os.path.exists(os.path.join(repo_path, "go.mod")):
        languages.append("Go")
        frameworks.append("Go")

    # Check Rust
    if os.path.exists(os.path.join(repo_path, "Cargo.toml")):
        languages.append("Rust")
        frameworks.append("Rust")

    primary_framework = " / ".join(frameworks) if frameworks else "General Codebase"
    return primary_framework, list(set(languages))

def extract_code_context(repo_path: str, max_chars: int = 80000) -> str:
    """
    Extracts high-signal code context:
    - Root manifest files (package.json, requirements.txt, pyproject.toml, etc.)
    - Existing README summary (if present)
    - Entry points and central routes/controllers
    """
    context_chunks = []
    current_chars = 0

    # 1. Look for manifest / config
    for candidate in ["package.json", "requirements.txt", "pyproject.toml", "go.mod", "Cargo.toml", "docker-compose.yml"]:
        p = os.path.join(repo_path, candidate)
        if os.path.exists(p) and os.path.isfile(p):
            try:
                with open(p, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read(4000)
                    chunk = f"=== File: {candidate} ===\n{content}\n"
                    context_chunks.append(chunk)
                    current_chars += len(chunk)
            except Exception:
                pass

    # 2. Look for existing README
    for candidate in ["README.md", "readme.md", "README"]:
        p = os.path.join(repo_path, candidate)
        if os.path.exists(p) and os.path.isfile(p):
            try:
                with open(p, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read(6000)
                    chunk = f"=== Existing README ({candidate}) ===\n{content}\n"
                    context_chunks.append(chunk)
                    current_chars += len(chunk)
            except Exception:
                pass
            break

    # 3. Look for entry points and key files
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]
        for f in files:
            if current_chars >= max_chars:
                break
            ext = os.path.splitext(f)[1].lower()
            if ext not in [".py", ".js", ".ts", ".jsx", ".tsx", ".go", ".rs", ".java"]:
                continue

            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, repo_path).replace("\\", "/")
            rel_lower = rel_path.lower()

            # Prioritize entry points and core models
            is_priority = any(k in rel_lower for k in ["main", "app", "index", "server", "router", "route", "model", "schema", "agent"])
            if is_priority or len(context_chunks) < 8:
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read(5000)
                        chunk = f"=== File: {rel_path} ===\n{content}\n"
                        context_chunks.append(chunk)
                        current_chars += len(chunk)
                except Exception:
                    pass

    return "\n".join(context_chunks)
