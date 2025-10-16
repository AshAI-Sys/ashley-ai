# Fix DATABASE_URL for Vercel Deployment
# This script removes the &channel_binding=require parameter

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DATABASE_URL Fixer for Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Original connection string from Neon
$originalUrl = "postgresql://neondb_owner:****************@ep-cold-tooth-a15l7pq9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "ORIGINAL (from Neon):" -ForegroundColor Yellow
Write-Host $originalUrl
Write-Host ""

# Remove &channel_binding=require
$fixedUrl = $originalUrl -replace '&channel_binding=require', ''

Write-Host "FIXED (for Vercel):" -ForegroundColor Green
Write-Host $fixedUrl
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to Vercel environment variables:" -ForegroundColor White
Write-Host "   https://vercel.com/ash-ais-projects/ash-admin/settings/environment-variables" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Find DATABASE_URL and click Edit (3 dots menu)" -ForegroundColor White
Write-Host ""
Write-Host "3. Replace the actual password (replace the ******** part)" -ForegroundColor White
Write-Host "   with your REAL password from Neon" -ForegroundColor White
Write-Host ""
Write-Host "4. Copy this CORRECTED connection string:" -ForegroundColor White
Write-Host ""
Write-Host "   $fixedUrl" -ForegroundColor Green
Write-Host ""
Write-Host "5. Paste it into Vercel DATABASE_URL value field" -ForegroundColor White
Write-Host ""
Write-Host "6. Click SAVE" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Copy to clipboard
$fixedUrl | Set-Clipboard
Write-Host "✅ The FIXED connection string has been copied to your clipboard!" -ForegroundColor Green
Write-Host "   Just paste it (Ctrl+V) into Vercel!" -ForegroundColor Green
Write-Host ""
