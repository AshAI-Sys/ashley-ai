"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const db_1 = require("../../../../../lib/db");
async function POST(request, { params }) {
    try {
        const data = await request.json();
        // Verify carton exists and is open
        const carton = await db_1.prisma.carton.findUnique({
            where: { id: params.id },
            include: {
                contents: true
            }
        });
        if (!carton) {
            return server_1.NextResponse.json({ error: 'Carton not found' }, { status: 404 });
        }
        if (carton.status !== 'OPEN') {
            return server_1.NextResponse.json({ error: 'Carton is not open for packing' }, { status: 400 });
        }
        // Check capacity constraints
        const currentUnits = carton.contents.reduce((sum, content) => sum + content.quantity, 0);
        const maxCapacity = data.max_capacity || 50; // Default max units per carton
        if (currentUnits + data.quantity > maxCapacity) {
            return server_1.NextResponse.json({
                error: `Cannot add ${data.quantity} units. Carton capacity: ${maxCapacity}, current: ${currentUnits}`
            }, { status: 400 });
        }
        // Add finished units to carton
        const cartonContent = await db_1.prisma.cartonContent.create({
            data: {
                carton_id: params.id,
                finished_unit_id: data.finished_unit_id,
                quantity: data.quantity,
                packed_at: new Date()
            },
            include: {
                finished_unit: {
                    select: { sku: true, size_code: true, color: true, unit_serial: true }
                }
            }
        });
        // Update finished unit status
        await db_1.prisma.finishedUnit.updateMany({
            where: { id: data.finished_unit_id },
            data: { status: 'PACKED' }
        });
        return server_1.NextResponse.json(cartonContent, { status: 201 });
    }
    catch (error) {
        console.error('Error adding content to carton:', error);
        return server_1.NextResponse.json({ error: 'Failed to add content to carton' }, { status: 500 });
    }
}
async function GET(request, { params }) {
    try {
        const contents = await db_1.prisma.cartonContent.findMany({
            where: { carton_id: params.id },
            include: {
                finished_unit: {
                    select: {
                        sku: true,
                        size_code: true,
                        color: true,
                        unit_serial: true,
                        order: { select: { order_number: true } }
                    }
                }
            },
            orderBy: { packed_at: 'asc' }
        });
        return server_1.NextResponse.json(contents);
    }
    catch (error) {
        console.error('Error fetching carton contents:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch carton contents' }, { status: 500 });
    }
}
async function DELETE(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const contentId = searchParams.get('content_id');
        if (!contentId) {
            return server_1.NextResponse.json({ error: 'content_id is required' }, { status: 400 });
        }
        // Get content details before deletion
        const content = await db_1.prisma.cartonContent.findUnique({
            where: { id: contentId },
            include: { finished_unit: true }
        });
        if (!content) {
            return server_1.NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }
        // Remove content from carton
        await db_1.prisma.cartonContent.delete({
            where: { id: contentId }
        });
        // Update finished unit status back to FINISHED
        await db_1.prisma.finishedUnit.update({
            where: { id: content.finished_unit_id },
            data: { status: 'FINISHED' }
        });
        return server_1.NextResponse.json({ message: 'Content removed from carton' });
    }
    catch (error) {
        console.error('Error removing content from carton:', error);
        return server_1.NextResponse.json({ error: 'Failed to remove content from carton' }, { status: 500 });
    }
}
