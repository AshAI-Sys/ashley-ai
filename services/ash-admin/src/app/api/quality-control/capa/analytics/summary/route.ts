import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

// GET /api/quality-control/capa/analytics/summary
export const GET = requireAuth(async (request, user) => {
  try {
    const workspaceId = user.workspaceId;

    // Return empty analytics for now
    // TODO: Implement actual CAPA analytics from database
    const analytics = {
      status_distribution: [],
      priority_distribution: [],
      effectiveness_distribution: [],
      overdue_count: 0,
      average_completion_days: 0,
      total_tasks: 0,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("CAPA analytics fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch CAPA analytics" },
      { status: 500 }
    );
  }
});
