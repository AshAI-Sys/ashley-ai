# Ashley AI - Production Deployment Guide

**Version:** 1.1.0
**Last Updated:** 2025-09-30
**Status:** Production Ready ✅

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Migration](#database-migration)
3. [Environment Configuration](#environment-configuration)
4. [External Services Setup](#external-services-setup)
5. [Cloud Deployment Options](#cloud-deployment-options)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Observability](#monitoring--observability)
8. [Backup & Disaster Recovery](#backup--disaster-recovery)
9. [Performance Optimization](#performance-optimization)
10. [Post-Deployment Verification](#post-deployment-verification)

---

## Pre-Deployment Checklist

### Required Actions

- [ ] **Database Migration**: SQLite → PostgreSQL
- [ ] **Redis Setup**: Configure Redis for caching and sessions
- [ ] **Environment Variables**: Create `.env.production` with all required keys
- [ ] **External Services**: Set up Stripe, Resend, Twilio, AWS S3
- [ ] **Security Keys**: Generate new JWT secrets and NextAuth secrets
- [ ] **SSL Certificates**: Obtain SSL certificates for HTTPS
- [ ] **Domain Configuration**: Point domains to deployment servers
- [ ] **Backup Strategy**: Configure automated database backups
- [ ] **Monitoring Tools**: Set up Sentry, Mixpanel, or alternative
- [ ] **Load Testing**: Perform load testing with K6 scripts

### System Requirements

**Production Server:**

- **CPU**: 4+ cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS or similar Linux distribution
- **Node.js**: v20.0.0+
- **PostgreSQL**: v15 or v16
- **Redis**: v7+
- **Docker** (optional): v24+

---

## Database Migration

### Step 1: Install PostgreSQL

**Using Docker (Recommended):**

```bash
# Start PostgreSQL and Redis containers
docker-compose up -d postgres redis

# Check status
docker-compose ps
```

**Manual Installation (Ubuntu):**

```bash
# Install PostgreSQL 16
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Production Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE ashley_ai_production;
CREATE USER ashley_admin WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE ashley_ai_production TO ashley_admin;
ALTER DATABASE ashley_ai_production OWNER TO ashley_admin;

# Exit
\q
```

### Step 3: Run Migration Script

**Windows:**

```powershell
# Run PowerShell migration script
.\scripts\migrate-to-postgres.ps1
```

**Linux/macOS:**

```bash
# Make script executable
chmod +x scripts/migrate-to-postgres.sh

# Run migration script
./scripts/migrate-to-postgres.sh
```

**Manual Migration:**

```bash
# Navigate to database package
cd packages/database

# Generate Prisma Client for PostgreSQL
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Verify migration
pnpm prisma studio
```

### Step 4: Data Migration (if migrating from SQLite)

If you have existing data in SQLite that needs to be migrated:

```bash
# Export from SQLite (custom script needed)
# Import to PostgreSQL (custom script needed)
# Verify data integrity
```

---

## Environment Configuration

### Step 1: Create Production Environment File

Copy the template:

```bash
cp .env.production .env.production.local
```

### Step 2: Generate Security Keys

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate NextAuth Secret
openssl rand -base64 32

# Generate Session Secret
openssl rand -base64 32

# Generate CSRF Secret
openssl rand -base64 32
```

### Step 3: Configure Critical Variables

Edit `.env.production.local`:

```bash
# Database
DATABASE_URL="postgresql://ashley_admin:YOUR_SECURE_PASSWORD@localhost:5432/ashley_ai_production?schema=public&connection_limit=10"

# Redis
REDIS_URL="redis://:YOUR_REDIS_PASSWORD@localhost:6379/0"

# Security (use generated keys from Step 2)
ASH_JWT_SECRET="[GENERATED_JWT_SECRET]"
NEXTAUTH_SECRET="[GENERATED_NEXTAUTH_SECRET]"
SESSION_SECRET="[GENERATED_SESSION_SECRET]"
CSRF_SECRET="[GENERATED_CSRF_SECRET]"

# Application URLs
APP_URL="https://admin.ashleyai.com"
PORTAL_URL="https://portal.ashleyai.com"
NEXTAUTH_URL="https://admin.ashleyai.com"

# Environment
NODE_ENV=production
ASH_LOG_LEVEL=info
```

---

## External Services Setup

### 1. Stripe (Payment Processing)

**Sign Up:**

1. Go to [stripe.com](https://stripe.com)
2. Create account or sign in
3. Navigate to Developers → API Keys

**Configuration:**

```bash
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

**Webhook Setup:**

1. Go to Developers → Webhooks
2. Add endpoint: `https://admin.ashleyai.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `charge.failed`, etc.
4. Copy webhook secret:

```bash
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 2. Resend (Email Service)

**Sign Up:**

1. Go to [resend.com](https://resend.com)
2. Create account and verify domain
3. Get API key from dashboard

**Configuration:**

```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="Ashley AI <noreply@ashleyai.com>"
EMAIL_REPLY_TO="support@ashleyai.com"
```

**Domain Verification:**

- Add DNS records provided by Resend
- Verify SPF, DKIM, and DMARC records

### 3. Twilio / Semaphore (SMS)

**For Philippines (Recommended - Semaphore):**

1. Go to [semaphore.co](https://semaphore.co)
2. Create account and get API key

```bash
SEMAPHORE_API_KEY="..."
SEMAPHORE_SENDER_NAME="ASHLEYAI"
ASH_SMS_PROVIDER="semaphore"
```

**For International (Twilio):**

1. Go to [twilio.com](https://twilio.com)
2. Create account and get credentials

```bash
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1555..."
ASH_SMS_PROVIDER="twilio"
```

### 4. AWS S3 (File Storage)

**Setup:**

1. Create AWS account
2. Create S3 bucket: `ashley-ai-production-files`
3. Create IAM user with S3 permissions
4. Generate access keys

**Configuration:**

```bash
ASH_STORAGE_PROVIDER="aws"
ASH_AWS_REGION="ap-southeast-1"
ASH_AWS_BUCKET="ashley-ai-production-files"
ASH_AWS_ACCESS_KEY_ID="..."
ASH_AWS_SECRET_ACCESS_KEY="..."
```

**Bucket Policy (Public Read for uploads):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ashley-ai-production-files/*"
    }
  ]
}
```

### 5. OpenAI (Ashley AI Features)

**Setup:**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and add payment method
3. Generate API key

**Configuration:**

```bash
ASH_OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4"
ASHLEY_AI_ENABLED=true
```

### 6. Sentry (Error Tracking)

**Setup:**

1. Go to [sentry.io](https://sentry.io)
2. Create project (Next.js)
3. Get DSN

**Configuration:**

```bash
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### 7. Mixpanel (Analytics)

**Setup:**

1. Go to [mixpanel.com](https://mixpanel.com)
2. Create project
3. Get token

**Configuration:**

```bash
MIXPANEL_TOKEN="..."
NEXT_PUBLIC_MIXPANEL_TOKEN="..."
```

---

## Cloud Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Advantages:**

- Optimized for Next.js
- Auto-scaling
- Global CDN
- Zero-config deployment
- Built-in SSL

**Steps:**

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

**Vercel Configuration:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Database:** Use external PostgreSQL (Railway, Supabase, or AWS RDS)

### Option 2: AWS (Full Control)

**Architecture:**

- **EC2**: Application servers
- **RDS**: PostgreSQL database
- **ElastiCache**: Redis
- **S3**: File storage
- **CloudFront**: CDN
- **Route 53**: DNS
- **ALB**: Load balancer

**Steps:**

1. Launch RDS PostgreSQL instance
2. Launch ElastiCache Redis cluster
3. Create S3 bucket
4. Launch EC2 instances (or use ECS/Fargate)
5. Configure ALB
6. Set up CloudFront
7. Deploy application

### Option 3: DigitalOcean (Simplicity + Control)

**Setup:**

```bash
# Create droplet (Ubuntu 22.04, 4GB RAM)
# SSH into droplet
ssh root@your-droplet-ip

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql redis-server

# Install pnpm
npm install -g pnpm

# Clone repository
git clone https://github.com/your-org/ashley-ai.git
cd ashley-ai

# Install dependencies
pnpm install

# Build application
pnpm build

# Start with PM2
npm install -g pm2
pm2 start npm --name "ashley-admin" -- run start:admin
pm2 start npm --name "ashley-portal" -- run start:portal
pm2 save
pm2 startup
```

### Option 4: Docker Deployment

**Using docker-compose.production.yml:**

```bash
# Build images
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

---

## Security Hardening

### 1. Disable Demo Mode

Edit authentication files to remove demo mode bypass:

```typescript
// Remove or comment out demo mode logic
// if (process.env.DEMO_MODE === 'true') { ... }
```

### 2. Enable HTTPS Only

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name admin.ashleyai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.ashleyai.com;

    ssl_certificate /etc/letsencrypt/live/ashleyai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ashleyai.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Deny direct database access from internet
sudo ufw deny 5432/tcp
sudo ufw deny 6379/tcp
```

### 4. Set Up SSL Certificates

**Using Let's Encrypt (Free):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d admin.ashleyai.com -d portal.ashleyai.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
```

### 5. Enable Rate Limiting

Already built into the system via Redis. Configure in `.env`:

```bash
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 6. Configure CORS

```bash
CORS_ORIGINS="https://admin.ashleyai.com,https://portal.ashleyai.com"
```

---

## Monitoring & Observability

### 1. Application Monitoring

**Sentry Integration:**

- Automatic error tracking
- Performance monitoring
- Release tracking

**Custom Health Checks:**

```bash
# Health endpoint
curl https://admin.ashleyai.com/api/health
```

### 2. Database Monitoring

**PostgreSQL Stats:**

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 minutes';

-- Database size
SELECT pg_database_size('ashley_ai_production');
```

### 3. Redis Monitoring

```bash
# Connect to Redis
redis-cli -a YOUR_REDIS_PASSWORD

# Check info
INFO stats
INFO memory

# Monitor commands
MONITOR
```

### 4. Server Monitoring

**Using PM2:**

```bash
# Install PM2
npm install -g pm2

# Start monitoring
pm2 monit

# Web dashboard
pm2 install pm2-server-monit
```

**Using Grafana + Prometheus (Advanced):**

- Set up Prometheus for metrics collection
- Configure Grafana dashboards
- Monitor CPU, memory, disk, network

---

## Backup & Disaster Recovery

### 1. Database Backups

**Automated Daily Backups:**

```bash
#!/bin/bash
# /scripts/backup-database.sh

BACKUP_DIR="/backup/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="ashley_ai_backup_$DATE.sql.gz"

# Create backup
pg_dump -U ashley_admin ashley_ai_production | gzip > "$BACKUP_DIR/$FILENAME"

# Upload to S3
aws s3 cp "$BACKUP_DIR/$FILENAME" s3://ashley-ai-backups/

# Keep only last 30 days locally
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

**Cron Schedule:**

```bash
# Run daily at 2 AM
0 2 * * * /scripts/backup-database.sh
```

### 2. File Storage Backups

S3 versioning enabled automatically backs up all file changes.

```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ashley-ai-production-files \
  --versioning-configuration Status=Enabled
```

### 3. Disaster Recovery Plan

**Recovery Time Objective (RTO):** < 4 hours
**Recovery Point Objective (RPO):** < 24 hours

**Recovery Steps:**

1. Provision new server/infrastructure
2. Restore latest database backup
3. Deploy application code
4. Configure environment variables
5. Verify functionality
6. Update DNS records

---

## Performance Optimization

### 1. Enable Redis Caching

```bash
ENABLE_REDIS_CACHE=true
CACHE_TTL_DEFAULT=3600
```

### 2. Enable CDN

Configure CloudFront or Cloudflare:

```bash
CDN_URL="https://cdn.ashleyai.com"
ENABLE_CDN=true
```

### 3. Database Optimization

**PostgreSQL Configuration:**

```sql
-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '2GB';

-- Increase work memory
ALTER SYSTEM SET work_mem = '16MB';

-- Enable query planning
ALTER SYSTEM SET effective_cache_size = '6GB';

-- Reload configuration
SELECT pg_reload_conf();
```

**Prisma Connection Pooling:**

```bash
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

### 4. Enable Compression

```bash
ENABLE_COMPRESSION=true
COMPRESSION_LEVEL=6
```

---

## Post-Deployment Verification

### Checklist

- [ ] **Database Connection**: Test PostgreSQL connection
- [ ] **Redis Connection**: Test Redis connection
- [ ] **Health Endpoint**: `GET /api/health` returns 200
- [ ] **Authentication**: Login with real user credentials
- [ ] **File Upload**: Test file upload to S3
- [ ] **Email**: Send test email
- [ ] **SMS**: Send test SMS
- [ ] **Payment**: Test Stripe payment (test mode first)
- [ ] **SSL**: Verify HTTPS is working
- [ ] **Monitoring**: Verify Sentry is receiving events
- [ ] **Analytics**: Verify Mixpanel is tracking events
- [ ] **Backups**: Verify database backup script runs
- [ ] **Performance**: Run K6 load tests
- [ ] **Security**: Run security scan

### Load Testing

```bash
# Install K6
brew install k6  # macOS
# or
sudo apt install k6  # Linux

# Run load test
k6 run tests/load/production-test.js
```

### Security Scan

```bash
# Install OWASP ZAP or similar
# Run vulnerability scan
# Review and fix any critical issues
```

---

## Maintenance Procedures

### Regular Maintenance

**Weekly:**

- Review error logs in Sentry
- Check database performance
- Review security alerts

**Monthly:**

- Update dependencies (`pnpm update`)
- Review and rotate API keys
- Test backup restoration
- Review access logs

**Quarterly:**

- Security audit
- Performance optimization
- Capacity planning review

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Run database migrations
cd packages/database
pnpm prisma migrate deploy

# Build application
pnpm build

# Restart services
pm2 restart all

# Verify deployment
curl https://admin.ashleyai.com/api/health
```

---

## Troubleshooting

### Common Issues

**Database Connection Errors:**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U ashley_admin -d ashley_ai_production -h localhost
```

**Redis Connection Errors:**

```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli -a YOUR_PASSWORD ping
```

**Application Not Starting:**

```bash
# Check logs
pm2 logs ashley-admin

# Check environment variables
printenv | grep ASH_
```

---

## Support & Resources

- **Documentation**: `/docs` directory
- **GitHub Issues**: Report bugs and feature requests
- **Email Support**: support@ashleyai.com

---

**Deployment Guide Version:** 1.0.0
**Last Updated:** 2025-09-30
**Status:** ✅ Production Ready
