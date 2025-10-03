# PostgreSQL Setup Script for Ashley AI (Windows PowerShell)
# This script helps set up PostgreSQL database on Windows

Write-Host "🚀 Ashley AI - PostgreSQL Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue

if (-not $pgInstalled) {
    Write-Host "❌ PostgreSQL is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "  Option 1: choco install postgresql" -ForegroundColor Yellow
    Write-Host "  Option 2: Download from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL is installed" -ForegroundColor Green
Write-Host ""

# Database configuration
$DB_NAME = "ashley_ai"
$DB_USER = "postgres"
$DB_PASSWORD = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"

Write-Host "📝 Database Configuration:" -ForegroundColor Cyan
Write-Host "  Database: $DB_NAME"
Write-Host "  User:     $DB_USER"
Write-Host "  Host:     $DB_HOST"
Write-Host "  Port:     $DB_PORT"
Write-Host ""

# Set PostgreSQL password environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Check if database exists
$dbExists = psql -U $DB_USER -lqt | Select-String -Pattern $DB_NAME

if ($dbExists) {
    Write-Host "⚠️  Database '$DB_NAME' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (y/N)"

    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "🗑️  Dropping existing database..." -ForegroundColor Yellow
        dropdb -U $DB_USER $DB_NAME
        $dbExists = $false
    }
    else {
        Write-Host "Using existing database..." -ForegroundColor Cyan
    }
}

# Create database if it doesn't exist
if (-not $dbExists) {
    Write-Host "📦 Creating database '$DB_NAME'..." -ForegroundColor Cyan
    createdb -U $DB_USER $DB_NAME

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✅ Using existing database" -ForegroundColor Green
}

Write-Host ""

# Update DATABASE_URL in .env
$ENV_FILE = "services/ash-admin/.env"
$NEW_DATABASE_URL = "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

if (Test-Path $ENV_FILE) {
    Write-Host "📝 Updating DATABASE_URL in $ENV_FILE..." -ForegroundColor Cyan

    # Backup .env
    Copy-Item $ENV_FILE "$ENV_FILE.backup" -Force

    # Read .env content
    $envContent = Get-Content $ENV_FILE

    # Update DATABASE_URL
    $updatedContent = $envContent | ForEach-Object {
        if ($_ -match '^DATABASE_URL=') {
            "DATABASE_URL=`"$NEW_DATABASE_URL`""
        }
        else {
            $_
        }
    }

    # Write updated content
    $updatedContent | Set-Content $ENV_FILE

    Write-Host "✅ DATABASE_URL updated" -ForegroundColor Green
    Write-Host "   Backup saved to $ENV_FILE.backup" -ForegroundColor Gray
}
else {
    Write-Host "⚠️  $ENV_FILE not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Running Prisma migrations..." -ForegroundColor Cyan
Set-Location "packages/database"

# Generate Prisma Client
Write-Host "  → Generating Prisma Client..." -ForegroundColor Gray
npx prisma generate

# Run migrations
Write-Host "  → Running database migrations..." -ForegroundColor Gray
npx prisma migrate dev --name init

# Return to root
Set-Location "../.."

Write-Host ""
Write-Host "✅ PostgreSQL setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify connection: cd packages/database && npx prisma studio"
Write-Host "  2. Start application: pnpm --filter @ash/admin dev"
Write-Host "  3. Access at: http://localhost:3001"
Write-Host ""
Write-Host "🔗 Connection String:" -ForegroundColor Cyan
Write-Host "  $NEW_DATABASE_URL" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tip: Keep your PostgreSQL service running:" -ForegroundColor Yellow
Write-Host "   pg_ctl -D `"C:\Program Files\PostgreSQL\XX\data`" start" -ForegroundColor Gray
