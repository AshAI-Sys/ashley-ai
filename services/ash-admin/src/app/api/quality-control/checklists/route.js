"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productType = searchParams.get('product_type');
        const method = searchParams.get('method');
        const where = {};
        if (productType && productType !== 'all') {
            where.product_type = productType;
        }
        if (method && method !== 'all') {
            where.method = method;
        }
        const checklists = await prisma.qCChecklist.findMany({
            where,
            orderBy: { name: 'asc' }
        });
        return server_1.NextResponse.json(checklists);
    }
    catch (error) {
        console.error('Error fetching checklists:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch checklists' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const checklist = await prisma.qCChecklist.create({
            data: {
                workspace_id: data.workspace_id || 'default',
                name: data.name,
                product_type: data.product_type,
                method: data.method,
                items: JSON.stringify(data.items)
            }
        });
        return server_1.NextResponse.json(checklist, { status: 201 });
    }
    catch (error) {
        console.error('Error creating checklist:', error);
        return server_1.NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 });
    }
}
