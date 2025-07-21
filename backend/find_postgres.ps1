# Script to find PostgreSQL installation directory

$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*\bin",
    "C:\Program Files (x86)\PostgreSQL\*\bin",
    "$env:PROGRAMFILES\PostgreSQL\*\bin",
    "${env:PROGRAMFILES(X86)}\PostgreSQL\*\bin"
)

Write-Host "Searching for PostgreSQL installation..." -ForegroundColor Cyan

$found = $false
foreach ($path in $possiblePaths) {
    $matchingDirs = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer }
    
    foreach ($dir in $matchingDirs) {
        $psqlPath = Join-Path $dir.FullName "psql.exe"
        if (Test-Path $psqlPath) {
            Write-Host "Found PostgreSQL at: $($dir.FullName)" -ForegroundColor Green
            Write-Host "psql.exe found at: $psqlPath" -ForegroundColor Green
            
            # Check if it's in PATH
            $inPath = $env:PATH -split ';' | Where-Object { $_ -eq $dir.FullName }
            if ($inPath) {
                Write-Host "This directory is already in your PATH." -ForegroundColor Green
            } else {
                Write-Host "This directory is NOT in your PATH." -ForegroundColor Yellow
                Write-Host "To add it temporarily to your current session, run:"
                Write-Host "`$env:PATH += `";$($dir.FullName)"`" -ForegroundColor Cyan
                
                Write-Host "`nTo add it permanently, run as Administrator:"
                Write-Host "[Environment]::SetEnvironmentVariable('PATH', `$env:PATH + ';$($dir.FullName)', 'Machine')" -ForegroundColor Cyan
            }
            
            $found = $true
        }
    }
}

if (-not $found) {
    Write-Host "Could not find PostgreSQL installation in standard locations." -ForegroundColor Red
    Write-Host "Please ensure PostgreSQL is installed and try again." -ForegroundColor Red
}
