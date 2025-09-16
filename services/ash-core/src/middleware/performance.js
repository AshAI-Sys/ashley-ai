"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthMetrics = exports.PerformanceMetrics = exports.cpuMonitor = exports.memoryMonitor = exports.trackCacheMiss = exports.trackCacheHit = exports.queryCounter = exports.performanceMonitor = void 0;
const shared_1 = require("@ash/shared");
const performance_1 = require("../config/performance");
// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
    req.startTime = Date.now();
    req.queryCount = 0;
    req.cacheHits = 0;
    req.cacheMisses = 0;
    // Override res.json to capture response time
    const originalJson = res.json;
    res.json = function (body) {
        const duration = Date.now() - req.startTime;
        const endpoint = `${req.method} ${req.route?.path || req.path}`;
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
            userId: req.user?.id,
            workspaceId: req.user?.workspace_id
        };
        // Log slow requests
        if (duration > performance_1.PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) {
            shared_1.logger.warn('Slow API response detected', metrics);
        }
        else {
            shared_1.logger.info('API response time', metrics);
        }
        // Add performance headers to response
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Query-Count', req.queryCount.toString());
        res.setHeader('X-Cache-Hits', req.cacheHits.toString());
        return originalJson.call(this, body);
    };
    next();
};
exports.performanceMonitor = performanceMonitor;
// Database query counter (to be used with Prisma middleware)
const queryCounter = (req) => {
    return (params, next) => {
        req.queryCount = (req.queryCount || 0) + 1;
        const start = Date.now();
        return next(params).then((result) => {
            const duration = Date.now() - start;
            if (duration > performance_1.PERFORMANCE_THRESHOLDS.DATABASE_QUERY_TIME) {
                shared_1.logger.warn('Slow database query', {
                    model: params.model,
                    action: params.action,
                    duration: `${duration}ms`,
                    args: params.args
                });
            }
            return result;
        });
    };
};
exports.queryCounter = queryCounter;
// Cache hit/miss tracking
const trackCacheHit = (req) => {
    req.cacheHits = (req.cacheHits || 0) + 1;
};
exports.trackCacheHit = trackCacheHit;
const trackCacheMiss = (req) => {
    req.cacheMisses = (req.cacheMisses || 0) + 1;
};
exports.trackCacheMiss = trackCacheMiss;
// Memory usage monitoring
const memoryMonitor = () => {
    const usage = process.memoryUsage();
    const memoryInfo = {
        rss: Math.round(usage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
        heapUsedPercentage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
    };
    if (memoryInfo.heapUsedPercentage > performance_1.PERFORMANCE_THRESHOLDS.MEMORY_USAGE) {
        shared_1.logger.warn('High memory usage detected', memoryInfo);
    }
    return memoryInfo;
};
exports.memoryMonitor = memoryMonitor;
// CPU usage monitoring (simplified)
const cpuMonitor = () => {
    const usage = process.cpuUsage();
    return {
        user: usage.user,
        system: usage.system,
        timestamp: Date.now()
    };
};
exports.cpuMonitor = cpuMonitor;
// Performance metrics collector
class PerformanceMetrics {
    constructor() {
        this.metrics = new Map();
        this.MAX_METRICS = 1000;
    }
    static getInstance() {
        if (!PerformanceMetrics.instance) {
            PerformanceMetrics.instance = new PerformanceMetrics();
        }
        return PerformanceMetrics.instance;
    }
    addMetric(endpoint, data) {
        if (!this.metrics.has(endpoint)) {
            this.metrics.set(endpoint, []);
        }
        const endpointMetrics = this.metrics.get(endpoint);
        endpointMetrics.push({ ...data, timestamp: Date.now() });
        // Keep only recent metrics
        if (endpointMetrics.length > this.MAX_METRICS) {
            endpointMetrics.splice(0, endpointMetrics.length - this.MAX_METRICS);
        }
    }
    getMetrics(endpoint) {
        if (endpoint) {
            return this.metrics.get(endpoint) || [];
        }
        return Object.fromEntries(this.metrics);
    }
    getAverageResponseTime(endpoint, minutes = 60) {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        const endpointMetrics = this.metrics.get(endpoint) || [];
        const recentMetrics = endpointMetrics.filter(m => m.timestamp > cutoff);
        if (recentMetrics.length === 0)
            return 0;
        const totalTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
        return Math.round(totalTime / recentMetrics.length);
    }
    clearMetrics() {
        this.metrics.clear();
    }
}
exports.PerformanceMetrics = PerformanceMetrics;
// Health check endpoint data
const getHealthMetrics = () => {
    const memoryInfo = (0, exports.memoryMonitor)();
    const now = Date.now();
    return {
        status: 'healthy',
        timestamp: now,
        uptime: process.uptime(),
        memory: memoryInfo,
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
    };
};
exports.getHealthMetrics = getHealthMetrics;
