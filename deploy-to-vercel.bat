@echo off
echo ========================================
echo  Ashley AI - Vercel Deployment Script
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vercel CLI not found!
    echo.
    echo Installing Vercel CLI globally...
    call npm install -g vercel
    echo.
)

echo [STEP 1] Logging into Vercel...
call vercel login
echo.

echo [STEP 2] Linking project...
echo When prompted:
echo   - Set up and deploy? Y
echo   - Which scope? (select your account)
echo   - Link to existing project? N (unless you already created one)
echo   - Project name? ashley-ai
echo   - In which directory? services/ash-admin
echo.
call vercel link
echo.

echo [STEP 3] Deploying to production...
call vercel --prod --cwd services/ash-admin
echo.

echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check the deployment URL provided above
echo 2. Update NEXTAUTH_URL and APP_URL env variables with the actual URL
echo 3. Test your application at the provided URL
echo.
pause
