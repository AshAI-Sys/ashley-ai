# 🚀 Ashley AI - Complete Production Deployment Guide

**Last Updated**: October 31, 2025
**Status**: Ready for Production Deployment
**Estimated Total Time**: 2-3 hours for complete setup

---

## 📋 **Table of Contents**

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup & Migration](#database-setup--migration)
3. [Backend Deployment (Vercel)](#backend-deployment-vercel)
4. [Mobile App Build & Deploy](#mobile-app-build--deploy)
5. [Database Optimization](#database-optimization)
6. [Security & Performance Audit](#security--performance-audit)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ **Pre-Deployment Checklist**

###  **System Status** (As of Oct 31, 2025)

```
✅ All TypeScript errors fixed (3 critical files corrected)
✅ Dev server running stable on http://localhost:3001
✅ QR Code Generation API operational
✅ Mobile Sessions API operational
✅ Database connected (PostgreSQL/Neon)
✅ Mobile app configured for dev/prod environments
✅ Navigation updated with new features
✅ Authentication system production-ready (JWT + bcrypt)
```

### **Required Before Deployment:**

- [ ] Production PostgreSQL database provisioned (Neon/Supabase/Railway)
- [ ] Environment variables configured
- [ ] SSL certificates ready (automatic with Vercel)
- [ ] Mobile app icons created (4 required files)
- [ ] Admin user credentials prepared
- [ ] Backup strategy defined

---

## 🗄️ **1. Database Setup & Migration**

### **Option A: Neon (Recommended - Serverless PostgreSQL)**

**Why Neon:**
- Serverless architecture (pay for what you use)
- Automatic scaling
- Built-in connection pooling
- Free tier: 0.5 GB storage, 10 GB transfer/month
- Excellent for production

**Setup Steps:**

```bash
# 1. Create Neon account at https://neon.tech
# 2. Create new project "ashley-ai-production"
# 3. Copy connection string (Pooled connection recommended)

# Example connection string:
DATABASE_URL="postgresql://user:password@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require"

# 4. Run migrations
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database"
DATABASE_URL="your-connection-string" npx prisma migrate deploy

# 5. Generate Prisma client
npx prisma generate

# 6. Verify connection
DATABASE_URL="your-connection-string" npx prisma db push
```

### **Option B: Supabase (PostgreSQL + Features)**

```bash
# 1. Go to https://supabase.com
# 2. Create project
# 3. Get connection string from Settings → Database → Connection String
# 4. Use "Pooler" mode for production (Transaction mode recommended)

DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres?pgbouncer=true"

# Run same migration commands as above
```

### **Option C: Railway (All-in-One)**

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Create project and add PostgreSQL
railway init
railway add postgresql

# 4. Get DATABASE_URL
railway variables

# 5. Run migrations with Railway DATABASE_URL
```

### **Database Initialization Script**

Create admin user and seed initial data:

```bash
# Create file: scripts/init-db.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Ashley AI Production',
      slug: 'ashley-ai-prod',
      settings: {},
    },
  })

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@12345', 12)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ashleyai.com',
      password: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      email_verified: true,
      workspace_id: workspace.id,
    },
  })

  console.log('✅ Admin user created:', admin.email)
  console.log('✅ Workspace created:', workspace.name)
  console.log('🔑 Login credentials:')
  console.log('   Email: admin@ashleyai.com')
  console.log('   Password: Admin@12345')
  console.log('⚠️  IMPORTANT: Change password after first login!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

# Run it:
DATABASE_URL="your-connection-string" npx tsx scripts/init-db.ts
```

---

## 🚀 **2. Backend Deployment (Vercel)**

### **Step 1: Prepare for Deployment**

```bash
# Verify build works locally
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
pnpm build

# Expected output:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Creating an optimized production build
```

### **Step 2: Vercel CLI Deployment (Fastest)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from ash-admin directory
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
vercel

# Follow prompts:
# ? Set up and deploy "ashley-ai"? Y
# ? Which scope? (Select your account)
# ? Link to existing project? N
# ? What's your project's name? ashley-ai-admin
# ? In which directory is your code located? ./

# Deploy to production
vercel --prod
```

### **Step 3: Configure Environment Variables**

Via Vercel Dashboard or CLI:

```bash
# Required variables
vercel env add DATABASE_URL production
# Paste: postgresql://user:password@host/database

vercel env add JWT_SECRET production
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

vercel env add NEXTAUTH_SECRET production
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

vercel env add NEXTAUTH_URL production
# Enter: https://your-domain.vercel.app

# Optional: AI Features
vercel env add ANTHROPIC_API_KEY production
vercel env add OPENAI_API_KEY production

# Optional: Email (Resend)
vercel env add RESEND_API_KEY production
vercel env add SMTP_FROM production

# Optional: Cloud Storage (Cloudinary)
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production

# Redeploy after adding env vars
vercel --prod
```

### **Step 4: Verify Deployment**

```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Expected response:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "version": "1.0.0",
#     "timestamp": "2025-10-31T..."
#   }
# }

# Test auth endpoint
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ashleyai.com","password":"Admin@12345"}'

# Should return JWT token
```

---

## 📱 **3. Mobile App Build & Deploy**

### **Prerequisites**

1. **Create App Icons** (see [APP-ICON-GUIDE.md](./services/ash-mobile/APP-ICON-GUIDE.md))

Required files in `services/ash-mobile/assets/`:
- `icon.png` (1024x1024) - Main app icon
- `splash.png` (1242x2436) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon

**Quick Icon Creation:**
```bash
# Use Canva (free): https://www.canva.com
# 1. Create 1024x1024 canvas
# 2. Blue background (#3B82F6)
# 3. White "ASH" text (centered, bold, 400pt)
# 4. Export as PNG
# 5. Repeat for splash (1242x2436)
```

2. **Update Production URL**

File: `services/ash-mobile/src/constants/config.ts`
```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3001'
    : 'https://ashley-ai-admin-xyz.vercel.app',  // ← Update this!
  // ...
};
```

### **Build for iOS & Android (EAS Build)**

```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-mobile"

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for both platforms
eas build --platform all --profile production

# Wait ~10-20 minutes for build to complete

# Download builds
# iOS: .ipa file (submit to App Store Connect)
# Android: .aab file (submit to Google Play Console)
```

### **Submit to App Stores**

**iOS (App Store):**
```bash
# 1. Go to https://appstoreconnect.apple.com
# 2. Create new app
# 3. Upload .ipa using Transporter app
# 4. Fill app information:
#    - Name: Ashley AI Mobile
#    - Category: Business / Productivity
#    - Screenshots (required)
#    - Description
# 5. Submit for review (~2-3 days)
```

**Android (Google Play):**
```bash
# 1. Go to https://play.google.com/console
# 2. Create new app
# 3. Upload .aab to Production track
# 4. Fill store listing:
#    - Short description (80 chars)
#    - Full description (4000 chars)
#    - Screenshots (minimum 2)
#    - Feature graphic
# 5. Submit for review (~few hours to 1 day)
```

---

## ⚡ **4. Database Optimization**

### **Index Verification**

Your database already has **538 comprehensive indexes**. Verify they're created:

```sql
-- Check indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Should show indexes on:
-- - workspace_id (all tables)
-- - Foreign keys
-- - Status fields
-- - Composite indexes for common queries
```

### **Connection Pooling**

For production, use connection pooling:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add for Neon/Supabase pooling:
  directUrl = env("DIRECT_DATABASE_URL")
}
```

Environment variables:
```bash
# Pooled connection (for queries)
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"

# Direct connection (for migrations)
DIRECT_DATABASE_URL="postgresql://...?sslmode=require"
```

### **Query Optimization Tips**

```typescript
// ✅ Good: Use select to limit fields
const users = await db.user.findMany({
  select: {
    id: true,
    email: true,
    first_name: true,
  },
});

// ❌ Bad: Loading all fields
const users = await db.user.findMany(); // Don't do this

// ✅ Good: Pagination
const orders = await db.order.findMany({
  take: 50,
  skip: page * 50,
});

// ✅ Good: Include only what you need
const order = await db.order.findUnique({
  where: { id },
  include: {
    client: { select: { name: true, email: true } },
    // Don't include everything
  },
});
```

---

## 🔒 **5. Security & Performance Audit**

### **Security Checklist**

#### **A. Authentication & Authorization ✅**
- [x] JWT tokens with 15-minute expiry
- [x] Refresh tokens (7 days)
- [x] HTTP-only cookies
- [x] bcrypt password hashing (12 rounds)
- [x] RBAC permission system
- [x] Workspace isolation enforced

#### **B. API Security ✅**
- [x] All endpoints require authentication
- [x] Input validation with TypeScript
- [x] SQL injection prevention (Prisma ORM)
- [x] Rate limiting implemented
- [x] CORS configured properly

#### **C. Data Protection**
- [ ] Environment variables secured (never commit .env)
- [ ] Secrets rotated regularly
- [ ] Database backups configured
- [ ] SSL/TLS enabled (automatic with Vercel)

#### **D. Production Hardening**

```typescript
// next.config.js - Add security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### **Performance Checklist**

#### **Frontend Optimization**
- [x] Next.js Image component used
- [x] Dynamic imports for code splitting
- [x] Lazy loading components
- [x] Skeleton loaders for better UX

#### **Backend Optimization**
- [x] Database indexes (538 total)
- [x] Efficient Prisma queries
- [x] API response caching where appropriate
- [ ] Redis caching (optional, add if needed)

#### **Load Testing**

Run k6 load tests before going live:

```bash
cd "C:\Users\Khell\Desktop\Ashley AI"

# Install k6 (Windows)
# Download from: https://k6.io/docs/get-started/installation/

# Run load test
k6 run tests/performance/load-test-api.js

# Expected results:
# - p95 response time < 500ms ✅
# - p99 response time < 1000ms ✅
# - Error rate < 1% ✅
```

---

## 🧪 **6. Post-Deployment Testing**

### **Smoke Tests**

```bash
# 1. Health Check
curl https://your-domain.vercel.app/api/health
# Expected: 200 OK

# 2. Login Test
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ashleyai.com","password":"Admin@12345"}'
# Expected: JWT token returned

# 3. Protected Endpoint Test
curl https://your-domain.vercel.app/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: 200 OK with data

# 4. Database Connection
curl https://your-domain.vercel.app/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: Dashboard statistics
```

### **Feature Testing Checklist**

Test all new features:

- [ ] QR Code Generator (`/inventory/qr-generator`)
  - [ ] Can select product variants
  - [ ] Generate QR codes (PNG/SVG/DataURL)
  - [ ] Download QR codes
  - [ ] Print labels

- [ ] Mobile Management (`/mobile/manage`)
  - [ ] View active sessions
  - [ ] See app version distribution
  - [ ] Revoke sessions
  - [ ] Statistics display correctly

- [ ] Mobile App
  - [ ] Login with production credentials
  - [ ] Scan QR codes
  - [ ] View inventory
  - [ ] Create sales transactions

---

## 📊 **7. Monitoring & Maintenance**

### **Setup Monitoring**

#### **Option A: Vercel Analytics (Built-in)**

```bash
# Add to ash-admin layout
pnpm add @vercel/analytics --filter @ash/admin

# app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### **Option B: Sentry (Error Tracking)**

```bash
# Install
pnpm add @sentry/nextjs --filter @ash/admin

# Initialize
npx @sentry/wizard@latest -i nextjs

# Configure sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### **Database Backups**

**Neon**: Automatic daily backups (retained 7 days on free tier)

**Manual backup script:**
```bash
# Create backup script: scripts/backup-db.sh
#!/bin/bash
pg_dump $DATABASE_URL > "backup-$(date +%Y%m%d-%H%M%S).sql"

# Run daily via cron or Task Scheduler
```

### **Health Monitoring**

Create uptime monitoring with UptimeRobot (free):

```bash
# 1. Go to https://uptimerobot.com
# 2. Add new monitor
# 3. Monitor URL: https://your-domain.vercel.app/api/health
# 4. Check interval: 5 minutes
# 5. Alert contacts: your email
```

---

## 🎯 **8. Go-Live Checklist**

### **Pre-Launch (T-1 day)**

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] SSL certificate active (automatic)
- [ ] Load testing passed
- [ ] Security audit completed
- [ ] Backup strategy confirmed
- [ ] Monitoring tools configured
- [ ] Error tracking enabled
- [ ] Mobile apps submitted to stores (if applicable)

### **Launch Day (T+0)**

- [ ] Final smoke tests passed
- [ ] DNS records updated (if custom domain)
- [ ] Team notified
- [ ] Documentation shared
- [ ] Support channels ready

### **Post-Launch (T+1 week)**

- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Optimize slow queries
- [ ] Update documentation based on issues
- [ ] Plan next iteration

---

## 📞 **Support & Resources**

- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Expo Docs**: https://docs.expo.dev
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎉 **Congratulations!**

Your Ashley AI system is now ready for production deployment. Follow this guide step-by-step, and you'll have a secure, scalable, high-performance manufacturing ERP system live in 2-3 hours.

**Questions or issues?** Refer to:
- [VERCEL-DEPLOYMENT-GUIDE.md](./VERCEL-DEPLOYMENT-GUIDE.md) - Detailed backend deployment
- [APP-ICON-GUIDE.md](./services/ash-mobile/APP-ICON-GUIDE.md) - Mobile app icon creation
- [PRODUCTION-SETUP.md](./PRODUCTION-SETUP.md) - Authentication and security
- [SECURITY-AUDIT-REPORT.md](./SECURITY-AUDIT-REPORT.md) - Security assessment (B+ grade, 87/100)

---

**Generated**: October 31, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
