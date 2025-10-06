import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Generate a cryptographic nonce for CSP
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

/**
 * Content Security Policy configuration
 *
 * This CSP is designed to:
 * - Prevent XSS attacks by restricting script sources
 * - Prevent clickjacking with frame-ancestors
 * - Restrict resource loading to trusted sources
 * - Use nonces for inline scripts/styles instead of unsafe-inline
 */
export function getCSPHeader(nonce: string): string {
  const cspDirectives = {
    // Default policy: only allow resources from same origin
    'default-src': ["'self'"],

    // Scripts: Allow same origin and nonce-based inline scripts
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'", // Allow scripts loaded by trusted scripts
      // Add specific trusted CDNs if needed
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ],

    // Styles: Allow same origin and nonce-based inline styles
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'unsafe-inline'", // Required for many CSS-in-JS solutions
      'https://fonts.googleapis.com'
    ],

    // Images: Allow same origin, data URIs, and blob URIs
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:', // Allow images from HTTPS sources
      'http://localhost:*' // Development only
    ],

    // Fonts: Allow same origin and Google Fonts
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com'
    ],

    // Connect (AJAX, WebSocket): Allow same origin and API endpoints
    'connect-src': [
      "'self'",
      'https://api.ashleyai.com', // Your API domain
      'http://localhost:*', // Development
      'ws://localhost:*', // WebSocket development
      'wss://*' // WebSocket production
    ],

    // Media: Allow same origin
    'media-src': ["'self'", 'blob:', 'data:'],

    // Objects: Disallow plugins (Flash, Java, etc.)
    'object-src': ["'none'"],

    // Frames: Only allow same origin
    'frame-src': ["'self'"],

    // Frame ancestors: Prevent clickjacking
    'frame-ancestors': ["'none'"],

    // Base URI: Prevent base tag injection
    'base-uri': ["'self'"],

    // Form actions: Only allow forms to submit to same origin
    'form-action': ["'self'"],

    // Upgrade insecure requests (HTTP to HTTPS)
    'upgrade-insecure-requests': [],

    // Block mixed content
    'block-all-mixed-content': []
  }

  // Convert directives to CSP header format
  const csp = Object.entries(cspDirectives)
    .map(([key, values]) => {
      if (values.length === 0) return key
      return `${key} ${values.join(' ')}`
    })
    .join('; ')

  return csp
}

/**
 * Security headers configuration
 * Implements OWASP recommended security headers
 */
export function getSecurityHeaders(nonce: string): Record<string, string> {
  return {
    // Content Security Policy
    'Content-Security-Policy': getCSPHeader(nonce),

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection in older browsers
    'X-XSS-Protection': '1; mode=block',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Referrer policy: Only send origin on cross-origin requests
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy: Restrict browser features
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Disable FLoC
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '),

    // HTTP Strict Transport Security (HSTS)
    // Enforce HTTPS for 2 years, including subdomains
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // Expect-CT: Certificate Transparency
    'Expect-CT': 'max-age=86400, enforce',

    // Cross-Origin policies
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
  }
}

/**
 * Apply security headers to a NextResponse
 */
export function applySecurityHeaders(
  response: NextResponse,
  nonce?: string
): NextResponse {
  const nonceValue = nonce || generateNonce()
  const headers = getSecurityHeaders(nonceValue)

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Store nonce in response for use in components
  response.headers.set('X-Nonce', nonceValue)

  return response
}

/**
 * CSP violation reporting endpoint handler
 * Logs CSP violations for monitoring
 */
export function handleCSPViolation(report: any) {
  console.warn('CSP Violation:', {
    documentURI: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedURI: report['blocked-uri'],
    effectiveDirective: report['effective-directive'],
    originalPolicy: report['original-policy'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number'],
    columnNumber: report['column-number'],
    statusCode: report['status-code'],
    timestamp: new Date().toISOString()
  })

  // In production, you might want to:
  // - Store violations in database
  // - Send alerts for critical violations
  // - Aggregate violations for analysis
}

/**
 * Generate CSP report-only header for testing
 * Use this to test CSP before enforcing it
 */
export function getCSPReportOnlyHeader(nonce: string): string {
  return getCSPHeader(nonce)
}
