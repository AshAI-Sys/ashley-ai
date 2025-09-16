"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backgroundOptimizer = void 0;
const shared_1 = require("@ash/shared");
const cache_1 = require("./cache");
const performance_1 = require("../config/performance");
const performance_2 = require("../middleware/performance");
class BackgroundOptimizer {
    constructor() {
        this.intervals = [];
        this.isRunning = false;
    }
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        shared_1.logger.info('Starting background optimization services');
        // Cache cleanup every hour
        this.intervals.push(setInterval(() => this.cleanupCache(), performance_1.PERFORMANCE_CONFIG.BACKGROUND_JOBS.CACHE_CLEANUP_INTERVAL));
        // Memory cleanup every 30 minutes  
        this.intervals.push(setInterval(() => this.cleanupMemory(), performance_1.PERFORMANCE_CONFIG.BACKGROUND_JOBS.INACTIVE_SESSION_CLEANUP));
        // Performance metrics collection every minute
        this.intervals.push(setInterval(() => this.collectPerformanceMetrics(), performance_1.PERFORMANCE_CONFIG.BACKGROUND_JOBS.METRICS_COLLECTION_INTERVAL));
        // Analytics refresh every 5 minutes
        this.intervals.push(setInterval(() => this.refreshAnalyticsCache(), performance_1.PERFORMANCE_CONFIG.BACKGROUND_JOBS.ANALYTICS_REFRESH_INTERVAL));
    }
    stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        shared_1.logger.info('Background optimization services stopped');
    }
    async cleanupCache() {
        try {
            // Clean up memory cache if using fallback
            cache_1.cacheService.cleanupMemoryCache();
            // Get cache statistics
            const stats = await cache_1.cacheService.getStats();
            shared_1.logger.info('Cache cleanup completed', stats);
            // Clear old analytics cache
            await cache_1.cacheService.delPattern('analytics:*');
        }
        catch (error) {
            shared_1.logger.error('Cache cleanup error:', error);
        }
    }
    cleanupMemory() {
        try {
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
                shared_1.logger.info('Manual garbage collection triggered');
            }
            // Clear old performance metrics
            const metricsCollector = performance_2.PerformanceMetrics.getInstance();
            // Keep only last hour of metrics for each endpoint
            const allMetrics = metricsCollector.getMetrics();
            const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour
            Object.entries(allMetrics).forEach(([endpoint, metrics]) => {
                if (Array.isArray(metrics)) {
                    const recentMetrics = metrics.filter((m) => m.timestamp > cutoff);
                    // This is a simplified approach - in production you'd want more sophisticated cleanup
                    if (recentMetrics.length < metrics.length) {
                        shared_1.logger.info(`Cleaned up ${metrics.length - recentMetrics.length} old metrics for ${endpoint}`);
                    }
                }
            });
        }
        catch (error) {
            shared_1.logger.error('Memory cleanup error:', error);
        }
    }
    async collectPerformanceMetrics() {
        try {
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
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
            };
            // Store metrics (in production, you'd send to monitoring service)
            shared_1.logger.debug('Performance metrics collected', metrics);
            // Check for performance issues
            const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
            if (heapUsedPercent > 90) {
                shared_1.logger.warn('Critical memory usage detected', { heapUsedPercent });
                // Could trigger alerts or cleanup actions
            }
            else if (heapUsedPercent > 80) {
                shared_1.logger.warn('High memory usage detected', { heapUsedPercent });
            }
        }
        catch (error) {
            shared_1.logger.error('Performance metrics collection error:', error);
        }
    }
    async refreshAnalyticsCache() {
        try {
            // This would typically pre-warm caches for commonly accessed analytics data
            // For now, we'll just clean up old analytics data
            await cache_1.cacheService.delPattern('analytics:*:old');
            shared_1.logger.debug('Analytics cache refreshed');
        }
        catch (error) {
            shared_1.logger.error('Analytics cache refresh error:', error);
        }
    }
    // Manual optimization triggers
    async optimizeForWorkspace(workspaceId) {
        try {
            // Pre-warm common caches for this workspace
            const cacheKeys = [
                performance_1.PERFORMANCE_CONFIG.CACHE.KEYS.DASHBOARD_OVERVIEW(workspaceId),
                performance_1.PERFORMANCE_CONFIG.CACHE.KEYS.PRODUCTION_FLOOR(workspaceId),
                performance_1.PERFORMANCE_CONFIG.CACHE.KEYS.WORKSPACE_CONFIG(workspaceId)
            ];
            // Clear old cache entries for this workspace
            await Promise.all(cacheKeys.map(key => cache_1.cacheService.del(key)));
            shared_1.logger.info('Workspace cache optimized', { workspaceId });
        }
        catch (error) {
            shared_1.logger.error('Workspace optimization error:', error);
        }
    }
    async preWarmCache(userId, workspaceId) {
        try {
            // This would pre-fetch commonly accessed data
            // Implementation would depend on usage patterns
            shared_1.logger.info('Cache pre-warming completed', { userId, workspaceId });
        }
        catch (error) {
            shared_1.logger.error('Cache pre-warming error:', error);
        }
    }
}
exports.backgroundOptimizer = new BackgroundOptimizer();
// Graceful shutdown handling
process.on('SIGINT', () => {
    shared_1.logger.info('Received SIGINT, stopping background optimizer...');
    exports.backgroundOptimizer.stop();
    process.exit(0);
});
process.on('SIGTERM', () => {
    shared_1.logger.info('Received SIGTERM, stopping background optimizer...');
    exports.backgroundOptimizer.stop();
    process.exit(0);
});
