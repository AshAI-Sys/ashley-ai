/**
 * CSP Nonce Generator
 *
 * Generates cryptographically secure nonces for Content Security Policy
 * Uses Web Crypto API for Edge Runtime compatibility
 */

/**
 * Generate a secure random nonce for CSP
 * Edge Runtime compatible using Web Crypto API
 */
export function generateNonce(): string {
  // Use Web Crypto API (available in Edge Runtime)
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)

  // Convert to base64 using btoa (Edge Runtime compatible)
  const binaryString = String.fromCharCode(...array)
  return btoa(binaryString)
}

/**
 * Create CSP header with nonce
 */
export function createCSPHeader(nonce: string): string {
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https://res.cloudinary.com https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://api.anthropic.com https://api.openai.com https:`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `frame-src 'self'`,
    `media-src 'self'`,
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,
  ]

  return cspDirectives.join('; ')
}

/**
 * Create stricter CSP for production
 */
export function createStrictCSPHeader(nonce: string): string {
  const cspDirectives = [
    `default-src 'none'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https://res.cloudinary.com`,
    `font-src 'self'`,
    `connect-src 'self' https://api.anthropic.com https://api.openai.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `frame-src 'none'`,
    `media-src 'self'`,
    `manifest-src 'self'`,
    `upgrade-insecure-requests`,
    `block-all-mixed-content`,
  ]

  return cspDirectives.join('; ')
}

/**
 * Additional security headers for maximum protection
 */
export function getMaxSecurityHeaders(): Record<string, string> {
  return {
    // Cross-Origin policies for maximum isolation
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',

    // Certificate transparency
    'Expect-CT': 'max-age=86400, enforce',

    // Prevent download execution (IE)
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
  }
}
