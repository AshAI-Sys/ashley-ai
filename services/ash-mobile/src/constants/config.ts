// API Configuration
export const API_CONFIG = {
  // PRODUCTION: Update this URL before building for app stores
  // Use your Vercel deployment URL or custom domain
  BASE_URL: __DEV__
    ? 'http://localhost:3001'  // Development (localhost or your computer's IP for testing)
    : 'https://ashley-ai.vercel.app',  // Production (UPDATE THIS!)

  // API endpoints
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    PRODUCT_SCAN: '/api/inventory/product',
    SALES: '/api/inventory/sales',
    DELIVERY: '/api/inventory/delivery',
    TRANSFER: '/api/inventory/transfer',
    ADJUST: '/api/inventory/adjust',
    REPORT: '/api/inventory/report',
  },

  // Request timeout (10 seconds)
  TIMEOUT: 10000,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Ashley AI Mobile',
  VERSION: '1.0.0',

  // Token storage key
  TOKEN_KEY: 'ash_mobile_token',
  USER_KEY: 'ash_mobile_user',
};

// Colors
export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  white: '#FFFFFF',
  black: '#111827',
};
