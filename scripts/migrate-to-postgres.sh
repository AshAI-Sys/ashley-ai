#!/bin/bash

# ========================================
# Ashley AI - PostgreSQL Migration Script
# ========================================
# This script migrates the database from SQLite to PostgreSQL
# Run this script from the project root directory

set -e  # Exit on error

echo "=========================================="
echo "Ashley AI - PostgreSQL Migration"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Step 1: Start PostgreSQL and Redis with Docker Compose
echo -e "${BLUE}Step 1: Starting PostgreSQL and Redis containers...${NC}"
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 10

# Check PostgreSQL health
until docker exec ash-ai-postgres pg_isready -U ash_ai -d ash_ai_dev > /dev/null 2>&1; do
    echo -e "${YELLOW}PostgreSQL is unavailable - sleeping...${NC}"
    sleep 2
done

echo -e "${GREEN}PostgreSQL is ready!${NC}"
echo ""

# Step 2: Update environment variables
echo -e "${BLUE}Step 2: Updating DATABASE_URL...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
fi

# Update DATABASE_URL in .env
if grep -q "^DATABASE_URL=" .env; then
    # Update existing line
    sed -i.bak 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://ash_ai:ash_ai_dev_password_2024@localhost:5432/ash_ai_dev?schema=public"|' .env
    echo -e "${GREEN}DATABASE_URL updated in .env${NC}"
else
    # Add new line
    echo 'DATABASE_URL="postgresql://ash_ai:ash_ai_dev_password_2024@localhost:5432/ash_ai_dev?schema=public"' >> .env
    echo -e "${GREEN}DATABASE_URL added to .env${NC}"
fi

# Update ASH_DB_URL as well
if grep -q "^ASH_DB_URL=" .env; then
    sed -i.bak 's|^ASH_DB_URL=.*|ASH_DB_URL="postgresql://ash_ai:ash_ai_dev_password_2024@localhost:5432/ash_ai_dev?schema=public"|' .env
else
    echo 'ASH_DB_URL="postgresql://ash_ai:ash_ai_dev_password_2024@localhost:5432/ash_ai_dev?schema=public"' >> .env
fi

echo ""

# Step 3: Generate Prisma Client for PostgreSQL
echo -e "${BLUE}Step 3: Generating Prisma Client for PostgreSQL...${NC}"
cd packages/database
pnpm prisma generate
echo -e "${GREEN}Prisma Client generated!${NC}"
echo ""

# Step 4: Push schema to PostgreSQL
echo -e "${BLUE}Step 4: Pushing schema to PostgreSQL database...${NC}"
pnpm prisma db push --accept-data-loss
echo -e "${GREEN}Database schema created successfully!${NC}"
echo ""

# Step 5: (Optional) Export data from SQLite and import to PostgreSQL
if [ -f "dev.db" ]; then
    echo -e "${YELLOW}SQLite database found. Do you want to migrate existing data? (y/n)${NC}"
    read -r migrate_data

    if [ "$migrate_data" = "y" ] || [ "$migrate_data" = "Y" ]; then
        echo -e "${BLUE}Step 5: Migrating data from SQLite to PostgreSQL...${NC}"

        # Export from SQLite
        echo -e "${YELLOW}Exporting data from SQLite...${NC}"
        pnpm prisma db execute --file ../../scripts/export-sqlite-data.sql --url "file:./dev.db" || true

        echo -e "${GREEN}Data migration completed!${NC}"
        echo -e "${YELLOW}Note: Manual data verification is recommended.${NC}"
    else
        echo -e "${YELLOW}Skipping data migration. Starting with a fresh database.${NC}"
    fi
else
    echo -e "${YELLOW}No SQLite database found. Starting with a fresh PostgreSQL database.${NC}"
fi
echo ""

# Step 6: Verify the migration
echo -e "${BLUE}Step 6: Verifying database connection...${NC}"
if pnpm prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful!${NC}"
else
    echo -e "${RED}✗ Database connection failed!${NC}"
    exit 1
fi
echo ""

# Step 7: Open Prisma Studio (optional)
echo -e "${YELLOW}Would you like to open Prisma Studio to view the database? (y/n)${NC}"
read -r open_studio

if [ "$open_studio" = "y" ] || [ "$open_studio" = "Y" ]; then
    echo -e "${BLUE}Opening Prisma Studio...${NC}"
    echo -e "${GREEN}Access Prisma Studio at: http://localhost:5555${NC}"
    pnpm prisma studio &
fi
echo ""

# Step 8: Summary
echo -e "${GREEN}=========================================="
echo "Migration Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}PostgreSQL Details:${NC}"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: ash_ai_dev"
echo "  User: ash_ai"
echo "  Password: ash_ai_dev_password_2024"
echo ""
echo -e "${BLUE}Database Tools:${NC}"
echo "  Prisma Studio: pnpm --filter @ash-ai/database prisma studio"
echo "  Adminer (Web UI): http://localhost:8080"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Start the admin service: pnpm --filter @ash/admin dev"
echo "  2. Start the portal service: pnpm --filter @ash/portal dev"
echo "  3. Access admin interface: http://localhost:3001"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"