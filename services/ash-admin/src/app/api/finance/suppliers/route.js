"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("../../../lib/db");
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const where = {};
        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive'
            };
        }
        const suppliers = await db_1.prisma.supplier.findMany({
            where,
            include: {
                _count: {
                    select: {
                        bills: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        return server_1.NextResponse.json({
            success: true,
            data: suppliers
        });
    }
    catch (error) {
        console.error('Error fetching suppliers:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch suppliers' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const { name, tin, emails, phones, address } = data;
        const supplier = await db_1.prisma.supplier.create({
            data: {
                workspace_id: 'default',
                name,
                tin,
                emails: emails || {},
                phones: phones || {},
                address: address || {}
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: supplier
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating supplier:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create supplier' }, { status: 500 });
    }
}
