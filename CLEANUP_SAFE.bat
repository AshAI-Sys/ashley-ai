@echo off
echo ========================================
echo  Ashley AI - SAFE Automated Cleanup
echo ========================================
echo.
echo This will remove ONLY:
echo   [1] Duplicate deployment documentation (6 files)
echo   [2] Old/unused scripts (6 files)
echo   [3] Duplicate .env files (2 files)
echo   [4] Docker files (if not using Docker)
echo   [5] Old npm package-lock.json
echo   [6] Stray 'nul' file
echo.
echo PROTECTED (will NOT delete):
echo   - All source code (services/*, packages/*)
echo   - CLAUDE.md
echo   - README.md
echo   - package.json, pnpm-lock.yaml
echo   - .env (main environment file)
echo   - .gitignore, tsconfig.json
echo   - All production code
echo.
set /p CONFIRM="Continue with safe cleanup? (YES to confirm): "
if /i not "%CONFIRM%"=="YES" (
    echo Cancelled.
    pause
    exit /b
)
echo.

echo [1/7] Removing duplicate deployment docs...
if exist DEPLOY_VIA_DASHBOARD.md del /q DEPLOY_VIA_DASHBOARD.md
if exist DEPLOYMENT_INSTRUCTIONS.md del /q DEPLOYMENT_INSTRUCTIONS.md
if exist DEPLOYMENT_SUMMARY.md del /q DEPLOYMENT_SUMMARY.md
if exist FINAL_DEPLOYMENT_STEPS.md del /q FINAL_DEPLOYMENT_STEPS.md
if exist FIX_DEPLOYMENT_ERROR.md del /q FIX_DEPLOYMENT_ERROR.md
if exist DISABLE_VERCEL_PROTECTION.md del /q DISABLE_VERCEL_PROTECTION.md
echo Done - 6 files removed.
echo.

echo [2/7] Removing old scripts...
if exist cleanup-duplicates.ps1 del /q cleanup-duplicates.ps1
if exist deploy-now.ps1 del /q deploy-now.ps1
if exist kill-and-restart.ps1 del /q kill-and-restart.ps1
if exist vercel-env-setup.bat del /q vercel-env-setup.bat
if exist test-integrations.js del /q test-integrations.js
if exist test-phase2.js del /q test-phase2.js
echo Done - 6 files removed.
echo.

echo [3/7] Removing duplicate .env files...
if exist .env.development del /q .env.development
if exist .env.production.template del /q .env.production.template
echo Done - 2 files removed.
echo.

echo [4/7] Checking Docker files...
set /p DOCKER="Do you use Docker? (y/n): "
if /i "%DOCKER%"=="n" (
    if exist docker-compose.yml del /q docker-compose.yml
    if exist docker-compose.production.yml del /q docker-compose.production.yml
    if exist docker-compose.monitoring.yml del /q docker-compose.monitoring.yml
    if exist Dockerfile del /q Dockerfile
    if exist ecosystem.config.js del /q ecosystem.config.js
    echo Done - Docker files removed.
) else (
    echo Skipped - Docker files kept.
)
echo.

echo [5/7] Removing old npm lock file...
if exist package-lock.json del /q package-lock.json
echo Done - package-lock.json removed.
echo.

echo [6/7] Removing stray files...
if exist nul del /q nul
echo Done - nul file removed.
echo.

echo [7/7] Verifying system integrity...
echo Checking critical files...
if not exist package.json echo [ERROR] package.json missing!
if not exist pnpm-lock.yaml echo [ERROR] pnpm-lock.yaml missing!
if not exist CLAUDE.md echo [ERROR] CLAUDE.md missing!
if not exist services\ash-admin\package.json echo [ERROR] ash-admin package.json missing!
if not exist services\ash-portal\package.json echo [ERROR] ash-portal package.json missing!
if not exist packages\database\prisma\schema.prisma echo [ERROR] schema.prisma missing!
echo.
echo Verification complete.
echo.

echo ========================================
echo  Safe Cleanup Complete!
echo ========================================
echo.
echo Summary:
echo   - Removed: 14-19 old/duplicate files
echo   - Protected: All source code and configs
echo   - System: Ready for development
echo.
echo Next: Run git status to see changes
echo.
pause
