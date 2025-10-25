"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PATCH = PATCH;
const server_1 = require("next/server");
const database_1 = require("@ash-ai/database");
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma = database_1.db;
async function getClientFromToken(request) {
    try {
        const token = request.cookies.get("portal-token")?.value;
        if (!token) {
            return null;
        }
        const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
        const payload = (0, jsonwebtoken_1.verify)(token, jwtSecret);
        return payload;
    }
    catch (error) {
        return null;
    }
}
async function GET(request) {
    try {
        const client = await getClientFromToken(request);
        if (!client) {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get("unread") === "true";
        const limit = parseInt(searchParams.get("limit") || "20");
        const where = {
            workspace_id: client.workspaceId,
            client_id: client.clientId,
        };
        if (unreadOnly) {
            where.is_read = false;
        }
        // Get notifications
        const notifications = await prisma.clientNotification.findMany({
            where,
            orderBy: { created_at: "desc" },
            take: limit,
        });
        // Get unread count
        const unreadCount = await prisma.clientNotification.count({
            where: {
                workspace_id: client.workspaceId,
                client_id: client.clientId,
                is_read: false,
            },
        });
        return server_1.NextResponse.json({
            notifications,
            unreadCount,
        });
    }
    catch (error) {
        console.error("Notifications fetch error:", error);
        return server_1.NextResponse.json({
            error: "Failed to fetch notifications",
        }, { status: 500 });
    }
}
async function PATCH(request) {
    try {
        const client = await getClientFromToken(request);
        if (!client) {
            return server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { notificationIds, markAsRead } = await request.json();
        if (!Array.isArray(notificationIds)) {
            return server_1.NextResponse.json({ error: "Invalid notification IDs" }, { status: 400 });
        }
        // Update notifications
        await prisma.clientNotification.updateMany({
            where: {
                id: { in: notificationIds },
                workspace_id: client.workspaceId,
                client_id: client.clientId,
            },
            data: {
                is_read: markAsRead,
                ...(markAsRead && { read_at: new Date() }),
            },
        });
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Notification update error:", error);
        return server_1.NextResponse.json({
            error: "Failed to update notifications",
        }, { status: 500 });
    }
}
