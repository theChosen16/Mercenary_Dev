# Reset PostgreSQL password and update configuration
# This script requires psql to be in the system PATH

# Configuration
$PG_USER = "postgres"
$NEW_PASSWORD = "mercenary123"  # Simple ASCII password
$DB_NAME = "mercenary_db"

# Find psql executable
$psql_path = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql_path) {
    Write-Host "Error: psql command not found. Please ensure PostgreSQL bin directory is in your PATH." -ForegroundColor Red
    Write-Host "Typical locations:"
    Write-Host "- C:\Program Files\PostgreSQL\<version>\bin"
    Write-Host "- C:\Program Files (x86)\PostgreSQL\<version>\bin"
    exit 1
}

Write-Host "Resetting PostgreSQL password for user '$PG_USER'..." -ForegroundColor Cyan

# Function to update config files
function Update-ConfigFiles {
    param (
        [string]$user,
        [string]$password,
        [string]$dbName
    )
    
    $configFiles = @(
        "app\core\config.py",
        "alembic.ini"
    )
    
    foreach ($file in $configFiles) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            
            # Update connection strings
            $newContent = $content -replace "postgresql://[^:]+:[^@]+", "postgresql://${user}:${password}"
            
            # Update password in config.py
            $newContent = $newContent -replace '(?m)^POSTGRES_PASSWORD: str = ".*"', "POSTGRES_PASSWORD: str = `"${password}`""
            
            Set-Content -Path $file -Value $newContent -Force
            Write-Host "Updated database password in $file" -ForegroundColor Green
        }
    }
}

# Try to connect and reset password
try {
    # First try to connect without password (might work for local connections)
    $env:PGPASSWORD = $null
    $result = & psql -U $PG_USER -d postgres -c "ALTER USER $PG_USER WITH PASSWORD '$NEW_PASSWORD';" 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        # If that fails, prompt for current password
        $current_password = Read-Host -Prompt "Enter current password for user '$PG_USER' (input will be hidden)" -AsSecureString
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($current_password)
        $current_password_plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        
        $env:PGPASSWORD = $current_password_plain
        $result = & psql -U $PG_USER -d postgres -c "ALTER USER $PG_USER WITH PASSWORD '$NEW_PASSWORD';" 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully updated password for user '$PG_USER'" -ForegroundColor Green
        
        # Update configuration files
        Update-ConfigFiles -user $PG_USER -password $NEW_PASSWORD -dbName $DB_NAME
        
        Write-Host "`nDatabase configuration updated successfully!" -ForegroundColor Green
        Write-Host "New database connection string: postgresql://${PG_USER}:${NEW_PASSWORD}@localhost:5432/${DB_NAME}" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to update password. Error: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
}
