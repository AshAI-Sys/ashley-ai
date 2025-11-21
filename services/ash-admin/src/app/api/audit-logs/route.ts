import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth-middleware";
import { getAuditLogs, getSecurityAlerts } from "../../../lib/audit-logger";
import { createErrorResponse } from '@/lib/error-sanitization';

export const dynamic = 'force-dynamic';


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

    const startDateParam = searchParams.get("startDate");
    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    const endDateParam = searchParams.get("endDate");
    if (endDateParam) {
      endDate = new Date(endDateParam);
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
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});
