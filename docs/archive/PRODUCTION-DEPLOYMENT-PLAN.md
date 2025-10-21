# Ashley AI - Production Deployment Plan

**Goal:** Transform Ashley AI into a production-ready, real-world website

---

## 🎯 Phase 1: Critical Production Features (Week 1-2)

### Priority 1: Security & Authentication

#### ✅ **Task 1.1: Implement 2FA (Two-Factor Authentication)**

**Estimated Time:** 2-3 days

**What to do:**

1. Install packages:

   ```bash
   pnpm add qrcode speakeasy
   pnpm add -D @types/qrcode @types/speakeasy
   ```

2. Create 2FA setup page:
   - `/settings/security` - Enable/disable 2FA
   - Generate QR code for Google Authenticator
   - Show backup codes

3. Modify login flow:
   - After password → Ask for 2FA code
   - Verify TOTP token
   - Allow backup code usage

4. Database already ready ✅

**Files to create:**

- `services/ash-admin/src/app/settings/security/page.tsx`
- `services/ash-admin/src/lib/2fa.ts`
- `services/ash-admin/src/app/api/auth/2fa/setup/route.ts`
- `services/ash-admin/src/app/api/auth/2fa/verify/route.ts`

---

#### ✅ **Task 1.2: Enhance Security Headers**

**Estimated Time:** 1 day

**What to do:**

1. Add security headers in `next.config.js`:

   ```js
   headers: [
     {
       source: "/:path*",
       headers: [
         { key: "X-DNS-Prefetch-Control", value: "on" },
         { key: "Strict-Transport-Security", value: "max-age=31536000" },
         { key: "X-Frame-Options", value: "SAMEORIGIN" },
         { key: "X-Content-Type-Options", value: "nosniff" },
         { key: "Referrer-Policy", value: "origin-when-cross-origin" },
       ],
     },
   ];
   ```

2. Enable CSRF protection
3. Configure rate limiting for production
4. Add request ID tracking

---

### Priority 2: File Storage & Media

#### ✅ **Task 2.1: Setup Cloud Storage (AWS S3 or Cloudinary)**

**Estimated Time:** 1 day

**Options:**

**Option A: AWS S3 (Recommended for production)**

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Option B: Cloudinary (Easier, has free tier)**

```bash
pnpm add cloudinary next-cloudinary
```

**Implementation:**

1. Create upload API endpoint: `/api/upload`
2. Generate signed URLs for secure uploads
3. Store URLs in database
4. Add image optimization

---

#### ✅ **Task 2.2: Complete Photo Upload for QC Defects**

**Estimated Time:** 1 day

**What to do:**

1. Add camera/file input in QC inspection form
2. Upload to S3/Cloudinary
3. Save URL to `photo_urls` field
4. Display photos in defect details
5. Add image viewer/lightbox

**Files to update:**

- `services/ash-admin/src/app/quality-control/[id]/page.tsx`
- Add photo gallery component

---

### Priority 3: Database & Infrastructure

#### ✅ **Task 3.1: Migrate to Production Database (PostgreSQL)**

**Estimated Time:** 1 day

**Why:** SQLite is for development only, PostgreSQL for production

**Steps:**

1. Setup PostgreSQL database:
   - **Option A:** Neon.tech (Free tier, serverless)
   - **Option B:** Supabase (Free tier, includes auth)
   - **Option C:** Railway.app (Paid, $5/month)

2. Update `schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run migration:

   ```bash
   cd packages/database
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Seed production data
5. Test connections

---

#### ✅ **Task 3.2: Setup Automated Backups**

**Estimated Time:** 0.5 day

**For PostgreSQL:**

- Neon/Supabase: Automatic backups included ✅
- Railway: Configure daily backups
- Custom: Setup cron job with `pg_dump`

**For File Storage:**

- S3: Enable versioning
- Cloudinary: Automatic backups included

---

## 🚀 Phase 2: Deployment & Hosting (Week 2-3)

### Priority 4: Choose Hosting Platform

#### **Recommended: Vercel (Easiest for Next.js)**

**Pros:**

- ✅ Zero-config Next.js deployment
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN
- ✅ Free tier available
- ✅ Preview deployments
- ✅ Environment variables UI

**Setup:**

1. Push code to GitHub
2. Connect Vercel to repository
3. Configure environment variables
4. Deploy with one click

**Alternative Options:**

- **Railway.app** - Full-stack hosting (DB + App)
- **AWS Amplify** - Enterprise-grade
- **DigitalOcean App Platform** - Developer-friendly

---

#### ✅ **Task 4.1: Prepare for Vercel Deployment**

**Estimated Time:** 1 day

**Files to create/update:**

1. **vercel.json** (root):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "services/ash-admin/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "services/ash-portal/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/admin/(.*)",
      "dest": "services/ash-admin/$1"
    },
    {
      "src": "/portal/(.*)",
      "dest": "services/ash-portal/$1"
    },
    {
      "src": "/(.*)",
      "dest": "services/ash-admin/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "ASH_OPENAI_API_KEY": "@openai_api_key"
  }
}
```

2. **Update package.json scripts:**

```json
{
  "scripts": {
    "build": "pnpm run build:admin && pnpm run build:portal",
    "build:admin": "cd services/ash-admin && pnpm build",
    "build:portal": "cd services/ash-portal && pnpm build",
    "start": "pnpm --filter @ash/admin start"
  }
}
```

---

### Priority 5: Domain & SSL

#### ✅ **Task 5.1: Setup Custom Domain**

**Estimated Time:** 0.5 day

**Options:**

1. **Buy domain:** Namecheap, GoDaddy, Google Domains
   - Recommended: `ashleyai.app` or `yourbusiness.com`

2. **Free subdomain options:**
   - `yourapp.vercel.app` (temporary)
   - `yourapp.railway.app`

3. **Configure DNS:**
   - Point A record to Vercel/Railway
   - Add CNAME for www
   - Wait for DNS propagation (24-48 hours)

4. **SSL Certificate:**
   - Vercel: Automatic ✅
   - Railway: Automatic ✅
   - Custom: Let's Encrypt

---

### Priority 6: Environment Configuration

#### ✅ **Task 6.1: Setup Production Environment Variables**

**Estimated Time:** 0.5 day

**Required Environment Variables:**

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/ashleyai"

# Security
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="https://yourdomain.com"
JWT_SECRET="another-secret-key"
ENCRYPTION_KEY="32-byte-encryption-key"

# AI Chat
ASH_OPENAI_API_KEY="sk-proj-your-key"
# OR
ASH_ANTHROPIC_API_KEY="sk-ant-your-key"

# File Storage
AWS_REGION="ap-southeast-1"
AWS_BUCKET="ashley-ai-files"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
# OR Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="production"
APP_URL="https://yourdomain.com"
```

**Where to add:**

- Vercel: Dashboard → Project → Settings → Environment Variables
- Railway: Dashboard → Variables tab
- `.env.production` for self-hosted

---

## 🛡️ Phase 3: Monitoring & Optimization (Week 3-4)

### Priority 7: Error Tracking & Monitoring

#### ✅ **Task 7.1: Setup Sentry (Error Tracking)**

**Estimated Time:** 1 day

```bash
pnpm add @sentry/nextjs
```

**Benefits:**

- Real-time error alerts
- Stack traces
- User context
- Performance monitoring

**Setup:**

1. Create account at sentry.io
2. Get DSN
3. Add to `sentry.client.config.js` and `sentry.server.config.js`
4. Test error reporting

---

#### ✅ **Task 7.2: Setup Application Monitoring**

**Estimated Time:** 0.5 day

**Options:**

**Option A: Vercel Analytics** (Built-in)

- Page views
- Web vitals
- Performance metrics

**Option B: Google Analytics**

```bash
pnpm add @next/third-parties
```

**Option C: PostHog** (Product analytics)

- User behavior tracking
- Feature flags
- A/B testing

---

### Priority 8: Performance Optimization

#### ✅ **Task 8.1: Optimize Images**

**Estimated Time:** 1 day

1. Use Next.js Image component everywhere
2. Configure image domains in `next.config.js`
3. Add blur placeholders
4. Lazy load images

#### ✅ **Task 8.2: Enable Caching**

**Estimated Time:** 0.5 day

1. Setup Redis for session storage:
   - Upstash (Free tier)
   - Railway Redis

2. Cache API responses
3. Configure stale-while-revalidate
4. Add CDN caching headers

---

## 📋 Phase 4: Testing & Launch (Week 4)

### Priority 9: Pre-Launch Checklist

#### ✅ **Task 9.1: Security Audit**

- [ ] Enable 2FA for all admin accounts
- [ ] Remove demo/test accounts
- [ ] Change all default passwords
- [ ] Review RBAC permissions
- [ ] Test rate limiting
- [ ] Check for exposed API keys
- [ ] Verify HTTPS everywhere

#### ✅ **Task 9.2: Data Migration**

- [ ] Backup SQLite data
- [ ] Migrate to PostgreSQL
- [ ] Verify data integrity
- [ ] Test all features with production data
- [ ] Setup automated backups

#### ✅ **Task 9.3: Performance Testing**

- [ ] Load testing (k6 or Artillery)
- [ ] Test with 100+ concurrent users
- [ ] Verify API response times < 300ms
- [ ] Check database query performance
- [ ] Optimize slow queries

#### ✅ **Task 9.4: User Acceptance Testing (UAT)**

- [ ] Create test accounts for beta users
- [ ] Document test scenarios
- [ ] Get feedback from real users
- [ ] Fix critical bugs
- [ ] Update documentation

#### ✅ **Task 9.5: Documentation**

- [ ] User manual/guide
- [ ] Admin documentation
- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## 🎉 Phase 5: Launch! (Week 5)

### Launch Day Checklist

1. **Final Deployment**
   - [ ] Deploy to production
   - [ ] Verify all environment variables
   - [ ] Test all critical features
   - [ ] Monitor error rates

2. **DNS & Domain**
   - [ ] Verify domain is live
   - [ ] SSL certificate active
   - [ ] All redirects working

3. **Monitoring**
   - [ ] Sentry receiving errors
   - [ ] Analytics tracking users
   - [ ] Uptime monitoring active
   - [ ] Alert system configured

4. **Communication**
   - [ ] Announce to users
   - [ ] Send access instructions
   - [ ] Provide support channels
   - [ ] Monitor feedback

---

## 💰 Cost Estimate (Monthly)

### Free Tier Setup (Good for small business):

- **Hosting:** Vercel Free ($0)
- **Database:** Neon/Supabase Free ($0)
- **Storage:** Cloudinary Free ($0)
- **Error Tracking:** Sentry Free ($0)
- **Domain:** $10-15/year (~$1/month)
- **Total:** ~$1/month

### Production Setup (Recommended):

- **Hosting:** Vercel Pro ($20)
- **Database:** Railway PostgreSQL ($10)
- **Storage:** AWS S3 ($5-10)
- **Error Tracking:** Sentry Team ($29)
- **Domain:** $15/year (~$1)
- **Total:** ~$65-70/month

### Enterprise Setup:

- **Hosting:** Vercel Enterprise ($150+)
- **Database:** AWS RDS ($50+)
- **Storage:** AWS S3 ($20+)
- **Monitoring:** Datadog ($100+)
- **Total:** $320+/month

---

## 📞 Immediate Next Steps

**Question para sa'yo:**

1. **Domain:** May domain ka na ba? Or bibili pa?
2. **Budget:** Anong budget monthly? (Free, $50, $100+)
3. **Timeline:** Kailan mo kailangan live? (1 week, 2 weeks, 1 month)
4. **Priority features:** Ano priority? 2FA? Photo upload? 3PL?

**Based sa sagot mo, I'll create a specific action plan!** 🚀

---

**Generated:** October 2, 2025
**For:** Ashley AI Production Deployment
