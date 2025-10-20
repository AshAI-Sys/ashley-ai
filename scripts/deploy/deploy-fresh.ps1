# Ashley AI - Fresh Railway Deployment
# This creates a new Railway project and deploys

Write-Host "======================================"
Write-Host "  Ashley AI - Fresh Deploy"
Write-Host "======================================"
Write-Host ""

# Check Railway CLI
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
$version = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Railway CLI not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Railway CLI installed" -ForegroundColor Green
Write-Host ""

# Check login
Write-Host "Checking login..." -ForegroundColor Yellow
$whoami = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not logged in" -ForegroundColor Red
    Write-Host "Run: railway login" -ForegroundColor Yellow
    exit 1
}
Write-Host "SUCCESS: Logged in as $whoami" -ForegroundColor Green
Write-Host ""

# Create new project
Write-Host "Creating new Railway project..." -ForegroundColor Cyan
$projectName = Read-Host "Enter project name (or press Enter for 'Ashley-AI')"
if ([string]::IsNullOrWhiteSpace($projectName)) {
    $projectName = "Ashley-AI"
}
Write-Host "Creating project: $projectName" -ForegroundColor Yellow
Write-Host ""

# Initialize Railway project in current directory
railway init --name $projectName

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to create project" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Project created and linked!" -ForegroundColor Green
Write-Host ""

# Add PostgreSQL database
Write-Host "Adding PostgreSQL database..." -ForegroundColor Cyan
railway add --database postgresql

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Database added!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Database add failed or already exists" -ForegroundColor Yellow
}
Write-Host ""

# Generate secure secrets
Write-Host "Generating secure secrets..." -ForegroundColor Cyan
$JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$SESSION_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$CSRF_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "SUCCESS: Secrets generated!" -ForegroundColor Green
Write-Host ""

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Cyan
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set JWT_ACCESS_EXPIRES_IN=15m
railway variables set JWT_REFRESH_EXPIRES_IN=7d
railway variables set SESSION_SECRET=$SESSION_SECRET
railway variables set CSRF_SECRET=$CSRF_SECRET
railway variables set PORT=3001

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Environment variables set!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to set variables" -ForegroundColor Red
    exit 1
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
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. View deployment: railway open" -ForegroundColor White
    Write-Host "2. Check logs: railway logs" -ForegroundColor White
    Write-Host "3. Get URL: railway domain" -ForegroundColor White
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
