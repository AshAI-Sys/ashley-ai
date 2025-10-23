/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import {
  createSuccessResponse,
  withErrorHandling,
  NotFoundError,
} from "@/lib/error-handling";

export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {;
    const employeeId = params.id;

    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      });

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Calculate production stats based on department
    let totalPieces = 0;
    let todayPieces = 0;
    let weekPieces = 0;
    let tasksCompleted = 0;

    if (employee.department === "Sewing") {
      // Count pieces from sewing runs
      const sewingRuns = await prisma.sewingRun.findMany({
        where: { operator_id: employeeId },
      }

      totalPieces = sewingRuns.reduce(
        (sum, run) => sum + (run.qty_good || 0),
        0
      );

      const todayRuns = sewingRuns.filter(
        run => run.created_at >= today && run.created_at < tomorrow
      );
      todayPieces = todayRuns.reduce(
        (sum, run) => sum + (run.qty_good || 0),
        0
      );

      const weekRuns = sewingRuns.filter(
        run => run.created_at >= weekStart && run.created_at < weekEnd
      );
      weekPieces = weekRuns.reduce((sum, run) => sum + (run.qty_good || 0), 0);

      tasksCompleted = sewingRuns.filter(
        run => run.status === "COMPLETED"
      ).length;
    } else if (employee.department === "Quality Control") {
      // Count QC inspections
      const qcInspections = await prisma.qCInspection.findMany({
        where: { inspector_id: employeeId },
      }

      totalPieces = qcInspections.length;

      const todayInspections = qcInspections.filter(
        check => check.created_at >= today && check.created_at < tomorrow
      );
      todayPieces = todayInspections.length;

      const weekInspections = qcInspections.filter(
        check => check.created_at >= weekStart && check.created_at < weekEnd
      );
      weekPieces = weekInspections.length;

      tasksCompleted = qcInspections.filter(
        check => check.status === "CLOSED"
      ).length;
    } else if (employee.department === "Cutting") {
      // Count cut lays (no cutter tracking in schema)
      const cutLays = await prisma.cutLay.findMany({
        where: {
          created_by: employeeId,
        },
        include: {
          bundles: true,
          outputs: true,
        },
      }

      totalPieces = cutLays.reduce((sum, lay) => sum + lay.bundles.length, 0);

      const todayLays = cutLays.filter(
        lay => lay.created_at >= today && lay.created_at < tomorrow
      );
      todayPieces = todayLays.reduce((sum, lay) => sum + lay.bundles.length, 0);

      const weekLays = cutLays.filter(
        lay => lay.created_at >= weekStart && lay.created_at < weekEnd
      );
      weekPieces = weekLays.reduce((sum, lay) => sum + lay.bundles.length, 0);

      tasksCompleted = cutLays.filter(lay =>
        lay.bundles.every(b => b.status === "DONE")
      ).length;
    } else if (employee.department === "Printing") {
      // Count print runs (no printer tracking in schema, use created_by)
      const printRuns = await prisma.printRun.findMany({
        where: {
          created_by: employeeId,
        },
        include: {
          outputs: true,
        },
      }

      totalPieces = printRuns.reduce(
        (sum, run) => sum + run.outputs.reduce((s, o) => s + o.qty_good, 0),
        0
      );

      const todayRuns = printRuns.filter(
        run => run.created_at >= today && run.created_at < tomorrow
      );
      todayPieces = todayRuns.reduce(
        (sum, run) => sum + run.outputs.reduce((s, o) => s + o.qty_good, 0),
        0
      );

      const weekRuns = printRuns.filter(
        run => run.created_at >= weekStart && run.created_at < weekEnd
      );
      weekPieces = weekRuns.reduce(
        (sum, run) => sum + run.outputs.reduce((s, o) => s + o.qty_good, 0),
        0
      );

      tasksCompleted = printRuns.filter(run => run.status === "DONE").length;

    // Calculate efficiency rate (simplified - can be enhanced based on targets)
    const targetPiecesPerDay = employee.salary_type === "PIECE" ? 200 : 100;
    const efficiencyRate =
      targetPiecesPerDay > 0
        ? Math.min(Math.round((todayPieces / targetPiecesPerDay) * 100), 100)
        : 0;

    // Quality score (simplified - based on QC if applicable)
    let qualityScore = 95; // Default quality score

    if (employee.department === "Sewing" || employee.department === "Cutting") {
      const recentInspections = await prisma.qCInspection.findMany({
        where: {
          created_at: {
            gte: weekStart,
          },
        },
        take: 10,
      });

      if (recentInspections.length > 0) {
        const passedInspections = recentInspections.filter(
          check => check.result === "PASSED"
        ).length;
        qualityScore = Math.round(
          (passedInspections / recentInspections.length) * 100
        );
      }

    const stats = {
      total_pieces: totalPieces,
      today_pieces: todayPieces,
      week_pieces: weekPieces,
      efficiency_rate: efficiencyRate,
      quality_score: qualityScore,
      tasks_completed: tasksCompleted,
    };

    return createSuccessResponse(stats);
  }
);
