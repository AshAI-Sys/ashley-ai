"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
async function POST(request, { params }) {
    try {
        const data = await request.json();
        // Get current sample count for this inspection
        const sampleCount = await db_1.prisma.qCSample.count({
            where: { inspection_id: params.id },
        });
        const sample = await db_1.prisma.qCSample.create({
            data: {
                workspace_id: data.workspace_id || "default",
                inspection_id: params.id,
                sample_no: sampleCount + 1,
                sampled_from: data.sampled_from,
                unit_ref: data.unit_ref,
                qty_sampled: data.qty_sampled || 1,
                result: data.result || "OK",
            },
        });
        return server_1.NextResponse.json(sample, { status: 201 });
    }
    catch (error) {
        console.error("Error creating sample:", error);
        return server_1.NextResponse.json({ error: "Failed to create sample" }, { status: 500 });
    }
}
;
