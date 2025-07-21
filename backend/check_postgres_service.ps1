# Script to check PostgreSQL service status and test connection

# Check if PostgreSQL service is running
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "PostgreSQL Service Status:" -ForegroundColor Cyan
    $service | Format-Table Name, Status, DisplayName -AutoSize
    
    # Try to connect using full path to psql
    $psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    
    if (Test-Path $psqlPath) {
        Write-Host "\nTesting connection with full path to psql..." -ForegroundColor Cyan
        
        # Try with simple password (ASCII only)
        $env:PGPASSWORD = "mercenary123"
        & $psqlPath -U postgres -d postgres -c "SELECT version();"
        
        # If that fails, try with the previous password
        if ($LASTEXITCODE -ne 0) {
            Write-Host "\nTrying with previous password..." -ForegroundColor Yellow
            $env:PGPASSWORD = "0909"
            & $psqlPath -U postgres -d postgres -c "SELECT version();"
        }
    } else {
        Write-Host "\npsql.exe not found at: $psqlPath" -ForegroundColor Red
        Write-Host "Please verify your PostgreSQL installation." -ForegroundColor Red
    }
} else {
    Write-Host "PostgreSQL service not found. Please make sure PostgreSQL is installed." -ForegroundColor Red
}

# Show PostgreSQL-related environment variables
Write-Host "\nPostgreSQL Environment Variables:" -ForegroundColor Cyan
Get-ChildItem env: | Where-Object { $_.Name -like "*POSTGRES*" -or $_.Name -like "*PG*" } | Format-Table -AutoSize
