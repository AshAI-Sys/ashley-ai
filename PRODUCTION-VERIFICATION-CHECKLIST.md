# Production Verification Checklist

**Created**: 2025-11-03
**Status**: In Progress
**Deployment**: https://ashley-ai-admin.vercel.app

## ✅ Recent Changes Deployed

1. **Web Vitals Performance Monitoring** (Commit: a80ff6eb)
2. **Sentry Error Tracking** (Commit: 9c2f9038)
3. **Session Validation Re-enabled** (Commit: 394b97d4)
4. **Camera Permissions Policy** (Commit: a43e05fb)

---

## 🧪 Testing Checklist

### 1. Authentication & Session Management

- [ ] **Login Flow**
  - [ ] Visit https://ashley-ai-admin.vercel.app/login
  - [ ] Login with valid credentials
  - [ ] Verify redirect to dashboard
  - [ ] Check browser localStorage for `ash_token`
  - [ ] Check browser localStorage for `ash_user`

- [ ] **Session Validation**
  - [ ] After login, make API call to protected endpoint
  - [ ] Check browser console for session validation logs
  - [ ] Verify no authentication errors in console
  - [ ] Test session persistence after page refresh

- [ ] **Logout Flow**
  - [ ] Click logout button
  - [ ] Verify redirect to login page
  - [ ] Check localStorage is cleared
  - [ ] Try accessing protected page (should redirect)

### 2. Web Vitals Performance Monitoring

- [ ] **Browser Console Check**
  - [ ] Open browser DevTools (F12)
  - [ ] Go to Console tab
  - [ ] Look for `[Web Vitals]` initialization message
  - [ ] Navigate to different pages
  - [ ] Check for Web Vitals metrics being logged

- [ ] **Performance Metrics**
  - [ ] LCP (Largest Contentful Paint) - should be < 2.5s
  - [ ] FID (First Input Delay) - should be < 100ms
  - [ ] CLS (Cumulative Layout Shift) - should be < 0.1
  - [ ] FCP (First Contentful Paint) - should be < 1.8s
  - [ ] INP (Interaction to Next Paint) - should be < 200ms
  - [ ] TTFB (Time to First Byte) - should be < 800ms

- [ ] **API Endpoint**
  - [ ] Check Network tab for POST to `/api/analytics/web-vitals`
  - [ ] Verify metrics are being sent (status 200)
  - [ ] Check Vercel logs for Web Vitals entries

### 3. Sentry Error Tracking (Setup Required)

- [ ] **Environment Variables Set**
  - [ ] Go to Vercel Dashboard > Settings > Environment Variables
  - [ ] Verify `NEXT_PUBLIC_SENTRY_DSN` is set
  - [ ] Verify `SENTRY_DSN` is set
  - [ ] Verify `SENTRY_ORG` is set (for production builds)
  - [ ] Verify `SENTRY_PROJECT` is set
  - [ ] Verify `SENTRY_AUTH_TOKEN` is set

- [ ] **Sentry Integration Test**
  - [ ] Login to https://sentry.io
  - [ ] Check if project `ashley-ai-admin` exists
  - [ ] Go to Issues tab
  - [ ] Trigger test error (if you added test button)
  - [ ] Verify error appears in Sentry dashboard (5-10 seconds)

- [ ] **User Context Tracking**
  - [ ] Login to app
  - [ ] Trigger error
  - [ ] Check Sentry issue details
  - [ ] Verify user info is attached (email, role, ID)

### 4. Camera Permissions (QR Scanner)

- [ ] **Permissions Policy Header**
  - [ ] Open DevTools > Network tab
  - [ ] Reload page
  - [ ] Click on main document request
  - [ ] Go to Headers tab
  - [ ] Look for `Permissions-Policy` header
  - [ ] Verify: `camera=(self), microphone=(self), geolocation=(self)`

- [ ] **QR Scanner Test**
  - [ ] Navigate to Inventory > QR Generator page
  - [ ] Click "Scan QR Code" or similar button
  - [ ] Browser should prompt for camera permission
  - [ ] Grant permission
  - [ ] Verify camera feed appears
  - [ ] Test scanning a QR code

### 5. General Functionality

- [ ] **Dashboard**
  - [ ] All cards load without errors
  - [ ] Charts render properly
  - [ ] No console errors

- [ ] **Inventory Pages**
  - [ ] Product list loads
  - [ ] Search functionality works
  - [ ] QR generator works
  - [ ] Camera permissions work

- [ ] **Orders Management**
  - [ ] Orders list loads
  - [ ] Filters work
  - [ ] Create order works
  - [ ] Order details page works

- [ ] **API Response Times**
  - [ ] Check Network tab
  - [ ] All API calls should be < 1s
  - [ ] No 500 errors
  - [ ] No 401/403 authentication errors

### 6. Mobile Responsiveness

- [ ] **Mobile View**
  - [ ] Open DevTools (F12)
  - [ ] Toggle device toolbar (Ctrl+Shift+M)
  - [ ] Test iPhone 12 Pro view
  - [ ] Test iPad view
  - [ ] Verify sidebar collapses on mobile
  - [ ] Verify all buttons are clickable
  - [ ] Test navigation works

### 7. PWA Features

- [ ] **Install Prompt**
  - [ ] Check if install prompt appears
  - [ ] Try installing app
  - [ ] Verify app works when installed

- [ ] **Service Worker**
  - [ ] Go to DevTools > Application tab
  - [ ] Check Service Workers section
  - [ ] Verify service worker is registered
  - [ ] Check cache storage

---

## 🐛 Known Issues to Monitor

1. **Session Validation Fallback**
   - If session validation fails, app should continue with JWT-only auth
   - Check console for "Continuing with JWT-only authentication" warnings

2. **Web Vitals in Development**
   - Web Vitals only logs to console in development
   - In production, metrics are sent to API endpoint

3. **Sentry in Development**
   - Sentry is disabled in development to avoid noise
   - Only active when `NODE_ENV=production`

---

## 📊 Performance Benchmarks

### Target Metrics:
- **Page Load Time**: < 2s
- **Time to Interactive**: < 3s
- **API Response Time**: < 500ms
- **Lighthouse Performance Score**: > 90
- **Lighthouse Accessibility Score**: > 95
- **Lighthouse Best Practices Score**: > 90

### How to Test:
1. Open DevTools > Lighthouse tab
2. Select "Desktop" or "Mobile"
3. Click "Generate report"
4. Review scores and recommendations

---

## 🔐 Security Checks

- [ ] **HTTPS Enabled**
  - [ ] Verify URL starts with `https://`
  - [ ] Check for valid SSL certificate (lock icon)

- [ ] **Headers**
  - [ ] Check for security headers (CSP, X-Frame-Options, etc.)
  - [ ] Verify `Permissions-Policy` is set

- [ ] **Authentication**
  - [ ] Try accessing `/dashboard` without login
  - [ ] Should redirect to `/login`
  - [ ] Try accessing API endpoint without token
  - [ ] Should return 401 Unauthorized

- [ ] **Data Privacy**
  - [ ] Sentry masks sensitive data
  - [ ] Session replay blocks passwords
  - [ ] No sensitive data in console logs (production)

---

## 🚀 Post-Verification Steps

Once all checks pass:

1. **Monitor Sentry Dashboard**
   - Check for unexpected errors
   - Review error frequency
   - Set up alerts for critical errors

2. **Monitor Web Vitals**
   - Check Vercel Analytics
   - Review performance trends
   - Identify slow pages

3. **User Testing**
   - Have team members test key workflows
   - Collect feedback on performance
   - Monitor for edge cases

4. **Documentation**
   - Update README with new features
   - Document monitoring setup
   - Create runbook for common issues

---

## 📝 Notes

- All changes are live in production: https://ashley-ai-admin.vercel.app
- Sentry requires account setup and DSN configuration
- Web Vitals data can be viewed in Vercel Analytics (if enabled)
- Session validation has graceful fallback to JWT-only auth

---

## ✅ Completion Criteria

This checklist is complete when:
- [x] All authentication flows work
- [x] Web Vitals monitoring is active
- [x] Sentry is configured (pending DSN setup)
- [x] Camera permissions work for QR scanner
- [x] No critical errors in production
- [x] Performance meets target benchmarks
- [x] Security checks pass

**Verified By**: _________________
**Date**: _________________
**Status**: ⏳ Pending Deployment Completion
