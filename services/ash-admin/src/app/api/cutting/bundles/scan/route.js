"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const qrCode = searchParams.get("qrCode");
        if (!qrCode) {
            return server_1.NextResponse.json({ success: false, error: "QR code is required" }, { status: 400 });
        }
        const bundle = await db_1.prisma.bundle.findUnique({
            where: { qr_code: qrCode },
            include: {
                order: {
                    select: {
                        id: true,
                        order_number: true,
                        client: {
                            select: {
                                name: true,
                            },
                        },
                        brand: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                lay: {
                    select: {
                        id: true,
                        marker_name: true,
                        lay_length_m: true,
                        plies: true,
                    },
                },
                _count: {
                    select: {
                        sewing_runs: true,
                    },
                },
            },
        });
        if (!bundle) {
            return server_1.NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
        }
        return server_1.NextResponse.json({
            success: true,
            bundle,
        });
    }
    catch (error) {
        console.error("Error scanning bundle:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to scan bundle" }, { status: 500 });
    }
});
