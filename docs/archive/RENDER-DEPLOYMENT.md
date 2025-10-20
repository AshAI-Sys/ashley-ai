# Ashley AI - Render.com Deployment Guide

## Why Render.com?

After trying Vercel and Railway, we chose Render.com because:
-  **FREE tier** - No credit card required
-  **Free PostgreSQL database** - 90 days free (then $7/month or use external DB)
-  **Better monorepo support** - Works well with pnpm workspaces
-  **Simple configuration** - One render.yaml file
-  **Auto-deployments** - Deploys on every git push
-  **Environment variables** - Auto-generated secrets

## Deployment Status

**Configuration**:  Complete
**Files Created**:
- `render.yaml` - Deployment configuration

**Previous Attempts**:
- L Vercel - Root directory issues, build stuck at "Completing"
- L Railway - Free tier limited (databases only, no web apps)
-  Render.com - Selected as final deployment platform

## Quick Start

### Option 1: Automatic Deployment (Recommended)

1. **Push code to GitHub** (already done in previous steps)
2. **Go to Render.com**: https://render.com
3. **Sign up/Login** using your GitHub account
4. **Click "New +" ’ "Blueprint"**
5. **Select your repository**: ash-ais-projects/ash-admin
6. **Render will automatically detect `render.yaml`** and create:
   - PostgreSQL database (ashley-ai-db)
   - Web service (ashley-ai-admin)
7. **Click "Apply"** and wait 5-10 minutes for deployment
8. **Done!** Your site will be live at: `https://ashley-ai-admin.onrender.com`

### Option 2: Manual Setup

If automatic detection doesn't work:

#### Step 1: Create Database

1. Dashboard ’ "New +" ’ "PostgreSQL"
2. **Name**: ashley-ai-db
3. **Database**: ashley_ai_production
4. **User**: ashley_ai_user
5. **Plan**: Free
6. Click "Create Database"
7. **Copy the Internal Database URL** (starts with `postgresql://`)

#### Step 2: Create Web Service

1. Dashboard ’ "New +" ’ "Web Service"
2. **Connect your GitHub repository**
3. **Name**: ashley-ai-admin
4. **Region**: Singapore
5. **Branch**: master (or main)
6. **Root Directory**: Leave empty
7. **Runtime**: Node
8. **Build Command**:
   ```bash
   pnpm install && cd packages/database && npx prisma generate && cd ../../services/ash-admin && pnpm run build
   ```
9. **Start Command**:
   ```bash
   cd services/ash-admin && pnpm start
   ```
10. **Plan**: Free

#### Step 3: Add Environment Variables

In the web service settings, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Paste the Internal Database URL from Step 1 |
| `NEXTAUTH_SECRET` | Click "Generate" (Render auto-generates) |
| `JWT_SECRET` | Click "Generate" |
| `ENCRYPTION_KEY` | Click "Generate" |
| `NEXTAUTH_URL` | Your Render URL (e.g., `https://ashley-ai-admin.onrender.com`) |
| `APP_URL` | Same as NEXTAUTH_URL |
| `DEMO_MODE` | `false` |

#### Step 4: Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for initial deployment
3. Check build logs for any errors
4. Once deployed, visit your URL!

## Post-Deployment

### Run Database Migrations

After first deployment, you need to run Prisma migrations:

1. Go to your web service dashboard
2. Click "Shell" tab
3. Run these commands:
   ```bash
   cd packages/database
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Test the Deployment

Visit your deployed URL and test:
1. **Homepage**: Should load the landing page
2. **Login**: Try logging in with any credentials (demo mode)
3. **Dashboard**: Check if dashboard loads
4. **Orders**: Test creating a new order

## Monitoring

### View Logs

1. Go to your service dashboard
2. Click "Logs" tab
3. View real-time application logs

### Check Health

Render automatically checks `/api/health` endpoint every 30 seconds.

### Metrics

Free tier includes:
- **Request metrics**
- **Response time**
- **Error rates**
- **Memory usage**

## Troubleshooting

### Build Fails

**Error**: "pnpm: command not found"
- **Fix**: Render should auto-detect pnpm. If not, add to build command:
  ```bash
  npm install -g pnpm && pnpm install && ...
  ```

**Error**: "Prisma client not generated"
- **Fix**: Build command already includes `npx prisma generate`

**Error**: "Module not found"
- **Fix**: Check that build command runs from root directory

### Database Connection Issues

**Error**: "Can't connect to database"
- **Fix**: Use the **Internal Database URL**, not the external one
- Verify `DATABASE_URL` environment variable is set correctly

### Application Crashes

**Error**: "Application error"
- **Fix**: Check logs in Render dashboard
- Verify all environment variables are set
- Check if Prisma migrations ran successfully

### 404 Errors

**Error**: All pages return 404
- **Fix**: Verify `startCommand` is correct: `cd services/ash-admin && pnpm start`
- Check if build output exists in `.next` directory

## Free Tier Limits

**Web Services**:
-  750 hours/month (enough for 1 always-on service)
-  Automatic HTTPS
-  Auto-deploy from GitHub
-   **Spins down after 15 min of inactivity** (takes 30s to spin up on next request)

**PostgreSQL**:
-  90 days free trial
-  1GB storage
-  Automatic backups
-   **After 90 days**: $7/month or migrate to external database (Neon, Supabase, etc.)

## Upgrade to Paid Plan

If you need better performance:

**Starter Plan** ($7/month):
- Always-on (no spin down)
- 512 MB RAM
- Suitable for small production apps

**Standard Plan** ($25/month):
- 2 GB RAM
- Better for production traffic
- SLA uptime guarantee

## Alternative: Keep Database Free Forever

After 90 days, you can:

1. **Use Neon.tech** (Free forever tier):
   - 3GB storage
   - Generous free tier
   - Copy connection string to Render

2. **Use Supabase** (Free tier):
   - 500MB database
   - Good for small projects
   - Copy connection string to Render

3. **Update `DATABASE_URL`** in Render environment variables

## Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com

## Summary

**Render.com is the best free option for Ashley AI because**:
- Simple configuration (one YAML file)
- Free tier is generous
- No credit card required
- Auto-deployments from GitHub
- Built-in PostgreSQL database
- Better monorepo support than Vercel

**Total cost**: $0/month for 90 days, then $7/month for database (or use free external DB)

---

**Created**: 2025-10-17
**Status**: Ready to deploy
**Next Step**: Push to GitHub and connect to Render.com
