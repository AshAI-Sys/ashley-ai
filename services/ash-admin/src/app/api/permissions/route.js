"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const permission_manager_1 = require("@/lib/rbac/permission-manager");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/permissions - Get all available permissions
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const user_id = searchParams.get("user_id");
        const action = searchParams.get("action"); // 'list' | 'user' | 'roles'
        if (action === "roles") {
            const roles = permission_manager_1.permissionManager.getAvailableRoles();
        }
        return server_1.NextResponse.json({
            success: true,
            roles,
        });
        if (action === "user" && user_id) {
            const userPermissions = await permission_manager_1.permissionManager.getUserPermissions(user_id);
        }
        return server_1.NextResponse.json({
            success: true,
            user_permissions: userPermissions,
        });
        // Default: return all system permissions
        const permissions = permission_manager_1.permissionManager.getAllPermissions();
        return server_1.NextResponse.json({
            success: true,
            permissions,
            total: permissions.length,
        });
    }
    catch (error) {
        console.error("Get permissions error:", error);
        return server_1.NextResponse.json({ error: "Failed to get permissions", details: error.message }, { status: 500 });
    }
    // POST /api/permissions/check - Check if user has permission
    export const POST = (0, auth_middleware_1.requireAuth)(async (req, user) => {
        try {
            const { user_id, resource, action } = await req.json();
            if (!user_id || !resource || !action) {
                return server_1.NextResponse.json({ error: "user_id, resource, and action are required" }, { status: 400 });
            }
            const hasPermission = await permission_manager_1.permissionManager.hasPermission(user_id, resource, action);
            return server_1.NextResponse.json({
                success: true,
                has_permission: hasPermission,
                user_id,
                resource,
                action,
            });
            try { }
            catch (error) {
                console.error("Check permission error:", error);
                return server_1.NextResponse.json({ error: "Failed to check permission", details: error.message }, { status: 500 });
            }
        }
        finally { }
    });
});
;
