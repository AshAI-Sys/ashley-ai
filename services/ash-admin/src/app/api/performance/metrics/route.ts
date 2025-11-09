/* eslint-disable */
/**
 * Performance Metrics API
 * Real-time performance monitoring and analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { getQueryMetrics } from "@/lib/performance/query-cache";
import { checkRedisAvailable, getRedisInfo } from "@/lib/redis";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


export const GET = requireAuth(async (_request: NextRequest, _user) => {
  try {
    // Get query performance metrics
    const queryMetrics = getQueryMetrics();

    // Get Redis status
    const redisAvailable = await checkRedisAvailable();
    const redisInfo = redisAvailable ? await getRedisInfo() : null;

    // Parse Redis info if available
    let redisStats = null;
    if (redisInfo) {
      const lines = redisInfo.split("\r\n");
      const stats: any = {};

      lines.forEach(line => {
        if (line.includes(":")) {
          const [key, value] = line.split(":");
          if (key) stats[key] = value;
        }
      });

      redisStats = {
        connected_clients: stats.connected_clients || "0",
        used_memory_human: stats.used_memory_human || "N/A",
        used_memory_peak_human: stats.used_memory_peak_human || "N/A",
        total_commands_processed: stats.total_commands_processed || "0",
        instantaneous_ops_per_sec: stats.instantaneous_ops_per_sec || "0",
        keyspace_hits: stats.keyspace_hits || "0",
        keyspace_misses: stats.keyspace_misses || "0",
        uptime_in_days: stats.uptime_in_days || "0",
      };
    }

    // Calculate cache hit rate for Redis
    let redisCacheHitRate = 0;
    if (redisStats) {
      const hits = parseInt(redisStats.keyspace_hits) || 0;
      const misses = parseInt(redisStats.keyspace_misses) || 0;
      const total = hits + misses;
      redisCacheHitRate = total > 0 ? (hits / total) * 100 : 0;
    }
    

    return NextResponse.json({
      success: true,
      data: {
        // Query metrics
        queries: {
          total: queryMetrics.totalQueries,
          cacheHits: queryMetrics.cacheHits,
          cacheMisses: queryMetrics.cacheMisses,
          cacheHitRate: Math.round(queryMetrics.cacheHitRate * 10) / 10,
          avgDuration: Math.round(queryMetrics.avgDuration * 10) / 10,
          avgCachedDuration:
            Math.round(queryMetrics.avgCachedDuration * 10) / 10,
          avgUncachedDuration:
            Math.round(queryMetrics.avgUncachedDuration * 10) / 10,
          speedup: Math.round(queryMetrics.speedup * 10) / 10,
        },

        // Redis metrics
        redis: {
          available: redisAvailable,
          cacheHitRate: Math.round(redisCacheHitRate * 10) / 10,
          stats: redisStats,
        },

        // System health
        health: {
          status: redisAvailable ? "healthy" : "degraded",
          message: redisAvailable
            ? "All systems operational"
            : "Redis unavailable - using in-memory fallback",
        },

        // Performance grades
        grades: {
          queryCacheEfficiency: getGrade(queryMetrics.cacheHitRate),
          querySpeed: getSpeedGrade(queryMetrics.avgDuration),
          redisCacheEfficiency: redisAvailable
            ? getGrade(redisCacheHitRate)
            : "N/A",
        },

        // Recommendations
        recommendations: getRecommendations(
          queryMetrics,
          redisAvailable,
          redisCacheHitRate
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch performance metrics" },
      { status: 500 }
    );
  }
})

/**
 * Get performance grade based on percentage
 */
function getGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

/**
 * Get speed grade based on average duration (ms)
 */
function getSpeedGrade(avgDuration: number): string {
  if (avgDuration <= 50) return "A+";
  if (avgDuration <= 100) return "A";
  if (avgDuration <= 200) return "B";
  if (avgDuration <= 500) return "C";
  if (avgDuration <= 1000) return "D";
  return "F";
}

/**
 * Get performance recommendations
 */
function getRecommendations(
  queryMetrics: any,
  redisAvailable: boolean,
  redisCacheHitRate: number
): string[] {
  const recommendations: string[] = [];

  // Query cache recommendations
  if (queryMetrics.cacheHitRate < 70) {
    recommendations.push(
      "Low cache hit rate detected. Consider increasing cache TTL for frequently accessed data."
    );
  }

  if (queryMetrics.avgUncachedDuration > 500) {
    recommendations.push(
      "Slow uncached queries detected. Review database indexes and query optimization."
    );
  }

  if (queryMetrics.totalQueries < 100) {
    recommendations.push(
      "Limited data - continue monitoring for more accurate metrics."
    );
  }

  // Redis recommendations
  if (!redisAvailable) {
    recommendations.push(
      "Redis is not available. Deploy Redis for production to improve performance."
    );
  } else if (redisCacheHitRate < 80) {
    recommendations.push(
      "Redis cache hit rate is below optimal. Review cache invalidation strategy."
    );
  }

  // Performance recommendations
  if (queryMetrics.avgDuration > 200) {
    recommendations.push(
      "Average query duration is high. Consider implementing more aggressive caching."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Performance is excellent! No immediate optimizations needed."
    );
  }

  return recommendations;
}
