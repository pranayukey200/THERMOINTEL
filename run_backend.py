"""
THERMOINTEL Backend Service Launcher
AI-Powered Industrial Thermal Intelligence & Monitoring Platform
"""
import sys
import os
import uvicorn

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.main import app

def main():
    print("=" * 65)
    print("  THERMOINTEL - Industrial Thermal Intelligence Platform (SIH 2026)")
    print("  FastAPI REST Backend Service Starting...")
    print("  API Docs: http://localhost:8000/docs")
    print("  Health Check: http://localhost:8000/api/health")
    print("=" * 65)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
