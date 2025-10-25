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
export declare function generateNonce(): string;
/**
 * Create CSP header with nonce
 */
export declare function createCSPHeader(nonce: string): string;
/**
 * Create stricter CSP for production
 */
export declare function createStrictCSPHeader(nonce: string): string;
/**
 * Additional security headers for maximum protection
 */
export declare function getMaxSecurityHeaders(): Record<string, string>;
