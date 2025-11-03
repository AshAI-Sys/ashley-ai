import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Client-Side Configuration
 * Captures errors that occur in the browser
 */

// Only initialize if DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
  // Sentry DSN (Data Source Name)
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Release version (for tracking)
  release: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev

  // Session Replay (optional - records user sessions)
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Error Filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Sentry Error (not sent in dev):",
        hint.originalException || hint.syntheticException
      );
      return null;
    }

    // Filter out network errors (handled separately)
    if (event.exception?.values?.[0]?.type === "NetworkError") {
      return null;
    }

    // Filter out specific errors
    const errorMessage = event.exception?.values?.[0]?.value || "";
    const ignoredErrors = [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      "ChunkLoadError",
    ];

    if (ignoredErrors.some(ignored => errorMessage.includes(ignored))) {
      return null;
    }

    return event;
  },

  // Integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Mask all text content for privacy
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Tag all events with user info
  initialScope: {
    tags: {
      component: "client",
      app: "ashley-ai-admin",
    },
  },
  });
} else {
  console.log('⚠️ NEXT_PUBLIC_SENTRY_DSN not configured - Sentry client monitoring disabled');
}

// Custom error logging helper
export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Custom message logging helper
export function logMessage(
  message: string,
  level: "info" | "warning" | "error" = "info"
) {
  Sentry.captureMessage(message, level);
}

// Set user context (call after authentication)
export function setUserContext(user: {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    role: user.role,
  });
}

// Clear user context (call on logout)
export function clearUserContext() {
  Sentry.setUser(null);
}

// Add custom breadcrumb
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    level: "info",
    data,
  });
}
