"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
const server_1 = require("next/server");
const db_1 = require("../../../../../lib/db");
async function GET(request, { params }) {
    try {
        const inspection = await db_1.prisma.qCInspection.findUnique({
            where: { id: params.id },
            include: {
                order: { select: { order_number: true } },
                bundle: { select: { qr_code: true, size_code: true, qty: true } },
                checklist: true,
                inspector: { select: { first_name: true, last_name: true } },
                samples: {
                    include: {
                        defects: {
                            include: {
                                defect_code: true
                            }
                        }
                    }
                },
                defects: {
                    include: {
                        defect_code: true,
                        sample: true
                    }
                },
                capa_tasks: true
            }
        });
        if (!inspection) {
            return server_1.NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
        }
        return server_1.NextResponse.json(inspection);
    }
    catch (error) {
        console.error('Error fetching inspection:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch inspection' }, { status: 500 });
    }
}
async function PUT(request, { params }) {
    try {
        const data = await request.json();
        const inspection = await db_1.prisma.qCInspection.update({
            where: { id: params.id },
            data: {
                ...data,
                updated_at: new Date()
            },
            include: {
                order: { select: { order_number: true } },
                inspector: { select: { first_name: true, last_name: true } }
            }
        });
        return server_1.NextResponse.json(inspection);
    }
    catch (error) {
        console.error('Error updating inspection:', error);
        return server_1.NextResponse.json({ error: 'Failed to update inspection' }, { status: 500 });
    }
}
