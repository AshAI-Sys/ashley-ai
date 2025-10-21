# Ashley AI - Production Deployment Guide

Complete guide for deploying Ashley AI to Vercel, Railway, or any cloud platform with email verification enabled.

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Vercel Deployment](#vercel-deployment)
- [Railway Deployment](#railway-deployment)
- [Email Verification Setup](#email-verification-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Post-Deployment Testing](#post-deployment-testing)
- [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have accounts for:

- ✅ **PostgreSQL Database** (Vercel Postgres, Neon, Supabase, or Railway)
- ✅ **Resend** (for email verification) - https://resend.com
- ✅ **Cloudinary** (for file uploads) - https://cloudinary.com
- ✅ **Upstash Redis** (for caching - optional) - https://upstash.com
- ✅ **Domain name** (optional, can use platform subdomain)

---

## 🚀 Vercel Deployment

### Step 1: Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. **Root Directory**: `services/ash-admin`
4. **Framework**: Next.js (auto-detected)
5. **Build Command**: `pnpm install && pnpm build`
6. **Output Directory**: `.next` (auto-detected)

### Step 2: Add Environment Variables

Go to **Settings → Environment Variables** and add these:

#### **REQUIRED** Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Security (generate using: openssl rand -base64 32)
NEXTAUTH_SECRET=<your-secret-here>
JWT_SECRET=<your-secret-here>
ENCRYPTION_KEY=<generate-using-openssl-rand-hex-32>

# Application URL (CRITICAL for email verification)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app

# Email Verification (REQUIRED)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Ashley AI <noreply@yourdomain.com>

# Features
ENABLE_2FA=true
ENABLE_EMAIL_NOTIFICATIONS=true

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### **RECOMMENDED** Variables

```bash
# Redis Caching
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379

# Error Tracking
SENTRY_DSN=https://xxx@xxx.sentry.io/xxx
```

### Step 3: Deploy

1. Click **Deploy**
2. Wait for build (~3-5 minutes)
3. Visit deployment URL
4. Run database migrations (see [Database Setup](#database-setup))

---

## 🚂 Railway Deployment

### Step 1: Create Project

1. Go to [railway.app](https://railway.app/new)
2. **Deploy from GitHub repo**
3. Select your repository
4. **Root directory**: Leave empty (Railway auto-detects monorepo)

### Step 2: Add PostgreSQL

1. Click **+ New** → **Database** → **PostgreSQL**
2. Railway auto-generates `DATABASE_URL`

### Step 3: Configure Service

1. Select the `ash-admin` service
2. **Settings** → **Root Directory**: `services/ash-admin`
3. **Deploy**

### Step 4: Add Environment Variables

Go to **Variables** tab:

```bash
# Database (auto-provided by Railway Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security
NEXTAUTH_SECRET=<generate-with-openssl>
JWT_SECRET=<generate-with-openssl>
ENCRYPTION_KEY=<generate-with-openssl-hex>

# Application URL (Railway auto-provides domain)
NEXT_PUBLIC_APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}

# Email Verification (REQUIRED)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Ashley AI <noreply@yourdomain.com>

# Features
ENABLE_2FA=true
ENABLE_EMAIL_NOTIFICATIONS=true
NODE_ENV=production

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 5: Deploy

Railway auto-deploys on push. Monitor at: **Deployments** tab

---

## 📧 Email Verification Setup

### Critical Configuration

Email verification **WILL NOT WORK** without these variables:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx     # Get from https://resend.com
EMAIL_FROM=noreply@yourdomain.com  # Must match verified domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Your production URL
```

### Resend Setup

1. **Sign up** at [resend.com](https://resend.com)
2. **Get API Key**:
   - Dashboard → API Keys → Create API Key
   - Copy key (starts with `re_`)
3. **Verify Domain**:
   - Dashboard → Domains → Add Domain
   - Add DNS records (Resend provides these):
     ```
     MX    @    feedback-smtp.us-east-1.amazonses.com    10
     TXT   @    "v=spf1 include:amazonses.com ~all"
     CNAME resend._domainkey    resend._domainkey.amazonses.com
     ```
   - Wait 5-10 minutes for verification
4. **Test Sending**:
   - Domains → Select domain → Send Test Email

### Email Templates

Ashley AI includes pre-built email templates:

- ✅ Welcome email with verification link
- ✅ Email verification reminder
- ✅ Password reset email
- ✅ 2FA setup email with backup codes

All templates are in: `services/ash-admin/src/lib/email.ts`

---

## 🔧 Environment Variables

### Generate Secrets

Use these commands to generate secure values:

```bash
# NEXTAUTH_SECRET and JWT_SECRET (base64)
openssl rand -base64 32

# ENCRYPTION_KEY (hex, 32 bytes for AES-256)
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Required Services

#### 1. PostgreSQL Database

**Options:**

- **Vercel Postgres** (Vercel native, auto-configures)
- **Neon** (https://neon.tech) - Serverless PostgreSQL
- **Supabase** (https://supabase.com) - PostgreSQL + Auth + Storage
- **Railway Postgres** (Railway native, auto-configures)

**Connection String Format:**

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**Free Tiers:**

- Vercel Postgres: 256MB, 60 hours compute
- Neon: 0.5GB storage, shared compute
- Supabase: 500MB database, 50,000 requests/month

#### 2. Resend (Email Service)

**Required for email verification**

- **Website**: https://resend.com
- **Free Tier**: 100 emails/day, 3,000/month
- **Pricing**: $0.10 per 1,000 emails after free tier

**Setup:**

1. Sign up and verify domain
2. Get API key
3. Add to `RESEND_API_KEY` environment variable

#### 3. Cloudinary (File Storage)

**Required for logo uploads**

- **Website**: https://cloudinary.com
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Pricing**: Pay-as-you-go after free tier

**Setup:**

1. Sign up for account
2. Get credentials from dashboard (Cloud Name, API Key, API Secret)
3. Add to environment variables

#### 4. Upstash Redis (Caching)

**Optional but recommended for performance**

- **Website**: https://upstash.com
- **Free Tier**: 10,000 requests/day
- **Use Cases**: Rate limiting, session caching, API response caching

**Setup:**

1. Create Redis database (choose region near your app)
2. Copy connection string (starts with `rediss://`)
3. Add to `REDIS_URL` environment variable

---

## 🗄️ Database Setup

### Initialize Database

After deploying, run database migrations:

#### Vercel

```bash
# Pull environment variables
vercel env pull

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

#### Railway

```bash
# Using Railway CLI
railway run npx prisma db push

# Or configure in Settings → Deploy → Deploy Command
npx prisma db push && npm start
```

### Create Admin Account

1. Visit your deployed app: `https://your-app.vercel.app/register`
2. Fill in workspace and admin details:
   - **Workspace Name**: Your company name
   - **Workspace Slug**: URL-friendly identifier (auto-generated)
   - **Admin Email**: Your email address
   - **Password**: Strong password (8+ chars, uppercase, lowercase, number)
3. Click **Create Admin Account**
4. Check your email inbox for verification link
5. Click verification link
6. Login at `/login`

---

## ✅ Post-Deployment Testing

### Email Verification Flow Test

1. **Register Account**:
   - Go to `/register`
   - Fill in all fields
   - Submit form
2. **Check Email**:
   - Look for email from `noreply@yourdomain.com`
   - Check spam folder if not in inbox
3. **Click Verification Link**:
   - Opens `/verify-email?token=xxx`
   - Should show "Email Verified!" message
   - Auto-redirects to login after 3 seconds
4. **Login**:
   - Use email and password from registration
   - Should successfully access dashboard

### Checklist

- [ ] Homepage loads (`/`)
- [ ] Login page works (`/login`)
- [ ] Registration works (`/register`)
- [ ] Email verification received (check inbox + spam)
- [ ] Verification link works (`/verify-email?token=xxx`)
- [ ] Login succeeds after verification
- [ ] Dashboard loads (`/dashboard`)
- [ ] Database queries work (create order, add client)
- [ ] File uploads work (workspace logo in settings)
- [ ] Error tracking works (if Sentry configured)

---

## 🔍 Troubleshooting

### Email Verification Not Sending

**Check:**

```bash
✅ RESEND_API_KEY is set correctly (starts with re_)
✅ EMAIL_FROM matches verified domain in Resend
✅ NEXT_PUBLIC_APP_URL is your production domain
✅ Domain is verified in Resend dashboard
```

**Common Issues:**

- **Domain not verified**: Check Resend dashboard, DNS records may need time to propagate
- **Wrong EMAIL_FROM**: Must match verified domain (e.g., `noreply@yourdomain.com`)
- **Wrong BASE_URL**: Verification links will point to wrong domain

**Debug:**

```bash
# Check deployment logs for email errors
vercel logs --follow  # Vercel
railway logs          # Railway

# Look for:
"✅ Email sent successfully"  # Success
"❌ Failed to send email"     # Failure - check error message
```

### Emails Going to Spam

**Fix:**

1. Complete SPF/DKIM setup in Resend (done automatically)
2. Add DMARC record to DNS:
   ```
   TXT  _dmarc  "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
   ```
3. Warm up sending (start with low volume, increase gradually)
4. Test email deliverability at https://www.mail-tester.com

### Database Connection Errors

**Check:**

```bash
✅ DATABASE_URL is correct format
✅ Database accepts connections from deployment platform IPs
✅ SSL mode is required (?sslmode=require)
✅ Prisma client is generated
```

**Common Issues:**

- **Connection refused**: Database may require IP whitelisting
- **SSL error**: Add `?sslmode=require` to connection string
- **Timeout**: Database may be paused (free tiers auto-sleep)

**Vercel-specific:**

```bash
# Use Vercel Postgres for seamless integration
# Or whitelist Vercel IPs in external database
```

**Railway-specific:**

```bash
# Use Railway Postgres for seamless integration
# Or use private networking if database is in Railway
```

### Build Failures

**Check build logs:**

```bash
vercel logs --output  # Vercel
railway logs          # Railway
```

**Common fixes:**

- **Missing dependencies**: Ensure `pnpm install` runs before build
- **TypeScript errors**: Fix type errors in code
- **Environment variables**: Ensure required vars are set for build
- **Out of memory**: Increase build memory (Vercel Pro, Railway paid plans)

### Missing Environment Variables

**Symptoms:**

- "NEXTAUTH_SECRET must be provided"
- "DATABASE_URL is required"
- Emails not sending (no error, just silent failure)

**Fix:**

1. Check variables are set in deployment platform dashboard
2. Ensure variables are set for **Production** environment
3. Redeploy after adding new variables
4. Use correct variable names (case-sensitive)

---

## 📊 Performance Optimization

### Vercel

1. **Use Edge Functions** for static routes:

   ```ts
   export const config = {
     runtime: "edge",
   };
   ```

2. **Enable ISR** (Incremental Static Regeneration):

   ```ts
   export const revalidate = 60; // Revalidate every 60 seconds
   ```

3. **Optimize Images**:
   ```tsx
   import Image from "next/image";
   <Image src="..." alt="..." width={500} height={300} />;
   ```

### Railway

1. **Use Railway Volumes** for persistent data
2. **Monitor Metrics**: CPU, Memory, Network in dashboard
3. **Enable Autoscaling** (available on paid plans)

### Both Platforms

1. **Redis Caching**: Cache database queries, API responses
2. **Database Indexing**: Ensure proper indexes on frequently queried columns
3. **CDN**: Use Cloudinary's CDN for images
4. **Compression**: Enable gzip/brotli (auto-enabled by Next.js)

---

## 🔒 Security Best Practices

1. ✅ **Never commit secrets** to Git (use `.env.local`, add to `.gitignore`)
2. ✅ **Use different secrets** for development and production
3. ✅ **Enable 2FA** in production (`ENABLE_2FA=true`)
4. ✅ **Use HTTPS only** (enforced by Vercel/Railway)
5. ✅ **Enable Sentry** for error tracking and monitoring
6. ✅ **Regular security audits**: `pnpm audit`, fix vulnerabilities
7. ✅ **Keep dependencies updated**: Use Dependabot or Renovate
8. ✅ **Rate limiting**: Enabled by default via middleware
9. ✅ **SQL injection protection**: Prisma uses parameterized queries
10. ✅ **XSS protection**: Next.js sanitizes by default

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Resend Docs**: https://resend.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Upstash Docs**: https://docs.upstash.com

---

## 🆘 Getting Help

**Check deployment logs first:**

```bash
vercel logs --follow  # Vercel
railway logs          # Railway
```

**Common log locations:**

- Build errors: Build logs in platform dashboard
- Runtime errors: Function logs (Vercel) or Service logs (Railway)
- Database errors: Check Prisma client errors
- Email errors: Look for Resend API errors

**Still stuck?**

1. Review this guide's troubleshooting section
2. Check platform status pages (status.vercel.com, railway.app/status)
3. Contact platform support (Vercel/Railway have excellent support)
4. Review Ashley AI codebase for specific implementation details

---

**Last Updated**: 2025-10-21
**Version**: 1.0.0
**Ashley AI Manufacturing ERP**
