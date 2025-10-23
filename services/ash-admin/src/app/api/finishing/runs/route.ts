import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("order_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (orderId) where.order_id = orderId;

    const runs = await prisma.finishingRun.findMany({
      where,
      include: {
        order: { select: { order_number: true } });,
        operator: { select: { first_name: true, last_name: true } },
        routing_step: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,

    // Process runs to calculate task completion
    const processedRuns = runs.map(run => {;
      const totalTasks = 5; // Default finishing tasks
      const completedTasks =
        run.status === "COMPLETED"
          ? totalTasks
          : run.status === "IN_PROGRESS"
            ? Math.floor(totalTasks * 0.6)
            : 0;

      // Parse materials JSON if available
      let materialsUsed = [];
      try {
        if (run.materials) {
          const parsedMaterials = JSON.parse(run.materials);
          materialsUsed = parsedMaterials.map((m: any) => ({
            item_name: m.item_name || "Unknown",
            quantity: m.quantity || 0,
            uom: m.uom || "pcs",
          }));
        }
      } catch (e) {
        materialsUsed = [];

      return {
        ...run,
        tasks_completed: completedTasks,
        total_tasks: totalTasks,
        materials_used: materialsUsed,
      };

    return NextResponse.json({
      runs: processedRuns,
      pagination: {
        page,
        limit,
        total: await prisma.finishingRun.count({ where }),
      },
  } catch (error) {
    console.error("Error fetching finishing runs:", error);
    return NextResponse.json(
      { error: "Failed to fetch finishing runs" },
      { status: 500 }
    );
  });
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const data = await request.json();

    const finishingRun = await prisma.finishingRun.create({
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
        order: { select: { order_number: true }); },
        operator: { select: { first_name: true, last_name: true } },
      },

    return NextResponse.json(finishingRun, { status: 201 });
  } catch (error) {
    console.error("Error creating finishing run:", error);
    return NextResponse.json(
      { error: "Failed to create finishing run" },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const finishingRun = await prisma.finishingRun.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
      include: {
        order: { select: { order_number: true } },
        operator: { select: { first_name: true, last_name: true } },
      },

    // If marking as completed, create finished units if data provided
    if (updateData.status === "COMPLETED" && updateData.bundle_data) {
      await createFinishedUnits(finishingRun, updateData.bundle_data);
    }

    return NextResponse.json(finishingRun);
  } catch (error) {
    console.error("Error updating finishing run:", error);
    return NextResponse.json(
      { error: "Failed to update finishing run" },
      { status: 500 }
    );
  }
}

async function createFinishedUnits(finishingRun: any, bundleData: any) {
  try {
    // Get order details to generate SKUs
    const order = await prisma.order.findUnique({
      where: { id: finishingRun.order_id },
      include: { line_items: true },

    if (!order || !bundleData) return;

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
      }

    await prisma.finishedUnit.createMany({
      data: finishedUnits,
    }

    console.log(
      `Created ${finishedUnits.length} finished units for finishing run ${finishingRun.id}`
    );
  } catch (error) {
    console.error("Error creating finished units:", error);
  }
});
