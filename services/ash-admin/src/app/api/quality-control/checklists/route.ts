import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productType = searchParams.get('product_type')
    const method = searchParams.get('method')

    const where: any = {}
    if (productType && productType !== 'all') {
      where.product_type = productType
    }
    if (method && method !== 'all') {
      where.method = method
    }

    const checklists = await prisma.qCChecklist.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(checklists)
  } catch (error) {
    console.error('Error fetching checklists:', error)
    return NextResponse.json({ error: 'Failed to fetch checklists' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const checklist = await prisma.qCChecklist.create({
      data: {
        workspace_id: data.workspace_id || 'default',
        name: data.name,
        type: data.type || 'FINAL', // Changed from product_type/method to type
        category: data.category || 'VISUAL', // Added category field
        items: JSON.stringify(data.items)
      }
    })

    return NextResponse.json(checklist, { status: 201 })
  } catch (error) {
    console.error('Error creating checklist:', error)
    return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 })
  }
}