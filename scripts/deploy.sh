#!/bin/bash
# Ashley AI - Production Deployment Script

set -e

echo "🚀 Ashley AI Production Deployment Starting..."

# Load environment variables
if [ -f .env.production ]; then
    echo "📄 Loading production environment variables..."
    export $(cat .env.production | xargs)
else
    echo "❌ .env.production file not found! Please create it from .env.production.example"
    exit 1
fi

# Validate required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "NEXTAUTH_SECRET" "DOMAIN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create necessary directories
mkdir -p backup
mkdir -p uploads
mkdir -p nginx/logs
mkdir -p nginx/ssl

echo "📁 Created necessary directories"

# Generate Prisma client for production
echo "🔄 Generating Prisma client..."
cd packages/database
pnpm exec prisma generate
cd ../..

# Run database migrations
echo "🗄️ Running database migrations..."
cd packages/database
pnpm exec prisma migrate deploy
cd ../..

# Build the application
echo "🔨 Building application..."
pnpm build

# Start services
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
if docker-compose -f docker-compose.production.yml ps | grep -q "Up (healthy)"; then
    echo "✅ Services are healthy"
else
    echo "⚠️ Some services may not be healthy, checking logs..."
    docker-compose -f docker-compose.production.yml logs
fi

echo "🎉 Deployment completed!"
echo "🌐 Admin Panel: https://${DOMAIN}"
echo "🌐 Client Portal: https://portal.${DOMAIN}"
echo "📊 Monitor with: docker-compose -f docker-compose.production.yml logs -f"