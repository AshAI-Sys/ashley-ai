"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const inspectionId = searchParams.get('inspection_id');
        const where = {};
        if (inspectionId) {
            where.inspection_id = inspectionId;
        }
        const defects = await db_1.prisma.qCDefect.findMany({
            where,
            include: {
                defect_code: true,
                sample: true,
                operator: {
                    select: { first_name: true, last_name: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        return server_1.NextResponse.json(defects);
    }
    catch (error) {
        console.error('Error fetching defects:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch defects' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const defect = await db_1.prisma.qCDefect.create({
            data: {
                workspace_id: data.workspace_id || 'default',
                inspection_id: data.inspection_id,
                sample_id: data.sample_id,
                defect_code_id: data.defect_code_id,
                defect_type_id: data.defect_type_id,
                quantity: data.quantity || 1,
                severity: data.severity,
                location: data.location,
                description: data.description,
                photo_url: data.photo_url,
                operator_id: data.operator_id,
                root_cause: data.root_cause
            },
            include: {
                defect_code: true,
                sample: true
            }
        });
        // Update inspection defect counts
        await updateInspectionDefectCounts(data.inspection_id);
        return server_1.NextResponse.json(defect, { status: 201 });
    }
    catch (error) {
        console.error('Error creating defect:', error);
        return server_1.NextResponse.json({ error: 'Failed to create defect' }, { status: 500 });
    }
}
async function updateInspectionDefectCounts(inspectionId) {
    const defects = await db_1.prisma.qCDefect.findMany({
        where: { inspection_id: inspectionId },
        select: { severity: true, quantity: true }
    });
    const criticalFound = defects
        .filter(d => d.severity === 'CRITICAL')
        .reduce((sum, d) => sum + d.quantity, 0);
    const majorFound = defects
        .filter(d => d.severity === 'MAJOR')
        .reduce((sum, d) => sum + d.quantity, 0);
    const minorFound = defects
        .filter(d => d.severity === 'MINOR')
        .reduce((sum, d) => sum + d.quantity, 0);
    // Determine result based on AQL
    const inspection = await db_1.prisma.qCInspection.findUnique({
        where: { id: inspectionId },
        select: { acceptance: true, rejection: true }
    });
    let result = 'PENDING_REVIEW';
    if (inspection) {
        const totalDefects = criticalFound + majorFound + minorFound;
        if (totalDefects <= inspection.acceptance) {
            result = 'ACCEPT';
        }
        else if (totalDefects >= inspection.rejection) {
            result = 'REJECT';
        }
    }
    await db_1.prisma.qCInspection.update({
        where: { id: inspectionId },
        data: {
            critical_found: criticalFound,
            major_found: majorFound,
            minor_found: minorFound,
            result,
            updated_at: new Date()
        }
    });
}
