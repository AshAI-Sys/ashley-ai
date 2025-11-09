import {
  cache,
  userCache,
  orderCache,
  clientCache,
  inventoryCache,
} from "./cache";

/**
 * Caching Strategies and TTL Constants
 * Optimized cache durations for different data types
 */

export const CacheTTL = {
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
} as const;

/**
 * Cache key generators
 */
export const CacheKeys = {
  // User caching
  user: (userId: string) => `user:${userId}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userPermissions: (userId: string) => `user:${userId}:permissions`,
  userSession: (sessionId: string) => `session:${sessionId}`,

  // Order caching
  order: (orderId: string) => `order:${orderId}`,
  ordersByClient: (clientId: string) => `orders:client:${clientId}`,
  orderStatus: (orderId: string) => `order:${orderId}:status`,
  orderList: (filters: string) => `orders:list:${filters}`,

  // Client caching
  client: (clientId: string) => `client:${clientId}`,
  clientList: () => `clients:list`,

  // Inventory caching
  inventory: (itemId: string) => `inventory:${itemId}`,
  inventoryLevels: () => `inventory:levels`,
  lowStock: () => `inventory:low-stock`,

  // Dashboard & Analytics
  dashboardStats: (workspaceId: string) => `dashboard:${workspaceId}`,
  productionMetrics: (date: string) => `production:metrics:${date}`,
  orderMetrics: (period: string) => `orders:metrics:${period}`,

  // API Response caching
  apiResponse: (endpoint: string, params: string) =>
    `api:${endpoint}:${params}`,

  // Rate limiting
  rateLimit: (identifier: string, endpoint: string) =>
    `ratelimit:${identifier}:${endpoint}`,
} as const;

/**
 * User caching strategy
 */
export async function cacheUser(userId: string, user: any) {
  await userCache.set(CacheKeys.user(userId), user, CacheTTL.USER_PROFILE);
  if (user.email) {
    await userCache.set(
      CacheKeys.userByEmail(user.email),
      user,
      CacheTTL.USER_PROFILE
    );
  }
}

export async function getCachedUser(userId: string) {
  return await userCache.get(CacheKeys.user(userId));
}

export async function invalidateUser(userId: string, email?: string) {
  await userCache.delete(CacheKeys.user(userId));
  await userCache.delete(CacheKeys.userPermissions(userId));
  if (email) {
    await userCache.delete(CacheKeys.userByEmail(email));
  }
}

/**
 * Order caching strategy
 */
export async function cacheOrder(orderId: string, order: any) {
  await orderCache.set(CacheKeys.order(orderId), order, CacheTTL.ORDER_STATUS);
  await orderCache.set(
    CacheKeys.orderStatus(orderId),
    order.status,
    CacheTTL.ORDER_STATUS
  );
}

export async function getCachedOrder(orderId: string) {
  return await orderCache.get(CacheKeys.order(orderId));
}

export async function invalidateOrder(orderId: string, clientId?: string) {
  await orderCache.delete(CacheKeys.order(orderId));
  await orderCache.delete(CacheKeys.orderStatus(orderId));
  if (clientId) {
    await orderCache.delete(CacheKeys.ordersByClient(clientId));
  }
  // Invalidate all order lists
  await orderCache.invalidatePattern("orders:list:*");
}

/**
 * Client caching strategy
 */
export async function cacheClient(clientId: string, client: any) {
  await clientCache.set(
    CacheKeys.client(clientId),
    client,
    CacheTTL.CLIENT_DATA
  );
}

export async function getCachedClient(clientId: string) {
  return await clientCache.get(CacheKeys.client(clientId));
}

export async function invalidateClient(clientId: string) {
  await clientCache.delete(CacheKeys.client(clientId));
  await clientCache.delete(CacheKeys.clientList());
  await orderCache.delete(CacheKeys.ordersByClient(clientId));
}

/**
 * Inventory caching strategy
 */
export async function cacheInventory(itemId: string, inventory: any) {
  await inventoryCache.set(
    CacheKeys.inventory(itemId),
    inventory,
    CacheTTL.STOCK_LEVELS
  );
}

export async function getCachedInventory(itemId: string) {
  return await inventoryCache.get(CacheKeys.inventory(itemId));
}

export async function invalidateInventory(itemId?: string) {
  if (itemId) {
    await inventoryCache.delete(CacheKeys.inventory(itemId));
  }
  await inventoryCache.delete(CacheKeys.inventoryLevels());
  await inventoryCache.delete(CacheKeys.lowStock());
}

/**
 * Dashboard caching strategy
 */
export async function cacheDashboardStats(workspaceId: string, stats: any) {
  await cache.set(
    CacheKeys.dashboardStats(workspaceId),
    stats,
    CacheTTL.DASHBOARD_STATS
  );
}

export async function getCachedDashboardStats(workspaceId: string) {
  return await cache.get(CacheKeys.dashboardStats(workspaceId));
}

/**
 * API response caching
 */
export async function cacheAPIResponse(
  endpoint: string,
  params: string,
  response: any,
  ttl: number
) {
  await cache.set(CacheKeys.apiResponse(endpoint, params), response, ttl);
}

export async function getCachedAPIResponse(endpoint: string, params: string) {
  return await cache.get(CacheKeys.apiResponse(endpoint, params));
}

/**
 * Rate limiting with Redis
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = CacheKeys.rateLimit(identifier, endpoint);

  try {
    const count = await cache.increment(key);

    if (count === 1) {
      // First request, set expiry
      await cache.expire(key, windowSeconds);
    }

    const ttl = await cache.ttl(key);
    const resetAt = Date.now() + ttl * 1000;

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt,
    };
  } catch (error) {
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
export async function cacheSession(sessionId: string, sessionData: any) {
  await cache.set(
    CacheKeys.userSession(sessionId),
    sessionData,
    CacheTTL.USER_SESSION
  );
}

export async function getCachedSession(sessionId: string) {
  return await cache.get(CacheKeys.userSession(sessionId));
}

export async function invalidateSession(sessionId: string) {
  await cache.delete(CacheKeys.userSession(sessionId));
}

export async function extendSession(
  sessionId: string,
  additionalSeconds: number
) {
  const ttl = await cache.ttl(CacheKeys.userSession(sessionId));
  if (ttl > 0) {
    await cache.expire(
      CacheKeys.userSession(sessionId),
      ttl + additionalSeconds
    );
  }
}

/**
 * Batch invalidation utilities
 */
export async function invalidateAllUserData(userId: string) {
  await userCache.invalidatePattern(`user:${userId}:*`);
  await userCache.delete(CacheKeys.user(userId));
}

export async function invalidateAllOrderData(clientId?: string) {
  await orderCache.invalidatePattern("orders:*");
  if (clientId) {
    await orderCache.delete(CacheKeys.ordersByClient(clientId));
  }
}

export async function invalidateAllDashboards() {
  await cache.invalidatePattern("dashboard:*");
  await cache.invalidatePattern("production:metrics:*");
  await cache.invalidatePattern("orders:metrics:*");
}

/**
 * Cache warming - Preload frequently accessed data
 */
export async function warmCache(workspaceId: string) {
  // This can be called on app start or periodically
  console.log(`Warming cache for workspace ${workspaceId}...`);

  // Preload dashboard stats, active orders, etc.
  // Implementation depends on your specific needs
}

/**
 * Cache statistics
 */
export async function getCacheStats() {
  const redis = (await import("../redis")).getRedisClient();

  if (!redis) return null;

  try {
    const info = await redis.info("stats");
    const keyspace = await redis.info("keyspace");

    return {
      info,
      keyspace,
      totalKeys: await redis.dbsize(),
    };
  } catch (error) {
    return null;
  }
}
