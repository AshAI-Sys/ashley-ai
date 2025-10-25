"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const defect_detection_1 = require("@/lib/ai/defect-detection");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
// POST /api/ai/defect-detection - Detect defects in image
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const { image_url, image_base64, garment_type, bundle_id } = await req.json();
        if (!image_url && !image_base64) {
            return server_1.NextResponse.json({ error: "Either image_url or image_base64 is required" }, { status: 400 });
        }
        const image = {
            url: image_url || "",
            base64: image_base64,
        };
        // Perform defect detection
        const result = await defect_detection_1.defectDetectionAI.detectDefects(image, garment_type);
        // Optionally save results to database if bundle_id provided
        if (bundle_id && result.defects_found > 0) {
            // Create QC check record
        }
        const _qcCheck = await db_1.prisma.qCInspection.create({
            data: {
                workspace_id: "default",
                order_id: "unknown", // TODO: Get from bundle if available
                inspector_id: "AI-SYSTEM",
                stage: "FINAL",
                inspection_level: "GII",
                aql: 2.5,
                lot_size: 1,
                sample_size: 1,
                acceptance: 0,
                rejection: 1,
                inspection_date: new Date(),
                status: result.pass_fail === "PASS" ? "PASSED" : "FAILED",
                result: result.pass_fail === "PASS" ? "PASSED" : "FAILED",
                critical_found: 0,
                major_found: result.defects_found,
                minor_found: 0,
                notes: `AI detected ${result.defects_found} defect(s). Quality score: ${result.quality_score}%. Confidence: ${result.confidence}%`,
            },
        });
        // Create defect records - Note: QCDefectType requires inspection_point_id, skip for now
        // In production, you would need to:
        // 1. Create or find appropriate QCInspectionPoint
        // 2. Then create QCDefectType with that inspection_point_id
        // 3. Then create QCDefect records linked to the QCInspection
        for (const defect of result.detected_defects) {
            // TODO: Implement proper defect type and defect creation with inspection points
            console.log(`Detected ${defect.type}: ${defect.description} (${defect.severity})`);
        }
        return server_1.NextResponse.json({
            success: true,
            result,
        });
    }
    catch (error) {
        console.error("Defect detection error:", error);
        return server_1.NextResponse.json({ error: "Failed to detect defects", details: error.message }, { status: 500 });
    }
});
// GET /api/ai/defect-detection/batch?bundle_ids=xxx,yyy - Batch defect detection
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const bundleIdsParam = searchParams.get("bundle_ids");
        if (!bundleIdsParam) {
            return server_1.NextResponse.json({ error: "bundle_ids parameter required" }, { status: 400 });
        }
        const bundleIds = bundleIdsParam.split(",");
        // Get QC checks with photos for these bundles
        const qcChecks = await db_1.prisma.qCInspection.findMany({
            where: {
                workspace_id: "default",
            },
            include: {
                order: true,
            },
        });
        if (qcChecks.length === 0) {
            return server_1.NextResponse.json({
                success: true,
                results: [],
                message: "No QC inspections found for provided bundles",
            });
        }
        // Note: QCInspection doesn't have a photos field in the schema
        // In production, photos would be stored separately (e.g., in QCDefect or file storage)
        // For now, return empty results
        const results = [];
        const response = results;
        return server_1.NextResponse.json({
            success: true,
            results: response,
            total_analyzed: results.length,
        });
    }
    catch (error) {
        console.error("Batch defect detection error:", error);
        return server_1.NextResponse.json({ error: "Failed to detect defects", details: error.message }, { status: 500 });
    }
});
