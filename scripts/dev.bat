@echo off
REM ASH AI Development Setup Script for Windows

echo 🚀 Starting ASH AI Development Environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is required but not found. Please check your Node.js installation.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Setup environment file
if not exist .env (
    echo 📝 Creating environment file...
    copy .env.example .env
    echo ✅ Created .env file. Please configure your database and API keys.
) else (
    echo ✅ Environment file already exists
)

echo ✅ Setup complete! Please make sure you have:
echo   • PostgreSQL running with ASH_DB_URL configured in .env
echo   • Redis running (optional, for caching)
echo   • OpenAI API key configured in .env

echo.
echo 🌟 To start all services, run:
echo   npm run dev

echo.
echo 📋 Service URLs:
echo   • API Gateway: http://localhost:3000
echo   • Admin UI: http://localhost:3001
echo   • Staff PWA: http://localhost:3002
echo   • Client Portal: http://localhost:3003
echo   • Core Service: http://localhost:4000
echo   • Ashley AI: http://localhost:4001

echo.
echo 🔐 Demo Credentials:
echo   • Admin: admin@demo.com / admin123
echo   • Manager: manager@demo.com / admin123
echo   • Workspace: demo-apparel

pause