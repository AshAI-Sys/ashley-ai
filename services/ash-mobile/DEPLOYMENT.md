# Ashley AI Mobile - Deployment Guide

Complete guide for deploying the Ashley AI Mobile Inventory Management app to production.

## Prerequisites

- Node.js 18+ and pnpm installed
- Expo CLI: `npm install -g expo-cli eas-cli`
- Expo account (free): https://expo.dev/signup
- Apple Developer Account (for iOS): $99/year
- Google Play Developer Account (for Android): $25 one-time

## Quick Start - Development

```bash
# Install dependencies
cd services/ash-mobile
pnpm install

# Start development server
pnpm start

# Run on specific platform
pnpm android  # Android emulator
pnpm ios      # iOS simulator (Mac only)
pnpm web      # Web browser
```

## Configuration

### 1. Update API Configuration

Edit `src/constants/config.ts`:

```typescript
export const API_CONFIG = {
  // PRODUCTION: Update to your backend URL
  BASE_URL: 'https://api.yourcompany.com',  // Change from localhost

  // Rest of config...
};
```

**Important:** For testing on physical devices, use your computer's IP address instead of localhost:
```typescript
BASE_URL: 'http://192.168.1.100:3001',  // Replace with your IP
```

### 2. Update App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "Ashley AI Mobile",
    "slug": "ashley-ai-mobile",
    "version": "1.0.0",  // Update version for each release
    "ios": {
      "bundleIdentifier": "com.yourcompany.ashleyai"  // Update
    },
    "android": {
      "package": "com.yourcompany.ashleyai"  // Update
    }
  }
}
```

### 3. Create App Icons

Place your custom icons in `/assets/`:
- icon.png (1024x1024)
- splash.png (1242x2436)
- adaptive-icon.png (1024x1024)
- favicon.png (48x48)

See [assets/README.md](assets/README.md) for detailed requirements.

## Building for Production

### Option 1: Expo Application Services (EAS) - Recommended

#### Initial Setup

```bash
# Login to Expo
eas login

# Configure project
eas build:configure
```

This creates `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "archive"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

#### Build for Android

```bash
# Production APK
eas build --platform android --profile production

# Download the APK when complete
# Upload to Google Play Console
```

**Google Play Console:**
1. Go to https://play.google.com/console
2. Create new application
3. Upload APK to Internal Testing
4. Complete store listing (screenshots, description)
5. Submit for review

#### Build for iOS

```bash
# Production archive
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**App Store Connect:**
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Complete app information
4. Upload build via EAS or manually
5. Submit for review

### Option 2: Expo Build (Legacy)

```bash
# Android APK
expo build:android -t apk

# iOS IPA
expo build:ios -t archive
```

### Option 3: Local Build (Advanced)

**Android:**
```bash
# Eject to bare React Native
expo eject

# Generate release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

**iOS (Mac only):**
```bash
# Eject to bare React Native
expo eject

# Open in Xcode
cd ios
open AshleyAIMobile.xcworkspace

# Build in Xcode:
# 1. Select "Any iOS Device"
# 2. Product > Archive
# 3. Distribute App
```

## Over-the-Air Updates (OTA)

Expo allows updating your app without going through app stores:

```bash
# Install expo-updates
expo install expo-updates

# Publish update
eas update --branch production --message "Bug fixes"
```

Users will automatically receive updates when they open the app.

## Testing Before Release

### 1. Test on Real Devices

```bash
# Start Expo Go
pnpm start

# Scan QR code with Expo Go app:
# - iOS: Use Camera app
# - Android: Use Expo Go app scanner
```

### 2. Test Build APK

```bash
# Create preview build
eas build --platform android --profile preview

# Install APK on device
# Test all features with production API
```

### 3. Test Checklist

- [ ] Login with real credentials
- [ ] QR code scanning works
- [ ] Sales processing completes successfully
- [ ] Warehouse operations (delivery/transfer/adjust) work
- [ ] Logout and re-login maintains session
- [ ] App works offline (shows appropriate errors)
- [ ] Camera permissions granted
- [ ] API calls use correct production URL

## Environment Variables

Create `.env` file (not committed to git):

```bash
# API Configuration
API_URL=https://api.yourcompany.com

# Optional: Analytics
SENTRY_DSN=your_sentry_dsn_here
ANALYTICS_ID=your_analytics_id_here
```

Load in `src/constants/config.ts`:

```typescript
import Constants from 'expo-constants';

export const API_CONFIG = {
  BASE_URL: Constants.manifest?.extra?.apiUrl || 'http://localhost:3001',
  // ...
};
```

## App Store Submission

### Android - Google Play Store

**Requirements:**
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (min 2, various device sizes)
- Privacy policy URL
- App description and details

**Steps:**
1. Create app in Google Play Console
2. Complete store listing
3. Upload APK to Internal Testing first
4. Test with internal testers
5. Promote to Production
6. Submit for review (usually 24-48 hours)

### iOS - Apple App Store

**Requirements:**
- App icon (1024x1024)
- Screenshots for all device sizes
- Privacy policy URL
- App description and details
- App Store Connect account

**Steps:**
1. Create app in App Store Connect
2. Complete app information and metadata
3. Upload build via EAS or Xcode
4. Complete privacy details
5. Submit for review (usually 24-72 hours)

## Post-Launch Monitoring

### Crash Reporting

Add Sentry for crash tracking:

```bash
pnpm add @sentry/react-native

# Initialize in App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: false,
});
```

### Analytics

Add analytics (optional):

```bash
pnpm add expo-analytics

# Track screens and events
import * as Analytics from 'expo-analytics';

Analytics.initialize('UA-XXXXX-X');
Analytics.logEvent('sale_processed', { amount: 1000 });
```

## Continuous Deployment

### GitHub Actions (CI/CD)

Create `.github/workflows/mobile-deploy.yml`:

```yaml
name: Mobile Deploy

on:
  push:
    branches: [main]
    paths: ['services/ash-mobile/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd services/ash-mobile
          pnpm install

      - name: Build Android
        run: |
          cd services/ash-mobile
          eas build --platform android --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Version Management

### Semantic Versioning

Update version in `app.json`:

```json
{
  "expo": {
    "version": "1.2.3",  // MAJOR.MINOR.PATCH
    "android": {
      "versionCode": 4   // Increment for each build
    },
    "ios": {
      "buildNumber": "4"  // Increment for each build
    }
  }
}
```

**Version Guidelines:**
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

## Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf node_modules
pnpm install

# Clear Expo cache
expo start -c
```

### Common Issues

**1. Camera not working:**
- Check permissions in app.json
- Request permissions at runtime
- Test on real device (not emulator)

**2. API connection fails:**
- Verify BASE_URL is correct
- Check backend CORS settings
- Use HTTPS in production

**3. App crashes on startup:**
- Check Sentry logs
- Review console errors
- Verify all dependencies installed

## Support

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Ashley AI Issues**: Create issue in project repository

## Security Checklist

Before deploying to production:

- [ ] Remove all console.log statements
- [ ] Use HTTPS for API calls
- [ ] Validate all user inputs
- [ ] Enable ProGuard (Android) for code obfuscation
- [ ] Test with production database (not dev data)
- [ ] Secure token storage verified (Expo SecureStore)
- [ ] API keys not hardcoded
- [ ] Error messages don't expose sensitive data
- [ ] SSL certificate pinning (optional, advanced)

## Quick Reference

```bash
# Development
pnpm start                  # Start dev server
pnpm android               # Run on Android
pnpm ios                   # Run on iOS

# Building
eas build --platform android    # Build Android
eas build --platform ios        # Build iOS
eas build --platform all        # Build both

# Submitting
eas submit --platform android   # Submit to Play Store
eas submit --platform ios       # Submit to App Store

# Updates
eas update --branch production  # Push OTA update
```

---

**Ready for Production!** Follow this guide to deploy Ashley AI Mobile to the App Store and Google Play Store.
