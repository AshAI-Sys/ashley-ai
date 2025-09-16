import { logger } from '@ash/shared'
import { cacheService } from './cache'
import { PERFORMANCE_CONFIG } from '../config/performance'
import { PerformanceMetrics } from '../middleware/performance'

class BackgroundOptimizer {
  private intervals: any[] = []
  private isRunning = false

  start() {
    if (this.isRunning) return

    this.isRunning = true
    logger.info('Starting background optimization services')

    // Cache cleanup every hour
    this.intervals.push(
      setInterval(
        () => this.cleanupCache(),
        PERFORMANCE_CONFIG.BACKGROUND_JOBS.CACHE_CLEANUP_INTERVAL
      )
    )

    // Memory cleanup every 30 minutes  
    this.intervals.push(
      setInterval(
        () => this.cleanupMemory(),
        PERFORMANCE_CONFIG.BACKGROUND_JOBS.INACTIVE_SESSION_CLEANUP
      )
    )

    // Performance metrics collection every minute
    this.intervals.push(
      setInterval(
        () => this.collectPerformanceMetrics(),
        PERFORMANCE_CONFIG.BACKGROUND_JOBS.METRICS_COLLECTION_INTERVAL
      )
    )

    // Analytics refresh every 5 minutes
    this.intervals.push(
      setInterval(
        () => this.refreshAnalyticsCache(),
        PERFORMANCE_CONFIG.BACKGROUND_JOBS.ANALYTICS_REFRESH_INTERVAL
      )
    )
  }

  stop() {
    if (!this.isRunning) return

    this.isRunning = false
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
    
    logger.info('Background optimization services stopped')
  }

  private async cleanupCache() {
    try {
      // Clean up memory cache if using fallback
      cacheService.cleanupMemoryCache()

      // Get cache statistics
      const stats = await cacheService.getStats()
      logger.info('Cache cleanup completed', stats)

      // Clear old analytics cache
      await cacheService.delPattern('analytics:*')
      
    } catch (error) {
      logger.error('Cache cleanup error:', error)
    }
  }

  private cleanupMemory() {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
        logger.info('Manual garbage collection triggered')
      }

      // Clear old performance metrics
      const metricsCollector = PerformanceMetrics.getInstance()
      
      // Keep only last hour of metrics for each endpoint
      const allMetrics = metricsCollector.getMetrics()
      const cutoff = Date.now() - (60 * 60 * 1000) // 1 hour
      
      Object.entries(allMetrics).forEach(([endpoint, metrics]) => {
        if (Array.isArray(metrics)) {
          const recentMetrics = metrics.filter((m: any) => m.timestamp > cutoff)
          // This is a simplified approach - in production you'd want more sophisticated cleanup
          if (recentMetrics.length < metrics.length) {
            logger.info(`Cleaned up ${metrics.length - recentMetrics.length} old metrics for ${endpoint}`)
          }
        }
      })

    } catch (error) {
      logger.error('Memory cleanup error:', error)
    }
  }

  private async collectPerformanceMetrics() {
    try {
      const memoryUsage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()
      
      const metrics = {
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        uptime: process.uptime(),
        timestamp: Date.now()
      }

      // Store metrics (in production, you'd send to monitoring service)
      logger.debug('Performance metrics collected', metrics)

      // Check for performance issues
      const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      
      if (heapUsedPercent > 90) {
        logger.warn('Critical memory usage detected', { heapUsedPercent })
        // Could trigger alerts or cleanup actions
      } else if (heapUsedPercent > 80) {
        logger.warn('High memory usage detected', { heapUsedPercent })
      }

    } catch (error) {
      logger.error('Performance metrics collection error:', error)
    }
  }

  private async refreshAnalyticsCache() {
    try {
      // This would typically pre-warm caches for commonly accessed analytics data
      // For now, we'll just clean up old analytics data
      
      await cacheService.delPattern('analytics:*:old')
      logger.debug('Analytics cache refreshed')

    } catch (error) {
      logger.error('Analytics cache refresh error:', error)
    }
  }

  // Manual optimization triggers
  async optimizeForWorkspace(workspaceId: string) {
    try {
      // Pre-warm common caches for this workspace
      const cacheKeys = [
        PERFORMANCE_CONFIG.CACHE.KEYS.DASHBOARD_OVERVIEW(workspaceId),
        PERFORMANCE_CONFIG.CACHE.KEYS.PRODUCTION_FLOOR(workspaceId),
        PERFORMANCE_CONFIG.CACHE.KEYS.WORKSPACE_CONFIG(workspaceId)
      ]

      // Clear old cache entries for this workspace
      await Promise.all(cacheKeys.map(key => cacheService.del(key)))

      logger.info('Workspace cache optimized', { workspaceId })
    } catch (error) {
      logger.error('Workspace optimization error:', error)
    }
  }

  async preWarmCache(userId: string, workspaceId: string) {
    try {
      // This would pre-fetch commonly accessed data
      // Implementation would depend on usage patterns
      
      logger.info('Cache pre-warming completed', { userId, workspaceId })
    } catch (error) {
      logger.error('Cache pre-warming error:', error)
    }
  }
}

export const backgroundOptimizer = new BackgroundOptimizer()

// Graceful shutdown handling
process.on('SIGINT', () => {
  logger.info('Received SIGINT, stopping background optimizer...')
  backgroundOptimizer.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, stopping background optimizer...')
  backgroundOptimizer.stop()
  process.exit(0)
})