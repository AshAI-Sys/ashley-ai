import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1)
    }

    // Get quality metrics
    const inspections = await prisma.qCInspection.findMany({
      where: {
        inspection_date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        defects: true,
        samples: true
      }
    })

    // Calculate metrics
    const totalInspections = inspections.length
    const passedInspections = inspections.filter(i => i.result === 'ACCEPT').length
    const failedInspections = inspections.filter(i => i.result === 'REJECT').length

    const totalSamples = inspections.reduce((sum, i) => sum + i.sample_size, 0)
    const totalDefects = inspections.reduce((sum, i) =>
      sum + i.critical_found + i.major_found + i.minor_found, 0)

    const defectRate = totalSamples > 0 ? (totalDefects / totalSamples) * 100 : 0
    const firstPassYield = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0

    // Calculate cost of quality (simplified)
    const costOfQuality = failedInspections * 850 + totalDefects * 125 // Estimated costs

    // Get customer complaints (mock for now)
    const customerComplaints = Math.floor(Math.random() * 5)

    // Calculate trend (compare with previous period)
    const prevStartDate = new Date(startDate)
    const prevEndDate = new Date(startDate)

    switch (period) {
      case 'week':
        prevStartDate.setDate(prevStartDate.getDate() - 7)
        break
      case 'month':
        prevStartDate.setMonth(prevStartDate.getMonth() - 1)
        break
      case 'quarter':
        prevStartDate.setMonth(prevStartDate.getMonth() - 3)
        break
    }

    const prevInspections = await prisma.qCInspection.findMany({
      where: {
        inspection_date: {
          gte: prevStartDate,
          lte: prevEndDate
        }
      }
    })

    const prevTotalSamples = prevInspections.reduce((sum, i) => sum + i.sample_size, 0)
    const prevTotalDefects = prevInspections.reduce((sum, i) =>
      sum + i.critical_found + i.major_found + i.minor_found, 0)
    const prevDefectRate = prevTotalSamples > 0 ? (prevTotalDefects / prevTotalSamples) * 100 : 0

    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (defectRate > prevDefectRate * 1.05) trend = 'up'
    else if (defectRate < prevDefectRate * 0.95) trend = 'down'

    return NextResponse.json({
      defect_rate: defectRate,
      first_pass_yield: firstPassYield,
      cost_of_quality: costOfQuality,
      customer_complaints: customerComplaints,
      trend,
      period_summary: {
        total_inspections: totalInspections,
        passed_inspections: passedInspections,
        failed_inspections: failedInspections,
        total_samples: totalSamples,
        total_defects: totalDefects
      }
    })
  } catch (error) {
    console.error('Error calculating quality metrics:', error)
    return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 })
  }
}