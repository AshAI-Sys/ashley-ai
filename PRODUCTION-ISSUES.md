# Production Issues - Ashley AI on Render

**Date**: October 7, 2025
**URL**: https://ashley-aiy.onrender.com

---

## 🔴 Critical Issues Found

### 1. **Database Not Seeded** (CRITICAL)
**Error**: `Failed to load resource: /api/clients - 400`

**Cause**:
- Production PostgreSQL database is empty
- No workspace, users, or demo data exists
- The database was created but never seeded

**Solution**:
Open this URL in browser to seed the database:
```
https://ashley-aiy.onrender.com/api/seed?token=ashley-ai-seed-2024
```

This will create:
- Demo workspace (`demo-workspace-1`)
- Admin user (`admin@ashleyai.com` / `password123`)
- 2 demo clients (Manila Shirts Co., Cebu Sports Apparel)
- Demo brands and orders

---

### 2. **React Hydration Errors** (HIGH)
**Error**: `Minified React error #418 and #423`

**Cause**:
- Toast notifications or other components rendering differently on server vs client
- Possible datetime formatting inconsistencies
- Component state initialization issues

**Potential Solutions**:
1. Wrap toast provider in client-only component
2. Use `useEffect` for client-side only rendering
3. Add `suppressHydrationWarning` to specific elements

**Files to Check**:
- `services/ash-admin/src/app/layout.tsx` (Toaster component)
- `services/ash-admin/src/app/orders/new/page.tsx` (Client form)
- Any components with dates or dynamic content

---

### 3. **Meta Tag Deprecation** (LOW)
**Warning**: `<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated`

**Cause**:
- Using deprecated mobile web app meta tag

**Solution**:
Remove or update the meta tag in the layout file.

---

## 🚀 Quick Fix Steps

### Step 1: Seed the Database
1. Open browser and go to:
   ```
   https://ashley-aiy.onrender.com/api/seed?token=ashley-ai-seed-2024
   ```
2. Wait for success message
3. Refresh the app

### Step 2: Test Login
1. Go to: `https://ashley-aiy.onrender.com/login`
2. Login with:
   - Email: `admin@ashleyai.com`
   - Password: `password123`

### Step 3: Test Order Creation
1. Go to: `https://ashley-aiy.onrender.com/orders/new`
2. Check if clients appear in dropdown
3. Test creating a client

---

## 🔧 Additional Fixes Needed

### Fix Hydration Errors

**Option 1: Dynamic Import (Recommended)**
```typescript
// In layout.tsx
import dynamic from 'next/dynamic'

const Toaster = dynamic(
  () => import('react-hot-toast').then(mod => mod.Toaster),
  { ssr: false }
)
```

**Option 2: Client-Only Wrapper**
```typescript
// Create components/client-only.tsx
'use client'
export default function ClientOnly({ children }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null
  return children
}
```

### Fix Meta Tag Warning

**In layout.tsx:**
```typescript
// Remove this:
<meta name="apple-mobile-web-app-capable" content="yes" />

// Replace with:
<meta name="mobile-web-app-capable" content="yes" />
```

---

## 📊 Current Status

### Working
- ✅ Deployment successful
- ✅ Build completed
- ✅ Application loads
- ✅ Routes accessible
- ✅ Dialog UI fixed (solid background)
- ✅ PostgreSQL database connected

### Not Working
- ❌ Client dropdown empty (no data)
- ❌ Database not seeded
- ❌ Hydration warnings in console
- ❌ Failed to create client (validation errors)

### After Seeding (Expected)
- ✅ Client dropdown will show 2 demo clients
- ✅ Can create orders
- ✅ Can login with admin account
- ✅ All features functional

---

## 🔍 Error Analysis

### Client Creation Failure
The form is submitting but the API returns 400 because:
1. Database has no workspace with ID `demo-workspace-1`
2. Foreign key constraint fails
3. Validation passes but database insert fails

**Root Cause**: Database not initialized/seeded

### Toast Error Messages
The red error notifications show:
- "Failed to create client" (appears twice)
- "Ashley AI found critical issues that need attention" (appears twice)

This is because:
1. API call fails with 400
2. Error handler shows toast
3. Hydration error causes duplicate renders

---

## 💡 Recommended Actions

### Immediate (Do Now)
1. **Seed the database** using the URL above
2. **Test the app** after seeding
3. **Verify** client dropdown works

### Short Term (Next Session)
1. Fix hydration errors with dynamic import
2. Remove deprecated meta tag
3. Add error boundaries for better error handling
4. Test complete order creation flow

### Long Term
1. Set up automated database seeding on deployment
2. Add database migration scripts
3. Implement proper error logging (Sentry)
4. Add health check endpoint that verifies database

---

## 📝 Database Seed Details

**What Gets Created:**

```typescript
Workspace:
- ID: demo-workspace-1
- Name: Demo Workspace
- Slug: demo-workspace

User:
- Email: admin@ashleyai.com
- Password: password123
- Role: admin
- Name: Admin User

Clients:
1. Manila Shirts Co. (orders@manilashirts.com)
2. Cebu Sports Apparel (procurement@cebusports.ph)

Brands:
- Manila Shirts Premium
- Manila Shirts Basic
- Cebu Sports Pro
- Cebu Sports Active
```

---

## 🎯 Success Criteria

After seeding, you should be able to:
- ✅ Login to the application
- ✅ See 2 clients in the dropdown
- ✅ Create new clients
- ✅ Create new orders
- ✅ Navigate all pages without errors

---

**Next Step**: Open the seed URL and initialize the database!

```
https://ashley-aiy.onrender.com/api/seed?token=ashley-ai-seed-2024
```
