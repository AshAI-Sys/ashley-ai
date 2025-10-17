# Ashley AI - Vercel Deployment Guide

**Last Updated**: 2025-10-17
**Status**: Ready for Production Deployment

## Quick Deploy (Automatic)

### Option 1: Deploy via Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from root directory
cd "C:\Users\Khell\Desktop\Ashley AI"
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com/new
2. **Import Git Repository**: `https://github.com/AshAI-Sys/ashley-ai`
3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `services/ash-admin`
   - **Build Command**: `cd ../.. && pnpm --filter @ash/admin build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install`
   - **Node Version**: 20.x

4. **Environment Variables** (copy from below)
5. **Click Deploy**

---

## Environment Variables for Vercel

Copy these variables to your Vercel project settings:

### 🔴 CRITICAL - Database (Required)

```bash
# PostgreSQL Database (Use Neon, Supabase, or Railway)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Example with Neon (Recommended - Free tier available):
# DATABASE_URL="postgresql://neondb_owner:npg_5YeIhqZxSlQ0@ep-cold-tooth-a15l7pq9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

**Get Free PostgreSQL Database**:
- **Neon** (Recommended): https://neon.tech - 0.5GB free, serverless, instant
- **Supabase**: https://supabase.com - 500MB free, includes auth
- **Railway**: https://railway.app - $5 credit free

### 🔴 CRITICAL - Security Secrets (Required)

```bash
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
JWT_SECRET="your-generated-jwt-secret-here"
ENCRYPTION_KEY="your-32-byte-encryption-key"

# Production URL (Change after deployment)
NEXTAUTH_URL="https://your-app-name.vercel.app"
APP_URL="https://your-app-name.vercel.app"
```

### 🟡 Application Settings

```bash
NODE_ENV="production"
PORT="3001"
APP_NAME="Ashley AI Manufacturing ERP"
LOG_LEVEL="INFO"

# IMPORTANT: Disable demo mode in production
DEMO_MODE="false"
DEFAULT_WORKSPACE_ID="production-workspace-1"
```

### 🟢 Optional - Redis Caching (Highly Recommended)

```bash
# Upstash Redis (Free tier available)
REDIS_URL="rediss://default:password@endpoint.upstash.io:6379"
```

**Get Free Redis**:
- **Upstash**: https://upstash.com - 10,000 commands/day free
- **Railway**: https://railway.app - Redis included

### 🟢 Optional - AI Features

```bash
# AI Chat Assistant (Choose one)
ASH_OPENAI_API_KEY="sk-..."
ASH_ANTHROPIC_API_KEY="sk-ant-..."
ASH_GROQ_API_KEY="gsk_..."  # FREE & FAST!
```

**Get Free AI API Keys**:
- **Groq** (Recommended): https://console.groq.com - FREE, ultra-fast
- **OpenAI**: https://platform.openai.com - $5 credit
- **Anthropic**: https://console.anthropic.com - $5 credit

### 🟢 Optional - File Uploads

```bash
# Cloudinary (Free tier: 25GB storage, 25GB bandwidth)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Get Free Storage**:
- **Cloudinary**: https://cloudinary.com/users/register/free

### 🟢 Optional - Email Notifications

```bash
# Resend (Free tier: 3,000 emails/month)
RESEND_API_KEY="re_..."
EMAIL_FROM="Ashley AI <noreply@yourdomain.com>"
```

**Get Free Email Service**:
- **Resend**: https://resend.com/signup

### 🟢 Optional - SMS Notifications (Philippine)

```bash
# Semaphore (Philippine SMS)
SEMAPHORE_API_KEY="your-api-key"
SEMAPHORE_SENDER_NAME="ASHLEY AI"

# Twilio (Global SMS)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### 🟢 Optional - Monitoring

```bash
# Sentry Error Tracking (Free tier: 5,000 errors/month)
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
```

**Get Free Monitoring**:
- **Sentry**: https://sentry.io/signup

---

## Step-by-Step Deployment

### Step 1: Prepare Database

1. **Create PostgreSQL Database** (Choose one):
   - **Neon**: https://neon.tech → Create Project → Copy connection string
   - **Supabase**: https://supabase.com → New Project → Settings → Database → Connection string
   - **Railway**: https://railway.app → New Project → Add PostgreSQL → Copy URL

2. **Copy Database URL** (looks like):
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```

### Step 2: Generate Security Secrets

```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Mac/Linux
openssl rand -base64 32
```

Run this command **3 times** to generate:
1. `NEXTAUTH_SECRET`
2. `JWT_SECRET`
3. `ENCRYPTION_KEY`

### Step 3: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import Repository**:
   - Connect GitHub account
   - Select `AshAI-Sys/ashley-ai` repository
3. **Configure Build Settings**:
   - **Root Directory**: `services/ash-admin`
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `cd ../.. && pnpm --filter @ash/admin build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`
   - **Node Version**: 20.x
4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add at minimum:
     - `DATABASE_URL` (your PostgreSQL URL)
     - `NEXTAUTH_SECRET` (generated secret)
     - `JWT_SECRET` (generated secret)
     - `ENCRYPTION_KEY` (generated secret)
     - `NEXTAUTH_URL` (will be `https://your-app.vercel.app`)
     - `APP_URL` (same as NEXTAUTH_URL)
     - `NODE_ENV` = `production`
     - `DEMO_MODE` = `false`
5. **Deploy**: Click "Deploy"

### Step 4: Run Database Migrations

After first deployment, run migrations via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migrations
vercel env pull .env.production.local
DATABASE_URL="your-production-db-url" pnpm --filter @ash-ai/database prisma migrate deploy
```

Or use Vercel's build command with migration:

```bash
# Update package.json build script:
"vercel-build": "cd ../../packages/database && pnpm exec prisma migrate deploy && pnpm exec prisma generate && cd ../../services/ash-admin && next build"
```

### Step 5: Verify Deployment

1. **Visit your site**: `https://your-app.vercel.app`
2. **Check health**: `https://your-app.vercel.app/api/health`
3. **Test login**: Use credentials from your database or create first user
4. **Monitor logs**: Vercel Dashboard → Your Project → Logs

---

## Post-Deployment Configuration

### Custom Domain (Optional)

1. **Vercel Dashboard** → Your Project → Settings → Domains
2. **Add Domain**: `yourcompany.com`
3. **Configure DNS**: Add records as shown by Vercel
4. **Update Environment Variables**:
   ```bash
   NEXTAUTH_URL="https://yourcompany.com"
   APP_URL="https://yourcompany.com"
   ```

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Production**: Push to `main` or `master` branch
- **Preview**: Push to any other branch

### Database Seeding (First Time)

```bash
# Seed initial data
DATABASE_URL="your-production-db-url" pnpm --filter @ash-ai/database prisma db seed
```

---

## Troubleshooting

### Build Fails: "Cannot find module @ash-ai/database"

**Solution**: Ensure pnpm workspace is properly configured and build command includes root:
```bash
cd ../.. && pnpm --filter @ash/admin build
```

### Database Connection Error

**Solutions**:
1. Verify `DATABASE_URL` is correct with `?sslmode=require` suffix
2. Check database is accessible from Vercel (not localhost)
3. Run migrations: `pnpm --filter @ash-ai/database prisma migrate deploy`

### Environment Variables Not Loading

**Solutions**:
1. Verify variables are added in Vercel Dashboard → Settings → Environment Variables
2. Redeploy after adding new variables
3. Ensure no quotes around values in Vercel UI

### 500 Internal Server Error

**Solutions**:
1. Check Vercel logs: Dashboard → Your Project → Logs
2. Verify all required environment variables are set
3. Check database is migrated and accessible
4. Review Sentry errors if configured

### Build Timeout

**Solutions**:
1. Upgrade to Vercel Pro for longer build times
2. Optimize build by removing unused dependencies
3. Use build cache: Vercel automatically caches `node_modules`

---

## Performance Optimization

### Enable Edge Functions (Recommended)

Create `middleware.ts` for edge runtime:
```typescript
export const config = {
  matcher: ['/api/:path*'],
  runtime: 'edge',
}
```

### Enable Vercel Analytics

```bash
# Install
pnpm add @vercel/analytics

# Add to services/ash-admin/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Enable Vercel Speed Insights

```bash
pnpm add @vercel/speed-insights

# Add to layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
```

---

## Security Checklist

- [ ] **NEW Secrets Generated**: Never use example secrets in production
- [ ] **DEMO_MODE Disabled**: Set `DEMO_MODE="false"`
- [ ] **HTTPS Enforced**: Vercel handles this automatically
- [ ] **Database SSL Required**: Use `?sslmode=require` in DATABASE_URL
- [ ] **Environment Variables Secured**: Only add to Vercel, never commit
- [ ] **CORS Configured**: Set `CORS_ORIGIN` to your domain
- [ ] **Rate Limiting Enabled**: `RATE_LIMIT_ENABLED="true"`
- [ ] **Sentry Monitoring**: Add SENTRY_DSN for error tracking
- [ ] **Backups Configured**: Enable automated database backups
- [ ] **2FA Enabled**: Set `ENABLE_2FA="true"` for admin users

---

## Monitoring & Maintenance

### Check Deployment Health

```bash
# Automated health check script
curl https://your-app.vercel.app/api/health
```

### Monitor Logs

1. **Vercel Dashboard**: Real-time logs and errors
2. **Sentry Dashboard**: Aggregated errors and performance issues
3. **Database Monitoring**: Check database provider dashboard (Neon, Supabase, etc.)

### Update Dependencies

```bash
# Check outdated packages
pnpm outdated

# Update all packages
pnpm update --latest

# Commit and push (triggers automatic deployment)
git add .
git commit -m "chore: Update dependencies"
git push
```

---

## Cost Estimates (Free Tier)

All services have free tiers sufficient for small-medium businesses:

| Service | Free Tier | Usage Limit |
|---------|-----------|-------------|
| **Vercel Hosting** | ✅ Free | 100GB bandwidth, 6,000 build minutes |
| **Neon PostgreSQL** | ✅ Free | 0.5GB storage, 3GB transfer |
| **Upstash Redis** | ✅ Free | 10,000 commands/day |
| **Cloudinary** | ✅ Free | 25GB storage, 25GB bandwidth |
| **Resend Email** | ✅ Free | 3,000 emails/month |
| **Groq AI** | ✅ Free | Unlimited requests (rate limited) |
| **Sentry Monitoring** | ✅ Free | 5,000 errors/month |

**Total Monthly Cost**: $0 (with free tiers) 🎉

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Ashley AI Issues**: https://github.com/AshAI-Sys/ashley-ai/issues

---

## Deployment Checklist

Before deploying to production:

- [ ] Database created and URL copied
- [ ] Security secrets generated (NEXTAUTH_SECRET, JWT_SECRET, ENCRYPTION_KEY)
- [ ] All required environment variables added to Vercel
- [ ] `DEMO_MODE="false"` set
- [ ] `NODE_ENV="production"` set
- [ ] Database migrations run
- [ ] Health check endpoint working
- [ ] Login functionality tested
- [ ] File uploads tested (if using Cloudinary)
- [ ] Email notifications tested (if using Resend)
- [ ] AI chat tested (if using AI providers)
- [ ] Custom domain configured (optional)
- [ ] Monitoring tools configured (Sentry, Analytics)
- [ ] Automated backups enabled
- [ ] Team members invited to Vercel project

---

**Ready to Deploy? Let's go! 🚀**

```bash
# Push to GitHub (triggers automatic Vercel deployment)
git add .
git commit -m "feat: Ready for production deployment"
git push origin master
```

Visit Vercel Dashboard to monitor deployment progress: https://vercel.com/dashboard