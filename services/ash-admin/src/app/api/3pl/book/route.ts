import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@ash-ai/database'
import { threePLService } from '@/lib/3pl'

const prisma = new PrismaClient()

// POST /api/3pl/book - Book shipment with 3PL provider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, shipment, shipment_id, reference_number } = body

    if (!provider || !shipment) {
      return NextResponse.json(
        { error: 'provider and shipment details are required' },
        { status: 400 }
      )
    }

    // Book with 3PL provider
    const booking = await threePLService.bookShipment({
      provider,
      shipment,
      reference_number,
    })

    if (!booking.success) {
      return NextResponse.json(
        { error: booking.error || 'Booking failed' },
        { status: 400 }
      )
    }

    // Update shipment in database if shipment_id provided
    if (shipment_id) {
      await prisma.shipment.update({
        where: { id: shipment_id },
        data: {
          method: provider,
          carrier_ref: booking.booking_id,
          tracking_number: booking.tracking_number,
          status: 'BOOKED',
        },
      })

      // Create initial tracking event
      const delivery = await prisma.delivery.findFirst({
        where: {
          shipments: {
            some: {
              shipment_id: shipment_id,
            },
          },
        },
      })

      if (delivery) {
        await prisma.deliveryTrackingEvent.create({
          data: {
            delivery_id: delivery.id,
            status: 'BOOKED',
            description: `Booked with ${provider} - Tracking: ${booking.tracking_number}`,
            timestamp: new Date(),
          },
        })
      }
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error('Error booking 3PL shipment:', error)
    return NextResponse.json(
      {
        error: 'Failed to book shipment',
        details: error.message
      },
      { status: 500 }
    )
  }
}
