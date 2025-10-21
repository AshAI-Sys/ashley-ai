@echo off
echo ========================================
echo FIXING ASHLEY AI REGISTRATION ISSUE
echo ========================================
echo.

echo [1/5] Killing all Node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 3 /nobreak >nul

echo [2/5] Deleting Prisma cache...
rd /s /q "C:\Users\Khell\Desktop\Ashley AI\node_modules\.prisma" 2>nul
rd /s /q "C:\Users\Khell\Desktop\Ashley AI\packages\database\node_modules\.prisma" 2>nul
timeout /t 2 /nobreak >nul

echo [3/5] Regenerating Prisma client...
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database"
call npx prisma generate
if %errorlevel% neq 0 (
    echo WARNING: Prisma generate had warnings, but continuing...
)

echo [4/5] Starting development server...
cd "C:\Users\Khell\Desktop\Ashley AI"
start cmd /k "pnpm --filter @ash/admin dev"

echo [5/5] Waiting for server to start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo DONE! Server should be running now.
echo Open http://localhost:3001/register
echo ========================================
pause
