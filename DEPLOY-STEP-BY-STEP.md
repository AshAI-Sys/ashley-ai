# 🚀 STEP-BY-STEP DEPLOYMENT GUIDE

**Generated**: November 1, 2025
**Status**: Ready to Deploy
**Estimated Time**: 15-20 minutes

---

## ✅ PRE-DEPLOYMENT CHECKLIST (COMPLETED)

- ✅ Production secrets generated
- ✅ Database connected and configured
- ✅ Build tested successfully (221 pages)
- ✅ TypeScript errors fixed (0 errors)
- ✅ New features tested (QR Generator, Mobile Management)
- ✅ Vercel CLI installed (v48.4.1)
- ✅ Security audited (B+ grade)

**You're 100% ready to deploy!**

---

## 🎯 DEPLOYMENT STEPS

### Step 1: Navigate to Admin Service

Open a **new terminal/command prompt** and run:

```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
```

---

### Step 2: Start Vercel Deployment

Run this command:

```bash
vercel --prod
```

**What will happen**:
1. Vercel will open your browser for authentication (if not logged in)
2. You'll see a series of questions in the terminal

---

### Step 3: Answer Vercel Questions

**Question 1**: `? Set up and deploy "~\Desktop\Ashley AI\services\ash-admin"?`
- **Answer**: Press `Y` (Yes)

**Question 2**: `? Which scope do you want to deploy to?`
- **Answer**: Select your Vercel account (use arrow keys, press Enter)

**Question 3**: `? Link to existing project?`
- **Answer**: Press `N` (No) - This is your first deployment

**Question 4**: `? What's your project's name?`
- **Answer**: Type `ashley-ai-admin` and press Enter

**Question 5**: `? In which directory is your code located?`
- **Answer**: Press Enter (current directory is correct)

**Question 6**: `? Want to modify these settings?`
- **Answer**: Press `N` (No) - Vercel auto-detected Next.js correctly

---

### Step 4: Wait for Deployment (10-15 minutes)

You'll see:

```
🔗  Linked to your-account/ashley-ai-admin
🔍  Inspect: https://vercel.com/.../deployments/...
✅  Production: https://ashley-ai-admin-xxxxx.vercel.app [15s]
```

**What's happening**:
- Installing dependencies (~3-5 min)
- Building Next.js application (~5-8 min)
- Optimizing 221 pages (~2-3 min)
- Deploying to global CDN (~1-2 min)

**IMPORTANT**: Copy the production URL shown after "Production:" - you'll need it!

Example: `https://ashley-ai-admin-abc123.vercel.app`

---

### Step 5: Add Environment Variables

1. Open your browser and go to: https://vercel.com/dashboard

2. Click on your **ashley-ai-admin** project

3. Go to **Settings** tab → **Environment Variables**

4. Add these 4 variables (click "Add New" for each):

   **Variable 1**:
   - Name: `DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_oVNf76Kpqasx@ep-falling-fire-a1ru8mim-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
   - Environment: Production, Preview, Development (select all 3)

   **Variable 2**:
   - Name: `JWT_SECRET`
   - Value: `SDJreOujhwwyOiM2rajKVQl1jABwpDQh09T18k3Np28=`
   - Environment: Production, Preview, Development

   **Variable 3**:
   - Name: `NEXTAUTH_SECRET`
   - Value: `lL2UmJTCdaQJLmFDlqaOBGOuPcFDle0U5mvAW/ncHLQ=`
   - Environment: Production, Preview, Development

   **Variable 4**:
   - Name: `NEXTAUTH_URL`
   - Value: `https://ashley-ai-admin-xxxxx.vercel.app` (YOUR production URL from Step 4)
   - Environment: Production only

5. Click **Save** after adding each variable

---

### Step 6: Redeploy with Environment Variables

**Option A** - Via Vercel Dashboard (Easier):
1. Go to **Deployments** tab
2. Find the latest deployment (top of list)
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Confirm by clicking **Redeploy** again

**Option B** - Via CLI:
```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
vercel --prod
```

Wait another 5-10 minutes for redeployment.

---

### Step 7: Create Admin User

Once redeployment completes, create your admin user:

```bash
cd "C:\Users\Khell\Desktop\Ashley AI"
DATABASE_URL="postgresql://neondb_owner:npg_oVNf76Kpqasx@ep-falling-fire-a1ru8mim-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" npx tsx scripts/create-admin-user.ts
```

**Expected output**:
```
🚀 Creating admin user and workspace...

✅ Workspace created: Ashley AI Production
✅ Admin user created: admin@ashleyai.com

📋 Login Credentials:
   Email: admin@ashleyai.com
   Password: Admin@12345

⚠️  IMPORTANT: Change password after first login!
```

---

### Step 8: Test Production Deployment

**Test 1 - Health Check**:
```bash
curl https://ashley-ai-admin-xxxxx.vercel.app/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

**Test 2 - Open in Browser**:
```
https://ashley-ai-admin-xxxxx.vercel.app
```

You should see the Ashley AI login page.

**Test 3 - Login**:
1. Go to your production URL
2. Email: `admin@ashleyai.com`
3. Password: `Admin@12345`
4. Click "Sign In"

**Test 4 - Test Features**:
- Dashboard: Should load with manufacturing data
- QR Generator: `https://your-url.vercel.app/inventory/qr-generator`
- Mobile Management: `https://your-url.vercel.app/mobile/manage`
- Orders: Create a test order
- Finance: Check invoicing system

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

✅ Production URL loads without errors
✅ Login page appears correctly
✅ Can login with admin credentials
✅ Dashboard displays properly
✅ QR Generator works
✅ Mobile Management works
✅ API endpoints respond (health check returns 200)
✅ Database connections work
✅ No console errors in browser

---

## 🚨 TROUBLESHOOTING

### Issue: "Module not found" errors
**Solution**:
1. Check that all environment variables are added correctly
2. Redeploy: Click Redeploy in Vercel Dashboard

### Issue: "Database connection failed"
**Solution**:
1. Verify DATABASE_URL is correct (check for typos)
2. Test connection: `cd packages/database && npx prisma db pull`
3. Check Neon database is active at https://console.neon.tech

### Issue: Login not working
**Solution**:
1. Verify you created admin user (Step 7)
2. Check JWT_SECRET and NEXTAUTH_SECRET are set
3. Check browser console for errors (F12)

### Issue: Deployment fails during build
**Solution**:
1. Check build logs in Vercel Dashboard
2. Test local build: `cd services/ash-admin && pnpm build`
3. If local build works, redeploy to Vercel

### Issue: "Function Timeout" errors
**Solution**:
1. Go to Project Settings → Functions
2. Increase timeout to 60 seconds
3. Redeploy

---

## 📊 POST-DEPLOYMENT CHECKLIST

After successful deployment:

- [ ] Change admin password from default
- [ ] Test all major features (Orders, Finance, QR, Mobile)
- [ ] Verify API endpoints respond
- [ ] Check database connections
- [ ] Test authentication flow
- [ ] Enable Vercel Analytics (Settings → Analytics)
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Configure custom domain (optional)
- [ ] Set up backup schedule
- [ ] Create additional user accounts
- [ ] Test mobile app connection (if ready)

---

## 🔐 SECURITY REMINDERS

After deployment:

1. **Change Default Password**: Login and change admin password immediately
2. **Secure PRODUCTION-SECRETS.txt**: Move it somewhere safe, don't commit to Git
3. **Add .gitignore Entry**: Ensure PRODUCTION-SECRETS.txt is ignored
4. **Enable 2FA**: Set up two-factor authentication on Vercel account
5. **Monitor Logs**: Check Vercel logs regularly for suspicious activity

---

## 📱 NEXT STEPS AFTER DEPLOYMENT

### Option 1: Deploy Mobile Apps
1. Update mobile config with production URL
2. Create app icons (see APP-ICON-GUIDE.md)
3. Build with EAS: `cd services/ash-mobile && eas build --platform all`
4. Submit to app stores

### Option 2: Custom Domain
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `admin.ashleyai.com`)
3. Update DNS records as instructed
4. Update NEXTAUTH_URL environment variable

### Option 3: Team Setup
1. Create user accounts for your team
2. Assign appropriate roles (admin, manager, staff)
3. Train team on Ashley AI features
4. Set up workflows and processes

---

## 📚 DOCUMENTATION REFERENCE

- **PRODUCTION-SECRETS.txt**: Your environment variables
- **PRODUCTION-DEPLOYMENT-MASTER-GUIDE.md**: Complete guide (900+ lines)
- **DEPLOY-NOW.md**: Quick reference
- **READY-TO-DEPLOY-NOW.md**: Status report
- **SECURITY-AUDIT-REPORT.md**: Security assessment

---

## 🆘 NEED HELP?

If you run into issues:

1. Check deployment logs in Vercel Dashboard
2. Review error messages carefully
3. Test locally first: `pnpm build && pnpm start`
4. Check environment variables are correct
5. Verify database is accessible
6. Review documentation files

---

## 🎊 CONGRATULATIONS!

Once deployed, your Ashley AI manufacturing ERP system will be:

✨ **Live and accessible worldwide**
✨ **Running on Vercel's global CDN**
✨ **Protected with production-grade security**
✨ **Connected to your PostgreSQL database**
✨ **Ready for real-world manufacturing operations**

**You've built a complete manufacturing ERP system!** 🎉

---

**Current Status**: Ready to execute Step 1
**Next Action**: Run `cd services/ash-admin && vercel --prod`

🚀 **LET'S DEPLOY!**
