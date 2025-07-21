"""
Main entry point for the FastAPI application.
This file exists to ensure proper Python module resolution.
"""
import sys
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Import the FastAPI app from the app module
from app.main import app

# This allows running with: python -m uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
