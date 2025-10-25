/**
 * Redis Cache Service
 * High-level caching utilities with automatic serialization
 */
export declare class CacheService {
    private prefix;
    constructor(prefix?: string);
    /**
     * Generate cache key with prefix
     */
    private key;
    /**
     * Get cached value (with automatic JSON deserialization)
     */
    get<T = any>(key: string): Promise<T | null>;
    /**
     * Set cached value (with automatic JSON serialization)
     */
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    /**
     * Delete cached value(s)
     */
    delete(...keys: string[]): Promise<number>;
    /**
     * Check if key exists
     */
    exists(...keys: string[]): Promise<number>;
    /**
     * Set expiration on existing key
     */
    expire(key: string, ttlSeconds: number): Promise<boolean>;
    /**
     * Get remaining TTL
     */
    ttl(key: string): Promise<number>;
    /**
     * Get or set cached value (cache-aside pattern)
     */
    getOrSet<T = any>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T>;
    /**
     * Invalidate cache by pattern
     */
    invalidatePattern(pattern: string): Promise<number>;
    /**
     * Increment counter
     */
    increment(key: string, amount?: number): Promise<number>;
    /**
     * Decrement counter
     */
    decrement(key: string, amount?: number): Promise<number>;
    /**
     * Store multiple values at once
     */
    setMany(entries: Record<string, any>, ttlSeconds?: number): Promise<boolean>;
    /**
     * Get multiple values at once
     */
    getMany<T = any>(...keys: string[]): Promise<(T | null)[]>;
    /**
     * Clear all cache with this prefix
     */
    clear(): Promise<number>;
}
export declare const cache: CacheService;
export declare const userCache: CacheService;
export declare const orderCache: CacheService;
export declare const clientCache: CacheService;
export declare const inventoryCache: CacheService;
export declare const sessionCache: CacheService;
export declare const apiCache: CacheService;
