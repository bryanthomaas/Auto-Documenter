from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class TechStackItem(BaseModel):
    category: str
    name: str
    purpose: str

class ModuleDoc(BaseModel):
    name: str
    path: str
    purpose: str
    key_files: List[str] = Field(default_factory=list)

class DocumentationPayload(BaseModel):
    repo_name: str
    repo_url: str
    detected_framework: str = "Unknown"
    languages: List[str] = Field(default_factory=list)
    total_files: int = 0
    total_lines: int = 0
    overview: str = ""
    architecture: str = ""
    mermaid_diagram: str = ""
    tech_stack: List[TechStackItem] = Field(default_factory=list)
    modules: List[ModuleDoc] = Field(default_factory=list)
    api_reference: str = ""
    getting_started: str = ""
    file_tree: List[str] = Field(default_factory=list)
    is_heuristic: bool = False

class JobStatusResponse(BaseModel):
    job_id: str
    status: str # QUEUED, CLONING, ANALYZING, SYNTHESIZING, COMPLETED, FAILED
    progress: int # 0 to 100
    message: str
    download_url: Optional[str] = None
    docs: Optional[DocumentationPayload] = None
    error: Optional[str] = None
