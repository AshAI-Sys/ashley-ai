import { NextRequest, NextResponse } from "next/server";
import { getAllMetrics } from "@/lib/analytics/metrics";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspace_id = user.workspaceId;

    const metrics = await getAllMetrics(workspace_id);

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
  } catch (error: any) {
    console.error("Error fetching analytics metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: error.message },
      { status: 500 }
    );
  }
