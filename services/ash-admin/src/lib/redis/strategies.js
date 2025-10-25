"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = exports.CacheTTL = void 0;
exports.cacheUser = cacheUser;
exports.getCachedUser = getCachedUser;
exports.invalidateUser = invalidateUser;
exports.cacheOrder = cacheOrder;
exports.getCachedOrder = getCachedOrder;
exports.invalidateOrder = invalidateOrder;
exports.cacheClient = cacheClient;
exports.getCachedClient = getCachedClient;
exports.invalidateClient = invalidateClient;
exports.cacheInventory = cacheInventory;
exports.getCachedInventory = getCachedInventory;
exports.invalidateInventory = invalidateInventory;
exports.cacheDashboardStats = cacheDashboardStats;
exports.getCachedDashboardStats = getCachedDashboardStats;
exports.cacheAPIResponse = cacheAPIResponse;
exports.getCachedAPIResponse = getCachedAPIResponse;
exports.checkRateLimit = checkRateLimit;
exports.cacheSession = cacheSession;
exports.getCachedSession = getCachedSession;
exports.invalidateSession = invalidateSession;
exports.extendSession = extendSession;
exports.invalidateAllUserData = invalidateAllUserData;
exports.invalidateAllOrderData = invalidateAllOrderData;
exports.invalidateAllDashboards = invalidateAllDashboards;
exports.warmCache = warmCache;
exports.getCacheStats = getCacheStats;
const cache_1 = require("./cache");
/**
 * Caching Strategies and TTL Constants
 * Optimized cache durations for different data types
 */
exports.CacheTTL = {
    // Very short (1-5 minutes) - Frequently changing data
    REAL_TIME: 60, // 1 minute
    STOCK_LEVELS: 120, // 2 minutes
    PRODUCTION_STATUS: 300, // 5 minutes
    // Short (5-15 minutes) - Semi-dynamic data
    USER_SESSION: 900, // 15 minutes
    ORDER_STATUS: 600, // 10 minutes
    DASHBOARD_STATS: 300, // 5 minutes
    // Medium (15-60 minutes) - Moderate change frequency
    USER_PROFILE: 1800, // 30 minutes
    CLIENT_DATA: 3600, // 1 hour
    PRODUCT_DATA: 3600, // 1 hour
    // Long (1-24 hours) - Rarely changing data
    SYSTEM_CONFIG: 7200, // 2 hours
    STATIC_DATA: 86400, // 24 hours
    REPORTS: 43200, // 12 hours
};
/**
 * Cache key generators
 */
exports.CacheKeys = {
    // User caching
    user: (userId) => `user:${userId}`,
    userByEmail: (email) => `user:email:${email}`,
    userPermissions: (userId) => `user:${userId}:permissions`,
    userSession: (sessionId) => `session:${sessionId}`,
    // Order caching
    order: (orderId) => `order:${orderId}`,
    ordersByClient: (clientId) => `orders:client:${clientId}`,
    orderStatus: (orderId) => `order:${orderId}:status`,
    orderList: (filters) => `orders:list:${filters}`,
    // Client caching
    client: (clientId) => `client:${clientId}`,
    clientList: () => `clients:list`,
    // Inventory caching
    inventory: (itemId) => `inventory:${itemId}`,
    inventoryLevels: () => `inventory:levels`,
    lowStock: () => `inventory:low-stock`,
    // Dashboard & Analytics
    dashboardStats: (workspaceId) => `dashboard:${workspaceId}`,
    productionMetrics: (date) => `production:metrics:${date}`,
    orderMetrics: (period) => `orders:metrics:${period}`,
    // API Response caching
    apiResponse: (endpoint, params) => `api:${endpoint}:${params}`,
    // Rate limiting
    rateLimit: (identifier, endpoint) => `ratelimit:${identifier}:${endpoint}`,
};
/**
 * User caching strategy
 */
async function cacheUser(userId, user) {
    await cache_1.userCache.set(exports.CacheKeys.user(userId), user, exports.CacheTTL.USER_PROFILE);
    if (user.email) {
        await cache_1.userCache.set(exports.CacheKeys.userByEmail(user.email), user, exports.CacheTTL.USER_PROFILE);
    }
}
async function getCachedUser(userId) {
    return await cache_1.userCache.get(exports.CacheKeys.user(userId));
}
async function invalidateUser(userId, email) {
    await cache_1.userCache.delete(exports.CacheKeys.user(userId));
    await cache_1.userCache.delete(exports.CacheKeys.userPermissions(userId));
    if (email) {
        await cache_1.userCache.delete(exports.CacheKeys.userByEmail(email));
    }
}
/**
 * Order caching strategy
 */
async function cacheOrder(orderId, order) {
    await cache_1.orderCache.set(exports.CacheKeys.order(orderId), order, exports.CacheTTL.ORDER_STATUS);
    await cache_1.orderCache.set(exports.CacheKeys.orderStatus(orderId), order.status, exports.CacheTTL.ORDER_STATUS);
}
async function getCachedOrder(orderId) {
    return await cache_1.orderCache.get(exports.CacheKeys.order(orderId));
}
async function invalidateOrder(orderId, clientId) {
    await cache_1.orderCache.delete(exports.CacheKeys.order(orderId));
    await cache_1.orderCache.delete(exports.CacheKeys.orderStatus(orderId));
    if (clientId) {
        await cache_1.orderCache.delete(exports.CacheKeys.ordersByClient(clientId));
    }
    // Invalidate all order lists
    await cache_1.orderCache.invalidatePattern("orders:list:*");
}
/**
 * Client caching strategy
 */
async function cacheClient(clientId, client) {
    await cache_1.clientCache.set(exports.CacheKeys.client(clientId), client, exports.CacheTTL.CLIENT_DATA);
}
async function getCachedClient(clientId) {
    return await cache_1.clientCache.get(exports.CacheKeys.client(clientId));
}
async function invalidateClient(clientId) {
    await cache_1.clientCache.delete(exports.CacheKeys.client(clientId));
    await cache_1.clientCache.delete(exports.CacheKeys.clientList());
    await cache_1.orderCache.delete(exports.CacheKeys.ordersByClient(clientId));
}
/**
 * Inventory caching strategy
 */
async function cacheInventory(itemId, inventory) {
    await cache_1.inventoryCache.set(exports.CacheKeys.inventory(itemId), inventory, exports.CacheTTL.STOCK_LEVELS);
}
async function getCachedInventory(itemId) {
    return await cache_1.inventoryCache.get(exports.CacheKeys.inventory(itemId));
}
async function invalidateInventory(itemId) {
    if (itemId) {
        await cache_1.inventoryCache.delete(exports.CacheKeys.inventory(itemId));
    }
    await cache_1.inventoryCache.delete(exports.CacheKeys.inventoryLevels());
    await cache_1.inventoryCache.delete(exports.CacheKeys.lowStock());
}
/**
 * Dashboard caching strategy
 */
async function cacheDashboardStats(workspaceId, stats) {
    await cache_1.cache.set(exports.CacheKeys.dashboardStats(workspaceId), stats, exports.CacheTTL.DASHBOARD_STATS);
}
async function getCachedDashboardStats(workspaceId) {
    return await cache_1.cache.get(exports.CacheKeys.dashboardStats(workspaceId));
}
/**
 * API response caching
 */
async function cacheAPIResponse(endpoint, params, response, ttl) {
    await cache_1.cache.set(exports.CacheKeys.apiResponse(endpoint, params), response, ttl);
}
async function getCachedAPIResponse(endpoint, params) {
    return await cache_1.cache.get(exports.CacheKeys.apiResponse(endpoint, params));
}
/**
 * Rate limiting with Redis
 */
async function checkRateLimit(identifier, endpoint, maxRequests, windowSeconds) {
    const key = exports.CacheKeys.rateLimit(identifier, endpoint);
    try {
        const count = await cache_1.cache.increment(key);
        if (count === 1) {
            // First request, set expiry
            await cache_1.cache.expire(key, windowSeconds);
        }
        const ttl = await cache_1.cache.ttl(key);
        const resetAt = Date.now() + ttl * 1000;
        return {
            allowed: count <= maxRequests,
            remaining: Math.max(0, maxRequests - count),
            resetAt,
        };
    }
    catch (error) {
        console.error("Rate limit check error:", error);
        return {
            allowed: true,
            remaining: maxRequests,
            resetAt: Date.now() + windowSeconds * 1000,
        };
    }
}
/**
 * Session management with Redis
 */
async function cacheSession(sessionId, sessionData) {
    await cache_1.cache.set(exports.CacheKeys.userSession(sessionId), sessionData, exports.CacheTTL.USER_SESSION);
}
async function getCachedSession(sessionId) {
    return await cache_1.cache.get(exports.CacheKeys.userSession(sessionId));
}
async function invalidateSession(sessionId) {
    await cache_1.cache.delete(exports.CacheKeys.userSession(sessionId));
}
async function extendSession(sessionId, additionalSeconds) {
    const ttl = await cache_1.cache.ttl(exports.CacheKeys.userSession(sessionId));
    if (ttl > 0) {
        await cache_1.cache.expire(exports.CacheKeys.userSession(sessionId), ttl + additionalSeconds);
    }
}
/**
 * Batch invalidation utilities
 */
async function invalidateAllUserData(userId) {
    await cache_1.userCache.invalidatePattern(`user:${userId}:*`);
    await cache_1.userCache.delete(exports.CacheKeys.user(userId));
}
async function invalidateAllOrderData(clientId) {
    await cache_1.orderCache.invalidatePattern("orders:*");
    if (clientId) {
        await cache_1.orderCache.delete(exports.CacheKeys.ordersByClient(clientId));
    }
}
async function invalidateAllDashboards() {
    await cache_1.cache.invalidatePattern("dashboard:*");
    await cache_1.cache.invalidatePattern("production:metrics:*");
    await cache_1.cache.invalidatePattern("orders:metrics:*");
}
/**
 * Cache warming - Preload frequently accessed data
 */
async function warmCache(workspaceId) {
    // This can be called on app start or periodically
    console.log(`Warming cache for workspace ${workspaceId}...`);
    // Preload dashboard stats, active orders, etc.
    // Implementation depends on your specific needs
}
/**
 * Cache statistics
 */
async function getCacheStats() {
    const redis = (await Promise.resolve().then(() => __importStar(require("./client")))).getRedisClient();
    try {
        const info = await redis.info("stats");
        const keyspace = await redis.info("keyspace");
        return {
            info,
            keyspace,
            totalKeys: await redis.dbsize(),
        };
    }
    catch (error) {
        return null;
    }
}
