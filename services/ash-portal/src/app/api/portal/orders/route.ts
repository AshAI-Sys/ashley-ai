import { NextRequest, NextResponse } from 'next/server'
import { db } from '@ash-ai/database'
import { verify } from 'jsonwebtoken'

const prisma = db

interface JWTPayload {
  clientId: string
  workspaceId: string
  email: string
  name: string
}

async function getClientFromToken(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('portal-token')?.value

    if (!token) {
      return null
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key'
    const payload = verify(token, jwtSecret) as JWTPayload

    return payload
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await getClientFromToken(request)

    if (!client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // Build where condition
    const where: any = {
      workspace_id: client.workspaceId,
      client_id: client.clientId,
    }

    if (status) {
      where.status = status
    }

    // Get orders with related data (simplified to avoid schema mismatches)
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          brand: true,
          line_items: true,
          design_assets: true,
          bundles: true,
          invoices: {
            where: { status: { not: 'draft' } },
            include: {
              payments: true,
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where })
    ])

    // Log activity
    await prisma.clientActivity.create({
      data: {
        workspace_id: client.workspaceId,
        client_id: client.clientId,
        activity_type: 'VIEW_ORDERS',
        description: `Viewed orders list (page ${page})`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    })

    // Transform orders to include progress tracking
    const transformedOrders = orders.map(order => {
      // Calculate production progress based on order status
      const totalSteps = 7 // Design → Cutting → Printing → Sewing → QC → Finishing → Delivery
      let completedSteps = 0
      let currentStage = 'Order Placed'

      // Simple progress calculation based on order status
      const statusMap: Record<string, { steps: number; stage: string }> = {
        'PENDING': { steps: 0, stage: 'Order Placed' },
        'DESIGN': { steps: 1, stage: 'Design Phase' },
        'PRODUCTION': { steps: 3, stage: 'In Production' },
        'QC': { steps: 5, stage: 'Quality Control' },
        'PACKING': { steps: 6, stage: 'Packing' },
        'SHIPPED': { steps: 7, stage: 'Shipped' },
        'DELIVERED': { steps: 7, stage: 'Delivered' },
        'COMPLETED': { steps: 7, stage: 'Completed' },
      }

      const statusInfo = statusMap[order.status] || statusMap['PENDING']
      completedSteps = statusInfo.steps
      currentStage = statusInfo.stage

      const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

      // Calculate payment status
      const totalInvoiced = order.invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
      const totalPaid = order.invoices.reduce((sum, inv) =>
        sum + inv.payments.reduce((paySum, pay) => paySum + pay.amount, 0), 0
      )
      const paymentStatus = totalPaid >= totalInvoiced ? 'paid' : totalPaid > 0 ? 'partial' : 'pending'

      return {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        currency: order.currency,
        delivery_date: order.delivery_date,
        created_at: order.created_at,
        updated_at: order.updated_at,
        brand: order.brand,
        line_items: order.line_items,
        progress: {
          percentage: progressPercentage,
          current_stage: currentStage,
          completed_steps: completedSteps,
          total_steps: totalSteps,
        },
        payment: {
          status: paymentStatus,
          total_invoiced: totalInvoiced,
          total_paid: totalPaid,
          outstanding: totalInvoiced - totalPaid,
        },
        latest_tracking: null, // Simplified - tracking not included in this query
        needs_approval: false, // Simplified - approval checking not included
      }
    })

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch orders'
    }, { status: 500 })
  }
}