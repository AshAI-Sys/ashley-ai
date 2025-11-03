# Ashley AI Mobile

Mobile app for Ashley AI Manufacturing ERP - Inventory Management System

## Features

- **Store Scanner**: QR code scanning for product information
- **Cashier POS**: Point of sale for processing sales
- **Warehouse Management**: Delivery receiving, stock transfers, and inventory adjustments
- **Authentication**: Secure JWT token-based authentication with expo-secure-store

## Tech Stack

- **React Native** (0.72.6) with **Expo** (49.0.23)
- **React Navigation** for navigation
- **TypeScript** for type safety
- **Expo Camera** for QR code scanning
- **Expo Secure Store** for secure token storage
- **Axios** for API requests

## Prerequisites

- Node.js 18+ and pnpm
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (for testing)

## Installation

```bash
# Install dependencies
pnpm install
```

## Running the App

```bash
# Start Expo development server
pnpm start

# Run on Android
pnpm android

# Run on iOS
pnpm ios

# Run in web browser
pnpm web
```

## Project Structure

```
ash-mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── StoreScannerScreen.tsx
│   │   ├── CashierPOSScreen.tsx
│   │   └── WarehouseScreen.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── RootNavigator.tsx
│   ├── context/          # React Context providers
│   │   └── AuthContext.tsx
│   ├── api/              # API service functions
│   ├── components/       # Reusable components
│   ├── utils/            # Utility functions
│   │   └── api.ts
│   └── constants/        # App constants
│       └── config.ts
├── App.tsx               # Main app entry point
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## Configuration

Update the API base URL in `src/constants/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001', // Change to your backend URL
  // ...
};
```

## Authentication

The app uses JWT token-based authentication:

1. User logs in with email/password
2. Receives JWT access token from backend
3. Token stored securely in Expo Secure Store
4. Token included in Authorization header for all API requests
5. Auto-logout on token expiration

## Screens

### Login Screen
- Email/password authentication
- Secure token storage

### Home Screen
- Dashboard with quick access to all features
- Displays user info and workspace

### Store Scanner
- QR code scanning for product lookup
- Real-time product information and stock levels

### Cashier POS
- Product search and cart management
- Multiple payment methods
- Sales processing

### Warehouse
- Delivery receiving
- Stock transfers between locations
- Inventory adjustments

## API Integration

All API requests use the authenticated axios client from `src/utils/api.ts`:

```typescript
import apiClient, { createAuthConfig } from '@/utils/api';

// Authenticated request
const response = await apiClient.get('/api/inventory/product/123', createAuthConfig(token));
```

## Development

```bash
# Lint code
pnpm lint

# Run tests
pnpm test
```

## Building for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

## Troubleshooting

### Can't connect to backend
- Ensure the backend is running on the correct port
- Update `API_CONFIG.BASE_URL` with the correct URL
- For testing on physical device, use your computer's IP address instead of localhost

### Camera not working
- Ensure camera permissions are granted
- Check `app.json` for correct camera plugin configuration

## License

Private - Ashley AI Manufacturing ERP System
