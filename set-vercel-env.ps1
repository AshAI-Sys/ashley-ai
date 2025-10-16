# PowerShell script to set Vercel environment variables
# Run this in PowerShell: .\set-vercel-env.ps1

cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

Write-Host "Setting up Vercel environment variables..." -ForegroundColor Green

# Security Secrets
echo '+kenmdcKauRX4Qlj3be1pFfgOwBY5yPO4ID+2dziCYQ=' | vercel env add NEXTAUTH_SECRET production
echo 'fiP2fJpeAOVZEfpcHxk3BkwhCFUbODK/Kx1c8oDZwLCrz0eaNArjeA3WCxlg+p/N' | vercel env add JWT_SECRET production
echo 'fCRN7vPHqfco6QoASU2qREYPBNipb0/SORcLEve6lBo=' | vercel env add ENCRYPTION_KEY production

# Application Settings  
echo 'production' | vercel env add NODE_ENV production
echo 'INFO' | vercel env add LOG_LEVEL production
echo 'demo-workspace-1' | vercel env add DEFAULT_WORKSPACE_ID production
echo 'true' | vercel env add DEMO_MODE production

# Features
echo 'false' | vercel env add ENABLE_2FA production
echo 'true' | vercel env add RATE_LIMIT_ENABLED production
echo 'true' | vercel env add FEATURE_AI_CHAT production
echo 'true' | vercel env add FEATURE_PWA production

Write-Host "✓ Environment variables added successfully!" -ForegroundColor Green
Write-Host "Now run: vercel --prod" -ForegroundColor Yellow
