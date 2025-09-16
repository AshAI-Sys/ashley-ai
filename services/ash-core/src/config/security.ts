// Security configuration for ASH AI system

export const SECURITY_CONFIG = {
  // JWT Configuration
  JWT: {
    SECRET_MIN_LENGTH: 64,
    ACCESS_TOKEN_EXPIRES: '15m',
    REFRESH_TOKEN_EXPIRES: '7d',
    APPROVAL_TOKEN_EXPIRES: '7d',
    ISSUER: 'ash-ai-system',
    AUDIENCE: {
      API: 'ash-api',
      ADMIN: 'admin-dashboard',
      CLIENT: 'client-portal'
    }
  },

  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
    SALT_ROUNDS: 12
  },

  // Rate Limiting
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_ATTEMPTS: 5
    },
    API_REQUESTS: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 1000
    },
    AI_REQUESTS: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 10
    }
  },

  // File Upload Security
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    SCAN_FOR_MALWARE: true,
    QUARANTINE_SUSPICIOUS: true
  },

  // Input Validation
  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_ARRAY_SIZE: 100,
    SANITIZE_HTML: true,
    ESCAPE_SQL: true
  },

  // Session Security
  SESSION: {
    SECURE_COOKIES: true,
    HTTP_ONLY: true,
    SAME_SITE: 'strict',
    MAX_AGE: 24 * 60 * 60 * 1000 // 24 hours
  },

  // CORS Configuration
  CORS: {
    DEVELOPMENT_ORIGINS: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003'
    ],
    PRODUCTION_ORIGINS: [], // To be set via environment variables
    CREDENTIALS: true,
    METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Security Headers
  HEADERS: {
    HSTS_MAX_AGE: 31536000, // 1 year
    CONTENT_TYPE_OPTIONS: 'nosniff',
    FRAME_OPTIONS: 'DENY',
    XSS_PROTECTION: '1; mode=block',
    REFERRER_POLICY: 'strict-origin-when-cross-origin'
  },

  // Database Security
  DATABASE: {
    ENCRYPT_PII: true,
    AUDIT_ALL_CHANGES: true,
    ROW_LEVEL_SECURITY: true,
    CONNECTION_POOL_MAX: 20,
    QUERY_TIMEOUT: 30000 // 30 seconds
  },

  // AI Security
  AI: {
    INPUT_MAX_LENGTH: 2000,
    PROMPT_INJECTION_DETECTION: true,
    CONTENT_FILTERING: true,
    RATE_LIMIT_PER_USER: 100, // per hour
    LOG_ALL_REQUESTS: true
  }
}

// Validation functions
export const validateSecurityConfig = (): boolean => {
  const jwtSecret = process.env.ASH_JWT_SECRET
  
  if (!jwtSecret || jwtSecret.length < SECURITY_CONFIG.JWT.SECRET_MIN_LENGTH) {
    throw new Error(`JWT secret must be at least ${SECURITY_CONFIG.JWT.SECRET_MIN_LENGTH} characters long`)
  }

  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV must be set')
  }

  return true
}

// Helper functions
export const isProductionMode = (): boolean => {
  return process.env.NODE_ENV === 'production'
}

export const getSecureCorsOrigins = (): string[] => {
  if (isProductionMode()) {
    return process.env.ASH_ALLOWED_ORIGINS?.split(',') || []
  }
  return SECURITY_CONFIG.CORS.DEVELOPMENT_ORIGINS
}

export const shouldEnforceHTTPS = (): boolean => {
  return isProductionMode()
}