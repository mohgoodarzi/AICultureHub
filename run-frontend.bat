@echo off
REM Builds the frontend, verifies the output, then deploys it into the backend.
REM Site address: http://localhost:8080
echo ============================================
echo   AI Culture Hub - Build and Deploy
echo ============================================
echo.

echo [1/4] Building frontend (production, ~10 seconds)...
cd /d "D:\Ai Site\Frontend\AngularApp"
call npx ng build --configuration production
if errorlevel 1 (
    echo.
    echo Build FAILED - nothing was changed. The currently deployed site is untouched.
    pause
    exit /b 1
)

echo.
echo [2/4] Verifying build output...
if not exist "D:\Ai Site\Frontend\AngularApp\dist\angular-app\browser\index.html" (
    echo Build output INVALID (no index.html) - deployment aborted, site untouched.
    pause
    exit /b 1
)

echo.
echo [3/4] Deploying into backend...
if exist "D:\Ai Site\Backend\API\wwwroot\app" rmdir /s /q "D:\Ai Site\Backend\API\wwwroot\app"
xcopy "D:\Ai Site\Frontend\AngularApp\dist\angular-app\browser" "D:\Ai Site\Backend\API\wwwroot\app" /e /i /q >nul

echo.
echo [4/4] Checking backend...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8080/' -UseBasicParsing -TimeoutSec 3; Write-Host 'Backend already running - new version deployed.' } catch { Write-Host 'Starting backend...'; Start-Process -FilePath 'dotnet' -ArgumentList 'run','--no-build' -WorkingDirectory 'D:\Ai Site\Backend\API' -WindowStyle Hidden; Start-Sleep -Seconds 14; try { Invoke-WebRequest -Uri 'http://localhost:8080/' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host 'Backend started.' } catch { Write-Host 'Backend did not start - run run-backend.bat' } }"

echo.
echo ============================================
echo   DONE!  Site:  http://localhost:8080
echo   (if the page looks broken press Ctrl+Shift+R)
echo ============================================
start http://localhost:8080
pause