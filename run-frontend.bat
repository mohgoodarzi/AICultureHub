@echo off
REM Builds the frontend, installs it into the backend, and STARTS the backend if needed.
REM Site address: http://localhost:8080
echo ============================================
echo   AI Culture Hub - Build and Start
echo ============================================
echo.

echo [1/3] Building frontend (production, ~10 seconds)...
cd /d "D:\Ai Site\Frontend\AngularApp"
call npx ng build --configuration production
if errorlevel 1 (
    echo.
    echo Build FAILED - fix the errors shown above.
    pause
    exit /b 1
)

echo.
echo [2/3] Installing into backend...
if exist "D:\Ai Site\Backend\API\wwwroot\app" rmdir /s /q "D:\Ai Site\Backend\API\wwwroot\app"
xcopy "D:\Ai Site\Frontend\AngularApp\dist\angular-app\browser" "D:\Ai Site\Backend\API\wwwroot\app" /e /i /q >nul

echo.
echo [3/3] Starting backend if not running...
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (-not (Get-Process -Name 'AICultureHub.API' -ErrorAction SilentlyContinue)) { Start-Process -FilePath 'dotnet' -ArgumentList 'run','--no-build' -WorkingDirectory 'D:\Ai Site\Backend\API' -WindowStyle Hidden; Start-Sleep -Seconds 12 }"

echo.
echo ============================================
echo   DONE!  Site:  http://localhost:8080
echo   (if the page looks broken press Ctrl+Shift+R)
echo ============================================
start http://localhost:8080
pause