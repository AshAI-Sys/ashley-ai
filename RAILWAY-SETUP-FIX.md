# Railway Deployment - Workspace Issue Fix

## Problem
Railway CLI can't create projects in "Personal" workspace. This is a common issue with Railway's free tier or workspace permissions.

## Solution: Create Project via Railway Dashboard

### Step 1: Create Project in Railway Dashboard

1. Open Railway dashboard:
   ```powershell
   railway open
   ```
   OR visit: https://railway.app/dashboard

2. Click **"New Project"** button

3. Select **"Empty Project"**

4. Name it: **Ashley-AI** (or any name you prefer)

5. Click **Create**

### Step 2: Add PostgreSQL Database

1. In your new project, click **"New"** → **"Database"** → **"Add PostgreSQL"**

2. Wait for database to provision (takes 30 seconds)

### Step 3: Link Local Project to Railway

Back in your terminal, run:

```powershell
railway link
```

This time it should show your newly created project. Select it.

### Step 4: Set Environment Variables

```powershell
# Generate secrets (run these one by one)
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set JWT_ACCESS_EXPIRES_IN=15m
railway variables set JWT_REFRESH_EXPIRES_IN=7d
railway variables set SESSION_SECRET="$(openssl rand -base64 32)"
railway variables set CSRF_SECRET="$(openssl rand -base64 32)"
railway variables set PORT=3001
```

**OR** use the Railway dashboard:
1. Go to your project
2. Click **"Variables"** tab
3. Add each variable manually

### Step 5: Deploy

```powershell
railway up
```

### Step 6: Get Your URL

```powershell
railway domain
```

---

## Alternative: Deploy via Railway Dashboard (No CLI)

### Option 1: Deploy from GitHub

1. Push your code to GitHub (if not already)
2. In Railway dashboard, click **"New"** → **"GitHub Repo"**
3. Select your Ashley AI repository
4. Railway will auto-detect Next.js and deploy

### Option 2: Use Railway's Web Deploy

1. In Railway dashboard, create new project
2. Add PostgreSQL database
3. Click **"Deploy"** → **"Deploy from GitHub"**
4. Connect your repository

---

## Quick Fix Script (After Creating Project in Dashboard)

Once you've created the project in the Railway dashboard, run this:

```powershell
# Link to the project you created in dashboard
railway link

# Deploy
railway up

# Get URL
railway domain
```

---

## Why This Happened

Railway has different workspace types:
- **Personal**: Limited, may not allow CLI project creation on free tier
- **Team/Organization**: Allows project creation

Your account shows "ashai-sys's Projects" workspace, but CLI defaults to "Personal".

**Solution**: Create projects via dashboard first, then link via CLI.

---

## Next Steps

1. Open Railway dashboard: `railway open` or https://railway.app/dashboard
2. Create new project manually
3. Add PostgreSQL database
4. Come back and run: `railway link`
5. Then deploy: `railway up`

This should work! 🚀
