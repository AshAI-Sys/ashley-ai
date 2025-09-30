"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const BundleConfigSchema = zod_1.z.object({
    sizeCode: zod_1.z.string().min(1, 'Size code is required'),
    totalPieces: zod_1.z.number().int().positive('Total pieces must be positive'),
    piecesPerBundle: zod_1.z.number().int().positive('Pieces per bundle must be positive'),
});
const CreateBundlesSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
    cutLayId: zod_1.z.string().min(1, 'Cut lay ID is required'),
    bundleConfigs: zod_1.z.array(BundleConfigSchema).min(1, 'At least one bundle configuration is required'),
});
const UpdateBundleSchema = zod_1.z.object({
    bundleId: zod_1.z.string().min(1, 'Bundle ID is required'),
    status: zod_1.z.enum(['CREATED', 'IN_SEWING', 'DONE', 'REJECTED']),
    notes: zod_1.z.string().optional(),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const orderId = searchParams.get('orderId') || '';
        const cutLayId = searchParams.get('cutLayId') || '';
        const status = searchParams.get('status') || '';
        const sizeCode = searchParams.get('sizeCode') || '';
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                orderId ? { orderId } : {},
                cutLayId ? { cutLayId } : {},
                status ? { status } : {},
                sizeCode ? { sizeCode } : {},
            ]
        };
        const [bundles, total] = await Promise.all([
            db_1.prisma.bundle.findMany({
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
                    cutLay: {
                        select: {
                            id: true,
                            markerName: true,
                            layLengthM: true,
                            plies: true,
                        }
                    },
                    _count: {
                        select: {
                            sewingRuns: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.bundle.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                bundles,
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
        console.error('Error fetching bundles:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch bundles' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const validatedData = CreateBundlesSchema.parse(body);
        // Check if order exists
        const order = await db_1.prisma.order.findUnique({
            where: { id: validatedData.orderId }
        });
        if (!order) {
            return server_1.NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }
        // Check if cut lay exists
        const cutLay = await db_1.prisma.cutLay.findUnique({
            where: { id: validatedData.cutLayId }
        });
        if (!cutLay) {
            return server_1.NextResponse.json({ success: false, error: 'Cut lay not found' }, { status: 404 });
        }
        const createdBundles = [];
        // Create bundles in a transaction
        await db_1.prisma.$transaction(async (tx) => {
            for (const config of validatedData.bundleConfigs) {
                const bundlesCount = Math.ceil(config.totalPieces / config.piecesPerBundle);
                for (let bundleNum = 1; bundleNum <= bundlesCount; bundleNum++) {
                    const remainingPieces = config.totalPieces - ((bundleNum - 1) * config.piecesPerBundle);
                    const currentBundlePieces = Math.min(config.piecesPerBundle, remainingPieces);
                    const qrCode = generateQRCode(validatedData.orderId, validatedData.cutLayId, config.sizeCode, bundleNum);
                    const bundleNumber = `${config.sizeCode}-${String(bundleNum).padStart(3, '0')}`;
                    const bundle = await tx.bundle.create({
                        data: {
                            orderId: validatedData.orderId,
                            cutLayId: validatedData.cutLayId,
                            bundleNumber,
                            sizeCode: config.sizeCode,
                            qty: currentBundlePieces,
                            qrCode,
                            status: 'CREATED',
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
                            },
                            cutLay: {
                                select: {
                                    id: true,
                                    markerName: true,
                                    layLengthM: true,
                                    plies: true,
                                }
                            }
                        }
                    });
                    createdBundles.push(bundle);
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: createdBundles,
            message: `Successfully created ${createdBundles.length} bundles`
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error creating bundles:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create bundles' }, { status: 500 });
    }
}
function generateQRCode(orderId, layId, sizeCode, bundleNumber) {
    const timestamp = new Date().getTime();
    return `ASH-${orderId}-${layId}-${sizeCode}-${String(bundleNumber).padStart(3, '0')}-${timestamp}`;
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Bundle ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const validatedData = UpdateBundleSchema.parse(body);
        // Check if bundle exists
        const existingBundle = await db_1.prisma.bundle.findUnique({
            where: { id }
        });
        if (!existingBundle) {
            return server_1.NextResponse.json({ success: false, error: 'Bundle not found' }, { status: 404 });
        }
        const bundle = await db_1.prisma.bundle.update({
            where: { id },
            data: {
                status: validatedData.status,
                notes: validatedData.notes,
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
                },
                cutLay: {
                    select: {
                        id: true,
                        markerName: true,
                        layLengthM: true,
                        plies: true,
                    }
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: bundle,
            message: 'Bundle updated successfully'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error updating bundle:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update bundle' }, { status: 500 });
    }
}
