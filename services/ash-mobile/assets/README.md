# Mobile App Assets

This directory contains app icons and splash screens for the Ashley AI Mobile app.

## Required Assets

### App Icon (icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Main app icon for iOS and Android

### Splash Screen (splash.png)
- **Size**: 1242x2436 pixels
- **Format**: PNG
- **Background**: #FFFFFF (white) - matches app.json
- **Purpose**: App loading screen

### Android Adaptive Icon (adaptive-icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Android adaptive icon (foreground layer)
- **Note**: Background color set to #FFFFFF in app.json

### Favicon (favicon.png)
- **Size**: 48x48 pixels
- **Format**: PNG
- **Purpose**: Web version favicon

## Design Guidelines

**Ashley AI Branding:**
- Primary Color: #3B82F6 (Blue)
- Logo: "ASH" text in white on blue circle background
- Font: Bold, modern sans-serif
- Style: Professional, clean, manufacturing-focused

## Generating Assets

### Option 1: Use Expo's Asset Generation
```bash
# Install eas-cli
npm install -g eas-cli

# Generate all required assets from a single 1024x1024 icon
npx expo-cli generate
```

### Option 2: Manual Creation
Create the following files with specified dimensions and place them in this directory:
- icon.png (1024x1024)
- splash.png (1242x2436)
- adaptive-icon.png (1024x1024)
- favicon.png (48x48)

## Current Status

**Placeholder files needed** - Add your custom Ashley AI branded icons before building for production.

For now, the app uses Expo's default assets for development purposes.
