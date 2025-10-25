/**
 * Cache Utilities for Performance Optimization
 *
 * Provides utilities for caching frequently accessed data
 * with Redis backend and in-memory fallback
 */
export interface CacheOptions {
    ttl?: number;
    tags?: string[];
}
/**
 * Default TTL values for different data types
 */
export declare const CacheTTL: {
    readonly STATIC: number;
    readonly LONG: number;
    readonly MEDIUM: number;
    readonly SHORT: 60;
    readonly REALTIME: 10;
};
/**
 * Cache tags for organized invalidation
 */
export declare const CacheTags: {
    readonly CLIENTS: "clients";
    readonly ORDERS: "orders";
    readonly EMPLOYEES: "employees";
    readonly PRODUCTS: "products";
    readonly INVENTORY: "inventory";
    readonly ANALYTICS: "analytics";
    readonly DASHBOARD: "dashboard";
    readonly SETTINGS: "settings";
};
/**
 * Get data from cache
 */
export declare function getCache<T>(key: string): Promise<T | null>;
/**
 * Set data in cache
 */
export declare function setCache<T>(key: string, data: T, options?: CacheOptions): Promise<void>;
/**
 * Delete specific cache key
 */
export declare function deleteCache(key: string): Promise<void>;
/**
 * Invalidate all cache entries with specific tag
 */
export declare function invalidateCacheByTag(tag: string): Promise<void>;
/**
 * Cache-aside pattern helper
 * Gets data from cache or fetches it if not cached
 */
export declare function cacheAside<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
/**
 * Warm up cache with frequently accessed data
 */
export declare function warmupCache(workspaceId: string): Promise<void>;
/**
 * Clear all cache for a workspace
 */
export declare function clearWorkspaceCache(workspaceId: string): Promise<void>;
/**
 * Get cache statistics
 */
export declare function getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsed: string;
    hitRate: number;
}>;
/**
 * Cache key builders for consistent naming
 */
export declare const CacheKeys: {
    readonly dashboardStats: (workspaceId: string) => string;
    readonly dashboardCharts: (workspaceId: string) => string;
    readonly clientList: (workspaceId: string, page: number) => string;
    readonly clientDetail: (workspaceId: string, clientId: string) => string;
    readonly orderList: (workspaceId: string, page: number) => string;
    readonly orderDetail: (workspaceId: string, orderId: string) => string;
    readonly employeeList: (workspaceId: string, page: number) => string;
    readonly employeeDetail: (workspaceId: string, employeeId: string) => string;
    readonly analytics: (workspaceId: string, type: string, period: string) => string;
    readonly settings: (workspaceId: string) => string;
};
/**
 * Example usage:
 *
 * // Get with cache-aside pattern
 * const stats = await cacheAside(
 *   CacheKeys.dashboardStats(workspaceId),
 *   async () => await fetchDashboardStats(),
 *   { ttl: CacheTTL.MEDIUM, tags: [CacheTags.DASHBOARD] }
 * );
 *
 * // Invalidate when data changes
 * await invalidateCacheByTag(CacheTags.ORDERS);
 *
 * // Manual cache operations
 * await setCache('my-key', data, { ttl: CacheTTL.LONG });
 * const cached = await getCache<MyType>('my-key');
 * await deleteCache('my-key');
 */
