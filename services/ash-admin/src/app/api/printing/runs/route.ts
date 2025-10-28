/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const method = searchParams.get("method");
    const status = searchParams.get("status");
    const machineId = searchParams.get("machine_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = {};
    if (method) where.method = method;
    if (status) where.status = status;
    if (machineId) where.machine_id = machineId;

    const [runs, totalCount] = await Promise.all([
      prisma.printRun.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { created_at: "desc" },
        include: {
          order: {
            include: {
              brand: true,
              line_items: {
                take: 1,
              },
            },
          },
          machine: true,
          routing_step: true,
          outputs: true,
          rejects: true,
          materials: true,
          // Method-specific includes
          silkscreen_prep: true,
          silkscreen_specs: true,
          curing_logs: true,
          sublimation_prints: true,
          heat_press_logs: true,
          dtf_prints: true,
          dtf_powder_cures: true,
          embroidery_runs: true,
        },
      }),
      prisma.printRun.count({ where }),
    ]);

    // Transform data for frontend
    const transformedRuns = runs.map(run => ({
      id: run.id,
      method: run.method,
      status: run.status,
      workcenter: run.workcenter,
      started_at: run.started_at,
      ended_at: run.ended_at,
      created_at: run.created_at,
      order: {
        order_number: run.order.order_number,
        brand: {
          name: run.order.brand?.name || "Unknown",
          code: run.order.brand?.code || "UNK",
        },
        line_items: run.order.line_items,
      },
      machine: run.machine
        ? {
            id: run.machine.id,
            name: run.machine.name,
            workcenter: run.machine.workcenter,
          }
        : null,
      routing_step: run.routing_step
        ? {
            id: run.routing_step.id,
            step_name: run.routing_step.step_name,
            department: run.routing_step.department,
          }
        : null,
      // Calculate totals
      target_qty:
        run.outputs.reduce((sum, o) => sum + o.qty_good + o.qty_reject, 0) ||
        100,
      completed_qty: run.outputs.reduce((sum, o) => sum + o.qty_good, 0),
      rejected_qty: run.rejects.reduce((sum, r) => sum + r.qty, 0),
      materials_used: run.materials.length,
      // Method-specific data
      method_data: getMethodSpecificData(run),
    }));

    return NextResponse.json({
      success: true,
      data: transformedRuns,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
});
} catch (error) {
    console.error("Print runs API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch print runs" },
      { status: 500 }
    );
  }
})

export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();
    const {
      order_id,
      routing_step_id,
      machine_id,
      method,
      target_qty,
      priority = "NORMAL",
      notes,
    } = body;

    // Validate required fields
    if (!order_id || !method || !target_qty) {
      
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine workcenter based on method
    const workcenters = {
      SILKSCREEN: "PRINTING",
      SUBLIMATION: "PRINTING",
      DTF: "PRINTING",
      EMBROIDERY: "EMB",
    };

    const workcenter =
      workcenters[method as keyof typeof workcenters] || "PRINTING";

    // Get order to retrieve workspace_id
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      select: { workspace_id: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Create print run
    const printRun = await prisma.printRun.create({
      data: {
        workspace_id: order.workspace_id,
        order_id,
        routing_step_id: routing_step_id || null,
        machine_id: machine_id || null,
        method,
        workcenter,
        status: "CREATED",
        created_by: "system", // In real app, get from auth
        // Add initial output record
        outputs: {
          create: {
            qty_good: 0,
            qty_reject: 0,
            notes: `Target quantity: ${target_qty}`,
          },
        },
      },
      include: {
        order: {
          include: {
            brand: true,
            line_items: true,
          },
        },
        machine: true,
        outputs: true,
      },
        
      
        });

    return NextResponse.json({
      success: true,
      data: printRun,
      });
    } catch (error) {
    console.error("Create print run error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create print run" },
      { status: 500 }
    );
  }
});

function getMethodSpecificData(run: any) {
  switch (run.method) {
    case "SILKSCREEN":
      return {
        screens: run.silkscreen_prep,
        specs: run.silkscreen_specs,
        curing: run.curing_logs,
      };
    case "SUBLIMATION":
      return {
        prints: run.sublimation_prints,
        heat_press: run.heat_press_logs,
      };
    case "DTF":
      return {
        prints: run.dtf_prints,
        powder_curing: run.dtf_powder_cures,
      };
    case "EMBROIDERY":
      return {
        runs: run.embroidery_runs,
      };
    default:
      return {};
  }
}
