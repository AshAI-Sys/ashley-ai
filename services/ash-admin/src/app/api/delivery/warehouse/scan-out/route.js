import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { carton_qr, shipment_id, scanned_by } = body

    // Find carton by QR code
    const carton = await prisma.carton.findFirst({
      where: { qr_code: carton_qr },
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } }
          }
        }
      }
    })

    if (!carton) {
      return NextResponse.json(
        { error: 'Carton not found with QR code', qr_code: carton_qr },
        { status: 404 }
      )
    }

    // Check if carton is already scanned out
    const existingShipmentCarton = await prisma.shipmentCarton.findFirst({
      where: { carton_id: carton.id }
    })

    if (existingShipmentCarton) {
      return NextResponse.json(
        { error: 'Carton already assigned to shipment', carton_id: carton.id },
        { status: 400 }
      )
    }

    // Create shipment-carton link with timestamp
    await prisma.shipmentCarton.create({
      data: {
        shipment_id,
        carton_id: carton.id,
        created_at: new Date() // This serves as warehouse_out_at
      }
    })

    // Get shipment details for tracking
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipment_id },
      include: {
        deliveries: {
          include: {
            delivery: true
          }
        }
      }
    })

    // Update delivery tracking if exists
    if (shipment?.deliveries[0]?.delivery) {
      await prisma.deliveryTrackingEvent.create({
        data: {
          delivery_id: shipment.deliveries[0].delivery.id,
          status: 'PICKED_UP',
          description: `Carton ${carton.carton_no} scanned out from warehouse`,
          timestamp: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Carton successfully scanned out',
      carton: {
        id: carton.id,
        carton_no: carton.carton_no,
        order_number: carton.order.order_number,
        client_name: carton.order.client.name,
        weight_kg: carton.actual_weight_kg
      },
      scanned_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Warehouse scan-out error:', error)
    return NextResponse.json(
      { error: 'Failed to scan out carton', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const shipment_id = searchParams.get('shipment_id')

    if (!shipment_id) {
      return NextResponse.json(
        { error: 'shipment_id parameter required' },
        { status: 400 }
      )
    }

    // Get all cartons for this shipment with scan-out timestamps
    const shipmentCartons = await prisma.shipmentCarton.findMany({
      where: { shipment_id },
      include: {
        carton: {
          include: {
            order: {
              select: {
                order_number: true,
                client: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    const formattedCartons = shipmentCartons.map(sc => ({
      id: sc.carton.id,
      carton_no: sc.carton.carton_no,
      qr_code: sc.carton.qr_code,
      order_number: sc.carton.order.order_number,
      client_name: sc.carton.order.client.name,
      weight_kg: sc.carton.actual_weight_kg,
      scanned_out_at: sc.created_at
    }))

    return NextResponse.json({
      success: true,
      cartons: formattedCartons,
      total_scanned: formattedCartons.length
    })

  } catch (error) {
    console.error('Get scanned cartons error:', error)
    return NextResponse.json(
      { error: 'Failed to get scanned cartons', details: error.message },
      { status: 500 }
    )
  }
}