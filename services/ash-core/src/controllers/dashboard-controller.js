"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const database_1 = require("@ash/database");
const shared_1 = require("@ash/shared");
const cache_1 = require("../services/cache");
const performance_1 = require("../config/performance");
const query_optimizer_1 = require("../utils/query-optimizer");
class DashboardController {
    // Real-time production overview with caching
    async getProductionOverview(req, res) {
        try {
            const workspaceId = req.user?.workspace_id;
            const cacheKey = performance_1.PERFORMANCE_CONFIG.CACHE.KEYS.DASHBOARD_OVERVIEW(workspaceId);
            // Try to get cached data first
            const response = await (0, cache_1.withCache)(cacheKey, async () => {
                // Get current production statistics using optimized queries
                const [activeOrders, productionStats, upcomingDeadlines, machineUtilization, qualityMetrics] = await Promise.all([
                    query_optimizer_1.DashboardQueries.getOrderStats(workspaceId),
                    query_optimizer_1.DashboardQueries.getProductionMetrics(workspaceId),
                    query_optimizer_1.DashboardQueries.getUpcomingDeadlines(workspaceId, 7),
                    // Machine/asset utilization (optimized)
                    (0, query_optimizer_1.withQueryTiming)('dashboard-machine-utilization', async () => {
                        return database_1.prisma.asset.findMany({
                            where: { workspace_id: workspaceId },
                            select: {
                                id: true,
                                name: true,
                                status: true,
                                _count: {
                                    select: { work_orders: true }
                                }
                            },
                            take: 20 // Limit to avoid large payloads
                        });
                    }),
                    // Quality control metrics (optimized with date filter)
                    (0, query_optimizer_1.withQueryTiming)('dashboard-quality-metrics', async () => {
                        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                        return database_1.prisma.qcCheck.groupBy({
                            by: ['status', 'stage'],
                            where: {
                                workspace_id: workspaceId,
                                created_at: { gte: thirtyDaysAgo }
                            },
                            _count: { id: true }
                        });
                    })
                ]);
                return this.formatDashboardResponse(activeOrders, productionStats, upcomingDeadlines, machineUtilization, qualityMetrics);
            }, performance_1.PERFORMANCE_CONFIG.CACHE.TTL.DASHBOARD_DATA);
            res.json({ success: true, data: response });
        }
        catch (error) {
            shared_1.logger.error('Dashboard overview error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch dashboard overview' });
        }
    }
    // Live production floor status with caching
    async getProductionFloorStatus(req, res) {
        try {
            const workspaceId = req.user?.workspace_id;
            const cacheKey = performance_1.PERFORMANCE_CONFIG.CACHE.KEYS.PRODUCTION_FLOOR(workspaceId);
            // Production floor data changes frequently, so use shorter cache TTL
            const response = await (0, cache_1.withCache)(cacheKey, async () => {
                // Get real-time production floor data with optimized queries
                const [bundles, workOrders, employees] = await Promise.all([
                    // Active bundles in production (optimized with selective fields)
                    (0, query_optimizer_1.withQueryTiming)('production-floor-bundles', async () => {
                        return database_1.prisma.bundle.findMany({
                            where: {
                                workspace_id: workspaceId,
                                status: { in: ['cutting', 'printing', 'sewing', 'qc'] }
                            },
                            select: {
                                id: true,
                                bundle_number: true,
                                status: true,
                                quantity: true,
                                order: {
                                    select: {
                                        order_number: true,
                                        client: { select: { name: true } }
                                    }
                                },
                                cutting_order: {
                                    select: { status: true, completed_at: true }
                                },
                                printing_orders: {
                                    select: { status: true, completed_at: true },
                                    take: 5 // Limit printing orders
                                },
                                routing_steps: {
                                    where: { status: 'in_progress' },
                                    select: { step_name: true, department: true, assigned_to: true },
                                    take: 10 // Limit routing steps
                                }
                            },
                            take: 50 // Limit bundles to avoid large payloads
                        });
                    }),
                    // Active work orders (optimized)
                    (0, query_optimizer_1.withQueryTiming)('production-floor-work-orders', async () => {
                        return database_1.prisma.workOrder.findMany({
                            where: {
                                workspace_id: workspaceId,
                                status: { in: ['pending', 'in_progress'] }
                            },
                            select: {
                                id: true,
                                work_order_number: true,
                                status: true,
                                priority: true,
                                asset: {
                                    select: { name: true, location: true }
                                },
                                assigned_employee: {
                                    select: { first_name: true, last_name: true }
                                }
                            },
                            take: 30 // Limit work orders
                        });
                    }),
                    // Employee status on production floor (optimized)
                    (0, query_optimizer_1.withQueryTiming)('production-floor-employees', async () => {
                        return database_1.prisma.employee.findMany({
                            where: {
                                workspace_id: workspaceId,
                                department: { in: ['cutting', 'printing', 'sewing', 'qc'] },
                                is_active: true
                            },
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                department: true,
                                current_shift: true,
                                _count: {
                                    select: {
                                        assigned_work_orders: {
                                            where: { status: 'in_progress' }
                                        }
                                    }
                                }
                            },
                            take: 100 // Reasonable limit for employees
                        });
                    })
                ]);
                return this.formatProductionFloorResponse(bundles, workOrders, employees);
            }, 120 // 2 minutes cache for production floor data
            );
            res.json({ success: true, data: response });
        }
        catch (error) {
            shared_1.logger.error('Production floor status error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch production floor status' });
        }
    }
    // Advanced analytics dashboard
    async getAdvancedAnalytics(req, res) {
        try {
            const workspaceId = req.user?.workspace_id;
            const { period = '30' } = req.query;
            const periodDays = parseInt(period);
            const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
            const [orderTrends, productionEfficiency, qualityTrends, revenueMetrics, employeePerformance] = await Promise.all([
                // Order volume trends
                database_1.prisma.order.groupBy({
                    by: ['created_at'],
                    where: {
                        workspace_id: workspaceId,
                        created_at: { gte: startDate }
                    },
                    _count: { id: true },
                    _sum: { total_amount: true }
                }),
                // Production efficiency by stage
                database_1.prisma.routingStep.groupBy({
                    by: ['step_name', 'department'],
                    where: {
                        workspace_id: workspaceId,
                        completed_at: { gte: startDate }
                    },
                    _avg: {
                        actual_hours: true,
                        estimated_hours: true
                    },
                    _count: { id: true }
                }),
                // Quality trends
                database_1.prisma.qcCheck.groupBy({
                    by: ['created_at', 'status'],
                    where: {
                        workspace_id: workspaceId,
                        created_at: { gte: startDate }
                    },
                    _count: { id: true }
                }),
                // Revenue and profitability
                database_1.prisma.order.aggregate({
                    where: {
                        workspace_id: workspaceId,
                        status: 'completed',
                        created_at: { gte: startDate }
                    },
                    _sum: { total_amount: true },
                    _count: { id: true }
                }),
                // Employee performance metrics
                database_1.prisma.sewingOperation.groupBy({
                    by: ['employee_id'],
                    where: {
                        workspace_id: workspaceId,
                        completed_at: { gte: startDate }
                    },
                    _sum: { pieces_completed: true, earnings: true },
                    _avg: { piece_rate: true }
                })
            ]);
            const analytics = {
                trends: {
                    orders: orderTrends.map(trend => ({
                        date: trend.created_at,
                        count: trend._count.id,
                        value: trend._sum.total_amount
                    })),
                    efficiency: productionEfficiency.map(eff => ({
                        stage: eff.step_name,
                        department: eff.department,
                        efficiency: eff._avg.estimated_hours && eff._avg.actual_hours ?
                            (eff._avg.estimated_hours / eff._avg.actual_hours) * 100 : null,
                        volume: eff._count.id
                    })),
                    quality: qualityTrends.reduce((acc, curr) => {
                        const date = curr.created_at.toISOString().split('T')[0];
                        if (!acc[date])
                            acc[date] = { passed: 0, failed: 0, total: 0 };
                        acc[date][curr.status === 'approved' ? 'passed' : 'failed'] += curr._count.id;
                        acc[date].total += curr._count.id;
                        return acc;
                    }, {})
                },
                performance: {
                    revenue: revenueMetrics,
                    employees: employeePerformance
                }
            };
            res.json({ success: true, data: analytics });
        }
        catch (error) {
            shared_1.logger.error('Advanced analytics error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
        }
    }
    // Helper method to format dashboard response
    formatDashboardResponse(activeOrders, productionStats, upcomingDeadlines, machineUtilization, qualityMetrics) {
        return {
            overview: {
                active_orders: activeOrders,
                production_stats: productionStats,
                machine_utilization: machineUtilization.map(asset => ({
                    asset_name: asset.name,
                    utilization: asset._count.work_orders,
                    status: asset.status
                }))
            },
            alerts: {
                upcoming_deadlines: upcomingDeadlines.map(order => ({
                    order_number: order.order_number,
                    client: order.client.name,
                    brand: order.brand?.name,
                    delivery_date: order.delivery_date,
                    days_remaining: Math.ceil((order.delivery_date.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                }))
            },
            quality: {
                metrics: qualityMetrics,
                pass_rate: qualityMetrics.reduce((acc, curr) => {
                    if (curr.status === 'approved')
                        acc.passed += curr._count.id;
                    acc.total += curr._count.id;
                    return acc;
                }, { passed: 0, total: 0 })
            }
        };
    }
    // Helper method to format production floor response
    formatProductionFloorResponse(bundles, workOrders, employees) {
        return {
            bundles: bundles.map(bundle => ({
                id: bundle.id,
                bundle_number: bundle.bundle_number,
                order_number: bundle.order.order_number,
                client: bundle.order.client.name,
                status: bundle.status,
                quantity: bundle.quantity,
                current_stage: bundle.routing_steps[0]?.step_name || 'Pending',
                department: bundle.routing_steps[0]?.department,
                assigned_to: bundle.routing_steps[0]?.assigned_to,
                progress: {
                    cutting: bundle.cutting_order?.status === 'completed' ? 100 : bundle.cutting_order ? 50 : 0,
                    printing: bundle.printing_orders.every((po) => po.status === 'completed') ? 100 :
                        bundle.printing_orders.some((po) => po.status === 'in_progress') ? 50 : 0,
                    sewing: bundle.status === 'completed' ? 100 : bundle.status === 'sewing' ? 50 : 0
                }
            })),
            work_orders: workOrders.map(wo => ({
                id: wo.id,
                work_order_number: wo.work_order_number,
                status: wo.status,
                asset: wo.asset?.name,
                location: wo.asset?.location,
                assigned_to: wo.assigned_employee ?
                    `${wo.assigned_employee.first_name} ${wo.assigned_employee.last_name}` : null,
                priority: wo.priority
            })),
            employees: employees.map(emp => ({
                name: `${emp.first_name} ${emp.last_name}`,
                department: emp.department,
                current_shift: emp.current_shift,
                active_tasks: emp._count.assigned_work_orders,
                status: emp._count.assigned_work_orders > 0 ? 'working' : 'available'
            }))
        };
    }
}
exports.DashboardController = DashboardController;
