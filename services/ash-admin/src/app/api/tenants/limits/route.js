"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const tenant_manager_1 = require("@/lib/multi-tenant/tenant-manager");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/tenants/limits?workspace_id=xxx - Check tenant limits
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const workspace_id = searchParams.get("workspace_id");
        if (!workspace_id) {
            return server_1.NextResponse.json({ error: "workspace_id parameter required" }, { status: 400 });
        }
        const limits = await tenant_manager_1.tenantManager.checkLimits(workspace_id);
        // Calculate percentages
        const usersPercent = (limits.users.current / limits.users.max) * 100;
        const ordersPercent = (limits.orders.current_month / limits.orders.max) * 100;
        const storagePercent = (limits.storage.used_gb / limits.storage.max_gb) * 100;
        // Determine warnings
        const warnings = [];
        if (usersPercent >= 90) {
            warnings.push(`User limit almost reached (${limits.users.current}/${limits.users.max})`);
        }
    }
    finally {
    }
    if (ordersPercent >= 90) {
        warnings.push(`Monthly order limit almost reached (${limits.orders.current_month}/${limits.orders.max})`);
    }
});
if (storagePercent >= 90) {
    warnings.push(`Storage quota almost full (${limits.storage.used_gb.toFixed(2)}GB/${limits.storage.max_gb}GB)`);
}
return server_1.NextResponse.json({
    success: true,
    limits,
    usage_percentages: {
        users: Math.round(usersPercent * 100) / 100,
        orders: Math.round(ordersPercent * 100) / 100,
        storage: Math.round(storagePercent * 100) / 100,
    },
    warnings,
    needs_upgrade: warnings.length > 0,
});
try { }
catch (error) {
    console.error("Check limits error:", error);
    return server_1.NextResponse.json({ error: "Failed to check limits", details: error.message }, { status: 500 });
}
;
;
