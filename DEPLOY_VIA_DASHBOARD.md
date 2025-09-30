# 🚀 Deploy Ashley AI via Vercel Dashboard

## ✅ What's Already Done:
- ✅ Build completed successfully (116 pages)
- ✅ Database configured (Neon PostgreSQL)
- ✅ Environment variables added to Vercel
- ✅ Admin user created (admin@ashleyai.com / Admin@12345)

## 📝 Final Steps (5 minutes):

### Step 1: Open Vercel Project Settings
Go to: https://vercel.com/ash-ais-projects/ash-admin/settings

### Step 2: Update Root Directory
1. Scroll down to **"Root Directory"** section
2. Click **"Edit"**
3. Enter: `services/ash-admin`
4. Click **"Save"**

### Step 3: Update Build Settings
1. In the same settings page, find **"Build & Development Settings"**
2. Set the following:
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter @ash/admin build`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install`

### Step 4: Deploy
1. Go back to the project page: https://vercel.com/ash-ais-projects/ash-admin
2. Click **"Redeploy"** on the latest deployment
3. Wait 2-3 minutes for deployment to complete

### Step 5: Test Your Website
1. Open the production URL (will be shown after deployment)
2. Login with:
   - Email: **admin@ashleyai.com**
   - Password: **Admin@12345**

---

## 🎯 Alternative: Use Vercel GitHub Integration (Recommended for Future)

If you want automatic deployments on git push:

1. Push your code to GitHub:
```bash
cd "C:\Users\Khell\Desktop\Ashley AI"
git add .
git commit -m "Ready for deployment"
git push
```

2. Connect Vercel to GitHub:
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Set Root Directory to `services/ash-admin`
   - Deploy

---

## 💰 Cost: FREE (₱0/month)

Your current setup:
- **Vercel**: FREE tier (unlimited deployments)
- **Neon**: FREE tier (0.5 GB database)
- **Total**: ₱0/month

---

## 🆘 If You Get Errors

**Error: "No Next.js version detected"**
- Solution: Make sure Root Directory is set to `services/ash-admin` in Vercel settings

**Error: "workspace:* not supported"**
- Solution: Use the custom Build Command provided above (it uses pnpm)

**Database connection errors**
- Solution: Check that DATABASE_URL environment variable is set in Vercel settings
- Verify the URL starts with `postgresql://`

---

## ✨ What You'll Have After Deployment

A fully functional manufacturing ERP system with:
- 🎨 14 manufacturing stages (Client → Order → Design → Cutting → Printing → Sewing → QC → Finishing → Delivery → Finance → HR → Maintenance → Portal → AI)
- 👥 User management with role-based access
- 📊 Real-time dashboards and analytics
- 🔒 Secure authentication with bcrypt + JWT
- 📱 Responsive design for desktop and mobile
- 🌐 Global CDN with automatic SSL

**Your live URL will be**: `https://ash-admin-[random].vercel.app`

You can add a custom domain later in Vercel settings (FREE for 1 domain).