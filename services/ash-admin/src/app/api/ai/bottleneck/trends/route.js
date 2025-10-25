"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const bottleneck_detection_1 = require("@/lib/ai/bottleneck-detection");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/ai/bottleneck/trends?days=7 - Analyze bottleneck trends over time
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const days = parseInt(searchParams.get("days") || "7");
        // Generate historical metrics for the past N days
        const historicalMetrics = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(12, 0, 0, 0);
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            // Get production data for this day
            const [cutLays, sewingRuns, printRuns, qcChecks] = await Promise.all([
                db_1.prisma.cutLay.findMany({
                    where: {
                        created_at: { gte: startOfDay, lte: endOfDay },
                    },
                    include: { bundles: true },
                }),
                db_1.prisma.sewingRun.findMany({
                    where: {
                        created_at: { gte: startOfDay, lte: endOfDay },
                    },
                }),
                db_1.prisma.printRun.findMany({
                    where: {
                        created_at: { gte: startOfDay, lte: endOfDay },
                    },
                }),
                db_1.prisma.qCInspection.findMany({
                    where: {
                        created_at: { gte: startOfDay, lte: endOfDay },
                        workspace_id: "default",
                    },
                }),
            ]);
            // Build metrics (simplified simulation)
            const dayMetrics = [];
            // Cutting
            if (cutLays.length > 0 || i === 0) {
                const efficiency = 75 + Math.random() * 20;
                dayMetrics.push({
                    station_id: "CUTTING_MAIN",
                    station_name: "Cutting Department",
                    station_type: "CUTTING",
                    current_throughput: 35 + Math.random() * 15,
                    expected_throughput: 50,
                    queue_length: Math.floor(Math.random() * 30),
                    avg_wait_time_minutes: 20 + Math.random() * 40,
                    utilization_rate: efficiency,
                    operator_count: 5,
                    active_operators: 4 + Math.floor(Math.random() * 2),
                    defect_rate: 1 + Math.random() * 4,
                    timestamp: date,
                });
            }
            // Sewing (often bottleneck)
            dayMetrics.push({
                station_id: "SEWING_MAIN",
                station_name: "Sewing Department",
                station_type: "SEWING",
                current_throughput: 20 + Math.random() * 15,
                expected_throughput: 40,
                queue_length: Math.floor(30 + Math.random() * 40),
                avg_wait_time_minutes: 60 + Math.random() * 60,
                utilization_rate: 80 + Math.random() * 15,
                operator_count: 15,
                active_operators: 12 + Math.floor(Math.random() * 4),
                defect_rate: 3 + Math.random() * 5,
                timestamp: date,
            });
            // QC
            dayMetrics.push({
                station_id: "QC_MAIN",
                station_name: "Quality Control",
                station_type: "QC",
                current_throughput: 25 + Math.random() * 10,
                expected_throughput: 35,
                queue_length: Math.floor(Math.random() * 20),
                avg_wait_time_minutes: 20 + Math.random() * 30,
                utilization_rate: 65 + Math.random() * 20,
                operator_count: 4,
                active_operators: 3 + Math.floor(Math.random() * 2),
                defect_rate: qcChecks.length > 0
                    ? (qcChecks.filter(q => q.status === "FAILED").length /
                        qcChecks.length) *
                        100
                    : 5,
                timestamp: date,
            });
            historicalMetrics.push({
                timestamp: date,
                metrics: dayMetrics,
            });
        }
        // Analyze trends
        const trendAnalysis = await bottleneck_detection_1.bottleneckDetectionAI.analyzeBottleneckTrends(historicalMetrics);
        return server_1.NextResponse.json({
            success: true,
            trend_analysis: trendAnalysis,
            days_analyzed: days,
            analysis_period: {
                start: historicalMetrics[historicalMetrics.length - 1].timestamp,
                end: historicalMetrics[0].timestamp,
            },
        });
    }
    catch (error) {
        console.error("Trend analysis error:", error);
        return server_1.NextResponse.json({ error: "Failed to analyze trends", details: error.message }, { status: 500 });
    }
});
