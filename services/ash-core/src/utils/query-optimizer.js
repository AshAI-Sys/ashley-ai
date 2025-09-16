"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeQuery = exports.getConnectionPoolStats = exports.DashboardQueries = exports.bulkInsert = exports.batchOperation = exports.paginateQuery = exports.withQueryTiming = void 0;
const database_1 = require("@ash/database");
const shared_1 = require("@ash/shared");
const performance_1 = require("../config/performance");
// Query performance monitoring
const withQueryTiming = async (queryName, queryFn) => {
    const startTime = Date.now();
    try {
        const result = await queryFn();
        const duration = Date.now() - startTime;
        if (duration > performance_1.PERFORMANCE_CONFIG.DATABASE.SLOW_QUERY_THRESHOLD) {
            shared_1.logger.warn('Slow query detected', {
                query: queryName,
                duration: `${duration}ms`,
                threshold: `${performance_1.PERFORMANCE_CONFIG.DATABASE.SLOW_QUERY_THRESHOLD}ms`
            });
        }
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        shared_1.logger.error('Query failed', {
            query: queryName,
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};
exports.withQueryTiming = withQueryTiming;
const paginateQuery = async (queryFn, countFn, options = {}) => {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(Math.max(1, options.limit || performance_1.PERFORMANCE_CONFIG.API.DEFAULT_PAGE_SIZE), performance_1.PERFORMANCE_CONFIG.API.MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;
    const orderBy = options.sortBy ? {
        [options.sortBy]: options.sortOrder || 'asc'
    } : undefined;
    // Execute count and data queries in parallel
    const [data, total] = await Promise.all([
        queryFn(skip, limit, orderBy),
        countFn()
    ]);
    const pages = Math.ceil(total / limit);
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
    };
};
exports.paginateQuery = paginateQuery;
// Batch operations utility
const batchOperation = async (items, operation, batchSize = performance_1.PERFORMANCE_CONFIG.DATABASE.BATCH_SIZE) => {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await operation(batch);
        results.push(...batchResults);
    }
    return results;
};
exports.batchOperation = batchOperation;
// Efficient bulk insert utility
const bulkInsert = async (model, data, batchSize = performance_1.PERFORMANCE_CONFIG.DATABASE.BATCH_SIZE) => {
    if (data.length === 0)
        return;
    await (0, exports.batchOperation)(data, async (batch) => {
        await model.createMany({
            data: batch,
            skipDuplicates: true
        });
        return batch;
    }, batchSize);
};
exports.bulkInsert = bulkInsert;
// Optimized queries for common dashboard operations
exports.DashboardQueries = {
    // Get order statistics with minimal data
    async getOrderStats(workspaceId) {
        return (0, exports.withQueryTiming)('dashboard-order-stats', async () => {
            return database_1.prisma.order.groupBy({
                by: ['status'],
                where: {
                    workspace_id: workspaceId,
                    deleted_at: null
                },
                _count: { id: true },
                _sum: { total_amount: true }
            });
        });
    },
    // Get production metrics efficiently
    async getProductionMetrics(workspaceId) {
        return (0, exports.withQueryTiming)('dashboard-production-metrics', async () => {
            return database_1.prisma.routingStep.groupBy({
                by: ['department', 'status'],
                where: { workspace_id: workspaceId },
                _count: { id: true },
                _avg: {
                    actual_hours: true,
                    efficiency_score: true
                }
            });
        });
    },
    // Get upcoming deadlines with minimal includes
    async getUpcomingDeadlines(workspaceId, days = 7) {
        return (0, exports.withQueryTiming)('dashboard-upcoming-deadlines', async () => {
            const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            return database_1.prisma.order.findMany({
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
            });
        });
    }
};
// Connection pool monitoring
const getConnectionPoolStats = () => {
    // This would depend on your database setup
    // For now, return basic info
    return {
        active: database_1.prisma._engine?.connectionPool?.activeConnections || 0,
        idle: database_1.prisma._engine?.connectionPool?.idleConnections || 0,
        total: performance_1.PERFORMANCE_CONFIG.DATABASE.CONNECTION_POOL_SIZE
    };
};
exports.getConnectionPoolStats = getConnectionPoolStats;
// Query plan analysis (for development)
const analyzeQuery = async (query, params) => {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    try {
        // This would require raw SQL execution
        // Implementation depends on your database
        shared_1.logger.info('Query analysis requested', { query, params });
        return { analyzed: true };
    }
    catch (error) {
        shared_1.logger.error('Query analysis failed:', error);
        return null;
    }
};
exports.analyzeQuery = analyzeQuery;
