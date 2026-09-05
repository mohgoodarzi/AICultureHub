@echo off
REM Stops any locked AICultureHub.API process, rebuilds, and restarts the API
REM on http://localhost:5060
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\Ai Site\restart-api.ps1"
pause
