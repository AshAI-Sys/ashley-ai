import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "../../../lib/auth-middleware";
import { getAuditLogs, getSecurityAlerts } from "../../../lib/audit-logger";

// GET - Retrieve audit logs with filtering
export const GET = requireAdmin()(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = request.nextUrl;

    const action = searchParams.get("action") || undefined;
    const resource = searchParams.get("resource") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const alertsOnly = searchParams.get("alertsOnly") === "true";

    // Date range filtering
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (searchParams.get("startDate")) {
      startDate = new Date(searchParams.get("startDate")!);
    }
    if (searchParams.get("endDate")) {
      endDate = new Date(searchParams.get("endDate")!);
    }

    // If requesting security alerts
    if (alertsOnly) {
      const hours = parseInt(searchParams.get("hours") || "24");
      const alerts = await getSecurityAlerts(user.workspaceId, hours);

      return NextResponse.json({
        success: true,
        data: {
          alerts,
          total: alerts.length,
        },
      });
    }

    // Get regular audit logs
    const result = await getAuditLogs({
      workspaceId: user.workspaceId,
      userId,
      action,
      resource,
      limit,
      offset,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      data: {
        logs: result.logs,
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
});
