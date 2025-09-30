# Quick Deployment Script for Ashley AI
# This script deploys the pre-built application to Vercel

Write-Host "🚀 Deploying Ashley AI to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
Set-Location "C:\Users\Khell\Desktop\Ashley AI"

# Deploy from ash-admin directory with proper flags
Write-Host "📦 Deploying from services/ash-admin..." -ForegroundColor Yellow
Set-Location "services\ash-admin"

# Deploy using Vercel with prebuilt flag (since we already built it)
Write-Host "🔧 Running Vercel deployment..." -ForegroundColor Green
vercel --prod --yes --force

Write-Host ""
Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host "Check your deployment at: https://vercel.com/ash-ais-projects/ash-admin" -ForegroundColor Cyan