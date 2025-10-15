import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Count active sewing runs
    const activeRuns = await prisma.sewingRun.count({
      where: {
        status: 'IN_PROGRESS'
      }
    })

    // Count completed runs today
    const todaysCompleted = await prisma.sewingRun.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: today
        }
      }
    })

    // Count unique operators working today
    const operatorsWorkingResult = await prisma.sewingRun.findMany({
      where: {
        status: {
          in: ['IN_PROGRESS', 'COMPLETED']
        },
        createdAt: {
          gte: today
        }
      },
      select: {
        operatorId: true
      },
      distinct: ['operatorId']
    })
    const operatorsWorking = operatorsWorkingResult.length

    // Calculate average efficiency
    const runsWithEfficiency = await prisma.sewingRun.findMany({
      where: {
        actualEfficiency: {
          not: null
        },
        createdAt: {
          gte: today
        }
      },
      select: {
        actualEfficiency: true
      }
    })

    const avgEfficiency = runsWithEfficiency.length > 0
      ? Math.round(runsWithEfficiency.reduce((sum, run) => sum + (run.actualEfficiency || 0), 0) / runsWithEfficiency.length)
      : 0

    // Count pending bundles (runs not started yet)
    const pendingBundles = await prisma.sewingRun.count({
      where: {
        status: 'PENDING'
      }
    })

    // Calculate total pieces completed today
    const completedRuns = await prisma.sewingRun.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: today
        }
      },
      select: {
        actualQuantity: true
      }
    })

    const totalPiecesToday = completedRuns.reduce((sum, run) => sum + (run.actualQuantity || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        active_runs: activeRuns,
        todays_completed: todaysCompleted,
        operators_working: operatorsWorking,
        avg_efficiency: avgEfficiency,
        pending_bundles: pendingBundles,
        total_pieces_today: totalPiecesToday
      }
    })
  } catch (error) {
    console.error('Error fetching sewing dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
