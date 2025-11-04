# Mobile App Deployment Guide

Complete guide for building and deploying the Ashley AI mobile app (React Native/Expo) to Android and iOS.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Build Android APK](#build-android-apk)
- [Build iOS App](#build-ios-app)
- [Deploy to Google Play Store](#deploy-to-google-play-store)
- [Deploy to Apple App Store](#deploy-to-apple-app-store)
- [Over-the-Air (OTA) Updates](#over-the-air-ota-updates)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

```bash
# Node.js and pnpm (already installed)
node --version  # v18+
pnpm --version  # v8+

# Expo CLI
npm install -g eas-cli
eas --version

# Login to Expo
eas login
```

### Required Accounts

1. **Expo Account** (Free)
   - Sign up: https://expo.dev/signup
   - Used for: Building and OTA updates

2. **Google Play Console** ($25 one-time fee)
   - Sign up: https://play.google.com/console/signup
   - Used for: Android app distribution

3. **Apple Developer Program** ($99/year)
   - Sign up: https://developer.apple.com/programs
   - Used for: iOS app distribution

---

## Build Android APK

### Method 1: EAS Build (Recommended)

**Step 1: Configure EAS**

```bash
cd services/ash-mobile

# Initialize EAS build
eas build:configure

# This creates eas.json configuration file
```

**Step 2: Update app.json**

```json
{
  "expo": {
    "name": "Ashley AI",
    "slug": "ashley-ai",
    "version": "1.0.0",
    "android": {
      "package": "com.ashleyai.mobile",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E40AF"
      }
    }
  }
}
```

**Step 3: Build APK**

```bash
# Build Android APK (takes 10-15 minutes)
eas build --platform android --profile preview

# OR build AAB for Play Store
eas build --platform android --profile production
```

**Step 4: Download APK**

1. Build completes with URL like: `https://expo.dev/accounts/your-username/projects/ashley-ai/builds/xxx`
2. Click link to download APK
3. Install on Android device

### Method 2: Local Build (Advanced)

```bash
cd services/ash-mobile

# Install Java Development Kit (JDK 17)
# Download: https://adoptium.net/

# Set JAVA_HOME environment variable
# Windows: setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.7.7-hotspot"
# Mac/Linux: export JAVA_HOME=$(/usr/libexec/java_home)

# Install Android Studio
# Download: https://developer.android.com/studio

# Accept Android SDK licenses
yes | sdkmanager --licenses

# Build APK locally
npx expo prebuild --platform android
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## Build iOS App

### Prerequisites

- **macOS** computer (required for iOS builds)
- **Xcode** 14+ installed
- **Apple Developer Account** ($99/year)

### Method 1: EAS Build (Recommended)

**Step 1: Configure app.json**

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.ashleyai.mobile",
      "buildNumber": "1",
      "supportsTablet": true
    }
  }
}
```

**Step 2: Build IPA**

```bash
cd services/ash-mobile

# Build iOS IPA (takes 15-20 minutes)
eas build --platform ios --profile production

# Follow prompts to set up Apple credentials
# EAS will handle certificate and provisioning profiles
```

**Step 3: Download IPA**

1. Build completes with download link
2. Download .ipa file
3. Use TestFlight or upload to App Store Connect

### Method 2: Local Build (macOS only)

```bash
cd services/ash-mobile

# Prebuild iOS native project
npx expo prebuild --platform ios

# Open in Xcode
open ios/AshleyAI.xcworkspace

# In Xcode:
# 1. Select target device/simulator
# 2. Click Product → Archive
# 3. Follow prompts to sign and export
```

---

## Deploy to Google Play Store

### Step 1: Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in details:
   - **App name**: Ashley AI
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
4. Complete **Store listing**:
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (at least 2)
   - App icon (512x512)
   - Feature graphic (1024x500)
5. Complete **Content rating**
6. Complete **Target audience** and **Content**

### Step 2: Create Release

1. Go to **Production** → **Create new release**
2. Upload AAB file (built with EAS):
   ```bash
   eas build --platform android --profile production
   ```
3. Add **Release notes**:
   ```
   Version 1.0.0
   - Initial release
   - Store Scanner feature
   - Cashier POS system
   - Warehouse operations
   ```
4. Click **Review release**
5. Click **Start rollout to Production**

### Step 3: Wait for Review

- **Review time**: 1-7 days
- **Status**: Check in Play Console
- **Updates**: Receive email notifications

### App Store Listing Example

**Short description:**
```
Ashley AI - Complete manufacturing ERP system for apparel businesses. Manage inventory, orders, production, and sales.
```

**Full description:**
```
Ashley AI is a comprehensive manufacturing ERP system designed for apparel and garment businesses.

KEY FEATURES:
✅ Store Scanner - Scan product QR codes for instant inventory lookup
✅ Cashier POS - Complete point-of-sale system with payment processing
✅ Warehouse Operations - Manage deliveries, transfers, and adjustments
✅ Real-time Inventory - Track stock levels across multiple locations
✅ Production Tracking - Monitor manufacturing stages and efficiency
✅ Order Management - Create and track customer orders

BENEFITS:
• Streamline inventory management
• Improve production efficiency
• Real-time business insights
• Mobile-first design
• Offline-capable

Perfect for:
- Garment manufacturers
- Apparel businesses
- Clothing factories
- Textile operations
- Fashion brands

Download now and transform your manufacturing operations!
```

---

## Deploy to Apple App Store

### Step 1: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in details:
   - **Platform**: iOS
   - **Name**: Ashley AI
   - **Primary Language**: English
   - **Bundle ID**: com.ashleyai.mobile
   - **SKU**: ashley-ai-mobile
4. Complete **App Information**:
   - Category: Business
   - Content rights: Original content
5. Complete **Pricing and Availability**:
   - Price: Free

### Step 2: Upload Build

**Option A: Using EAS Submit**

```bash
cd services/ash-mobile

# Build and submit in one command
eas build --platform ios --profile production
eas submit --platform ios
```

**Option B: Using Transporter**

1. Download **Transporter** app from Mac App Store
2. Drag and drop .ipa file
3. Click **Deliver**

### Step 3: Complete App Store Information

1. **App Information**:
   - Screenshots (6.5" iPhone: 1290x2796)
   - App preview videos (optional)
2. **What's New in This Version**:
   ```
   Version 1.0.0
   - Initial release
   - Complete ERP system
   - Inventory management
   - POS system
   ```
3. **Promotional Text** (170 chars)
4. **Description** (4000 chars max)
5. **Keywords** (comma-separated, 100 chars max):
   ```
   inventory,manufacturing,ERP,warehouse,POS,business
   ```
6. **Support URL**: https://github.com/AshAI-Sys/ashley-ai
7. **Privacy Policy URL**: https://ashley-ai.vercel.app/privacy

### Step 4: Submit for Review

1. Click **Add for Review**
2. Click **Submit to App Review**
3. Wait for review (1-5 days)

---

## Over-the-Air (OTA) Updates

**Benefits:**
- Update app without app store review
- Fix bugs instantly
- Roll out features gradually

**Limitations:**
- Can't update native code (only JavaScript)
- Can't change app icon, splash screen, permissions

### Setup EAS Update

```bash
cd services/ash-mobile

# Configure EAS Update
eas update:configure

# Create update channel
eas channel:create production
```

### Publish Update

```bash
# Build update and publish
eas update --channel production --message "Fix login bug"

# Users will receive update on next app restart
```

### View Updates

```bash
# List all updates
eas update:list

# View update details
eas update:view [update-id]

# Rollback to previous version
eas update:delete [update-id]
```

---

## Troubleshooting

### Issue: "Build failed: No matching provisioning profile"

**Solution (iOS):**
```bash
# Regenerate credentials
eas credentials

# Select:
# - Set up credentials
# - iOS
# - Build credentials
```

### Issue: "APK is too large (>100MB)"

**Solution:**
```bash
# Use AAB format (Google Play)
eas build --platform android --profile production

# Enable ProGuard (reduces size)
# In android/app/build.gradle:
android {
  buildTypes {
    release {
      minifyEnabled true
      shrinkResources true
    }
  }
}
```

### Issue: "App crashes on startup"

**Solution:**
```bash
# Check logs
npx expo start --no-dev --minify

# Enable error reporting
# Add Sentry to app.json:
"extra": {
  "eas": {
    "projectId": "your-project-id"
  }
}
```

### Issue: "Cannot install APK on device"

**Solution:**
1. Enable "Unknown sources" on Android device
2. Settings → Security → Unknown sources
3. OR use `adb install`:
   ```bash
   adb install app-release.apk
   ```

---

## Build Profiles (eas.json)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "bundler": "metro"
      }
    }
  }
}
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Test app thoroughly on physical devices
- [ ] Update version number in app.json
- [ ] Update CHANGELOG.md
- [ ] Create app icon (1024x1024)
- [ ] Create splash screen
- [ ] Take screenshots for app stores
- [ ] Write app store descriptions
- [ ] Set up error tracking (Sentry)
- [ ] Configure API URLs for production

### Post-Deployment
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Monitor download statistics
- [ ] Prepare OTA updates for bugs
- [ ] Plan next version features

---

## Quick Commands

```bash
# Build APK (Android)
eas build --platform android --profile preview

# Build AAB (Google Play)
eas build --platform android --profile production

# Build IPA (iOS)
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios

# Publish OTA update
eas update --channel production --message "Bug fixes"

# View build status
eas build:list

# View build logs
eas build:view [build-id]
```

---

## App Store Links (After Publishing)

**Google Play Store:**
```
https://play.google.com/store/apps/details?id=com.ashleyai.mobile
```

**Apple App Store:**
```
https://apps.apple.com/app/ashley-ai/id[APP_ID]
```

---

**Last Updated**: November 4, 2025
**Version**: 1.0.0
**Current Build**: Development (not yet published)
**Next Steps**: Build APK → Test → Submit to Google Play Store
