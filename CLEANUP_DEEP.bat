@echo off
echo ========================================
echo  Ashley AI - DEEP Cleanup (node_modules)
echo ========================================
echo.
echo WARNING: This will DELETE all node_modules
echo and reinstall from scratch!
echo.
echo This takes 5-10 minutes but gives you a clean slate.
echo.
set /p CONFIRM="Are you sure? Type YES to continue: "
if /i not "%CONFIRM%"=="YES" (
    echo Cancelled.
    pause
    exit /b
)
echo.

echo [1/3] Removing all node_modules...
if exist node_modules rd /s /q node_modules
if exist services\ash-admin\node_modules rd /s /q services\ash-admin\node_modules
if exist services\ash-portal\node_modules rd /s /q services\ash-portal\node_modules
for /d %%d in (packages\*) do if exist "%%d\node_modules" rd /s /q "%%d\node_modules"
echo Done.
echo.

echo [2/3] Removing pnpm store cache...
pnpm store prune 2>nul
echo Done.
echo.

echo [3/3] Reinstalling dependencies...
pnpm install --no-frozen-lockfile
echo Done.
echo.

echo ========================================
echo  Deep Cleanup Complete!
echo ========================================
echo.
echo System is now clean and ready.
echo.
pause
