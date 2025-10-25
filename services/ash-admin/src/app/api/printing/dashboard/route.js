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
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Get dashboard metrics
        const [activeRuns, todayRuns, methodBreakdown, recentRejects, machineUtilization,] = await Promise.all([
            // Active runs count
            db_1.prisma.printRun.count({
                where: {
                    status: { in: ["IN_PROGRESS", "PAUSED"] },
                },
            }),
            // Today's runs count
            db_1.prisma.printRun.count({
                where: {
                    created_at: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
            // Method breakdown for today
            db_1.prisma.printRun.groupBy({
                by: ["method"],
                where: {
                    created_at: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                _count: true,
            }),
            // Recent rejects
            db_1.prisma.printReject.findMany({
                take: 10,
                orderBy: { created_at: "desc" },
                include: {
                    run: {
                        include: {
                            order: {
                                select: {
                                    order_number: true,
                                },
                            },
                        },
                    },
                },
            }),
            // Machine utilization
            db_1.prisma.machine.findMany({
                where: { is_active: true },
                take: 50, // Limit to 50 machines
                include: {
                    print_runs: {
                        where: {
                            status: "IN_PROGRESS",
                        },
                        take: 1,
                    },
                },
            }),
        ]);
        // Calculate efficiency metrics
        const completedToday = await db_1.prisma.printRun.findMany({
            where: {
                status: "DONE",
                ended_at: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            take: 100, // Limit to 100 runs for efficiency calculation
            include: {
                outputs: true,
                rejects: true,
            },
            const: totalProduced = completedToday.reduce((sum, run) => sum + run.outputs.reduce((s, o) => s + o.qty_good, 0), 0),
            const: totalRejects = completedToday.reduce((sum, run) => sum + run.rejects.reduce((s, r) => s + r.qty, 0), 0),
            const: qualityRate =
                totalProduced > 0
                    ? (((totalProduced - totalRejects) / totalProduced) * 100).toFixed(1)
                    : "0",
            const: dashboard = {
                active_runs: activeRuns,
                todays_runs: todayRuns,
                quality_rate: parseFloat(qualityRate),
                total_produced: totalProduced,
                method_breakdown: methodBreakdown,
                recent_rejects: recentRejects.map(reject => ({
                    id: reject.id,
                    reason: reject.reason_code,
                    qty_rejected: reject.qty,
                    run: {
                        method: reject.run.method,
                        order: {
                            order_number: reject.run.order.order_number,
                        },
                    },
                })),
                machine_utilization: machineUtilization.map(machine => ({
                    id: machine.id,
                    name: machine.name,
                    workcenter: machine.workcenter,
                    is_busy: machine.print_runs.length > 0,
                    current_run: machine.print_runs[0]?.id || null,
                })),
            },
            return: server_1.NextResponse.json({
                success: true,
                data: dashboard,
            }), catch(error) {
                console.error("Dashboard API error:", error);
                return server_1.NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 });
            }
        });
    }
    finally { }
});
