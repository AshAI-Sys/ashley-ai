# FREE Deployment Guide - Ashley AI

**Cost: ₱0 per month**
**Best for: 1-5 clients, Testing, Demo**

---

## 🎯 Quick Summary

Deploy Ashley AI completely FREE using:

- **Vercel** (Frontend - ash-admin & ash-portal)
- **Neon** (PostgreSQL Database)
- **Upstash** (Redis Cache - Optional)

**Total Monthly Cost: ₱0**

---

## Step 1: Setup Neon Database (FREE PostgreSQL)

### 1.1 Create Neon Account

1. Go to https://neon.tech
2. Sign up with GitHub/Google (free)
3. Create new project: "ashley-ai-prod"

### 1.2 Get Database URL

```
Neon will give you a connection string like:
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/ashley_ai?sslmode=require
```

Copy this - you'll need it later!

### 1.3 FREE Tier Limits

- ✅ 0.5 GB storage (enough for 1-5 clients)
- ✅ 1 database
- ✅ Automatic backups
- ✅ No credit card required

---

## Step 2: Prepare Your Code

### 2.1 Update Database Connection

Open `.env` and update:

```bash
# Replace with your Neon URL
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/ashley_ai?sslmode=require"
```

### 2.2 Push Database Schema

```bash
cd packages/database
npx prisma generate
npx prisma db push
```

This creates all your tables in Neon!

---

## Step 3: Deploy to Vercel (FREE)

### 3.1 Install Vercel CLI

```bash
npm i -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

### 3.3 Deploy Admin Interface

```bash
cd services/ash-admin
vercel
```

Follow the prompts:

- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **ashley-ai-admin**
- Directory? **./services/ash-admin** (press Enter)
- Override settings? **N**

### 3.4 Add Environment Variables

After deployment, add your env vars:

```bash
vercel env add DATABASE_URL
```

Paste your Neon database URL when prompted.

Add other required variables:

```bash
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 3.5 Deploy Client Portal

```bash
cd services/ash-portal
vercel
```

Same process as admin!

### 3.6 Deploy Again (with env vars)

```bash
cd services/ash-admin
vercel --prod

cd services/ash-portal
vercel --prod
```

---

## Step 4: Access Your Website

Vercel will give you URLs like:

- **Admin**: https://ashley-ai-admin.vercel.app
- **Portal**: https://ashley-ai-portal.vercel.app

---

## 🎉 Done! Your Website is LIVE and FREE!

### What You Get (FREE Tier)

| Feature          | Limit        | Enough for?          |
| ---------------- | ------------ | -------------------- |
| Database Storage | 0.5 GB       | 1-5 clients ✅       |
| Bandwidth        | 100 GB/month | 100+ visitors/day ✅ |
| Deployments      | Unlimited    | Yes ✅               |
| Custom Domain    | 1 free       | Yes ✅               |
| SSL Certificate  | Free         | Yes ✅               |

---

## 📊 When to Upgrade?

Upgrade to BUDGET plan (₱1,500/month) when:

- ❌ Database exceeds 0.5 GB (6-10 clients)
- ❌ More than 100 visitors per day
- ❌ Need faster response times
- ❌ Need email notifications (Resend/SendGrid)

---

## 🔧 Optional: Add Redis Cache (FREE)

### Why Redis?

- Faster page loads
- Better performance
- Still FREE!

### Setup Upstash Redis

1. Go to https://upstash.com
2. Sign up (free)
3. Create database: "ashley-ai-cache"
4. Copy the `REDIS_URL`

### Add to Vercel

```bash
vercel env add REDIS_URL
```

Paste your Upstash URL, then redeploy:

```bash
vercel --prod
```

---

## ⚠️ Important Notes

### FREE Tier Limitations

- Database sleeps after 5 minutes of inactivity (wakes up automatically)
- First request after sleep may be slow (1-2 seconds)
- 0.5 GB storage limit

### Recommended for FREE Tier

- ✅ Testing and demos
- ✅ 1-5 clients
- ✅ Low traffic websites
- ✅ Proof of concept

### NOT Recommended for FREE Tier

- ❌ 10+ active clients
- ❌ High traffic (100+ daily users)
- ❌ Production business with SLA requirements

---

## 🚀 Upgrade Path

When you outgrow FREE tier:

```
FREE (₱0)
  ↓
BUDGET (₱1,500/month)
  ↓
STANDARD (₱4,500/month)
```

See `COST_OPTIMIZATION_GUIDE.md` for upgrade details.

---

## 🆘 Troubleshooting

### Database Connection Error

```
Error: Can't reach database server
```

**Fix**: Check your DATABASE_URL is correct in Vercel env vars

### Build Failed

```
Error: Module not found
```

**Fix**:

```bash
pnpm install
vercel --prod
```

### Slow First Load

This is normal on FREE tier - database wakes from sleep. Subsequent loads will be fast!

---

## 📱 Next Steps

1. Test your website thoroughly
2. Add your first client
3. Monitor usage in Neon dashboard
4. When ready, upgrade to BUDGET plan

**Enjoy your FREE manufacturing ERP system! 🎉**
