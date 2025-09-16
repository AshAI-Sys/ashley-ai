import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      shipment_id,
      provider_code,
      quote_data,
      pickup_instructions,
      delivery_instructions
    } = body

    // Get shipment details
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipment_id },
      include: {
        order: {
          include: {
            client: true
          }
        },
        cartons: {
          include: {
            carton: true
          }
        }
      }
    })

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      )
    }

    // Generate booking reference
    const booking_reference = `${provider_code}-${Date.now()}`
    const waybill_number = `WB${Date.now().toString().slice(-8)}`

    // Update shipment with carrier info
    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment_id },
      data: {
        method: provider_code,
        carrier_ref: booking_reference,
        status: 'BOOKED_3PL',
        updated_at: new Date()
      }
    })

    // Get or create delivery record
    let delivery = await prisma.delivery.findFirst({
      where: {
        shipments: {
          some: { shipment_id }
        }
      }
    })

    if (!delivery) {
      // Create delivery if doesn't exist
      delivery = await prisma.delivery.create({
        data: {
          workspace_id: 'default',
          order_id: shipment.order_id,
          delivery_reference: `DEL-${Date.now()}`,
          carrier_name: quote_data.provider_name,
          status: 'PENDING',
          estimated_delivery_date: new Date(quote_data.estimated_delivery_date),
          delivery_address: shipment.consignee_address,
          special_instructions: delivery_instructions,
          tracking_number: waybill_number,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      // Link shipment to delivery
      await prisma.shipmentDelivery.create({
        data: {
          delivery_id: delivery.id,
          shipment_id
        }
      })
    } else {
      // Update existing delivery
      await prisma.delivery.update({
        where: { id: delivery.id },
        data: {
          carrier_name: quote_data.provider_name,
          tracking_number: waybill_number,
          estimated_delivery_date: new Date(quote_data.estimated_delivery_date),
          updated_at: new Date()
        }
      })
    }

    // Create booking tracking event
    await prisma.deliveryTrackingEvent.create({
      data: {
        delivery_id: delivery.id,
        status: 'BOOKED',
        description: `Booked with ${quote_data.provider_name} (${booking_reference})`,
        timestamp: new Date()
      }
    })

    // Mock 3PL API call (in production, call actual 3PL API)
    const mockBookingResponse = await mockBookWith3PL({
      provider_code,
      booking_reference,
      waybill_number,
      shipment_details: {
        pickup_address: {
          name: 'Ashley AI Warehouse',
          address: '123 Manufacturing St, Quezon City',
          phone: '+63917123456'
        },
        delivery_address: JSON.parse(shipment.consignee_address),
        packages: shipment.cartons.map(sc => ({
          carton_no: sc.carton.carton_no,
          weight_kg: sc.carton.actual_weight_kg,
          dimensions: `${sc.carton.length_cm || 30}x${sc.carton.width_cm || 20}x${sc.carton.height_cm || 15}cm`
        })),
        cod_amount: shipment.cod_amount,
        special_instructions: pickup_instructions
      },
      quote_data
    })

    return NextResponse.json({
      success: true,
      booking: {
        booking_reference,
        waybill_number,
        provider: quote_data.provider_name,
        estimated_cost: quote_data.total_cost,
        estimated_delivery: quote_data.estimated_delivery_date,
        tracking_url: mockBookingResponse.tracking_url,
        label_url: mockBookingResponse.label_url
      },
      shipment: {
        ...updatedShipment,
        consignee_address: JSON.parse(updatedShipment.consignee_address)
      },
      delivery
    })

  } catch (error) {
    console.error('3PL Booking error:', error)
    return NextResponse.json(
      { error: 'Failed to book with 3PL', details: error.message },
      { status: 500 }
    )
  }
}

// Mock 3PL API integration
async function mockBookWith3PL(bookingData) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const { provider_code, booking_reference, waybill_number } = bookingData

  // Mock successful booking response
  return {
    success: true,
    booking_id: `${provider_code}_${booking_reference}`,
    waybill: waybill_number,
    status: 'CONFIRMED',
    pickup_scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    tracking_url: `https://tracking.${provider_code.toLowerCase()}.com/${waybill_number}`,
    label_url: `https://labels.${provider_code.toLowerCase()}.com/${booking_reference}.pdf`,
    pickup_reference: `PU${Date.now().toString().slice(-6)}`,
    estimated_pickup: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    contact_number: '+63917999888'
  }
}

// Webhook endpoint for 3PL status updates
export async function PUT(request) {
  try {
    const body = await request.json()
    const {
      waybill_number,
      status,
      location,
      timestamp,
      provider_signature // Verify this is from legitimate 3PL
    } = body

    // Find delivery by tracking number
    const delivery = await prisma.delivery.findFirst({
      where: { tracking_number: waybill_number }
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Update delivery status
    await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status,
        current_location: location,
        updated_at: new Date()
      }
    })

    // Create tracking event
    await prisma.deliveryTrackingEvent.create({
      data: {
        delivery_id: delivery.id,
        status,
        location,
        description: `3PL Update: ${status}`,
        timestamp: new Date(timestamp)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Status update received'
    })

  } catch (error) {
    console.error('3PL Webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process status update', details: error.message },
      { status: 500 }
    )
  }
}