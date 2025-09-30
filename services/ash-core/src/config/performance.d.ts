export declare const PERFORMANCE_CONFIG: {
    DATABASE: {
        CONNECTION_POOL_SIZE: number;
        QUERY_TIMEOUT: number;
        SLOW_QUERY_THRESHOLD: number;
        BATCH_SIZE: number;
        PREFETCH_RELATIONS: boolean;
    };
    CACHE: {
        TTL: {
            DASHBOARD_DATA: number;
            USER_SESSION: number;
            STATIC_DATA: number;
            ANALYTICS: number;
            SEARCH_RESULTS: number;
        };
        KEYS: {
            DASHBOARD_OVERVIEW: (workspaceId: string) => string;
            PRODUCTION_FLOOR: (workspaceId: string) => string;
            USER_PROFILE: (userId: string) => string;
            WORKSPACE_CONFIG: (workspaceId: string) => string;
            ANALYTICS_DATA: (workspaceId: string, period: string) => string;
        };
    };
    API: {
        DEFAULT_PAGE_SIZE: number;
        MAX_PAGE_SIZE: number;
        RESPONSE_COMPRESSION: boolean;
        GZIP_LEVEL: number;
        MINIMAL_FIELDS: {
            USER: string[];
            ORDER: string[];
            CLIENT: string[];
        };
    };
    BACKGROUND_JOBS: {
        ANALYTICS_REFRESH_INTERVAL: number;
        CACHE_CLEANUP_INTERVAL: number;
        METRICS_COLLECTION_INTERVAL: number;
        INACTIVE_SESSION_CLEANUP: number;
    };
    QUERY_OPTIMIZATION: {
        BULK_OPERATIONS: boolean;
        LAZY_LOADING: boolean;
        INDEX_HINTS: boolean;
        AGGREGATE_CACHING: boolean;
    };
};
export declare const PERFORMANCE_THRESHOLDS: {
    API_RESPONSE_TIME: number;
    DATABASE_QUERY_TIME: number;
    MEMORY_USAGE: number;
    CPU_USAGE: number;
};
export declare const CACHE_INVALIDATION: {
    PATTERNS: {
        ORDER_UPDATED: string[];
        USER_UPDATED: string[];
        PRODUCTION_UPDATED: string[];
    };
};
