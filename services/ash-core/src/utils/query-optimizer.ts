import { prisma } from '@ash/database'
import { logger } from '@ash/shared'
import { PERFORMANCE_CONFIG } from '../config/performance'

// Query performance monitoring
export const withQueryTiming = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now()
  
  try {
    const result = await queryFn()
    const duration = Date.now() - startTime
    
    if (duration > PERFORMANCE_CONFIG.DATABASE.SLOW_QUERY_THRESHOLD) {
      logger.warn('Slow query detected', {
        query: queryName,
        duration: `${duration}ms`,
        threshold: `${PERFORMANCE_CONFIG.DATABASE.SLOW_QUERY_THRESHOLD}ms`
      })
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Query failed', {
      query: queryName,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

// Optimized pagination utility
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const paginateQuery = async <T>(
  queryFn: (skip: number, take: number, orderBy?: any) => Promise<T[]>,
  countFn: () => Promise<number>,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> => {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(
    Math.max(1, options.limit || PERFORMANCE_CONFIG.API.DEFAULT_PAGE_SIZE),
    PERFORMANCE_CONFIG.API.MAX_PAGE_SIZE
  )
  
  const skip = (page - 1) * limit
  
  const orderBy = options.sortBy ? {
    [options.sortBy]: options.sortOrder || 'asc'
  } : undefined

  // Execute count and data queries in parallel
  const [data, total] = await Promise.all([
    queryFn(skip, limit, orderBy),
    countFn()
  ])

  const pages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  }
}

// Batch operations utility
export const batchOperation = async <T, R>(
  items: T[],
  operation: (batch: T[]) => Promise<R[]>,
  batchSize: number = PERFORMANCE_CONFIG.DATABASE.BATCH_SIZE
): Promise<R[]> => {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await operation(batch)
    results.push(...batchResults)
  }
  
  return results
}

// Efficient bulk insert utility
export const bulkInsert = async <T extends Record<string, any>>(
  model: any,
  data: T[],
  batchSize: number = PERFORMANCE_CONFIG.DATABASE.BATCH_SIZE
): Promise<void> => {
  if (data.length === 0) return

  await batchOperation(
    data,
    async (batch) => {
      await model.createMany({
        data: batch,
        skipDuplicates: true
      })
      return batch
    },
    batchSize
  )
}

// Optimized queries for common dashboard operations
export const DashboardQueries = {
  // Get order statistics with minimal data
  async getOrderStats(workspaceId: string) {
    return withQueryTiming('dashboard-order-stats', async () => {
      return prisma.order.groupBy({
        by: ['status'],
        where: { 
          workspace_id: workspaceId,
          deleted_at: null 
        },
        _count: { id: true },
        _sum: { total_amount: true }
      })
    })
  },

  // Get production metrics efficiently
  async getProductionMetrics(workspaceId: string) {
    return withQueryTiming('dashboard-production-metrics', async () => {
      return prisma.routingStep.groupBy({
        by: ['department', 'status'],
        where: { workspace_id: workspaceId },
        _count: { id: true },
        _avg: { 
          actual_hours: true,
          efficiency_score: true 
        }
      })
    })
  },

  // Get upcoming deadlines with minimal includes
  async getUpcomingDeadlines(workspaceId: string, days: number = 7) {
    return withQueryTiming('dashboard-upcoming-deadlines', async () => {
      const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      
      return prisma.order.findMany({
        where: {
          workspace_id: workspaceId,
          status: { in: ['confirmed', 'in_progress'] },
          delivery_date: {
            gte: new Date(),
            lte: endDate
          },
          deleted_at: null
        },
        select: {
          id: true,
          order_number: true,
          delivery_date: true,
          total_amount: true,
          client: {
            select: { name: true }
          },
          brand: {
            select: { name: true }
          }
        },
        orderBy: { delivery_date: 'asc' },
        take: 20 // Limit to top 20 urgent orders
      })
    })
  }
}

// Connection pool monitoring
export const getConnectionPoolStats = () => {
  // This would depend on your database setup
  // For now, return basic info
  return {
    active: (prisma as any)._engine?.connectionPool?.activeConnections || 0,
    idle: (prisma as any)._engine?.connectionPool?.idleConnections || 0,
    total: PERFORMANCE_CONFIG.DATABASE.CONNECTION_POOL_SIZE
  }
}

// Query plan analysis (for development)
export const analyzeQuery = async (query: string, params?: any[]) => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  try {
    // This would require raw SQL execution
    // Implementation depends on your database
    logger.info('Query analysis requested', { query, params })
    return { analyzed: true }
  } catch (error) {
    logger.error('Query analysis failed:', error)
    return null
  }
}