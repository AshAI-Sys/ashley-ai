# Vercel Deployment Guide for Ashley AI

## Quick Setup Steps

### 1. Create PostgreSQL Database

**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Sign up/login
3. Create new project: "ashley-ai-production"
4. Copy the connection string

**Option B: Vercel Postgres**
1. In Vercel Dashboard → Storage → Create Database
2. Select PostgreSQL
3. Copy connection string

### 2. Configure Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables

Add these **REQUIRED** variables:

```bash
# Database (CRITICAL - Use your actual PostgreSQL URL)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Security (Generate strong secrets!)
NEXTAUTH_SECRET=your-random-32-char-secret-here
JWT_SECRET=your-jwt-secret-32-chars-minimum
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app
```

**OPTIONAL** (can add later):
```bash
# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=ashley-ai-files

# Email (Resend)
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# AI Services
OPENAI_API_KEY=sk-your-key
```

### 3. Deploy to Vercel

**Method 1: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Method 2: GitHub Integration**
1. Push to GitHub
2. Import project in Vercel
3. Select `services/ash-admin` as root directory
4. Deploy

### 4. Run Database Migrations

After first deployment:

```bash
# Using Vercel CLI
vercel env pull .env.local
cd packages/database
npx prisma migrate deploy
```

Or use Vercel's deployment hooks to auto-migrate.

### 5. Generate Strong Secrets

```bash
# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run this 3 times for:
- NEXTAUTH_SECRET
- JWT_SECRET
- ENCRYPTION_KEY

## Troubleshooting

### Build fails with "Can't reach database"
- Ensure DATABASE_URL is set in Vercel environment variables
- Check connection string format includes `?sslmode=require`

### Database connection timeout
- Whitelist Vercel IPs (not needed for Neon/Vercel Postgres)
- Check database is publicly accessible

### Module not found errors
- Clear build cache: Vercel Dashboard → Deployments → [latest] → Redeploy → Clear cache

### Prisma Client errors
- Ensure `npx prisma generate` runs during build
- Check vercel.json buildCommand includes prisma generate

## Current Configuration

Your app uses:
- **Root Directory**: `services/ash-admin`
- **Framework**: Next.js 14
- **Build Command**: `pnpm --filter @ash/admin build`
- **Output**: `.next`

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables set
- [ ] Test login functionality
- [ ] Check API endpoints working
- [ ] Verify file uploads (if S3 configured)
- [ ] Test email/SMS (if configured)

## Need Help?

Common issues:
1. **SQLite error**: You must use PostgreSQL on Vercel
2. **No DATABASE_URL**: Add it in Vercel environment variables
3. **Build timeout**: Database generation taking too long - use faster connection

---

**Last Updated**: 2025-10-02
**Status**: Ready for deployment after PostgreSQL setup
