@echo off
echo ========================================
echo  Push to GitHub with Token
echo ========================================
echo.
echo STEP 1: Create Personal Access Token
echo   Go to: https://github.com/settings/tokens/new
echo   - Note: Ashley AI Deploy
echo   - Expiration: 90 days
echo   - Scopes: Check 'repo'
echo   - Click Generate token
echo   - COPY THE TOKEN!
echo.
pause
echo.
set /p TOKEN="Paste your token here (ghp_...): "
echo.
echo Setting up remote with token...
git remote remove origin
git remote add origin https://%TOKEN%@github.com/AshAI-Sys/ashley-ai.git
echo.
echo Pushing to GitHub...
git push -u origin master
echo.
echo ========================================
echo  Push Complete!
echo ========================================
pause
