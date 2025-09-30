"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const CreateCutLaySchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
    markerName: zod_1.z.string().optional(),
    markerWidthCm: zod_1.z.number().positive().optional(),
    layLengthM: zod_1.z.number().positive('Lay length must be positive'),
    plies: zod_1.z.number().int().positive('Number of plies must be positive'),
    grossUsed: zod_1.z.number().positive('Gross fabric used must be positive'),
    offcuts: zod_1.z.number().min(0).default(0),
    defects: zod_1.z.number().min(0).default(0),
    uom: zod_1.z.enum(['KG', 'M']),
    outputs: zod_1.z.array(zod_1.z.object({
        sizeCode: zod_1.z.string().min(1, 'Size code is required'),
        qty: zod_1.z.number().int().positive('Quantity must be positive'),
    })).min(1, 'At least one size output is required'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const orderId = searchParams.get('orderId') || '';
        const status = searchParams.get('status') || '';
        const startDate = searchParams.get('startDate') || '';
        const endDate = searchParams.get('endDate') || '';
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                orderId ? { orderId } : {},
                status ? { status } : {},
                startDate ? { createdAt: { gte: new Date(startDate) } } : {},
                endDate ? { createdAt: { lte: new Date(endDate) } } : {},
            ]
        };
        const [cutLays, total] = await Promise.all([
            db_1.prisma.cutLay.findMany({
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
                            },
                            brand: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    },
                    outputs: {
                        select: {
                            id: true,
                            sizeCode: true,
                            qty: true,
                        }
                    },
                    _count: {
                        select: {
                            outputs: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.cutLay.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                cutLays,
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
        console.error('Error fetching cut lays:', error);
        return server_1.NextResponse.json({
            success: false,
            error: 'Failed to fetch cut lays'
        }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const validatedData = CreateCutLaySchema.parse(body);
        // Check if order exists
        const order = await db_1.prisma.order.findUnique({
            where: { id: validatedData.orderId }
        });
        if (!order) {
            return server_1.NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }
        // Create cut lay with outputs in a transaction
        const cutLay = await db_1.prisma.$transaction(async (tx) => {
            const newCutLay = await tx.cutLay.create({
                data: {
                    orderId: validatedData.orderId,
                    markerName: validatedData.markerName,
                    markerWidthCm: validatedData.markerWidthCm,
                    layLengthM: validatedData.layLengthM,
                    plies: validatedData.plies,
                    grossUsed: validatedData.grossUsed,
                    offcuts: validatedData.offcuts,
                    defects: validatedData.defects,
                    uom: validatedData.uom,
                    status: 'COMPLETED',
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
                            },
                            brand: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    }
                }
            });
            // Create cut outputs
            const cutOutputs = await tx.cutOutput.createMany({
                data: validatedData.outputs.map(output => ({
                    cutLayId: newCutLay.id,
                    sizeCode: output.sizeCode,
                    qty: output.qty,
                }))
            });
            // Fetch the created outputs
            const outputs = await tx.cutOutput.findMany({
                where: { cutLayId: newCutLay.id }
            });
            return { ...newCutLay, outputs };
        });
        return server_1.NextResponse.json({
            success: true,
            data: cutLay,
            message: 'Cut lay created successfully'
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error creating cut lay:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create cut lay' }, { status: 500 });
    }
}
