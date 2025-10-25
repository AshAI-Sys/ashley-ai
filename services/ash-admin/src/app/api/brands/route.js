"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
const CreateBrandSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Brand name is required"),
    code: zod_1.z.string().optional(), // Brand code (auto-generated, editable)
    client_id: zod_1.z.string().min(1, "Client ID is required"),
    logo_url: zod_1.z.string().optional(),
    settings: zod_1.z.string().optional(), // JSON string for brand settings
    is_active: zod_1.z.boolean().default(true),
});
const UpdateBrandSchema = CreateBrandSchema.partial();
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const client_id = searchParams.get("client_id") || "";
        const status = searchParams.get("status") || "";
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                search
                    ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { description: { contains: search, mode: "insensitive" } },
                            { client: { name: { contains: search, mode: "insensitive" } } },
                        ],
                    }
                    : {},
                client_id ? { client_id } : {},
                status ? { status } : {},
            ],
        };
        const [brands, total] = await Promise.all([
            db_1.prisma.brand.findMany({
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
                    orders: {
                        select: {
                            id: true,
                            order_number: true,
                            status: true,
                            total_amount: true,
                            created_at: true,
                        },
                        orderBy: { created_at: "desc" },
                        take: 5,
                    },
                    _count: {
                        select: {
                            orders: true,
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            }),
            db_1.prisma.brand.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                brands,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching brands:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch brands" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const validatedData = CreateBrandSchema.parse(body);
        // Check if client exists
        const client = await db_1.prisma.client.findUnique({
            where: { id: validatedData.client_id },
            select: { id: true, workspace_id: true },
        });
        if (!client) {
            return server_1.NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }
        // Check if brand with same name already exists for this client
        const existingBrand = await db_1.prisma.brand.findFirst({
            where: {
                name: validatedData.name,
                client_id: validatedData.client_id,
            },
        });
        if (existingBrand) {
            return server_1.NextResponse.json({
                success: false,
                error: "Brand with this name already exists for this client",
            }, { status: 400 });
        }
        const brand = await db_1.prisma.brand.create({
            data: {
                ...validatedData,
                workspace_id: client.workspace_id, // Add workspace_id from client
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: brand,
            message: "Brand created successfully",
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Error creating brand:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create brand" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
        }
        const body = await request.json();
        const validatedData = UpdateBrandSchema.parse(body);
        // Check if brand exists
        const existingBrand = await db_1.prisma.brand.findUnique({
            where: { id },
        });
        if (!existingBrand) {
            return server_1.NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
        }
        // Check name uniqueness if name is being updated
        if (validatedData.name && validatedData.name !== existingBrand.name) {
            const nameExists = await db_1.prisma.brand.findFirst({
                where: {
                    name: validatedData.name,
                    client_id: validatedData.client_id || existingBrand.client_id,
                    id: { not: id },
                },
            });
            if (nameExists) {
                return server_1.NextResponse.json({
                    success: false,
                    error: "Brand with this name already exists for this client",
                }, { status: 400 });
            }
        }
        const brand = await db_1.prisma.brand.update({
            where: { id },
            data: validatedData,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: brand,
            message: "Brand updated successfully",
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Error updating brand:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update brand" }, { status: 500 });
    }
});
exports.DELETE = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
        }
        // Check if brand exists
        const existingBrand = await db_1.prisma.brand.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
        if (!existingBrand) {
            return server_1.NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
        }
        // Check if brand has orders (prevent deletion if they do)
        if (existingBrand._count.orders > 0) {
            return server_1.NextResponse.json({ success: false, error: "Cannot delete brand with existing orders" }, { status: 400 });
        }
        await db_1.prisma.brand.delete({
            where: { id },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Brand deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting brand:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to delete brand" }, { status: 500 });
    }
});
