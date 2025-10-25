"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const branding_manager_1 = require("@/lib/white-label/branding-manager");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/branding?workspace_id=xxx - Get branding configuration
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const workspace_id = searchParams.get("workspace_id");
        const format = searchParams.get("format"); // 'json' | 'css' | 'preview'
        if (!workspace_id) {
            return server_1.NextResponse.json({ error: "workspace_id parameter required" }, { status: 400 });
        }
        const branding = await branding_manager_1.brandingManager.getBranding(workspace_id);
        // Return in requested format
        switch (format) {
            case "css":
                const css = branding_manager_1.brandingManager.generateCSSVariables(branding);
                return new server_1.NextResponse(css, {
                    headers: {
                        "Content-Type": "text/css",
                    },
                });
            case "preview":
                const html = branding_manager_1.brandingManager.generatePreviewHTML(branding);
                return new server_1.NextResponse(html, {
                    headers: {
                        "Content-Type": "text/html",
                    },
                });
            case "json":
            default:
                return server_1.NextResponse.json({
                    success: true,
                    branding,
                });
        }
    }
    catch (error) {
        console.error("Get branding error:", error);
        return server_1.NextResponse.json({ error: "Failed to get branding", details: error.message }, { status: 500 });
    }
});
// PUT /api/branding - Update branding configuration
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const { workspace_id, ...updates } = await req.json();
        if (!workspace_id) {
            return server_1.NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
        }
        const success = await branding_manager_1.brandingManager.updateBranding(workspace_id, updates);
        if (!success) {
            return server_1.NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
        }
        // Get updated branding
        const branding = await branding_manager_1.brandingManager.getBranding(workspace_id);
        return server_1.NextResponse.json({
            success: true,
            message: "Branding updated successfully",
            branding,
        });
    }
    catch (error) {
        console.error("Update branding error:", error);
        return server_1.NextResponse.json({ error: "Failed to update branding", details: error.message }, { status: 500 });
    }
});
