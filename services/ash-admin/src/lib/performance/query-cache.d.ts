/**
 * Query Cache Middleware
 * High-performance caching for database queries
 */
export declare const orderCache: any;
export declare const clientCache: any;
/**
 * Cache durations (in seconds)
 */
export declare const CACHE_DURATION: {
    USERS: number;
    CLIENTS: number;
    EMPLOYEES: number;
    SETTINGS: number;
    ORDERS: number;
    INVENTORY: number;
    PRODUCTION: number;
    STATS: number;
    DASHBOARD: number;
    NOTIFICATIONS: number;
    REALTIME: number;
};
/**
 * Cached query wrapper with automatic invalidation
 */
export declare function cachedQuery<T>(cacheKey: string, queryFn: () => Promise<T>, ttl?: number): Promise<T>;
/**
 * Cache key generators
 */
export declare const CacheKeys: {
    ordersList: (page: number, limit: number, filters?: any) => string;
    orderDetail: (orderId: string) => string;
    orderStats: (workspaceId: string) => string;
    clientsList: (page: number, limit: number) => string;
    clientDetail: (clientId: string) => string;
    hrStats: (workspaceId: string) => string;
    employeesList: (page: number, limit: number, filters?: any) => string;
    employeeDetail: (employeeId: string) => string;
    attendanceToday: (workspaceId: string, date: string) => string;
    financeStats: (workspaceId: string) => string;
    invoicesList: (page: number, limit: number) => string;
    productionStats: (workspaceId: string) => string;
    cuttingRuns: (page: number, limit: number) => string;
    sewingRuns: (page: number, limit: number) => string;
    printingRuns: (page: number, limit: number) => string;
    qcStats: (workspaceId: string) => string;
    inspections: (page: number, limit: number) => string;
    maintenanceStats: (workspaceId: string) => string;
    workOrders: (page: number, limit: number) => string;
    dashboardStats: (workspaceId: string) => string;
};
/**
 * Cache invalidation helpers
 */
export declare const InvalidateCache: {
    orders: () => Promise<void>;
    orderById: (orderId: string) => Promise<void>;
    clients: () => Promise<void>;
    employees: () => Promise<void>;
    finance: () => Promise<void>;
    production: () => Promise<void>;
    dashboard: () => Promise<void>;
    all: () => Promise<void>;
};
export declare function recordQueryMetric(key: string, duration: number, cacheHit: boolean): void;
export declare function getQueryMetrics(): {
    totalQueries: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    avgDuration: number;
    avgCachedDuration: number;
    avgUncachedDuration: number;
    speedup: number;
};
/**
 * Enhanced cached query with metrics
 */
export declare function cachedQueryWithMetrics<T>(cacheKey: string, queryFn: () => Promise<T>, ttl?: number): Promise<T>;
