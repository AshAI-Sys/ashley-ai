"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const defect_detection_1 = require("@/lib/ai/defect-detection");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/ai/defect-detection/patterns - Analyze defect patterns
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const days = parseInt(searchParams.get("days") || "30");
        const _operator_id = searchParams.get("operator_id");
        const _station = searchParams.get("station");
        // Build where clause
        const whereClause = {
            created_at: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            },
        };
        // Get QC checks
        const qcChecks = await db_1.prisma.qCInspection.findMany({
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
            return server_1.NextResponse.json({
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
            const defects = [];
            // Calculate total defects from critical + major + minor
            const totalDefects = (qc.critical_found || 0) +
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
        const patternAnalysis = await defect_detection_1.defectDetectionAI.analyzeDefectPatterns(inspections);
        return server_1.NextResponse.json({
            success: true,
            pattern_analysis: patternAnalysis,
            total_inspections: inspections.length,
            date_range: {
                start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                end: new Date(),
            },
        });
    }
    catch (error) {
        console.error("Pattern analysis error:", error);
        return server_1.NextResponse.json({ error: "Failed to analyze patterns", details: error.message }, { status: 500 });
    }
});
// POST /api/ai/defect-detection/patterns/compare - Compare quality between operators/stations
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const { entity_type, days = 30 } = await req.json();
        if (!entity_type || !["operator", "station"].includes(entity_type)) {
            return server_1.NextResponse.json({ error: 'entity_type must be "operator" or "station"' }, { status: 400 });
        }
        // Get QC checks with AI results
        const qcChecks = await db_1.prisma.qCInspection.findMany({
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
            return server_1.NextResponse.json({
                success: true,
                comparison: [],
                message: "No AI vision inspections found",
            });
        }
        // Group by entity (operator or station)
        const entityGroups = {};
        qcChecks.forEach(qc => {
            let entityId;
            let entityName;
            if (entity_type === "operator") {
                entityId = qc.inspector_id || "UNKNOWN";
                entityName = qc.inspector?.name || "Unknown Operator";
            }
            else {
                entityId = qc.stage || "UNKNOWN";
                entityName = qc.stage || "Unknown Station";
            }
            if (!entityGroups[entityId]) {
                entityGroups[entityId] = [];
            }
            // Calculate total defects from critical + major + minor
            const totalDefects = (qc.critical_found || 0) +
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
            entityGroups[entityId].push({
                entity_id: entityId,
                entity_name: entityName,
                result,
            });
        });
        // Prepare data for comparison
        const comparisonData = Object.entries(entityGroups).map(([entityId, inspections]) => ({
            entity_id: entityId,
            entity_name: inspections[0].entity_name,
            inspections: inspections.map(i => i.result),
        }));
        // Perform comparison
        const comparison = await defect_detection_1.defectDetectionAI.compareQuality(comparisonData);
        return server_1.NextResponse.json({
            success: true,
            comparison,
            entity_type,
            total_entities: comparison.length,
        });
    }
    catch (error) {
        console.error("Quality comparison error:", error);
        return server_1.NextResponse.json({ error: "Failed to compare quality", details: error.message }, { status: 500 });
    }
});
