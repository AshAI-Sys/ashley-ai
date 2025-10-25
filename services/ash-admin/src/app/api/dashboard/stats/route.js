"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.dynamic = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const date_fns_1 = require("date-fns");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.dynamic = "force-dynamic";
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, authUser) => {
    try {
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get("timeRange") || "30d";
        const includeCharts = searchParams.get("includeCharts") !== "false";
        // Calculate date range
        const days = parseInt(timeRange.replace("d", ""));
        const startDate = (0, date_fns_1.subDays)(new Date(), days);
        // Get comprehensive statistics in parallel
        const [totalOrders, totalClients, totalRevenue, activeOrders, recentOrders, ordersByStatus, cuttingRuns, printRuns, sewingRuns, finishingRuns,] = await Promise.all([
            // Total orders
            db_1.prisma.order.count({
                where: {
                    workspace_id: authUser.workspaceId,
                    created_at: { gte: startDate },
                },
            }),
            // Total clients
            db_1.prisma.client.count({
                where: { workspace_id: authUser.workspaceId },
            }),
            // Total revenue
            db_1.prisma.order.aggregate({
                where: {
                    workspace_id: authUser.workspaceId,
                    created_at: { gte: startDate },
                },
                _sum: { total_amount: true },
            }),
            // Active orders (in production)
            db_1.prisma.order.count({
                where: {
                    workspace_id: authUser.workspaceId,
                    status: "in_production",
                },
            }),
            // Recent orders
            db_1.prisma.order.findMany({
                where: { workspace_id: authUser.workspaceId },
                orderBy: { created_at: "desc" },
                take: 10,
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            // Orders by status
            db_1.prisma.order.groupBy({
                by: ["status"],
                where: { workspace_id: authUser.workspaceId },
                _count: { status: true },
            }),
            // Production runs
            db_1.prisma.cuttingRun.findMany({
                where: { created_at: { gte: startDate } },
                select: {
                    id: true,
                    bundles_cut: true,
                    efficiency_score: true,
                    created_at: true,
                },
            }),
            db_1.prisma.printRun.findMany({
                where: { created_at: { gte: startDate } },
                select: {
                    id: true,
                    quantity: true,
                    efficiency_score: true,
                    created_at: true,
                },
            }),
            db_1.prisma.sewingRun.findMany({
                where: { created_at: { gte: startDate } },
                select: {
                    id: true,
                    pieces_completed: true,
                    efficiency_score: true,
                    created_at: true,
                },
            }),
            db_1.prisma.finishingRun.findMany({
                where: { created_at: { gte: startDate } },
                select: {
                    id: true,
                    quantity: true,
                    status: true,
                    created_at: true,
                },
            }),
        ]);
        // Calculate efficiency scores
        const avgCuttingEfficiency = cuttingRuns.length > 0
            ? Math.round(cuttingRuns.reduce((sum, run) => sum + (run.efficiency_score || 0), 0) / cuttingRuns.length)
            : 0;
        const avgPrintingEfficiency = printRuns.length > 0
            ? Math.round(printRuns.reduce((sum, run) => sum + (run.efficiency_score || 0), 0) / printRuns.length)
            : 0;
        const avgSewingEfficiency = sewingRuns.length > 0
            ? Math.round(sewingRuns.reduce((sum, run) => sum + (run.efficiency_score || 0), 0) / sewingRuns.length)
            : 0;
        const avgFinishingEfficiency = 88; // Mock for now
        const overallEfficiency = Math.round((avgCuttingEfficiency +
            avgPrintingEfficiency +
            avgSewingEfficiency +
            avgFinishingEfficiency) /
            4);
        // Today's metrics
        const today = new Date();
        const todayStart = (0, date_fns_1.startOfDay)(today);
        const todayEnd = (0, date_fns_1.endOfDay)(today);
        const completedToday = await db_1.prisma.order.count({
            where: {
                workspace_id: authUser.workspaceId,
                status: "completed",
                updated_at: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        });
        // Prepare chart data
        let productionTrendData = [];
        if (includeCharts) {
            productionTrendData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
                const date = (0, date_fns_1.subDays)(today, days - 1 - i);
                const dateStr = (0, date_fns_1.format)(date, "MMM dd");
                const dayStart = (0, date_fns_1.startOfDay)(date);
                const dayEnd = (0, date_fns_1.endOfDay)(date);
                const cuttingCount = cuttingRuns
                    .filter(r => {
                    const runDate = new Date(r.created_at);
                    return runDate >= dayStart && runDate <= dayEnd;
                })
                    .reduce((sum, r) => sum + (r.bundles_cut || 0), 0);
                const printingCount = printRuns
                    .filter(r => {
                    const runDate = new Date(r.created_at);
                    return runDate >= dayStart && runDate <= dayEnd;
                })
                    .reduce((sum, r) => sum + (r.quantity || 0), 0);
                const sewingCount = sewingRuns
                    .filter(r => {
                    const runDate = new Date(r.created_at);
                    return runDate >= dayStart && runDate <= dayEnd;
                })
                    .reduce((sum, r) => sum + (r.pieces_completed || 0), 0);
                const finishingCount = finishingRuns
                    .filter(r => {
                    const runDate = new Date(r.created_at);
                    return runDate >= dayStart && runDate <= dayEnd;
                })
                    .reduce((sum, r) => sum + (r.quantity || 0), 0);
                return {
                    date: dateStr,
                    cutting: cuttingCount,
                    printing: printingCount,
                    sewing: sewingCount,
                    finishing: finishingCount,
                    target: 250,
                };
            });
        }
        // Efficiency data
        const efficiencyData = [
            {
                department: "Cutting",
                efficiency: avgCuttingEfficiency,
                target: 90,
                color: "#3B82F6",
            },
            {
                department: "Printing",
                efficiency: avgPrintingEfficiency,
                target: 90,
                color: "#10B981",
            },
            {
                department: "Sewing",
                efficiency: avgSewingEfficiency,
                target: 85,
                color: "#F59E0B",
            },
            {
                department: "Finishing",
                efficiency: avgFinishingEfficiency,
                target: 90,
                color: "#8B5CF6",
            },
        ];
        return server_1.NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalOrders,
                    totalClients,
                    totalRevenue: totalRevenue._sum.total_amount || 0,
                    activeOrders,
                    completedToday,
                    overallEfficiency,
                },
                production: {
                    cutting: cuttingRuns.length,
                    printing: printRuns.length,
                    sewing: sewingRuns.length,
                    finishing: finishingRuns.length,
                },
                recentOrders,
                ordersByStatus: ordersByStatus.map(item => ({
                    status: item.status,
                    count: item._count.status,
                })),
                ...(includeCharts && {
                    charts: {
                        productionTrends: productionTrendData,
                        efficiencyByDepartment: efficiencyData,
                    },
                }),
                metadata: {
                    timeRange,
                    startDate: startDate.toISOString(),
                    endDate: today.toISOString(),
                    generatedAt: new Date().toISOString(),
                },
            },
        }, {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            },
        });
    }
    catch (error) {
        console.error("Dashboard stats error:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch dashboard statistics" }, { status: 500 });
    }
});
