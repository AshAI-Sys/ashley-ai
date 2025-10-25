"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("../../../lib/auth-middleware");
const audit_logger_1 = require("../../../lib/audit-logger");
// GET - Retrieve audit logs with filtering
exports.GET = (0, auth_middleware_1.requireAdmin)()(async (request, user) => {
    try {
        const { searchParams } = request.nextUrl;
        const action = searchParams.get("action") || undefined;
        const resource = searchParams.get("resource") || undefined;
        const userId = searchParams.get("userId") || undefined;
        const limit = parseInt(searchParams.get("limit") || "100");
        const offset = parseInt(searchParams.get("offset") || "0");
        const alertsOnly = searchParams.get("alertsOnly") === "true";
        // Date range filtering
        let startDate;
        let endDate;
        if (searchParams.get("startDate")) {
            startDate = new Date(searchParams.get("startDate"));
        }
        if (searchParams.get("endDate")) {
            endDate = new Date(searchParams.get("endDate"));
        }
        // If requesting security alerts
        if (alertsOnly) {
            const hours = parseInt(searchParams.get("hours") || "24");
            const alerts = await (0, audit_logger_1.getSecurityAlerts)(user.workspaceId, hours);
            return server_1.NextResponse.json({
                success: true,
                data: {
                    alerts,
                    total: alerts.length,
                },
            });
        }
        // Get regular audit logs
        const result = await (0, audit_logger_1.getAuditLogs)({
            workspaceId: user.workspaceId,
            userId,
            action,
            resource,
            limit,
            offset,
            startDate,
            endDate,
        });
        return server_1.NextResponse.json({
            success: true,
            data: {
                logs: result.logs,
                total: result.total,
                limit,
                offset,
            },
        });
    }
    catch (error) {
        console.error("Error fetching audit logs:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch audit logs" }, { status: 500 });
    }
});
