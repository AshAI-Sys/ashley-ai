import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      order_id,
      carton_ids,
      consignee_name,
      consignee_address,
      contact_phone,
      method,
      cod_amount,
      special_instructions
    } = body

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        workspace_id: 'default',
        order_id,
        consignee_name,
        consignee_address: JSON.stringify(consignee_address),
        contact_phone,
        method,
        cod_amount,
        status: 'READY_FOR_PICKUP',
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    // Link cartons to shipment
    if (carton_ids && carton_ids.length > 0) {
      await Promise.all(
        carton_ids.map(carton_id =>
          prisma.shipmentCarton.create({
            data: {
              shipment_id: shipment.id,
              carton_id
            }
          })
        )
      )
    }

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        workspace_id: 'default',
        order_id,
        delivery_reference: `DEL-${Date.now()}`,
        carrier_name: method,
        status: 'PENDING',
        delivery_address: JSON.stringify(consignee_address),
        special_instructions,
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    // Link shipment to delivery
    await prisma.shipmentDelivery.create({
      data: {
        delivery_id: delivery.id,
        shipment_id: shipment.id
      }
    })

    // Create initial tracking event
    await prisma.deliveryTrackingEvent.create({
      data: {
        delivery_id: delivery.id,
        status: 'SHIPMENT_CREATED',
        description: `Shipment created for ${method}`,
        timestamp: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      shipment: {
        ...shipment,
        consignee_address: JSON.parse(shipment.consignee_address)
      },
      delivery
    }, { status: 201 })

  } catch (error) {
    console.error('Create shipment error:', error)
    return NextResponse.json(
      { error: 'Failed to create shipment', details: error.message },
      { status: 500 }
    )
  }
}