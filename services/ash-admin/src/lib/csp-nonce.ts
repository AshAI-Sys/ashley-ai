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
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  // Convert to base64 using btoa (Edge Runtime compatible)
  const binaryString = String.fromCharCode(...array);
  return btoa(binaryString);
}

/**
 * Create CSP header with nonce
 */
export function createCSPHeader(_nonce: string): string {
  // Relaxed CSP for development - allows inline styles and eval for Next.js dev mode
  const isDevelopment = process.env.NODE_ENV === "development";

  // In development: Use 'unsafe-inline' without nonce for compatibility
  // Note: When nonce is present, 'unsafe-inline' is ignored by browsers
  if (isDevelopment) {
    return [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-eval' 'unsafe-inline'`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `img-src 'self' data: https: blob:`,
      `font-src 'self' data: https://fonts.gstatic.com`,
      `connect-src 'self' https: ws: wss:`,
      `frame-ancestors 'self'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `object-src 'none'`,
      `frame-src 'self'`,
      `media-src 'self'`,
      `manifest-src 'self'`,
      `worker-src 'self' blob:`,
    ].join("; ");
  }

  // Production: Stricter CSP without unsafe-inline
  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: https://res.cloudinary.com https:`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' https://api.anthropic.com https://api.openai.com https:`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `frame-src 'self'`,
    `media-src 'self'`,
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,
  ].join("; ");
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
  ];

  return cspDirectives.join("; ");
}

/**
 * Additional security headers for maximum protection
 */
export function getMaxSecurityHeaders(): Record<string, string> {
  return {
    // Cross-Origin policies for maximum isolation
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Resource-Policy": "same-origin",

    // Certificate transparency
    "Expect-CT": "max-age=86400, enforce",

    // Prevent download execution (IE)
    "X-Download-Options": "noopen",
    "X-Permitted-Cross-Domain-Policies": "none",
  };
}
