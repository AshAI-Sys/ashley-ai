"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
/* eslint-disable */
const server_1 = require("next/server");
const zod_1 = require("zod");
const db_1 = require("@/lib/db");
const PrintLocationSchema = zod_1.z.object({
    location: zod_1.z.string().min(1, "Location is required"),
    location_label: zod_1.z.string().optional(),
    design_file_url: zod_1.z.string().optional(),
    width_cm: zod_1.z.number().optional(),
    height_cm: zod_1.z.number().optional(),
    offset_x_cm: zod_1.z.number().optional(),
    offset_y_cm: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
});
async function GET(request, { params }) {
    try {
        const designAssetId = params.id;
        const printLocations = await db_1.prisma.printLocation.findMany({
            where: {
                design_asset_id: designAssetId,
            },
            orderBy: {
                created_at: "asc",
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: { printLocations },
        });
    }
    catch (error) {
        console.error("Error fetching print locations:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch print locations" }, { status: 500 });
    }
}
async function POST(request, { params }) {
    try {
        const designAssetId = params.id;
        const body = await request.json();
        const validatedData = PrintLocationSchema.parse(body);
        const printLocation = await db_1.prisma.printLocation.create({
            data: {
                design_asset_id: designAssetId,
                location: validatedData.location,
                location_label: validatedData.location_label || null,
                design_file_url: validatedData.design_file_url || null,
                width_cm: validatedData.width_cm || null,
                height_cm: validatedData.height_cm || null,
                offset_x_cm: validatedData.offset_x_cm || null,
                offset_y_cm: validatedData.offset_y_cm || null,
                notes: validatedData.notes || null,
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: { printLocation },
            message: "Print location created successfully",
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
        console.error("Error creating print location:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create print location" }, { status: 500 });
    }
}
async function PUT(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const locationId = searchParams.get("locationId");
        if (!locationId) {
            return server_1.NextResponse.json({ success: false, error: "Location ID is required" }, { status: 400 });
        }
        const body = await request.json();
        const validatedData = PrintLocationSchema.partial().parse(body);
        const printLocation = await db_1.prisma.printLocation.update({
            where: {
                id: locationId,
            },
            data: {
                location_label: validatedData.location_label,
                design_file_url: validatedData.design_file_url,
                width_cm: validatedData.width_cm,
                height_cm: validatedData.height_cm,
                offset_x_cm: validatedData.offset_x_cm,
                offset_y_cm: validatedData.offset_y_cm,
                notes: validatedData.notes,
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: { printLocation },
            message: "Print location updated successfully",
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({
                success: false,
                error: "Validation failed",
                details: error.errors,
            }, { status: 400 });
        }
        console.error("Error updating print location:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update print location" }, { status: 500 });
    }
}
async function DELETE(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const locationId = searchParams.get("locationId");
        if (!locationId) {
            return server_1.NextResponse.json({ success: false, error: "Location ID is required" }, { status: 400 });
        }
        await db_1.prisma.printLocation.delete({
            where: {
                id: locationId,
            },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Print location deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting print location:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to delete print location" }, { status: 500 });
    }
}
