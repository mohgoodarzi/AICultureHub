@echo off
REM Rebuilds the Angular production app and serves it from the backend (port 5060)
REM The site is then available at: http://localhost:5060
echo Building frontend (production)...
cd /d "D:\Ai Site\Frontend\AngularApp"
call npx ng build --configuration production
if errorlevel 1 (
  echo Frontend build FAILED - fix errors first.
  pause
  exit /b 1
)
echo Copying to backend...
if exist "D:\Ai Site\Backend\API\wwwroot\app" rmdir /s /q "D:\Ai Site\Backend\API\wwwroot\app"
xcopy "D:\Ai Site\Frontend\AngularApp\dist\angular-app\browser" "D:\Ai Site\Backend\API\wwwroot\app" /e /i /q
echo Done! Open the site at: http://localhost:5060
pause