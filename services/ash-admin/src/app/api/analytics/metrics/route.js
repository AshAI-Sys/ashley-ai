"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const metrics_1 = require("@/lib/analytics/metrics");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const workspace_id = user.workspaceId;
        const metrics = await (0, metrics_1.getAllMetrics)(workspace_id);
        return server_1.NextResponse.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error fetching analytics metrics:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch metrics", details: error.message }, { status: 500 });
    }
});
