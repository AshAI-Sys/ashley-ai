"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
const CreateSewingRunSchema = zod_1.z.object({
    order_id: zod_1.z.string().min(1, "Order ID is required"),
    bundle_id: zod_1.z.string().min(1, "Bundle ID is required"),
    routing_step_id: zod_1.z.string().min(1, "Routing step ID is required"),
    operation_name: zod_1.z.string().min(1, "Operation name is required"),
    sewing_type: zod_1.z.string().optional(),
    operator_id: zod_1.z.string().min(1, "Operator ID is required"),
});
const UpdateSewingRunSchema = zod_1.z.object({
    status: zod_1.z.enum(["CREATED", "IN_PROGRESS", "DONE"]).optional(),
    qty_good: zod_1.z.number().int().min(0).optional(),
    qty_reject: zod_1.z.number().int().min(0).optional(),
    started_at: zod_1.z
        .string()
        .transform(str => new Date(str))
        .optional(),
    ended_at: zod_1.z
        .string()
        .transform(str => new Date(str))
        .optional(),
    reject_reason: zod_1.z.string().optional(),
    reject_photo_url: zod_1.z.string().optional(),
});
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";
        const operator_id = searchParams.get("operator_id") || "";
        const order_id = searchParams.get("order_id") || "";
        const priority = searchParams.get("priority") || "";
        const skip = (page - 1) * limit;
        const where = {
            AND: [
                search
                    ? {
                        OR: [
                            { operation_name: { contains: search, mode: "insensitive" } },
                            { instructions: { contains: search, mode: "insensitive" } },
                            {
                                order: {
                                    order_number: { contains: search, mode: "insensitive" },
                                },
                            },
                        ],
                    }
                    : {},
                status ? { status } : {},
                operator_id ? { operator_id } : {},
                order_id ? { order_id } : {},
                priority ? { priority } : {},
            ],
        };
        const [sewingRuns, total] = await Promise.all([
            db_1.prisma.sewingRun.findMany({
                where,
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
                    bundle: {
                        select: {
                            id: true,
                            qr_code: true,
                            size_code: true,
                            qty: true,
                        },
                    },
                    operator: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            employee_number: true,
                        },
                    },
                },
                orderBy: { created_at: "desc" },
            }),
            db_1.prisma.sewingRun.count({ where }),
        ]);
        // Transform data to match frontend expectations
        const transformedRuns = sewingRuns.map(run => ({
            id: run.id,
            operation_name: run.operation_name,
            status: run.status,
            order: run.order
                ? {
                    order_number: run.order.order_number,
                    brand: { name: run.order.client?.name || "", code: "" },
                }
                : null,
            operator: run.operator
                ? {
                    first_name: run.operator.first_name,
                    last_name: run.operator.last_name,
                    employee_number: run.operator.employee_number || "",
                }
                : null,
            bundle: run.bundle
                ? {
                    id: run.bundle.id,
                    size_code: run.bundle.size_code,
                    qty: run.bundle.qty,
                    qr_code: run.bundle.qr_code,
                }
                : null,
            qty_good: run.qty_good || 0,
            qty_reject: run.qty_reject || 0,
            earned_minutes: run.earned_minutes || 0,
            actual_minutes: run.actual_minutes || undefined,
            efficiency_pct: run.efficiency_pct
                ? Math.round(run.efficiency_pct)
                : undefined,
            piece_rate_pay: run.piece_rate_pay || 0,
            started_at: run.started_at?.toISOString(),
            ended_at: run.ended_at?.toISOString(),
            created_at: run.created_at.toISOString(),
        }));
        return server_1.NextResponse.json({
            success: true,
            data: transformedRuns,
        });
    }
    catch (error) {
        console.error("Error fetching sewing runs:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch sewing runs" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const validatedData = CreateSewingRunSchema.parse(body);
        // Check if order exists
        const order = await db_1.prisma.order.findUnique({
            where: { id: validatedData.order_id },
        });
        if (!order) {
            return server_1.NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }
        // Check if operator exists
        const operator = await db_1.prisma.employee.findUnique({
            where: { id: validatedData.operator_id },
        });
        if (!operator) {
            return server_1.NextResponse.json({ success: false, error: "Operator not found" }, { status: 404 });
        }
        // Check if bundle exists
        const bundle = await db_1.prisma.bundle.findUnique({
            where: { id: validatedData.bundle_id },
        });
        if (!bundle) {
            return server_1.NextResponse.json({ success: false, error: "Bundle not found" }, { status: 404 });
        }
        // Check if routing step exists
        const routingStep = await db_1.prisma.routingStep.findUnique({
            where: { id: validatedData.routing_step_id },
        });
        if (!routingStep) {
            return server_1.NextResponse.json({ success: false, error: "Routing step not found" }, { status: 404 });
        }
        const sewingRun = await db_1.prisma.sewingRun.create({
            data: {
                ...validatedData,
                status: "CREATED",
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
                bundle: {
                    select: {
                        id: true,
                        qr_code: true,
                    },
                },
                operator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        employee_number: true,
                    },
                },
            },
            return: server_1.NextResponse.json({
                success: true,
                data: sewingRun,
                message: "Sewing run created successfully",
            }, { status: 201 })
        });
        try { }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return server_1.NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
            }
            console.error("Error creating sewing run:", error);
            return server_1.NextResponse.json({ success: false, error: "Failed to create sewing run" }, { status: 500 });
        }
    }
    finally { }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: "Sewing run ID is required" }, { status: 400 });
        }
        const body = await request.json();
        const validatedData = UpdateSewingRunSchema.parse(body);
        // Check if sewing run exists
        const existingSewingRun = await db_1.prisma.sewingRun.findUnique({
            where: { id },
        });
        if (!existingSewingRun) {
            return server_1.NextResponse.json({ success: false, error: "Sewing run not found" }, { status: 404 });
        }
        // Calculate efficiency and metrics if times are provided
        let updateData = { ...validatedData };
        if (validatedData.started_at && validatedData.ended_at) {
            const actualMinutes = (validatedData.ended_at.getTime() -
                validatedData.started_at.getTime()) /
                (1000 * 60);
            updateData.actual_minutes = actualMinutes;
            // Calculate efficiency if qty_good is provided
            if (validatedData.qty_good) {
                // Simplified efficiency calculation - would normally use SMV from routing step
            }
            const earnedMinutes = validatedData.qty_good * 0.5; // placeholder SMV
            updateData.earned_minutes = earnedMinutes;
            updateData.efficiency_pct =
                actualMinutes > 0 ? (earnedMinutes / actualMinutes) * 100 : 0;
        }
    }
    finally { }
});
const sewingRun = await db_1.prisma.sewingRun.update({
    where: { id },
    data: updateData,
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
        bundle: {
            select: {
                id: true,
                qr_code: true,
            },
        },
        operator: {
            select: {
                id: true,
                first_name: true,
                last_name: true,
                employee_number: true,
            },
        },
    },
});
return server_1.NextResponse.json({
    success: true,
    data: sewingRun,
    message: "Sewing run updated successfully",
});
try { }
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        return server_1.NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Error updating sewing run:", error);
    return server_1.NextResponse.json({ success: false, error: "Failed to update sewing run" }, { status: 500 });
}
;
exports.DELETE = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: "Sewing run ID is required" }, { status: 400 });
        }
        // Check if sewing run exists
        const existingSewingRun = await db_1.prisma.sewingRun.findUnique({
            where: { id },
        });
        if (!existingSewingRun) {
            return server_1.NextResponse.json({ success: false, error: "Sewing run not found" }, { status: 404 });
        }
        // Check if sewing run is completed (prevent deletion)
        if (existingSewingRun.status === "DONE") {
            return server_1.NextResponse.json({ success: false, error: "Cannot delete completed sewing run" }, { status: 400 });
        }
        await db_1.prisma.sewingRun.delete({
            where: { id },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Sewing run deleted successfully",
        });
        try { }
        catch (error) {
            console.error("Error deleting sewing run:", error);
            return server_1.NextResponse.json({ success: false, error: "Failed to delete sewing run" }, { status: 500 });
        }
    }
    finally { }
});
