"use strict";
// Performance optimization configuration for ASH AI system
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_INVALIDATION = exports.PERFORMANCE_THRESHOLDS = exports.PERFORMANCE_CONFIG = void 0;
exports.PERFORMANCE_CONFIG = {
    // Database Query Optimization
    DATABASE: {
        CONNECTION_POOL_SIZE: 20,
        QUERY_TIMEOUT: 30000, // 30 seconds
        SLOW_QUERY_THRESHOLD: 1000, // 1 second
        BATCH_SIZE: 100,
        PREFETCH_RELATIONS: true
    },
    // Caching Configuration
    CACHE: {
        // Redis cache TTL values (in seconds)
        TTL: {
            DASHBOARD_DATA: 300, // 5 minutes
            USER_SESSION: 3600, // 1 hour
            STATIC_DATA: 86400, // 24 hours
            ANALYTICS: 1800, // 30 minutes
            SEARCH_RESULTS: 600 // 10 minutes
        },
        // Cache keys
        KEYS: {
            DASHBOARD_OVERVIEW: (workspaceId) => `dashboard:overview:${workspaceId}`,
            PRODUCTION_FLOOR: (workspaceId) => `production:floor:${workspaceId}`,
            USER_PROFILE: (userId) => `user:profile:${userId}`,
            WORKSPACE_CONFIG: (workspaceId) => `workspace:config:${workspaceId}`,
            ANALYTICS_DATA: (workspaceId, period) => `analytics:${workspaceId}:${period}`
        }
    },
    // API Response Optimization
    API: {
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100,
        RESPONSE_COMPRESSION: true,
        GZIP_LEVEL: 6,
        // Fields to always include in responses
        MINIMAL_FIELDS: {
            USER: ['id', 'email', 'first_name', 'last_name', 'role'],
            ORDER: ['id', 'order_number', 'status', 'total_amount', 'delivery_date'],
            CLIENT: ['id', 'name', 'email', 'contact_person']
        }
    },
    // Background Processing
    BACKGROUND_JOBS: {
        ANALYTICS_REFRESH_INTERVAL: 300000, // 5 minutes
        CACHE_CLEANUP_INTERVAL: 3600000, // 1 hour
        METRICS_COLLECTION_INTERVAL: 60000, // 1 minute
        INACTIVE_SESSION_CLEANUP: 1800000 // 30 minutes
    },
    // Query Optimization
    QUERY_OPTIMIZATION: {
        // Use these patterns for efficient queries
        BULK_OPERATIONS: true,
        LAZY_LOADING: true,
        INDEX_HINTS: true,
        AGGREGATE_CACHING: true
    }
};
// Performance monitoring thresholds
exports.PERFORMANCE_THRESHOLDS = {
    API_RESPONSE_TIME: 500, // ms
    DATABASE_QUERY_TIME: 100, // ms
    MEMORY_USAGE: 85, // percentage
    CPU_USAGE: 80 // percentage
};
// Cache invalidation patterns
exports.CACHE_INVALIDATION = {
    // When these entities change, invalidate related caches
    PATTERNS: {
        ORDER_UPDATED: ['dashboard:*', 'production:*', 'analytics:*'],
        USER_UPDATED: ['user:*', 'dashboard:*'],
        PRODUCTION_UPDATED: ['production:*', 'dashboard:*']
    }
};
