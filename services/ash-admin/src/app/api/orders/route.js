"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const zod_1 = require("zod");
const db_1 = require("@/lib/db");
const query_cache_1 = require("@/lib/performance/query-cache");
const auth_middleware_1 = require("@/lib/auth-middleware");
const OrderLineItemSchema = zod_1.z.object({
    productType: zod_1.z.string().min(1, "Product type is required"),
    description: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().positive("Quantity must be positive"),
    unitPrice: zod_1.z.number().positive("Unit price must be positive"),
    totalPrice: zod_1.z.number().positive("Total price must be positive"),
    sizeCurve: zod_1.z.record(zod_1.z.number()).optional(),
    specifications: zod_1.z.record(zod_1.z.any()).optional(),
});
const CreateOrderSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, "Client ID is required"),
    brandId: zod_1.z.string().optional(),
    orderNumber: zod_1.z.string().optional(),
    status: zod_1.z
        .enum([
        "DRAFT",
        "PENDING_APPROVAL",
        "APPROVED",
        "IN_PRODUCTION",
        "COMPLETED",
        "CANCELLED",
    ])
        .default("DRAFT"),
    totalAmount: zod_1.z.number().positive("Total amount must be positive"),
    currency: zod_1.z.string().default("PHP"),
    deliveryDate: zod_1.z
        .string()
        .optional()
        .transform(str => (str ? new Date(str) : undefined)),
    notes: zod_1.z.string().optional(),
    lineItems: zod_1.z.array(OrderLineItemSchema).optional(),
    // New Order Details fields
    po_number: zod_1.z.string().optional(),
    order_type: zod_1.z.string().optional(),
    design_name: zod_1.z.string().optional(),
    fabric_type: zod_1.z.string().optional(),
    size_distribution: zod_1.z.string().optional(),
    mockup_url: zod_1.z.string().optional(),
});
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const workspaceId = user.workspaceId;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";
        const clientId = searchParams.get("clientId") || "";
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            workspace_id: workspaceId,
        };
        if (search) {
            where.OR = [{ order_number: { contains: search, mode: "insensitive" } }];
        }
    }
    finally { }
});
if (status) {
    where.status = status;
}
;
if (clientId) {
    where.client_id = clientId;
}
// Generate cache key
const cacheKey = query_cache_1.CacheKeys.ordersList(page, limit, {
    search,
    status,
    clientId,
});
// Use cached query
const result = await (0, query_cache_1.cachedQueryWithMetrics)(cacheKey, async () => {
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
                        email: true,
                    },
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                line_items: true,
                _count: {
                    select: {
                        line_items: true,
                        design_assets: true,
                        bundles: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
        }),
        db_1.prisma.order.count({ where }),
    ]);
    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}, query_cache_1.CACHE_DURATION.ORDERS // 5 minutes cache
);
return server_1.NextResponse.json({
    success: true,
    data: result,
});
try { }
catch (error) {
    console.error("Error fetching orders:", error);
    return server_1.NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
}
;
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const workspaceId = user.workspaceId;
        const body = await request.json();
        const validatedData = CreateOrderSchema.parse(body);
        // Generate order number if not provided
        const orderNumber = validatedData.orderNumber ||
            `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        // Create new order
        const newOrder = await db_1.prisma.order.create({
            data: {
                workspace_id: workspaceId,
                order_number: orderNumber,
                client_id: validatedData.clientId,
                brand_id: validatedData.brandId || null,
                status: validatedData.status.toLowerCase(),
                total_amount: validatedData.totalAmount,
                currency: validatedData.currency,
                delivery_date: validatedData.deliveryDate || null,
                notes: validatedData.notes || null,
                // New Order Details fields
                po_number: validatedData.po_number || null,
                order_type: validatedData.order_type || "NEW",
                design_name: validatedData.design_name || null,
                fabric_type: validatedData.fabric_type || null,
                size_distribution: validatedData.size_distribution || null,
                mockup_url: validatedData.mockup_url || null,
            },
            include: {
                client: true,
                brand: true,
                _count: {
                    select: {
                        line_items: true,
                    },
                },
            },
        });
        // Invalidate orders cache (non-blocking)
        try {
            await query_cache_1.InvalidateCache.orders();
        }
        catch (cacheError) {
            console.warn("Failed to invalidate cache:", cacheError);
            // Don't fail the request if cache invalidation fails
            return server_1.NextResponse.json({
                success: true,
                data: { order: newOrder },
                message: "Order created successfully",
            }, { status: 201 });
        }
        try { }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return server_1.NextResponse.json({
                    success: false,
                    error: "Validation failed",
                    details: error.errors,
                }, { status: 400 });
            }
            console.error("Error creating order:", error);
            return server_1.NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
        }
    }
    finally { }
});
