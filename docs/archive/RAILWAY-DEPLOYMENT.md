# Ashley AI - Railway Deployment Guide

**Railway is MUCH EASIER for monorepos than Vercel!** 🚀

## Step 1: Create Railway Account (If you don't have one)

1. Go to: https://railway.app
2. Click "Login"
3. Sign up with GitHub account
4. Verify email

## Step 2: Deploy via Railway Dashboard (EASIEST WAY)

### Option A: Deploy from GitHub (Recommended)

1. Go to: https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select: **AshAI-Sys/ashley-ai**
4. Railway will auto-detect the monorepo!

### Configure Service:

**Root Directory**: Leave empty (Railway handles monorepos automatically!)

**Environment Variables** - Add these:

```
DATABASE_URL=postgresql://neondb_owner:npg_5YeIhqZxSlQ0@ep-cold-tooth-a15l7pq9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=IVEKXjuuvbyyg0iSEPSY0V2jMvEUCCpJ4=
JWT_SECRET=tqHmQ6VeVjCxjc6pm9SQGqDHLwJms+SVGSwbPnIJ7gg=
ENCRYPTION_KEY=lMnrI1lKyAJNP16XlKVaK65vUGGkwX8wcR8JS8U5qX8k=
NODE_ENV=production
DEMO_MODE=false
PORT=3001
```

**Click "Deploy"** - Railway will automatically:

- ✅ Install pnpm dependencies
- ✅ Generate Prisma client
- ✅ Build Next.js app
- ✅ Deploy to production!

---

## Step 3: Deploy via Railway CLI (Alternative)

### Login:

```bash
cd "C:\Users\Khell\Desktop\Ashley AI"
railway login
```

Browser will open → Login with GitHub

### Initialize Project:

```bash
railway init
```

Choose:

- Create new project: **ashley-ai**
- Environment: **production**

### Add Database (Optional - Railway PostgreSQL):

```bash
railway add
```

Select: **PostgreSQL**

### Set Environment Variables:

```bash
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_5YeIhqZxSlQ0@ep-cold-tooth-a15l7pq9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
railway variables set NEXTAUTH_SECRET="IVEKXjuuvbyyg0iSEPSY0V2jMvEUCCpJ4="
railway variables set JWT_SECRET="tqHmQ6VeVjCxjc6pm9SQGqDHLwJms+SVGSwbPnIJ7gg="
railway variables set ENCRYPTION_KEY="lMnrI1lKyAJNP16XlKVaK65vUGGkwX8wcR8JS8U5qX8k="
railway variables set NODE_ENV="production"
railway variables set DEMO_MODE="false"
railway variables set PORT="3001"
```

### Deploy:

```bash
railway up
```

Railway will build and deploy automatically!

---

## Why Railway is Better for Ashley AI:

✅ **Native Monorepo Support** - No configuration needed!
✅ **Automatic Prisma Detection** - Generates client automatically
✅ **Better Build Process** - Handles complex dependencies
✅ **Free Tier** - $5 credit + $5/month free usage
✅ **Automatic HTTPS** - SSL certificate included
✅ **Easy Database** - One-click PostgreSQL included
✅ **No Build Timeout** - Unlimited build time on paid plans

---

## After Deployment:

Railway will give you a URL like:

```
https://ashley-ai.up.railway.app
```

Update your environment variables:

```bash
railway variables set NEXTAUTH_URL="https://ashley-ai.up.railway.app"
railway variables set APP_URL="https://ashley-ai.up.railway.app"
```

Redeploy:

```bash
railway up --detach
```

---

## Troubleshooting:

### Build fails:

Check logs: `railway logs`

### Database connection error:

Verify DATABASE_URL is correct

### Port binding error:

Make sure PORT=3001 is set

---

## Cost Estimate:

**Free Tier**:

- $5 one-time credit
- $5/month free usage
- Good for small-medium traffic

**Hobby Plan** ($5/month):

- $5 credit + usage beyond that
- Perfect for Ashley AI!

---

## Quick Start (EASIEST):

1. **GO TO**: https://railway.app/new
2. **Click**: "Deploy from GitHub repo"
3. **Select**: AshAI-Sys/ashley-ai
4. **Add env vars** (see above)
5. **Click Deploy**
6. **DONE!** 🎉

Railway handles everything automatically!
