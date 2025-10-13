import { NextRequest, NextResponse } from 'next/server'
import { db } from '@ash-ai/database';
import { getWorkspaceIdFromRequest } from '@/lib/workspace';
import { apiSuccess, apiNotFound, apiServerError } from '@/lib/api-response';
import { logError } from '@/lib/logger';

const prisma = db

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        workspace_id: workspaceId,
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
      return apiNotFound('Order')
    }

    return apiSuccess(order)
  } catch (error) {
    logError('Failed to fetch order', error, { orderId: params.id })
    return apiServerError(error)
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
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

    return apiSuccess(order, 'Order updated successfully')
  } catch (error) {
    logError('Failed to update order', error, { orderId: params.id })
    return apiServerError(error)
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    await prisma.order.delete({
      where: { id: params.id },
    })

    return apiSuccess({ id: params.id }, 'Order deleted successfully')
  } catch (error) {
    logError('Failed to delete order', error, { orderId: params.id })
    return apiServerError(error)
  }
}