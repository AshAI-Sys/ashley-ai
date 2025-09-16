import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { reference } = params

    const delivery = await prisma.delivery.findFirst({
      where: {
        delivery_reference: reference
      },
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
        shipments: {
          include: {
            shipment: {
              include: {
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
                }
              }
            }
          }
        },
        tracking_events: {
          orderBy: { timestamp: 'desc' }
        }
      }
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Format response
    const formattedDelivery = {
      ...delivery,
      delivery_address: JSON.parse(delivery.delivery_address || '{}'),
      shipment_details: delivery.shipments.map(sd => ({
        ...sd.shipment,
        consignee_address: JSON.parse(sd.shipment.consignee_address || '{}'),
        carton_count: sd.shipment.cartons.length,
        total_weight: sd.shipment.cartons.reduce((sum, sc) =>
          sum + (sc.carton.actual_weight_kg || 0), 0
        )
      }))
    }

    return NextResponse.json({
      success: true,
      delivery: formattedDelivery
    })

  } catch (error) {
    console.error('Delivery tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to load delivery tracking', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { reference } = params
    const body = await request.json()
    const { status, location, description, latitude, longitude, tracking_number } = body

    const delivery = await prisma.delivery.findFirst({
      where: { delivery_reference: reference }
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Update delivery status
    const updatedDelivery = await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status,
        current_location: location,
        latitude,
        longitude,
        tracking_number,
        actual_delivery_date: status === 'DELIVERED' ? new Date() : delivery.actual_delivery_date,
        updated_at: new Date()
      }
    })

    // Create tracking event
    await prisma.deliveryTrackingEvent.create({
      data: {
        delivery_id: delivery.id,
        status,
        location,
        description,
        latitude,
        longitude,
        timestamp: new Date()
      }
    })

    // Update shipment status as well
    if (status === 'DELIVERED') {
      await prisma.shipment.updateMany({
        where: {
          deliveries: {
            some: { delivery_id: delivery.id }
          }
        },
        data: {
          status: 'DELIVERED',
          updated_at: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      delivery: {
        ...updatedDelivery,
        delivery_address: JSON.parse(updatedDelivery.delivery_address || '{}')
      }
    })

  } catch (error) {
    console.error('Update delivery error:', error)
    return NextResponse.json(
      { error: 'Failed to update delivery', details: error.message },
      { status: 500 }
    )
  }
}