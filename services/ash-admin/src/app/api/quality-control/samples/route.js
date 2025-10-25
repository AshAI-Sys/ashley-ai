"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const data = await request.json();
        const sample = await db_1.prisma.qCSample.create({
            data: {
                workspace_id: data.workspace_id || "default",
                inspection_id: data.inspection_id,
                sample_no: data.sample_no,
                sampled_from: data.sampled_from || data.bundle_ref, // Support both field names
                unit_ref: data.unit_ref,
                qty_sampled: data.qty_sampled,
                defects_found: data.defects_found || 0,
                result: data.result || data.pass_fail || "OK", // Changed from pass_fail to result
                sample_data: data.sample_data ? JSON.stringify(data.sample_data) : null,
                sampled_at: new Date(),
            },
        });
        return server_1.NextResponse.json(sample, { status: 201 });
    }
    catch (error) {
        console.error("Error creating sample:", error);
        return server_1.NextResponse.json({ error: "Failed to create sample" }, { status: 500 });
    }
});
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const inspectionId = searchParams.get("inspection_id");
        if (!inspectionId) {
            return server_1.NextResponse.json({ error: "inspection_id is required" }, { status: 400 });
        }
        const samples = await db_1.prisma.qCSample.findMany({
            where: { inspection_id: inspectionId },
            include: {
                defects: {
                    include: {
                        defect_code: true,
                    },
                },
            },
            orderBy: { sample_no: "asc" },
        });
        return server_1.NextResponse.json(samples);
    }
    catch (error) {
        console.error("Error fetching samples:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch samples" }, { status: 500 });
    }
});
