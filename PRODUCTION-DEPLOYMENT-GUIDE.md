# Ashley AI - Production Deployment Guide

**Date**: November 13, 2025
**Status**: Ready for Production Deployment

## Overview

This guide covers the complete production deployment process for Ashley AI, including external service setup, database migration, Vercel deployment, and mobile app build.

---

## 1. Semaphore SMS Setup (Philippines SMS Provider)

### Sign Up Process

1. **Visit**: https://semaphore.co
2. **Click**: "Sign Up" or "Get Started"
3. **Fill Details**:
   - Business Name: Ashley AI
   - Email: Your business email
   - Phone Number: Your Philippine mobile number
   - Password: Create strong password

### Get API Key

1. **Login** to Semaphore dashboard
2. Navigate to **"API"** section
3. Copy your **API Key** (starts with `semaphore_`)
4. Copy your **Sender Name** (max 11 characters, e.g., "ASHLEYAI")

### Test SMS API

```bash
# Test API with curl
curl -X POST https://api.semaphore.co/api/v4/messages \
  -H "Content-Type: application/json" \
  -d '{
    "apikey": "YOUR_SEMAPHORE_API_KEY",
    "number": "09123456789",
    "message": "Test message from Ashley AI",
    "sendername": "ASHLEYAI"
  }'
```

### Environment Variables to Add

```env
# Semaphore SMS Configuration
SEMAPHORE_API_KEY=your_semaphore_api_key_here
SEMAPHORE_SENDER_NAME=ASHLEYAI
SEMAPHORE_API_URL=https://api.semaphore.co/api/v4/messages
```

### Pricing (as of 2025)

- **Basic Plan**: ₱0.80/SMS
- **Premium Plan**: ₱0.65/SMS (volume discounts)
- **Bulk SMS**: Lower rates for high volume

---

## 2. PostgreSQL Production Database Setup

### Option A: Railway (Recommended - Free Tier Available)

1. **Sign Up**: https://railway.app
2. **Create Project**:
   - Click "New Project"
   - Select "PostgreSQL"
   - Wait for provisioning (~30 seconds)

3. **Get Connection String**:
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy "Postgres Connection URL"
   - Format: `postgresql://user:password@host:port/database`

4. **Database URL** (Railway provides this):
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:1234/railway
   ```

### Option B: Supabase (Free Tier - 500MB)

1. **Sign Up**: https://supabase.com
2. **Create Project**:
   - Organization: Ashley AI
   - Project Name: ashley-ai-prod
   - Database Password: Generate strong password
   - Region: Singapore (closest to Philippines)

3. **Get Connection String**:
   - Go to "Project Settings" → "Database"
   - Copy "Connection string" (Pooling mode recommended)
   - Example: `postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

### Option C: Neon (Serverless PostgreSQL - Free Tier)

1. **Sign Up**: https://neon.tech
2. **Create Project**:
   - Project Name: ashley-ai-prod
   - PostgreSQL Version: 16 (latest)
   - Region: Asia Pacific (Singapore)

3. **Get Connection String**:
   - Copy from dashboard
   - Example: `postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/ashley_ai?sslmode=require`

### Database Migration Steps

Once you have PostgreSQL URL:

```bash
# 1. Update .env file with new DATABASE_URL
DATABASE_URL="postgresql://user:password@host:port/database"

# 2. Push schema to production database
cd packages/database
npx prisma db push

# 3. Generate Prisma Client for production
npx prisma generate

# 4. (Optional) Seed initial data
npx prisma db seed
```

---

## 3. Vercel Deployment with Environment Variables

### Deploy to Vercel

Your code is already pushed to GitHub, so Vercel should auto-deploy. If not:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd services/ash-admin
vercel --prod
```

### Required Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-min-32-chars

# Email (SMTP - Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=noreply@ashleyai.com

# SMS (Semaphore)
SEMAPHORE_API_KEY=your_semaphore_api_key
SEMAPHORE_SENDER_NAME=ASHLEYAI
SEMAPHORE_API_URL=https://api.semaphore.co/api/v4/messages

# Redis (Optional - for caching)
REDIS_URL=redis://username:password@host:port

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Anthropic Claude (for AI chat)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Sentry (Optional - error tracking)
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### Set Environment Variables via CLI

```bash
# Set production environment variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add SEMAPHORE_API_KEY production
# ... add all others

# Redeploy with new env vars
vercel --prod
```

---

## 4. Build Mobile App APK (React Native/Expo)

### Prerequisites

```bash
# Install EAS CLI (Expo Application Services)
npm install -g eas-cli

# Login to Expo
eas login
```

### Configure EAS Build

1. **Initialize EAS**:
```bash
cd services/ash-mobile
eas build:configure
```

2. **Update app.json** (if needed):
```json
{
  "expo": {
    "name": "Ashley AI Mobile",
    "slug": "ashley-ai-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.ashleyai.mobile",
      "versionCode": 1
    }
  }
}
```

3. **Create eas.json** (if not exists):
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Build APK

```bash
# Build production APK
cd services/ash-mobile
eas build --platform android --profile production

# Or build preview APK (faster, no Google Play Store)
eas build --platform android --profile preview
```

### Build Process

1. EAS will ask to create a new project (if first time)
2. Build will be queued on Expo servers
3. You'll get a link to monitor build progress
4. Download APK when complete (~10-15 minutes)

### Alternative: Local Build (requires Android Studio)

```bash
# Build locally
cd services/ash-mobile
npx expo prebuild
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 5. Test All Features

### Automated Testing Script

Create test script:

```bash
# Create test-production.sh
cat > test-production.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Ashley AI Production Features..."

BASE_URL="https://your-app.vercel.app"

# Test 1: Health Check
echo "1. Testing health check..."
curl -s "$BASE_URL/api/health" | jq .

# Test 2: Database Connection
echo "2. Testing database connection..."
curl -s "$BASE_URL/api/health/db" | jq .

# Test 3: Authentication
echo "3. Testing authentication..."
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq .

# Test 4: HR Leave Types
echo "4. Testing HR Leave Types API..."
curl -s "$BASE_URL/api/hr/leave-types" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

# Test 5: Benefits API
echo "5. Testing Benefits API..."
curl -s "$BASE_URL/api/hr/benefit-types" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

# Test 6: Drivers API
echo "6. Testing Drivers API..."
curl -s "$BASE_URL/api/delivery/drivers" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

echo "✅ All tests complete!"
EOF

chmod +x test-production.sh
```

### Manual Testing Checklist

- [ ] **Authentication**
  - [ ] Login with credentials
  - [ ] Logout
  - [ ] Password reset flow
  - [ ] 2FA (if enabled)

- [ ] **HR Leave Management**
  - [ ] Create leave type
  - [ ] Create leave request
  - [ ] Approve leave request
  - [ ] Check leave balance updates

- [ ] **HR Benefits Management**
  - [ ] Create benefit type
  - [ ] Enroll employee in benefit
  - [ ] Update benefit contribution

- [ ] **Driver Management**
  - [ ] Create driver profile
  - [ ] Update driver info
  - [ ] View driver list

- [ ] **Inventory Management**
  - [ ] Create product
  - [ ] Stock adjustment
  - [ ] Sales transaction
  - [ ] QR code generation

- [ ] **Finance Operations**
  - [ ] Create invoice
  - [ ] Record payment
  - [ ] View financial reports

- [ ] **Mobile App**
  - [ ] Install APK
  - [ ] Login
  - [ ] Scan QR code
  - [ ] Process sale
  - [ ] View inventory

---

## 6. Post-Deployment Monitoring

### Setup Monitoring Tools

1. **Vercel Analytics** (Built-in):
   - Go to Vercel Dashboard → Analytics
   - Monitor page views, performance, errors

2. **Sentry Error Tracking** (Optional):
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Database Monitoring**:
   - Railway: Built-in metrics dashboard
   - Supabase: Database usage dashboard
   - Neon: Query performance insights

### Performance Checklist

- [ ] Lighthouse score > 90
- [ ] API response time < 500ms
- [ ] Database query time < 100ms
- [ ] Mobile app load time < 3s
- [ ] Error rate < 1%

---

## 7. Security Checklist

- [ ] All environment variables set in production
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database has strong password
- [ ] HTTPS enabled (Vercel does this automatically)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

---

## 8. Backup and Disaster Recovery

### Database Backups

**Railway**:
- Automatic daily backups (retained for 7 days)
- Manual backup: Dashboard → Database → Backups

**Supabase**:
- Point-in-time recovery available
- Manual backup: `pg_dump` command

**Neon**:
- Branch-based backups
- Manual snapshot: Dashboard → Branches → Create Branch

### Backup Script

```bash
# Manual database backup
export DATABASE_URL="your_production_database_url"
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup-20251113-120000.sql
```

---

## 9. Deployment Checklist

### Pre-Deployment
- [x] All features implemented
- [x] Database schema finalized
- [x] API endpoints tested
- [x] Build successful (95/95 pages)
- [x] Git committed and pushed
- [ ] Environment variables prepared

### Deployment
- [ ] Sign up for Semaphore SMS
- [ ] Setup PostgreSQL database
- [ ] Configure Vercel environment variables
- [ ] Deploy to Vercel
- [ ] Run database migrations
- [ ] Build mobile app APK
- [ ] Test all features

### Post-Deployment
- [ ] Monitor error logs (first 24 hours)
- [ ] Check database performance
- [ ] Verify email/SMS delivery
- [ ] Test mobile app on real devices
- [ ] Setup backup schedule
- [ ] Document any issues

---

## 10. Support and Maintenance

### Daily Tasks
- Check error logs in Vercel dashboard
- Monitor database size and performance
- Review SMS delivery rates

### Weekly Tasks
- Review user feedback
- Check for security updates
- Optimize slow database queries
- Review API usage and performance

### Monthly Tasks
- Database backup verification
- Security audit
- Performance optimization review
- Update dependencies

---

## Troubleshooting

### Common Issues

**Issue**: Vercel deployment fails
- **Solution**: Check build logs, ensure all dependencies installed

**Issue**: Database connection timeout
- **Solution**: Check DATABASE_URL, firewall settings, connection pooling

**Issue**: SMS not sending
- **Solution**: Verify Semaphore API key, check balance, test API directly

**Issue**: Mobile app crashes on startup
- **Solution**: Check API_URL environment variable, verify backend is running

**Issue**: Slow API response times
- **Solution**: Add database indexes, enable Redis caching, optimize queries

---

## Next Steps

1. **Sign up for external services** (Semaphore, Railway/Supabase)
2. **Configure environment variables** in Vercel
3. **Deploy and test** all features
4. **Build mobile app** APK
5. **Launch** to production users!

For questions or issues, refer to:
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Expo Docs: https://docs.expo.dev
- Semaphore Docs: https://semaphore.co/docs

---

**Generated by Claude Code** 🚀
