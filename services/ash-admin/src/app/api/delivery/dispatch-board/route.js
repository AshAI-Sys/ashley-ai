import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const method = searchParams.get('method')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const offset = (page - 1) * limit

    // Build filters
    const filters = {
      workspace_id: 'default'
    }

    if (status !== 'all') {
      filters.status = status
    }

    if (method) {
      filters.method = method
    }

    // Get shipments with related data
    const [shipments, totalCount] = await Promise.all([
      prisma.shipment.findMany({
        where: filters,
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              client: {
                select: { name: true }
              }
            }
          },
          cartons: {
            include: {
              carton: {
                select: {
                  id: true,
                  carton_no: true,
                  actual_weight_kg: true
                }
              }
            }
          },
          deliveries: {
            include: {
              delivery: {
                select: {
                  id: true,
                  delivery_reference: true,
                  status: true,
                  estimated_delivery_date: true,
                  tracking_number: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.shipment.count({ where: filters })
    ])

    // Get available cartons for new shipments
    const availableCartons = await prisma.carton.findMany({
      where: {
        workspace_id: 'default',
        status: 'CLOSED',
        shipment_cartons: {
          none: {}
        }
      },
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 50
    })

    // Format response
    const formattedShipments = shipments.map(shipment => ({
      ...shipment,
      consignee_address: JSON.parse(shipment.consignee_address || '{}'),
      total_weight: shipment.cartons.reduce((sum, sc) =>
        sum + (sc.carton.actual_weight_kg || 0), 0
      ),
      carton_count: shipment.cartons.length,
      delivery: shipment.deliveries[0]?.delivery || null
    }))

    return NextResponse.json({
      success: true,
      shipments: formattedShipments,
      available_cartons: availableCartons,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Dispatch board error:', error)
    return NextResponse.json(
      { error: 'Failed to load dispatch board', details: error.message },
      { status: 500 }
    )
  }
}