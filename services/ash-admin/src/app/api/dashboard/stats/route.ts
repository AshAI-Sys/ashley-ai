import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const includeCharts = searchParams.get('includeCharts') !== 'false'
    const workspaceId = 'demo-workspace-1' // TODO: Get from auth context

    // Calculate date range
    const days = parseInt(timeRange.replace('d', ''))
    const startDate = subDays(new Date(), days)

    // Get comprehensive statistics in parallel
    const [
      totalOrders,
      totalClients,
      totalRevenue,
      activeOrders,
      recentOrders,
      ordersByStatus,
      cuttingRuns,
      printRuns,
      sewingRuns,
      finishingRuns
    ] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: {
          workspace_id: workspaceId,
          created_at: { gte: startDate }
        }
      }),

      // Total clients
      prisma.client.count({
        where: { workspace_id: workspaceId }
      }),

      // Total revenue
      prisma.order.aggregate({
        where: {
          workspace_id: workspaceId,
          created_at: { gte: startDate }
        },
        _sum: { total_amount: true }
      }),

      // Active orders (in production)
      prisma.order.count({
        where: {
          workspace_id: workspaceId,
          status: 'in_production'
        }
      }),

      // Recent orders
      prisma.order.findMany({
        where: { workspace_id: workspaceId },
        orderBy: { created_at: 'desc' },
        take: 10,
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
      }),

      // Production runs
      prisma.cuttingRun.findMany({
        where: { created_at: { gte: startDate } },
        select: {
          id: true,
          bundles_cut: true,
          efficiency_score: true,
          created_at: true
        }
      }),

      prisma.printRun.findMany({
        where: { created_at: { gte: startDate } },
        select: {
          id: true,
          quantity: true,
          efficiency_score: true,
          created_at: true
        }
      }),

      prisma.sewingRun.findMany({
        where: { created_at: { gte: startDate } },
        select: {
          id: true,
          pieces_completed: true,
          efficiency_score: true,
          created_at: true
        }
      }),

      prisma.finishingRun.findMany({
        where: { created_at: { gte: startDate } },
        select: {
          id: true,
          quantity: true,
          status: true,
          created_at: true
        }
      })
    ])

    // Calculate efficiency scores
    const avgCuttingEfficiency = cuttingRuns.length > 0
      ? Math.round(cuttingRuns.reduce((sum, run) => sum + (run.efficiency_score || 0), 0) / cuttingRuns.length)
      : 0

    const avgPrintingEfficiency = printRuns.length > 0
      ? Math.round(printRuns.reduce((sum, run) => sum + (run.efficiency_score || 0), 0) / printRuns.length)
      : 0

    const avgSewingEfficiency = sewingRuns.length > 0
      ? Math.round(sewingRuns.reduce((sum, run) => sum + (run.efficiency_score || 0), 0) / sewingRuns.length)
      : 0

    const avgFinishingEfficiency = 88 // Mock for now

    const overallEfficiency = Math.round(
      (avgCuttingEfficiency + avgPrintingEfficiency + avgSewingEfficiency + avgFinishingEfficiency) / 4
    )

    // Today's metrics
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    const completedToday = await prisma.order.count({
      where: {
        workspace_id: workspaceId,
        status: 'completed',
        updated_at: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    })

    // Prepare chart data
    let productionTrendData = []
    if (includeCharts) {
      productionTrendData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
        const date = subDays(today, days - 1 - i)
        const dateStr = format(date, 'MMM dd')
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)

        const cuttingCount = cuttingRuns.filter(r => {
          const runDate = new Date(r.created_at)
          return runDate >= dayStart && runDate <= dayEnd
        }).reduce((sum, r) => sum + (r.bundles_cut || 0), 0)

        const printingCount = printRuns.filter(r => {
          const runDate = new Date(r.created_at)
          return runDate >= dayStart && runDate <= dayEnd
        }).reduce((sum, r) => sum + (r.quantity || 0), 0)

        const sewingCount = sewingRuns.filter(r => {
          const runDate = new Date(r.created_at)
          return runDate >= dayStart && runDate <= dayEnd
        }).reduce((sum, r) => sum + (r.pieces_completed || 0), 0)

        const finishingCount = finishingRuns.filter(r => {
          const runDate = new Date(r.created_at)
          return runDate >= dayStart && runDate <= dayEnd
        }).reduce((sum, r) => sum + (r.quantity || 0), 0)

        return {
          date: dateStr,
          cutting: cuttingCount,
          printing: printingCount,
          sewing: sewingCount,
          finishing: finishingCount,
          target: 250
        }
      })
    }

    // Efficiency data
    const efficiencyData = [
      { department: 'Cutting', efficiency: avgCuttingEfficiency, target: 90, color: '#3B82F6' },
      { department: 'Printing', efficiency: avgPrintingEfficiency, target: 90, color: '#10B981' },
      { department: 'Sewing', efficiency: avgSewingEfficiency, target: 85, color: '#F59E0B' },
      { department: 'Finishing', efficiency: avgFinishingEfficiency, target: 90, color: '#8B5CF6' }
    ]

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalClients,
          totalRevenue: totalRevenue._sum.total_amount || 0,
          activeOrders,
          completedToday,
          overallEfficiency
        },
        production: {
          cutting: cuttingRuns.length,
          printing: printRuns.length,
          sewing: sewingRuns.length,
          finishing: finishingRuns.length
        },
        recentOrders,
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count.status
        })),
        ...(includeCharts && {
          charts: {
            productionTrends: productionTrendData,
            efficiencyByDepartment: efficiencyData
          }
        }),
        metadata: {
          timeRange,
          startDate: startDate.toISOString(),
          endDate: today.toISOString(),
          generatedAt: new Date().toISOString()
        }
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
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
