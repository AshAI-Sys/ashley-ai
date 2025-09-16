"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function POST(request, { params }) {
    try {
        const data = await request.json();
        // Get current sample count for this inspection
        const sampleCount = await prisma.qCSample.count({
            where: { inspection_id: params.id }
        });
        const sample = await prisma.qCSample.create({
            data: {
                workspace_id: data.workspace_id || 'default',
                inspection_id: params.id,
                sample_no: sampleCount + 1,
                sampled_from: data.sampled_from,
                unit_ref: data.unit_ref,
                qty_sampled: data.qty_sampled || 1,
                result: data.result || 'OK'
            }
        });
        return server_1.NextResponse.json(sample, { status: 201 });
    }
    catch (error) {
        console.error('Error creating sample:', error);
        return server_1.NextResponse.json({ error: 'Failed to create sample' }, { status: 500 });
    }
}
