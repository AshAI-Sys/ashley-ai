"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// GET /api/bundles/scan?code=BUNDLE-XXX - Scan bundle QR code
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const workspaceId = req.headers.get("x-workspace-id") || "default-workspace";
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        if (!code) {
            return server_1.NextResponse.json({ success: false, error: "QR code is required" }, { status: 400 });
        }
        // Look up bundle by QR code
        const bundle = await prisma.bundle.findFirst({
            where: {
                workspace_id: workspaceId,
                qr_code: code,
            },
            include: {
                lay: {
                    include: {
                        order: {
                            select: {
                                order_number: true,
                                client: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!bundle) {
            return server_1.NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
        }
        // Log scan event would go here if BundleScanLog model existed
        console.log(`Bundle ${bundle.qr_code} scanned at Production Floor`);
        return server_1.NextResponse.json({
            success: true,
            bundle: {
                id: bundle.id,
                qr_code: bundle.qr_code,
                quantity: bundle.qty,
                status: bundle.status,
                order: bundle.lay?.order,
                size_code: bundle.size_code,
                created_at: bundle.created_at,
            },
        });
    }
    catch (error) {
        console.error("Bundle scan error:", error);
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
