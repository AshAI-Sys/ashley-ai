/**
 * Prisma Extensions for Performance
 * Add caching, logging, and optimization to Prisma queries
 */
/**
 * Query performance logging extension
 */
export declare const queryLoggingExtension: any;
export declare const queryCachingExtension: any;
/**
 * Auto-pagination extension
 * Prevents accidentally loading too many records
 */
export declare const autoPaginationExtension: any;
export declare const n1DetectionExtension: any;
/**
 * Combined performance extension
 */
export declare const performanceExtension: any;
/**
 * Clear query caches
 */
export declare function clearQueryCache(): void;
/**
 * Get query cache statistics
 */
export declare function getQueryCacheStats(): {
    size: number;
    recentQueries: number;
};
