# Deploy Ashley AI to Railway - Quick Guide

## You're Ready to Deploy!

Everything is set up. You just need to link your project and deploy.

---

## Step 1: Run the Deployment Script

```powershell
.\deploy-now.ps1
```

---

## Step 2: Select Your Project

When the script asks you to link to a project, you'll see something like:

```
? Select a project
> Ashley AI
  Other Project 1
  Other Project 2
```

**Use arrow keys** to select "Ashley AI" (or whatever you named it), then press **Enter**.

---

## Step 3: Wait for Deployment

The script will:

1. Upload your code
2. Install dependencies (pnpm install)
3. Generate Prisma client
4. Build Next.js app
5. Deploy to Railway
6. Start your server

This takes about **5-10 minutes** for the first deployment.

---

## Step 4: Get Your Live URL

After deployment succeeds, run:

```powershell
railway domain
```

This will show your live URL, something like:

```
https://ashley-ai-production.up.railway.app
```

---

## Step 5: Test Your App

Visit your URL and login:

- **Email**: admin@ashleyai.com
- **Password**: password123

---

## That's It!

Your Ashley AI Manufacturing ERP is now live!

---

## Helpful Commands

### View Deployment Dashboard

```powershell
railway open
```

### Check Deployment Logs

```powershell
railway logs
```

### Check Deployment Status

```powershell
railway status
```

### Redeploy (After Making Changes)

```powershell
railway up
```

---

## If Something Goes Wrong

### Error: "No linked project found"

```powershell
# Run this first
railway link

# Then deploy
railway up
```

### Error: "Build failed"

```powershell
# Check logs
railway logs

# Check environment variables
railway variables
```

### Error: "Database connection failed"

```powershell
# Check if PostgreSQL is added
railway add --database postgresql

# Check DATABASE_URL exists
railway variables
```

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Go to Railway dashboard
   - Click your service
   - Add custom domain

2. **Enable GitHub auto-deploy** (optional)
   - Connect your GitHub repo
   - Automatic deployments on git push

3. **Monitor your app**
   - Check Railway dashboard
   - View logs regularly
   - Monitor performance

---

**Ready?** Run `.\deploy-now.ps1` now!
