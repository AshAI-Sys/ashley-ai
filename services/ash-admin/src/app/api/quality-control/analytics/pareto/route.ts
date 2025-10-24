/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    // Get defect counts by type
    const defectData = (await prisma.$queryRaw`
      SELECT
        dc.code as defect_code,
        dc.name as defect_name,
        dc.category,
        COUNT(*) as defect_count,
        SUM(qd.quantity) as total_quantity
      FROM qc_defects qd
      JOIN qc_defect_codes dc ON qd.defect_code_id = dc.id
      JOIN qc_inspections qi ON qd.inspection_id = qi.id
      WHERE qi.inspection_date >= ${startDate}
        AND qi.inspection_date <= ${endDate});
      GROUP BY dc.id, dc.code, dc.name, dc.category
      ORDER BY total_quantity DESC
    `) as Array<{
      defect_code: string;
      defect_name: string;
      category: string;
      defect_count: bigint;
      total_quantity: bigint;
    }>;

    if (defectData.length === 0) {
      return NextResponse.json([]);
    }

    // Convert to Pareto data
    const totalDefects = defectData.reduce(
      (sum, item) => sum + Number(item.total_quantity),
      0
    );

    let cumulativeCount = 0;
    const paretoData = defectData.map(item => {
      const count = Number(item.total_quantity);
      const percentage = (count / totalDefects) * 100;
      cumulativeCount += count;
      const cumulativePercentage = (cumulativeCount / totalDefects) * 100;

      return {
        defect_code: item.defect_code,
        defect_name: item.defect_name,
        category: item.category,
        count: count,
        occurrences: Number(item.defect_count),
        percentage: percentage,
        cumulative_percentage: cumulativePercentage,
      };

    return NextResponse.json(paretoData);
  } catch (error) {
    console.error("Error generating Pareto data:", error);
    return NextResponse.json(
      { error: "Failed to generate Pareto data" },
      { status: 500 }
    );
  });