#!/bin/bash

# PostgreSQL Setup Script for Ashley AI
# This script helps set up PostgreSQL database

echo "🚀 Ashley AI - PostgreSQL Setup Script"
echo "======================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  Windows: choco install postgresql"
    echo "  macOS:   brew install postgresql"
    echo "  Linux:   sudo apt-get install postgresql"
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Database configuration
DB_NAME="ashley_ai"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "📝 Database Configuration:"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "  Host:     $DB_HOST"
echo "  Port:     $DB_PORT"
echo ""

# Check if database exists
if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Dropping existing database..."
        dropdb -U $DB_USER $DB_NAME
    else
        echo "Using existing database..."
    fi
fi

# Create database if it doesn't exist
if ! psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "📦 Creating database '$DB_NAME'..."
    createdb -U $DB_USER $DB_NAME
    echo "✅ Database created successfully"
else
    echo "✅ Using existing database"
fi

echo ""

# Update DATABASE_URL in .env
ENV_FILE="services/ash-admin/.env"
NEW_DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

if [ -f "$ENV_FILE" ]; then
    echo "📝 Updating DATABASE_URL in $ENV_FILE..."

    # Backup .env
    cp "$ENV_FILE" "$ENV_FILE.backup"

    # Update DATABASE_URL
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"

    echo "✅ DATABASE_URL updated"
    echo "   Backup saved to $ENV_FILE.backup"
else
    echo "⚠️  $ENV_FILE not found"
fi

echo ""
echo "🔧 Running Prisma migrations..."
cd packages/database

# Generate Prisma Client
echo "  → Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "  → Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Verify connection: npx prisma studio"
echo "  2. Start application: pnpm --filter @ash/admin dev"
echo "  3. Access at: http://localhost:3001"
echo ""
echo "🔗 Connection String:"
echo "  $NEW_DATABASE_URL"
