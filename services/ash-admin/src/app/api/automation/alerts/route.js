"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.POST = exports.GET = void 0;
/* eslint-disable */
const auth_middleware_1 = require("@/lib/auth-middleware");
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
// GET /api/automation/alerts - Get alerts
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get("workspace_id") || "workspace_1";
        const alertType = searchParams.get("alert_type");
        const severity = searchParams.get("severity");
        const isAcknowledged = searchParams.get("is_acknowledged");
        const isResolved = searchParams.get("is_resolved");
        const sourceType = searchParams.get("source_type");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const where = { workspace_id: workspaceId };
        if (alertType)
            where.alert_type = alertType;
        if (severity)
            where.severity = severity;
        if (isAcknowledged !== null)
            where.is_acknowledged = isAcknowledged === "true";
        if (isResolved !== null)
            where.is_resolved = isResolved === "true";
        if (sourceType)
            where.source_type = sourceType;
        const [alerts, total] = await Promise.all([
            db_1.prisma.alert.findMany({
                where,
                include: {
                    acknowledged_user: {
                        select: { id: true, email: true, username: true },
                    },
                    resolved_user: {
                        select: { id: true, email: true, username: true },
                    },
                },
                orderBy: [
                    { is_resolved: "asc" },
                    { severity: "desc" },
                    { created_at: "desc" },
                ],
                take: limit,
                skip: offset,
            }),
            db_1.prisma.alert.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: alerts,
            meta: {
                total,
                limit,
                offset,
                pages: Math.ceil(total / limit),
                summary: await getAlertSummary(workspaceId),
            },
        });
    }
    catch (error) {
        console.error("Error fetching alerts:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 });
    }
});
// POST /api/automation/alerts - Create alert
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const body = await request.json();
        const { workspace_id = "workspace_1", alert_type, severity = "MEDIUM", title, description, source_type = "SYSTEM", source_id, threshold_value, current_value, } = body;
        // Validate required fields
        if (!alert_type || !title || !description) {
            return server_1.NextResponse.json({
                success: false,
                error: "Missing required fields: alert_type, title, description",
            }, { status: 400 });
        }
        // Calculate next escalation time based on severity
        const escalationMinutes = getEscalationDelay(severity);
        const nextEscalationAt = new Date(Date.now() + escalationMinutes * 60 * 1000);
        const alert = await db_1.prisma.alert.create({
            data: {
                workspace_id,
                alert_type,
                severity,
                title,
                description,
                source_type,
                source_id,
                threshold_value,
                current_value,
                next_escalation_at: nextEscalationAt,
            },
        });
        // Trigger automatic notification for high/critical alerts
        if (severity === "HIGH" || severity === "CRITICAL") {
            await createAlertNotification(alert);
        }
        return server_1.NextResponse.json({
            success: true,
            data: alert,
            message: "Alert created successfully",
        });
    }
    catch (error) {
        console.error("Error creating alert:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create alert" }, { status: 500 });
    }
});
// PUT /api/automation/alerts - Update alert (acknowledge/resolve)
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const body = await request.json();
        const { id, action, user_id = "user_1", resolution_notes } = body;
        if (!id || !action) {
            return server_1.NextResponse.json({ success: false, error: "Alert ID and action are required" }, { status: 400 });
        }
        const updateData = {};
        const now = new Date();
        switch (action) {
            case "acknowledge":
                updateData.is_acknowledged = true;
                updateData.acknowledged_by = user_id;
                updateData.acknowledged_at = now;
                break;
            case "resolve":
                updateData.is_resolved = true;
                updateData.resolved_by = user_id;
                updateData.resolved_at = now;
                if (resolution_notes) {
                    updateData.resolution_notes = resolution_notes;
                }
                break;
            case "escalate":
                updateData.escalation_level = { increment: 1 };
                const currentAlert = await db_1.prisma.alert.findUnique({ where: { id } });
                if (currentAlert) {
                    const escalationMinutes = getEscalationDelay(currentAlert.severity, currentAlert.escalation_level + 1);
                    updateData.next_escalation_at = new Date(Date.now() + escalationMinutes * 60 * 1000);
                }
                break;
            default:
                return server_1.NextResponse.json({
                    success: false,
                    error: "Invalid action. Use: acknowledge, resolve, or escalate",
                }, { status: 400 });
        }
        const alert = await db_1.prisma.alert.update({
            where: { id },
            data: updateData,
            include: {
                acknowledged_user: {
                    select: { id: true, email: true, username: true },
                },
                resolved_user: {
                    select: { id: true, email: true, username: true },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: alert,
            message: `Alert ${action}d successfully`,
        });
    }
    catch (error) {
        console.error("Error updating alert:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 });
    }
});
// DELETE /api/automation/alerts - Delete alert
exports.DELETE = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: "Alert ID is required" }, { status: 400 });
        }
        await db_1.prisma.alert.delete({
            where: { id },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Alert deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting alert:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to delete alert" }, { status: 500 });
    }
});
// Helper functions
async function getAlertSummary(workspaceId) {
    const summary = await db_1.prisma.alert.groupBy({
        by: ["severity", "is_resolved"],
        where: { workspace_id: workspaceId },
        _count: { id: true },
    });
    const result = {
        total: 0,
        unresolved: 0,
        by_severity: {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            CRITICAL: 0,
        },
    };
    summary.forEach(group => {
        result.total += group._count.id;
        if (!group.is_resolved) {
            result.unresolved += group._count.id;
        }
        result.by_severity[group.severity] +=
            group._count.id;
    });
    return result;
}
function getEscalationDelay(severity, escalationLevel = 1) {
    const baseDelays = {
        LOW: 240, // 4 hours
        MEDIUM: 120, // 2 hours
        HIGH: 60, // 1 hour
        CRITICAL: 30, // 30 minutes
    };
    const baseDelay = baseDelays[severity] || baseDelays.MEDIUM;
    // Reduce delay for higher escalation levels
    return Math.max(baseDelay / escalationLevel, 15); // Minimum 15 minutes
}
async function createAlertNotification(alert) {
    try {
        await db_1.prisma.notification.create({
            data: {
                workspace_id: alert.workspace_id,
                recipient_type: "USER",
                channel: "EMAIL",
                subject: `${alert.severity} Alert: ${alert.title}`,
                content: `Alert Details:

Type: ${alert.alert_type}
Severity: ${alert.severity}
Title: ${alert.title}
Description: ${alert.description}

Please acknowledge this alert in the system.`,
                priority: alert.severity === "CRITICAL" ? "URGENT" : "HIGH",
                status: "PENDING",
            },
        });
    }
    catch (error) {
        console.error("Error creating alert notification:", error);
    }
}
