import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@ash/database'

const prisma = new PrismaClient()
const DEFAULT_WORKSPACE_ID = 'demo-workspace-1'

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        workspace_id: DEFAULT_WORKSPACE_ID,
      },
      include: {
        client: true,
        brand: true,
        line_items: true,
        design_assets: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        invoices: {
          select: {
            id: true,
            invoice_number: true,
            status: true,
            total_amount: true,
            due_date: true,
          },
        },
        _count: {
          select: {
            line_items: true,
            design_assets: true,
            invoices: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        order_number: body.order_number,
        client_id: body.client_id,
        brand_id: body.brand_id || null,
        status: body.status ? body.status.toLowerCase() : undefined,
        total_amount: body.total_amount ? parseFloat(body.total_amount) : undefined,
        currency: body.currency,
        delivery_date: body.delivery_date ? new Date(body.delivery_date) : undefined,
        notes: body.notes,
      },
      include: {
        client: true,
        brand: true,
        _count: {
          select: {
            line_items: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully',
    })
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.order.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}