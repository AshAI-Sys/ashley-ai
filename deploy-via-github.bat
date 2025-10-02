@echo off
echo ========================================
echo  Ashley AI - GitHub Deployment
echo ========================================
echo.

echo [STEP 1] Committing changes...
git add .
git commit -m "Configure for Vercel deployment with PostgreSQL"
echo.

echo [STEP 2] Pushing to GitHub...
git push origin master
echo.

echo ========================================
echo  Pushed to GitHub!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Go to: https://vercel.com/new
echo 2. Click "Import Git Repository"
echo 3. Select "AshAI-Sys/ashley-ai"
echo 4. Configure:
echo    - Root Directory: services/ash-admin
echo    - Framework: Next.js (auto-detected)
echo    - Build Command: (leave default from vercel.json)
echo 5. Add Environment Variables (from Vercel dashboard):
echo    - DATABASE_URL
echo    - NEXTAUTH_SECRET
echo    - JWT_SECRET
echo    - ENCRYPTION_KEY
echo    - NEXTAUTH_URL
echo    - APP_URL
echo 6. Click Deploy
echo.
echo Opening Vercel import page...
start https://vercel.com/new
echo.
pause
