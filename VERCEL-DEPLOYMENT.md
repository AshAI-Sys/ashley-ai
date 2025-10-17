# Ashley AI - Vercel Deployment Status

**Last Updated**: 2025-10-17
**Status**: Ready for Deployment

## Current Project Information

- **Vercel Project**: ash-admin
- **Vercel URL**: https://ash-admin-ash-ais-projects.vercel.app
- **GitHub Repository**: https://github.com/AshAI-Sys/ashley-ai
- **Project ID**: prj_jtl3Pq6g3mfcLsT8rZ0RN5ZDv3WV
- **Organization**: ash-ais-projects

## Deployment Method 1: Vercel Dashboard (Recommended)

### Step 1: Access Vercel Dashboard
Visit: https://vercel.com/ash-ais-projects/ash-admin

### Step 2: Configure Project Settings
1. Go to **Settings** → **General**
2. Set **Root Directory**: `services/ash-admin`
3. Set **Framework Preset**: Next.js
4. Set **Build Command**: `cd ../.. && pnpm --filter @ash/admin build`
5. Set **Output Directory**: `.next`
6. Set **Install Command**: `pnpm install --frozen-lockfile`
7. Set **Node.js Version**: 20.x

### Step 3: Add Environment Variables
Go to **Settings** → **Environment Variables** and add:

#### Required Variables (MUST ADD THESE):

```bash
# Database (Get from Neon, Supabase, or Railway)
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Security Secrets (Generate new ones!)
# Run: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here
JWT_SECRET=your-generated-jwt-secret-here
ENCRYPTION_KEY=your-32-byte-encryption-key

# URLs (Update after first deployment)
NEXTAUTH_URL=https://ash-admin-ash-ais-projects.vercel.app
APP_URL=https://ash-admin-ash-ais-projects.vercel.app

# Environment
NODE_ENV=production
DEMO_MODE=false
```

### Step 4: Deploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to GitHub to trigger automatic deployment

---

## Deployment Method 2: GitHub Push (Automatic)

Once the project is connected to GitHub (already done), simply push to master:

```bash
git add .
git commit -m "feat: Trigger Vercel deployment"
git push origin master
```

Vercel will automatically detect the push and start deployment.

---

## Deployment Method 3: Vercel CLI

### Prerequisites
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login
```

### Deploy from Vercel Dashboard Settings
Since the monorepo structure requires specific root directory configuration, it's easier to deploy via the Vercel Dashboard. However, you can also use the CLI after proper configuration:

1. **Update Root Directory in Vercel Dashboard**:
   - Go to: https://vercel.com/ash-ais-projects/ash-admin/settings
   - Set Root Directory to: `services/ash-admin`
   - Save settings

2. **Deploy via CLI**:
   ```bash
   cd "C:\Users\Khell\Desktop\Ashley AI"
   vercel --prod
   ```

---

## Environment Variables Setup Guide

### 1. Get Free PostgreSQL Database

**Option A: Neon (Recommended)**
1. Visit: https://neon.tech
2. Sign up for free account
3. Create new project
4. Copy connection string (pooled connection)
5. Example: `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

**Option B: Supabase**
1. Visit: https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the URI (Session mode)
5. Example: `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres`

**Option C: Railway**
1. Visit: https://railway.app
2. Create new project
3. Add PostgreSQL plugin
4. Copy DATABASE_URL from Variables tab
5. Example: `postgresql://postgres:pass@containers-xxx.railway.app:5432/railway`

### 2. Generate Security Secrets

**Windows PowerShell**:
```powershell
# Run this 3 times for each secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Mac/Linux**:
```bash
# Run this 3 times for each secret
openssl rand -base64 32
```

Copy the output for:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

### 3. Add Variables to Vercel

1. Go to: https://vercel.com/ash-ais-projects/ash-admin/settings/environment-variables
2. Click **Add New**
3. Add each variable:
   - **Key**: DATABASE_URL
   - **Value**: Your PostgreSQL URL
   - **Environment**: Production, Preview, Development (select all)
4. Repeat for all required variables
5. Click **Save**

---

## Post-Deployment Steps

### 1. Run Database Migrations

After first deployment, run Prisma migrations:

```bash
# Option A: Via Vercel CLI
DATABASE_URL="your-production-database-url" pnpm --filter @ash-ai/database prisma migrate deploy

# Option B: Add to build command (automatic)
# Update vercel.json buildCommand to:
# "cd ../.. && pnpm --filter @ash-ai/database prisma migrate deploy && pnpm --filter @ash-ai/database prisma generate && pnpm --filter @ash/admin build"
```

### 2. Seed Initial Data (Optional)

```bash
DATABASE_URL="your-production-database-url" pnpm --filter @ash-ai/database prisma db seed
```

### 3. Update URLs

After first deployment, get your actual Vercel URL and update these environment variables:
- `NEXTAUTH_URL` = `https://your-actual-url.vercel.app`
- `APP_URL` = `https://your-actual-url.vercel.app`

Then redeploy.

### 4. Test Deployment

Visit your deployment URL and test:
- ✅ Homepage loads
- ✅ Login works
- ✅ Dashboard displays
- ✅ API endpoints respond
- ✅ Database connection works

---

## Troubleshooting

### Build Fails: "Cannot find module @ash-ai/database"

**Solution**: Ensure Root Directory is set to `services/ash-admin` in Vercel project settings.

### Build Fails: "Prisma Client not generated"

**Solution**: The build command should include Prisma generation:
```bash
cd ../.. && pnpm --filter @ash-ai/database prisma generate && pnpm --filter @ash/admin build
```

### Database Connection Error

**Solutions**:
1. Verify `DATABASE_URL` is added to environment variables
2. Check database is accessible (not localhost)
3. Ensure `?sslmode=require` is in connection string
4. Test connection: `psql $DATABASE_URL`

### Environment Variables Not Loading

**Solutions**:
1. Add variables in Vercel Dashboard → Settings → Environment Variables
2. Ensure "Production" environment is selected
3. Redeploy after adding variables
4. Don't wrap values in quotes in Vercel UI

### 500 Internal Server Error

**Solutions**:
1. Check logs: https://vercel.com/ash-ais-projects/ash-admin
2. Verify all required environment variables are set
3. Check database migrations are run
4. Review build logs for errors

---

## Monitoring & Logs

### View Deployment Logs
1. Go to: https://vercel.com/ash-ais-projects/ash-admin
2. Click on latest deployment
3. View **Build Logs** and **Function Logs**

### View Runtime Logs
1. Go to **Logs** tab in Vercel dashboard
2. Filter by severity (Error, Warning, Info)
3. Search logs by time range or text

### Set up Alerts
1. Go to **Settings** → **Notifications**
2. Enable deployment failure notifications
3. Add webhook for custom alerting

---

## Custom Domain (Optional)

### Add Custom Domain

1. Go to: https://vercel.com/ash-ais-projects/ash-admin/settings/domains
2. Click **Add Domain**
3. Enter your domain (e.g., `ashleyai.com`)
4. Configure DNS records as shown
5. Wait for DNS propagation (5-60 minutes)
6. Update environment variables:
   ```bash
   NEXTAUTH_URL=https://ashleyai.com
   APP_URL=https://ashleyai.com
   ```
7. Redeploy

---

## Automatic Deployments

Vercel is now configured for automatic deployments:

- **Production Deployments**: Push to `master` branch
- **Preview Deployments**: Push to any other branch
- **GitHub Integration**: Automatic on every push

Every push to GitHub will trigger a new deployment automatically!

---

## Quick Links

- **Live Site**: https://ash-admin-ash-ais-projects.vercel.app
- **Vercel Dashboard**: https://vercel.com/ash-ais-projects/ash-admin
- **Project Settings**: https://vercel.com/ash-ais-projects/ash-admin/settings
- **Environment Variables**: https://vercel.com/ash-ais-projects/ash-admin/settings/environment-variables
- **Deployments**: https://vercel.com/ash-ais-projects/ash-admin/deployments
- **Logs**: https://vercel.com/ash-ais-projects/ash-admin/logs
- **GitHub Repo**: https://github.com/AshAI-Sys/ashley-ai

---

## Next Steps

1. ✅ **Configure Environment Variables** (Most Important!)
   - Add DATABASE_URL from Neon/Supabase/Railway
   - Generate and add security secrets
   - Update NEXTAUTH_URL and APP_URL

2. ✅ **Update Project Settings**
   - Set Root Directory to `services/ash-admin`
   - Verify build command
   - Set Node.js version to 20.x

3. ✅ **Trigger Deployment**
   - Push to GitHub, or
   - Click Redeploy in Vercel Dashboard

4. ✅ **Run Database Migrations**
   - Use Vercel CLI or add to build command

5. ✅ **Test Your Live Application**
   - Visit your Vercel URL
   - Test login and core features

---

**Ready to Deploy? Follow the steps above! 🚀**

Need help? Check [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for detailed instructions.
