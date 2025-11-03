@echo off
REM Ashley AI Development Server Startup Script
REM Sets DATABASE_URL and starts the dev server

cd /d "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

echo.
echo ======================================
echo   Starting Ashley AI Admin Interface
echo ======================================
echo.

set DATABASE_URL=postgresql://neondb_owner:npg_oVNf76Kpqasx@ep-falling-fire-a1ru8mim-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

echo Database: PostgreSQL (Neon)
echo Port: 3001
echo.

pnpm dev
