"""
THERMOINTEL All-in-One Platform Launcher
Starts both FastAPI backend and Vite frontend concurrently.
"""
import os
import sys
import subprocess
import time
import webbrowser

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    print("=" * 70)
    print("  🚀 THERMOINTEL PLATFORM LAUNCHER")
    print("  AI-Powered Industrial Thermal Intelligence & Monitoring Platform")
    print("  SIH 2026 Problem Statement 26162")
    print("=" * 70)

    # 1. Verify Database
    db_path = os.path.join(root_dir, "data", "thermintel.db")
    if not os.path.exists(db_path):
        print("[*] Database not found. Initializing SQLite from master CSV...")
        subprocess.run([sys.executable, os.path.join(root_dir, "scripts", "init_db.py")], check=True)
    else:
        print("[+] SQLite database verified (data/thermintel.db)")

    # 2. Launch Backend
    print("[*] Launching FastAPI REST backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=os.path.join(root_dir, "backend")
    )

    time.sleep(2)

    # 3. Launch Frontend
    print("[*] Launching Command Centre frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )

    print("\n" + "=" * 70)
    print("  ✅ THERMOINTEL PLATFORM READY!")
    print("  • Command Centre UI : http://localhost:5173")
    print("  • REST API Docs     : http://localhost:8000/docs")
    print("  • Health Check      : http://localhost:8000/api/health")
    print("=" * 70)
    print("  Press Ctrl+C to terminate both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n[*] Shutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[+] Servers terminated cleanly.")

if __name__ == "__main__":
    main()
