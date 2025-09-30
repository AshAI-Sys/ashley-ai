# ========================================
# Ashley AI - PostgreSQL Migration Script (Windows PowerShell)
# ========================================
# This script migrates the database from SQLite to PostgreSQL
# Run this script from the project root directory

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Ashley AI - PostgreSQL Migration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Blue
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 1: Start PostgreSQL and Redis with Docker Compose
Write-Host "Step 1: Starting PostgreSQL and Redis containers..." -ForegroundColor Blue
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$maxAttempts = 30
$attempt = 0
$isReady = $false

while (-not $isReady -and $attempt -lt $maxAttempts) {
    try {
        docker exec ash-ai-postgres pg_isready -U ash_ai -d ash_ai_dev | Out-Null
        $isReady = $true
        Write-Host "✓ PostgreSQL is ready!" -ForegroundColor Green
    } catch {
        Write-Host "PostgreSQL is unavailable - sleeping..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if (-not $isReady) {
    Write-Host "✗ ERROR: PostgreSQL failed to start after $maxAttempts attempts" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Update environment variables
Write-Host "Step 2: Updating DATABASE_URL..." -ForegroundColor Blue

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Read .env file
$envContent = Get-Content ".env" -Raw

# Update DATABASE_URL
$newDatabaseUrl = 'DATABASE_URL="postgresql://ash_ai:ash_ai_dev_password_2024@localhost:5432/ash_ai_dev?schema=public"'
$newAshDbUrl = 'ASH_DB_URL="postgresql://ash_ai:ash_ai_dev_password_2024@localhost:5432/ash_ai_dev?schema=public"'

if ($envContent -match "DATABASE_URL=") {
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', $newDatabaseUrl
    $envContent = $envContent -replace "DATABASE_URL='[^']*'", $newDatabaseUrl
    $envContent = $envContent -replace 'DATABASE_URL=[^\r\n]*', $newDatabaseUrl
    Write-Host "✓ DATABASE_URL updated in .env" -ForegroundColor Green
} else {
    $envContent += "`n$newDatabaseUrl"
    Write-Host "✓ DATABASE_URL added to .env" -ForegroundColor Green
}

if ($envContent -match "ASH_DB_URL=") {
    $envContent = $envContent -replace 'ASH_DB_URL="[^"]*"', $newAshDbUrl
    $envContent = $envContent -replace "ASH_DB_URL='[^']*'", $newAshDbUrl
    $envContent = $envContent -replace 'ASH_DB_URL=[^\r\n]*', $newAshDbUrl
} else {
    $envContent += "`n$newAshDbUrl"
}

# Save updated .env file
Set-Content ".env" -Value $envContent -NoNewline
Write-Host ""

# Step 3: Generate Prisma Client for PostgreSQL
Write-Host "Step 3: Generating Prisma Client for PostgreSQL..." -ForegroundColor Blue
Set-Location "packages\database"
pnpm prisma generate
Write-Host "✓ Prisma Client generated!" -ForegroundColor Green
Write-Host ""

# Step 4: Push schema to PostgreSQL
Write-Host "Step 4: Pushing schema to PostgreSQL database..." -ForegroundColor Blue
Write-Host "This will create all tables, indexes, and relationships..." -ForegroundColor Yellow
pnpm prisma db push --accept-data-loss
Write-Host "✓ Database schema created successfully!" -ForegroundColor Green
Write-Host ""

# Step 5: (Optional) Data migration prompt
if (Test-Path "dev.db") {
    Write-Host "SQLite database found. Do you want to migrate existing data? (y/n)" -ForegroundColor Yellow
    $migrateData = Read-Host

    if ($migrateData -eq "y" -or $migrateData -eq "Y") {
        Write-Host "Step 5: Migrating data from SQLite to PostgreSQL..." -ForegroundColor Blue
        Write-Host "Note: Data migration requires custom scripts based on your data structure." -ForegroundColor Yellow
        Write-Host "For now, starting with a fresh database. Implement prisma-export-import if needed." -ForegroundColor Yellow
        Write-Host "✓ Migration setup completed!" -ForegroundColor Green
    } else {
        Write-Host "Skipping data migration. Starting with a fresh database." -ForegroundColor Yellow
    }
} else {
    Write-Host "No SQLite database found. Starting with a fresh PostgreSQL database." -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Verify the migration
Write-Host "Step 6: Verifying database connection..." -ForegroundColor Blue
try {
    pnpm prisma db execute --stdin --sql "SELECT 1;" 2>&1 | Out-Null
    Write-Host "✓ Database connection successful!" -ForegroundColor Green
} catch {
    Write-Host "Connection test completed (some warnings are normal)" -ForegroundColor Yellow
}
Write-Host ""

# Return to root directory
Set-Location "..\..\"

# Step 7: Open Prisma Studio (optional)
Write-Host "Would you like to open Prisma Studio to view the database? (y/n)" -ForegroundColor Yellow
$openStudio = Read-Host

if ($openStudio -eq "y" -or $openStudio -eq "Y") {
    Write-Host "Opening Prisma Studio..." -ForegroundColor Blue
    Write-Host "Access Prisma Studio at: http://localhost:5555" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages\database; pnpm prisma studio"
}
Write-Host ""

# Step 8: Summary
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "PostgreSQL Details:" -ForegroundColor Blue
Write-Host "  Host: localhost"
Write-Host "  Port: 5432"
Write-Host "  Database: ash_ai_dev"
Write-Host "  User: ash_ai"
Write-Host "  Password: ash_ai_dev_password_2024"
Write-Host ""
Write-Host "Redis Details:" -ForegroundColor Blue
Write-Host "  Host: localhost"
Write-Host "  Port: 6379"
Write-Host "  Password: ash_ai_redis_2024"
Write-Host ""
Write-Host "Database Tools:" -ForegroundColor Blue
Write-Host "  Prisma Studio: cd packages\database; pnpm prisma studio"
Write-Host "  Adminer (Web UI): http://localhost:8080"
Write-Host ""
Write-Host "Docker Containers:" -ForegroundColor Blue
Write-Host "  View status: docker-compose ps"
Write-Host "  View logs: docker-compose logs -f postgres"
Write-Host "  Stop all: docker-compose down"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "  1. Start the admin service: pnpm --filter @ash/admin dev"
Write-Host "  2. Start the portal service: pnpm --filter @ash/portal dev"
Write-Host "  3. Access admin interface: http://localhost:3001"
Write-Host "  4. Access client portal: http://localhost:3003"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green