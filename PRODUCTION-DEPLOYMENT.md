# Ashley AI - Production Deployment Guide

**Complete guide para i-deploy ang Ashley AI sa real internet website with real email authentication**

---

## 🚀 Overview

Gagawin nating **LIVE** ang Ashley AI with:
- ✅ Real website accessible from anywhere (not just localhost)
- ✅ Real email authentication (email verification, password reset)
- ✅ Production-grade PostgreSQL database
- ✅ Secure HTTPS with custom domain
- ✅ Free hosting option available

---

## 📋 Prerequisites (Kailangan mo muna)

1. **GitHub Account** - Para i-store ang code at automatic deployment
2. **Vercel Account** - Free hosting platform (https://vercel.com)
3. **Neon Account** - Free PostgreSQL database (https://neon.tech)
4. **Resend Account** - Free email service (https://resend.com)
5. **Domain Name** (Optional) - E.g., ashleyai.com, kung gusto mo custom domain

---

## 🎯 Step-by-Step Deployment

### **STEP 1: Setup GitHub Repository**

1. **Create GitHub Repository**
   ```bash
   cd "C:\Users\Khell\Desktop\Ashley AI"
   git init
   git add .
   git commit -m "Initial commit - Ashley AI Production Ready"
   ```

2. **Push to GitHub**
   - Go to https://github.com/new
   - Create new repository: `ashley-ai-production`
   - Copy the remote URL
   - Run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ashley-ai-production.git
   git branch -M main
   git push -u origin main
   ```

---

### **STEP 2: Setup Neon Database (Free PostgreSQL)**

1. **Sign up at Neon.tech**
   - Go to https://neon.tech
   - Click "Sign Up" - use Google/GitHub
   - Create new project: "Ashley AI Production"

2. **Get Database Connection String**
   - Click on your project
   - Go to "Connection Details"
   - Copy the **Pooled connection string** (mas mabilis ito)
   - Example format:
   ```
   postgresql://username:password@ep-xxx.neon.tech/ashleyai?sslmode=require
   ```

3. **Save this connection string** - kailangan natin later sa Vercel

---

### **STEP 3: Setup Resend Email Service**

1. **Sign up at Resend.com**
   - Go to https://resend.com
   - Click "Sign Up" - free tier: 3,000 emails/month
   - Verify your email

2. **Get API Key**
   - Go to "API Keys" section
   - Click "Create API Key"
   - Name it: "Ashley AI Production"
   - Copy the API key (starts with `re_`)
   - **SAVE THIS KEY** - hindi mo na makikita ulit!

3. **Setup Domain (Optional but recommended)**
   - Go to "Domains" section
   - Add your domain (e.g., ashleyai.com)
   - Add DNS records as instructed
   - **OR** use default: `onboarding@resend.dev` (testing only)

---

### **STEP 4: Deploy to Vercel**

1. **Sign up at Vercel.com**
   - Go to https://vercel.com
   - Click "Sign Up" - use GitHub account
   - Authorize Vercel to access your GitHub repos

2. **Import Project**
   - Click "Add New Project"
   - Select `ashley-ai-production` repository
   - Framework Preset: **Next.js**
   - Root Directory: `services/ash-admin`
   - Click "Deploy"

3. **Configure Build Settings**

   **Build Command:**
   ```bash
   cd ../.. && pnpm install && cd packages/database && npx prisma generate && cd ../../services/ash-admin && pnpm build
   ```

   **Install Command:**
   ```bash
   cd ../.. && pnpm install
   ```

   **Output Directory:** `.next`

---

### **STEP 5: Configure Environment Variables in Vercel**

1. **Go to Project Settings**
   - Click on your deployed project
   - Go to "Settings" > "Environment Variables"

2. **Add the following variables:**

   ```bash
   # Database
   DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/ashleyai?sslmode=require

   # JWT Secrets (Generate using: openssl rand -base64 32)
   JWT_SECRET=your-generated-secret-here
   JWT_REFRESH_SECRET=your-generated-refresh-secret-here

   # Email Service
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=Ashley AI <noreply@ashleyai.com>

   # App URL (Replace with your Vercel URL)
   NEXT_PUBLIC_APP_URL=https://ashley-ai-production.vercel.app

   # Environment
   NODE_ENV=production
   ```

3. **Generate JWT Secrets** (Run locally):
   ```bash
   # Generate JWT_SECRET
   openssl rand -base64 32

   # Generate JWT_REFRESH_SECRET
   openssl rand -base64 32
   ```

---

### **STEP 6: Run Database Migrations**

1. **Update Local .env**
   ```bash
   # Copy production .env example
   cp services/ash-admin/.env.production.example services/ash-admin/.env.production
   ```

2. **Edit .env.production** - add your Neon database URL

3. **Run Prisma Migrations**
   ```bash
   cd packages/database
   npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```

4. **Seed Initial Data** (Optional)
   ```bash
   npx prisma db seed
   ```

---

### **STEP 7: Redeploy Vercel**

1. Go back to Vercel dashboard
2. Click "Deployments"
3. Click "Redeploy" (para ma-apply ang environment variables)
4. Wait for deployment to complete

---

### **STEP 8: Test Your Production Website**

1. **Open your website:**
   - https://ashley-ai-production.vercel.app (or your custom domain)

2. **Create New Account:**
   - Click "Register" or "Sign Up"
   - Fill in details:
     - Email: your-real-email@gmail.com
     - Password: SecurePass123!
     - Name: Your Name
     - Workspace Name: Ashley AI
   - Click "Create Account"

3. **Check Email Inbox:**
   - Open your email inbox
   - Look for "Welcome to Ashley AI - Verify Your Email"
   - Click the verification link
   - Account activated!

4. **Login:**
   - Go back to website
   - Login with your email and password
   - You're now logged in to production Ashley AI!

---

## 📧 Email Features Available

### ✅ **1. Welcome Email with Verification**
- Sent when user creates account
- Contains email verification link (24-hour expiry)
- Professional Ashley AI branding

### ✅ **2. Email Verification**
- Endpoint: `/auth/verify-email?token=xxx`
- Validates email address
- Activates user account

### ✅ **3. Password Reset**
- User clicks "Forgot Password"
- Email sent with reset link (1-hour expiry)
- Secure password reset flow

### ✅ **4. Order Notifications**
- Order confirmation emails
- Status update notifications
- Delivery tracking notifications

### ✅ **5. Invoice Emails**
- Automated invoice generation
- Payment reminders
- Receipt confirmations

---

## 💰 Cost Breakdown (Monthly)

### **Free Tier (Recommended for Testing)**
- Vercel Hosting: **FREE** (100GB bandwidth)
- Neon Database: **FREE** (0.5GB storage, 1GB compute)
- Resend Emails: **FREE** (3,000 emails/month)
- **Total: ₱0/month**

### **Paid Tier (For Production Scale)**
- Vercel Pro: $20/month (~₱1,100)
- Neon Scale: $19/month (~₱1,050) - unlimited compute
- Resend Pro: $20/month (~₱1,100) - 50,000 emails
- Domain: $12/year (~₱55/month)
- **Total: ~₱3,305/month**

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] GitHub repository created and pushed
- [ ] Neon database created and connection string saved
- [ ] Resend account created and API key saved
- [ ] Vercel project deployed successfully
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Test user registration works
- [ ] Email verification received and works
- [ ] Password reset works
- [ ] Login/logout works
- [ ] Orders can be created
- [ ] Invoices can be generated
- [ ] Custom domain configured (optional)

---

## 🎉 Congratulations!

Kapag na-complete mo lahat ng steps, **LIVE NA** ang Ashley AI production website with real email authentication!

Your users can now:
- ✅ Access the website from anywhere
- ✅ Create real accounts with email verification
- ✅ Receive real emails (welcome, verification, password reset)
- ✅ Manage orders and operations
- ✅ Use the complete manufacturing ERP system

**Share the URL to your team and clients!** 🚀
