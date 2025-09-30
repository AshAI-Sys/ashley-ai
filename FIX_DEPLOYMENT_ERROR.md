# 🔧 Fix Deployment Error - "Application error: a client-side exception has occurred"

## Current Issue
The live website shows an error on the login page. This is typically caused by missing or incorrect environment variables.

## Quick Fix (2 minutes)

### Step 1: Add Missing Environment Variable

1. **Go to Vercel Environment Variables:**
   https://vercel.com/ash-ais-projects/ash-admin/settings/environment-variables

2. **Add this variable:**
   - **Key:** `NEXTAUTH_URL`
   - **Value:** `https://ash-admin-4ywgoaitx-ash-ais-projects.vercel.app`
   - **Environments:** Check "Production" only
   - Click **"Save"**

3. **Verify these variables are already set:**
   - ✅ `DATABASE_URL` (should be the Neon PostgreSQL URL)
   - ✅ `ASH_JWT_SECRET` (should be: hAvhfQSnLTXdmYfZpJefaWzqeoUeTlOQOqW4iYmHfts=)
   - ✅ `NEXTAUTH_SECRET` (should be: hAvhfQSnLTXdmYfZpJefaWzqeoUeTlOQOqW4iYmHfts=)

### Step 2: Redeploy

1. **Go to Deployments:**
   https://vercel.com/ash-ais-projects/ash-admin

2. **Click the latest deployment** (the one with the URL ending in 4ywgoaitx)

3. **Click "..." menu** → **"Redeploy"**

4. **Click "Redeploy"** to confirm

5. **Wait 2-3 minutes** for deployment to complete

### Step 3: Test Again

1. Open: https://ash-admin-4ywgoaitx-ash-ais-projects.vercel.app/login
2. You should now see the login form
3. Login with:
   - Email: `admin@ashleyai.com`
   - Password: `Admin@12345`

---

## Alternative: Check Browser Console for Specific Error

If the above doesn't work, please:

1. **Press F12** on the error page
2. **Click "Console" tab**
3. **Take a screenshot** of the red error messages
4. This will tell us exactly what's wrong

---

## Common Errors and Fixes

### Error: "NEXTAUTH_URL is not defined"
**Fix:** Add NEXTAUTH_URL environment variable as shown above

### Error: "Database connection failed"
**Fix:** Verify DATABASE_URL is correctly set to Neon PostgreSQL URL

### Error: "Invalid token" or "JWT malformed"
**Fix:** Verify ASH_JWT_SECRET and NEXTAUTH_SECRET match

### Error: "Module not found"
**Fix:** The build was successful, so this is unlikely. Check console for details.

---

## Current Environment Variables

These should be set in Vercel:

```env
DATABASE_URL=postgresql://neondb_owner:npg_Il0Wxopyjv5n@ep-snowy-firefly-a1wq4mcr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

ASH_JWT_SECRET=hAvhfQSnLTXdmYfZpJefaWzqeoUeTlOQOqW4iYmHfts=

NEXTAUTH_SECRET=hAvhfQSnLTXdmYfZpJefaWzqeoUeTlOQOqW4iYmHfts=

NEXTAUTH_URL=https://ash-admin-4ywgoaitx-ash-ais-projects.vercel.app
```

---

## Status Check

After redeploying, the website should:
- ✅ Show login form (not error)
- ✅ Accept username/password
- ✅ Redirect to dashboard after login
- ✅ Show "Ashley AI" branding

---

**Most likely cause:** Missing NEXTAUTH_URL environment variable
**Expected fix time:** 2-3 minutes after adding variable and redeploying