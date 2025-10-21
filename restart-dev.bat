@echo off
echo ====================================
echo RESTARTING ASHLEY AI DEV SERVER
echo ====================================
echo.

echo [1/3] Stopping existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo     Done!
echo.

echo [2/3] Clearing Next.js cache...
cd "services\ash-admin"
if exist ".next" rd /s /q ".next" >nul 2>&1
echo     Done!
echo.

echo [3/3] Starting development server...
echo     Server will start on http://localhost:3001
echo     Press CTRL+C to stop
echo.
pnpm dev

pause
