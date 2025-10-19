# Test Script with Docker Database (PowerShell)
# Starts test database, runs tests, and cleans up

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ashley AI - Test Runner with Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Starting test database containers..." -ForegroundColor Green
docker-compose -f docker-compose.test.yml up -d test-db test-redis

Write-Host ""
Write-Host "Step 2: Waiting for databases to be ready..." -ForegroundColor Green
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Step 3: Running database migrations..." -ForegroundColor Green
Set-Location packages\database
npx prisma migrate deploy
Set-Location ..\..

Write-Host ""
Write-Host "Step 4: Seeding test database..." -ForegroundColor Green
npx tsx tests\setup\seed-test-db.ts

Write-Host ""
Write-Host "Step 5: Running tests..." -ForegroundColor Green
pnpm test $args

Write-Host ""
Write-Host "Step 6: Cleaning up..." -ForegroundColor Green
docker-compose -f docker-compose.test.yml down

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
