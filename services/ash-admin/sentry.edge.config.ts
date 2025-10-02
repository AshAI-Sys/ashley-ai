import * as Sentry from '@sentry/nextjs'

/**
 * Sentry Edge Runtime Configuration
 * Captures errors in Edge middleware and Edge API routes
 */

Sentry.init({
  // Sentry DSN (Data Source Name)
  dsn: process.env.SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release version
  release: process.env.APP_VERSION || '1.0.0',

  // Performance Monitoring (lower rate for edge)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5, // 5% in prod

  // Error Filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Edge Error (not sent in dev):', hint.originalException || hint.syntheticException)
      return null
    }

    return event
  },

  // Tag all events
  initialScope: {
    tags: {
      component: 'edge',
      app: 'ashley-ai-admin',
    },
  },
})
