# 🚀 Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. ✅ Create PostgreSQL Database
- [ ] Go to [Neon.tech](https://neon.tech) OR [Vercel Postgres](https://vercel.com/dashboard)
- [ ] Create new database: "ashley-ai-production"
- [ ] Copy connection string (should look like: `postgresql://user:password@host/db`)

### 2. ✅ Generate Security Secrets

Run this command **3 times** to generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Save the outputs for:
- `NEXTAUTH_SECRET` = [paste secret 1]
- `JWT_SECRET` = [paste secret 2]
- `ENCRYPTION_KEY` = [paste secret 3]

### 3. ✅ Configure Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these (copy from below):

```bash
DATABASE_URL=postgresql://[YOUR_DB_CONNECTION_STRING]?sslmode=require
NEXTAUTH_SECRET=[SECRET_FROM_STEP_2]
NEXTAUTH_URL=https://your-app.vercel.app
JWT_SECRET=[SECRET_FROM_STEP_2]
ENCRYPTION_KEY=[SECRET_FROM_STEP_2]
NODE_ENV=production
APP_URL=https://your-app.vercel.app
```

### 4. ✅ Update Your App URLs

After Vercel assigns your URL (e.g., `ashley-ai-xyz.vercel.app`):
- [ ] Update `NEXTAUTH_URL` environment variable
- [ ] Update `APP_URL` environment variable
- [ ] Redeploy

---

## Deployment Steps

### Option A: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy from project root
cd "C:\Users\Khell\Desktop\Ashley AI"
vercel --prod

# 4. Select options:
#    - Root directory: services/ash-admin
#    - Framework: Next.js
#    - Build command: (use default from vercel.json)
```

### Option B: Deploy via GitHub

```bash
# 1. Commit changes
git add .
git commit -m "Configure for Vercel deployment with PostgreSQL"
git push origin master

# 2. Go to Vercel Dashboard
#    → Add New Project
#    → Import from GitHub
#    → Select "ashley-ai" repository

# 3. Configure:
#    - Root Directory: services/ash-admin
#    - Framework Preset: Next.js
#    - Environment Variables: Add all from step 3 above

# 4. Click Deploy
```

---

## Post-Deployment

### 1. ✅ Check Build Logs
- [ ] Verify Prisma generate succeeded
- [ ] Verify migrations ran successfully
- [ ] Check for any errors

### 2. ✅ Test Your Deployment
- [ ] Visit your Vercel URL
- [ ] Test login page loads
- [ ] Try logging in (any email/password in demo mode)
- [ ] Check dashboard loads
- [ ] Test one feature (e.g., Orders page)

### 3. ✅ Run Database Migrations (if needed)

If migrations didn't auto-run:

```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations
cd packages/database
npx prisma migrate deploy
```

---

## Troubleshooting

### ❌ Build Error: "Can't reach database server"
**Fix**: DATABASE_URL not set in Vercel environment variables
- Go to Settings → Environment Variables
- Add DATABASE_URL with your PostgreSQL connection string

### ❌ Build Error: "Module not found: Can't resolve '@prisma/client'"
**Fix**: Prisma not generating during build
```bash
# Clear Vercel cache and redeploy
# In Vercel: Deployments → [...] → Redeploy → Clear cache
```

### ❌ Runtime Error: "PrismaClient is unable to run in this browser environment"
**Fix**: Missing `prisma generate` in build
- Check `package.json` has `postinstall: prisma generate`
- Redeploy

### ❌ Error: "Invalid DATABASE_URL"
**Fix**: Connection string format
- Must start with `postgresql://`
- Must end with `?sslmode=require`
- Example: `postgresql://user:pass@host.com/db?sslmode=require`

### ❌ Login doesn't work / Session errors
**Fix**: NEXTAUTH_URL mismatch
- Must match your actual Vercel URL exactly
- Don't include trailing slash
- Update env variable if URL changed

---

## What Changed for Vercel Deployment

✅ **Database**: SQLite → PostgreSQL (Vercel is serverless, needs cloud DB)
✅ **Build Command**: Added Prisma generate + migrate
✅ **Environment Variables**: Configured for production
✅ **vercel.json**: Updated with correct build steps

---

## Current Status

- [x] Prisma schema updated to PostgreSQL
- [x] Build scripts configured
- [x] vercel.json configured
- [x] Environment variable templates created
- [ ] **YOU NEED TO DO**: Create PostgreSQL database
- [ ] **YOU NEED TO DO**: Set Vercel environment variables
- [ ] **YOU NEED TO DO**: Deploy

---

## Quick Command Reference

```bash
# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Deploy to Vercel
vercel --prod

# Check logs
vercel logs

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy
```

---

**Ready to deploy!** Follow steps above. 🚀

**Estimated time**: 10-15 minutes
