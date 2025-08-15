# Builds/packages all applicable projects in the monorepo for release.

Write-Host "Creating release artifacts..."

# Backend (Python)
Write-Host "Building backend Docker image..."
Push-Location ..\backend
# Assumes 'docker' is available. The Makefile handles the build.
make docker-build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build backend Docker image."
    exit 1
}
Pop-Location

# Web-app (Node.js)
Write-Host "Building web-app..."
Push-Location ..\web-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build web-app."
    exit 1
}
Pop-Location

Write-Host "Release artifacts created successfully!"
