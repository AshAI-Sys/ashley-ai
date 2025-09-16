import { Request, Response, NextFunction } from 'express'
import { logger } from '@ash/shared'
import { PERFORMANCE_THRESHOLDS } from '../config/performance'

// Extended Request interface to include timing data
interface PerformanceRequest extends Request {
  startTime?: number
  queryCount?: number
  cacheHits?: number
  cacheMisses?: number
}

// Performance monitoring middleware
export const performanceMonitor = (req: PerformanceRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now()
  req.queryCount = 0
  req.cacheHits = 0
  req.cacheMisses = 0

  // Override res.json to capture response time
  const originalJson = res.json
  res.json = function (body: any) {
    const duration = Date.now() - req.startTime!
    const endpoint = `${req.method} ${req.route?.path || req.path}`

    // Log performance metrics
    const metrics = {
      endpoint,
      duration,
      statusCode: res.statusCode,
      queryCount: req.queryCount,
      cacheHits: req.cacheHits,
      cacheMisses: req.cacheMisses,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: (req as any).user?.id,
      workspaceId: (req as any).user?.workspace_id
    }

    // Log slow requests
    if (duration > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) {
      logger.warn('Slow API response detected', metrics)
    } else {
      logger.info('API response time', metrics)
    }

    // Add performance headers to response
    res.setHeader('X-Response-Time', `${duration}ms`)
    res.setHeader('X-Query-Count', req.queryCount.toString())
    res.setHeader('X-Cache-Hits', req.cacheHits.toString())
    
    return originalJson.call(this, body)
  }

  next()
}

// Database query counter (to be used with Prisma middleware)
export const queryCounter = (req: PerformanceRequest) => {
  return (params: any, next: any) => {
    req.queryCount = (req.queryCount || 0) + 1
    
    const start = Date.now()
    return next(params).then((result: any) => {
      const duration = Date.now() - start
      
      if (duration > PERFORMANCE_THRESHOLDS.DATABASE_QUERY_TIME) {
        logger.warn('Slow database query', {
          model: params.model,
          action: params.action,
          duration: `${duration}ms`,
          args: params.args
        })
      }
      
      return result
    })
  }
}

// Cache hit/miss tracking
export const trackCacheHit = (req: PerformanceRequest) => {
  req.cacheHits = (req.cacheHits || 0) + 1
}

export const trackCacheMiss = (req: PerformanceRequest) => {
  req.cacheMisses = (req.cacheMisses || 0) + 1
}

// Memory usage monitoring
export const memoryMonitor = () => {
  const usage = process.memoryUsage()
  const memoryInfo = {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    heapUsedPercentage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
  }

  if (memoryInfo.heapUsedPercentage > PERFORMANCE_THRESHOLDS.MEMORY_USAGE) {
    logger.warn('High memory usage detected', memoryInfo)
  }

  return memoryInfo
}

// CPU usage monitoring (simplified)
export const cpuMonitor = () => {
  const usage = process.cpuUsage()
  return {
    user: usage.user,
    system: usage.system,
    timestamp: Date.now()
  }
}

// Performance metrics collector
export class PerformanceMetrics {
  private static instance: PerformanceMetrics
  private metrics: Map<string, any[]> = new Map()
  private readonly MAX_METRICS = 1000

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics()
    }
    return PerformanceMetrics.instance
  }

  addMetric(endpoint: string, data: any) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, [])
    }

    const endpointMetrics = this.metrics.get(endpoint)!
    endpointMetrics.push({ ...data, timestamp: Date.now() })

    // Keep only recent metrics
    if (endpointMetrics.length > this.MAX_METRICS) {
      endpointMetrics.splice(0, endpointMetrics.length - this.MAX_METRICS)
    }
  }

  getMetrics(endpoint?: string) {
    if (endpoint) {
      return this.metrics.get(endpoint) || []
    }
    return Object.fromEntries(this.metrics)
  }

  getAverageResponseTime(endpoint: string, minutes: number = 60): number {
    const cutoff = Date.now() - (minutes * 60 * 1000)
    const endpointMetrics = this.metrics.get(endpoint) || []
    
    const recentMetrics = endpointMetrics.filter(m => m.timestamp > cutoff)
    if (recentMetrics.length === 0) return 0

    const totalTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0)
    return Math.round(totalTime / recentMetrics.length)
  }

  clearMetrics() {
    this.metrics.clear()
  }
}

// Health check endpoint data
export const getHealthMetrics = () => {
  const memoryInfo = memoryMonitor()
  const now = Date.now()
  
  return {
    status: 'healthy',
    timestamp: now,
    uptime: process.uptime(),
    memory: memoryInfo,
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  }
}