import { NextRequest, NextResponse } from "next/server";
/**
 * Cache middleware for API routes
 * Automatically cache GET requests
 */
export interface CacheOptions {
    ttl?: number;
    bypassCache?: boolean;
    varyBy?: string[];
    invalidatePatterns?: string[];
}
/**
 * Wrap API handler with caching
 */
export declare function withCache(handler: (request: NextRequest) => Promise<NextResponse>, options?: CacheOptions): (request: NextRequest) => Promise<NextResponse>;
/**
 * Cache decorator for class methods
 */
export declare function Cacheable(ttl?: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function memoize<T extends (...args: any[]) => Promise<any>>(fn: T, ttl?: number): T;
/**
 * Cache invalidation middleware
 */
export declare function withCacheInvalidation(handler: (request: NextRequest) => Promise<NextResponse>, patterns: string[]): (request: NextRequest) => Promise<NextResponse>;
