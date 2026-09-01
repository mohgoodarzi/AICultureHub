@echo off
echo ============================================
echo   AI Culture Hub - Complete Setup
echo ============================================
echo.
echo PREREQUISITES:
echo - SQL Server running on localhost
echo - Database 'AICultureHub' created and seeded
echo.
echo TO RUN BACKEND:
echo   cd "D:\Ai Site\Backend\API"
echo   dotnet run --urls "http://localhost:5060"
echo.
echo TO RUN FRONTEND:
echo   cd "D:\Ai Site\Frontend\AngularApp"
echo   npx ng serve
echo.
echo ACCESS POINTS:
echo   Frontend: http://localhost:4200
echo   Backend:  http://localhost:5060/api
echo   Swagger:  http://localhost:5060/swagger
echo.
echo LOGIN CREDENTIALS:
echo   Admin:  admin / Admin123!
echo   User:   jdoe  / Admin123!
echo.
pause
