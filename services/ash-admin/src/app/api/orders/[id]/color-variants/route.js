"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.DELETE = DELETE;
/* eslint-disable */
const server_1 = require("next/server");
const zod_1 = require("zod");
const db_1 = require("@/lib/db");
const ColorVariantSchema = zod_1.z.object({
    line_item_id: zod_1.z.string().min(1, "Line item ID is required"),
    color_name: zod_1.z.string().min(1, "Color name is required"),
    color_code: zod_1.z.string().min(1, "Color code is required"),
    percentage: zod_1.z.number().min(0).max(100),
    quantity: zod_1.z.number().int().min(0),
});
async function GET(request, { params }) {
    try {
        const orderId = params.id;
        // Get all line items for the order first
        const lineItems = await db_1.prisma.orderLineItem.findMany({
            where: {
                order_id: orderId,
            },
            include: {
                color_variants: {
                    orderBy: {
                        created_at: "asc",
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: { lineItems },
        });
    }
    catch (error) {
        console.error("Error fetching color variants:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch color variants" }, { status: 500 });
    }
}
async function POST(request, { params: _params }, { id: string }) {
    try {
        const body = await request.json();
        const validatedData = ColorVariantSchema.parse(body);
        const colorVariant = await db_1.prisma.colorVariant.create({
            data: {
                line_item_id: validatedData.line_item_id,
                color_name: validatedData.color_name,
                color_code: validatedData.color_code,
                percentage: validatedData.percentage,
                quantity: validatedData.quantity,
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: { colorVariant },
            message: "Color variant created successfully",
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({
                success: false,
                error: "Validation failed",
                details: error.errors,
            }, { status: 400 });
        }
        console.error("Error creating color variant:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create color variant" }, { status: 500 });
    }
}
async function DELETE(request, { params: _params }, { id: string }) {
    try {
        const { searchParams } = new URL(request.url);
        const variantId = searchParams.get("variantId");
        if (!variantId) {
            return server_1.NextResponse.json({ success: false, error: "Variant ID is required" }, { status: 400 });
        }
        await db_1.prisma.colorVariant.delete({
            where: {
                id: variantId,
            },
            return: server_1.NextResponse.json({
                success: true,
                message: "Color variant deleted successfully",
            }), catch(error) {
                console.error("Error deleting color variant:", error);
                return server_1.NextResponse.json({ success: false, error: "Failed to delete color variant" }, { status: 500 });
            }
        });
    }
    finally { }
}
