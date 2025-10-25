"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
const _DEFAULT_WORKSPACE_ID = "default-workspace";
const CreateBrandSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Brand name is required"),
    code: zod_1.z.string().optional(),
    logo_url: zod_1.z.string().optional(),
    settings: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().default(true),
});
const _UpdateBrandSchema = CreateBrandSchema.partial();
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user, context) => {
    try {
        const clientId = context.params.id;
        // Check if client exists
        const client = await db_1.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            return server_1.NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }
        const brands = await db_1.prisma.brand.findMany({
            where: { client_id: clientId },
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
        });
        return server_1.NextResponse.json({
            success: true,
            data: brands,
        });
    }
    catch (error) {
        console.error("Error fetching client brands:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch brands" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user, context) => {
    try {
        const clientId = context.params.id;
        const body = await request.json();
        const validatedData = CreateBrandSchema.parse(body);
        // Check if client exists
        const client = await db_1.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            return server_1.NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }
        // Check if brand with same name already exists for this client
        const existingBrand = await db_1.prisma.brand.findFirst({
            where: {
                name: validatedData.name,
                client_id: clientId,
            },
        });
        if (existingBrand) {
            return server_1.NextResponse.json({
                success: false,
                error: "Brand with this name already exists for this client",
            }, { status: 400 });
        }
        // Ensure workspace exists before creating brand
        await db_1.prisma.workspace.upsert({
            where: { id: client.workspace_id },
            create: {
                id: client.workspace_id,
                name: "Default Workspace",
                slug: client.workspace_id,
            },
            update: {},
        });
        // Use client's workspace_id
        const brand = await db_1.prisma.brand.create({
            data: {
                workspace_id: client.workspace_id,
                client_id: clientId,
                name: validatedData.name,
                code: validatedData.code || null,
                logo_url: validatedData.logo_url || null,
                settings: validatedData.settings || null,
                is_active: validatedData.is_active,
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
