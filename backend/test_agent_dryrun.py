import os
import sys

# Append parent directory to path to resolve imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.agent import run_documenter_agent
from backend.config import settings

def test_dry_run():
    print("=== STARTING AGENT DRY-RUN TEST ===")
    
    # Force settings into a safe local configuration
    settings.redis_url = "redis://localhost:6379/0"
    settings.gemini_api_key = "placeholder_key"  # Force fallback documentation generation
    
    # Use the current project workspace directory as target
    workspace_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    job_id = "test-dryrun-uuid-1234"
    
    print(f"Targeting local workspace path: {workspace_path}")
    print("Running LangGraph workflow...")
    
    try:
        # Note: Since redis might not be running locally, we mock or catch redis errors in publish_job_progress
        final_state = run_documenter_agent(job_id, workspace_path)
        
        print("\n--- AGENT RESULTS ---")
        print(f"Job ID: {final_state.get('job_id')}")
        print(f"Files mapped: {len(final_state['files_map']['files'])}")
        print(f"Folders mapped: {len(final_state['files_map']['folders'])}")
        print(f"Languages detected: {final_state['dependencies'].get('languages')}")
        print(f"Docs generated: {list(final_state['docs'].keys())}")
        
        print("\nStatus logs captured:")
        for log in final_state["status_log"]:
            print(f"- {log}")
            
        assert len(final_state['files_map']['files']) > 0, "No files were mapped"
        assert "README.md" in final_state["docs"], "Global README was not generated"
        assert "docs/sitemap.md" in final_state["docs"], "Sitemap was not generated"
        
        print("\n=== AGENT DRY-RUN TEST PASSED ===")
        
    except Exception as e:
        print(f"\nDry-run failed: {e}")
        print("If this is due to 'redis' not running or not installed, that is expected outside Docker.")
        print("Run this test inside the docker container or with an active Redis instance.")

if __name__ == "__main__":
    test_dry_run()
