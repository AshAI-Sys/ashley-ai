#!/bin/bash

# ASH AI Development Setup Script
echo "🚀 Starting ASH AI Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"
if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $REQUIRED_VERSION or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL and try again."
    exit 1
fi

# Check if Redis is running (optional, will warn if not available)
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Redis is not running. Some features may not work properly."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file. Please configure your database and API keys."
else
    echo "✅ Environment file already exists"
fi

# Setup database
echo "🗄️  Setting up database..."
cd packages/database
npm run db:generate
npm run db:migrate
npm run db:seed
cd ../..

echo "✅ Database setup complete!"

# Start all services in development mode
echo "🌟 Starting all services..."
npm run dev

echo "🎉 ASH AI development environment is ready!"
echo ""
echo "📋 Service URLs:"
echo "  • API Gateway: http://localhost:3000"
echo "  • Admin UI: http://localhost:3001"  
echo "  • Staff PWA: http://localhost:3002"
echo "  • Client Portal: http://localhost:3003"
echo "  • Core Service: http://localhost:4000"
echo "  • Ashley AI: http://localhost:4001"
echo ""
echo "🔐 Demo Credentials:"
echo "  • Admin: admin@demo.com / admin123"
echo "  • Manager: manager@demo.com / admin123"
echo "  • Workspace: demo-apparel"