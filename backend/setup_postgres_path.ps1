# Script to add PostgreSQL to PATH and run the password reset

$postgresBinPath = "C:\Program Files\PostgreSQL\17\bin"

# Add to PATH for current session
$env:PATH += ";$postgresBinPath"

# Verify psql is accessible
try {
    $psqlVersion = & psql --version 2>&1
    Write-Host "Successfully found psql: $psqlVersion" -ForegroundColor Green
    
    # Run the password reset script
    Write-Host "`nRunning password reset script..." -ForegroundColor Cyan
    & "$PSScriptRoot\reset_db_password.ps1"
} catch {
    Write-Host "Failed to find psql command. Please check the PostgreSQL installation." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
