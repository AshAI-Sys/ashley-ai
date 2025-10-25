"use strict";
/**
 * Query Cache Middleware
 * High-performance caching for database queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidateCache = exports.CacheKeys = exports.CACHE_DURATION = exports.clientCache = exports.orderCache = void 0;
exports.cachedQuery = cachedQuery;
exports.recordQueryMetric = recordQueryMetric;
exports.getQueryMetrics = getQueryMetrics;
exports.cachedQueryWithMetrics = cachedQueryWithMetrics;
const redis_1 = require("@/lib/redis");
// For backward compatibility, use the same client for all caches
exports.orderCache = redis_1.redisClient;
exports.clientCache = redis_1.redisClient;
/**
 * Cache durations (in seconds)
 */
exports.CACHE_DURATION = {
    // Static/rarely changing data
    USERS: 1800, // 30 minutes
    CLIENTS: 1800, // 30 minutes
    EMPLOYEES: 1800, // 30 minutes
    SETTINGS: 3600, // 1 hour
    // Moderate update frequency
    ORDERS: 300, // 5 minutes
    INVENTORY: 300, // 5 minutes
    PRODUCTION: 180, // 3 minutes
    // Frequently updated
    STATS: 60, // 1 minute
    DASHBOARD: 120, // 2 minutes
    NOTIFICATIONS: 30, // 30 seconds
    // Real-time (minimal cache)
    REALTIME: 10, // 10 seconds
};
/**
 * Cached query wrapper with automatic invalidation
 */
async function cachedQuery(cacheKey, queryFn, ttl = 300) {
    try {
        // Try to get from cache first
        const cached = await redis_1.redisClient.get(cacheKey);
        if (cached !== null) {
            return JSON.parse(cached);
        }
        // Cache miss - execute query
        const result = await queryFn();
        // Store in cache
        await redis_1.redisClient.set(cacheKey, JSON.stringify(result), ttl);
        return result;
    }
    catch (error) {
        console.error(`Cache error for key ${cacheKey}:`, error);
        // Fallback to direct query on cache error
        return await queryFn();
    }
}
/**
 * Cache key generators
 */
exports.CacheKeys = {
    // Orders
    ordersList: (page, limit, filters) => `orders:list:${page}:${limit}:${JSON.stringify(filters || {})}`,
    orderDetail: (orderId) => `orders:detail:${orderId}`,
    orderStats: (workspaceId) => `orders:stats:${workspaceId}`,
    // Clients
    clientsList: (page, limit) => `clients:list:${page}:${limit}`,
    clientDetail: (clientId) => `clients:detail:${clientId}`,
    // HR
    hrStats: (workspaceId) => `hr:stats:${workspaceId}`,
    employeesList: (page, limit, filters) => `employees:list:${page}:${limit}:${JSON.stringify(filters || {})}`,
    employeeDetail: (employeeId) => `employees:detail:${employeeId}`,
    attendanceToday: (workspaceId, date) => `attendance:${workspaceId}:${date}`,
    // Finance
    financeStats: (workspaceId) => `finance:stats:${workspaceId}`,
    invoicesList: (page, limit) => `invoices:list:${page}:${limit}`,
    // Production
    productionStats: (workspaceId) => `production:stats:${workspaceId}`,
    cuttingRuns: (page, limit) => `cutting:runs:${page}:${limit}`,
    sewingRuns: (page, limit) => `sewing:runs:${page}:${limit}`,
    printingRuns: (page, limit) => `printing:runs:${page}:${limit}`,
    // QC
    qcStats: (workspaceId) => `qc:stats:${workspaceId}`,
    inspections: (page, limit) => `qc:inspections:${page}:${limit}`,
    // Maintenance
    maintenanceStats: (workspaceId) => `maintenance:stats:${workspaceId}`,
    workOrders: (page, limit) => `maintenance:workorders:${page}:${limit}`,
    // Dashboard
    dashboardStats: (workspaceId) => `dashboard:stats:${workspaceId}`,
};
/**
 * Cache invalidation helpers
 */
exports.InvalidateCache = {
    orders: async () => {
        await redis_1.redisClient.deletePattern("orders:*");
    },
    orderById: async (orderId) => {
        await redis_1.redisClient.del(exports.CacheKeys.orderDetail(orderId));
        await redis_1.redisClient.deletePattern("orders:list:*");
        await redis_1.redisClient.deletePattern("orders:stats:*");
    },
    clients: async () => {
        await redis_1.redisClient.deletePattern("clients:*");
    },
    employees: async () => {
        await redis_1.redisClient.deletePattern("employees:*");
        await redis_1.redisClient.deletePattern("hr:*");
    },
    finance: async () => {
        await redis_1.redisClient.deletePattern("finance:*");
        await redis_1.redisClient.deletePattern("invoices:*");
    },
    production: async () => {
        await redis_1.redisClient.deletePattern("production:*");
        await redis_1.redisClient.deletePattern("cutting:*");
        await redis_1.redisClient.deletePattern("sewing:*");
        await redis_1.redisClient.deletePattern("printing:*");
    },
    dashboard: async () => {
        await redis_1.redisClient.deletePattern("dashboard:*");
    },
    all: async () => {
        await redis_1.redisClient.flushall();
    },
};
const queryMetrics = [];
const MAX_METRICS = 1000;
function recordQueryMetric(key, duration, cacheHit) {
    queryMetrics.push({
        key,
        duration,
        cacheHit,
        timestamp: new Date(),
    });
    // Keep only last 1000 metrics
    if (queryMetrics.length > MAX_METRICS) {
        queryMetrics.shift();
    }
}
function getQueryMetrics() {
    const totalQueries = queryMetrics.length;
    const cacheHits = queryMetrics.filter(m => m.cacheHit).length;
    const cacheMisses = totalQueries - cacheHits;
    const avgDuration = queryMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries || 0;
    const avgCachedDuration = queryMetrics
        .filter(m => m.cacheHit)
        .reduce((sum, m) => sum + m.duration, 0) / cacheHits || 0;
    const avgUncachedDuration = queryMetrics
        .filter(m => !m.cacheHit)
        .reduce((sum, m) => sum + m.duration, 0) / cacheMisses || 0;
    return {
        totalQueries,
        cacheHits,
        cacheMisses,
        cacheHitRate: totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0,
        avgDuration,
        avgCachedDuration,
        avgUncachedDuration,
        speedup: avgUncachedDuration > 0 ? avgUncachedDuration / avgCachedDuration : 1,
    };
}
/**
 * Enhanced cached query with metrics
 */
async function cachedQueryWithMetrics(cacheKey, queryFn, ttl = 300) {
    const startTime = Date.now();
    let cacheHit = false;
    try {
        // Try to get from cache first
        const cached = await redis_1.redisClient.get(cacheKey);
        if (cached !== null) {
            cacheHit = true;
            const duration = Date.now() - startTime;
            recordQueryMetric(cacheKey, duration, true);
            return JSON.parse(cached);
        }
        // Cache miss - execute query
        const result = await queryFn();
        const duration = Date.now() - startTime;
        recordQueryMetric(cacheKey, duration, false);
        // Store in cache (don't wait)
        redis_1.redisClient
            .set(cacheKey, JSON.stringify(result), ttl)
            .catch(err => console.error("Cache set error:", err));
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        recordQueryMetric(cacheKey, duration, cacheHit);
        console.error(`Query error for key ${cacheKey}:`, error);
        throw error;
    }
}
