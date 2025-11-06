@echo off
echo ========================================
echo ASHLEY AI - QUICK DEPLOYMENT SCRIPT
echo ========================================
echo.

echo [1/3] Checking git status...
git status --short
echo.

echo [2/3] Pulling latest changes from GitHub...
git pull origin master
echo.

echo [3/3] Deploying to Vercel Production...
cd services\ash-admin
vercel --prod --yes

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Check your Vercel dashboard at:
echo https://vercel.com/ash-ais-projects/ash-ai
echo.
pause
