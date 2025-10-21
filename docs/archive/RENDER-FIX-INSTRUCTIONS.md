# URGENT: Fix Ashley AI Render Deployment

## Current Problem

Your deployment is **FAILING** because of incorrect Root Directory setting in Render dashboard.

**Error you're seeing**:

```
Module not found: Can't resolve '@/components/dashboard-layout'
Module not found: Can't resolve '@/components/PermissionGate'
Build failed because of webpack errors
```

**Root Cause**: The "Root Directory" field in Render is **BLANK**, so it's building from the repository root instead of from `services/ash-admin` where the Next.js configuration is located.

---

## HOW TO FIX (Follow These Exact Steps)

### Step 1: Update Root Directory

1. **You should already be on the Settings page** (based on your screenshots)
2. **Scroll to the "Build & Deploy" section**
3. **Find the "Root Directory" field** (currently showing as blank/empty)
4. **Click the "Edit" button** next to Root Directory
5. **Type in**: `services/ash-admin`
6. **Click "Save"** or press Enter

### Step 2: Update Build Command

1. **Find the "Build Command" field** (currently shows the long command with multiple `cd` commands)
2. **Click the "Edit" button**
3. **DELETE the current command completely**
4. **Type in this EXACT command**:
   ```bash
   cd ../.. && pnpm install && cd packages/database && npx prisma generate && cd ../../services/ash-admin && pnpm run build
   ```
5. **Click "Save"**

### Step 3: Update Start Command

1. **Find the "Start Command" field**
2. **Click the "Edit" button**
3. **DELETE the current command**
4. **Type in**:
   ```bash
   pnpm start
   ```
5. **Click "Save"**

### Step 4: Trigger Deployment

1. **Look for "Manual Deploy" button** at the top of the page
2. **Click "Manual Deploy"** → **"Deploy latest commit"**
3. OR just **click "Save Changes"** at the bottom if available
4. **Render will automatically start a new deployment**

### Step 5: Watch the Build

1. **Click the "Logs" tab** at the top
2. **Watch the build progress**
3. **Look for these SUCCESS messages**:
   - `Environment: production`
   - `Creating an optimized production build...`
   - `Compiled successfully`
   - `Build successful`
4. **Wait about 5-10 minutes** for the build to complete

---

## What Should Happen After Fix

Once you save the changes, Render will:

1. ✅ Build from the correct directory (`services/ash-admin`)
2. ✅ Resolve all `@/components` path aliases correctly
3. ✅ Complete the build successfully
4. ✅ Deploy your application
5. ✅ Your site will be live at: **https://ashley-ai.onrender.com**

---

## Summary of Changes

| Setting            | OLD (Wrong)                                                                              | NEW (Correct)                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Root Directory** | _(blank)_                                                                                | `services/ash-admin`                                                                                                       |
| **Build Command**  | `pnpm install --frozen-lockfile=false && cd packages/database && npx prisma generate...` | `cd ../.. && pnpm install && cd packages/database && npx prisma generate && cd ../../services/ash-admin && pnpm run build` |
| **Start Command**  | `cd services/ash-admin && pnpm start`                                                    | `pnpm start`                                                                                                               |

---

## After Successful Deployment

### Test Your Website

1. **Visit**: https://ashley-ai.onrender.com
2. **Login with any credentials** (demo mode enabled):
   - Email: `admin@ashleyai.com`
   - Password: `password123`
3. **Test these pages**:
   - Dashboard
   - Orders
   - Finance
   - HR & Payroll

### Run Database Migrations

1. **Go to Render dashboard**
2. **Click on "ashley-ai" service**
3. **Click "Shell" tab**
4. **Run these commands**:
   ```bash
   cd packages/database
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## If It Still Fails

If you still see errors after making these changes:

1. **Check the Logs tab** for the exact error message
2. **Take a screenshot** of the error
3. **Send the screenshot** so we can diagnose further

But with these settings, it **SHOULD WORK** because:

- ✅ Root Directory is now correct
- ✅ Build command runs from the right location
- ✅ Path aliases will resolve correctly
- ✅ All environment variables are already set

---

**Created**: 2025-10-17
**Priority**: URGENT - Fix Required for Deployment
**Estimated Time**: 2-3 minutes to update settings, 5-10 minutes for build
