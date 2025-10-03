/**
 * Polyfills for server-side rendering
 * Fixes "self is not defined" and other browser API issues during build
 */

// Polyfill 'self' for Node.js environment
if (typeof self === 'undefined') {
  global.self = global
}

// Polyfill 'window' if needed
if (typeof window === 'undefined') {
  global.window = global
}

// Export empty object to make this a valid module
module.exports = {}
