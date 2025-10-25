/**
 * API Rate Limiting System
 * Protects API endpoints from abuse using token bucket algorithm
 * Supports Redis for distributed systems with in-memory fallback
 */
export interface RateLimitConfig {
    /**
     * Maximum number of requests allowed in the window
     */
    limit: number;
    /**
     * Time window in milliseconds
     */
    window: number;
    /**
     * Identifier for this rate limit (e.g., 'api-key', 'ip', 'user-id')
     */
    identifier: string;
}
export interface RateLimitResult {
    /**
     * Whether the request is allowed
     */
    allowed: boolean;
    /**
     * Number of requests remaining in the current window
     */
    remaining: number;
    /**
     * Total request limit
     */
    limit: number;
    /**
     * Time until the rate limit resets (in milliseconds)
     */
    resetAt: number;
    /**
     * Number of seconds to wait before retrying (if limited)
     */
    retryAfter?: number;
}
/**
 * Check rate limit for a given key
 */
export declare function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult>;
/**
 * Predefined rate limit tiers
 */
export declare const RateLimitTiers: {
    /**
     * Strict rate limit for authentication endpoints
     * 5 requests per 15 minutes
     */
    AUTH: {
        limit: number;
        window: number;
    };
    /**
     * Standard rate limit for API endpoints
     * 100 requests per minute
     */
    STANDARD: {
        limit: number;
        window: number;
    };
    /**
     * Relaxed rate limit for read operations
     * 300 requests per minute
     */
    READ: {
        limit: number;
        window: number;
    };
    /**
     * Strict rate limit for write operations
     * 30 requests per minute
     */
    WRITE: {
        limit: number;
        window: number;
    };
    /**
     * Very strict rate limit for expensive operations
     * 10 requests per hour
     */
    EXPENSIVE: {
        limit: number;
        window: number;
    };
    /**
     * Rate limit for file uploads
     * 20 requests per hour
     */
    UPLOAD: {
        limit: number;
        window: number;
    };
};
/**
 * Get identifier from request
 */
export declare function getIdentifier(request: Request, type?: "ip" | "user" | "api-key"): string;
/**
 * Rate limit middleware for Next.js API routes
 */
export declare function withRateLimit(tier?: keyof typeof RateLimitTiers, identifierType?: "ip" | "user" | "api-key"): <T>(handler: (request: Request, context: any) => Promise<T>) => (request: Request, context: any) => Promise<T | Response>;
/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual override
 */
export declare function resetRateLimit(identifier: string): Promise<void>;
/**
 * Get rate limit status for an identifier
 */
export declare function getRateLimitStatus(identifier: string, tier?: keyof typeof RateLimitTiers): Promise<RateLimitResult>;
/**
 * Custom rate limit with specific configuration
 */
export declare function customRateLimit(identifier: string, limit: number, windowMinutes: number): Promise<RateLimitResult>;
/**
 * Cleanup function for in-memory store
 * Should be called periodically
 */
export declare function cleanupMemoryStore(): void;
