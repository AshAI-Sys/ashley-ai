import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const workspaceId = 'demo-workspace-1' // TODO: Get from auth context

    // Get statistics in parallel
    const [
      totalOrders,
      totalClients,
      totalRevenue,
      activeOrders,
      recentOrders,
      ordersByStatus
    ] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: { workspace_id: workspaceId }
      }),

      // Total clients
      prisma.client.count({
        where: { workspace_id: workspaceId }
      }),

      // Total revenue (sum of all order amounts)
      prisma.order.aggregate({
        where: { workspace_id: workspaceId },
        _sum: { total_amount: true }
      }),

      // Active orders (not completed or cancelled)
      prisma.order.count({
        where: {
          workspace_id: workspaceId,
          status: {
            notIn: ['completed', 'cancelled']
          }
        }
      }),

      // Recent orders (last 5)
      prisma.order.findMany({
        where: { workspace_id: workspaceId },
        orderBy: { created_at: 'desc' },
        take: 5,
        include: {
          client: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: { workspace_id: workspaceId },
        _count: { status: true }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalClients,
          totalRevenue: totalRevenue._sum.total_amount || 0,
          activeOrders
        },
        recentOrders,
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count.status
        }))
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
