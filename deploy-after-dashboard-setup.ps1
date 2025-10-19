# Ashley AI - Deploy After Dashboard Setup
# Use this AFTER creating project in Railway dashboard

Write-Host "======================================"
Write-Host "  Ashley AI - Deploy"
Write-Host "======================================"
Write-Host ""

Write-Host "IMPORTANT: Before running this script:" -ForegroundColor Yellow
Write-Host "1. Go to Railway dashboard: railway open" -ForegroundColor White
Write-Host "2. Create a new project (name it 'Ashley-AI')" -ForegroundColor White
Write-Host "3. Add PostgreSQL database to the project" -ForegroundColor White
Write-Host "4. Come back here and continue" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Have you created the project in Railway dashboard? (y/n)"
if ($confirm -ne "y") {
    Write-Host ""
    Write-Host "Please create the project first:" -ForegroundColor Yellow
    Write-Host "1. Run: railway open" -ForegroundColor Cyan
    Write-Host "2. Click 'New Project' > 'Empty Project'" -ForegroundColor Cyan
    Write-Host "3. Name it 'Ashley-AI'" -ForegroundColor Cyan
    Write-Host "4. Click 'New' > 'Database' > 'PostgreSQL'" -ForegroundColor Cyan
    Write-Host "5. Then run this script again" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Great! Let's link and deploy..." -ForegroundColor Green
Write-Host ""

# Link to project
Write-Host "Linking to your Railway project..." -ForegroundColor Cyan
Write-Host "(Use arrow keys to select your project, then press Enter)" -ForegroundColor Yellow
Write-Host ""

railway link

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to link project" -ForegroundColor Red
    Write-Host "Make sure you created the project in Railway dashboard" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Project linked!" -ForegroundColor Green
Write-Host ""

# Ask about environment variables
Write-Host "Do you need to set environment variables?" -ForegroundColor Yellow
Write-Host "(Choose 'y' if this is first deployment)" -ForegroundColor White
$setVars = Read-Host "Set variables? (y/n)"

if ($setVars -eq "y") {
    Write-Host ""
    Write-Host "Generating secure secrets..." -ForegroundColor Cyan

    $JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $SESSION_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $CSRF_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

    Write-Host "Setting environment variables..." -ForegroundColor Cyan
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET=$JWT_SECRET
    railway variables set JWT_ACCESS_EXPIRES_IN=15m
    railway variables set JWT_REFRESH_EXPIRES_IN=7d
    railway variables set SESSION_SECRET=$SESSION_SECRET
    railway variables set CSRF_SECRET=$CSRF_SECRET
    railway variables set PORT=3001

    Write-Host "SUCCESS: Variables set!" -ForegroundColor Green
    Write-Host ""
}

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
    Write-Host ""
    Write-Host "Get your live URL:" -ForegroundColor White
    Write-Host "  railway domain" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "View deployment:" -ForegroundColor White
    Write-Host "  railway open" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Check logs:" -ForegroundColor White
    Write-Host "  railway logs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Login credentials:" -ForegroundColor Yellow
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
}
