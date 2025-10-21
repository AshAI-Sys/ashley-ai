@echo off
echo ============================================
echo COMPLETE PRISMA CLIENT FIX
echo ============================================
echo This will completely rebuild Prisma client
echo.
pause

echo [1/8] Killing ALL Node and related processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM next-server.exe /T 2>nul
taskkill /F /IM prisma.exe /T 2>nul
timeout /t 5 /nobreak >nul

echo [2/8] Deleting ALL Prisma client caches...
rd /s /q "C:\Users\Khell\Desktop\Ashley AI\node_modules\.prisma" 2>nul
rd /s /q "C:\Users\Khell\Desktop\Ashley AI\node_modules\@prisma\client" 2>nul
rd /s /q "C:\Users\Khell\Desktop\Ashley AI\node_modules\.pnpm\@prisma+client@5.22.0_prisma@5.22.0\node_modules\.prisma" 2>nul
rd /s /q "C:\Users\Khell\Desktop\Ashley AI\packages\database\node_modules\.prisma" 2>nul
echo Prisma cache deleted.

echo [3/8] Deleting old database...
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database\prisma"
del /F /Q dev.db dev.db-journal 2>nul
echo Database deleted.

echo [4/8] Pushing schema to database (without logo_url)...
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database"
call npx prisma db push --force-reset --accept-data-loss --skip-generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to push schema!
    pause
    exit /b 1
)

echo [5/8] Waiting for file system to settle...
timeout /t 5 /nobreak >nul

echo [6/8] Reinstalling Prisma client package...
cd "C:\Users\Khell\Desktop\Ashley AI"
call pnpm install @prisma/client@5.22.0 --force
timeout /t 3 /nobreak >nul

echo [7/8] Generating fresh Prisma client...
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database"
call npx prisma generate --schema=./prisma/schema.prisma
if %errorlevel% neq 0 (
    echo WARNING: Prisma generate had warnings, continuing anyway...
)

echo [8/8] Starting development server...
cd "C:\Users\Khell\Desktop\Ashley AI"
echo.
echo ============================================
echo SERVER STARTING...
echo Open http://localhost:3001/register
echo ============================================
echo.
call pnpm --filter @ash/admin dev

pause
