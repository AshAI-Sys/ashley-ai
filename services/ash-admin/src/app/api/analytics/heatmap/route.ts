import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = db;

// GET /api/analytics/heatmap - Get production efficiency heatmap data
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const url = new URL(req.url);

    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const stationType = url.searchParams.get("stationType");
    const shift = url.searchParams.get("shift");

    const where: any = { workspace_id: workspaceId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (stationType) where.station_type = stationType;
    if (shift) where.shift = shift;

    const heatmapData = await prisma.productionHeatmap.findMany({
      where,
      orderBy: [{ date: "asc" }, { hour: "asc" }],
    });

    // Calculate aggregated statistics
    const stats = {
      avgEfficiency:
        heatmapData.reduce((sum, d) => sum + d.efficiency, 0) /
          heatmapData.length || 0,
      avgDefectRate:
        heatmapData.reduce((sum, d) => sum + d.defect_rate, 0) /
          heatmapData.length || 0,
      totalDowntime: heatmapData.reduce((sum, d) => sum + d.downtime_mins, 0),
      totalOutput: heatmapData.reduce((sum, d) => sum + d.output_units, 0),
      totalTarget: heatmapData.reduce((sum, d) => sum + d.target_units, 0),
    };

    // Group by hour for heatmap visualization
    const hourlyData: any = {};
    heatmapData.forEach(item => {
      const key = `${item.station_type}-${item.hour}`;
      if (!hourlyData[key]) {
        hourlyData[key] = {
          station_type: item.station_type,
          hour: item.hour,
          efficiency: [],
          defect_rate: [],
          output: 0,
          target: 0,
        };
      }
      hourlyData[key].efficiency.push(item.efficiency);
      hourlyData[key].defect_rate.push(item.defect_rate);
      hourlyData[key].output += item.output_units;
      hourlyData[key].target += item.target_units;
    });

    // Calculate averages
    const heatmapGrid = Object.values(hourlyData).map((item: any) => ({
      station_type: item.station_type,
      hour: item.hour,
      avg_efficiency:
        item.efficiency.reduce((a: number, b: number) => a + b, 0) /
        item.efficiency.length,
      avg_defect_rate:
        item.defect_rate.reduce((a: number, b: number) => a + b, 0) /
        item.defect_rate.length,
      total_output: item.output,
      total_target: item.target,
      achievement_rate: (item.output / item.target) * 100,
    }));

    return NextResponse.json({
      success: true,
      data: heatmapData,
      heatmap: heatmapGrid,
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching heatmap data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

// POST /api/analytics/heatmap - Create heatmap data point
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const body = await req.json();

    const {
      date,
      hour,
      shift,
      station_type,
      station_id,
      efficiency,
      output_units,
      target_units,
      defect_rate,
      downtime_mins,
      operators_count,
    } = body;

    if (!date || hour === undefined || !station_type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const heatmap = await prisma.productionHeatmap.create({
      data: {
        workspace_id: workspaceId,
        date: new Date(date),
        hour,
        shift,
        station_type,
        station_id,
        efficiency: efficiency || 0,
        output_units: output_units || 0,
        target_units: target_units || 0,
        defect_rate: defect_rate || 0,
        downtime_mins: downtime_mins || 0,
        operators_count: operators_count || 1,
      },
    });

    return NextResponse.json({
      success: true,
      heatmap,
    });
  } catch (error: any) {
    console.error("Error creating heatmap data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
