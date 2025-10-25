"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Count active sewing runs
        const activeRuns = await db_1.prisma.sewingRun.count({
            where: {
                status: "IN_PROGRESS",
            },
        });
        // Count completed runs today
        const todaysCompleted = await db_1.prisma.sewingRun.count({
            where: {
                status: "DONE",
                created_at: {
                    gte: today,
                },
            },
        });
        // Count unique operators working today
        const operatorsWorkingResult = await db_1.prisma.sewingRun.findMany({
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
        const runsWithEfficiency = await db_1.prisma.sewingRun.findMany({
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
        const avgEfficiency = runsWithEfficiency.length > 0
            ? Math.round(runsWithEfficiency.reduce((sum, run) => sum + (run.efficiency_pct || 0), 0) / runsWithEfficiency.length)
            : 0;
        // Count pending bundles (runs not started yet)
        const pendingBundles = await db_1.prisma.sewingRun.count({
            where: {
                status: "PENDING",
            },
        });
        // Calculate total pieces completed today
        const completedRuns = await db_1.prisma.sewingRun.findMany({
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
        const totalPiecesToday = completedRuns.reduce((sum, run) => sum + (run.qty_good || 0), 0);
        return server_1.NextResponse.json({
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
    }
    catch (error) {
        console.error("Error fetching sewing dashboard stats:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 });
    }
});
