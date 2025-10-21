# 🚀 Quick Deploy to Render - START HERE

## ⏱️ Total Time: 10-15 minutes

### Step 1: Sign Up (2 minutes)

1. Go to: **https://render.com/**
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Render

### Step 2: Create Database (2 minutes)

1. Click **"New +"** → **"PostgreSQL"**
2. Settings:
   - Name: `ashley-ai-db`
   - Region: **Oregon (US West)**
   - Plan: **FREE** ✅
3. Click **"Create Database"**
4. **COPY** the **Internal Database URL** (you'll need this!)

### Step 3: Create Web Service (3 minutes)

1. Click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"**
3. Select repository: **ashley-ai** (or your repo name)
4. Settings:
   - Name: `ashley-ai-admin`
   - Region: **Oregon (US West)**
   - Branch: `master`
   - Root Directory: `services/ash-admin`
   - Build Command:
     ```
     cd ../.. && pnpm install && cd packages/database && npx prisma generate && npx prisma migrate deploy && cd ../../services/ash-admin && pnpm build
     ```
   - Start Command:
     ```
     pnpm start
     ```
   - Plan: **FREE** ✅

### Step 4: Environment Variables (3 minutes)

Click **"Add Environment Variable"** for each:

| Key               | Value                                           |
| ----------------- | ----------------------------------------------- |
| `DATABASE_URL`    | **Paste Internal Database URL from Step 2**     |
| `NEXTAUTH_URL`    | `https://ashley-ai-admin.onrender.com`          |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` and paste result |
| `NODE_ENV`        | `production`                                    |

### Step 5: Deploy! (5 minutes build time)

1. Click **"Create Web Service"**
2. Watch build logs
3. Wait for **"Your service is live"** ✅

### Step 6: Access Your App

1. Click the URL: `https://ashley-ai-admin.onrender.com`
2. Login: `admin@ashleyai.com` / `password123`
3. Test all pages work! ✅

---

## 🆘 Need Help?

- Full guide: See [DEPLOYMENT-RENDER-GUIDE.md](./DEPLOYMENT-RENDER-GUIDE.md)
- Errors? Check build logs in Render dashboard
- Database issues? Verify you used **Internal** URL, not External

## 💰 Cost

- **FREE** forever (with auto-spin down after 15 mins)
- Upgrade to $7/month for always-on service

## ⚠️ Free Tier Notes

- App spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Database has 90-day retention (upgrade to keep forever)

---

**Questions?** Open the full guide: [DEPLOYMENT-RENDER-GUIDE.md](./DEPLOYMENT-RENDER-GUIDE.md)
