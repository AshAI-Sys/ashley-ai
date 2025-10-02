@echo off
echo ========================================
echo ASHLEY AI - SAFE AUTOMATIC CLEANUP
echo ========================================
echo.

echo Deleting deployment documentation files...
del /F /Q "DEPLOY_VIA_DASHBOARD.md" 2>nul
del /F /Q "DEPLOYMENT_INSTRUCTIONS.md" 2>nul
del /F /Q "DEPLOYMENT_SUMMARY.md" 2>nul
del /F /Q "DISABLE_VERCEL_PROTECTION.md" 2>nul
del /F /Q "FINAL_DEPLOYMENT_STEPS.md" 2>nul
del /F /Q "FIX_DEPLOYMENT_ERROR.md" 2>nul

echo Deleting old scripts...
del /F /Q "cleanup-duplicates.ps1" 2>nul
del /F /Q "deploy-now.ps1" 2>nul
del /F /Q "kill-and-restart.ps1" 2>nul
del /F /Q "test-integrations.js" 2>nul
del /F /Q "test-phase2.js" 2>nul
del /F /Q "vercel-env-setup.bat" 2>nul

echo Deleting duplicate env files...
del /F /Q ".env.development" 2>nul
del /F /Q ".env.production.template" 2>nul

echo Deleting old npm lockfile...
del /F /Q "package-lock.json" 2>nul

echo Deleting nul file...
del /F /Q "nul" 2>nul

echo.
echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Verifying critical files...
if exist package.json (echo [OK] package.json) else (echo [ERROR] package.json missing!)
if exist pnpm-lock.yaml (echo [OK] pnpm-lock.yaml) else (echo [ERROR] pnpm-lock.yaml missing!)
if exist CLAUDE.md (echo [OK] CLAUDE.md) else (echo [ERROR] CLAUDE.md missing!)
if exist "services\ash-admin\package.json" (echo [OK] ash-admin) else (echo [ERROR] ash-admin missing!)
if exist "packages\database\prisma\schema.prisma" (echo [OK] database schema) else (echo [ERROR] schema missing!)

echo.
echo Done!
pause
