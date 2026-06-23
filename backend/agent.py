import os
import json
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from config import settings

class AgentState(TypedDict):
    repo_path: str
    docs_path: str
    job_id: str
    update_status: Any # Function to report progress
    file_map: Dict[str, Any]
    dependency_analysis: str
    generated_docs: List[str]

def should_ignore(path: str) -> bool:
    IGNORE_LIST = [".git", "node_modules", "venv", "__pycache__", "dist", "build"]
    for ignore_item in IGNORE_LIST:
        if ignore_item in path:
            return True
    return False

def map_structure_node(state: AgentState) -> AgentState:
    state["update_status"](state["job_id"], "PROCESSING", "Processing Step 1: Mapping structure...", 45)
    
    file_map = {"files": [], "directories": {}}
    repo_path = state["repo_path"]
    
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if not should_ignore(os.path.join(root, d))]
        
        rel_root = os.path.relpath(root, repo_path)
        if rel_root == '.':
            rel_root = ""
            
        for file in files:
            file_path = os.path.join(root, file)
            if should_ignore(file_path):
                continue
            
            rel_path = os.path.join(rel_root, file) if rel_root else file
            file_map["files"].append(rel_path)
            
            # Group by directories
            dir_name = os.path.dirname(rel_path)
            if dir_name not in file_map["directories"]:
                file_map["directories"][dir_name] = []
            file_map["directories"][dir_name].append(file)
            
    state["file_map"] = file_map
    return state

def analyze_dependencies_node(state: AgentState) -> AgentState:
    state["update_status"](state["job_id"], "PROCESSING", "Processing Step 2: Analyzing dependencies...", 55)
    
    if settings.gemini_api_key == "placeholder":
        state["dependency_analysis"] = "Mocked dependency analysis due to placeholder API key."
        return state

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", api_key=settings.gemini_api_key)
    
    # Send the file map to Gemini to get a high-level overview
    prompt = f"Analyze the following repository structure and infer the main architectural components and their dependencies:\n{json.dumps(state['file_map'], indent=2)}"
    
    try:
        response = llm.invoke([
            SystemMessage(content="You are an expert software architect. Given a repository file structure, analyze its dependencies and architecture."),
            HumanMessage(content=prompt)
        ])
        state["dependency_analysis"] = response.content
    except Exception as e:
        state["dependency_analysis"] = f"Failed to analyze dependencies: {str(e)}"
        
    return state

def generate_docs_node(state: AgentState) -> AgentState:
    state["update_status"](state["job_id"], "PROCESSING", "Processing Step 3: Generating documentation...", 65)
    
    docs_path = state["docs_path"]
    repo_path = state["repo_path"]
    file_map = state["file_map"]
    dependency_analysis = state["dependency_analysis"]
    
    # Save the file map and dependency analysis
    with open(os.path.join(docs_path, "structure_map.json"), "w") as f:
        json.dump(file_map, f, indent=2)
        
    with open(os.path.join(docs_path, "architecture_overview.md"), "w") as f:
        f.write("# Architecture Overview\n\n")
        f.write(dependency_analysis)
        
    if settings.gemini_api_key == "placeholder":
        with open(os.path.join(docs_path, "README.md"), "w") as f:
            f.write("# Generated Documentation\n\nNote: Gemini API key was a placeholder. Full generation skipped.")
        state["generated_docs"] = ["README.md"]
        return state

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", api_key=settings.gemini_api_key)
    
    # Let's write a master README
    main_readme_prompt = f"""
    Based on the architecture overview and the file structure, generate a comprehensive Master README.md for this repository.
    Architecture Overview:
    {dependency_analysis}
    """
    
    try:
        readme_response = llm.invoke([
            SystemMessage(content="You are an expert technical writer. Generate a comprehensive README.md."),
            HumanMessage(content=main_readme_prompt)
        ])
        with open(os.path.join(docs_path, "README.md"), "w") as f:
            f.write(readme_response.content)
        state["generated_docs"] = ["README.md"]
    except Exception as e:
        with open(os.path.join(docs_path, "README.md"), "w") as f:
            f.write(f"Failed to generate README: {str(e)}")
            
    return state

def run_documentation_agent(repo_path: str, docs_path: str, job_id: str, update_status_fn: Any):
    # Construct the graph
    workflow = StateGraph(AgentState)
    
    workflow.add_node("map_structure", map_structure_node)
    workflow.add_node("analyze_dependencies", analyze_dependencies_node)
    workflow.add_node("generate_docs", generate_docs_node)
    
    workflow.set_entry_point("map_structure")
    workflow.add_edge("map_structure", "analyze_dependencies")
    workflow.add_edge("analyze_dependencies", "generate_docs")
    workflow.add_edge("generate_docs", END)
    
    app = workflow.compile()
    
    initial_state = {
        "repo_path": repo_path,
        "docs_path": docs_path,
        "job_id": job_id,
        "update_status": update_status_fn,
        "file_map": {},
        "dependency_analysis": "",
        "generated_docs": []
    }
    
    # Run the graph
    app.invoke(initial_state)
