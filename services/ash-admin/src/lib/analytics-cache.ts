/**
 * Analytics Cache Invalidation Utility
 * Provides targeted cache invalidation for analytics data when entities change
 */

import { invalidateWorkspaceCache } from "./cache";

/**
 * Invalidate all analytics cache for a workspace
 */
export async function invalidateAnalyticsCache(workspaceId: string): Promise<void> {
  await invalidateWorkspaceCache(workspaceId);
}

/**
 * Invalidate specific analytics type cache
 * @param workspaceId - Workspace ID
 * @param type - Analytics type (sales, production, inventory, financial, hr)
 */
export async function invalidateAnalyticsByType(
  workspaceId: string,
  type: "sales" | "production" | "inventory" | "financial" | "hr"
): Promise<void> {
  const redis = await import("./redis").then((m) => m.getRedisClient());
  if (!redis) return;

  try {
    // Invalidate all date ranges for this type
    const pattern = `workspace-cache:workspace:${workspaceId}:analytics:${type}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Failed to invalidate analytics cache:", error);
  }
}

/**
 * Invalidate analytics cache based on entity changes
 */
export const InvalidationHandlers = {
  /**
   * Invalidate sales analytics when orders/invoices/payments change
   */
  async onOrderChange(workspaceId: string): Promise<void> {
    await Promise.all([
      invalidateAnalyticsByType(workspaceId, "sales"),
      invalidateAnalyticsByType(workspaceId, "financial"),
    ]);
  },

  /**
   * Invalidate financial analytics when financial entities change
   */
  async onFinancialChange(workspaceId: string): Promise<void> {
    await invalidateAnalyticsByType(workspaceId, "financial");
  },

  /**
   * Invalidate production analytics when production runs change
   */
  async onProductionChange(workspaceId: string): Promise<void> {
    await invalidateAnalyticsByType(workspaceId, "production");
  },

  /**
   * Invalidate inventory analytics when inventory changes
   */
  async onInventoryChange(workspaceId: string): Promise<void> {
    await invalidateAnalyticsByType(workspaceId, "inventory");
  },

  /**
   * Invalidate HR analytics when employee/attendance/payroll changes
   */
  async onHRChange(workspaceId: string): Promise<void> {
    await invalidateAnalyticsByType(workspaceId, "hr");
  },
};

/**
 * Auto-invalidate cache based on entity type
 * Use this as a wrapper for API endpoints that modify data
 */
export async function withCacheInvalidation<T>(
  workspaceId: string,
  entities: Array<
    "order" | "invoice" | "payment" | "expense" | "production" | "inventory" | "hr"
  >,
  fn: () => Promise<T>
): Promise<T> {
  const result = await fn();

  // Invalidate in background (don't block the response)
  Promise.all(
    entities.map((entity) => {
      switch (entity) {
        case "order":
        case "invoice":
        case "payment":
          return InvalidationHandlers.onOrderChange(workspaceId);
        case "expense":
          return InvalidationHandlers.onFinancialChange(workspaceId);
        case "production":
          return InvalidationHandlers.onProductionChange(workspaceId);
        case "inventory":
          return InvalidationHandlers.onInventoryChange(workspaceId);
        case "hr":
          return InvalidationHandlers.onHRChange(workspaceId);
        default:
          return Promise.resolve();
      }
    })
  ).catch((error) => console.error("Cache invalidation error:", error));

  return result;
}
