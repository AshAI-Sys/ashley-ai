# Ashley AI Mobile App - Implementation Plan

**Status**: Ready for Implementation
**Platform**: React Native (iOS & Android)
**Last Updated**: 2025-10-19

## Overview

Complete mobile application for Ashley AI Manufacturing ERP system with production floor focus, QR scanning, and real-time tracking.

---

## ✅ COMPLETED FEATURES (Options 4, 6, 8)

### **Option 6: UI/UX Enhancements** - COMPLETE ✅
1. ✅ **Dark Mode System**
   - ThemeContext with Light/Dark/System preferences
   - ThemeToggle component in navigation sidebar
   - Complete CSS variables for dark mode in globals.css
   - Automatic theme persistence in localStorage

2. ✅ **Animation System**
   - Created `components/ui/animated.tsx` with 14 animation types
   - Animated, StaggeredAnimation, and SlideTransition components
   - Intersection Observer for scroll-triggered animations
   - Support for delays, duration, and callbacks

3. ✅ **Keyboard Shortcuts**
   - Global keyboard shortcuts system already implemented
   - KeyboardShortcutsDialog component with search
   - GlobalKeyboardShortcutsProvider in layout
   - 15+ shortcuts for navigation and actions

4. ✅ **Error Boundary**
   - ErrorBoundary component already implemented
   - Copy error to clipboard functionality
   - Custom fallback support
   - Integrated in root layout

### **Option 8: Security Hardening** - COMPLETE ✅
1. ✅ **Two-Factor Authentication (2FA)**
   - Database fields: two_factor_secret, two_factor_enabled, backup_codes
   - Implementation files: `lib/auth/2fa.ts`, `lib/2fa-server.ts`
   - Security settings pages: `app/settings/security/page.tsx`, `app/profile/security/page.tsx`

2. ✅ **Audit Logging System**
   - AuditLog model in database schema
   - Implementation files: `lib/audit/logger.ts`, `lib/audit-logger.ts`
   - Tracks: action, resource, old_values, new_values, IP, user agent

3. ✅ **API Rate Limiting**
   - Implementation files: `lib/security/rate-limit.ts`, `lib/rate-limit.ts`
   - Redis-based with fallback strategies
   - Auth middleware with rate limiting: `lib/auth-middleware.ts`

### **Option 4: Mobile App** - IN PROGRESS ⏳

---

## Mobile App Architecture

### **Technology Stack**
- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **State Management**: React Query + Context API
- **Navigation**: React Navigation 6.x
- **QR Scanner**: react-native-camera or react-native-vision-camera
- **Storage**: AsyncStorage
- **API**: REST API to Ashley AI backend

### **Core Features**

#### 1. **Authentication**
- Login with email/password
- Biometric authentication (fingerprint/Face ID)
- Session management with JWT tokens
- Auto-logout on timeout

#### 2. **Production Floor Scanner**
- QR code scanning for bundles
- Barcode scanning for products
- Bundle tracking and status updates
- Operator check-in/check-out

#### 3. **Production Tracking**
- Real-time production status
- Sewing run progress
- Quality control inspections
- Efficiency metrics

#### 4. **Order Management**
- View orders list
- Order details with line items
- Production stage progress
- Client information

#### 5. **Quality Control**
- QC inspection forms
- Photo capture for defects
- Defect code selection
- CAPA task creation

#### 6. **Notifications**
- Push notifications for alerts
- Production milestones
- Quality issues
- Delivery updates

---

## Folder Structure

```
mobile-app/
├── src/
│   ├── api/              # API service layer
│   │   ├── client.ts     # Axios/fetch client
│   │   ├── auth.ts       # Authentication endpoints
│   │   ├── orders.ts     # Order endpoints
│   │   ├── production.ts # Production endpoints
│   │   └── qc.ts         # Quality control endpoints
│   │
│   ├── components/       # Reusable components
│   │   ├── common/       # Buttons, Inputs, Cards
│   │   ├── scanner/      # QR/Barcode scanner
│   │   ├── forms/        # Form components
│   │   └── lists/        # List components
│   │
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Biometric
│   │   ├── home/         # Dashboard
│   │   ├── scanner/      # QR Scanner
│   │   ├── orders/       # Order list/details
│   │   ├── production/   # Production tracking
│   │   └── qc/           # Quality control
│   │
│   ├── navigation/       # Navigation config
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   └── MainTabs.tsx
│   │
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useScanner.ts
│   │   └── useApi.ts
│   │
│   ├── utils/            # Utilities
│   │   ├── storage.ts    # AsyncStorage helpers
│   │   ├── validation.ts # Form validation
│   │   └── date.ts       # Date formatting
│   │
│   ├── types/            # TypeScript types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── navigation.ts
│   │
│   └── App.tsx           # App entry point
│
├── android/              # Android native code
├── ios/                  # iOS native code
├── package.json
└── tsconfig.json
```

---

## Implementation Phases

### **Phase 1: Project Setup** (Day 1)
- [ ] Initialize React Native project with TypeScript
- [ ] Install dependencies (React Navigation, React Query, Camera)
- [ ] Configure navigation structure
- [ ] Setup API client with authentication

### **Phase 2: Authentication** (Day 2)
- [ ] Login screen UI
- [ ] Authentication API integration
- [ ] JWT token storage and refresh
- [ ] Biometric authentication setup
- [ ] Auth context and guards

### **Phase 3: Core UI Components** (Day 3)
- [ ] Button, Input, Card components
- [ ] Loading states and skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Theme system (light/dark)

### **Phase 4: QR Scanner** (Day 4-5)
- [ ] Camera permissions
- [ ] QR code scanner component
- [ ] Barcode scanner integration
- [ ] Scan result processing
- [ ] Bundle lookup API

### **Phase 5: Production Features** (Day 6-8)
- [ ] Dashboard with stats
- [ ] Order list screen
- [ ] Order details screen
- [ ] Production tracking screen
- [ ] Operator check-in/out
- [ ] Sewing run management

### **Phase 6: Quality Control** (Day 9-10)
- [ ] QC inspection form
- [ ] Camera for defect photos
- [ ] Defect code selection
- [ ] AQL calculation
- [ ] CAPA task creation

### **Phase 7: Polish & Testing** (Day 11-12)
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Beta testing

---

## API Endpoints Required

### **Authentication**
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

### **Orders**
```
GET    /api/orders?page=1&limit=20
GET    /api/orders/:id
GET    /api/orders/:id/line-items
```

### **Production**
```
GET    /api/bundles/:qr_code
POST   /api/sewing-runs
PUT    /api/sewing-runs/:id/status
GET    /api/production/stats
```

### **Quality Control**
```
POST   /api/qc/inspections
POST   /api/qc/defects
GET    /api/qc/defect-codes
POST   /api/capa/tasks
```

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@tanstack/react-query": "^5.0.0",
    "react-native-vision-camera": "^3.0.0",
    "react-native-biometrics": "^3.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "date-fns": "^2.30.0"
  }
}
```

---

## Screen Mockups

### **1. Login Screen**
```
┌─────────────────────┐
│   Ashley AI Logo    │
│                     │
│  ┌───────────────┐  │
│  │ Email         │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Password      │  │
│  └───────────────┘  │
│                     │
│  [  Login  ]        │
│                     │
│  👆 Use Biometric   │
└─────────────────────┘
```

### **2. Dashboard**
```
┌─────────────────────┐
│ 📊 Dashboard        │
├─────────────────────┤
│ Orders in Progress  │
│      ✅ 15          │
│                     │
│ Today's Production  │
│      📦 250 units   │
│                     │
│ QC Pass Rate        │
│      ✨ 98.5%       │
│                     │
│ [Scan QR Code]      │
└─────────────────────┘
Nav: 🏠 📦 🔍 👤
```

### **3. QR Scanner**
```
┌─────────────────────┐
│ 📷 Scan Bundle QR   │
├─────────────────────┤
│  ┌───────────────┐  │
│  │               │  │
│  │   CAMERA      │  │
│  │   VIEWFINDER  │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│ Point at QR code    │
│ on bundle tag       │
│                     │
│ [Toggle Flash]      │
└─────────────────────┘
```

---

## Development Commands

### **Initialize Project**
```bash
# Create new React Native project
npx react-native@latest init AshleyAIMobile --template react-native-template-typescript

cd AshleyAIMobile

# Install dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @tanstack/react-query
npm install react-native-vision-camera
npm install @react-native-async-storage/async-storage
npm install axios react-hook-form zod date-fns

# iOS setup
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## Environment Variables

```env
# API Configuration
API_BASE_URL=http://192.168.1.6:3001/api
API_TIMEOUT=30000

# Authentication
JWT_STORAGE_KEY=ashley_ai_token
BIOMETRIC_ENABLED=true

# Features
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_OFFLINE_MODE=true
```

---

## Testing Strategy

### **Unit Tests**
- API client functions
- Utility functions
- Form validation
- Authentication logic

### **Integration Tests**
- API endpoint integration
- Navigation flows
- QR scanner functionality
- Data persistence

### **E2E Tests (Detox)**
- Login flow
- QR scanning flow
- Production tracking flow
- Quality control flow

---

## Deployment

### **iOS App Store**
1. Configure signing certificates
2. Update version in Info.plist
3. Build release version
4. Submit via App Store Connect

### **Google Play Store**
1. Generate signed APK/Bundle
2. Update versionCode in build.gradle
3. Upload to Play Console
4. Submit for review

---

## Next Steps

1. ✅ **Verify all Options 4, 6, 8 features**
2. ⏳ **Initialize React Native project** (Option 4)
3. ⏳ **Create basic navigation structure**
4. ⏳ **Implement authentication screens**
5. ⏳ **Build QR scanner component**

---

## Notes

- **Backend Already Complete**: All API endpoints exist in Ashley AI admin service
- **QR System Exists**: Bundle QR codes already generated in cutting operations
- **Authentication Ready**: JWT-based auth with session management already implemented
- **Database Models**: All production tracking models (bundles, sewing runs, QC) exist

**This mobile app will integrate seamlessly with the existing Ashley AI system!**
