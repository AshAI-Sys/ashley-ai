# Prerendering Errors - Analysis & Fix Guide

**Date**: October 25, 2025
**Status**: TypeScript ✅ Complete | Prerendering ⚠️ Needs Fix
**Impact**: Development server works fine - only affects production builds

## 📊 Error Summary

The build completes with TypeScript success but fails during static page generation (SSG) with two main errors:

### Error 1: No QueryClient Set (15+ pages affected)
```
Error: No QueryClient set, use QueryClientProvider to set one
```

**Affected Pages**:
- /automation
- /delivery
- /clients
- /designs
- /cutting
- /employee
- /finishing-packing
- /finance
- /hr-payroll
- /inventory
- /maintenance
- /merchandising
- /orders
- /printing
- /quality-control

### Error 2: Invalid URL During SSG
```
TypeError: Failed to parse URL from /api/clients?limit=100
```

**Affected Pages**:
- Pages making fetch calls with relative URLs during build

## 🔍 Root Cause Analysis

### Why QueryClient Error Occurs

1. **Pages use client-side hooks** (`useQuery`, `useMutation` from React Query)
2. **Next.js tries to pre-render** these pages during `pnpm build`
3. **Server-side rendering** executes React hooks during build
4. **Hooks run before hydration** - QueryClient isn't available yet
5. **Build fails** because hooks can't access browser-only features

### Why URL Error Occurs

1. **Fetch calls use relative URLs** like `/api/clients?limit=100`
2. **During SSG (Static Site Generation)**, there's no `window.location`
3. **Node.js fetch requires absolute URLs** like `http://localhost:3001/api/clients`
4. **Build fails** because relative URLs are invalid in Node environment

## ✅ Solutions

### Solution 1: Quick Fix - Disable SSG (5 minutes)

**Recommended for**: Fast deployment, pages that need real-time data

Add this to the top of affected page files:

```typescript
// Add to each affected page.tsx file
export const dynamic = 'force-dynamic'

export default function PageName() {
  // ... rest of page code
}
```

**Files to Update** (15 files):
1. `services/ash-admin/src/app/automation/page.tsx`
2. `services/ash-admin/src/app/delivery/page.tsx`
3. `services/ash-admin/src/app/clients/page.tsx`
4. `services/ash-admin/src/app/designs/page.tsx`
5. `services/ash-admin/src/app/cutting/page.tsx`
6. `services/ash-admin/src/app/employee/page.tsx`
7. `services/ash-admin/src/app/finishing-packing/page.tsx`
8. `services/ash-admin/src/app/finance/page.tsx`
9. `services/ash-admin/src/app/hr-payroll/page.tsx`
10. `services/ash-admin/src/app/inventory/page.tsx`
11. `services/ash-admin/src/app/maintenance/page.tsx`
12. `services/ash-admin/src/app/merchandising/page.tsx`
13. `services/ash-admin/src/app/orders/page.tsx`
14. `services/ash-admin/src/app/printing/page.tsx`
15. `services/ash-admin/src/app/quality-control/page.tsx`

**Script to Apply Fix**:
```bash
# Windows PowerShell
$pages = @(
  "automation",
  "delivery",
  "clients",
  "designs",
  "cutting",
  "employee",
  "finishing-packing",
  "finance",
  "hr-payroll",
  "inventory",
  "maintenance",
  "merchandising",
  "orders",
  "printing",
  "quality-control"
)

foreach ($page in $pages) {
  $file = "services/ash-admin/src/app/$page/page.tsx"
  if (Test-Path $file) {
    $content = Get-Content $file -Raw
    if ($content -notmatch "export const dynamic") {
      # Add after imports, before first export default
      $newContent = $content -replace "(import.*`r?`n)+", "`$0`r`nexport const dynamic = 'force-dynamic'`r`n"
      Set-Content $file $newContent
      Write-Host "✅ Updated: $file"
    }
  }
}
```

**Pros**:
- Fastest solution (5 minutes)
- No architecture changes needed
- Pages always show fresh data
- Works immediately

**Cons**:
- No static page optimization
- Slightly slower initial page load
- Pages render on-demand instead of at build time

---

### Solution 2: Mark as Client Components (10 minutes)

**Recommended for**: Pages that ONLY need client-side features

Add `'use client'` directive at the top of affected pages:

```typescript
'use client'

import { useState } from 'react'
// ... rest of imports

export default function PageName() {
  // ... page code
}
```

**When to use**:
- Page uses React hooks (useState, useEffect, etc.)
- Page needs browser APIs (localStorage, window, etc.)
- Page doesn't need SEO optimization
- Page data doesn't need to be pre-fetched

**Pros**:
- Simple one-line fix
- Pages work correctly
- Clear intent (client-only page)

**Cons**:
- Entire page is client-rendered
- No server-side optimization
- Larger JavaScript bundle

---

### Solution 3: Use Absolute URLs for Fetch (15 minutes)

**Recommended for**: API calls during SSG

Create an environment variable for base URL:

**.env.local**:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**.env.production**:
```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

Update fetch calls:

```typescript
// BEFORE:
const response = await fetch('/api/clients?limit=100')

// AFTER:
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
const response = await fetch(`${baseUrl}/api/clients?limit=100`)
```

**Pros**:
- Enables SSG/SSR properly
- Works in all environments
- Best for SEO

**Cons**:
- Requires environment setup
- More code changes
- Need to update multiple files

---

### Solution 4: Proper SSG with getStaticProps Pattern (30 minutes)

**Recommended for**: Production-grade solution with optimal performance

Use Next.js data fetching patterns:

```typescript
// For pages that can be static
export async function generateStaticParams() {
  // Return static paths
}

// For pages that need real-time data
export const revalidate = 60 // Revalidate every 60 seconds

export default async function Page() {
  // Fetch data server-side
  const data = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/...`)

  return (
    <ClientComponent data={data} />
  )
}
```

**Pros**:
- Best performance
- SEO optimized
- Proper Next.js pattern
- Revalidation support

**Cons**:
- Most complex solution
- Requires architecture changes
- Need to separate server/client code

---

## 🎯 Recommended Approach

### For Immediate Fix (Choose ONE):

**Option A**: Solution 1 (Quick Fix - 5 min)
- Add `export const dynamic = 'force-dynamic'` to all 15 pages
- Run `pnpm build` again
- Deploy immediately

**Option B**: Solution 2 (Client Components - 10 min)
- Add `'use client'` to all 15 pages
- Simpler than Solution 1
- Same effect

### For Production-Grade Fix (Do Later):

**Follow-up**: Solution 4 (Proper SSG - 30+ min)
- Implement proper data fetching patterns
- Separate server and client components
- Add revalidation strategies
- Optimize for SEO

---

## 📝 Implementation Steps

### Quick Fix Implementation (Recommended Now)

1. **Create fix script** (fix-prerender.ps1):
```powershell
# fix-prerender.ps1
$pages = @(
  "automation", "delivery", "clients", "designs", "cutting",
  "employee", "finishing-packing", "finance", "hr-payroll",
  "inventory", "maintenance", "merchandising", "orders",
  "printing", "quality-control"
)

foreach ($page in $pages) {
  $file = "services/ash-admin/src/app/$page/page.tsx"
  if (Test-Path $file) {
    $content = Get-Content $file -Raw

    # Check if already has dynamic export
    if ($content -notmatch "export const dynamic") {
      # Find the first line after imports (usually a comment or export default)
      $lines = Get-Content $file
      $insertIndex = 0

      for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match "^import" -or $lines[$i] -match "^$") {
          $insertIndex = $i + 1
        } else {
          break
        }
      }

      # Insert dynamic export
      $lines = @($lines[0..$insertIndex]) + "" + "export const dynamic = 'force-dynamic'" + "" + @($lines[($insertIndex + 1)..($lines.Length - 1)])
      Set-Content $file ($lines -join "`r`n")

      Write-Host "✅ Updated: $page/page.tsx"
    } else {
      Write-Host "⏭️ Skipped: $page/page.tsx (already has dynamic export)"
    }
  } else {
    Write-Host "❌ Not found: $page/page.tsx"
  }
}

Write-Host "`n✅ Done! Run 'pnpm build' to test."
```

2. **Run the script**:
```powershell
cd "C:\Users\Khell\Desktop\Ashley AI"
.\fix-prerender.ps1
```

3. **Test the build**:
```bash
cd services/ash-admin
pnpm build
```

4. **Verify success**:
- Build should complete without prerendering errors
- All pages should generate successfully
- TypeScript still compiles cleanly

5. **Commit the fix**:
```bash
git add -A
git commit -m "fix(prerender): Disable SSG for dynamic pages to resolve build errors

- Added 'export const dynamic = 'force-dynamic'' to 15 pages
- Fixes 'No QueryClient set' errors during static generation
- Pages now render on-demand instead of at build time
- Development and production builds now succeed

Affected pages: automation, delivery, clients, designs, cutting, employee,
finishing-packing, finance, hr-payroll, inventory, maintenance, merchandising,
orders, printing, quality-control"
```

---

## 🧪 Testing

### Test Development Server
```bash
cd services/ash-admin
pnpm dev
```
Visit: http://localhost:3001

**Expected**: All pages work perfectly (they already did!)

### Test Production Build
```bash
cd services/ash-admin
pnpm build
```

**Expected**:
- ✅ TypeScript compiles successfully
- ✅ All 210 pages generate without errors
- ✅ No "QueryClient" errors
- ✅ No "URL" errors

### Test Production Server
```bash
cd services/ash-admin
pnpm build && pnpm start
```
Visit: http://localhost:3001

**Expected**: All pages work in production mode

---

## 📊 Impact Assessment

### Build Time
- **Before**: Build fails at page generation
- **After**: Build succeeds, slightly faster (no SSG for dynamic pages)

### Page Load Performance
- **Before**: Would be faster with SSG (if it worked)
- **After**: Slightly slower initial load, but still very fast
- **Impact**: Negligible (<100ms difference)

### SEO
- **Before**: Would be better with SSG
- **After**: Still good - pages are server-rendered on first request
- **Impact**: Minimal (internal app, not public-facing)

### User Experience
- **Before**: Build fails, can't deploy
- **After**: Works perfectly, real-time data
- **Impact**: POSITIVE ✅

---

## 🎯 Conclusion

**Current Status**:
- TypeScript: ✅ Complete (0 errors)
- Prerendering: ⚠️ Needs fix (15 pages)

**Recommended Action**:
1. Apply Solution 1 (Quick Fix) NOW
2. Build and deploy
3. Implement Solution 4 (Proper SSG) LATER for optimization

**Time Estimate**:
- Quick Fix: 5 minutes
- Testing: 5 minutes
- Commit: 2 minutes
- **Total**: 12 minutes to production-ready ✅

**Next Steps**:
1. Run fix-prerender.ps1 script
2. Test with `pnpm build`
3. Commit changes
4. Done! 🎉
