# Stops any running AICultureHub.API process that locks build DLLs,
# rebuilds, and restarts the API on http://localhost:5060
# Usage: .\restart-api.ps1

$apiName = "AICultureHub.API"

Write-Host "Stopping any running $apiName ..." -ForegroundColor Yellow
Get-Process -Name $apiName -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Building..." -ForegroundColor Yellow
dotnet build "D:\Ai Site\Backend\AICultureHub.sln" --nologo -v q
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build FAILED - fix compile errors first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting API on http://localhost:5060 ..." -ForegroundColor Yellow
$log = "$env:TEMP\api-run.log"
Start-Process -FilePath "dotnet" -ArgumentList "run","--no-build" -WorkingDirectory "D:\Ai Site\Backend\API" -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError "$env:TEMP\api-run.err.log"

Start-Sleep -Seconds 12
try {
    Invoke-WebRequest -Uri "http://localhost:5060/swagger/index.html" -UseBasicParsing -TimeoutSec 5 | Out-Null
    Write-Host "API is UP: http://localhost:5060" -ForegroundColor Green
} catch {
    Write-Host "API did not come up - check $log" -ForegroundColor Red
}
