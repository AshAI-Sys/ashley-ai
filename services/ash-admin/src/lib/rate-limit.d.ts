import { NextRequest, NextResponse } from 'next/server';
interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
declare class RateLimiter {
    private config;
    private requests;
    constructor(config: RateLimitConfig);
    private getKey;
    isAllowed(request: NextRequest): {
        allowed: boolean;
        resetTime?: number;
        remaining?: number;
    };
    cleanup(): void;
}
export declare const apiRateLimit: RateLimiter;
export declare const authRateLimit: RateLimiter;
export declare function rateLimit(limiter: RateLimiter): (handler: (request: NextRequest) => Promise<NextResponse>) => (request: NextRequest) => Promise<NextResponse<unknown>>;
export declare function cleanupRateLimiters(): void;
export {};
