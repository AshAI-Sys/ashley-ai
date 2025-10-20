# ⚡ Quick Start: Deploy to Vercel or Railway

**5-minute setup guide for Ashley AI email verification**

---

## 🔥 Vercel (Recommended for Next.js)

### 1. Deploy
```bash
# Connect GitHub repo at vercel.com/new
# Root Directory: services/ash-admin
# Click Deploy
```

### 2. Add Database
```
Vercel Dashboard → Storage → Create Database → Postgres
(Auto-configures DATABASE_URL)
```

### 3. Add Environment Variables
```bash
# Go to Settings → Environment Variables

# Security (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=<your-secret>
JWT_SECRET=<your-secret>
ENCRYPTION_KEY=<openssl-rand-hex-32>

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app

# Email (get from resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Ashley AI <noreply@yourdomain.com>

# Features
ENABLE_2FA=true
ENABLE_EMAIL_NOTIFICATIONS=true

# File Storage (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### 4. Run Migrations
```bash
vercel env pull
npx prisma db push
```

### 5. Test
Visit `https://your-app.vercel.app/register`

---

## 🚂 Railway

### 1. Deploy
```bash
# railway.app/new
# Deploy from GitHub repo
# Root: services/ash-admin
```

### 2. Add Database
```
Click + New → Database → PostgreSQL
(Auto-provides ${{Postgres.DATABASE_URL}})
```

### 3. Add Environment Variables
```bash
# Go to Variables tab

DATABASE_URL=${{Postgres.DATABASE_URL}}

NEXTAUTH_SECRET=<generate>
JWT_SECRET=<generate>
ENCRYPTION_KEY=<generate-hex>

NEXT_PUBLIC_APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}

RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Ashley AI <noreply@yourdomain.com>

ENABLE_2FA=true
ENABLE_EMAIL_NOTIFICATIONS=true
NODE_ENV=production

CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### 4. Run Migrations
```bash
railway run npx prisma db push
```

### 5. Test
Visit Railway-provided URL

---

## 📧 Resend Setup (5 minutes)

### 1. Create Account
https://resend.com → Sign up (free)

### 2. Get API Key
Dashboard → API Keys → Create API Key → Copy `re_xxx`

### 3. Verify Domain
```
Dashboard → Domains → Add Domain
Add these DNS records to your domain:

MX    @    feedback-smtp.us-east-1.amazonses.com    10
TXT   @    v=spf1 include:amazonses.com ~all
CNAME resend._domainkey    resend._domainkey.amazonses.com

Wait 5-10 minutes → Refresh → Status: Verified ✅
```

### 4. Test
Dashboard → Domains → Send Test Email

---

## ☁️ Cloudinary Setup (3 minutes)

### 1. Create Account
https://cloudinary.com → Sign up (free)

### 2. Get Credentials
Dashboard shows:
- Cloud Name
- API Key
- API Secret

### 3. Copy to Environment Variables
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=1234567890123456
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## ✅ Test Email Verification

### 1. Register
Visit `/register` on your deployed app

### 2. Check Email
Look for email from `noreply@yourdomain.com`
(Check spam if not in inbox)

### 3. Click Link
Opens `/verify-email?token=xxx`
Shows "Email Verified!" → Auto-redirects to login

### 4. Login
Use email/password from registration
Should access dashboard successfully

---

## 🔧 Generate Secrets

```bash
# NEXTAUTH_SECRET, JWT_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY (32-byte hex)
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ⚠️ Common Issues

### Emails Not Sending
```
✅ RESEND_API_KEY starts with re_
✅ EMAIL_FROM matches verified domain
✅ Domain verified in Resend dashboard
✅ NEXT_PUBLIC_APP_URL is production domain
```

### Database Errors
```
✅ DATABASE_URL ends with ?sslmode=require
✅ Ran npx prisma db push
✅ Database accepts connections from platform IPs
```

### Build Failures
```
✅ Root directory: services/ash-admin
✅ Build command: pnpm install && pnpm build
✅ All required env vars set
```

---

## 🎯 Minimum Required Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Security
NEXTAUTH_SECRET=xxx
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://...
NEXTAUTH_URL=https://...

# Email (CRITICAL)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com

# Features
ENABLE_2FA=true
ENABLE_EMAIL_NOTIFICATIONS=true

# Storage
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## 📚 Full Documentation

See `DEPLOYMENT-GUIDE.md` for complete instructions

---

**Deployment Time**: ~10 minutes
**Ashley AI Manufacturing ERP** v1.0.0
