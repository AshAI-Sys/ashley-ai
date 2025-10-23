/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { disposition } = await request.json();

    // Get inspection with current defect counts
    const inspection = await prisma.qCInspection.findUnique({
      where: { id: params.id },
      include: {
        defects: true,
        order: true,
      },
      });

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    // Calculate total defects by severity
    const criticalDefects = inspection.defects.filter(
      d => d.severity === "CRITICAL"
    ).length;
    const majorDefects = inspection.defects.filter(
      d => d.severity === "MAJOR"
    ).length;
    const minorDefects = inspection.defects.filter(
      d => d.severity === "MINOR"
    ).length;

    // Auto-determine pass/fail based on AQL
    const totalDefects = criticalDefects + majorDefects + minorDefects;
    const result = totalDefects <= inspection.acceptance ? "PASSED" : "FAILED";
    const status = disposition === "PASSED" ? "PASSED" : "FAILED";

    // Update inspection
    const updatedInspection = await prisma.qCInspection.update({
      where: { id: params.id },
      data: {
        status: "CLOSED",
        result: status,
        disposition,
        critical_found: criticalDefects,
        major_found: majorDefects,
        minor_found: minorDefects,
        hold_shipment: status === "FAILED",
        completed_at: new Date(),
        closed_at: new Date(),
      },
      });

    // If failed, create CAPA task
    if (status === "FAILED") {
      await prisma.cAPATask.create({
        data: {
          workspace_id: inspection.workspace_id,
          order_id: inspection.order_id,
          capa_number: `CAPA-${Date.now()}`,
          title: `QC Failure - ${inspection.order.order_number}`,
          type: "CORRECTIVE",
          priority: "HIGH",
          source_type: "QC_INSPECTION",
          source_id: inspection.id,
          inspection_id: inspection.id,
          root_cause: "QC inspection failed AQL standards",
          created_by: inspection.inspector_id,
        },
      }

    return NextResponse.json({
      ...updatedInspection,
      autoResult: result,
      actualResult: status,
  } catch (error) {
    console.error("Error closing inspection:", error);
    return NextResponse.json(
      { error: "Failed to close inspection" },
      { status: 500 }
    );
  }
};
});
