# Ashley AI - Render Deployment Guide

## Why Render?

- ✅ **Free Tier**: 750 hours/month for web services (enough for 24/7 operation)
- ✅ **Free PostgreSQL**: Included with 90-day data retention
- ✅ **pnpm Support**: Native monorepo support
- ✅ **Auto-Deploy**: From GitHub on every push
- ✅ **No Credit Card**: Required only for paid plans
- ⚠️ **Auto-Spin Down**: Free tier spins down after 15 mins inactivity (30s to wake up)

## Step 1: Create Render Account

1. Go to https://render.com/
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"Sign up with GitHub"** (easiest)
4. Authorize Render to access your GitHub account
5. Verify your email if prompted

## Step 2: Create PostgreSQL Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database:
   - **Name**: `ashley-ai-db`
   - **Database**: `ashleyai` (or leave default)
   - **User**: `ashleyai` (or leave default)
   - **Region**: **Oregon (US West)** (closest to free tier)
   - **Plan**: **Free** (select this!)
3. Click **"Create Database"**
4. Wait 1-2 minutes for database to provision
5. **IMPORTANT**: Copy the **Internal Database URL** (starts with `postgresql://`)
   - Found under "Connections" section
   - Example: `postgresql://ashleyai:xxx@dpg-xxx-a.oregon-postgres.render.com/ashleyai`

## Step 3: Create Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"** → **"Next"**
3. Select your repository: **"ashley-ai"** (or whatever you named it)
   - If you don't see it, click **"Configure account"** to grant access
4. Click **"Connect"**

## Step 4: Configure Web Service

Fill in the following settings:

### Basic Settings

- **Name**: `ashley-ai-admin`
- **Region**: **Oregon (US West)** (same as database)
- **Branch**: `master`
- **Root Directory**: `services/ash-admin`
- **Runtime**: **Node**
- **Build Command**:
  ```bash
  cd ../.. && pnpm install && cd packages/database && npx prisma generate && cd ../../services/ash-admin && pnpm build
  ```
- **Start Command**:
  ```bash
  pnpm start
  ```

### Advanced Settings (click "Advanced")

- **Node Version**: `18` (or leave blank for latest)
- **Auto-Deploy**: ✅ **Yes** (enabled by default)

### Instance Type

- **Plan**: **Free** (select this!)

## Step 5: Add Environment Variables

Click **"Add Environment Variable"** and add these:

### Required Variables

1. **DATABASE_URL**
   - **Value**: Paste the Internal Database URL from Step 2
   - Example: `postgresql://ashleyai:xxx@dpg-xxx-a.oregon-postgres.render.com/ashleyai`

2. **NEXTAUTH_URL**
   - **Value**: `https://ashley-ai-admin.onrender.com` (or your custom domain)
   - ⚠️ **Note**: Replace `ashley-ai-admin` with whatever name you chose in Step 4

3. **NEXTAUTH_SECRET**
   - **Value**: Generate a random secret with this command (run locally):
     ```bash
     openssl rand -base64 32
     ```
   - Or use: `your-super-secret-random-string-here-change-this-in-production`

4. **NODE_ENV**
   - **Value**: `production`

### Optional Variables (add later if needed)

5. **REDIS_URL** (for rate limiting - optional)
   - Leave empty for now, app will use in-memory fallback

6. **RESEND_API_KEY** (for email notifications - optional)
   - Get from https://resend.com if you want email features

7. **AWS_ACCESS_KEY_ID**, **AWS_SECRET_ACCESS_KEY**, **AWS_REGION**, **AWS_S3_BUCKET** (for file uploads - optional)
   - Leave empty for now, app will use local storage

## Step 6: Deploy!

1. Click **"Create Web Service"** button at the bottom
2. Render will start building your application
3. You'll see the build logs in real-time
4. Build takes ~3-5 minutes for first deployment

### What Happens During Build:

1. ✅ Clone repository
2. ✅ Install pnpm dependencies
3. ✅ Generate Prisma client
4. ✅ Build Next.js application
5. ✅ Run database migrations (Prisma)
6. ✅ Start the server

## Step 7: Monitor Deployment

Watch the build logs for:

- ✅ **"Build successful"** - Build completed
- ✅ **"Your service is live"** - App is running
- ❌ **"Build failed"** - Check logs for errors

### Common Build Issues:

**Issue 1: Prisma Client Not Generated**

- **Error**: `Cannot find module '@prisma/client'`
- **Fix**: Build command includes `npx prisma generate`

**Issue 2: Database Connection Failed**

- **Error**: `Can't reach database server`
- **Fix**: Check DATABASE_URL is correct (use Internal URL, not External)

**Issue 3: Out of Memory**

- **Error**: `JavaScript heap out of memory`
- **Fix**: Free tier has 512MB RAM limit, may need to upgrade to Starter ($7/month)

## Step 8: Run Database Migrations

After first deployment, Render automatically runs migrations. To manually trigger:

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd ../.. && cd packages/database && npx prisma migrate deploy
   ```

Or set up automatic migrations by updating build command:

```bash
cd ../.. && pnpm install && cd packages/database && npx prisma generate && npx prisma migrate deploy && cd ../../services/ash-admin && pnpm build
```

## Step 9: Access Your Application

1. Once deployed, Render provides a URL: `https://ashley-ai-admin.onrender.com`
2. Click the URL to open your application
3. You should see the Ashley AI login page
4. Login with demo credentials:
   - Email: `admin@ashleyai.com`
   - Password: `password123`

## Step 10: Verify Everything Works

Test these features:

- ✅ Login page loads
- ✅ Authentication works
- ✅ Dashboard shows data
- ✅ Orders page loads
- ✅ Finance page loads
- ✅ HR page loads
- ✅ All 15 manufacturing stages accessible

## Custom Domain (Optional)

To use your own domain (e.g., `app.ashleyai.com`):

1. Go to web service **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain: `app.ashleyai.com`
4. Render will provide DNS records to add to your domain registrar:
   - **Type**: `CNAME`
   - **Name**: `app`
   - **Value**: `ashley-ai-admin.onrender.com`
5. Wait for DNS propagation (5-60 minutes)
6. Update `NEXTAUTH_URL` environment variable to your new domain

## Free Tier Limitations

### What's Included (Free Forever):

- ✅ 750 hours/month (enough for 24/7 single instance)
- ✅ 512MB RAM
- ✅ 0.1 CPU
- ✅ Free SSL certificate
- ✅ Auto-deploy from GitHub
- ✅ Free PostgreSQL database (1GB storage, 90-day data retention)

### Limitations:

- ⚠️ **Auto-Spin Down**: Services spin down after 15 minutes of inactivity
  - **Impact**: First request after inactivity takes ~30 seconds to wake up
  - **Solution**: Upgrade to Starter ($7/month) for always-on
- ⚠️ **RAM Limit**: 512MB may be tight for large production loads
- ⚠️ **Database Retention**: Free PostgreSQL deletes after 90 days of inactivity
  - **Solution**: Upgrade to Starter PostgreSQL ($7/month) for permanent storage

### When to Upgrade:

**Web Service - Starter ($7/month)**:

- ✅ Always-on (no spin-down)
- ✅ 512MB RAM (same)
- ✅ 0.5 CPU (5x faster)
- ✅ Custom domains included

**PostgreSQL - Starter ($7/month)**:

- ✅ Permanent storage (no 90-day limit)
- ✅ 1GB storage
- ✅ Daily backups

## Monitoring & Logs

### View Logs:

1. Go to web service dashboard
2. Click **"Logs"** tab
3. See real-time application logs

### Metrics:

1. Click **"Metrics"** tab
2. See CPU, Memory, Response Time graphs
3. Free tier has basic metrics

### Health Checks:

Render automatically monitors your app:

- **Health Check Path**: `/api/health` (if you have one)
- **Restart on Failure**: Automatic

## Troubleshooting

### App Won't Start

1. Check **Logs** tab for errors
2. Verify environment variables are set correctly
3. Ensure DATABASE_URL is the **Internal** URL, not External
4. Check Node version compatibility

### Database Connection Errors

1. Verify DATABASE_URL includes `?sslmode=require` for Render PostgreSQL
2. Check database is in same region as web service
3. Use **Internal Database URL**, not External

### Build Timeout

1. Free tier has 15-minute build timeout
2. If exceeded, upgrade to Starter plan
3. Or optimize build by caching node_modules

### Out of Memory

1. Free tier has 512MB RAM
2. Reduce build parallelism
3. Upgrade to Starter ($7/month) for more RAM

## Next Steps

1. ✅ Deploy application
2. ✅ Test all features
3. 🔄 Monitor for 24 hours
4. 📊 Review metrics
5. 💰 Decide if upgrade needed
6. 🌐 Add custom domain (optional)
7. 📧 Configure email (optional)
8. 📁 Configure S3 storage (optional)

## Cost Comparison

| Provider    | Free Tier        | Paid Tier | Notes                          |
| ----------- | ---------------- | --------- | ------------------------------ |
| **Render**  | ✅ Free (750hrs) | $7/month  | Best free tier, auto-spin down |
| **Railway** | ❌ DB only       | $5/month  | Best monorepo support          |
| **Fly.io**  | ✅ Free (3 VMs)  | $5/month  | Always-on, needs credit card   |
| **Vercel**  | ✅ Free          | $20/month | Poor monorepo support          |

## Support

- **Render Docs**: https://render.com/docs
- **Render Discord**: https://discord.gg/render
- **Render Status**: https://status.render.com

---

**Ready to deploy?** Go to https://render.com and follow the steps above! 🚀
