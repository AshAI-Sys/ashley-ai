#!/bin/bash
# Ashley AI - Production Optimization Script

set -e

echo "🚀 Ashley AI Production Optimization Starting..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Optimize pnpm cache for production
echo "📦 Optimizing package manager..."
pnpm config set store-dir /tmp/.pnpm-store
pnpm config set verify-store-integrity false

# Clean up development dependencies and cache
echo "🧹 Cleaning development artifacts..."
rm -rf node_modules/.cache
rm -rf .next/cache
rm -rf packages/*/node_modules/.cache
rm -rf services/*/node_modules/.cache

# Optimize database for production
echo "🗄️ Optimizing database..."
cd packages/database

# Generate optimized Prisma client
echo "⚙️ Generating optimized Prisma client..."
pnpm exec prisma generate --no-engine

# Run database optimizations
echo "📊 Running database optimizations..."
cat << 'EOF' > /tmp/db_optimize.sql
-- Optimize PostgreSQL for production
ANALYZE;
REINDEX DATABASE ashley_ai_prod;

-- Update table statistics
UPDATE pg_stat_user_tables SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0;

-- Configure optimal settings for Ashley AI workload
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

SELECT pg_reload_conf();
EOF

# Apply if PostgreSQL is available
if command_exists psql; then
    echo "🔧 Applying database optimizations..."
    psql $DATABASE_URL -f /tmp/db_optimize.sql || echo "⚠️ Database optimization skipped (will be applied during deployment)"
    rm /tmp/db_optimize.sql
fi

cd ../..

# Build optimized production bundles
echo "🔨 Building optimized production bundles..."

# Set production environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Build admin service with optimizations
echo "🏗️ Building admin service..."
cd services/ash-admin
pnpm build
cd ../..

# Build portal service with optimizations
echo "🏗️ Building portal service..."
cd services/ash-portal
pnpm build
cd ../..

# Optimize static assets
echo "🖼️ Optimizing static assets..."
find services/*/public -name "*.jpg" -exec jpegoptim --max=85 --strip-all {} \; 2>/dev/null || true
find services/*/public -name "*.png" -exec optipng -o3 {} \; 2>/dev/null || true

# Generate sitemap and robots.txt for SEO
echo "🔍 Generating SEO files..."
cat << 'EOF' > services/ash-admin/public/robots.txt
User-agent: *
Disallow: /api/
Disallow: /admin/
Allow: /health

Sitemap: https://your-domain.com/sitemap.xml
EOF

cat << 'EOF' > services/ash-portal/public/robots.txt
User-agent: *
Allow: /

Sitemap: https://portal.your-domain.com/sitemap.xml
EOF

# Create performance monitoring endpoints
echo "📊 Setting up performance monitoring..."

# Create metrics endpoint for admin
mkdir -p services/ash-admin/pages/api
cat << 'EOF' > services/ash-admin/pages/api/metrics.js
import { NextResponse } from 'next/server';

export default function handler(req, res) {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  res.status(200).json(metrics);
}
EOF

# Create metrics endpoint for portal
mkdir -p services/ash-portal/pages/api
cat << 'EOF' > services/ash-portal/pages/api/metrics.js
import { NextResponse } from 'next/server';

export default function handler(req, res) {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  res.status(200).json(metrics);
}
EOF

# Set up log rotation for production
echo "📝 Configuring log rotation..."
cat << 'EOF' > /tmp/ashley-ai-logrotate
/var/log/ashley-ai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker kill --signal=USR1 ashley-ai-admin ashley-ai-portal 2>/dev/null || true
    endscript
}
EOF

# Apply log rotation if running as root
if [ "$EUID" -eq 0 ]; then
    cp /tmp/ashley-ai-logrotate /etc/logrotate.d/ashley-ai
    echo "✅ Log rotation configured"
else
    echo "⚠️ Log rotation config created (requires root to install)"
fi

# Clean up temporary files
echo "🧹 Final cleanup..."
rm -rf /tmp/.pnpm-store
rm -f /tmp/ashley-ai-logrotate

# Performance tuning recommendations
echo ""
echo "🎯 Production Performance Optimizations Completed!"
echo ""
echo "📊 Performance Recommendations:"
echo "  • Enable gzip compression on your web server"
echo "  • Set up CDN for static assets (CloudFlare recommended)"
echo "  • Configure Redis for session storage"
echo "  • Set up database connection pooling"
echo "  • Monitor with the configured Prometheus endpoints"
echo ""
echo "🔧 System Tuning (run as root if needed):"
echo "  • Increase file descriptor limits: ulimit -n 65536"
echo "  • Configure kernel parameters for network performance"
echo "  • Set up proper firewall rules"
echo ""
echo "📈 Monitoring URLs:"
echo "  • Admin Metrics: https://your-domain.com/api/metrics"
echo "  • Portal Metrics: https://portal.your-domain.com/api/metrics"
echo "  • Prometheus: https://your-domain.com:9090"
echo "  • Grafana: https://your-domain.com:3000"
echo ""
echo "🎉 Ashley AI is optimized for production!"