# Sentry Error Tracking Setup Guide

## What is Sentry?

Sentry is a powerful error tracking and performance monitoring platform that helps you:
- **Catch Bugs Faster**: Get instant alerts when errors occur in production
- **See User Impact**: Know exactly which users are affected by bugs
- **Debug Faster**: View full stack traces, breadcrumbs, and user context
- **Monitor Performance**: Track API response times and page load speeds
- **Session Replay**: Watch video replays of user sessions when errors occur

## Step 1: Create Sentry Account (FREE)

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up with your email or GitHub account
3. Choose the **FREE** plan (includes 5,000 errors/month)
4. Create a new organization (e.g., "Ashley AI")

## Step 2: Create a Project

1. Click **"Create Project"**
2. Select **Next.js** as the platform
3. Set Alert frequency: **On every new issue**
4. Name your project: `ashley-ai-admin`
5. Click **"Create Project"**

## Step 3: Get Your Credentials

After creating the project, you'll see:

### DSN (Data Source Name)
Copy this value - it looks like:
```
https://abc123def456@o123456.ingest.sentry.io/789012
```

### Organization Slug
Found in Settings > General Settings
Usually your organization name in lowercase (e.g., `ashley-ai`)

### Project Name
The name you just created: `ashley-ai-admin`

### Auth Token (for source map uploads)
1. Go to **Settings** > **Auth Tokens**
2. Click **"Create New Token"**
3. Select scopes:
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
4. Copy the token immediately (you won't see it again!)

## Step 4: Add to Vercel Environment Variables

1. Go to your Vercel dashboard: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select the `ashley-ai-admin` project
3. Go to **Settings** > **Environment Variables**
4. Add these variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Your Sentry DSN | Production, Preview, Development |
| `SENTRY_DSN` | Your Sentry DSN (same as above) | Production, Preview, Development |
| `SENTRY_ORG` | Your organization slug | Production |
| `SENTRY_PROJECT` | `ashley-ai-admin` | Production |
| `SENTRY_AUTH_TOKEN` | Your auth token | Production |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Production |

**IMPORTANT**: 
- `NEXT_PUBLIC_SENTRY_DSN` must start with `NEXT_PUBLIC_` to be available in the browser
- `SENTRY_AUTH_TOKEN` is only needed for production builds (for source map uploads)

## Step 5: Redeploy to Production

1. Go to Vercel dashboard > Deployments
2. Click on the latest deployment
3. Click **"Redeploy"** to trigger a new build with Sentry

## Step 6: Verify It's Working

### Test 1: Trigger a Test Error

Add this button temporarily to any page:

```typescript
<button onClick={() => { throw new Error("Test Sentry Error!") }}>
  Test Sentry
</button>
```

Click the button and check:
1. Your browser console (error should show)
2. Sentry dashboard (error should appear in 5-10 seconds)

### Test 2: Check Server-Side Errors

API errors will automatically be tracked. Check your Sentry dashboard for:
- **Issues** tab: See all errors
- **Performance** tab: See API response times
- **Releases** tab: See deployed versions

### Test 3: Check Session Replay

When errors occur, you can watch a video replay:
1. Go to Sentry dashboard > Issues
2. Click on any error
3. Scroll to **Replays** section
4. Click **"Watch Replay"** to see what the user did

## Features Now Active

✅ **Client-Side Error Tracking**
- React component errors
- JavaScript runtime errors
- Network failures
- Unhandled promise rejections

✅ **Server-Side Error Tracking**
- API route errors
- Database query errors
- Server-side rendering errors
- Background job failures

✅ **Performance Monitoring**
- Page load times
- API response times
- Database query performance
- Web Vitals (LCP, FID, CLS)

✅ **Session Replay**
- Video recordings of user sessions
- Only records sessions with errors (privacy-safe)
- Masks sensitive data (passwords, emails, etc.)

✅ **User Context**
- See which users are affected
- View user email, role, workspace
- Track user actions before error

✅ **Breadcrumbs**
- See user actions leading to error
- API calls made
- Page navigation history
- Console logs

## Integration with Your Code

### Track Custom Errors

```typescript
import { logError } from '@/sentry.client.config';

try {
  // Your code
} catch (error) {
  logError(error as Error, {
    context: 'Order Processing',
    orderId: '12345',
  });
}
```

### Set User Context (Already integrated in auth)

```typescript
import { setUserContext } from '@/sentry.client.config';

// Automatically called on login
setUserContext({
  id: user.id,
  email: user.email,
  role: user.role,
});
```

### Track Performance

```typescript
import { trackPerformance } from '@/sentry.server.config';

const result = await trackPerformance('process-order', async () => {
  return await processOrder(orderId);
});
```

## Cost & Limits

### Free Tier Includes:
- 5,000 errors per month
- 10,000 performance transactions per month
- 50 session replays per month
- 30-day error retention
- Unlimited team members
- Email alerts

### When to Upgrade:
- If you exceed 5,000 errors/month
- If you need longer retention (90 days)
- If you need more session replays

**Cost**: Team plan starts at $26/month for 50,000 errors

## Troubleshooting

### Errors Not Showing Up?

1. Check environment variables are set in Vercel
2. Verify `NEXT_PUBLIC_SENTRY_DSN` is correct
3. Check browser console for Sentry initialization
4. Make sure app is deployed (Sentry disabled in development)

### Source Maps Not Working?

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check Vercel build logs for Sentry upload
3. Verify `SENTRY_ORG` and `SENTRY_PROJECT` are correct

### Too Many Errors?

1. Add filters in Sentry dashboard
2. Ignore known errors (e.g., browser extensions)
3. Adjust sample rates in config files

## Next Steps

1. ✅ Set up Sentry alerts in Slack/Email
2. ✅ Create custom error dashboards
3. ✅ Set up release tracking
4. ✅ Configure alert rules for critical errors
5. ✅ Invite team members to Sentry

## Support

- Sentry Docs: https://docs.sentry.io/
- Sentry Discord: https://discord.gg/sentry
- Next.js Integration: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

**Created**: 2025-11-03
**Status**: ✅ Sentry integration complete - Ready for deployment
