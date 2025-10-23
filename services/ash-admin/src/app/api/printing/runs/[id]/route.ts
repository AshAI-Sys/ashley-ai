import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (
  request: NextRequest,
  user,
  context: { params: { id: string } }
) => {
  try {
    const runId = context.params.id;

    const run = await prisma.printRun.findUnique({
      where: { id: runId },
      include: {
        order: {
          include: {
            brand: true,
            line_items: true,
            bundles: true,
          },
        },
        machine: true,
        routing_step: true,
        outputs: {
          include: {
            bundle: true,
          },
        },
        rejects: {
          include: {
            bundle: true,
          },
        },
        materials: true,
        // Method-specific includes
        silkscreen_prep: true,
        silkscreen_specs: true,
        curing_logs: {
          include: {
            dryer: true,
          },
        },
        sublimation_prints: {
          include: {
            printer: true,
          },
        },
        heat_press_logs: {
          include: {
            press: true,
          },
        },
        dtf_prints: true,
        dtf_powder_cures: true,
        embroidery_runs: {
          include: {
            design: true,
          },
        },
      },

    if (!run) {
      return NextResponse.json(
        { success: false, error: "Print run not found" },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedRun = {
      ...run,
      target_qty:
        run.outputs.reduce((sum, o) => sum + o.qty_good + o.qty_reject, 0) ||
        100,
      completed_qty: run.outputs.reduce((sum, o) => sum + o.qty_good, 0),
      rejected_qty: run.rejects.reduce((sum, r) => sum + r.qty, 0),
      runtime_minutes:
        run.started_at && run.ended_at
          ? Math.round(
              (new Date(run.ended_at).getTime() -
                new Date(run.started_at).getTime()) /
                60000
            )
          : null,
      method_details: getMethodDetails(run),
    };

    return NextResponse.json({
      success: true,
      data: transformedRun,
  } catch (error) {
    console.error("Get print run error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch print run" },
      { status: 500 }
    );
  }
}

export const PATCH = requireAuth(async (
  request: NextRequest,
  user,
  context: { params: { id: string } }
) => {
  try {
    const runId = context.params.id;
    const body = await request.json();
    const { status, notes, material_consumption, quality_data } = body;

    // Update print run
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === "IN_PROGRESS" && !(await getRunStartTime(runId))) {
        updateData.started_at = new Date();
    }
      if (status === "DONE") {
        updateData.ended_at = new Date();
      }

    const updatedRun = await prisma.printRun.update({
      where: { id: runId },
      data: updateData,
      include: {
        order: {
          include: {
            brand: true,
            line_items: true,
          },
        },
        machine: true,
        outputs: true,
        rejects: true,
        materials: true,
      },

    // Handle material consumption if provided
    if (material_consumption && Array.isArray(material_consumption)) {
      await Promise.all(
        material_consumption.map((material: any) =>
          prisma.printRunMaterial.create({
            data: {
              run_id: runId,
              item_id: material.item_id,
              uom: material.uom,
              qty: material.qty,
              source_batch_id: material.source_batch_id || null,
            },
          })
        )
      );
    }

    // Handle quality data if provided
    if (quality_data) {
      const { qty_good, qty_reject, bundle_id, reject_reasons } = quality_data;

      // Create output record
      if (qty_good > 0) {
        await prisma.printRunOutput.create({
          data: {
            run_id: runId,
            bundle_id: bundle_id || null,
            qty_good,
            qty_reject: qty_reject || 0,
            notes: notes || null,
          },
        }

      // Create reject records if any
      if (qty_reject > 0 && reject_reasons) {
        await Promise.all(
          reject_reasons.map((reject: any) =>
            prisma.printReject.create({
              data: {
                run_id: runId,
                bundle_id: bundle_id || null,
                reason_code: reject.reason_code,
                qty: reject.qty,
                photo_url: reject.photo_url || null,
                cost_attribution: reject.cost_attribution || null,
              },
            })
          )
        );
      }

    return NextResponse.json({
      success: true,
      data: updatedRun,
  } catch (error) {
    console.error("Update print run error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update print run" },
      { status: 500 }
    );
  }
}

async function getRunStartTime(runId: string) {
  const run = await prisma.printRun.findUnique({
    where: { id: runId },
    select: { started_at: true },
  return run?.started_at;
}

function getMethodDetails(run: any) {
  switch (run.method) {
    case "SILKSCREEN":
      return {
        type: "silkscreen",
        preparation: run.silkscreen_prep,
        specifications: run.silkscreen_specs,
        curing: run.curing_logs.map((log: any) => ({
          ...log,
          dryer_name: log.dryer?.name || "Unknown",
        })),
      };
    case "SUBLIMATION":
      return {
        type: "sublimation",
        prints: run.sublimation_prints.map((print: any) => ({
          ...print,
          printer_name: print.printer?.name || "Unknown",
        })),
        heat_press: run.heat_press_logs.map((log: any) => ({
          ...log,
          press_name: log.press?.name || "Unknown",
        })),
      };
    case "DTF":
      return {
        type: "dtf",
        prints: run.dtf_prints,
        powder_curing: run.dtf_powder_cures,
      };
    case "EMBROIDERY":
      return {
        type: "embroidery",
        runs: run.embroidery_runs.map((embRun: any) => ({
          ...embRun,
          design_file: embRun.design?.files
            ? JSON.parse(embRun.design.files).dst_url
            : null,
        })),
      };
    default:
      return { type: "unknown" };
  }
});
