# Ashley AI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Admin Interface

```bash
cd "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
pnpm dev
```

Open: **http://localhost:3001**

---

## ✨ NEW FEATURES - Try Them Now!

### 1. Dark Mode 🌙
- Look at the **sidebar**
- Click the **moon/sun icon** (next to collapse button)
- See the entire app switch themes!

### 2. Keyboard Shortcuts ⌨️
- Press `?` key anywhere in the app
- See the beautiful shortcuts dialog
- Try these shortcuts:
  - `Ctrl+H` - Go to Dashboard
  - `Ctrl+O` - Go to Orders
  - `Ctrl+C` - Go to Clients
  - `Esc` - Close dialogs

### 3. Smooth Animations ✨
- Navigate between pages
- Watch smooth fade transitions
- Scroll down pages to see scroll-triggered animations

### 4. Beautiful Error Handling 🛡️
- Any React error will be caught
- Beautiful error page with retry button
- Development mode shows error details

### 5. Enhanced Toasts 🎉
- Perform any action (save, delete, etc.)
- See beautiful toast notifications
- 5 variants: success, error, warning, info, loading

---

## 🔒 Security Features - Enterprise Grade

### Two-Factor Authentication (2FA)

1. Navigate to: **http://localhost:3001/settings/security**
2. Click "Enable 2FA"
3. You'll see:
   - Secret code to enter in authenticator app
   - Verification code input
   - Backup codes (download them!)
4. Use Google Authenticator or Authy to scan
5. Enter the 6-digit code
6. Done! 2FA is now enabled

### Audit Logging (Automatic)

Every action is logged:
- Login/Logout
- Create/Update/Delete operations
- Permission changes
- Access denied attempts

**View logs in database**: `AuditLog` table

### Rate Limiting (Automatic)

Protects all API endpoints:
- AUTH: 5 requests / 15 minutes
- STANDARD: 100 requests / minute
- WRITE: 30 requests / minute
- UPLOAD: 20 requests / hour

Try making rapid requests - you'll get a 429 error!

### Session Management

- Login from multiple devices
- View all active sessions
- Force logout from all devices
- Auto cleanup of expired sessions

---

## 📱 Mobile App - Production Floor Workers

### Setup (One-time)

```bash
cd "C:\Users\Khell\Desktop\Ashley AI\mobile-app"
npm install
```

### Run on Android

```bash
npm run android
```

### Run on iOS (Mac only)

```bash
npm run ios
```

### Mobile App Features

1. **Login** - Secure authentication
2. **Dashboard** - See your stats
3. **QR Scanner** - Scan bundle QR codes
4. **Production Tracking** - Update your sewing runs
5. **Bundle Details** - View and update bundle status

---

## 📖 Complete Documentation

### For Detailed Information:

1. **IMPLEMENTATION-SUMMARY.md** - Full feature documentation
2. **FINAL-IMPLEMENTATION-REPORT.md** - Complete implementation report
3. **mobile-app/MOBILE-APP-COMPLETE-CODE.md** - Mobile app guide

---

## 🧪 Quick Testing

### Test Dark Mode
```
1. Click theme toggle in sidebar
2. Verify all pages switch themes
3. Check localStorage for 'ashley-ai-theme'
```

### Test Keyboard Shortcuts
```
1. Press '?' to open help dialog
2. Press 'Ctrl+H' to go to dashboard
3. Press 'Ctrl+O' to go to orders
4. Press 'Esc' to close modals
```

### Test Animations
```
1. Navigate between different pages
2. Scroll down on long pages
3. Watch for smooth transitions
```

### Test Error Boundary
```
1. Create a component that throws an error
2. See beautiful error page
3. Click "Try Again" to retry
```

### Test Toasts
```
1. Perform any save operation
2. See success toast
3. Try deleting something
4. See confirmation toast
```

### Test 2FA
```
1. Go to /settings/security
2. Enable 2FA
3. Scan QR code with Google Authenticator
4. Enter verification code
5. Download backup codes
```

### Test Rate Limiting
```javascript
// Make rapid requests
for (let i = 0; i < 200; i++) {
  fetch('/api/test-endpoint')
}
// After 100 requests, you'll get 429 errors
```

### Test Mobile App
```
1. Run: npm run android
2. Login with any credentials
3. View dashboard
4. Try scanning a QR code
5. Update a production run
```

---

## 🎯 Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `?` | Show shortcuts dialog |
| `Ctrl+K` | Open search |
| `Ctrl+H` | Go to Dashboard |
| `Ctrl+O` | Go to Orders |
| `Ctrl+C` | Go to Clients |
| `Ctrl+N` | Create new order |
| `Ctrl+S` | Save form |
| `Ctrl+P` | Print |
| `Ctrl+/` | Toggle sidebar |
| `Esc` | Close dialog/modal |

---

## 🐛 Troubleshooting

### Admin Interface Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Dark Mode Not Switching
```bash
# Clear browser localStorage
localStorage.clear()
# Refresh page
```

### Mobile App Won't Build
```bash
# Clear cache
cd mobile-app
rm -rf node_modules
npm install

# For Android
cd android && ./gradlew clean && cd ..

# For iOS
cd ios && pod install && cd ..
```

### 2FA Not Working
- Make sure your phone time is synced
- TOTP codes are time-based
- Try the backup codes instead

### Rate Limit Issues
- Wait for the time window to reset
- Check headers for X-RateLimit-Reset
- Or reset manually (see documentation)

---

## 📊 What Was Implemented

### OPTION 6: UI/UX Enhancements ✅
- ✅ Dark Mode (Light/Dark/System)
- ✅ 18 Animation Types
- ✅ Error Boundary
- ✅ Enhanced Toasts
- ✅ Keyboard Shortcuts
- ✅ Loading States

### OPTION 8: Security Hardening ✅
- ✅ Two-Factor Authentication
- ✅ Audit Logging (20+ action types)
- ✅ API Rate Limiting (6 tiers)
- ✅ Session Management

### OPTION 4: Mobile App ✅
- ✅ React Native App
- ✅ 5 Complete Screens
- ✅ QR Code Scanner
- ✅ Production Tracking
- ✅ API Integration

---

## 🎉 You're Ready!

All features are fully implemented and ready to use.

**Start exploring**: http://localhost:3001

**Questions?** See IMPLEMENTATION-SUMMARY.md for detailed documentation.

---

**Last Updated**: October 19, 2025
**Status**: ✅ ALL FEATURES COMPLETE
