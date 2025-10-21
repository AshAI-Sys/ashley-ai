@echo off
echo ============================================
echo EMERGENCY DATABASE INITIALIZATION
echo ============================================
echo This will completely reset your database
echo and create a fresh admin account.
echo.
pause

echo [1/6] Stopping all processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 5 /nobreak >nul

echo [2/6] Deleting old database...
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database\prisma"
del dev.db dev.db-journal 2>nul

echo [3/6] Pushing new schema to database...
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database"
call npx prisma db push --force-reset --accept-data-loss --skip-generate

echo [4/6] Cleaning Prisma cache...
timeout /t 3 /nobreak >nul
rd /s /q "C:\Users\Khell\Desktop\Ashley AI\node_modules\.prisma" 2>nul

echo [5/6] Generating Prisma client...
call npx prisma generate

echo [6/6] Starting server...
cd "C:\Users\Khell\Desktop\Ashley AI"
pnpm --filter @ash/admin dev

pause
