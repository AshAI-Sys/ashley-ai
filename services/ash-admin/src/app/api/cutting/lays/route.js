"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
const CreateCutLaySchema = zod_1.z.object({
    order_id: zod_1.z.string().min(1, "Order ID is required"),
    marker_name: zod_1.z.string().optional(),
    marker_width_cm: zod_1.z.number().positive().optional(),
    lay_length_m: zod_1.z.number().positive("Lay length must be positive"),
    plies: zod_1.z.number().int().positive("Number of plies must be positive"),
    gross_used: zod_1.z.number().positive("Gross fabric used must be positive"),
    offcuts: zod_1.z.number().min(0).default(0),
    defects: zod_1.z.number().min(0).default(0),
    uom: zod_1.z.enum(["KG", "M"]),
    outputs: zod_1.z
        .array(zod_1.z.object({
        size_code: zod_1.z.string().min(1, "Size code is required"),
        qty: zod_1.z.number().int().positive("Quantity must be positive"),
    }))
        .min(1, "At least one size output is required"),
});
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const orderId = searchParams.get("orderId") || "";
        const _status = searchParams.get("status") || "";
        const startDate = searchParams.get("startDate") || "";
        const endDate = searchParams.get("endDate") || "";
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                orderId ? { order_id: orderId } : {},
                startDate ? { created_at: { gte: new Date(startDate) } } : {},
                endDate ? { created_at: { lte: new Date(endDate) } } : {},
            ].filter(condition => Object.keys(condition).length > 0),
        };
        const [cutLays, total] = await Promise.all([
            db_1.prisma.cutLay.findMany({
                where: Object.keys(where.AND).length > 0 ? where : {},
                skip,
                take: limit,
                include: {
                    order: {
                        select: {
                            id: true,
                            order_number: true,
                            client: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    outputs: {
                        select: {
                            id: true,
                            size_code: true,
                            qty: true,
                        },
                    },
                    _count: {
                        select: {
                            outputs: true,
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            }),
            db_1.prisma.cutLay.count({
                where: Object.keys(where.AND).length > 0 ? where : {},
            }),
        ]);
        return server_1.NextResponse.json({
            success: true,
            data: {
                cutLays,
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
        console.error("Error fetching cut lays:", error);
        return server_1.NextResponse.json({
            success: false,
            error: "Failed to fetch cut lays",
        }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const validatedData = CreateCutLaySchema.parse(body);
        // Check if order exists
        const order = await db_1.prisma.order.findUnique({
            where: { id: validatedData.order_id },
        });
        if (!order) {
            return server_1.NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }
        // Create cut lay with outputs in a transaction
        const cutLay = await db_1.prisma.$transaction(async (tx) => {
            const newCutLay = await tx.cutLay.create({
                data: {
                    workspace_id: "default",
                    order_id: validatedData.order_id,
                    marker_name: validatedData.marker_name,
                    marker_width_cm: validatedData.marker_width_cm,
                    lay_length_m: validatedData.lay_length_m,
                    plies: validatedData.plies,
                    gross_used: validatedData.gross_used,
                    offcuts: validatedData.offcuts,
                    defects: validatedData.defects,
                    uom: validatedData.uom,
                    created_by: "system",
                },
                include: {
                    order: {
                        select: {
                            id: true,
                            order_number: true,
                            client: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            // Create cut outputs
            const _cutOutputs = await tx.cutOutput.createMany({
                data: validatedData.outputs.map(output => ({
                    workspace_id: "default",
                    cut_lay_id: newCutLay.id,
                    size_code: output.size_code,
                    qty: output.qty,
                })),
            });
            // Fetch the created outputs
            const outputs = await tx.cutOutput.findMany({
                where: { cut_lay_id: newCutLay.id },
            });
            return { ...newCutLay, outputs };
        });
        return server_1.NextResponse.json({
            success: true,
            data: cutLay,
            message: "Cut lay created successfully",
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Error creating cut lay:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create cut lay" }, { status: 500 });
    }
});
