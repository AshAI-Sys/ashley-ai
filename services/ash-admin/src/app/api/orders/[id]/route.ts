import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@ash/database'

const prisma = new PrismaClient()

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        brand: true,
        designAssets: {
          orderBy: { version: 'desc' }
        },
        lays: {
          include: {
            bundles: true
          }
        },
        printRuns: true,
        sewingRuns: true,
        qualityControlChecks: true,
        finishingRuns: true,
        shipments: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order
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
        brand_id: body.brand_id,
        product_type: body.product_type,
        quantity: body.quantity ? parseInt(body.quantity) : undefined,
        unit_price: body.unit_price ? parseFloat(body.unit_price) : undefined,
        currency: body.currency,
        status: body.status,
        delivery_date: body.delivery_date ? new Date(body.delivery_date) : undefined,
        special_instructions: body.special_instructions,
        updated_at: new Date()
      },
      include: {
        client: true,
        brand: true
      }
    })

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
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
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}