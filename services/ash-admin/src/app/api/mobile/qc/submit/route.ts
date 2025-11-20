/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { formatDate as formatDateUtil } from "@/lib/utils/date";

export const dynamic = 'force-dynamic';


const prisma = db;

// POST /api/mobile/qc/submit - Submit mobile QC inspection
export const POST = requireAuth(async (req: NextRequest, _user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const userId = req.headers.get("x-user-id") || "mobile-qc";
    const body = await req.json();

    const {
      bundle_id,
      order_id,
      sample_size,
      inspected, passed,
      failed,
      defects, photos,
      notes, inspector_name,
    } = body;

    if (!bundle_id || !order_id) {
      
      return NextResponse.json(
        { success: false, error: "Bundle ID and Order ID are required" },
        { status: 400 }
      );
    }

    // Calculate defect rate
    const defectRate = inspected > 0 ? (failed / inspected) * 100 : 0;

    // Determine AQL result (simplified - 2.5% AQL)
    const aqlResult = defectRate <= 2.5 ? "PASS" : "FAIL";

    // Create QC inspection
    const inspection = await prisma.qCInspection.create({
      data: {
        workspace_id: workspaceId,
        order_id,
        inspection_date: new Date(),
        stage: "FINAL",
        inspection_level: "GII",
        aql: 2.5,
        lot_size: inspected,
        sample_size,
        acceptance: Math.floor(sample_size * 0.025), // 2.5% AQL
        rejection: Math.floor(sample_size * 0.025) + 1,
        minor_found: failed,
        status: aqlResult === "PASS" ? "PASSED" : "FAILED",
        result: aqlResult,
        inspector_id: userId,
        notes,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create defect records
    if (defects && defects.length > 0) {
      await Promise.all(
        defects.map((defect: any) =>
          prisma.qCDefect.create({
            data: {
              workspace_id: workspaceId,
              inspection_id: inspection.id,
              defect_type_id: defect.defect_type_id,
              defect_code_id: defect.defect_code_id || defect.defect_type_id, // fallback
              severity: defect.severity,
              quantity: defect.quantity || 1,
              location: "Production Floor",
              description: `Detected via mobile QC at ${(defect.timestamp ? formatDateUtil(defect.timestamp, "datetime") : "-")}`,
              created_at: new Date(),
            },
          })
        )
      );
    }

    // Update bundle status based on result
    await prisma.bundle.update({
      where: { id: bundle_id },
      data: {
        status: aqlResult === "PASS" ? "QC_PASSED" : "QC_FAILED",
        updated_at: new Date(),
      },
    });

    // Create CAPA task if failed
    if (aqlResult === "FAIL") {
      await prisma.cAPATask
        .create({
          data: {
            workspace_id: workspaceId,
            order_id,
            inspection_id: inspection.id,
            capa_number: `CAPA-${Date.now()}`,
            title: `QC Failure - Bundle ${bundle_id}`,
            type: "CORRECTIVE",
            priority: defectRate > 10 ? "HIGH" : "MEDIUM",
            status: "OPEN",
            source_type: "QC_INSPECTION",
            source_id: inspection.id,
            notes: `QC inspection failed with ${defectRate.toFixed(2)}% defect rate. ${failed} out of ${inspected} units failed inspection.`,
            root_cause: "To be determined",
            corrective_action: "Pending investigation",
            created_by: userId,
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
        .catch(() => {
          console.log("CAPA task creation skipped");
        });
    }

    return NextResponse.json({
      success: true,
      inspection: {
        id: inspection.id,
        result: aqlResult,
        defect_rate: defectRate,
      },
      message: `Inspection ${aqlResult === "PASS" ? "passed" : "failed"} - ${defectRate.toFixed(2)}% defect rate`,
    });
  } catch (error: any) {
    console.error("QC submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
  });
