# Ashley AI - Vercel Deployment Script (Fixed)
# Deploys from root directory with proper monorepo configuration

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Ashley AI - Vercel Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we're in the root directory
$rootDir = "C:\Users\Khell\Desktop\Ashley AI"
Set-Location -Path $rootDir

# Check Vercel authentication
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

# Deploy using Vercel Dashboard import
Write-Host "================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT OPTIONS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "We'll deploy via Vercel Dashboard for best results:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://vercel.com/new" -ForegroundColor White
Write-Host "2. Import Git Repository: https://github.com/AshAI-Sys/ashley-ai" -ForegroundColor White
Write-Host "3. Configure Project:" -ForegroundColor White
Write-Host "   - Framework: Next.js" -ForegroundColor Gray
Write-Host "   - Root Directory: services/ash-admin" -ForegroundColor Gray
Write-Host "   - Build Command: cd ../.. && pnpm --filter @ash/admin build" -ForegroundColor Gray
Write-Host "   - Install Command: pnpm install --frozen-lockfile" -ForegroundColor Gray
Write-Host "   - Output Directory: .next" -ForegroundColor Gray
Write-Host "4. Add Environment Variables (see .env.example)" -ForegroundColor White
Write-Host "5. Click Deploy!" -ForegroundColor White
Write-Host ""

# Ask if user wants to open Vercel Dashboard
$openBrowser = Read-Host "Open Vercel Dashboard in browser? (Y/n)"

if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
    Start-Process "https://vercel.com/new"
    Write-Host ""
    Write-Host "✅ Vercel Dashboard opened in browser!" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "REQUIRED ENVIRONMENT VARIABLES" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy these to Vercel Dashboard → Environment Variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "DATABASE_URL=postgresql://..." -ForegroundColor White
Write-Host "NEXTAUTH_SECRET=your-generated-secret" -ForegroundColor White
Write-Host "JWT_SECRET=your-generated-secret" -ForegroundColor White
Write-Host "ENCRYPTION_KEY=your-32-byte-key" -ForegroundColor White
Write-Host "NEXTAUTH_URL=https://your-app.vercel.app" -ForegroundColor White
Write-Host "APP_URL=https://your-app.vercel.app" -ForegroundColor White
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "DEMO_MODE=false" -ForegroundColor White
Write-Host ""
Write-Host "See DEPLOYMENT-GUIDE.md for complete list" -ForegroundColor Gray
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Next Steps After Deployment:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Get your deployment URL from Vercel" -ForegroundColor White
Write-Host "2. Update NEXTAUTH_URL and APP_URL with your actual URL" -ForegroundColor White
Write-Host "3. Redeploy after updating env vars" -ForegroundColor White
Write-Host "4. Test your live application!" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "Docs: See DEPLOYMENT-GUIDE.md for full instructions" -ForegroundColor Cyan
Write-Host ""
