import subprocess
import os
import sys

def run_process(cmd, cwd=None, shell=True):
    """Start a subprocess and stream its output in real time."""
    return subprocess.Popen(
        cmd,
        cwd=cwd,
        shell=shell,
        stdout=sys.stdout,
        stderr=sys.stderr
    )

def main():
    # Paths to your frontend and backend
    frontend_dir = "open-wrecks"
    backend_dir = "open-wrecks-api"

    # Start frontend (React)
    frontend_cmd = "npm install && npm start"
    frontend_proc = run_process(frontend_cmd, cwd=frontend_dir)

    # Start backend (Python API)
    backend_cmd = (
        "python3 -m venv venv && "
        "source venv/bin/activate && "
        "pip3 install -r requirements.txt && "
        "python3 main.py"
    )
    backend_proc = run_process(backend_cmd, cwd=backend_dir)

    try:
        frontend_proc.wait()
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping both processes...")
        frontend_proc.terminate()
        backend_proc.terminate()

if __name__ == "__main__":
    main()
