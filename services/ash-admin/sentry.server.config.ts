import * as Sentry from '@sentry/nextjs'

/**
 * Sentry Server-Side Configuration
 * Captures errors that occur on the server (API routes, SSR)
 */

Sentry.init({
  // Sentry DSN (Data Source Name)
  dsn: process.env.SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release version
  release: process.env.APP_VERSION || '1.0.0',

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

  // Error Filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error (not sent in dev):', hint.originalException || hint.syntheticException)
      return null
    }

    // Filter out Prisma connection errors (logged separately)
    const errorMessage = event.exception?.values?.[0]?.value || ''
    if (errorMessage.includes('PrismaClientKnownRequestError')) {
      return null
    }

    return event
  },

  // Integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: undefined }), // Will be set dynamically
  ],

  // Tag all events
  initialScope: {
    tags: {
      component: 'server',
      app: 'ashley-ai-admin',
    },
  },
})

// Database error logging
export function logDatabaseError(error: Error, query?: string) {
  Sentry.captureException(error, {
    tags: {
      type: 'database_error',
    },
    extra: {
      query,
    },
  })
}

// API error logging
export function logAPIError(error: Error, endpoint: string, method: string) {
  Sentry.captureException(error, {
    tags: {
      type: 'api_error',
      endpoint,
      method,
    },
  })
}

// External service error logging
export function logExternalServiceError(
  error: Error,
  service: string,
  operation: string
) {
  Sentry.captureException(error, {
    tags: {
      type: 'external_service_error',
      service,
      operation,
    },
  })
}

// Performance monitoring
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  })
}

// Custom performance tracking
export async function trackPerformance<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(name, 'function')

  try {
    const result = await operation()
    transaction.setStatus('ok')
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    throw error
  } finally {
    transaction.finish()
  }
}
