/**
 * Prisma Extensions for Performance
 * Add caching, logging, and optimization to Prisma queries
 */

import { Prisma } from "@prisma/client";

/**
 * Query performance logging extension
 */
export const queryLoggingExtension = Prisma.defineExtension({
  name: "queryLogging",
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }: {
        operation: string;
        model: string;
        args: any;
        query: (args: any) => Promise<any>;
      }) {
        const start = Date.now();
        try {
          const result = await query(args);
          const duration = Date.now() - start;

          // Log slow queries (>500ms)
          if (duration > 500) {
            console.warn(
              `🐌 Slow query detected: ${model}.${operation} took ${duration}ms`,
              {
                model,
                operation,
                duration,
                args: JSON.stringify(args).substring(0, 200), // Truncate for readability
              }
            );
          }

          return result;
        } catch (error) {
          const duration = Date.now() - start;
          console.error(
            `❌ Query failed: ${model}.${operation} after ${duration}ms`,
            error
          );
          throw error;
        }
      },
    },
  },
});

/**
 * Query result caching extension
 * Note: This is a simple in-memory cache for demonstration
 * Use Redis cache for production
 */
const queryCache = new Map<string, { data: any; expiry: number }>();

export const queryCachingExtension = Prisma.defineExtension({
  name: "queryCaching",
  query: {
    $allModels: {
      async findUnique({ model, operation, args, query }: {
        model: string;
        operation: string;
        args: any;
        query: (args: any) => Promise<any>;
      }) {
        // Only cache findUnique operations
        if (operation !== "findUnique") {
          return query(args);
        }

        // Create cache key
        const cacheKey = `${model}:${operation}:${JSON.stringify(args)}`;

        // Check cache
        const cached = queryCache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
          console.log(`✅ Cache HIT: ${model}.${operation}`);
          return cached.data;
        }

        // Execute query
        const result = await query(args);

        // Store in cache (30 second TTL)
        queryCache.set(cacheKey, {
          data: result,
          expiry: Date.now() + 30000,
        });

        console.log(`❌ Cache MISS: ${model}.${operation}`);
        return result;
      },
    },
  },
});

/**
 * Auto-pagination extension
 * Prevents accidentally loading too many records
 */
export const autoPaginationExtension = Prisma.defineExtension({
  name: "autoPagination",
  query: {
    $allModels: {
      async findMany({ model, args, query }: {
        model: string;
        args: any;
        query: (args: any) => Promise<any>;
      }) {
        // If no take/limit is specified, default to 100
        if (!args.take) {
          console.warn(
            `⚠️  No pagination limit for ${model}.findMany, defaulting to 100`
          );
          args.take = 100;
        }

        // Warn if trying to load more than 1000 records
        if (args.take && args.take > 1000) {
          console.warn(
            `⚠️  Large query: ${model}.findMany requesting ${args.take} records`
          );
        }

        return query(args);
      },
    },
  },
});

/**
 * N+1 query detection extension
 * Helps identify potential N+1 query problems
 */
let queryLog: Array<{ model: string; operation: string; timestamp: number }> =
  [];

export const n1DetectionExtension = Prisma.defineExtension({
  name: "n1Detection",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: {
        model: string;
        operation: string;
        args: any;
        query: (args: any) => Promise<any>;
      }) {
        // Record query
        queryLog.push({
          model,
          operation,
          timestamp: Date.now(),
        });

        // Check for N+1 pattern (multiple same queries within 100ms)
        const recentQueries = queryLog.filter(
          q => q.timestamp > Date.now() - 100
        );
        const duplicates = recentQueries.filter(
          q => q.model === model && q.operation === operation
        );

        if (duplicates.length > 5) {
          console.warn(
            `🚨 Potential N+1 query: ${model}.${operation} called ${duplicates.length} times in 100ms`
          );
        }

        // Clean old logs
        if (queryLog.length > 1000) {
          queryLog = queryLog.slice(-500);
        }

        return query(args);
      },
    },
  },
});

/**
 * Combined performance extension
 */
export const performanceExtension = Prisma.defineExtension({
  name: "performance",
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }: {
        operation: string;
        model: string;
        args: any;
        query: (args: any) => Promise<any>;
      }) {
        const start = Date.now();
        const queryId = Math.random().toString(36).substring(7);

        try {
          // Log query start (only in development)
          if (process.env.NODE_ENV === "development") {
            console.log(`[${queryId}] Starting: ${model}.${operation}`);
          }

          const result = await query(args);
          const duration = Date.now() - start;

          // Log query completion
          if (duration > 100) {
            console.log(
              `[${queryId}] ⏱️  ${model}.${operation} completed in ${duration}ms`
            );
          }

          // Warn on slow queries
          if (duration > 1000) {
            console.warn(
              `[${queryId}] 🐌 SLOW QUERY: ${model}.${operation} took ${duration}ms`,
              {
                args: JSON.stringify(args).substring(0, 100),
              }
            );
          }

          return result;
        } catch (error) {
          const duration = Date.now() - start;
          console.error(
            `[${queryId}] ❌ ${model}.${operation} failed after ${duration}ms`,
            error
          );
          throw error;
        }
      },
    },
  },
});

/**
 * Clear query caches
 */
export function clearQueryCache() {
  queryCache.clear();
  queryLog = [];
}

/**
 * Get query cache statistics
 */
export function getQueryCacheStats() {
  return {
    size: queryCache.size,
    recentQueries: queryLog.length,
  };
}
