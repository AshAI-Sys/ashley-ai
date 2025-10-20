# Ashley AI - Deploy Now (Quick Deploy to Railway)
# Use this if you've already set up database and environment variables

Write-Host "======================================"
Write-Host "  Ashley AI - Quick Deploy"
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

# Link to project
Write-Host "Linking to Railway project..." -ForegroundColor Cyan
Write-Host "(Select the Ashley AI project you created)" -ForegroundColor Yellow
Write-Host ""
railway link

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to link project" -ForegroundColor Red
    Write-Host "Make sure you select the correct project" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Project linked!" -ForegroundColor Green
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
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. View deployment dashboard: railway open" -ForegroundColor White
    Write-Host "2. Check deployment logs: railway logs" -ForegroundColor White
    Write-Host "3. Get your live URL: railway domain" -ForegroundColor White
    Write-Host ""
    Write-Host "Default login for your app:" -ForegroundColor Yellow
    Write-Host "  Email: admin@ashleyai.com" -ForegroundColor White
    Write-Host "  Password: password123" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "======================================"
    Write-Host "  DEPLOYMENT FAILED"
    Write-Host "======================================"
    Write-Host ""
    Write-Host "Check logs: railway logs" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Cyan
    Write-Host "- Build errors: Check if dependencies are installed" -ForegroundColor White
    Write-Host "- Database not connected: Run 'railway add --database postgresql'" -ForegroundColor White
    Write-Host "- Missing env vars: Check 'railway variables'" -ForegroundColor White
}