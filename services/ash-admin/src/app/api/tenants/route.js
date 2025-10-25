"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const tenant_manager_1 = require("@/lib/multi-tenant/tenant-manager");
const auth_middleware_1 = require("@/lib/auth-middleware");
// POST /api/tenants - Create new tenant workspace
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const { name, slug, subscription_tier = "FREE", max_users = 5, max_orders_per_month = 50, features_enabled = [], storage_quota_gb = 5, custom_domain, branding, } = await req.json();
        if (!name || !slug) {
            return server_1.NextResponse.json({ error: "name and slug are required" }, { status: 400 });
        }
        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            return server_1.NextResponse.json({
                error: "Slug must contain only lowercase letters, numbers, and hyphens",
            }, { status: 400 });
        }
        const result = await tenant_manager_1.tenantManager.createTenant({
            name,
            slug,
            subscription_tier,
            max_users,
            max_orders_per_month,
            features_enabled,
            storage_quota_gb,
            custom_domain,
            branding,
            return: server_1.NextResponse.json({
                success: true,
                ...result,
                message: "Tenant created successfully",
            }, { status: 201 })
        });
        try { }
        catch (error) {
            console.error("Create tenant error:", error);
            return server_1.NextResponse.json({ error: "Failed to create tenant", details: error.message }, { status: 500 });
        }
        // GET /api/tenants?workspace_id=xxx - Get tenant information
        export const GET = (0, auth_middleware_1.requireAuth)(async (req, user) => {
            try {
                const searchParams = req.nextUrl.searchParams;
                const workspace_id = searchParams.get("workspace_id");
                if (!workspace_id) {
                    return server_1.NextResponse.json({ error: "workspace_id parameter required" }, { status: 400 });
                }
                const config = await tenant_manager_1.tenantManager.getTenantConfig(workspace_id);
                if (!config) {
                    return server_1.NextResponse.json({ error: "Workspace not found" }, { status: 404 });
                }
                const limits = await tenant_manager_1.tenantManager.checkLimits(workspace_id);
                const stats = await tenant_manager_1.tenantManager.getTenantStats(workspace_id);
                return server_1.NextResponse.json({
                    success: true,
                    config,
                    limits,
                    stats,
                });
                try { }
                catch (error) {
                    console.error("Get tenant error:", error);
                    return server_1.NextResponse.json({ error: "Failed to get tenant", details: error.message }, { status: 500 });
                }
                // PUT /api/tenants - Update tenant configuration
                export const PUT = (0, auth_middleware_1.requireAuth)(async (req, user) => {
                    try {
                        const { workspace_id, ...updates } = await req.json();
                        if (!workspace_id) {
                            return server_1.NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
                        }
                        const success = await tenant_manager_1.tenantManager.updateTenantConfig(workspace_id, updates);
                        if (!success) {
                            return server_1.NextResponse.json({ error: "Failed to update tenant configuration" }, { status: 500 });
                        }
                        return server_1.NextResponse.json({
                            success: true,
                            message: "Tenant configuration updated",
                        });
                        try { }
                        catch (error) {
                            console.error("Update tenant error:", error);
                            return server_1.NextResponse.json({ error: "Failed to update tenant", details: error.message }, { status: 500 });
                        }
                        // DELETE /api/tenants?workspace_id=xxx&confirmation=slug - Delete tenant
                        export const DELETE = (0, auth_middleware_1.requireAuth)(async (req, user) => {
                            try {
                                const searchParams = req.nextUrl.searchParams;
                                const workspace_id = searchParams.get("workspace_id");
                                const confirmation = searchParams.get("confirmation");
                                if (!workspace_id || !confirmation) {
                                    return server_1.NextResponse.json({ error: "workspace_id and confirmation (slug) are required" }, { status: 400 });
                                }
                                const success = await tenant_manager_1.tenantManager.deleteTenant(workspace_id, confirmation);
                                if (!success) {
                                    return server_1.NextResponse.json({ error: "Failed to delete tenant" }, { status: 500 });
                                }
                            }
                            finally {
                            }
                            return server_1.NextResponse.json({
                                success: true,
                                message: "Tenant deleted successfully",
                            });
                            try { }
                            catch (error) {
                                console.error("Delete tenant error:", error);
                                return server_1.NextResponse.json({ error: "Failed to delete tenant", details: error.message }, { status: 400 });
                            }
                        });
                    }
                    finally { }
                });
            }
            finally { }
        });
    }
    finally { }
});
;
;
;
