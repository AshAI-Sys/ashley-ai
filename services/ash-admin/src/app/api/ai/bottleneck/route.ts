import { NextRequest, NextResponse } from "next/server";
import { bottleneckDetectionAI } from "@/lib/ai/bottleneck-detection";
import { prisma } from "@/lib/db";

// GET /api/ai/bottleneck - Detect bottlenecks in production system
export async function GET(req: NextRequest) {
  try {
    // Get production metrics for all active stations
    const [cutLays, sewingRuns, printRuns, qcInspections, finishingRuns] =
      await Promise.all([
        prisma.cutLay.findMany({
          where: {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
          include: { bundles: true },
          take: 50,
        }),
        prisma.sewingRun.findMany({
          where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
          include: { operator: true },
          take: 50,
        }),
        prisma.printRun.findMany({
          where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
          take: 50,
        }),
        prisma.qCInspection.findMany({
          where: {
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
          take: 50,
        }),
        prisma.finishingRun.findMany({
          where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
          take: 50,
        }),
      ]);

    // Build metrics for each station type
    const metrics: any[] = [];

    // Cutting station metrics
    if (cutLays.length > 0) {
      const totalBundles = cutLays.reduce(
        (sum, lay) => sum + lay.bundles.length,
        0
      );
      // Calculate efficiency based on material usage (less offcuts/defects = higher efficiency)
      const avgEfficiency =
        cutLays.reduce((sum, lay) => {
          const wastePercentage =
            (((lay.offcuts || 0) + (lay.defects || 0)) / lay.gross_used) * 100;
          const efficiency = Math.max(0, 100 - wastePercentage);
          return sum + efficiency;
        }, 0) / cutLays.length;

      metrics.push({
        station_id: "CUTTING_MAIN",
        station_name: "Cutting Department",
        station_type: "CUTTING",
        current_throughput: avgEfficiency * 0.5, // Simplified calculation
        expected_throughput: 50, // Expected units per hour
        queue_length: totalBundles,
        avg_wait_time_minutes: totalBundles * 5, // Simplified
        utilization_rate: Math.min(avgEfficiency, 100),
        operator_count: 5,
        active_operators: cutLays.length,
        defect_rate: 2, // Simplified
        timestamp: new Date(),
      });
    }

    // Printing station metrics
    if (printRuns.length > 0) {
      // Calculate total good quantity from outputs instead of non-existent quantity field
      const totalGood = printRuns.reduce((sum, run) => {
        // Note: Need to fetch outputs separately since they're not included
        return sum + 100; // Simplified for now
      }, 0);

      metrics.push({
        station_id: "PRINTING_MAIN",
        station_name: "Printing Department",
        station_type: "PRINTING",
        current_throughput: 30,
        expected_throughput: 40,
        queue_length: printRuns.length * 10,
        avg_wait_time_minutes: printRuns.length * 15,
        utilization_rate: 75,
        operator_count: 3,
        active_operators: 3,
        defect_rate: 3,
        timestamp: new Date(),
      });
    }

    // Sewing station metrics
    if (sewingRuns.length > 0) {
      const totalPieces = sewingRuns.reduce(
        (sum, run) => sum + (run.qty_good || 0),
        0
      );
      const totalReject = sewingRuns.reduce(
        (sum, run) => sum + (run.qty_reject || 0),
        0
      );
      const totalTarget = totalPieces + totalReject; // Calculate target from actual production
      const efficiency =
        totalTarget > 0 ? (totalPieces / totalTarget) * 100 : 80;

      metrics.push({
        station_id: "SEWING_MAIN",
        station_name: "Sewing Department",
        station_type: "SEWING",
        current_throughput: totalPieces / sewingRuns.length,
        expected_throughput: totalTarget / sewingRuns.length,
        queue_length:
          sewingRuns.filter(r => r.status === "PENDING").length * 20,
        avg_wait_time_minutes: 45,
        utilization_rate: Math.min(efficiency, 100),
        operator_count: 15,
        active_operators: sewingRuns.length,
        defect_rate: totalTarget > 0 ? (totalReject / totalTarget) * 100 : 0,
        timestamp: new Date(),
      });
    }

    // QC station metrics
    if (qcInspections.length > 0) {
      const failedInspections = qcInspections.filter(
        qc => qc.result === "REJECT"
      ).length;
      const defectRate = (failedInspections / qcInspections.length) * 100;

      metrics.push({
        station_id: "QC_MAIN",
        station_name: "Quality Control",
        station_type: "QC",
        current_throughput: 25,
        expected_throughput: 35,
        queue_length: qcInspections.filter(qc => qc.status === "PENDING")
          .length,
        avg_wait_time_minutes: 30,
        utilization_rate: 70,
        operator_count: 4,
        active_operators: 3,
        defect_rate: defectRate,
        timestamp: new Date(),
      });
    }

    // Finishing station metrics
    if (finishingRuns.length > 0) {
      metrics.push({
        station_id: "FINISHING_MAIN",
        station_name: "Finishing & Packing",
        station_type: "FINISHING",
        current_throughput: 40,
        expected_throughput: 45,
        queue_length:
          finishingRuns.filter(r => r.status === "PENDING").length * 15,
        avg_wait_time_minutes: 20,
        utilization_rate: 85,
        operator_count: 6,
        active_operators: finishingRuns.length,
        defect_rate: 1,
        timestamp: new Date(),
      });
    }

    if (metrics.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active production stations to analyze",
        analysis: {
          detected_bottlenecks: [],
          primary_bottleneck: null,
          overall_efficiency: 100,
          system_throughput: 0,
          optimal_throughput: 0,
          efficiency_loss_percent: 0,
          critical_path: [],
          recommendations: ["No active production - system idle"],
          predicted_completion_delays: [],
        },
      });
    }

    // Analyze production system
    const analysis =
      await bottleneckDetectionAI.analyzeProductionSystem(metrics);

    return NextResponse.json({
      success: true,
      analysis,
      analyzed_at: new Date(),
      stations_analyzed: metrics.length,
    });
  } catch (error: any) {
    console.error("Bottleneck detection error:", error);
    return NextResponse.json(
      { error: "Failed to detect bottlenecks", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/ai/bottleneck/station - Analyze specific station
export async function POST(req: NextRequest) {
  try {
    const metrics = await req.json();

    // Validate required fields
    const requiredFields = [
      "station_id",
      "station_name",
      "station_type",
      "current_throughput",
      "expected_throughput",
      "queue_length",
      "avg_wait_time_minutes",
      "utilization_rate",
      "operator_count",
      "active_operators",
      "defect_rate",
    ];

    const missingFields = requiredFields.filter(field => !(field in metrics));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    metrics.timestamp = new Date();

    // Detect bottleneck at this station
    const detection =
      await bottleneckDetectionAI.detectStationBottleneck(metrics);

    return NextResponse.json({
      success: true,
      detection,
      analyzed_at: new Date(),
    });
  } catch (error: any) {
    console.error("Station bottleneck detection error:", error);
    return NextResponse.json(
      { error: "Failed to detect station bottleneck", details: error.message },
      { status: 500 }
    );
  }
}
