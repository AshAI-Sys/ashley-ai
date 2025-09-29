"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const OrderLineItemSchema = zod_1.z.object({
    productType: zod_1.z.string().min(1, 'Product type is required'),
    description: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().positive('Quantity must be positive'),
    unitPrice: zod_1.z.number().positive('Unit price must be positive'),
    totalPrice: zod_1.z.number().positive('Total price must be positive'),
    sizeCurve: zod_1.z.record(zod_1.z.number()).optional(),
    specifications: zod_1.z.record(zod_1.z.any()).optional(),
});
const CreateOrderSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'Client ID is required'),
    brandId: zod_1.z.string().optional(),
    orderNumber: zod_1.z.string().optional(),
    status: zod_1.z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    targetDeliveryDate: zod_1.z.string().transform((str) => new Date(str)),
    totalAmount: zod_1.z.number().positive('Total amount must be positive'),
    currency: zod_1.z.string().default('PHP'),
    paymentTerms: zod_1.z.string().optional(),
    specialInstructions: zod_1.z.string().optional(),
    shippingAddress: zod_1.z.string().optional(),
    lineItems: zod_1.z.array(OrderLineItemSchema).min(1, 'At least one line item is required'),
});
const UpdateOrderSchema = CreateOrderSchema.partial().extend({
    lineItems: zod_1.z.array(OrderLineItemSchema).optional(),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const clientId = searchParams.get('clientId') || '';
        const priority = searchParams.get('priority') || '';
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                search ? {
                    OR: [
                        { orderNumber: { contains: search, mode: 'insensitive' } },
                        { client: { name: { contains: search, mode: 'insensitive' } } },
                        { specialInstructions: { contains: search, mode: 'insensitive' } },
                    ]
                } : {},
                status ? { status } : {},
                clientId ? { clientId } : {},
                priority ? { priority } : {},
            ]
        };
        const [orders, total] = await Promise.all([
            db_1.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            company: true,
                            email: true,
                        }
                    },
                    brand: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    lineItems: true,
                    routingSteps: {
                        select: {
                            id: true,
                            stepName: true,
                            status: true,
                            startDate: true,
                            endDate: true,
                        },
                        orderBy: { order: 'asc' },
                    },
                    _count: {
                        select: {
                            lineItems: true,
                            routingSteps: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.order.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                orders,
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
        console.error('Error fetching orders:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const validatedData = CreateOrderSchema.parse(body);
        // Check if client exists
        const client = await db_1.prisma.client.findUnique({
            where: { id: validatedData.clientId }
        });
        if (!client) {
            return server_1.NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
        }
        // Check if brand exists (if provided)
        if (validatedData.brandId) {
            const brand = await db_1.prisma.brand.findUnique({
                where: { id: validatedData.brandId }
            });
            if (!brand) {
                return server_1.NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
            }
        }
        // Generate order number if not provided
        let orderNumber = validatedData.orderNumber;
        if (!orderNumber) {
            const orderCount = await db_1.prisma.order.count();
            orderNumber = `ASH-${String(orderCount + 1).padStart(6, '0')}`;
        }
        // Create order with line items in a transaction
        const order = await db_1.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    ...validatedData,
                    orderNumber,
                    lineItems: {
                        create: validatedData.lineItems,
                    },
                },
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            company: true,
                            email: true,
                        }
                    },
                    brand: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    lineItems: true,
                }
            });
            return newOrder;
        });
        return server_1.NextResponse.json({
            success: true,
            data: order,
            message: 'Order created successfully'
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error creating order:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const validatedData = UpdateOrderSchema.parse(body);
        // Check if order exists
        const existingOrder = await db_1.prisma.order.findUnique({
            where: { id },
            include: { lineItems: true }
        });
        if (!existingOrder) {
            return server_1.NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }
        // Update order in a transaction
        const order = await db_1.prisma.$transaction(async (tx) => {
            // Update line items if provided
            if (validatedData.lineItems) {
                // Delete existing line items
                await tx.orderLineItem.deleteMany({
                    where: { orderId: id }
                });
                // Create new line items
                await tx.orderLineItem.createMany({
                    data: validatedData.lineItems.map(item => ({
                        ...item,
                        orderId: id,
                    }))
                });
            }
            // Update order
            const updatedOrder = await tx.order.update({
                where: { id },
                data: {
                    ...validatedData,
                    lineItems: undefined, // Remove lineItems from update data
                },
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            company: true,
                            email: true,
                        }
                    },
                    brand: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    lineItems: true,
                }
            });
            return updatedOrder;
        });
        return server_1.NextResponse.json({
            success: true,
            data: order,
            message: 'Order updated successfully'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error updating order:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }
        // Check if order exists
        const existingOrder = await db_1.prisma.order.findUnique({
            where: { id },
            include: {
                routingSteps: true,
                _count: {
                    select: {
                        routingSteps: true,
                    }
                }
            }
        });
        if (!existingOrder) {
            return server_1.NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }
        // Check if order is in production (prevent deletion)
        if (existingOrder.status === 'IN_PRODUCTION' || existingOrder.status === 'COMPLETED') {
            return server_1.NextResponse.json({ success: false, error: 'Cannot delete order that is in production or completed' }, { status: 400 });
        }
        // Delete order (cascade will handle line items)
        await db_1.prisma.order.delete({
            where: { id }
        });
        return server_1.NextResponse.json({
            success: true,
            message: 'Order deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting order:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
    }
}
