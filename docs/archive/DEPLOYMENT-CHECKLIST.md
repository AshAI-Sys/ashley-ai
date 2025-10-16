# Ashley AI - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration ✅
- [ ] Copy `.env.example` to `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Set `DEMO_MODE=false`
- [ ] Generate secure `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Generate secure `SESSION_SECRET`
- [ ] Generate secure `CSRF_SECRET`
- [ ] Configure production database URL
- [ ] Set appropriate `LOG_LEVEL` (ERROR or WARN)
- [ ] Configure `NEXT_PUBLIC_APP_URL` with production domain
- [ ] Review and set all required environment variables

### 2. Database Setup ✅
- [ ] Create production database (PostgreSQL recommended)
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Seed initial data (if needed): `npm run seed`
- [ ] Verify database connection
- [ ] Set up database backups
- [ ] Configure database connection pooling

### 3. Security Hardening ✅
- [ ] Review all authentication endpoints
- [ ] Verify JWT token expiration settings
- [ ] Test rate limiting configuration
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS policies
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Review Content Security Policy (CSP)
- [ ] Test account lockout after failed logins
- [ ] Verify password complexity requirements
- [ ] Enable 2FA for admin accounts (if available)

### 4. Code Quality ✅
- [ ] Run TypeScript compiler: `pnpm build`
- [ ] Fix any TypeScript errors
- [ ] Run linter: `pnpm lint`
- [ ] Fix linting issues
- [ ] Remove all console.log in production code (check logger usage)
- [ ] Review error handling in all API routes
- [ ] Verify all API endpoints use standardized responses
- [ ] Check for hardcoded credentials or secrets

### 5. Testing ✅
- [ ] Test user registration and login
- [ ] Test order creation workflow
- [ ] Test client management
- [ ] Test production stages (cutting, printing, sewing, etc.)
- [ ] Test finance operations
- [ ] Test HR & payroll features
- [ ] Test delivery tracking
- [ ] Test multi-workspace functionality
- [ ] Test authentication guards and permissions
- [ ] Test API error responses
- [ ] Load test critical endpoints

### 6. Performance Optimization ✅
- [ ] Enable production build optimizations
- [ ] Configure Redis for caching (recommended)
- [ ] Review database indexes
- [ ] Enable Next.js image optimization
- [ ] Configure CDN for static assets (if using)
- [ ] Test page load times
- [ ] Review and optimize slow API endpoints
- [ ] Enable gzip/brotli compression

### 7. Monitoring & Logging ✅
- [ ] Configure production logging service (optional: Sentry, Logtail)
- [ ] Set up error tracking
- [ ] Configure application monitoring (optional: DataDog, New Relic)
- [ ] Set up uptime monitoring
- [ ] Configure alert notifications
- [ ] Review log retention policies
- [ ] Test log aggregation

### 8. Backup & Recovery ✅
- [ ] Set up automated database backups
- [ ] Test database restore procedure
- [ ] Document backup schedule
- [ ] Set up file storage backups (if using S3/cloud storage)
- [ ] Create disaster recovery plan
- [ ] Document rollback procedures

### 9. Documentation ✅
- [ ] Update README.md with production setup
- [ ] Document environment variables
- [ ] Document deployment process
- [ ] Document backup/restore procedures
- [ ] Create runbook for common issues
- [ ] Document monitoring and alerting setup
- [ ] Create API documentation (optional: Swagger/OpenAPI)

### 10. Final Checks ✅
- [ ] Review all feature flags
- [ ] Verify all external integrations (email, SMS, 3PL)
- [ ] Test email notifications
- [ ] Test SMS notifications (if enabled)
- [ ] Verify payment processing (if enabled)
- [ ] Test file uploads
- [ ] Review and accept terms of service for third-party services
- [ ] Set up domain and SSL certificates
- [ ] Configure DNS records

---

## Deployment Steps

### Option 1: Vercel (Recommended for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd services/ash-admin
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add all variables from `.env`

5. **Configure Database**
   - Recommended: Use Neon PostgreSQL (https://neon.tech)
   - Set `DATABASE_URL` in Vercel environment variables

6. **Run Migrations**
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

### Option 2: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t ashley-ai-admin .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     -p 3001:3001 \
     --env-file .env.production \
     ashley-ai-admin
   ```

3. **Use Docker Compose (recommended)**
   ```bash
   docker-compose up -d
   ```

### Option 3: VPS/Cloud Server

1. **Set up server** (Ubuntu 22.04 LTS recommended)

2. **Install dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pnpm pm2
   ```

3. **Clone repository**
   ```bash
   git clone <your-repo>
   cd ashley-ai/services/ash-admin
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

6. **Build application**
   ```bash
   pnpm build
   ```

7. **Run with PM2**
   ```bash
   pm2 start npm --name "ashley-ai" -- start
   pm2 save
   pm2 startup
   ```

8. **Set up Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

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

9. **Set up SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment Verification

### 1. Smoke Tests
```bash
# Health check
curl https://yourdomain.com/api/health

# Login test
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Orders API test
curl https://yourdomain.com/api/orders \
  -H "Authorization: Bearer <token>"
```

### 2. Monitoring
- [ ] Verify application is accessible
- [ ] Check server resource usage (CPU, memory, disk)
- [ ] Monitor error logs for first 24 hours
- [ ] Verify database connections
- [ ] Check Redis cache (if enabled)
- [ ] Monitor API response times

### 3. User Acceptance Testing
- [ ] Have team test all critical workflows
- [ ] Gather feedback on performance
- [ ] Document any issues discovered
- [ ] Create tickets for bug fixes

---

## Rollback Procedure

If issues are discovered after deployment:

1. **Immediate Rollback (Vercel)**
   ```bash
   vercel rollback
   ```

2. **Manual Rollback (VPS)**
   ```bash
   # Stop current version
   pm2 stop ashley-ai

   # Checkout previous version
   git checkout <previous-commit>

   # Rebuild and restart
   pnpm build
   pm2 restart ashley-ai
   ```

3. **Database Rollback**
   ```bash
   # Restore from backup
   pg_restore -d database_name backup_file.dump
   ```

---

## Production Maintenance

### Daily Checks
- [ ] Monitor error logs
- [ ] Check system resource usage
- [ ] Review API response times

### Weekly Checks
- [ ] Review database performance
- [ ] Check backup integrity
- [ ] Review security alerts
- [ ] Update dependencies (security patches)

### Monthly Checks
- [ ] Review and rotate logs
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Review and update documentation
- [ ] Dependency updates (minor versions)

---

## Emergency Contacts

**System Administrator**: _________________
**Database Administrator**: _________________
**Security Contact**: _________________
**On-Call Developer**: _________________

---

## Useful Commands

```bash
# View application logs
pm2 logs ashley-ai

# Restart application
pm2 restart ashley-ai

# Check application status
pm2 status

# Database backup
pg_dump -U username database_name > backup_$(date +%Y%m%d).sql

# Database restore
psql -U username database_name < backup_20250101.sql

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

**Last Updated**: October 14, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
