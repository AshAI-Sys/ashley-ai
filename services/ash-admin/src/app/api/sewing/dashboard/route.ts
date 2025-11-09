/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


export const GET = requireAuth(async (_request: NextRequest, _user) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count active sewing runs
    const activeRuns = await prisma.sewingRun.count({
      where: {
        status: "IN_PROGRESS",
      },
      });

    // Count completed runs today
    const todaysCompleted = await prisma.sewingRun.count({
      where: {
        status: "DONE",
        created_at: {
          gte: today,
        },
      },
      });

    // Count unique operators working today
    const operatorsWorkingResult = await prisma.sewingRun.findMany({
      where: {
        status: {
          in: ["IN_PROGRESS", "DONE"],
        },
        created_at: {
          gte: today,
        },
      },
      select: {
        operator_id: true,
      },
      distinct: ["operator_id"],
    });
    const operatorsWorking = operatorsWorkingResult.length;

    // Calculate average efficiency
    const runsWithEfficiency = await prisma.sewingRun.findMany({
      where: {
        efficiency_pct: {
          not: null,
        },
        created_at: {
          gte: today,
        },
      },
      select: {
        efficiency_pct: true,
      },
      });

    const avgEfficiency =
      runsWithEfficiency.length > 0
        ? Math.round(
            runsWithEfficiency.reduce(
              (sum: any, run: any) => sum + (run.efficiency_pct || 0),
              0
            ) / runsWithEfficiency.length
          )
        : 0;

    // Count pending bundles (runs not started yet)
    const pendingBundles = await prisma.sewingRun.count({
      where: {
        status: "PENDING",
      },
      });

    // Calculate total pieces completed today
    const completedRuns = await prisma.sewingRun.findMany({
      where: {
        status: "DONE",
        created_at: {
          gte: today,
        },
      },
      select: {
        qty_good: true,
      },
      });

    const totalPiecesToday = completedRuns.reduce(
      (sum: any, run: any) => sum + (run.qty_good || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        active_runs: activeRuns,
        todays_completed: todaysCompleted,
        operators_working: operatorsWorking,
        avg_efficiency: avgEfficiency,
        pending_bundles: pendingBundles,
        total_pieces_today: totalPiecesToday,
      },
    });
  } catch (error) {
    console.error("Error fetching sewing dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
});

