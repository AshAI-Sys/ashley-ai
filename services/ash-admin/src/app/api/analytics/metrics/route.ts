import { NextRequest, NextResponse } from 'next/server'
import { getAllMetrics } from '@/lib/analytics/metrics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspace_id = searchParams.get('workspace_id') || 'default'

    const metrics = await getAllMetrics(workspace_id)

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error fetching analytics metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: error.message },
      { status: 500 }
    )
  }
}
