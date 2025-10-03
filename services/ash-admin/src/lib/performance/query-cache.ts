/**
 * Query Cache Middleware
 * High-performance caching for database queries
 */

import { cache as userCache, orderCache, clientCache } from '@/lib/redis'

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATION = {
  // Static/rarely changing data
  USERS: 1800,          // 30 minutes
  CLIENTS: 1800,        // 30 minutes
  EMPLOYEES: 1800,      // 30 minutes
  SETTINGS: 3600,       // 1 hour

  // Moderate update frequency
  ORDERS: 300,          // 5 minutes
  INVENTORY: 300,       // 5 minutes
  PRODUCTION: 180,      // 3 minutes

  // Frequently updated
  STATS: 60,            // 1 minute
  DASHBOARD: 120,       // 2 minutes
  NOTIFICATIONS: 30,    // 30 seconds

  // Real-time (minimal cache)
  REALTIME: 10,         // 10 seconds
}

/**
 * Cached query wrapper with automatic invalidation
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = await userCache.get(cacheKey)
    if (cached !== null) {
      return JSON.parse(cached) as T
    }

    // Cache miss - execute query
    const result = await queryFn()

    // Store in cache
    await userCache.set(cacheKey, JSON.stringify(result), ttl)

    return result
  } catch (error) {
    console.error(`Cache error for key ${cacheKey}:`, error)
    // Fallback to direct query on cache error
    return await queryFn()
  }
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  // Orders
  ordersList: (page: number, limit: number, filters?: any) =>
    `orders:list:${page}:${limit}:${JSON.stringify(filters || {})}`,
  orderDetail: (orderId: string) => `orders:detail:${orderId}`,
  orderStats: (workspaceId: string) => `orders:stats:${workspaceId}`,

  // Clients
  clientsList: (page: number, limit: number) => `clients:list:${page}:${limit}`,
  clientDetail: (clientId: string) => `clients:detail:${clientId}`,

  // HR
  hrStats: (workspaceId: string) => `hr:stats:${workspaceId}`,
  employeesList: (page: number, limit: number, filters?: any) =>
    `employees:list:${page}:${limit}:${JSON.stringify(filters || {})}`,
  employeeDetail: (employeeId: string) => `employees:detail:${employeeId}`,
  attendanceToday: (workspaceId: string, date: string) => `attendance:${workspaceId}:${date}`,

  // Finance
  financeStats: (workspaceId: string) => `finance:stats:${workspaceId}`,
  invoicesList: (page: number, limit: number) => `invoices:list:${page}:${limit}`,

  // Production
  productionStats: (workspaceId: string) => `production:stats:${workspaceId}`,
  cuttingRuns: (page: number, limit: number) => `cutting:runs:${page}:${limit}`,
  sewingRuns: (page: number, limit: number) => `sewing:runs:${page}:${limit}`,
  printingRuns: (page: number, limit: number) => `printing:runs:${page}:${limit}`,

  // QC
  qcStats: (workspaceId: string) => `qc:stats:${workspaceId}`,
  inspections: (page: number, limit: number) => `qc:inspections:${page}:${limit}`,

  // Maintenance
  maintenanceStats: (workspaceId: string) => `maintenance:stats:${workspaceId}`,
  workOrders: (page: number, limit: number) => `maintenance:workorders:${page}:${limit}`,

  // Dashboard
  dashboardStats: (workspaceId: string) => `dashboard:stats:${workspaceId}`,
}

/**
 * Cache invalidation helpers
 */
export const InvalidateCache = {
  orders: async () => {
    await userCache.deletePattern('orders:*')
  },

  orderById: async (orderId: string) => {
    await userCache.del(CacheKeys.orderDetail(orderId))
    await userCache.deletePattern('orders:list:*')
    await userCache.deletePattern('orders:stats:*')
  },

  clients: async () => {
    await userCache.deletePattern('clients:*')
  },

  employees: async () => {
    await userCache.deletePattern('employees:*')
    await userCache.deletePattern('hr:*')
  },

  finance: async () => {
    await userCache.deletePattern('finance:*')
    await userCache.deletePattern('invoices:*')
  },

  production: async () => {
    await userCache.deletePattern('production:*')
    await userCache.deletePattern('cutting:*')
    await userCache.deletePattern('sewing:*')
    await userCache.deletePattern('printing:*')
  },

  dashboard: async () => {
    await userCache.deletePattern('dashboard:*')
  },

  all: async () => {
    await userCache.flushall()
  }
}

/**
 * Query performance monitoring
 */
interface QueryMetric {
  key: string
  duration: number
  cacheHit: boolean
  timestamp: Date
}

const queryMetrics: QueryMetric[] = []
const MAX_METRICS = 1000

export function recordQueryMetric(key: string, duration: number, cacheHit: boolean) {
  queryMetrics.push({
    key,
    duration,
    cacheHit,
    timestamp: new Date()
  })

  // Keep only last 1000 metrics
  if (queryMetrics.length > MAX_METRICS) {
    queryMetrics.shift()
  }
}

export function getQueryMetrics() {
  const totalQueries = queryMetrics.length
  const cacheHits = queryMetrics.filter(m => m.cacheHit).length
  const cacheMisses = totalQueries - cacheHits
  const avgDuration = queryMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries || 0
  const avgCachedDuration = queryMetrics.filter(m => m.cacheHit).reduce((sum, m) => sum + m.duration, 0) / cacheHits || 0
  const avgUncachedDuration = queryMetrics.filter(m => !m.cacheHit).reduce((sum, m) => sum + m.duration, 0) / cacheMisses || 0

  return {
    totalQueries,
    cacheHits,
    cacheMisses,
    cacheHitRate: totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0,
    avgDuration,
    avgCachedDuration,
    avgUncachedDuration,
    speedup: avgUncachedDuration > 0 ? avgUncachedDuration / avgCachedDuration : 1
  }
}

/**
 * Enhanced cached query with metrics
 */
export async function cachedQueryWithMetrics<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const startTime = Date.now()
  let cacheHit = false

  try {
    // Try to get from cache first
    const cached = await userCache.get(cacheKey)
    if (cached !== null) {
      cacheHit = true
      const duration = Date.now() - startTime
      recordQueryMetric(cacheKey, duration, true)
      return JSON.parse(cached) as T
    }

    // Cache miss - execute query
    const result = await queryFn()
    const duration = Date.now() - startTime
    recordQueryMetric(cacheKey, duration, false)

    // Store in cache (don't wait)
    userCache.set(cacheKey, JSON.stringify(result), ttl).catch(err =>
      console.error('Cache set error:', err)
    )

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    recordQueryMetric(cacheKey, duration, cacheHit)
    console.error(`Query error for key ${cacheKey}:`, error)
    throw error
  }
}
