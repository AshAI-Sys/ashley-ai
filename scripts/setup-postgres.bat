@echo off
REM PostgreSQL Setup Script for Ashley AI (Windows Batch)

echo.
echo ===================================
echo Ashley AI - PostgreSQL Setup
echo ===================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL is not installed
    echo.
    echo Please install PostgreSQL first:
    echo   1. choco install postgresql
    echo   2. Or download from https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo [OK] PostgreSQL is installed
echo.

REM Database configuration
set DB_NAME=ashley_ai
set DB_USER=postgres
set DB_PASSWORD=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo Database Configuration:
echo   Database: %DB_NAME%
echo   User:     %DB_USER%
echo   Host:     %DB_HOST%
echo   Port:     %DB_PORT%
echo.

REM Set PostgreSQL password
set PGPASSWORD=%DB_PASSWORD%

REM Check if database exists
psql -U %DB_USER% -lqt | findstr /C:"%DB_NAME%" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Database '%DB_NAME%' already exists
    set /p recreate="Do you want to drop and recreate it? (y/N): "
    if /i "%recreate%"=="y" (
        echo Dropping existing database...
        dropdb -U %DB_USER% %DB_NAME%
    ) else (
        echo Using existing database...
        goto :skip_create
    )
)

REM Create database
echo Creating database '%DB_NAME%'...
createdb -U %DB_USER% %DB_NAME%
if %ERRORLEVEL% EQU 0 (
    echo [OK] Database created successfully
) else (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)

:skip_create

echo.
echo Updating DATABASE_URL in .env...
set ENV_FILE=services\ash-admin\.env
set NEW_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%?schema=public

if exist "%ENV_FILE%" (
    REM Backup .env
    copy "%ENV_FILE%" "%ENV_FILE%.backup" >nul 2>nul
    echo [OK] Backup saved to %ENV_FILE%.backup

    REM Update DATABASE_URL (simple replacement)
    powershell -Command "(Get-Content '%ENV_FILE%') -replace '^DATABASE_URL=.*', 'DATABASE_URL=\"%NEW_URL%\"' | Set-Content '%ENV_FILE%'"
    echo [OK] DATABASE_URL updated
) else (
    echo [WARNING] %ENV_FILE% not found
)

echo.
echo Running Prisma migrations...
cd packages\database

echo   Generating Prisma Client...
call npx prisma generate

echo   Running database migrations...
call npx prisma migrate dev --name init

cd ..\..

echo.
echo ===================================
echo PostgreSQL setup complete!
echo ===================================
echo.
echo Next steps:
echo   1. Verify connection: cd packages\database ^&^& npx prisma studio
echo   2. Start application: pnpm --filter @ash/admin dev
echo   3. Access at: http://localhost:3001
echo.
echo Connection String:
echo   %NEW_URL%
echo.
pause
