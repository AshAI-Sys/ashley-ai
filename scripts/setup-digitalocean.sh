#!/bin/bash

# ========================================
# Ashley AI - DigitalOcean Droplet Setup Script
# ========================================
# Run this script on a fresh Ubuntu 22.04 droplet

set -e

echo "=========================================="
echo "Ashley AI - DigitalOcean Setup"
echo "=========================================="
echo ""

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
echo "Installing pnpm..."
npm install -g pnpm

# Install PostgreSQL 16
echo "Installing PostgreSQL 16..."
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# Install Redis
echo "Installing Redis..."
sudo apt install -y redis-server

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Configure PostgreSQL
echo "Configuring PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE ashley_ai_production;
CREATE USER ashley_admin WITH ENCRYPTED PASSWORD 'CHANGE_ME_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE ashley_ai_production TO ashley_admin;
ALTER DATABASE ashley_ai_production OWNER TO ashley_admin;
EOF

# Configure Redis
echo "Configuring Redis..."
sudo sed -i 's/# requirepass foobared/requirepass CHANGE_ME_REDIS_PASSWORD/' /etc/redis/redis.conf
sudo systemctl restart redis

# Configure Firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /var/www/ashley-ai
sudo chown -R $USER:$USER /var/www/ashley-ai

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Clone your repository: git clone https://github.com/your-org/ashley-ai.git /var/www/ashley-ai"
echo "  2. Navigate to directory: cd /var/www/ashley-ai"
echo "  3. Install dependencies: pnpm install"
echo "  4. Configure environment: cp .env.production .env.production.local"
echo "  5. Edit .env.production.local with your values"
echo "  6. Run database migration: ./scripts/migrate-to-postgres.sh"
echo "  7. Build application: pnpm build"
echo "  8. Start with PM2: pm2 start ecosystem.config.js"
echo "  9. Configure Nginx: sudo nano /etc/nginx/sites-available/ashley-ai"
echo "  10. Get SSL certificate: sudo certbot --nginx -d yourdomain.com"
echo ""
echo "Important: Change the default PostgreSQL and Redis passwords!"
echo ""