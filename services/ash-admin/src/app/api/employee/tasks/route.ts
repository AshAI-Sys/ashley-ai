import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import {
  createSuccessResponse,
  withErrorHandling,
} from "../../../../lib/error-handling";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const position = searchParams.get("position");

  if (!department) {
    return NextResponse.json(
      { success: false, error: "Department is required" },
      { status: 400 }
    );
  }

  let tasks: any[] = [];

  // Get department-specific tasks
  switch (department) {
    case "Cutting":
      // Get pending cut lays
      const cutLays = await prisma.cutLay.findMany({
        where: {
          workspace_id: department,
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true },
              },
            },
          },
          bundles: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      });

      tasks = cutLays.map(lay => ({
        id: lay.id,
        type: "CUTTING",
        title: `Cut Lay - ${lay.order.client.name}`,
        description: `${lay.bundles.length} bundles for Order ${lay.order.order_number}`,
        status: lay.bundles.every(b => b.status === "DONE")
          ? "COMPLETED"
          : "IN_PROGRESS",
        priority: lay.bundles.length > 50 ? "HIGH" : "MEDIUM",
        due_date: null,
        created_at: lay.created_at.toISOString(),
      }));
      break;

    case "Printing":
      // Get pending print runs
      const printRuns = await prisma.printRun.findMany({
        where: {
          status: {
            in: ["CREATED", "IN_PROGRESS"],
          },
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      });

      tasks = printRuns.map(run => ({
        id: run.id,
        type: "PRINTING",
        title: `${run.method} - ${run.order.client.name}`,
        description: `Print for Order ${run.order.order_number}`,
        status: run.status,
        priority: "MEDIUM",
        due_date: null,
        created_at: run.created_at.toISOString(),
      }));
      break;

    case "Sewing":
      // Get pending sewing runs
      const sewingRuns = await prisma.sewingRun.findMany({
        where: {
          status: {
            in: ["CREATED", "IN_PROGRESS"],
          },
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      });

      tasks = sewingRuns.map(run => ({
        id: run.id,
        type: "SEWING",
        title: `Sewing - ${run.order.client.name}`,
        description: `Sew ${run.qty_good + run.qty_reject} pieces for Order ${run.order.order_number}`,
        status: run.status,
        priority: run.qty_good + run.qty_reject > 200 ? "HIGH" : "MEDIUM",
        due_date: null,
        created_at: run.created_at.toISOString(),
      }));
      break;

    case "Quality Control":
      // Get pending QC inspections
      const qcInspections = await prisma.qCInspection.findMany({
        where: {
          status: {
            in: ["OPEN", "PASSED"],
          },
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      });

      tasks = qcInspections.map(check => ({
        id: check.id,
        type: "QC",
        title: `QC Inspection - ${check.order.client.name}`,
        description: `Inspect ${check.lot_size} units for Order ${check.order.order_number}`,
        status: check.status === "OPEN" ? "IN_PROGRESS" : "COMPLETED",
        priority: check.result === "FAILED" ? "HIGH" : "MEDIUM",
        due_date: null,
        created_at: check.created_at.toISOString(),
      }));
      break;

    case "Finishing":
      // Get pending finishing runs
      const finishingRuns = await prisma.finishingRun.findMany({
        where: {
          status: {
            in: ["PENDING", "IN_PROGRESS"],
          },
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      });

      tasks = finishingRuns.map(run => ({
        id: run.id,
        type: "FINISHING",
        title: `Finishing - ${run.order.client.name}`,
        description: `Finish for Order ${run.order.order_number}`,
        status: run.status,
        priority: "MEDIUM",
        due_date: null,
        created_at: run.created_at.toISOString(),
      }));
      break;

    case "Warehouse":
      // Get pending shipments
      const shipments = await prisma.shipment.findMany({
        where: {
          status: {
            in: ["READY_FOR_PICKUP"],
          },
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      });

      tasks = shipments.map(shipment => ({
        id: shipment.id,
        type: "WAREHOUSE",
        title: `Shipment - ${shipment.order.client.name}`,
        description: `Prepare shipment for Order ${shipment.order.order_number}`,
        status: "PENDING",
        priority: "MEDIUM",
        due_date: null,
        created_at: shipment.created_at.toISOString(),
      }));
      break;

    default:
      // For other departments, return empty array or generic tasks
      tasks = [];
  }

  return createSuccessResponse(tasks);
});
