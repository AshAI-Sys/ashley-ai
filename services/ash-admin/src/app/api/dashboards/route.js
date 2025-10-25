"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// GET /api/dashboards - List all dashboards
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const workspaceId = req.headers.get("x-workspace-id") || "default-workspace";
        const url = new URL(req.url);
        const type = url.searchParams.get("type");
        const where = { workspace_id: workspaceId, is_active: true };
        if (type)
            where.dashboard_type = type;
        const dashboards = await prisma.executiveDashboard.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                widgets_data: true,
            },
            orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
        });
        return server_1.NextResponse.json({
            success: true,
            dashboards: dashboards.map(d => ({
                ...d,
                layout: JSON.parse(d.layout),
                widgets: JSON.parse(d.widgets),
                widgets_data: d.widgets_data.map(w => ({
                    ...w,
                    query_params: w.query_params ? JSON.parse(w.query_params) : null,
                    visualization: JSON.parse(w.visualization),
                    position: JSON.parse(w.position),
                })),
            })),
        });
    }
    catch (error) {
        console.error("Error fetching dashboards:", error);
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
// POST /api/dashboards - Create new dashboard
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, user) => {
    try {
        const workspaceId = req.headers.get("x-workspace-id") || "default-workspace";
        const userId = req.headers.get("x-user-id") || "system";
        const body = await req.json();
        const { name, description, dashboard_type, layout, widgets, refresh_interval, is_default, } = body;
        if (!name || !dashboard_type || !layout || !widgets) {
            return server_1.NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }
        const dashboard = await prisma.executiveDashboard.create({
            data: {
                workspace_id: workspaceId,
                name,
                description,
                dashboard_type,
                layout: JSON.stringify(layout),
                widgets: JSON.stringify(widgets),
                refresh_interval: refresh_interval || 300,
                is_default: is_default || false,
                created_by: userId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            dashboard: {
                ...dashboard,
                layout: JSON.parse(dashboard.layout),
                widgets: JSON.parse(dashboard.widgets),
            },
        });
    }
    catch (error) {
        console.error("Error creating dashboard:", error);
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
