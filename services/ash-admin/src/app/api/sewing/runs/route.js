"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const CreateSewingRunSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
    bundleId: zod_1.z.string().optional(),
    operationName: zod_1.z.string().min(1, 'Operation name is required'),
    machineId: zod_1.z.string().optional(),
    operatorId: zod_1.z.string().min(1, 'Operator ID is required'),
    plannedQuantity: zod_1.z.number().int().positive('Planned quantity must be positive'),
    targetEfficiency: zod_1.z.number().min(0).max(200).default(85),
    pieceRate: zod_1.z.number().positive('Piece rate must be positive'),
    standardTime: zod_1.z.number().positive('Standard time must be positive'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    scheduledStart: zod_1.z.string().transform((str) => new Date(str)),
    scheduledEnd: zod_1.z.string().transform((str) => new Date(str)),
    instructions: zod_1.z.string().optional(),
    qualityRequirements: zod_1.z.record(zod_1.z.any()).optional(),
});
const UpdateSewingRunSchema = CreateSewingRunSchema.partial().extend({
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
    actualQuantity: zod_1.z.number().int().min(0).optional(),
    actualEfficiency: zod_1.z.number().min(0).max(200).optional(),
    startTime: zod_1.z.string().transform((str) => new Date(str)).optional(),
    endTime: zod_1.z.string().transform((str) => new Date(str)).optional(),
    notes: zod_1.z.string().optional(),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const operatorId = searchParams.get('operatorId') || '';
        const orderId = searchParams.get('orderId') || '';
        const priority = searchParams.get('priority') || '';
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                search ? {
                    OR: [
                        { operationName: { contains: search, mode: 'insensitive' } },
                        { instructions: { contains: search, mode: 'insensitive' } },
                        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
                    ]
                } : {},
                status ? { status } : {},
                operatorId ? { operatorId } : {},
                orderId ? { orderId } : {},
                priority ? { priority } : {},
            ]
        };
        const [sewingRuns, total] = await Promise.all([
            db_1.prisma.sewingRun.findMany({
                where,
                skip,
                take: limit,
                include: {
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                            client: {
                                select: {
                                    name: true,
                                    company: true,
                                }
                            }
                        }
                    },
                    bundle: {
                        select: {
                            id: true,
                            bundleNumber: true,
                            qrCode: true,
                        }
                    },
                    machine: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                        }
                    },
                    operator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true,
                        }
                    },
                    sewingOperations: {
                        select: {
                            id: true,
                            operationType: true,
                            completedQuantity: true,
                            status: true,
                        }
                    },
                    _count: {
                        select: {
                            sewingOperations: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.sewingRun.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                sewingRuns,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching sewing runs:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch sewing runs' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const validatedData = CreateSewingRunSchema.parse(body);
        // Check if order exists
        const order = await db_1.prisma.order.findUnique({
            where: { id: validatedData.orderId }
        });
        if (!order) {
            return server_1.NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }
        // Check if operator exists
        const operator = await db_1.prisma.employee.findUnique({
            where: { id: validatedData.operatorId }
        });
        if (!operator) {
            return server_1.NextResponse.json({ success: false, error: 'Operator not found' }, { status: 404 });
        }
        // Check if machine exists (if provided)
        if (validatedData.machineId) {
            const machine = await db_1.prisma.machine.findUnique({
                where: { id: validatedData.machineId }
            });
            if (!machine) {
                return server_1.NextResponse.json({ success: false, error: 'Machine not found' }, { status: 404 });
            }
        }
        // Check if bundle exists (if provided)
        if (validatedData.bundleId) {
            const bundle = await db_1.prisma.bundle.findUnique({
                where: { id: validatedData.bundleId }
            });
            if (!bundle) {
                return server_1.NextResponse.json({ success: false, error: 'Bundle not found' }, { status: 404 });
            }
        }
        const sewingRun = await db_1.prisma.sewingRun.create({
            data: {
                ...validatedData,
                status: 'PENDING',
            },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        client: {
                            select: {
                                name: true,
                                company: true,
                            }
                        }
                    }
                },
                bundle: {
                    select: {
                        id: true,
                        bundleNumber: true,
                        qrCode: true,
                    }
                },
                machine: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    }
                },
                operator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                    }
                },
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: sewingRun,
            message: 'Sewing run created successfully'
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error creating sewing run:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create sewing run' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Sewing run ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const validatedData = UpdateSewingRunSchema.parse(body);
        // Check if sewing run exists
        const existingSewingRun = await db_1.prisma.sewingRun.findUnique({
            where: { id }
        });
        if (!existingSewingRun) {
            return server_1.NextResponse.json({ success: false, error: 'Sewing run not found' }, { status: 404 });
        }
        // Calculate actual efficiency if actualQuantity and times are provided
        let calculatedEfficiency = validatedData.actualEfficiency;
        if (validatedData.actualQuantity && validatedData.startTime && validatedData.endTime) {
            const totalTimeMinutes = (validatedData.endTime.getTime() - validatedData.startTime.getTime()) / (1000 * 60);
            const standardTimeTotal = existingSewingRun.standardTime * validatedData.actualQuantity;
            calculatedEfficiency = (standardTimeTotal / totalTimeMinutes) * 100;
        }
        const sewingRun = await db_1.prisma.sewingRun.update({
            where: { id },
            data: {
                ...validatedData,
                actualEfficiency: calculatedEfficiency,
            },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        client: {
                            select: {
                                name: true,
                                company: true,
                            }
                        }
                    }
                },
                bundle: {
                    select: {
                        id: true,
                        bundleNumber: true,
                        qrCode: true,
                    }
                },
                machine: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    }
                },
                operator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                    }
                },
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: sewingRun,
            message: 'Sewing run updated successfully'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error updating sewing run:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update sewing run' }, { status: 500 });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Sewing run ID is required' }, { status: 400 });
        }
        // Check if sewing run exists
        const existingSewingRun = await db_1.prisma.sewingRun.findUnique({
            where: { id }
        });
        if (!existingSewingRun) {
            return server_1.NextResponse.json({ success: false, error: 'Sewing run not found' }, { status: 404 });
        }
        // Check if sewing run is completed (prevent deletion)
        if (existingSewingRun.status === 'COMPLETED') {
            return server_1.NextResponse.json({ success: false, error: 'Cannot delete completed sewing run' }, { status: 400 });
        }
        await db_1.prisma.sewingRun.delete({
            where: { id }
        });
        return server_1.NextResponse.json({
            success: true,
            message: 'Sewing run deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting sewing run:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to delete sewing run' }, { status: 500 });
    }
}
