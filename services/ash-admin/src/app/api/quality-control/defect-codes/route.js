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
        const category = searchParams.get('category');
        const severity = searchParams.get('severity');
        const where = {};
        if (category && category !== 'all') {
            where.category = category;
        }
        if (severity && severity !== 'all') {
            where.severity = severity;
        }
        const defectCodes = await prisma.qCDefectCode.findMany({
            where,
            orderBy: { code: 'asc' }
        });
        return server_1.NextResponse.json(defectCodes);
    }
    catch (error) {
        console.error('Error fetching defect codes:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch defect codes' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const defectCode = await prisma.qCDefectCode.create({
            data: {
                workspace_id: data.workspace_id || 'default',
                code: data.code,
                name: data.name,
                category: data.category,
                severity: data.severity,
                description: data.description
            }
        });
        return server_1.NextResponse.json(defectCode, { status: 201 });
    }
    catch (error) {
        console.error('Error creating defect code:', error);
        return server_1.NextResponse.json({ error: 'Failed to create defect code' }, { status: 500 });
    }
}
