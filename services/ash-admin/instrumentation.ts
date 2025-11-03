/**
 * Next.js Instrumentation File
 * Registers server-side instrumentation for Sentry
 * This file runs once when the Next.js server starts
 */

export async function register() {
  // Only initialize Sentry if DSN is configured
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️ SENTRY_DSN not configured - Sentry monitoring disabled');
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import server config for Node.js runtime
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import edge config for Edge runtime
    await import('./sentry.edge.config');
  }
}
