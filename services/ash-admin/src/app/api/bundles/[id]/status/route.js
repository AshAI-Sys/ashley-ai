"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// PUT /api/bundles/[id]/status - Update bundle status
exports.PUT = (0, auth_middleware_1.requireAuth)(async (req, user, context) => {
    try {
        const workspaceId = user.workspaceId;
        const userId = user.id;
        const body = await req.json();
        const { status, notes, location } = body;
        if (!status) {
            return server_1.NextResponse.json({ success: false, error: "Status is required" }, { status: 400 });
        }
        // Verify bundle exists
        const bundle = await prisma.bundle.findFirst({
            where: {
                id: context.params.id,
                workspace_id: workspaceId,
            },
        });
        if (!bundle) {
            return server_1.NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
        }
        // Update bundle status
        const updatedBundle = await prisma.bundle.update({
            where: { id: context.params.id },
            data: {
                status,
                updated_at: new Date(),
            },
            include: {
                order: {
                    select: {
                        order_number: true,
                    },
                },
            },
        });
        // Create status history log
        try {
            await prisma.bundleStatusHistory.create({
                data: {
                    workspace_id: workspaceId,
                    bundle_id: context.params.id,
                    old_status: bundle.status,
                    new_status: status,
                    changed_by: userId,
                    notes,
                    location,
                    changed_at: new Date(),
                },
            });
        }
        catch (err) {
            // Ignore if BundleStatusHistory table doesn't exist
            console.log("Bundle status history logging skipped");
        }
        return server_1.NextResponse.json({
            success: true,
            bundle: updatedBundle,
            message: `Bundle status updated to ${status}`,
        });
    }
    catch (error) {
        console.error("Bundle status update error:", error);
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
