import { NextResponse } from "next/server";
/**
 * Generate a cryptographic nonce for CSP
 */
export declare function generateNonce(): string;
/**
 * Content Security Policy configuration
 *
 * This CSP is designed to:
 * - Prevent XSS attacks by restricting script sources
 * - Prevent clickjacking with frame-ancestors
 * - Restrict resource loading to trusted sources
 * - Use nonces for inline scripts/styles instead of unsafe-inline
 */
export declare function getCSPHeader(nonce: string): string;
/**
 * Security headers configuration
 * Implements OWASP recommended security headers
 */
export declare function getSecurityHeaders(nonce: string): Record<string, string>;
/**
 * Apply security headers to a NextResponse
 */
export declare function applySecurityHeaders(response: NextResponse, nonce?: string): NextResponse;
/**
 * CSP violation reporting endpoint handler
 * Logs CSP violations for monitoring
 */
export declare function handleCSPViolation(report: any): void;
/**
 * Generate CSP report-only header for testing
 * Use this to test CSP before enforcing it
 */
export declare function getCSPReportOnlyHeader(nonce: string): string;
