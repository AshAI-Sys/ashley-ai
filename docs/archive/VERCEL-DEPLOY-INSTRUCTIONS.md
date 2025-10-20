# Ashley AI - Vercel Deployment Instructions

**PROBLEM**: Monorepo structure causes "No Next.js version detected" error

**ROOT CAUSE**: Dependencies are hoisted to monorepo root by pnpm, but Vercel looks for `next` in `services/ash-admin/node_modules`

## SOLUTION: Deploy via Vercel Dashboard (NOT CLI)

### Step 1: Import from GitHub

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `AshAI-Sys/ashley-ai`
4. Click "Import"

### Step 2: Configure Project Settings

**CRITICAL SETTINGS**:

```
Project Name: ash-admin
Framework Preset: Next.js
Root Directory: services/ash-admin (IMPORTANT!)
Build Command: (leave default or: next build)
Output Directory: .next
Install Command: (leave default or: pnpm install)
Node.js Version: 20.x
```

### Step 3: Add Environment Variables

Click "Environment Variables" and add these (from earlier):

```
DATABASE_URL=postgresql://neondb_owner:npg_5YeIhqZxSlQ0@ep-cold-tooth-a15l7pq9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=(your generated secret)
JWT_SECRET=(your generated secret)
ENCRYPTION_KEY=(your generated secret)
NEXTAUTH_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app
NODE_ENV=production
DEMO_MODE=false
```

### Step 4: Deploy

Click "Deploy" and wait!

## Why This Works

When you set **Root Directory = `services/ash-admin`**:
- ✅ Vercel builds FROM that directory
- ✅ Sees package.json with Next.js dependency
- ✅ Runs pnpm install which hoists dependencies from root
- ✅ Prisma generates from build script
- ✅ Build succeeds!

## Alternative: Manual CLI Deployment

If dashboard doesn't work, try this:

```bash
cd "C:\Users\Khell\Desktop\Ashley AI"
vercel --cwd services/ash-admin --prod
```

Then in the prompts:
- Link to existing project: Yes → ash-admin
- Or create new project

---

**GO TO VERCEL DASHBOARD AND IMPORT FROM GITHUB!**

https://vercel.com/new
