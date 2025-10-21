# Simplified Deployment Guide

## Current Situation

Your Ashley AI system is production-ready, but we're facing deployment challenges due to:

1. **Monorepo structure** - Complex pnpm workspace setup
2. **File locks** - Dev servers holding locks on Prisma files
3. **Outdated lockfile** - pnpm-lock.yaml needs regeneration

## 🚀 SIMPLEST PATH: Deploy a Single Service

Instead of deploying the entire monorepo, let's deploy just the ash-admin service as a standalone Next.js app.

### Step 1: Stop Development Servers

First, stop all running dev servers to release file locks:

```bash
# Find processes on port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual number)
taskkill /F /PID <PID>
```

### Step 2: Update Lockfile

```bash
cd "C:\Users\Khell\Desktop\Ashley AI"
pnpm install
```

### Step 3: Deploy from Root

```bash
cd "C:\Users\Khell\Desktop\Ashley AI"
vercel --prod
```

## Alternative: Deploy via Vercel Dashboard (Recommended)

This is the EASIEST method that avoids CLI issues:

### 1. Push to GitHub (Already Done ✅)

Your code is already on GitHub at: https://github.com/AshAI-Sys/ashley-ai

### 2. Import to Vercel Dashboard

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `AshAI-Sys/ashley-ai`
4. Click **"Import"**

### 3. Configure Project Settings

**Framework Preset**: Next.js

**Root Directory**: Leave empty OR set to `services/ash-admin`

**Build Settings**:

- Build Command: `cd packages/database && npx prisma generate && cd ../.. && pnpm --filter @ash/admin build`
- Output Directory: `services/ash-admin/.next`
- Install Command: `pnpm install --no-frozen-lockfile`

### 4. Add Environment Variables

Click **"Environment Variables"** and add:

```
NEXTAUTH_SECRET=+kenmdcKauRX4Qlj3be1pFfgOwBY5yPO4ID+2dziCYQ=
JWT_SECRET=fiP2fJpeAOVZEfpcHxk3BkwhCFUbODK/Kx1c8oDZwLCrz0eaNArjeA3WCxlg+p/N
ENCRYPTION_KEY=fCRN7vPHqfco6QoASU2qREYPBNipb0/SORcLEve6lBo=
NODE_ENV=production
LOG_LEVEL=INFO
DEFAULT_WORKSPACE_ID=demo-workspace-1
DEMO_MODE=true
RATE_LIMIT_ENABLED=true
FEATURE_AI_CHAT=true
FEATURE_PWA=true
```

### 5. Deploy

Click **"Deploy"** button

Vercel will:

- Clone your repository
- Install dependencies
- Build the app
- Deploy to production
- Give you a live URL

## Expected Result

After 2-5 minutes, you'll get:

- **Live URL**: `https://ashley-ai-xxx.vercel.app`
- **Automatic HTTPS**
- **Global CDN**
- **Automatic CI/CD** (future git pushes auto-deploy)

## If Build Fails

Common fixes:

### 1. Lockfile Issue

Add to install command:

```
pnpm install --no-frozen-lockfile
```

### 2. Prisma Generation

Ensure build command includes:

```
npx prisma generate
```

### 3. Workspace Dependencies

If it can't find @ash-ai/database:

- Deploy from monorepo root
- OR copy database package into ash-admin service

## Need Help?

I've prepared these guides:

- `VERCEL-DEPLOYMENT-GUIDE.md` - Complete deployment guide
- `.env.production` - Production environment variables
- `set-vercel-env.ps1` - Script to set environment variables

## Quick Status Check

✅ Code committed and pushed to GitHub
✅ Production secrets generated
✅ Vercel account ready (ashaisystem-1783)
✅ Documentation complete
⚠️ Need: Stop dev servers
⚠️ Need: Update lockfile OR use --no-frozen-lockfile
⚠️ Need: Deploy via Dashboard (easiest)

## Recommended Next Step

**Use Vercel Dashboard** (5 minutes):

1. Go to https://vercel.com/new
2. Import `AshAI-Sys/ashley-ai` repository
3. Add environment variables
4. Click Deploy
5. Done! ✅

This avoids all CLI complications and is the standard way to deploy Next.js apps.
