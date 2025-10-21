# Vercel Deployment Guide - Ashley AI Manufacturing ERP

**Status**: Ready to Deploy ✅
**Last Updated**: 2025-10-16
**Estimated Time**: 15-20 minutes

---

## Prerequisites Checklist

- ✅ Vercel CLI installed (v48.2.0)
- ✅ Logged into Vercel (ashaisystem-1783)
- ✅ Code committed and pushed to GitHub
- ✅ All 15 manufacturing stages implemented
- ⚠️ Need: Production PostgreSQL database
- ⚠️ Need: Production Redis instance
- ⚠️ Need: Environment variables configured

---

## Step 1: Set Up Production Database (Neon PostgreSQL)

### Option A: Neon (Recommended - Free Tier)

1. **Sign up for Neon**: https://neon.tech/
2. **Create a new project**:
   - Project name: `ashley-ai-production`
   - Region: Choose closest to your users (e.g., `Singapore`, `US East`)
   - PostgreSQL version: 16 (latest)
3. **Get connection string**:
   - Go to Dashboard → Connection Details
   - Copy the **Connection string** (starts with `postgresql://`)
   - Example: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **Save for later**: You'll need this for Vercel environment variables

### Option B: Supabase (Alternative - Free Tier)

1. **Sign up**: https://supabase.com/
2. **Create new project**:
   - Project name: `ashley-ai-production`
   - Database password: (generate strong password)
   - Region: Choose closest to your users
3. **Get connection string**:
   - Go to Project Settings → Database
   - Copy **Connection string** (Transaction mode)
   - Replace `[YOUR-PASSWORD]` with your actual password
4. **Save for later**

### Option C: Railway (Alternative - $5/month credit free)

1. **Sign up**: https://railway.app/
2. **Create new project** → Add PostgreSQL
3. **Get connection string**:
   - Click on PostgreSQL → Connect
   - Copy **DATABASE_URL**
4. **Save for later**

---

## Step 2: Set Up Production Redis (Upstash)

### Upstash Redis (Recommended - Free Tier)

1. **Sign up**: https://upstash.com/
2. **Create database**:
   - Name: `ashley-ai-cache`
   - Type: **Redis**
   - Region: Choose closest to your Vercel deployment
   - Eviction: `allkeys-lru` (recommended)
3. **Get connection string**:
   - Go to database details
   - Copy **TLS (SSL) Connection String** (starts with `rediss://`)
   - Example: `rediss://default:pass@xxx.upstash.io:6379`
4. **Save for later**

---

## Step 3: Generate Security Secrets

Run these commands to generate production secrets:

```bash
# JWT Secret (64 bytes)
openssl rand -base64 64

# NextAuth Secret (32 bytes)
openssl rand -base64 32

# Encryption Key (32 bytes)
openssl rand -base64 32

# CSRF Secret (32 bytes)
openssl rand -base64 32
```

**Save all outputs** - you'll need them for environment variables.

---

## Step 4: Configure Vercel Project

### A. Link GitHub Repository

```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
vercel link
```

**Answer the prompts**:

- Set up and deploy: `Yes`
- Which scope: `ashaisystem-1783`
- Link to existing project: `No` (create new)
- Project name: `ashley-ai-admin` (or your preferred name)
- Directory: `./` (current directory)

### B. Configure Build Settings

Vercel will auto-detect Next.js. Confirm these settings:

- **Framework**: Next.js
- **Build Command**: `pnpm run build` or `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` or `npm install`
- **Root Directory**: `services/ash-admin` (if deploying from monorepo root)

---

## Step 5: Set Production Environment Variables

You have two options:

### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/ashaisystem-1783/ashley-ai-admin/settings/environment-variables
2. Add each variable below (one by one):

```env
# DATABASE (from Step 1)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# REDIS (from Step 2)
REDIS_URL=rediss://default:pass@xxx.upstash.io:6379

# SECURITY (from Step 3)
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=https://ashley-ai-admin.vercel.app
JWT_SECRET=<your-generated-secret>
ENCRYPTION_KEY=<your-generated-secret>

# APPLICATION
NODE_ENV=production
PORT=3001
APP_NAME=Ashley AI Manufacturing ERP
APP_URL=https://ashley-ai-admin.vercel.app
LOG_LEVEL=INFO

# WORKSPACE & DEMO
DEFAULT_WORKSPACE_ID=demo-workspace-1
DEMO_MODE=false

# FEATURES
ENABLE_2FA=false
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_SMS_NOTIFICATIONS=false

# RATE LIMITING
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://ashley-ai-admin.vercel.app
CORS_CREDENTIALS=true

# FEATURE FLAGS
FEATURE_AI_CHAT=true
FEATURE_PWA=true
FEATURE_OFFLINE_MODE=false
FEATURE_REAL_TIME_UPDATES=true
```

**Important**: Set these for **Production**, **Preview**, and **Development** environments.

### Option B: Via CLI

```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

# Add each variable
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add NEXTAUTH_SECRET production
# ... (repeat for all variables)
```

---

## Step 6: Run Database Migrations

Before deploying, ensure your production database has the correct schema:

```bash
# Set production DATABASE_URL temporarily
set DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Go to database package
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database"

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull

# Optional: Seed production data
npx prisma db seed
```

---

## Step 7: Deploy to Vercel

### Deploy to Production

```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

# Deploy to production
vercel --prod
```

This will:

1. ✅ Build your Next.js app
2. ✅ Upload to Vercel
3. ✅ Assign production domain
4. ✅ Return live URL

**Expected Output**:

```
🔍 Inspect: https://vercel.com/ashaisystem-1783/ashley-ai-admin/...
✅ Production: https://ashley-ai-admin.vercel.app [deployed]
```

---

## Step 8: Verify Deployment

### Test Critical Endpoints

1. **Homepage**: https://ashley-ai-admin.vercel.app/
2. **Login**: https://ashley-ai-admin.vercel.app/login
3. **Dashboard**: https://ashley-ai-admin.vercel.app/dashboard (after login)
4. **Health Check**: https://ashley-ai-admin.vercel.app/api/health

### Check Logs

```bash
vercel logs --prod
```

Or visit: https://vercel.com/ashaisystem-1783/ashley-ai-admin/logs

---

## Step 9: Configure Custom Domain (Optional)

If you have a custom domain:

```bash
vercel domains add yourdomain.com
```

Then update DNS:

- **Type**: CNAME
- **Name**: @ (or subdomain)
- **Value**: cname.vercel-dns.com

---

## Post-Deployment Checklist

- [ ] Site loads: https://ashley-ai-admin.vercel.app
- [ ] Login works with demo credentials
- [ ] Dashboard displays correctly
- [ ] API endpoints respond (check /api/health)
- [ ] Database connection successful
- [ ] Redis cache working
- [ ] No console errors in browser
- [ ] Mobile responsive check
- [ ] PWA installation prompt appears

---

## Troubleshooting

### Build Fails

**Error**: Module not found

- **Fix**: Check `package.json` has all dependencies
- Run locally: `pnpm run build` to verify

**Error**: Environment variable not set

- **Fix**: Add missing variables in Vercel dashboard

### Database Connection Fails

**Error**: `P1001: Can't reach database server`

- **Fix**: Check DATABASE_URL is correct
- Ensure `?sslmode=require` is in connection string
- Verify database is accessible from external IPs (not localhost)

### Redis Connection Fails

**Error**: `ECONNREFUSED` or timeout

- **Fix**: Check REDIS_URL is correct
- Ensure using `rediss://` (with double 's' for SSL)
- Verify Upstash database is active

### 500 Internal Server Error

- Check Vercel logs: `vercel logs --prod`
- Verify all required environment variables are set
- Check database migrations ran successfully

---

## Rollback Plan

If deployment fails:

```bash
# Rollback to previous deployment
vercel rollback

# Or specify deployment ID
vercel rollback <deployment-id>
```

---

## Cost Estimate (Free Tier)

- **Vercel Hosting**: Free (Hobby plan)
  - 100GB bandwidth/month
  - Unlimited deployments
  - Custom domains (1)

- **Neon PostgreSQL**: Free
  - 512 MB storage
  - 1 project
  - 1 branch

- **Upstash Redis**: Free
  - 10,000 commands/day
  - 256 MB storage

**Total Cost**: $0/month (within free tier limits)

**Upgrade When**:

- Traffic > 100GB/month
- Database > 512 MB
- Redis > 10K commands/day

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Upstash Docs**: https://docs.upstash.com/redis
- **Prisma Docs**: https://www.prisma.io/docs

---

## Summary

✅ **Production-Ready Deployment**
✅ **Free Tier Available**
✅ **15-20 Minutes Setup Time**
✅ **Automatic CI/CD from GitHub**
✅ **Global CDN (Edge Network)**
✅ **Zero Downtime Deployments**

**Next Steps**: Follow Steps 1-8 above to deploy your Ashley AI Manufacturing ERP to production! 🚀
