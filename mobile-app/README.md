# Ashley AI Mobile App

React Native mobile application for Ashley AI Manufacturing ERP system.

## 📱 Features Implemented

### ✅ Core Infrastructure
- [x] Project folder structure
- [x] TypeScript configuration
- [x] API client with authentication
- [x] Token management with SecureStore
- [x] Auto token refresh
- [x] Auth context for state management

### ✅ Authentication
- [x] Login screen with email/password
- [x] Biometric authentication support
- [x] Secure token storage
- [x] Auto-login on app start

### ✅ API Endpoints
- [x] Auth API (login, logout, get user)
- [x] Orders API (list, details, line items)
- [x] Production API (bundle scanning, stats, sewing runs)

## 📂 Project Structure

```
mobile-app/
├── src/
│   ├── api/              # API service layer
│   │   ├── client.ts     # Axios client with auth
│   │   ├── auth.ts       # Authentication endpoints
│   │   ├── orders.ts     # Order endpoints
│   │   └── production.ts # Production endpoints
│   │
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx  # Auth state management
│   │
│   ├── screens/          # Screen components
│   │   └── auth/
│   │       └── LoginScreen.tsx  # Login UI
│   │
│   ├── components/       # Reusable components (TODO)
│   ├── navigation/       # Navigation config (TODO)
│   ├── hooks/            # Custom hooks (TODO)
│   └── utils/            # Utilities (TODO)
│
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md             # This file
```

## 🚀 Next Steps

### To Complete the Mobile App:

1. **Install Dependencies**
   ```bash
   cd mobile-app
   npm install
   # or
   expo install
   ```

2. **Setup Navigation**
   - Create RootNavigator
   - Create AuthStack
   - Create MainTabs (Dashboard, Scanner, Orders, Profile)

3. **Build Remaining Screens**
   - Dashboard with production stats
   - QR Scanner screen
   - Orders list screen
   - Order details screen
   - Production tracking screen

4. **QR Scanner Component**
   - Implement Camera with expo-camera
   - Add QR code detection
   - Bundle lookup and display

5. **Testing**
   - Test authentication flow
   - Test API connectivity
   - Test QR scanning

## 🔧 Configuration

Update API base URL in `src/api/client.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:3001/api';
```

Replace `YOUR_IP` with your computer's local IP address.

## 📝 Environment Variables

Create `.env` file:
```env
API_BASE_URL=http://192.168.1.6:3001/api
```

## 🛠️ Development

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 📱 Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development toolchain
- **TypeScript**: Type-safe development
- **Axios**: HTTP client
- **expo-secure-store**: Secure token storage
- **expo-local-authentication**: Biometric auth
- **expo-camera**: QR scanning (to be implemented)
- **@react-navigation**: Navigation (to be implemented)

## 🔒 Security Features

- JWT-based authentication
- Secure token storage with expo-secure-store
- Auto token refresh
- Biometric authentication support
- HTTPS communication

## 🎯 Status

**Phase 1 Complete**: 
- ✅ Project setup
- ✅ API client
- ✅ Authentication

**Next Phase**: Navigation & Core Screens

---

Built with ❤️ for Ashley AI Manufacturing ERP
