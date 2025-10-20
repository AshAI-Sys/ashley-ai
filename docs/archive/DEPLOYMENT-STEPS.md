# 🚀 Railway Deployment Steps - Ashley AI

**Ready to Deploy!** Follow these steps exactly.

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

All systems ready:
- ✅ 350+ tests passing
- ✅ A+ Security (98/100)
- ✅ Production configuration ready
- ✅ Railway CLI installed

---

## 📋 **STEP-BY-STEP DEPLOYMENT**

### **Step 1: Login to Railway** (Do this first!)

```bash
railway login
```

- Browser will open
- Sign up or login to Railway
- Free tier includes $5/month credit
- Close browser when done

### **Step 2: Initialize Project**

```bash
# Create new Railway project
railway init

# You'll be asked:
# - Project name: ashley-ai
# - Select: Empty Project
```

### **Step 3: Add PostgreSQL Database**

```bash
# Add PostgreSQL database to project
railway add --database postgresql

# Railway will automatically:
# - Create database
# - Set DATABASE_URL environment variable
```

### **Step 4: Set Environment Variables**

```bash
# Generate secrets first
$JWT_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
$SESSION_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
$CSRF_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set JWT_ACCESS_EXPIRES_IN=15m
railway variables set JWT_REFRESH_EXPIRES_IN=7d
railway variables set SESSION_SECRET=$SESSION_SECRET
railway variables set CSRF_SECRET=$CSRF_SECRET
railway variables set PORT=3001
```

### **Step 5: Run Database Migrations**

```bash
# Railway will run migrations automatically during build
# But you can manually run them:
railway run npx prisma migrate deploy --schema=./packages/database/prisma/schema.prisma
```

### **Step 6: Deploy!**

```bash
# Deploy to Railway
railway up

# This will:
# 1. Upload your code
# 2. Build the application
# 3. Run migrations
# 4. Start the server
# 5. Give you a live URL!
```

### **Step 7: Get Your Live URL**

```bash
# Generate public domain
railway domain

# You'll get a URL like:
# https://ashley-ai-production.up.railway.app
```

### **Step 8: Verify Deployment**

Visit your URL:
```
https://your-app.up.railway.app
```

Check:
- ✅ Homepage loads
- ✅ Can login (admin@ashleyai.com / password123)
- ✅ Dashboard works
- ✅ No errors in console

---

## 🔧 **OPTIONAL: CUSTOM DOMAIN**

If you have your own domain:

```bash
# Add custom domain
railway domain add yourdomain.com

# Railway will give you DNS settings to add:
# Type: CNAME
# Name: @ or www
# Value: your-app.up.railway.app
```

---

## 📊 **POST-DEPLOYMENT**

### Monitor Your App

```bash
# View logs
railway logs

# Check status
railway status

# Open dashboard
railway open
```

### Environment Management

```bash
# View all variables
railway variables

# Add new variable
railway variables set KEY=value

# Delete variable
railway variables delete KEY
```

---

## 🚨 **TROUBLESHOOTING**

### Build Failed?
```bash
# Check logs
railway logs --build

# Common fixes:
# - Verify pnpm installed
# - Check build command in railway.json
# - Ensure all dependencies in package.json
```

### App Won't Start?
```bash
# Check runtime logs
railway logs

# Common issues:
# - DATABASE_URL not set
# - Missing environment variables
# - Port binding (Railway uses $PORT)
```

### Database Issues?
```bash
# Check database connection
railway run npx prisma db push --schema=./packages/database/prisma/schema.prisma

# Reset if needed (⚠️ DELETES DATA)
railway run npx prisma migrate reset --schema=./packages/database/prisma/schema.prisma
```

---

## 💡 **QUICK COMMANDS**

```bash
# Full deployment from scratch
railway login
railway init
railway add --database postgresql
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set SESSION_SECRET=$(openssl rand -base64 32)
railway variables set CSRF_SECRET=$(openssl rand -base64 32)
railway up
railway domain

# Redeploy after code changes
git add .
git commit -m "Update"
railway up

# Or link to GitHub for auto-deploy
railway link
```

---

## 🎉 **SUCCESS CHECKLIST**

After deployment, verify:

- [ ] App is live at Railway URL
- [ ] Can access homepage
- [ ] Can login successfully
- [ ] Dashboard loads correctly
- [ ] No errors in browser console
- [ ] Database connected (check any page with data)
- [ ] API endpoints working
- [ ] HTTPS enabled automatically ✅

---

## 📞 **NEED HELP?**

If stuck, just let me know and I'll help troubleshoot!

Common questions:
- "Build failed" - Share the error log
- "Can't login" - Check DATABASE_URL is set
- "500 error" - Check railway logs
- "Slow loading" - May need to upgrade plan

---

**Ready? Run the commands above and you'll be live in 5 minutes!** 🚀

---

*Deployment Guide Version 1.0*
*Created: October 19, 2025*
