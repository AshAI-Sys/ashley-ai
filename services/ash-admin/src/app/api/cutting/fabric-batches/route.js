"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
const CreateFabricBatchSchema = zod_1.z.object({
    lot_no: zod_1.z.string().min(1, "Lot number is required"),
    brand_id: zod_1.z.string().min(1, "Brand ID is required"),
    gsm: zod_1.z.number().int().positive("GSM must be positive").optional(),
    width_cm: zod_1.z.number().int().positive("Width must be positive").optional(),
    qty_on_hand: zod_1.z.number().positive("Quantity on hand must be positive"),
    uom: zod_1.z.enum(["KG", "M"]),
    received_at: zod_1.z
        .string()
        .transform(str => new Date(str))
        .optional(),
});
const UpdateFabricBatchSchema = CreateFabricBatchSchema.partial();
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const brandId = searchParams.get("brandId") || "";
        const uom = searchParams.get("uom") || "";
        const minQty = searchParams.get("minQty");
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                search
                    ? {
                        OR: [
                            { lot_no: { contains: search, mode: "insensitive" } },
                            { brand: { name: { contains: search, mode: "insensitive" } } },
                        ],
                    }
                    : {},
                brandId ? { brand_id: brandId } : {},
                uom ? { uom } : {},
                minQty ? { qty_on_hand: { gte: parseFloat(minQty) } } : {},
            ],
        };
        const [fabricBatches, total] = await Promise.all([
            db_1.prisma.fabricBatch.findMany({
                where,
                skip,
                take: limit,
                include: {
                    brand: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            cut_issues: true,
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            }),
            db_1.prisma.fabricBatch.count({ where }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                fabricBatches,
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
        console.error("Error fetching fabric batches:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch fabric batches" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const validatedData = CreateFabricBatchSchema.parse(body);
        // Check if brand exists
        const brand = await db_1.prisma.brand.findUnique({
            where: { id: validatedData.brand_id },
        });
        if (!brand) {
            return server_1.NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
        }
        const fabricBatch = await db_1.prisma.fabricBatch.create({
            data: {
                workspace_id: brand.workspace_id,
                brand_id: validatedData.brand_id,
                lot_no: validatedData.lot_no,
                uom: validatedData.uom,
                qty_on_hand: validatedData.qty_on_hand,
                gsm: validatedData.gsm,
                width_cm: validatedData.width_cm,
                received_at: validatedData.received_at,
            },
            include: {
                brand: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        cut_issues: true,
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: fabricBatch,
            message: "Fabric batch created successfully",
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Error creating fabric batch:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create fabric batch" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: "Fabric batch ID is required" }, { status: 400 });
        }
        const body = await request.json();
        const validatedData = UpdateFabricBatchSchema.parse(body);
        // Check if fabric batch exists
        const existingBatch = await db_1.prisma.fabricBatch.findUnique({
            where: { id },
        });
        if (!existingBatch) {
            return server_1.NextResponse.json({ success: false, error: "Fabric batch not found" }, { status: 404 });
        }
        const fabricBatch = await db_1.prisma.fabricBatch.update({
            where: { id },
            data: validatedData,
            include: {
                brand: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        cut_issues: true,
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: fabricBatch,
            message: "Fabric batch updated successfully",
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Error updating fabric batch:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update fabric batch" }, { status: 500 });
    }
});
exports.DELETE = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: "Fabric batch ID is required" }, { status: 400 });
        }
        // Check if fabric batch exists
        const existingBatch = await db_1.prisma.fabricBatch.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        cut_issues: true,
                    },
                },
            },
        });
        if (!existingBatch) {
            return server_1.NextResponse.json({ success: false, error: "Fabric batch not found" }, { status: 404 });
        }
        // Check if fabric batch has issues (prevent deletion if they do)
        if (existingBatch._count.cut_issues > 0) {
            return server_1.NextResponse.json({
                success: false,
                error: "Cannot delete fabric batch with existing fabric issues",
            }, { status: 400 });
        }
        await db_1.prisma.fabricBatch.delete({
            where: { id },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Fabric batch deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting fabric batch:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to delete fabric batch" }, { status: 500 });
    }
});
