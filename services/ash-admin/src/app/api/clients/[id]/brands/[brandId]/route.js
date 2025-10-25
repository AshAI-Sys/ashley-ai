"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const UpdateBrandSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Brand name is required").optional(),
    code: zod_1.z.string().optional(),
    logo_url: zod_1.z.string().optional(),
    settings: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().optional(),
});
async function GET(request, { params }) {
    try {
        const { id: clientId, brandId } = params;
        const brand = await db_1.prisma.brand.findUnique({
            where: {
                id: brandId,
                client_id: clientId,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        company: true,
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
                    take: 10,
                },
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
        if (!brand) {
            return server_1.NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
        }
        return server_1.NextResponse.json({
            success: true,
            data: brand,
        });
    }
    catch (error) {
        console.error("Error fetching brand:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch brand" }, { status: 500 });
    }
}
async function PUT(request, { params }) {
    try {
        const { id: clientId, brandId } = params;
        const body = await request.json();
        const validatedData = UpdateBrandSchema.parse(body);
        // Check if brand exists
        const existingBrand = await db_1.prisma.brand.findUnique({
            where: { id: brandId },
        });
        if (!existingBrand) {
            return server_1.NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
        }
        if (existingBrand.client_id !== clientId) {
            return server_1.NextResponse.json({ success: false, error: "Brand does not belong to this client" }, { status: 403 });
        }
        // Check name uniqueness if name is being updated
        if (validatedData.name && validatedData.name !== existingBrand.name) {
            const nameExists = await db_1.prisma.brand.findFirst({
                where: {
                    name: validatedData.name,
                    client_id: clientId,
                    id: { not: brandId },
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
            where: { id: brandId },
            data: {
                name: validatedData.name,
                code: validatedData.code,
                logo_url: validatedData.logo_url,
                settings: validatedData.settings,
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
}
async function DELETE(request, { params }) {
    try {
        const { id: clientId, brandId } = params;
        // Check if brand exists
        const existingBrand = await db_1.prisma.brand.findUnique({
            where: { id: brandId },
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
        if (existingBrand.client_id !== clientId) {
            return server_1.NextResponse.json({ success: false, error: "Brand does not belong to this client" }, { status: 403 });
        }
        // Soft delete by setting deleted_at
        await db_1.prisma.brand.update({
            where: { id: brandId },
            data: {
                deleted_at: new Date(),
            },
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
}
