import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Get current sample count for this inspection
    const sampleCount = await prisma.qCSample.count({
      where: { inspection_id: params.id }
    })

    const sample = await prisma.qCSample.create({
      data: {
        workspace_id: data.workspace_id || 'default',
        inspection_id: params.id,
        sample_no: sampleCount + 1,
        sampled_from: data.sampled_from,
        unit_ref: data.unit_ref,
        qty_sampled: data.qty_sampled || 1,
        result: data.result || 'OK'
      }
    })

    return NextResponse.json(sample, { status: 201 })
  } catch (error) {
    console.error('Error creating sample:', error)
    return NextResponse.json({ error: 'Failed to create sample' }, { status: 500 })
  }
}