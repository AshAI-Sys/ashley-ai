# 🚀 Ashley AI - Production Deployment Guide

This guide will help you deploy Ashley AI to production with proper security, performance, and reliability.

## 📋 Prerequisites

- **Server**: Linux server with at least 4GB RAM, 50GB storage
- **Docker & Docker Compose**: Latest versions installed
- **Domain**: Domain name with DNS control
- **SSL Certificate**: Valid SSL certificate for your domain
- **Database**: PostgreSQL 15+ (can be containerized or external)

## 🔧 Quick Deployment Steps

### 1. Clone and Setup

```bash
git clone <your-ashley-ai-repo>
cd ashley-ai
```

### 2. Configure Environment

```bash
# Copy the production environment template
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

### 3. Required Environment Variables

Update `.env.production` with these critical values:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ashley_ai_prod"

# Security (Generate strong random keys)
JWT_SECRET="your-256-bit-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
ENCRYPTION_KEY="your-32-character-encryption-key"

# Domain
DOMAIN="your-domain.com"
NEXTAUTH_URL="https://your-domain.com"

# Passwords
POSTGRES_PASSWORD="strong-database-password"

# Email (Optional but recommended)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 4. SSL Certificate Setup

Place your SSL certificates in the `nginx/ssl/` directory:

```bash
mkdir -p nginx/ssl
# Copy your certificate files
cp your-cert.pem nginx/ssl/cert.pem
cp your-private-key.pem nginx/ssl/key.pem
```

**For Let's Encrypt (Free SSL):**

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d portal.your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

### 5. Update Nginx Configuration

Edit `nginx/nginx.conf` and replace `your-domain.com` with your actual domain.

### 6. Deploy

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

## 🔍 Verification

After deployment, verify these URLs:

- **Admin Panel**: https://your-domain.com
- **Client Portal**: https://portal.your-domain.com
- **Health Check**: https://your-domain.com/health

## 📊 Monitoring & Maintenance

### Check Service Status

```bash
# View all services
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Check specific service
docker-compose -f docker-compose.production.yml logs ash-admin
```

### Database Backup

Automated backups run daily at 2 AM. Manual backup:

```bash
# Run backup manually
docker-compose -f docker-compose.production.yml run --rm backup
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

## 🚨 Security Checklist

- [ ] Strong passwords for all accounts
- [ ] SSL certificates properly configured
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular security updates
- [ ] Database access restricted
- [ ] Environment variables secured
- [ ] Backup system operational

## 🎯 Performance Optimization

### Server Requirements by Scale

| Users | CPU | RAM | Storage |
|-------|-----|-----|---------|
| < 50  | 2 cores | 4GB | 50GB |
| < 200 | 4 cores | 8GB | 100GB |
| < 500 | 8 cores | 16GB | 200GB |

### Scaling Options

1. **Vertical Scaling**: Increase server resources
2. **Load Balancing**: Multiple app servers behind load balancer
3. **Database Clustering**: PostgreSQL clustering for high availability
4. **CDN**: Use CloudFlare or AWS CloudFront for static assets

## 🆘 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs [service-name]

# Check system resources
docker system df
df -h
free -h
```

**Database connection issues:**
```bash
# Test database connection
docker-compose -f docker-compose.production.yml exec postgres psql -U ashley_admin -d ashley_ai_prod -c "SELECT 1;"
```

**SSL certificate issues:**
```bash
# Test certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Database performance
docker-compose -f docker-compose.production.yml exec postgres psql -U ashley_admin -d ashley_ai_prod -c "SELECT * FROM pg_stat_activity;"
```

## 📞 Support

For deployment issues:

1. Check logs first: `docker-compose logs`
2. Verify environment variables
3. Ensure SSL certificates are valid
4. Check server resources (disk space, memory)
5. Review firewall settings

## 🔄 Automatic Updates

Set up automatic security updates:

```bash
# Install unattended upgrades
sudo apt install unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure unattended-upgrades
```

## 🗂️ File Structure

```
ashley-ai/
├── .env.production              # Production environment config
├── docker-compose.production.yml # Production compose file
├── nginx/
│   ├── nginx.conf              # Nginx configuration
│   └── ssl/                    # SSL certificates
├── scripts/
│   ├── deploy.sh               # Deployment script
│   └── backup.sh               # Backup script
├── backup/                     # Database backups
└── uploads/                    # User uploaded files
```

---

**🎉 Congratulations!** Your Ashley AI system is now running in production with enterprise-grade security and performance.