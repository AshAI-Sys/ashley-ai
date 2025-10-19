@echo off
REM Test Script with Docker Database
REM Starts test database, runs tests, and cleans up

echo ========================================
echo Ashley AI - Test Runner with Database
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    exit /b 1
)

echo Step 1: Starting test database containers...
docker-compose -f docker-compose.test.yml up -d test-db test-redis

echo.
echo Step 2: Waiting for databases to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Step 3: Running database migrations...
cd packages\database
call npx prisma migrate deploy
cd ..\..

echo.
echo Step 4: Seeding test database...
call npx tsx tests\setup\seed-test-db.ts

echo.
echo Step 5: Running tests...
call pnpm test %*

echo.
echo Step 6: Cleaning up...
docker-compose -f docker-compose.test.yml down

echo.
echo ========================================
echo Tests completed!
echo ========================================
