# 🚂 Deploy Ashley AI to Railway - Step by Step Guide

Railway is the **EASIEST** way to deploy pnpm workspaces. Takes only **5 minutes**!

---

## 📋 Step 1: Sign Up for Railway

1. Go to: **https://railway.app**
2. Click **"Start a New Project"**
3. Sign in with your **GitHub account**
4. Authorize Railway to access your repositories

---

## 📋 Step 2: Create New Project

1. Click **"+ New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`AshAI-Sys/ashley-ai`**
4. Select **`master`** branch

---

## 📋 Step 3: Configure the Service

Railway will auto-detect it's a monorepo. Configure:

### Root Directory:
```
services/ash-admin
```

### Build Command:
```
cd ../.. && pnpm install && cd services/ash-admin && pnpm build
```

### Start Command:
```
pnpm start
```

### Install Command:
```
pnpm install
```

---

## 📋 Step 4: Add Environment Variables

Click **"Variables"** tab and add these:

### Required Variables:

```env
# Database (Railway provides PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/railway

# Auth (generate a random secret)
NEXTAUTH_SECRET=your-random-secret-here-min-32-chars
NEXTAUTH_URL=https://your-app.railway.app

# Optional but Recommended:
NODE_ENV=production
PORT=3000
```

### To generate NEXTAUTH_SECRET:
```bash
# Run this in terminal:
openssl rand -base64 32
```

---

## 📋 Step 5: Add Database (PostgreSQL)

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will automatically create `DATABASE_URL` environment variable
5. **Copy the DATABASE_URL** and paste it in your service's environment variables

---

## 📋 Step 6: Deploy!

1. Click **"Deploy"** button
2. Wait for build to complete (~3-5 minutes)
3. Railway will give you a URL like: `https://your-app.railway.app`
4. Click the URL to see your live app! 🎉

---

## 📋 Step 7: Run Database Migrations

After first deployment, run migrations:

1. Go to your Railway service
2. Click **"Settings"** → **"Deploy Triggers"**
3. Add this **Custom Start Command**:
```
npx prisma migrate deploy && pnpm start
```

Or run manually in Railway CLI:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run npx prisma migrate deploy
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads at Railway URL
- [ ] Database connected (check /api/health)
- [ ] Can login to dashboard
- [ ] All pages work correctly

---

## 🔧 Troubleshooting

### Build fails?
- Check build logs in Railway dashboard
- Verify pnpm-lock.yaml is committed
- Ensure all dependencies are in package.json

### Database error?
- Verify DATABASE_URL is correct
- Run migrations: `railway run npx prisma migrate deploy`
- Check PostgreSQL is running in Railway

### Can't access app?
- Check if deployment succeeded
- Verify PORT is set to 3000
- Check Railway logs for errors

---

## 💰 Pricing

- **Free tier**: $5/month credit (perfect for testing)
- **Hobby plan**: $5/month (removes sleep)
- **Pro plan**: $20/month (more resources)

---

## 🎯 Summary

**Railway is easier than Vercel for monorepos because:**
- ✅ Native pnpm workspace support
- ✅ Automatic PostgreSQL database
- ✅ Simple environment variable management
- ✅ One-click deploys from GitHub
- ✅ Free tier to get started

**Total time**: 5-10 minutes to full deployment! 🚀

---

## 📞 Need Help?

If you encounter issues:
1. Check Railway docs: https://docs.railway.app
2. Join Railway Discord: https://discord.gg/railway
3. Check build logs in Railway dashboard

---

**Ready to deploy? Follow the steps above!** 🎉
