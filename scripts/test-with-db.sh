#!/bin/bash

# Test Script with Docker Database
# Starts test database, runs tests, and cleans up

echo "========================================"
echo "Ashley AI - Test Runner with Database"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "Step 1: Starting test database containers..."
docker-compose -f docker-compose.test.yml up -d test-db test-redis

echo ""
echo "Step 2: Waiting for databases to be ready..."
sleep 10

echo ""
echo "Step 3: Running database migrations..."
cd packages/database
npx prisma migrate deploy
cd ../..

echo ""
echo "Step 4: Seeding test database..."
npx tsx tests/setup/seed-test-db.ts

echo ""
echo "Step 5: Running tests..."
pnpm test "$@"

echo ""
echo "Step 6: Cleaning up..."
docker-compose -f docker-compose.test.yml down

echo ""
echo "========================================"
echo "Tests completed!"
echo "========================================"
