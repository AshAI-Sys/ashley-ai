/**
 * API Cache Middleware
 * Automatic caching for GET endpoints
 */
import { NextRequest, NextResponse } from "next/server";
export interface CacheOptions {
    ttl?: number;
    key?: string;
    enabled?: boolean;
    vary?: string[];
    revalidate?: number;
}
/**
 * API Cache Middleware
 * Wraps API route handlers with automatic caching
 */
export declare function withAPICache(handler: (request: NextRequest) => Promise<NextResponse>, options?: CacheOptions): (request: NextRequest) => Promise<NextResponse>;
/**
 * Cache invalidation helper for API routes
 */
export declare function invalidateAPICache(pattern: string): Promise<void>;
/**
 * Pre-configured cache strategies
 */
export declare const CacheStrategies: {
    realtime: {
        ttl: number;
        revalidate: number;
    };
    short: {
        ttl: number;
        revalidate: number;
    };
    medium: {
        ttl: number;
        revalidate: number;
    };
    long: {
        ttl: number;
        revalidate: number;
    };
    static: {
        ttl: number;
        revalidate: number;
    };
};
/**
 * Example usage:
 *
 * // Short cache (1 minute)
 * export const GET = withAPICache(
 *   async (request: NextRequest) => { ... },
 *   CacheStrategies.short
 * )
 *
 * // Custom cache
 * export const GET = withAPICache(
 *   async (request: NextRequest) => { ... },
 *   { ttl: 600, key: 'custom-key', vary: ['authorization'] }
 * )
 */
