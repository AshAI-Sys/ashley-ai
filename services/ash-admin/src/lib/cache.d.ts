/**
 * Caching Utility with Redis Support
 * Provides automatic caching for expensive database queries
 */
export interface CacheOptions {
    /**
     * Time to live in seconds
     * Default: 300 (5 minutes)
     */
    ttl?: number;
    /**
     * Cache key prefix
     */
    prefix?: string;
    /**
     * Whether to use stale-while-revalidate pattern
     */
    swr?: boolean;
    /**
     * Stale time in seconds (for SWR)
     */
    staleTime?: number;
}
/**
 * Get value from cache or execute function and cache result
 */
export declare function cached<T>(key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T>;
/**
 * Invalidate cache by key or pattern
 */
export declare function invalidateCache(keyOrPattern: string, prefix?: string): Promise<void>;
/**
 * Cache for paginated results
 */
export declare function cachedPaginated<T>(key: string, page: number, limit: number, fn: () => Promise<T>, options?: CacheOptions): Promise<T>;
/**
 * Cache for user-specific data
 */
export declare function cachedForUser<T>(userId: string, key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T>;
/**
 * Invalidate all user cache
 */
export declare function invalidateUserCache(userId: string): Promise<void>;
/**
 * Cache for workspace-specific data
 */
export declare function cachedForWorkspace<T>(workspaceId: string, key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T>;
/**
 * Invalidate all workspace cache
 */
export declare function invalidateWorkspaceCache(workspaceId: string): Promise<void>;
/**
 * Cache decorator for functions
 */
export declare function memoize<T extends (...args: any[]) => Promise<any>>(fn: T, options?: CacheOptions & {
    keyGenerator?: (...args: Parameters<T>) => string;
}): T;
/**
 * Batch cache operations
 */
export declare function batchGet<T>(keys: string[], prefix?: string): Promise<Map<string, T>>;
/**
 * Batch cache set
 */
export declare function batchSet(entries: Array<{
    key: string;
    value: any;
    ttl?: number;
}>, prefix?: string): Promise<void>;
/**
 * Cache warming - pre-populate cache with frequently accessed data
 */
export declare function warmCache(tasks: Array<{
    key: string;
    fn: () => Promise<any>;
    options?: CacheOptions;
}>): Promise<void>;
/**
 * Get cache statistics
 */
export declare function getCacheStats(prefix?: string): Promise<{
    totalKeys: number;
    memoryUsage: number;
    hitRate?: number;
}>;
