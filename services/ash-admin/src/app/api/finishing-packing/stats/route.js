"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const db_1 = require("../../../lib/db");
async function GET(request) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Get finishing statistics
        const [pendingOrders, inProgressFinishing, completedTodayFinishing, totalFinishingRuns, packedTodayCartons, totalCartons] = await Promise.all([
            // Pending orders (orders that have passed QC but not started finishing)
            db_1.prisma.order.count({
                where: {
                    AND: [
                        { status: 'IN_PRODUCTION' },
                        {
                            qc_inspections: {
                                some: {
                                    result: 'ACCEPT',
                                    inspection_type: 'FINAL'
                                }
                            }
                        },
                        {
                            finishing_runs: {
                                none: {}
                            }
                        }
                    ]
                }
            }),
            // In progress finishing
            db_1.prisma.finishingRun.count({
                where: {
                    status: 'IN_PROGRESS'
                }
            }),
            // Completed today finishing
            db_1.prisma.finishingRun.count({
                where: {
                    status: 'COMPLETED',
                    completed_at: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            // Total finishing runs (for efficiency calculation)
            db_1.prisma.finishingRun.count({
                where: {
                    created_at: {
                        gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            }),
            // Packed today (cartons closed today)
            db_1.prisma.carton.count({
                where: {
                    status: 'CLOSED',
                    updated_at: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            // Total cartons (for comparison)
            db_1.prisma.carton.count({
                where: {
                    created_at: {
                        gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);
        // Calculate efficiency rate
        const completedRuns = await db_1.prisma.finishingRun.count({
            where: {
                status: 'COMPLETED',
                created_at: {
                    gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });
        const efficiencyRate = totalFinishingRuns > 0 ? (completedRuns / totalFinishingRuns) * 100 : 0;
        // Get additional metrics
        const avgPackingEfficiency = await getPackingEfficiency();
        return server_1.NextResponse.json({
            pending_orders: pendingOrders,
            in_progress: inProgressFinishing,
            completed_today: completedTodayFinishing,
            packed_today: packedTodayCartons,
            efficiency_rate: Math.round(efficiencyRate * 10) / 10, // Round to 1 decimal
            packing_efficiency: avgPackingEfficiency,
            period_summary: {
                total_finishing_runs: totalFinishingRuns,
                completed_runs: completedRuns,
                total_cartons: totalCartons,
                cartons_today: packedTodayCartons
            }
        });
    }
    catch (error) {
        console.error('Error calculating finishing & packing stats:', error);
        return server_1.NextResponse.json({ error: 'Failed to calculate statistics' }, { status: 500 });
    }
}
async function getPackingEfficiency() {
    try {
        const cartons = await db_1.prisma.carton.findMany({
            where: {
                status: 'CLOSED',
                fill_percentage: { not: null }
            },
            select: {
                fill_percentage: true,
                actual_weight_kg: true,
                dimensional_weight_kg: true
            },
            take: 100, // Last 100 cartons
            orderBy: { updated_at: 'desc' }
        });
        if (cartons.length === 0)
            return 0;
        const avgFillPercentage = cartons.reduce((sum, carton) => sum + (carton.fill_percentage || 0), 0) / cartons.length;
        return Math.round(avgFillPercentage * 10) / 10;
    }
    catch (error) {
        console.error('Error calculating packing efficiency:', error);
        return 0;
    }
}
