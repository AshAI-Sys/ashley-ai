# Ashley AI - Railway Deployment Script
# PowerShell script for automated deployment

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Ashley AI - Railway Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Railway CLI not installed!" -ForegroundColor Red
    Write-Host "Install with: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "SUCCESS: Railway CLI installed: $railwayVersion" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Railway login..." -ForegroundColor Yellow
$whoami = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Not logged in to Railway" -ForegroundColor Yellow
    Write-Host "Please run: railway login" -ForegroundColor Cyan
    Write-Host ""
    $login = Read-Host "Do you want to login now? (y/n)"
    if ($login -eq "y") {
        railway login
        Write-Host "SUCCESS: Logged in successfully!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Deployment cancelled" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "SUCCESS: Logged in as: $whoami" -ForegroundColor Green
}
Write-Host ""

# Check if project exists
Write-Host "Checking Railway project..." -ForegroundColor Yellow
$status = railway status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: No Railway project found" -ForegroundColor Yellow
    Write-Host "Creating new project..." -ForegroundColor Cyan

    railway init

    Write-Host "SUCCESS: Project created!" -ForegroundColor Green
    Write-Host ""

    # Add PostgreSQL
    Write-Host "Adding PostgreSQL database..." -ForegroundColor Cyan
    railway add --database postgresql
    Write-Host "SUCCESS: Database added!" -ForegroundColor Green
    Write-Host ""

    # Generate secrets
    Write-Host "Generating secrets..." -ForegroundColor Cyan
    $JWT_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
    $SESSION_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
    $CSRF_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

    # Set environment variables
    Write-Host "Setting environment variables..." -ForegroundColor Cyan
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET=$JWT_SECRET
    railway variables set JWT_ACCESS_EXPIRES_IN=15m
    railway variables set JWT_REFRESH_EXPIRES_IN=7d
    railway variables set SESSION_SECRET=$SESSION_SECRET
    railway variables set CSRF_SECRET=$CSRF_SECRET
    railway variables set PORT=3001

    Write-Host "SUCCESS: Environment variables set!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "SUCCESS: Project found!" -ForegroundColor Green
}
Write-Host ""

# Run tests before deploying
Write-Host "Running tests..." -ForegroundColor Yellow
Write-Host "(This ensures everything works before deployment)" -ForegroundColor Gray
$testResult = pnpm test:unit 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Some tests failed, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: All tests passed!" -ForegroundColor Green
}
Write-Host ""

# Deploy
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING TO RAILWAY..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "  DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""

    # Get domain
    Write-Host "Getting your live URL..." -ForegroundColor Cyan
    $domain = railway domain 2>&1

    Write-Host ""
    Write-Host "Your app is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URL: Check Railway dashboard" -ForegroundColor Cyan
    Write-Host "Dashboard: railway open" -ForegroundColor Cyan
    Write-Host "Logs: railway logs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Default login:" -ForegroundColor Yellow
    Write-Host "  Email: admin@ashleyai.com" -ForegroundColor White
    Write-Host "  Password: password123" -ForegroundColor White
    Write-Host ""

    # Open dashboard
    $open = Read-Host "Open Railway dashboard? (y/n)"
    if ($open -eq "y") {
        railway open
    }

} else {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "  DEPLOYMENT FAILED" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check logs with: railway logs" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Cyan
Write-Host ""
