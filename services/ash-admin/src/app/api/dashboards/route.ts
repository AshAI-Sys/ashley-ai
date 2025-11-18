import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { CacheService } from "@/lib/redis/cache";

export const dynamic = 'force-dynamic';

const prisma = db;
const cache = new CacheService("ashley-ai");
const DASHBOARD_CACHE_TTL = 60; // 60 seconds TTL for dashboard data

// GET /api/dashboards - List all dashboards
export const GET = requireAuth(async (req: NextRequest, _user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    // Build cache key based on query params
    const cacheKey = `dashboards:${workspaceId}:${type || 'all'}`;

    // Try to get from cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const where: any = { workspace_id: workspaceId, is_active: true };
    if (type) where.dashboard_type = type;

    const dashboards = await prisma.executiveDashboard.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        widgets_data: true,
      },
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
    });

    const result = {
      success: true,
      dashboards: dashboards.map((d: any) => ({
        ...d,
        layout: JSON.parse(d.layout),
        widgets: JSON.parse(d.widgets),
        widgets_data: d.widgets_data.map((w: any) => ({
          ...w,
          query_params: w.query_params ? JSON.parse(w.query_params) : null,
          visualization: JSON.parse(w.visualization),
          position: JSON.parse(w.position),
        })),
      })),
    };

    // Cache the result
    await cache.set(cacheKey, result, DASHBOARD_CACHE_TTL);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching dashboards:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

// POST /api/dashboards - Create new dashboard
export const POST = requireAuth(async (req: NextRequest, _user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const userId = req.headers.get("x-user-id") || "system";
    const body = await req.json();

    const {
      name,
      description,
      dashboard_type,
      layout,
      widgets,
      refresh_interval,
      is_default,
    } = body;

    if (!name || !dashboard_type || !layout || !widgets) {
      
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    const dashboard = await prisma.executiveDashboard.create({
      data: {
        workspace_id: workspaceId,
        name,
        description,
        dashboard_type,
        layout: JSON.stringify(layout),
        widgets: JSON.stringify(widgets),
        refresh_interval: refresh_interval || 300,
        is_default: is_default || false,
        created_by: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
        
      
        });

    // Invalidate cache for this workspace
    await cache.invalidatePattern(`dashboards:${workspaceId}:*`);

    return NextResponse.json({
      success: true,
      dashboard: {
        ...dashboard,
        layout: JSON.parse(dashboard.layout),
        widgets: JSON.parse(dashboard.widgets),
      },
    });
  } catch (error: any) {
    console.error("Error creating dashboard:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
