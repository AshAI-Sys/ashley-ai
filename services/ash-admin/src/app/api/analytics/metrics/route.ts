/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { getAllMetrics } from "@/lib/analytics/metrics";
import { requireAuth } from "@/lib/auth-middleware";
import { CacheService } from "@/lib/redis/cache";

export const dynamic = 'force-dynamic';

const cache = new CacheService("ashley-ai");
const METRICS_CACHE_TTL = 120; /* 2 minutes TTL for metrics data */

export const GET = requireAuth(async (_request: NextRequest, user) => {
  try {
    const workspace_id = user.workspaceId;
    const cacheKey = `metrics:${workspace_id}`;

    /* Try cache first */
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
        cached: true,
      });
    }

    const metrics = await getAllMetrics(workspace_id);

    /* Cache the result */
    await cache.set(cacheKey, metrics, METRICS_CACHE_TTL);

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching analytics metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: error.message },
      { status: 500 }
    );
  }
});
