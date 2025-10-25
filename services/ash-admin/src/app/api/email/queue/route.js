"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const queue_1 = require("@/lib/email/queue");
const auth_middleware_1 = require("@/lib/auth-middleware");
/**
 * GET /api/email/queue - Get queue statistics
 */
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const stats = await queue_1.emailQueue.getStats();
        return server_1.NextResponse.json({
            success: true,
            stats,
        });
    }
    catch (error) {
        console.error("Error getting email queue stats:", error);
        return server_1.NextResponse.json({ error: "Failed to get queue statistics", details: error.message }, { status: 500 });
    }
});
/**
 * POST /api/email/queue - Send email (add to queue)
 */
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { type, to, data, scheduledFor, maxAttempts } = await request.json();
        if (!type || !to) {
            return server_1.NextResponse.json({ error: "type and to are required" }, { status: 400 });
        }
        const jobId = await queue_1.emailQueue.enqueue(type, to, data, {
            scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
            maxAttempts,
        });
        return server_1.NextResponse.json({
            success: true,
            jobId,
            message: "Email queued for delivery",
        });
    }
    catch (error) {
        console.error("Error queueing email:", error);
        return server_1.NextResponse.json({ error: "Failed to queue email", details: error.message }, { status: 500 });
    }
});
