import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const sample = await prisma.qCSample.create({
      data: {
        workspace_id: data.workspace_id || 'default',
        inspection_id: data.inspection_id,
        sample_no: data.sample_no,
        bundle_ref: data.bundle_ref,
        qty_sampled: data.qty_sampled,
        defects_found: data.defects_found || 0,
        pass_fail: data.pass_fail,
        sample_data: data.sample_data ? JSON.stringify(data.sample_data) : null,
        sampled_at: new Date()
      }
    })

    return NextResponse.json(sample, { status: 201 })
  } catch (error) {
    console.error('Error creating sample:', error)
    return NextResponse.json({ error: 'Failed to create sample' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inspectionId = searchParams.get('inspection_id')

    if (!inspectionId) {
      return NextResponse.json({ error: 'inspection_id is required' }, { status: 400 })
    }

    const samples = await prisma.qCSample.findMany({
      where: { inspection_id: inspectionId },
      include: {
        defects: {
          include: {
            defect_code: true
          }
        }
      },
      orderBy: { sample_no: 'asc' }
    })

    return NextResponse.json(samples)
  } catch (error) {
    console.error('Error fetching samples:', error)
    return NextResponse.json({ error: 'Failed to fetch samples' }, { status: 500 })
  }
}