# Ashley AI - Quick Deployment Steps

**Last Updated**: November 13, 2025
**Time to Complete**: ~30-60 minutes

---

## Prerequisites Checklist

- [ ] Git account with repo pushed
- [ ] Vercel account (sign up at vercel.com)
- [ ] Credit card for external services (optional)

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Sign Up for External Services (15 mins)

#### A. Semaphore SMS (Philippines)
```
1. Visit: https://semaphore.co
2. Click "Sign Up"
3. Verify email and phone
4. Go to API section
5. Copy API Key (save it!)
6. Set Sender Name: ASHLEYAI
```

#### B. PostgreSQL Database (Choose ONE)

**Option 1: Railway (Recommended - Easiest)**
```
1. Visit: https://railway.app
2. Sign up with GitHub
3. New Project → PostgreSQL
4. Copy "Postgres Connection URL"
```

**Option 2: Supabase (Good free tier)**
```
1. Visit: https://supabase.com
2. Sign up with GitHub
3. New Project → Create
4. Settings → Database → Copy connection string
```

**Option 3: Neon (Serverless)**
```
1. Visit: https://neon.tech
2. Sign up with GitHub
3. Create Project
4. Copy connection string from dashboard
```

---

### Step 2: Deploy to Vercel (10 mins)

#### Option A: Through Website (Easiest)
```
1. Visit: https://vercel.com
2. Sign up with GitHub
3. Import Git Repository
4. Select "ashley-ai" repo
5. Root Directory: services/ash-admin
6. Click Deploy
```

#### Option B: Using CLI
```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to admin folder
cd services/ash-admin

# Login
vercel login

# Deploy
vercel --prod
```

---

### Step 3: Configure Environment Variables (15 mins)

In Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these variables** (use template from .env.production.template):

```env
# REQUIRED - Database
DATABASE_URL=your_postgresql_connection_string

# REQUIRED - Security
JWT_SECRET=generate-with-openssl-rand-base64-32
JWT_REFRESH_SECRET=generate-another-secret

# REQUIRED - SMS
SEMAPHORE_API_KEY=your_semaphore_key
SEMAPHORE_SENDER_NAME=ASHLEYAI

# OPTIONAL - Email (if you want email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OPTIONAL - AI Features
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

**Generate secrets:**
```powershell
# On Windows PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

After adding variables, **redeploy**:
- Vercel Dashboard → Deployments → Click "..." → Redeploy

---

### Step 4: Setup Production Database (5 mins)

```powershell
# Set your production DATABASE_URL
$env:DATABASE_URL="your_postgresql_connection_string"

# Push schema to production
cd packages/database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Verify connection
npx prisma studio
```

---

### Step 5: Build Mobile App APK (20 mins)

```powershell
# Install EAS CLI
npm install -g eas-cli

# Navigate to mobile app
cd services/ash-mobile

# Login to Expo
eas login

# Configure build (first time only)
eas build:configure

# Build APK
eas build --platform android --profile production

# Monitor build
# You'll get a URL to track progress
# Download APK when complete (~15 mins)
```

**Faster preview build:**
```powershell
eas build --platform android --profile preview
```

---

### Step 6: Test Production Deployment (10 mins)

#### A. Automated Testing
```powershell
# Run test script
.\test-production.ps1 -BaseUrl "https://your-app.vercel.app"
```

#### B. Manual Testing Checklist

Visit your Vercel URL and test:

- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays
- [ ] Create leave request
- [ ] Create driver profile
- [ ] Process sale
- [ ] View reports

#### C. Mobile App Testing

1. Download APK to Android device
2. Install APK
3. Login with credentials
4. Scan QR code
5. Process a sale
6. Check inventory

---

## 🎯 Quick Commands Reference

```powershell
# Deploy to Vercel
cd services/ash-admin
vercel --prod

# Build mobile app
cd services/ash-mobile
eas build -p android

# Update database schema
cd packages/database
npx prisma db push

# Test production
.\test-production.ps1 -BaseUrl "https://your-app.vercel.app"

# View database
npx prisma studio
```

---

## ⚡ One-Command Deployment

Use the automated script:

```powershell
.\deploy-to-production.ps1
```

This script will:
1. ✅ Check Git status
2. ✅ Install dependencies
3. ✅ Build application
4. ✅ Deploy to Vercel
5. ✅ (Optional) Build mobile app

---

## 🔍 Troubleshooting

### Issue: Vercel build fails
**Solution**: Check build logs, ensure DATABASE_URL is set

### Issue: Can't connect to database
**Solution**: Verify connection string, check firewall, try from Vercel terminal

### Issue: SMS not sending
**Solution**: Check Semaphore balance, verify API key, test API directly

### Issue: Mobile app crashes
**Solution**: Update EXPO_PUBLIC_API_URL to point to production

### Issue: 500 errors in production
**Solution**: Check Vercel logs, verify all env variables are set

---

## 📱 Getting Production URL

After deploying to Vercel:

1. Go to Vercel Dashboard
2. Click on your project
3. Copy the URL (e.g., `ashley-ai-xxx.vercel.app`)
4. Add to mobile app config

---

## ✅ Production Checklist

### Before Launch
- [ ] All environment variables set in Vercel
- [ ] Database schema pushed to production
- [ ] Test login works
- [ ] Test critical features
- [ ] Mobile app APK built and tested
- [ ] SMS delivery tested
- [ ] Email delivery tested (if using)

### After Launch
- [ ] Monitor error logs (first 24 hours)
- [ ] Check database performance
- [ ] Verify all integrations working
- [ ] Test on multiple devices
- [ ] Document any issues

---

## 📞 Support Resources

- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app
- **Supabase**: https://supabase.com/docs
- **Expo**: https://docs.expo.dev
- **Semaphore**: https://semaphore.co/docs

---

## 🎉 You're Done!

Your Ashley AI system is now live in production!

**Production URL**: `https://your-app.vercel.app`
**Mobile APK**: Download from EAS build dashboard

---

**Questions?** Review PRODUCTION-DEPLOYMENT-GUIDE.md for detailed instructions.

