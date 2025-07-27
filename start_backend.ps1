# Script to start the Mercenary_dev backend server
# This script will activate the virtual environment and launch uvicorn.

Write-Host "Starting Mercenary_dev backend server..."

# Navigate to the backend directory
cd backend

# Activate the virtual environment
. .\venv\Scripts\Activate.ps1

# Start the Uvicorn server
Write-Host "Launching Uvicorn..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
