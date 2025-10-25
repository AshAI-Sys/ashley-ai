/**
 * Caching Strategies and TTL Constants
 * Optimized cache durations for different data types
 */
export declare const CacheTTL: {
    readonly REAL_TIME: 60;
    readonly STOCK_LEVELS: 120;
    readonly PRODUCTION_STATUS: 300;
    readonly USER_SESSION: 900;
    readonly ORDER_STATUS: 600;
    readonly DASHBOARD_STATS: 300;
    readonly USER_PROFILE: 1800;
    readonly CLIENT_DATA: 3600;
    readonly PRODUCT_DATA: 3600;
    readonly SYSTEM_CONFIG: 7200;
    readonly STATIC_DATA: 86400;
    readonly REPORTS: 43200;
};
/**
 * Cache key generators
 */
export declare const CacheKeys: {
    readonly user: (userId: string) => string;
    readonly userByEmail: (email: string) => string;
    readonly userPermissions: (userId: string) => string;
    readonly userSession: (sessionId: string) => string;
    readonly order: (orderId: string) => string;
    readonly ordersByClient: (clientId: string) => string;
    readonly orderStatus: (orderId: string) => string;
    readonly orderList: (filters: string) => string;
    readonly client: (clientId: string) => string;
    readonly clientList: () => string;
    readonly inventory: (itemId: string) => string;
    readonly inventoryLevels: () => string;
    readonly lowStock: () => string;
    readonly dashboardStats: (workspaceId: string) => string;
    readonly productionMetrics: (date: string) => string;
    readonly orderMetrics: (period: string) => string;
    readonly apiResponse: (endpoint: string, params: string) => string;
    readonly rateLimit: (identifier: string, endpoint: string) => string;
};
/**
 * User caching strategy
 */
export declare function cacheUser(userId: string, user: any): Promise<void>;
export declare function getCachedUser(userId: string): Promise<any>;
export declare function invalidateUser(userId: string, email?: string): Promise<void>;
/**
 * Order caching strategy
 */
export declare function cacheOrder(orderId: string, order: any): Promise<void>;
export declare function getCachedOrder(orderId: string): Promise<any>;
export declare function invalidateOrder(orderId: string, clientId?: string): Promise<void>;
/**
 * Client caching strategy
 */
export declare function cacheClient(clientId: string, client: any): Promise<void>;
export declare function getCachedClient(clientId: string): Promise<any>;
export declare function invalidateClient(clientId: string): Promise<void>;
/**
 * Inventory caching strategy
 */
export declare function cacheInventory(itemId: string, inventory: any): Promise<void>;
export declare function getCachedInventory(itemId: string): Promise<any>;
export declare function invalidateInventory(itemId?: string): Promise<void>;
/**
 * Dashboard caching strategy
 */
export declare function cacheDashboardStats(workspaceId: string, stats: any): Promise<void>;
export declare function getCachedDashboardStats(workspaceId: string): Promise<any>;
/**
 * API response caching
 */
export declare function cacheAPIResponse(endpoint: string, params: string, response: any, ttl: number): Promise<void>;
export declare function getCachedAPIResponse(endpoint: string, params: string): Promise<any>;
/**
 * Rate limiting with Redis
 */
export declare function checkRateLimit(identifier: string, endpoint: string, maxRequests: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
}>;
/**
 * Session management with Redis
 */
export declare function cacheSession(sessionId: string, sessionData: any): Promise<void>;
export declare function getCachedSession(sessionId: string): Promise<any>;
export declare function invalidateSession(sessionId: string): Promise<void>;
export declare function extendSession(sessionId: string, additionalSeconds: number): Promise<void>;
/**
 * Batch invalidation utilities
 */
export declare function invalidateAllUserData(userId: string): Promise<void>;
export declare function invalidateAllOrderData(clientId?: string): Promise<void>;
export declare function invalidateAllDashboards(): Promise<void>;
/**
 * Cache warming - Preload frequently accessed data
 */
export declare function warmCache(workspaceId: string): Promise<void>;
/**
 * Cache statistics
 */
export declare function getCacheStats(): Promise<{
    info: string;
    keyspace: string;
    totalKeys: number;
}>;
