"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const orderId = searchParams.get("order_id");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const where = {};
        if (status && status !== "all")
            where.status = status;
        if (orderId)
            where.order_id = orderId;
        const runs = await db_1.prisma.finishingRun.findMany({
            where,
            include: {
                order: { select: { order_number: true } },
                operator: { select: { first_name: true, last_name: true } },
                routing_step: true,
            },
            orderBy: { created_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        });
        // Process runs to calculate task completion
        const processedRuns = runs.map(run => {
            const totalTasks = 5; // Default finishing tasks
            const completedTasks = run.status === "COMPLETED"
                ? totalTasks
                : run.status === "IN_PROGRESS"
                    ? Math.floor(totalTasks * 0.6)
                    : 0;
            // Parse materials JSON if available
            let materialsUsed = [];
            try {
                if (run.materials) {
                    const parsedMaterials = JSON.parse(run.materials);
                    materialsUsed = parsedMaterials.map((m) => ({
                        item_name: m.item_name || "Unknown",
                        quantity: m.quantity || 0,
                        uom: m.uom || "pcs",
                    }));
                }
            }
            catch (e) {
                materialsUsed = [];
            }
            return {
                ...run,
                tasks_completed: completedTasks,
                total_tasks: totalTasks,
                materials_used: materialsUsed,
            };
        });
        return server_1.NextResponse.json({
            runs: processedRuns,
            pagination: {
                page,
                limit,
                total: await db_1.prisma.finishingRun.count({ where }),
            },
        });
    }
    catch (error) {
        console.error("Error fetching finishing runs:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch finishing runs" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const data = await request.json();
        const finishingRun = await db_1.prisma.finishingRun.create({
            data: {
                workspace_id: data.workspace_id || "default",
                order_id: data.order_id,
                routing_step_id: data.routing_step_id,
                operator_id: data.operator_id,
                status: data.status || "PENDING",
                materials: data.materials ? JSON.stringify(data.materials) : null,
                started_at: data.started_at ? new Date(data.started_at) : null,
            },
            include: {
                order: { select: { order_number: true } },
                operator: { select: { first_name: true, last_name: true } },
            },
        });
        return server_1.NextResponse.json(finishingRun, { status: 201 });
    }
    catch (error) {
        console.error("Error creating finishing run:", error);
        return server_1.NextResponse.json({ error: "Failed to create finishing run" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const finishingRun = await db_1.prisma.finishingRun.update({
            where: { id },
            data: {
                ...updateData,
                updated_at: new Date(),
            },
            include: {
                order: { select: { order_number: true } },
                operator: { select: { first_name: true, last_name: true } },
            },
        });
        // If marking as completed, create finished units if data provided
        if (updateData.status === "COMPLETED" && updateData.bundle_data) {
            await createFinishedUnits(finishingRun, updateData.bundle_data);
            return server_1.NextResponse.json(finishingRun);
        }
        try { }
        catch (error) {
            console.error("Error updating finishing run:", error);
            return server_1.NextResponse.json({ error: "Failed to update finishing run" }, { status: 500 });
        }
    }
    finally { }
});
async function createFinishedUnits(finishingRun, bundleData) {
    try {
        // Get order details to generate SKUs
        const order = await db_1.prisma.order.findUnique({
            where: { id: finishingRun.order_id },
            include: { line_items: true },
        });
        if (!order || !bundleData)
            return;
        // Create finished units for each piece in the bundle
        const finishedUnits = [];
        for (let i = 0; i < bundleData.qty; i++) {
            const sku = `${order.line_items[0]?.sku || "SKU"}-${bundleData.size_code}`;
            finishedUnits.push({
                workspace_id: finishingRun.workspace_id,
                order_id: finishingRun.order_id,
                sku,
                size_code: bundleData.size_code,
                color: bundleData.color || null,
                serial: `${bundleData.qr_code || finishingRun.id}-${(i + 1).toString().padStart(3, "0")}`,
            });
        }
        await db_1.prisma.finishedUnit.createMany({
            data: finishedUnits,
        });
        console.log(`Created ${finishedUnits.length} finished units for finishing run ${finishingRun.id}`);
    }
    catch (error) {
        console.error("Error creating finished units:", error);
    }
}
