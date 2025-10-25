import { NextRequest, NextResponse } from "next/server";
export interface RateLimitConfig {
    /**
     * Maximum number of requests allowed
     */
    max: number;
    /**
     * Time window in seconds
     */
    windowSeconds: number;
    /**
     * Custom key generator (default: IP address)
     */
    keyGenerator?: (req: NextRequest) => string;
    /**
     * Message to return when rate limited
     */
    message?: string;
}
/**
 * Rate limiting middleware with Redis/in-memory fallback
 *
 * @example
 * // In API route:
 * const limiter = createRateLimiter({ max: 5, windowSeconds: 60 })
 * const limitResponse = await limiter(request)
 * if (limitResponse) return limitResponse
 */
export declare function createRateLimiter(config: RateLimitConfig): (request: NextRequest) => Promise<NextResponse | null>;
/**
 * Common rate limit configurations
 */
export declare const RateLimitPresets: {
    /** Strict: 5 requests per minute */
    STRICT: {
        max: number;
        windowSeconds: number;
    };
    /** Standard: 10 requests per minute */
    STANDARD: {
        max: number;
        windowSeconds: number;
    };
    /** Moderate: 30 requests per minute */
    MODERATE: {
        max: number;
        windowSeconds: number;
    };
    /** Generous: 100 requests per minute */
    GENEROUS: {
        max: number;
        windowSeconds: number;
    };
    /** Login: 5 attempts per 15 minutes */
    LOGIN: {
        max: number;
        windowSeconds: number;
    };
    /** Password Reset: 3 attempts per hour */
    PASSWORD_RESET: {
        max: number;
        windowSeconds: number;
    };
    /** File Upload: 10 uploads per 5 minutes */
    FILE_UPLOAD: {
        max: number;
        windowSeconds: number;
    };
    /** API: 1000 requests per hour */
    API: {
        max: number;
        windowSeconds: number;
    };
};
/**
 * Helper to add rate limit headers to response
 */
export declare function addRateLimitHeaders(response: NextResponse, request: NextRequest): NextResponse;
/**
 * Account lockout tracking
 */
export declare function trackFailedLogin(identifier: string): Promise<{
    attempts: number;
    isLocked: boolean;
    lockedUntil?: Date;
}>;
/**
 * Clear failed login attempts (on successful login)
 */
export declare function clearFailedLogins(identifier: string): Promise<void>;
/**
 * Check if account is locked
 */
export declare function isAccountLocked(identifier: string): Promise<{
    locked: boolean;
    lockedUntil?: Date;
}>;
