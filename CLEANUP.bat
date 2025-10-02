@echo off
echo ========================================
echo  Ashley AI - System Cleanup Script
echo ========================================
echo.
echo This will remove:
echo   - Vercel deployment files
echo   - Build artifacts (.next, dist, .turbo)
echo   - Log files
echo   - Temporary files
echo   - Unnecessary deployment configs
echo.
pause
echo.

echo [1/8] Removing Vercel deployment files...
if exist .vercel rd /s /q .vercel
if exist services\ash-admin\.vercel rd /s /q services\ash-admin\.vercel
if exist services\ash-portal\.vercel rd /s /q services\ash-portal\.vercel
echo Done.
echo.

echo [2/8] Removing build artifacts...
if exist services\ash-admin\.next rd /s /q services\ash-admin\.next
if exist services\ash-portal\.next rd /s /q services\ash-portal\.next
if exist packages\database\dist rd /s /q packages\database\dist
echo Done.
echo.

echo [3/8] Removing .turbo cache...
for /d /r . %%d in (.turbo) do @if exist "%%d" rd /s /q "%%d"
echo Done.
echo.

echo [4/8] Removing log files...
del /s /q *.log 2>nul
echo Done.
echo.

echo [5/8] Removing unnecessary deployment configs...
if exist vercel.json del /q vercel.json
if exist .npmrc del /q .npmrc
if exist services\ash-admin\.npmrc del /q services\ash-admin\.npmrc
echo Done.
echo.

echo [6/8] Removing deployment helper files...
if exist deploy-to-vercel.bat del /q deploy-to-vercel.bat
if exist deploy-via-github.bat del /q deploy-via-github.bat
if exist setup-vercel-env.bat del /q setup-vercel-env.bat
if exist push-to-github.txt del /q push-to-github.txt
if exist add-env-manually.txt del /q add-env-manually.txt
if exist vercel-env-setup.bat del /q vercel-env-setup.bat
if exist PUSH_WITH_TOKEN.bat del /q PUSH_WITH_TOKEN.bat
echo Done.
echo.

echo [7/8] Removing duplicate documentation...
if exist VERCEL_DEPLOYMENT.md del /q VERCEL_DEPLOYMENT.md
if exist DEPLOYMENT_CHECKLIST.md del /q DEPLOYMENT_CHECKLIST.md
if exist DEPLOY_INSTRUCTIONS.txt del /q DEPLOY_INSTRUCTIONS.txt
if exist quick-deploy.txt del /q quick-deploy.txt
if exist FRESH_DEPLOY.md del /q FRESH_DEPLOY.md
echo Done.
echo.

echo [8/8] Removing GitHub token file (if exists)...
if exist github-token.txt del /q github-token.txt
echo Done.
echo.

echo ========================================
echo  Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Review changes with: git status
echo   2. Commit cleanup: git add -A && git commit -m "Clean up deployment files"
echo   3. Optional: Remove node_modules and reinstall
echo      - Run: CLEANUP_DEEP.bat
echo.
pause
