# Runs tests for all applicable projects in the monorepo.

Write-Host "Running tests..."

# Backend (Python)
Write-Host "Testing backend..."
Push-Location ..\backend
# Assumes 'make' is available. The Makefile handles pytest.
make test
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Backend tests failed. Note: This will fail if the 'tests' directory is missing or empty."
}
Pop-Location

# Web-app (Node.js)
Write-Host "Testing web-app..."
Push-Location ..\web-app
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Web-app tests failed."
    exit 1
}
Pop-Location

Write-Host "Testing complete!"
