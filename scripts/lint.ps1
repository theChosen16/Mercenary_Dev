# Runs linters for all applicable projects in the monorepo.

Write-Host "Running linters..."

# Backend (Python)
Write-Host "Linting backend..."
Push-Location ..\backend
# Assumes 'make' is available. The Makefile handles flake8.
make lint
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Backend linting failed. Note: This may fail if the 'tests' directory doesn't exist."
}
Pop-Location

# Web-app (Node.js)
Write-Host "Linting web-app..."
Push-Location ..\web-app
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Error "Web-app linting failed."
    exit 1
}
Pop-Location

Write-Host "Linting complete!"
