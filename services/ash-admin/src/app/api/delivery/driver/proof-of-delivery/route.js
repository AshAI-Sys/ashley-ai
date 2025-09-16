import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const formData = await request.formData()

    const delivery_reference = formData.get('delivery_reference')
    const recipient_name = formData.get('recipient_name')
    const recipient_signature = formData.get('recipient_signature') // base64 image
    const photo_url = formData.get('photo_url') // delivery photo
    const latitude = parseFloat(formData.get('latitude') || '0')
    const longitude = parseFloat(formData.get('longitude') || '0')
    const delivery_status = formData.get('delivery_status') // DELIVERED/FAILED
    const failure_reason = formData.get('failure_reason')
    const cod_amount_collected = parseFloat(formData.get('cod_amount_collected') || '0')
    const cod_receipt_photo = formData.get('cod_receipt_photo')
    const driver_notes = formData.get('driver_notes')

    // Find delivery
    const delivery = await prisma.delivery.findFirst({
      where: { delivery_reference },
      include: {
        shipments: {
          include: {
            shipment: true
          }
        }
      }
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
        status: delivery_status,
        actual_delivery_date: delivery_status === 'DELIVERED' ? new Date() : null,
        latitude,
        longitude,
        updated_at: new Date()
      }
    })

    // Create detailed tracking event with POD data
    await prisma.deliveryTrackingEvent.create({
      data: {
        delivery_id: delivery.id,
        status: delivery_status,
        description: delivery_status === 'DELIVERED'
          ? `Delivered to ${recipient_name}`
          : `Failed delivery: ${failure_reason}`,
        latitude,
        longitude,
        timestamp: new Date()
      }
    })

    // Update all related shipments
    await Promise.all(
      delivery.shipments.map(sd =>
        prisma.shipment.update({
          where: { id: sd.shipment.id },
          data: {
            status: delivery_status === 'DELIVERED' ? 'DELIVERED' : 'FAILED',
            updated_at: new Date()
          }
        })
      )
    )

    // Store POD data (in a real system, you'd store files properly)
    const podData = {
      delivery_id: delivery.id,
      recipient_name,
      recipient_signature,
      photo_url,
      latitude,
      longitude,
      delivery_status,
      failure_reason,
      cod_amount_collected,
      cod_receipt_photo,
      driver_notes,
      pod_timestamp: new Date()
    }

    // For now, we'll store this as JSON in a tracking event
    await prisma.deliveryTrackingEvent.create({
      data: {
        delivery_id: delivery.id,
        status: 'POD_CAPTURED',
        description: 'Proof of delivery captured',
        timestamp: new Date(),
        // Note: In production, you'd have a separate POD table
        location: JSON.stringify(podData)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Proof of delivery submitted successfully',
      delivery: {
        ...updatedDelivery,
        delivery_address: JSON.parse(updatedDelivery.delivery_address || '{}')
      },
      pod_data: podData
    })

  } catch (error) {
    console.error('POD submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit proof of delivery', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const delivery_reference = searchParams.get('delivery_reference')

    if (!delivery_reference) {
      return NextResponse.json(
        { error: 'delivery_reference parameter required' },
        { status: 400 }
      )
    }

    // Get delivery with POD data
    const delivery = await prisma.delivery.findFirst({
      where: { delivery_reference },
      include: {
        tracking_events: {
          where: { status: 'POD_CAPTURED' },
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    let podData = null
    if (delivery.tracking_events[0]?.location) {
      try {
        podData = JSON.parse(delivery.tracking_events[0].location)
      } catch (e) {
        console.warn('Failed to parse POD data:', e)
      }
    }

    return NextResponse.json({
      success: true,
      delivery: {
        ...delivery,
        delivery_address: JSON.parse(delivery.delivery_address || '{}')
      },
      pod_data: podData
    })

  } catch (error) {
    console.error('Get POD error:', error)
    return NextResponse.json(
      { error: 'Failed to get proof of delivery', details: error.message },
      { status: 500 }
    )
  }
}