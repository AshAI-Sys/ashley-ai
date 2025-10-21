# Sentry Error Tracking - Quick Start

**Status**: ✅ **READY TO USE**

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Sentry Account

```bash
# Go to https://sentry.io
# Sign up (free plan available)
# Create new project → Select "Next.js"
```

### Step 2: Get Your DSN

```bash
# Copy DSN from Sentry project settings
# Example: https://abc123@o123456.ingest.sentry.io/123456
```

### Step 3: Install Sentry Package

```bash
cd services/ash-admin
pnpm add @sentry/nextjs
```

### Step 4: Update .env

```bash
# Add these to services/ash-admin/.env
SENTRY_DSN="your_dsn_here"
NEXT_PUBLIC_SENTRY_DSN="your_dsn_here"
SENTRY_AUTH_TOKEN="your_auth_token" # Optional, for source maps
```

### Step 5: Test It

```bash
# Start dev server
pnpm dev

# Visit test page (create this):
# app/test-error/page.tsx
'use client'
export default function Test() {
  return <button onClick={() => { throw new Error('Test!') }}>Test</button>
}

# Click button, check Sentry dashboard
```

---

## ✅ What's Already Done

### Files Created:

1. ✅ `sentry.client.config.ts` - Browser error tracking
2. ✅ `sentry.server.config.ts` - Server error tracking
3. ✅ `sentry.edge.config.ts` - Middleware error tracking
4. ✅ `next.config.sentry.js` - Build configuration
5. ✅ `src/components/ErrorBoundary.tsx` - Error UI
6. ✅ `src/lib/error-logger.ts` - Logging utilities
7. ✅ `.env` - Environment variables (empty, needs DSN)

### Features Ready:

- ✅ Client-side error tracking
- ✅ Server-side error tracking
- ✅ Edge runtime error tracking
- ✅ Performance monitoring
- ✅ Session replay
- ✅ Error boundaries
- ✅ Custom logging utilities
- ✅ Source map upload

---

## 📝 Usage Examples

### Log Any Error

```typescript
import { logError } from "@/lib/error-logger";

logError(error, {
  category: "api",
  orderId: "123",
  metadata: { details },
});
```

### Wrap Component with Error Boundary

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Track Performance

```typescript
import { logPerformanceIssue } from "@/lib/error-logger";

const start = Date.now();
// ... your code
logPerformanceIssue("operation", Date.now() - start, 2000);
```

---

## 🔧 Production Setup

### Update next.config.js

```javascript
const { withSentryConfig } = require("./next.config.sentry");

const nextConfig = {
  // your config
};

module.exports = withSentryConfig(nextConfig);
```

### Set Release Version

```bash
export APP_VERSION="1.0.0"
pnpm build
```

---

## 📊 What You'll See in Sentry

1. **Real-time Errors**: All errors with stack traces
2. **User Context**: Which user experienced the error
3. **Breadcrumbs**: What user did before error
4. **Performance**: Slow operations and bottlenecks
5. **Session Replay**: Video of user session (optional)
6. **Alerts**: Email/Slack notifications

---

## 🎯 Next Steps

1. [ ] Sign up at https://sentry.io
2. [ ] Get DSN and add to .env
3. [ ] Install package: `pnpm add @sentry/nextjs`
4. [ ] Update next.config.js with Sentry wrapper
5. [ ] Test error tracking
6. [ ] Set up alerts
7. [ ] Configure team notifications

---

## 📚 Full Documentation

See `SENTRY-ERROR-TRACKING.md` for:

- Detailed setup guide
- All error categories
- Advanced configuration
- Troubleshooting
- Best practices
- Production checklist

---

**That's it! 🎉 Error tracking is ready to go.**
