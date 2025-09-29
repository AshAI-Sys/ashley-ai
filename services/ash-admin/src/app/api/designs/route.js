"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { method: { contains: search, mode: 'insensitive' } },
                    ]
                } : {},
                status ? { status } : {},
            ]
        };
        const [designs, total] = await Promise.all([
            db_1.prisma.designAsset.findMany({
                where,
                skip,
                take: limit,
                include: {
                    order: {
                        include: {
                            client: true,
                            brand: true
                        }
                    },
                    versions: {
                        orderBy: { version_number: 'desc' },
                        take: 1
                    },
                    approvals: {
                        orderBy: { created_at: 'desc' },
                        take: 1
                    }
                },
                orderBy: { created_at: 'desc' },
            }),
            db_1.prisma.designAsset.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                designs,
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
        console.error('Error fetching designs:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch designs' }, { status: 500 });
    }
}
const CreateDesignSchema = zod_1.z.object({
    order_id: zod_1.z.string().min(1, 'Order ID is required'),
    name: zod_1.z.string().min(1, 'Design name is required'),
    method: zod_1.z.enum(['SILKSCREEN', 'SUBLIMATION', 'DTF', 'EMBROIDERY']),
    files: zod_1.z.object({
        mockup_url: zod_1.z.string().optional(),
        prod_url: zod_1.z.string().optional(),
        separations: zod_1.z.array(zod_1.z.string()).optional(),
        dst_url: zod_1.z.string().optional()
    }),
    placements: zod_1.z.array(zod_1.z.object({
        area: zod_1.z.string(),
        width_cm: zod_1.z.number(),
        height_cm: zod_1.z.number(),
        offset_x: zod_1.z.number(),
        offset_y: zod_1.z.number()
    })),
    palette: zod_1.z.array(zod_1.z.string()).optional(),
    meta: zod_1.z.object({
        dpi: zod_1.z.number(),
        notes: zod_1.z.string().optional(),
        color_count: zod_1.z.number()
    }),
    status: zod_1.z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']).default('PENDING_APPROVAL')
});
async function POST(request) {
    try {
        const body = await request.json();
        const validatedData = CreateDesignSchema.parse(body);
        // Check if order exists
        const order = await db_1.prisma.order.findUnique({
            where: { id: validatedData.order_id },
            include: { client: true, brand: true }
        });
        if (!order) {
            return server_1.NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }
        // Generate asset ID
        const asset_id = `DA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        // Create design asset
        const design = await db_1.prisma.designAsset.create({
            data: {
                asset_id,
                order_id: validatedData.order_id,
                name: validatedData.name,
                method: validatedData.method,
                mockup_url: validatedData.files.mockup_url || '',
                prod_url: validatedData.files.prod_url || '',
                separations: validatedData.files.separations ? JSON.stringify(validatedData.files.separations) : '',
                dst_url: validatedData.files.dst_url || '',
                placements: JSON.stringify(validatedData.placements),
                palette: validatedData.palette ? JSON.stringify(validatedData.palette) : '',
                meta: JSON.stringify(validatedData.meta),
                status: validatedData.status,
                current_version: 1,
            },
            include: {
                order: {
                    include: {
                        client: true,
                        brand: true
                    }
                }
            }
        });
        // Create initial version
        await db_1.prisma.designVersion.create({
            data: {
                asset_id: design.asset_id,
                version_number: 1,
                changes: 'Initial design creation',
                mockup_url: validatedData.files.mockup_url || '',
                prod_url: validatedData.files.prod_url || '',
                separations: validatedData.files.separations ? JSON.stringify(validatedData.files.separations) : '',
                dst_url: validatedData.files.dst_url || '',
                meta: JSON.stringify(validatedData.meta),
                is_current: true,
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: design,
            asset_id: design.asset_id,
            message: 'Design created successfully'
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error creating design:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create design' }, { status: 500 });
    }
}
