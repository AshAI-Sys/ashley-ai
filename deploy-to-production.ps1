# Ashley AI - Production Deployment Script
# Run this script to deploy to production

Write-Host "🚀 Ashley AI - Production Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from Ashley AI root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Check Git Status
Write-Host "📋 Step 1: Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Git status OK" -ForegroundColor Green
Write-Host ""

# Step 2: Install Dependencies
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build Admin Application
Write-Host "🔨 Step 3: Building admin application..." -ForegroundColor Yellow
Set-Location "services/ash-admin"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Set-Location "../.."
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 4: Check Vercel CLI
Write-Host "🔍 Step 4: Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not installed. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Vercel CLI ready" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "🚀 Step 5: Deploying to Vercel..." -ForegroundColor Yellow
Set-Location "services/ash-admin"

Write-Host ""
Write-Host "Choose deployment option:" -ForegroundColor Cyan
Write-Host "1. Deploy to production (main domain)" -ForegroundColor White
Write-Host "2. Deploy preview (test environment)" -ForegroundColor White
Write-Host "3. Skip Vercel deployment" -ForegroundColor White
$deployOption = Read-Host "Enter option (1-3)"

switch ($deployOption) {
    "1" {
        Write-Host "Deploying to PRODUCTION..." -ForegroundColor Yellow
        vercel --prod
    }
    "2" {
        Write-Host "Deploying to PREVIEW..." -ForegroundColor Yellow
        vercel
    }
    "3" {
        Write-Host "⏭️  Skipping Vercel deployment" -ForegroundColor Yellow
    }
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
        Set-Location "../.."
        exit 1
    }
}

Set-Location "../.."
Write-Host ""

# Step 6: Optional - Build Mobile App
Write-Host "📱 Step 6: Mobile App Build" -ForegroundColor Yellow
Write-Host "Do you want to build the mobile app APK? (y/n)" -ForegroundColor Cyan
$buildMobile = Read-Host

if ($buildMobile -eq "y") {
    Write-Host "Building mobile app..." -ForegroundColor Yellow

    # Check if EAS CLI is installed
    $easInstalled = Get-Command eas -ErrorAction SilentlyContinue
    if (-not $easInstalled) {
        Write-Host "⚠️  EAS CLI not installed. Installing..." -ForegroundColor Yellow
        npm install -g eas-cli
    }

    Set-Location "services/ash-mobile"

    Write-Host ""
    Write-Host "Choose build type:" -ForegroundColor Cyan
    Write-Host "1. Production APK" -ForegroundColor White
    Write-Host "2. Preview APK (faster)" -ForegroundColor White
    $buildType = Read-Host "Enter option (1-2)"

    switch ($buildType) {
        "1" {
            Write-Host "Building production APK..." -ForegroundColor Yellow
            eas build --platform android --profile production
        }
        "2" {
            Write-Host "Building preview APK..." -ForegroundColor Yellow
            eas build --platform android --profile preview
        }
        default {
            Write-Host "❌ Invalid option" -ForegroundColor Red
        }
    }

    Set-Location "../.."
} else {
    Write-Host "⏭️  Skipping mobile app build" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Summary
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Visit your Vercel dashboard to monitor deployment" -ForegroundColor White
Write-Host "2. Configure environment variables in Vercel (see .env.production.template)" -ForegroundColor White
Write-Host "3. Setup production database (Railway/Supabase/Neon)" -ForegroundColor White
Write-Host "4. Run database migrations: npx prisma db push" -ForegroundColor White
Write-Host "5. Test all features in production" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see: PRODUCTION-DEPLOYMENT-GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Happy Deploying!" -ForegroundColor Green
