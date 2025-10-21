/**
 * Security Configuration for Ashley AI
 * Centralized security settings and utilities
 */

export const SECURITY_CONFIG = {
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: {
      LOGIN: 5, // 5 login attempts per minute
      REGISTER: 3, // 3 registration attempts per minute
      TWO_FA: 5, // 5 2FA attempts per minute
      OTP: 3, // 3 OTP requests per minute
      API_DEFAULT: 100, // 100 API requests per minute
    },
  },

  // CSRF Protection
  CSRF: {
    TOKEN_LENGTH: 32,
    TOKEN_EXPIRY_MS: 3600000, // 1 hour
    COOKIE_NAME: "csrf-token",
    HEADER_NAME: "X-CSRF-Token",
    EXCLUDED_PATHS: ["/api/auth/login", "/api/auth/register", "/api/webhooks/"],
  },

  // Content Security Policy
  CSP: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // Required for Next.js in development
        "'unsafe-inline'", // Required for Next.js
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components/tailwind
        "https://fonts.googleapis.com",
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: [
        "'self'",
        "https://api.cloudinary.com",
        "https://api.twilio.com",
        "https://api.semaphore.co",
        "https://api.movider.co",
        "https://api.lalamove.com",
        "https://api.jtexpress.ph",
      ],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },

  // Security Headers
  HEADERS: {
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(self), payment=()",
  },

  // CORS Configuration
  CORS: {
    allowedOrigins: [
      "http://localhost:3001",
      "http://localhost:3003",
      "https://ashleyai.vercel.app", // Production URL
    ],
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
  },

  // Password Policy
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  },

  // Session Configuration
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    COOKIE_NAME: "session",
    SECURE: process.env.NODE_ENV === "production",
    HTTP_ONLY: true,
    SAME_SITE: "strict" as const,
  },

  // IP Whitelist (for admin routes)
  IP_WHITELIST: process.env.ADMIN_IP_WHITELIST?.split(",") || [],

  // Security Audit
  AUDIT: {
    LOG_SENSITIVE_OPERATIONS: true,
    LOG_FAILED_AUTH: true,
    LOG_RATE_LIMIT: true,
    LOG_CSRF_VIOLATIONS: true,
    LOG_IP_BLOCKS: true,
  },
};

/**
 * Validate password against security policy
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const {
    MIN_LENGTH,
    MAX_LENGTH,
    REQUIRE_UPPERCASE,
    REQUIRE_LOWERCASE,
    REQUIRE_NUMBER,
    REQUIRE_SPECIAL,
    SPECIAL_CHARS,
  } = SECURITY_CONFIG.PASSWORD;

  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters`);
  }

  if (password.length > MAX_LENGTH) {
    errors.push(`Password must not exceed ${MAX_LENGTH} characters`);
  }

  if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (
    REQUIRE_SPECIAL &&
    !new RegExp(
      `[${SPECIAL_CHARS.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}]`
    ).test(password)
  ) {
    errors.push(
      `Password must contain at least one special character (${SPECIAL_CHARS})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate Content Security Policy header value
 */
export function generateCSPHeader(): string {
  const directives = Object.entries(SECURITY_CONFIG.CSP.directives).map(
    ([key, values]) => {
      const directiveName = key.replace(
        /[A-Z]/g,
        letter => `-${letter.toLowerCase()}`
      );
      return `${directiveName} ${values.join(" ")}`;
    }
  );

  return directives.join("; ");
}

/**
 * Check if IP is whitelisted for admin access
 */
export function isIPWhitelisted(ip: string): boolean {
  if (SECURITY_CONFIG.IP_WHITELIST.length === 0) return true;
  return SECURITY_CONFIG.IP_WHITELIST.includes(ip);
}

/**
 * Check if origin is allowed for CORS
 */
export function isOriginAllowed(origin: string): boolean {
  return (
    SECURITY_CONFIG.CORS.allowedOrigins.includes(origin) ||
    SECURITY_CONFIG.CORS.allowedOrigins.includes("*")
  );
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Check if path is excluded from CSRF protection
 */
export function isCSRFExcluded(pathname: string): boolean {
  return SECURITY_CONFIG.CSRF.EXCLUDED_PATHS.some(path =>
    pathname.includes(path)
  );
}
