"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.POST = exports.GET = void 0;
/* eslint-disable */
const auth_middleware_1 = require("@/lib/auth-middleware");
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
// GET /api/automation/notifications - Get notifications
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get("workspace_id") || "workspace_1";
        const status = searchParams.get("status");
        const channel = searchParams.get("channel");
        const recipientType = searchParams.get("recipient_type");
        const priority = searchParams.get("priority");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const where = { workspace_id: workspaceId };
        if (status)
            where.status = status;
        if (channel)
            where.channel = channel;
        if (recipientType)
            where.recipient_type = recipientType;
        if (priority)
            where.priority = priority;
        const [notifications, total] = await Promise.all([
            db_1.prisma.notification.findMany({
                where,
                include: {
                    template: {
                        select: { id: true, name: true, category: true },
                    },
                },
                orderBy: { created_at: "desc" },
                take: limit,
                skip: offset,
            }),
            db_1.prisma.notification.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: notifications,
            meta: {
                total,
                limit,
                offset,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
    }
});
// POST /api/automation/notifications - Create notification
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const body = await request.json();
        const { workspace_id = "workspace_1", template_id, recipient_type, recipient_id, recipient_email, recipient_phone, channel, subject, content, variables_data, priority = "MEDIUM", scheduled_for, } = body;
        // Validate required fields
        if (!recipient_type || !channel || !content) {
            return server_1.NextResponse.json({
                success: false,
                error: "Missing required fields: recipient_type, channel, content",
            }, { status: 400 });
        }
        // If using template, populate content from template
        let finalSubject = subject;
        let finalContent = content;
        if (template_id) {
            const template = await db_1.prisma.notificationTemplate.findUnique({
                where: { id: template_id },
            });
            if (template) {
                finalSubject = interpolateTemplate(template.subject_template || "", variables_data);
                finalContent = interpolateTemplate(template.body_template, variables_data);
            }
        }
        const notification = await db_1.prisma.notification.create({
            data: {
                workspace_id,
                template_id,
                recipient_type,
                recipient_id,
                recipient_email,
                recipient_phone,
                channel,
                subject: finalSubject,
                content: finalContent,
                variables_data: variables_data ? JSON.stringify(variables_data) : null,
                priority,
                scheduled_for: scheduled_for ? new Date(scheduled_for) : null,
                status: "PENDING",
            },
            include: {
                template: {
                    select: { id: true, name: true, category: true },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: notification,
            message: "Notification created successfully",
        });
    }
    catch (error) {
        console.error("Error creating notification:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 });
    }
});
// PUT /api/automation/notifications - Update notification status
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const body = await request.json();
        const { id, status, error_message, sent_at, delivered_at } = body;
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 });
        }
        const updateData = {};
        if (status) {
            updateData.status = status;
        }
        if (status === "SENT" && sent_at) {
            updateData.sent_at = new Date(sent_at);
        }
        if (status === "DELIVERED" && delivered_at) {
            updateData.delivered_at = new Date(delivered_at);
        }
        if (status === "FAILED") {
            updateData.retry_count = { increment: 1 };
            if (error_message) {
                updateData.error_message = error_message;
            }
        }
        const notification = await db_1.prisma.notification.update({
            where: { id },
            data: updateData,
        });
        return server_1.NextResponse.json({
            success: true,
            data: notification,
            message: "Notification updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating notification:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 });
    }
});
// Helper function to interpolate template variables
function interpolateTemplate(template, variables) {
    if (!template || !variables)
        return template;
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const value = getNestedValue(variables, path);
        return value !== undefined ? String(value) : match;
    });
}
function getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
}
