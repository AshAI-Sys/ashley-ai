// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs')

/**
 * Sentry Configuration for Next.js
 * Enables error tracking and performance monitoring
 */

const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,

  // Organization and project from Sentry dashboard
  org: process.env.SENTRY_ORG || 'ashley-ai',
  project: process.env.SENTRY_PROJECT || 'ashley-ai-admin',

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Automatically create releases
  release: process.env.APP_VERSION || '1.0.0',

  // Upload source maps for better error debugging
  widenClientFileUpload: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
}

module.exports = {
  sentryWebpackPluginOptions,
  withSentryConfig: (nextConfig) => withSentryConfig(nextConfig, sentryWebpackPluginOptions),
}
