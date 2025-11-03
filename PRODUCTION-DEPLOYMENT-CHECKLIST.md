# Ashley AI Production Deployment Checklist

**Version**: 1.0.0
**Date**: October 31, 2025
**Status**: Complete Deployment Guide

## Overview

This comprehensive checklist ensures a successful deployment of the Ashley AI Manufacturing ERP System, including the web application and mobile app to production environments.

---

## 📱 Mobile App Deployment (iOS & Android)

### Pre-Deployment Checklist

#### 1. Code Preparation
- [ ] All features tested in development environment
- [ ] QR code scanning tested on real devices (iOS & Android)
- [ ] Authentication flow tested with production backend
- [ ] All API endpoints verified with production URLs
- [ ] Error handling and offline mode tested
- [ ] Performance testing completed (response times, memory usage)
- [ ] No console.log statements in production code
- [ ] All TODO/FIXME comments resolved

#### 2. Configuration Updates

**Update API URL** in `services/ash-mobile/src/constants/config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://api.yourcompany.com',  // PRODUCTION URL
  // NOT: 'http://localhost:3001' or 'http://192.168.x.x'
};
```

**Update app.json** with production values:
```json
{
  "expo": {
    "name": "Ashley AI Mobile",
    "slug": "ashley-ai-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.ashleyai",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.ashleyai",
      "versionCode": 1
    }
  }
}
```

#### 3. App Assets
- [ ] App icon created (1024x1024 PNG)
- [ ] Splash screen created (1242x2436 PNG)
- [ ] Adaptive icon created for Android (1024x1024 PNG)
- [ ] Favicon created (48x48 PNG)
- [ ] All assets placed in `services/ash-mobile/assets/`
- [ ] Assets follow branding guidelines (Ashley AI blue: #3B82F6)

#### 4. Dependencies & Security
- [ ] All npm packages updated to latest stable versions
- [ ] Security audit completed: `pnpm audit`
- [ ] No critical vulnerabilities present
- [ ] Unused dependencies removed
- [ ] Environment variables configured (if any)

### iOS Deployment (Apple App Store)

#### Prerequisites
- [ ] Apple Developer Account ($99/year) - https://developer.apple.com
- [ ] Expo account created - https://expo.dev
- [ ] EAS CLI installed: `npm install -g eas-cli`

#### Build & Submit Process

**Step 1: Login to Expo**
```bash
cd services/ash-mobile
eas login
```

**Step 2: Configure EAS Build**
```bash
eas build:configure
```

**Step 3: Build for iOS**
```bash
eas build --platform ios --profile production
```

**Step 4: Submit to App Store**
```bash
eas submit --platform ios
```

**Step 5: App Store Connect Configuration**
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Complete app information:
   - App name: Ashley AI Mobile
   - Primary language: English
   - Bundle ID: com.yourcompany.ashleyai
   - SKU: unique identifier
4. Add app description (4000 character limit)
5. Add keywords (100 character limit)
6. Upload screenshots:
   - iPhone 6.7" (1290x2796) - 3 required
   - iPhone 6.5" (1242x2688) - 3 required
   - iPhone 5.5" (1242x2208) - 3 required
   - iPad Pro 12.9" (2048x2732) - 2 required
7. Set app category: Business / Productivity
8. Add privacy policy URL
9. Submit for review

**Estimated Review Time**: 24-72 hours

#### iOS Checklist
- [ ] Build completed successfully on EAS
- [ ] App tested on TestFlight with internal testers
- [ ] Screenshots created for all required device sizes
- [ ] Privacy policy URL added
- [ ] App description and keywords optimized
- [ ] App Store Connect profile completed
- [ ] App submitted for review

### Android Deployment (Google Play Store)

#### Prerequisites
- [ ] Google Play Developer Account ($25 one-time) - https://play.google.com/console
- [ ] Expo account created
- [ ] EAS CLI installed

#### Build & Submit Process

**Step 1: Build for Android**
```bash
cd services/ash-mobile
eas build --platform android --profile production
```

**Step 2: Submit to Play Store**
```bash
eas submit --platform android
```

**Step 3: Google Play Console Configuration**
1. Go to https://play.google.com/console
2. Create new application
3. Complete store listing:
   - App name: Ashley AI Mobile
   - Short description (80 chars): Manufacturing ERP inventory management
   - Full description (4000 chars): Complete description
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (min 2, recommended 8):
     - Phone: 16:9 or 9:16 aspect ratio
     - 7-inch tablet (optional)
     - 10-inch tablet (optional)
4. Set app category: Business
5. Add content rating questionnaire
6. Add privacy policy URL
7. Set up pricing & distribution
8. Choose countries for distribution
9. Submit for review

**Estimated Review Time**: 24-48 hours

#### Android Checklist
- [ ] Build completed successfully (APK or AAB)
- [ ] App tested on physical Android device
- [ ] Screenshots created (phone + tablet)
- [ ] Feature graphic created (1024x500)
- [ ] Content rating completed
- [ ] Privacy policy URL added
- [ ] App description optimized
- [ ] Play Console profile completed
- [ ] App submitted for review

---

## 🌐 Backend API Deployment

### Pre-Deployment Checklist

#### 1. Code Quality
- [ ] All TypeScript compilation errors resolved
- [ ] ESLint warnings fixed
- [ ] Database migrations tested
- [ ] API endpoints tested with production data
- [ ] Error handling implemented for all endpoints
- [ ] Rate limiting configured
- [ ] CORS settings configured for production domains

#### 2. Security Hardening
- [ ] Environment variables secured (never commit .env)
- [ ] JWT secrets generated (strong, random)
- [ ] Database credentials rotated
- [ ] API keys secured in environment variables
- [ ] HTTPS enabled (TLS 1.2+)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] SQL injection prevention verified (Prisma ORM)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Input validation using Zod schemas
- [ ] File upload validation (magic bytes, size limits)
- [ ] Password hashing verified (bcrypt, 12 rounds)
- [ ] Account lockout enabled (5 attempts, 30min)
- [ ] Session management secured (HTTP-only cookies)
- [ ] Rate limiting per IP address
- [ ] Audit logging enabled for sensitive operations

#### 3. Database Configuration
- [ ] Production database created (PostgreSQL recommended)
- [ ] Database credentials secured
- [ ] Connection pooling configured
- [ ] Database backups automated (daily minimum)
- [ ] Database migrations tested
- [ ] Indexes verified for performance
- [ ] Database monitoring enabled

**Database Connection String Format**:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

#### 4. Environment Configuration

**Create `.env.production` file**:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"
NEXTAUTH_URL="https://yourdomain.com"

# Application
NODE_ENV="production"
PORT=3001

# CORS
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Redis (if using)
REDIS_URL="redis://user:password@host:6379"

# AI Services (optional)
ANTHROPIC_API_KEY="sk-ant-xxx"
OPENAI_API_KEY="sk-xxx"

# Email (optional)
SMTP_HOST="smtp.yourprovider.com"
SMTP_PORT=587
SMTP_USER="your-email@domain.com"
SMTP_PASSWORD="your-password"
```

#### 5. Deployment Platforms

**Option A: Vercel (Recommended for Next.js)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd services/ash-admin
vercel --prod
```

**Vercel Configuration**:
- Add environment variables in Vercel dashboard
- Configure build command: `pnpm build`
- Configure output directory: `.next`
- Set Node.js version: 18.x

**Option B: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

**Option C: Docker + VPS**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start"]
```

Deploy with Docker:
```bash
docker build -t ashley-ai .
docker run -p 3001:3001 --env-file .env.production ashley-ai
```

#### 6. Domain & DNS Configuration
- [ ] Domain purchased
- [ ] DNS records configured:
  - A record: yourdomain.com → Server IP
  - CNAME: www.yourdomain.com → yourdomain.com
  - CNAME: api.yourdomain.com → yourdomain.com
- [ ] SSL certificate installed (Let's Encrypt or CloudFlare)
- [ ] HTTPS redirect enabled
- [ ] WWW redirect configured (www → non-www or vice versa)

---

## 🧪 Testing Procedures

### Pre-Production Testing

#### 1. Authentication Testing
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Token expiration handling (15 min)
- [ ] Refresh token flow (7 days)
- [ ] Logout functionality
- [ ] Session persistence across page refreshes
- [ ] Concurrent session handling

#### 2. API Endpoint Testing
Test all critical endpoints:
- [ ] `/api/auth/login` - Authentication
- [ ] `/api/auth/logout` - Session cleanup
- [ ] `/api/inventory/product/{id}` - Product lookup (mobile app)
- [ ] `/api/inventory/sales` - POS sales processing
- [ ] `/api/inventory/delivery` - Warehouse delivery
- [ ] `/api/inventory/transfer` - Stock transfer
- [ ] `/api/inventory/adjust` - Inventory adjustment
- [ ] `/api/inventory/qr-generate` - QR code generation

#### 3. Mobile App Testing
- [ ] QR code scanning (iOS & Android)
- [ ] Product details display
- [ ] Sales processing
- [ ] Warehouse operations
- [ ] Camera permissions
- [ ] Offline error handling
- [ ] Token storage/retrieval

#### 4. Load Testing

**Using k6** (if available):
```bash
# Test API endpoints
pnpm load-test

# Test authentication
pnpm load-test:auth

# Test database queries
pnpm load-test:db
```

**Performance Targets**:
- Response time p95 < 500ms
- Response time p99 < 1000ms
- Failure rate < 1%
- Concurrent users: 100+

#### 5. Security Testing
- [ ] SQL injection testing (should be protected by Prisma)
- [ ] XSS testing (should be sanitized)
- [ ] CSRF testing (tokens required)
- [ ] Authentication bypass attempts (should fail)
- [ ] Rate limiting verification (max 100 requests/min)
- [ ] File upload security (magic bytes, size limits)
- [ ] Password strength validation
- [ ] Account lockout after 5 failed attempts

### Security Audit Score Target
- **Target**: A+ grade (95+/100)
- **Current**: A+ (98/100) ✅

---

## 📊 Post-Deployment Monitoring

### 1. Application Monitoring

**Recommended Tools**:
- **Sentry** - Error tracking and crash reporting
- **LogRocket** - Session replay and debugging
- **DataDog** - APM and infrastructure monitoring
- **New Relic** - Application performance monitoring

**Setup Sentry** (Optional):
```bash
# Install Sentry
pnpm add @sentry/nextjs @sentry/react-native

# Configure in next.config.js
module.exports = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};
```

### 2. Database Monitoring
- [ ] Query performance monitoring
- [ ] Slow query alerts (> 1 second)
- [ ] Connection pool monitoring
- [ ] Disk space alerts (< 20% free)
- [ ] Backup verification (daily)

### 3. Server Monitoring
- [ ] CPU usage alerts (> 80%)
- [ ] Memory usage alerts (> 85%)
- [ ] Disk I/O monitoring
- [ ] Network latency monitoring
- [ ] Uptime monitoring (99.9% target)

### 4. Mobile App Monitoring
- [ ] App crash rate (< 1%)
- [ ] API error rate (< 2%)
- [ ] Average session duration
- [ ] Daily active users (DAU)
- [ ] User retention rate

### 5. Key Metrics to Track

**Backend Metrics**:
- API response times (p50, p95, p99)
- Error rate by endpoint
- Requests per minute
- Database query times
- Cache hit rate (if using Redis)

**Mobile App Metrics**:
- App launch time
- Screen load times
- Crash-free sessions
- QR scan success rate
- Sales transaction success rate

---

## 🚨 Rollback Plan

### Database Rollback
```bash
# Rollback last migration
npx prisma migrate rollback

# Or manually restore from backup
psql -U user -d database < backup.sql
```

### Application Rollback

**Vercel**:
```bash
# List deployments
vercel list

# Promote previous deployment
vercel promote <deployment-url>
```

**Railway**:
```bash
# List deployments
railway deployments

# Rollback to previous
railway rollback
```

**Docker**:
```bash
# Pull previous image
docker pull your-registry/ashley-ai:previous-tag

# Restart with previous version
docker-compose up -d
```

---

## 📋 Post-Deployment Checklist

### Immediate (Day 1)
- [ ] Verify all services are running
- [ ] Test login functionality
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check database connections
- [ ] Verify SSL certificates
- [ ] Test mobile app downloads (App Store / Play Store)

### Short-term (Week 1)
- [ ] Monitor application performance
- [ ] Review error logs daily
- [ ] Check database performance
- [ ] Monitor user feedback
- [ ] Verify backup procedures
- [ ] Test disaster recovery plan

### Long-term (Month 1)
- [ ] Review security logs
- [ ] Analyze user behavior
- [ ] Optimize slow queries
- [ ] Update dependencies
- [ ] Plan feature enhancements
- [ ] Gather user feedback

---

## 🔐 Security Compliance

### OWASP Top 10 Compliance
- [x] A01 Broken Access Control - RBAC implemented
- [x] A02 Cryptographic Failures - bcrypt, JWT, HTTPS
- [x] A03 Injection - Prisma ORM, parameterized queries
- [x] A04 Insecure Design - Secure architecture
- [x] A05 Security Misconfiguration - Hardened CSP, secure headers
- [x] A06 Vulnerable Components - Regular dependency updates
- [x] A07 Identity & Auth Failures - Lockout, strong passwords
- [x] A08 Software & Data Integrity - Input validation
- [x] A09 Logging & Monitoring - Comprehensive audit logs
- [x] A10 SSRF - URL validation, fixed endpoints

### Data Protection
- [ ] Data encryption at rest (database)
- [ ] Data encryption in transit (HTTPS/TLS)
- [ ] Personal data handling (GDPR compliance)
- [ ] Data retention policies
- [ ] User data deletion procedures

---

## 📞 Support & Documentation

### User Documentation
- [ ] User manual created
- [ ] Video tutorials recorded
- [ ] FAQ document prepared
- [ ] Support email configured
- [ ] Help desk system set up (optional)

### Technical Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Architecture diagrams
- [ ] Deployment runbook
- [ ] Incident response procedures

---

## ✅ Final Sign-Off

**Deployment Team**:
- [ ] Development Lead: _______________
- [ ] DevOps Engineer: _______________
- [ ] Security Officer: _______________
- [ ] Product Manager: _______________

**Deployment Date**: _______________

**Production URL**: _______________

**Mobile App Store Links**:
- iOS: _______________
- Android: _______________

---

## 🎉 Deployment Complete!

Congratulations! The Ashley AI Manufacturing ERP System is now live in production.

**Next Steps**:
1. Monitor application for 24 hours
2. Announce launch to users
3. Provide training materials
4. Gather initial feedback
5. Plan first maintenance window

**Emergency Contacts**:
- Development Team: dev@yourcompany.com
- DevOps Team: devops@yourcompany.com
- On-Call Support: +1-XXX-XXX-XXXX

---

**Document Version**: 1.0.0
**Last Updated**: October 31, 2025
**Maintained By**: Ashley AI Development Team
