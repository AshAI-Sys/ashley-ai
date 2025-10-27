/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { defectDetectionAI } from "@/lib/ai/defect-detection";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/ai/defect-detection/patterns - Analyze defect patterns
export const GET = requireAuth(async (req: NextRequest, _user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    const _operator_id = searchParams.get("operator_id");
    const _station = searchParams.get("station");

    // Build where clause
    const whereClause: any = {
      created_at: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      },
    };

    // Get QC checks
    const qcChecks = await prisma.qCInspection.findMany({
      where: {
        ...whereClause,
        workspace_id: "default",
      },
      include: {
        order: true,
        inspector: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (qcChecks.length === 0) {
      
      return NextResponse.json({
        success: true,
        pattern_analysis: {
          pattern_type: "INSUFFICIENT_DATA",
          defect_rate: 0,
          common_defects: [],
          root_causes: [],
          prevention_tips: [],
        },
        total_inspections: 0,
      });
    }

    // Transform QC checks into inspection format
    const inspections = qcChecks.map(qc => {
      // Parse defects from notes or create simulated defects
      const defects: any[] = [];

      // Calculate total defects from critical + major + minor
      const totalDefects =
        (qc.critical_found || 0) +
        (qc.major_found || 0) +
        (qc.minor_found || 0);

      // If we have defects, simulate defect data
      if (totalDefects > 0) {
        for (let i = 0; i < totalDefects; i++) {
          defects.push({
            type: "UNKNOWN",
            severity: qc.status === "FAILED" ? "MAJOR" : "MINOR",
            confidence: 85,
            description: qc.notes || "Defect detected",
            recommendation: "Review and address defect",
          });
        }
      }

      return {
        date: qc.created_at,
        operator_id: qc.inspector_id,
        station: qc.stage || "UNKNOWN",
        defects,
      };
    });

    // Analyze patterns
    const patternAnalysis =
      await defectDetectionAI.analyzeDefectPatterns(inspections);

    return NextResponse.json({
      success: true,
      pattern_analysis: patternAnalysis,
      total_inspections: inspections.length,
      date_range: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    });
  } catch (error: any) {
    console.error("Pattern analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze patterns", details: error.message },
      { status: 500 }
    );
  }
});

// POST /api/ai/defect-detection/patterns/compare - Compare quality between operators/stations
export const POST = requireAuth(async (req: NextRequest, _user) => {
  try {
    const { entity_type, days = 30 } = await req.json();

    if (!entity_type || !["operator", "station"].includes(entity_type)) {
      return NextResponse.json(
        { error: 'entity_type must be "operator" or "station"' },
        { status: 400 }
      );
    }

    // Get QC checks with AI results
    const qcChecks = await prisma.qCInspection.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
        workspace_id: "default",
      },
      include: {
        order: true,
        inspector: true,
      },
    });

    if (qcChecks.length === 0) {
      
      return NextResponse.json({
        success: true,
        comparison: [],
        message: "No AI vision inspections found",
      });
    }

    // Group by entity (operator or station)
    const entityGroups: Record<string, any[]> = {};

    qcChecks.forEach(qc => {
      let entityId: string;
      let entityName: string;

      if (entity_type === "operator") {
        entityId = qc.inspector_id || "UNKNOWN";
        entityName = qc.inspector
          ? `${qc.inspector.first_name} ${qc.inspector.last_name}`
          : "Unknown Operator";
      } else {
        entityId = qc.stage || "UNKNOWN";
        entityName = qc.stage || "Unknown Station";
      }

      if (!entityGroups[entityId]) {
        entityGroups[entityId] = [];
      }

      // Calculate total defects from critical + major + minor
      const totalDefects =
        (qc.critical_found || 0) +
        (qc.major_found || 0) +
        (qc.minor_found || 0);

      // Create simulated defect detection result
      const result = {
        defects_found: totalDefects,
        quality_score: qc.status === "PASSED" ? 95 : 70,
        detected_defects: [],
        confidence: 90,
        pass_fail: qc.status === "PASSED" ? "PASS" : "FAIL",
        analysis_time_ms: 500,
        model_version: "v1.0.0",
      };

      entityGroups[entityId]!.push({
        entity_id: entityId,
        entity_name: entityName,
        result,
      });
    });

    // Prepare data for comparison
    const comparisonData = Object.entries(entityGroups).map(
      ([entityId, inspections]) => ({
        entity_id: entityId,
        entity_name: inspections[0].entity_name,
        inspections: inspections.map(i => i.result),
      })
    );

    // Perform comparison
    const comparison = await defectDetectionAI.compareQuality(comparisonData);

    return NextResponse.json({
      success: true,
      comparison,
      entity_type,
      total_entities: comparison.length,
    });
  } catch (error: any) {
    console.error("Quality comparison error:", error);
    return NextResponse.json(
      { error: "Failed to compare quality", details: error.message },
      { status: 500 }
    );
  }
});