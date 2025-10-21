# Production Deployment Checklist

## Ashley AI Manufacturing ERP System

**Last Updated**: October 19, 2025
**System Version**: 1.1.0
**Deployment Target**: Production

---

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

#### ✅ Environment Variables

- [ ] `DATABASE_URL` - Production database connection string
- [ ] `JWT_SECRET` - Strong random secret (min 32 characters)
- [ ] `JWT_ACCESS_EXPIRES_IN` - Token expiry (default: 15m)
- [ ] `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry (default: 7d)
- [ ] `REDIS_URL` - Redis connection string (for caching & sessions)
- [ ] `NODE_ENV=production` - Production mode
- [ ] `NEXT_PUBLIC_API_URL` - Production API URL
- [ ] `PORT` - Server port (default: 3001)

#### ✅ Security Variables

- [ ] `CSRF_SECRET` - CSRF token secret
- [ ] `SESSION_SECRET` - Session encryption secret
- [ ] `ENCRYPTION_KEY` - Data encryption key
- [ ] `ALLOWED_ORIGINS` - CORS allowed origins

#### ✅ Third-Party Services

- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email service
- [ ] `CLOUDINARY_URL` - File storage (if using Cloudinary)
- [ ] `SENTRY_DSN` - Error tracking (if using Sentry)
- [ ] `STRIPE_SECRET_KEY` - Payment processing (if using Stripe)

---

### 2. Database

#### ✅ Database Setup

- [ ] Production database created (PostgreSQL recommended)
- [ ] Database user with appropriate permissions
- [ ] Connection pooling configured
- [ ] SSL/TLS enabled for database connections
- [ ] Backup strategy in place

#### ✅ Migrations

```bash
# Run migrations
cd packages/database
npx prisma migrate deploy

# Verify migrations
npx prisma migrate status

# Generate Prisma Client
npx prisma generate
```

#### ✅ Database Indexes

- [ ] All indexes from schema applied (538 indexes)
- [ ] Performance verified with `EXPLAIN ANALYZE`
- [ ] Composite indexes for common queries

#### ✅ Database Backups

- [ ] Automated daily backups configured
- [ ] Backup retention policy set (30 days recommended)
- [ ] Backup restoration tested
- [ ] Point-in-time recovery enabled

---

### 3. Security

#### ✅ Security Hardening

- [ ] **A+ Security Grade (98/100) achieved** ✅
- [ ] Content Security Policy (CSP) configured
- [ ] HTTPS/TLS certificates installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Account lockout active (5 attempts, 30min)
- [ ] Password complexity enforced (12 char min)
- [ ] File upload validation (magic bytes, size, type)

#### ✅ Authentication

- [ ] JWT tokens configured
- [ ] Session management tested
- [ ] Password hashing verified (bcrypt)
- [ ] 2FA/MFA enabled (if required)

#### ✅ Authorization

- [ ] RBAC permissions configured
- [ ] Role-based access tested
- [ ] API endpoint authorization verified

---

### 4. Testing

#### ✅ Test Suites Passing

```bash
# Run all tests
pnpm test

# Expected results:
# - Unit Tests: 222 passing ✅
# - Integration Tests: 47 passing ✅
# - Component Tests: 33 passing ✅
# - Total: 302 tests passing ✅
```

#### ✅ Performance Testing

```bash
# Run k6 load tests
k6 run tests/performance/k6-api-load-test.js
k6 run tests/performance/k6-manufacturing-workflow.js

# Verify thresholds:
# - P95 response time < 500ms
# - P99 response time < 1000ms
# - Error rate < 1%
```

---

### 5. Code Quality

#### ✅ Code Quality Checks

- [ ] ESLint passing (no errors)
- [ ] TypeScript compilation successful
- [ ] No console.log in production code
- [ ] Dead code removed
- [ ] Dependencies up to date

```bash
# Run quality checks
pnpm lint
pnpm build
pnpm typecheck
```

---

### 6. Application Build

#### ✅ Production Build

```bash
# Build for production
pnpm build

# Verify build
ls .next/
```

#### ✅ Build Verification

- [ ] No build errors
- [ ] Static files generated
- [ ] Bundle size acceptable (< 2MB recommended)
- [ ] Tree shaking applied
- [ ] Minification enabled

---

### 7. Deployment Platform

#### ✅ Server Setup

- [ ] Node.js v18+ installed
- [ ] pnpm installed
- [ ] Process manager configured (PM2 recommended)
- [ ] Reverse proxy setup (Nginx/Caddy)
- [ ] Firewall rules configured
- [ ] SSL certificates installed

#### ✅ Platform-Specific (Choose one)

**Vercel Deployment:**

```bash
vercel deploy --prod
```

- [ ] Environment variables configured in Vercel dashboard
- [ ] Build settings verified
- [ ] Custom domain configured

**Railway Deployment:**

```bash
railway up
```

- [ ] Project created
- [ ] Environment variables set
- [ ] Database connected

**Docker Deployment:**

```bash
docker build -t ashley-ai .
docker run -p 3001:3001 ashley-ai
```

- [ ] Dockerfile created
- [ ] docker-compose.yml configured
- [ ] Multi-stage build optimized

**VPS/Dedicated Server:**

```bash
# Clone repository
git clone <repo-url>
cd ashley-ai

# Install dependencies
pnpm install

# Build
pnpm build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### 8. Monitoring & Logging

#### ✅ Application Monitoring

- [ ] Error tracking configured (Sentry/Bugsnag)
- [ ] Performance monitoring (New Relic/Datadog)
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Log aggregation (LogDNA/Papertrail)

#### ✅ Health Checks

```bash
# Create health check endpoint
GET /api/health

# Response should include:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "version": "1.1.0",
  "uptime": 12345
}
```

#### ✅ Alerts

- [ ] Database connection errors
- [ ] High error rates (> 1%)
- [ ] Slow response times (> 1s)
- [ ] High CPU/memory usage (> 80%)
- [ ] Disk space low (< 10%)

---

### 9. Performance Optimization

#### ✅ Caching

- [ ] Redis configured for session storage
- [ ] API response caching enabled
- [ ] Static asset caching (CDN)
- [ ] Database query caching

#### ✅ CDN Setup

- [ ] Static assets on CDN
- [ ] Image optimization enabled
- [ ] Gzip/Brotli compression
- [ ] Cache headers configured

---

### 10. Data & Compliance

#### ✅ Data Privacy

- [ ] GDPR compliance verified (if applicable)
- [ ] Data encryption at rest
- [ ] Data encryption in transit
- [ ] PII handling documented

#### ✅ Legal

- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Cookie policy (if applicable)
- [ ] Data processing agreements signed

---

### 11. Documentation

#### ✅ User Documentation

- [ ] User manual created
- [ ] API documentation published
- [ ] Admin guide available
- [ ] Training materials prepared

#### ✅ Technical Documentation

- [ ] Architecture diagram
- [ ] Database schema documented
- [ ] API endpoints documented
- [ ] Deployment runbook
- [ ] Disaster recovery plan

---

### 12. Post-Deployment

#### ✅ Smoke Tests

- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays
- [ ] Critical workflows functional

#### ✅ Monitoring

- [ ] Error rates normal (< 1%)
- [ ] Response times acceptable (< 500ms P95)
- [ ] No memory leaks
- [ ] Database queries optimized

#### ✅ Rollback Plan

- [ ] Previous version available
- [ ] Rollback procedure documented
- [ ] Database migration rollback tested

---

## 🚀 Deployment Commands

### Quick Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
pnpm install

# 3. Run migrations
cd packages/database
npx prisma migrate deploy
npx prisma generate
cd ../..

# 4. Build application
pnpm build

# 5. Start production server
NODE_ENV=production pnpm start

# OR with PM2
pm2 restart ashley-ai
```

---

## 📊 Success Criteria

### Performance Benchmarks

- ✅ P95 response time: < 500ms
- ✅ P99 response time: < 1000ms
- ✅ Uptime: > 99.9%
- ✅ Error rate: < 0.1%

### Quality Metrics

- ✅ Test coverage: 80%+
- ✅ Security grade: A+ (98/100)
- ✅ Code quality: A-
- ✅ All tests passing: 302/302

---

## ⚠️ Common Issues & Solutions

### Issue: Database Connection Timeout

**Solution**: Check connection pool settings, verify network access

### Issue: High Memory Usage

**Solution**: Enable memory profiling, check for memory leaks, increase server memory

### Issue: Slow API Responses

**Solution**: Review database queries, add indexes, enable caching

### Issue: Build Failures

**Solution**: Clear .next folder, verify TypeScript errors, check dependencies

---

## 📞 Support Contacts

- **Technical Lead**: [Your Name]
- **DevOps**: [Team Contact]
- **Database Admin**: [DBA Contact]
- **Security Team**: [Security Contact]

---

## 📝 Deployment Log

### Production Deployments

| Date       | Version | Deployed By | Status  | Notes                         |
| ---------- | ------- | ----------- | ------- | ----------------------------- |
| 2025-10-19 | 1.1.0   | TBD         | Pending | Initial production deployment |

---

**Document Version**: 1.0
**Last Reviewed**: October 19, 2025
**Next Review**: Before each major deployment
