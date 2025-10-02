# Fresh Vercel Deployment - Clean Start

## Prerequisites

### 1. PostgreSQL Database (Required)

Get your database connection string from Neon.tech:

1. Go to: https://console.neon.tech
2. Create/Select project: "ashley-ai"
3. Copy connection string (format):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

**SAVE THIS** - You'll need it!

### 2. Your Secrets (Already Generated)

```
NEXTAUTH_SECRET=3m+lTdu21gGfqItEpZaYTBTLgVVpIJcMN1wg0fxnzJg=
JWT_SECRET=PbBXB94xaQ/ixP5TUQ586BsQJbbJLieLODw0pse1NiM=
ENCRYPTION_KEY=AwHb90Svsu0H0831cU7YvDKDBCmIIZ1y0foCXhk1Fkw=
```

---

## Deployment Method: GitHub Integration (Recommended)

### Step 1: Import Project to Vercel

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: **AshAI-Sys/ashley-ai**
4. Click **"Import"**

### Step 2: Configure Project

**Framework Preset:** Next.js ✓ (auto-detected)

**Root Directory:** `services/ash-admin` ← **IMPORTANT!**

**Build Settings:**
- Build Command: (auto from vercel.json)
- Output Directory: `.next`
- Install Command: (auto from vercel.json)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add these 7 variables:

**For ALL variables, check:** ☑️ Production ☑️ Preview ☑️ Development

```bash
DATABASE_URL
[Paste your PostgreSQL connection string from Neon.tech]

NEXTAUTH_SECRET
3m+lTdu21gGfqItEpZaYTBTLgVVpIJcMN1wg0fxnzJg=

JWT_SECRET
PbBXB94xaQ/ixP5TUQ586BsQJbbJLieLODw0pse1NiM=

ENCRYPTION_KEY
AwHb90Svsu0H0831cU7YvDKDBCmIIZ1y0foCXhk1Fkw=

NODE_ENV
production

NEXTAUTH_URL
https://your-app-name.vercel.app

APP_URL
https://your-app-name.vercel.app
```

**Note:** For NEXTAUTH_URL and APP_URL, use a temporary URL first. Update after deployment.

### Step 4: Deploy!

Click **"Deploy"** button

Vercel will:
1. Install dependencies (2-3 min)
2. Generate Prisma Client (30 sec)
3. Build Next.js (1-2 min)
4. Deploy to production (30 sec)

**Total time:** ~5-7 minutes

### Step 5: Update URLs

After deployment completes:

1. Copy your actual deployment URL (e.g., `https://ashley-ai-abc123.vercel.app`)
2. Go to **Settings → Environment Variables**
3. Edit **NEXTAUTH_URL** → Paste actual URL → Save
4. Edit **APP_URL** → Paste actual URL → Save
5. Go to **Deployments** → Click "..." → **Redeploy**

---

## Alternative: Vercel CLI Method

### Prerequisites

```bash
npm install -g vercel
```

### Deploy

```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

# Login
vercel login

# Deploy
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No**
- Project name? **ashley-ai-admin**
- In which directory? **services/ash-admin**

Then deploy to production:
```bash
vercel --prod
```

---

## Troubleshooting

### Build Error: "Can't reach database"
- Ensure DATABASE_URL is added to environment variables
- Check PostgreSQL connection string format
- Verify database is accessible

### Error: "Prisma Client not found"
- Clear build cache and redeploy
- Deployments → ... → Redeploy → ☑️ Clear Build Cache

### Login/Auth Issues
- Verify NEXTAUTH_URL matches your actual domain
- No trailing slash in URLs
- Redeploy after updating

---

## Post-Deployment Checklist

- [ ] Deployment successful
- [ ] Visit deployment URL
- [ ] Login page loads
- [ ] Can login with any email/password (demo mode)
- [ ] Dashboard loads
- [ ] Updated NEXTAUTH_URL and APP_URL with actual domain
- [ ] Redeployed with correct URLs

---

## Expected Result

Your app will be live at: `https://[your-project-name].vercel.app`

**Login:** Any email/password (demo mode)
**Example:** admin@ashleyai.com / password123

---

**Ready to deploy!** 🚀

Follow "Deployment Method: GitHub Integration" above for the easiest experience.
