/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspace_id = "default";
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Parallel queries for better performance
    const [
      totalAssets,
      activeAssets,
      totalWorkOrders,
      openWorkOrders,
      overdueSchedules,
      totalSchedules,
      completedThisMonth,
      pendingWorkOrders,
      workOrdersByType,
      workOrdersByPriority,
      assetsByType,
      upcomingMaintenance,
      recentWorkOrders,
      maintenanceCosts,
    ] = await Promise.all([
      // Total assets count
      prisma.asset.count({
        where: { workspace_id, deleted_at: null },
      }),

      // Active assets count
      prisma.asset.count({
        where: { workspace_id, status: "active", deleted_at: null },
      }),

      // Total work orders
      prisma.workOrder.count({
        where: { workspace_id },
      }),

      // Open work orders
      prisma.workOrder.count({
        where: {
          workspace_id,
          status: { in: ["open", "assigned", "in_progress"] },
        },
      }),

      // Overdue maintenance schedules
      prisma.maintenanceSchedule.count({
        where: {
          workspace_id,
          is_active: true,
          next_due_date: { lt: today },
        },
      }),

      // Total maintenance schedules
      prisma.maintenanceSchedule.count({
        where: { workspace_id, is_active: true },
      }),

      // Completed work orders this month
      prisma.workOrder.count({
        where: {
          workspace_id,
          status: "completed",
          completed_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Pending work orders (unassigned)
      prisma.workOrder.count({
        where: {
          workspace_id,
          status: "open",
          assigned_to: null,
        },
      }),

      // Work orders by type
      prisma.workOrder.groupBy({
        by: ["type"],
        where: { workspace_id },
        _count: { type: true },
      }),

      // Work orders by priority
      prisma.workOrder.groupBy({
        by: ["priority"],
        where: { workspace_id, status: { not: "completed" } },
        _count: { priority: true },
      }),

      // Assets by type
      prisma.asset.groupBy({
        by: ["type"],
        where: { workspace_id, deleted_at: null },
        _count: { type: true },
      }),

      // Upcoming maintenance (next 30 days)
      prisma.maintenanceSchedule.findMany({
        where: {
          workspace_id,
          is_active: true,
          next_due_date: {
            gte: today,
            lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          asset: {
            select: {
              name: true,
              asset_number: true,
            },
          },
        },
        orderBy: { next_due_date: "asc" },
        take: 10,
      }),

      // Recent work orders
      prisma.workOrder.findMany({
        where: { workspace_id },
        include: {
          asset: {
            select: {
              name: true,
              asset_number: true,
            },
          },
          assignee: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 5,
      }),

      // Maintenance costs this month
      prisma.workOrder.aggregate({
        where: {
          workspace_id,
          completed_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          cost: { not: null },
        },
        _sum: { cost: true },
      }),
    ]);

    // Calculate completion rate
    const completionRate =
      totalWorkOrders > 0
        ? Math.round((completedThisMonth / totalWorkOrders) * 100)
        : 0;

    // Calculate asset utilization
    const assetUtilization =
      totalAssets > 0 ? Math.round((activeAssets / totalAssets) * 100) : 0;

    // Process work order distributions
    const workOrderTypeDistribution = workOrdersByType.map(item => ({
      type: item.type,
      count: item._count.type,
      percentage:
        totalWorkOrders > 0
          ? Math.round((item._count.type / totalWorkOrders) * 100)
          : 0,
    }));

    const workOrderPriorityDistribution = workOrdersByPriority.map(item => ({
      priority: item.priority,
      count: item._count.priority,
      percentage:
        openWorkOrders > 0
          ? Math.round((item._count.priority / openWorkOrders) * 100)
          : 0,
    }));

    const assetTypeDistribution = assetsByType.map(item => ({
      type: item.type,
      count: item._count.type,
      percentage:
        totalAssets > 0
          ? Math.round((item._count.type / totalAssets) * 100)
          : 0,
    }));

    const response = {
      success: true,
      data: {
        overview: {
          total_assets: totalAssets,
          active_assets: activeAssets,
          asset_utilization: assetUtilization,
          total_work_orders: totalWorkOrders,
          open_work_orders: openWorkOrders,
          completed_this_month: completedThisMonth,
          pending_work_orders: pendingWorkOrders,
          completion_rate: completionRate,
          overdue_maintenance: overdueSchedules,
          total_schedules: totalSchedules,
          maintenance_costs_this_month: maintenanceCosts._sum.cost || 0,
        },
        distributions: {
          work_orders_by_type: workOrderTypeDistribution,
          work_orders_by_priority: workOrderPriorityDistribution,
          assets_by_type: assetTypeDistribution,
        },
        upcoming_maintenance: upcomingMaintenance.map(schedule => ({
          id: schedule.id,
          schedule_name: schedule.schedule_name,
          asset_name: schedule.asset.name,
          asset_number: schedule.asset.asset_number,
          due_date: schedule.next_due_date.toISOString(),
          maintenance_type: schedule.maintenance_type,
          priority: schedule.priority,
          days_until_due: Math.ceil(
            (schedule.next_due_date.getTime() - today.getTime()) /
              (1000 * 3600 * 24)
          ),
        })),
        recent_activity: recentWorkOrders.map(wo => ({
          id: wo.id,
          title: wo.title,
          asset_name: wo.asset.name,
          asset_number: wo.asset.asset_number,
          type: wo.type,
          status: wo.status,
          priority: wo.priority,
          assignee: wo.assignee
            ? `${wo.assignee.first_name} ${wo.assignee.last_name}`
            : "Unassigned",
          created_at: wo.created_at.toISOString(),
        })),
        alerts: {
          overdue_count: overdueSchedules,
          high_priority_open:
            workOrdersByPriority.find(p => p.priority === "CRITICAL")?._count
              .priority || 0,
          unassigned_count: pendingWorkOrders,
          inactive_assets: totalAssets - activeAssets,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching maintenance stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch maintenance statistics" },
      { status: 500 }
    );
  }
});