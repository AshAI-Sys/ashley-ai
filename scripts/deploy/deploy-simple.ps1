# Ashley AI - Simple Railway Deployment
# Fixed version that links project properly

Write-Host "======================================"
Write-Host "  Ashley AI - Railway Deployment"
Write-Host "======================================"
Write-Host ""

# Check Railway CLI
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
$version = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Railway CLI not installed!" -ForegroundColor Red
    Write-Host "Install: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "SUCCESS: Railway CLI installed" -ForegroundColor Green
Write-Host ""

# Check login
Write-Host "Checking login..." -ForegroundColor Yellow
$whoami = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not logged in" -ForegroundColor Red
    Write-Host "Please run: railway login" -ForegroundColor Yellow
    exit 1
}
Write-Host "SUCCESS: Logged in as $whoami" -ForegroundColor Green
Write-Host ""

# Link to project (this is the missing step!)
Write-Host "Linking to Railway project..." -ForegroundColor Cyan
railway link
Write-Host ""

# Add database if needed
Write-Host "Checking for database..." -ForegroundColor Yellow
$confirm = Read-Host "Do you need to add PostgreSQL database? (y/n)"
if ($confirm -eq "y") {
    railway add --database postgresql
    Write-Host "SUCCESS: Database added!" -ForegroundColor Green
}
Write-Host ""

# Set environment variables
Write-Host "Do you need to set environment variables?" -ForegroundColor Yellow
$setVars = Read-Host "Set variables now? (y/n)"
if ($setVars -eq "y") {
    Write-Host "Generating secrets..." -ForegroundColor Cyan

    $JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $SESSION_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $CSRF_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET=$JWT_SECRET
    railway variables set JWT_ACCESS_EXPIRES_IN=15m
    railway variables set JWT_REFRESH_EXPIRES_IN=7d
    railway variables set SESSION_SECRET=$SESSION_SECRET
    railway variables set CSRF_SECRET=$CSRF_SECRET
    railway variables set PORT=3001

    Write-Host "SUCCESS: Variables set!" -ForegroundColor Green
}
Write-Host ""

# Deploy
Write-Host "======================================"
Write-Host "  DEPLOYING TO RAILWAY..."
Write-Host "======================================"
Write-Host ""

railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================"
    Write-Host "  DEPLOYMENT SUCCESSFUL!"
    Write-Host "======================================"
    Write-Host ""
    Write-Host "Your app is deploying!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View deployment: railway open" -ForegroundColor Cyan
    Write-Host "Check logs: railway logs" -ForegroundColor Cyan
    Write-Host "Get URL: railway domain" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "======================================"
    Write-Host "  DEPLOYMENT FAILED"
    Write-Host "======================================"
    Write-Host ""
    Write-Host "Check logs: railway logs" -ForegroundColor Yellow
}
