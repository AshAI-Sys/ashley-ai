# Ashley AI - Automated Vercel Deployment Script
# This script will deploy Ashley AI to Vercel in production mode

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Ashley AI - Vercel Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to Vercel
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$vercelAuth = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Vercel. Please login..." -ForegroundColor Red
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to login to Vercel. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Logged in as: $vercelAuth" -ForegroundColor Green
Write-Host ""

# Navigate to admin service directory
Write-Host "Navigating to ash-admin service..." -ForegroundColor Yellow
Set-Location -Path "services\ash-admin"

# Deploy to production
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deploying to Vercel Production..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Upload your code to Vercel" -ForegroundColor Yellow
Write-Host "  2. Install dependencies (pnpm install)" -ForegroundColor Yellow
Write-Host "  3. Generate Prisma client" -ForegroundColor Yellow
Write-Host "  4. Build Next.js application" -ForegroundColor Yellow
Write-Host "  5. Deploy to production domain" -ForegroundColor Yellow
Write-Host ""

# Deploy with production flag
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Ashley AI application is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Visit your Vercel dashboard to get the URL" -ForegroundColor White
    Write-Host "  2. Set up environment variables in Vercel Dashboard" -ForegroundColor White
    Write-Host "  3. Run database migrations (see DEPLOYMENT-GUIDE.md)" -ForegroundColor White
    Write-Host "  4. Test your live website" -ForegroundColor White
    Write-Host ""
    Write-Host "Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host "❌ DEPLOYMENT FAILED" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    Write-Host "Refer to DEPLOYMENT-GUIDE.md for troubleshooting." -ForegroundColor Yellow
    Write-Host ""
}

# Return to root directory
Set-Location -Path "..\..\"