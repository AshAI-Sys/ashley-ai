import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const runId = params.id;
    const body = await request.json();
    const {
      qty_completed,
      qty_rejected = 0,
      reject_reasons = [],
      material_consumption = [],
      quality_notes,
      ashley_feedback,
    } = body;

    // Check if run exists and can be completed
    const run = await prisma.printRun.findUnique({
      where: { id: runId },
      include: {
        outputs: true,
        rejects: true,
      },

    if (!run) {
      return NextResponse.json(
        { success: false, error: "Print run not found" },
        { status: 404 }
      );
    }

    if (run.status !== "IN_PROGRESS" && run.status !== "PAUSED") {
      return NextResponse.json(
        {
          success: false,
          error: "Only in-progress or paused runs can be completed",
        },
        { status: 400 }
      );
    }

    // Start transaction to complete run
    await prisma.$transaction(async tx => {
      // Complete the run
      await tx.printRun.update({
        where: { id: runId },
        data: {
          status: "DONE",
          ended_at: new Date(),
        },

      // Record final output if provided
      if (qty_completed > 0 || qty_rejected > 0) {
        await tx.printRunOutput.create({
          data: {
            run_id: runId,
            qty_good: qty_completed,
            qty_reject: qty_rejected,
            notes: quality_notes || "Final run completion",
          },
        }

      // Record reject reasons if any
      if (qty_rejected > 0 && reject_reasons.length > 0) {
        for (const reject of reject_reasons) {
          await tx.printReject.create({
            data: {
              run_id: runId,
              reason_code: reject.reason_code,
              qty: reject.qty,
              photo_url: reject.photo_url || null,
              cost_attribution: reject.cost_attribution || "COMPANY",
            },
          });
        }

      // Record material consumption
      if (material_consumption.length > 0) {
        for (const material of material_consumption) {
          await tx.printRunMaterial.create({
            data: {
              run_id: runId,
              item_id: material.item_id,
              uom: material.uom,
              qty: material.qty,
              source_batch_id: material.source_batch_id || null,
            },
          });
        }

      // Update method-specific completion data
      await updateMethodSpecificCompletion(tx, runId, run.method, body);

      // Create Ashley AI final analysis
      await createFinalAnalysis(tx, runId, run, {
        qty_completed,
        qty_rejected,
        ashley_feedback,
      }

    // Fetch completed run data
    const completedRun = await prisma.printRun.findUnique({
      where: { id: runId },
      include: {
        order: {
          include: {
            brand: true,
          },
        },
        machine: true,
        outputs: true,
        rejects: true,
        materials: true,
      },

    return NextResponse.json({
      success: true,
      data: completedRun,
      message: "Print run completed successfully",
  } catch (error) {
    console.error("Complete print run error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete print run" },
      { status: 500 }
    );
  }
}

async function updateMethodSpecificCompletion(
  tx: any,
  runId: string,
  method: string,
  data: any
) {
  switch (method) {
    case "SILKSCREEN":
      // Update curing log if temperature data provided
      if (data.curing_temperature && data.curing_time) {
        await tx.curingLog.create({
          data: {
            run_id: runId,
            temp_c: data.curing_temperature,
            seconds: data.curing_time,
            belt_speed: data.belt_speed || "MEDIUM",
          },
        }

      // Update ink consumption in specs
      if (data.actual_ink_g) {
        await tx.silkscreenSpec.updateMany({
          where: { run_id: runId },
          data: { expected_ink_g: data.actual_ink_g },
        });
      }
      break;

    case "SUBLIMATION":
      // Update heat press log
      if (data.press_temperature && data.press_time) {
        await tx.heatPressLog.create({
          data: {
            run_id: runId,
            temp_c: data.press_temperature,
            seconds: data.press_time,
            pressure: data.press_pressure || "MEDIUM",
            cycles: data.press_cycles || 1,
          },
        });
      }
      break;

    case "DTF":
      // Update powder curing data
      if (data.powder_cure_temp && data.powder_cure_time) {
        await tx.dtfPowderCure.updateMany({
          where: { run_id: runId },
          data: {
            temp_c: data.powder_cure_temp,
            seconds: data.powder_cure_time,
          },
        }
      }
      break;

    case "EMBROIDERY":
      // Update embroidery run with actual data
      if (
        data.actual_stitch_count ||
        data.thread_breaks ||
        data.runtime_minutes
      ) {
        await tx.embroideryRun.updateMany({
          where: { run_id: runId },
          data: {
            ...(data.actual_stitch_count && {
              stitch_count: data.actual_stitch_count,
            }),
            ...(data.thread_breaks && { thread_breaks: data.thread_breaks }),
            ...(data.runtime_minutes && {
              runtime_minutes: data.runtime_minutes,
            }),
          },
        }
      }
      break;
  }
}

async function createFinalAnalysis(
  tx: any,
  runId: string,
  run: any,
  completionData: any
) {
  try {
    const totalCompleted = completionData.qty_completed || 0;
    const totalRejected = completionData.qty_rejected || 0;
    const totalProduced = totalCompleted + totalRejected;

    const qualityRate =
      totalProduced > 0 ? (totalCompleted / totalProduced) * 100 : 100;
    const efficiencyScore = calculateEfficiencyScore(run, completionData);

    const analysisData = {
      entity: "PRINT_RUN",
      entity_id: runId,
      stage: "COMPLETION",
      analysis_type: "PERFORMANCE_REVIEW",
      risk: qualityRate >= 95 ? "GREEN" : qualityRate >= 90 ? "AMBER" : "RED",
      confidence: 0.95,
      issues: JSON.stringify(identifyIssues(completionData)),
      recommendations: JSON.stringify(
        generateRecommendations(run.method, completionData)
      ),
      metadata: JSON.stringify({
        quality_rate: qualityRate,
        efficiency_score: efficiencyScore,
        total_produced: totalProduced,
        method: run.method,
        completion_time: new Date().toISOString(),
      }),
      result: JSON.stringify({
        overall_score: Math.round((qualityRate + efficiencyScore) / 2),
        quality_rating:
          qualityRate >= 95
            ? "EXCELLENT"
            : qualityRate >= 90
              ? "GOOD"
              : "NEEDS_IMPROVEMENT",
        efficiency_rating:
          efficiencyScore >= 90
            ? "HIGH"
            : efficiencyScore >= 80
              ? "MEDIUM"
              : "LOW",
        ashley_feedback: completionData.ashley_feedback || null,
      }),
      created_by: "system",
    };

    await tx.aIAnalysis.create({
      data: analysisData,
  } catch (error) {
    console.error("Error creating final analysis:", error);
  });
}

function calculateEfficiencyScore(run: any, completionData: any): number {
  // Simple efficiency calculation based on time and output
  if (!run.started_at || !completionData.qty_completed) return 50;

  const runtimeMinutes = Math.round(
    (new Date().getTime() - new Date(run.started_at).getTime()) / 60000
  );

  const expectedMinutesPerPiece = {
    SILKSCREEN: 2,
    SUBLIMATION: 3,
    DTF: 2.5,
    EMBROIDERY: 5,
  };

  const expectedMinutes =
    (expectedMinutesPerPiece[
      run.method as keyof typeof expectedMinutesPerPiece
    ] || 2) * completionData.qty_completed;
  const efficiency = Math.min(
    100,
    Math.round((expectedMinutes / runtimeMinutes) * 100)
  );

  return Math.max(0, efficiency);
}

function identifyIssues(completionData: any): string[] {
  const issues = [];

  if (completionData.qty_rejected > 0) {
    const rejectRate =
      (completionData.qty_rejected /
        (completionData.qty_completed + completionData.qty_rejected)) *
      100;
    if (rejectRate > 10) issues.push("High reject rate detected");
    if (rejectRate > 5) issues.push("Moderate reject rate - review process");
    }

  return issues;
}

function generateRecommendations(
  method: string,
  completionData: any
): string[] {
  const recommendations = [];

  // Method-specific recommendations
  switch (method) {
    case "SILKSCREEN":
      recommendations.push("Verify screen tension for next run");
      recommendations.push("Check ink viscosity and cure temperature");
      break;
    case "SUBLIMATION":
      recommendations.push("Monitor paper alignment and heat press pressure");
      break;
    case "DTF":
      recommendations.push("Check powder application consistency");
      break;
    case "EMBROIDERY":
      recommendations.push("Review thread tension and stabilizer selection");
      break;

  if (completionData.qty_rejected > 0) {
    recommendations.push("Implement additional quality checkpoints");
    }

  return recommendations;
};
