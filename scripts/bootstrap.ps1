# Installs dependencies for all projects in the monorepo.

Write-Host "Bootstrapping Mercenary_Dev monorepo..."

# Backend (Python)
Write-Host "Installing backend dependencies..."
Push-Location ..\backend
# Assuming python/pip is in PATH
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install backend dependencies."
    exit 1
}
Pop-Location

# Web-app (Node.js)
Write-Host "Installing web-app dependencies..."
Push-Location ..\web-app
# Assuming node/npm is in PATH
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install web-app dependencies."
    exit 1
}
Pop-Location

Write-Host "Bootstrap complete!"
