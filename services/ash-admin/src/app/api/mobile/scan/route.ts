import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_WORKSPACE_ID = 'demo-workspace-1'

/**
 * Mobile Scan API
 * Processes QR/barcode scans and identifies the entity type
 */
export async function POST(request: NextRequest) {
  try {
    const { code, format } = await request.json()

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          type: 'unknown',
          message: 'No code provided',
        },
        { status: 400 }
      )
    }

    // Try to identify what was scanned based on code format and database lookup

    // 1. Check if it's a Bundle (format: BDL-YYYYMMDD-XXXX or similar)
    if (code.includes('BDL-') || code.includes('BUNDLE-')) {
      const bundle = await prisma.bundle.findFirst({
        where: {
          OR: [
            { qr_code: code },
            { id: code },
          ],
        },
        include: {
          lay: {
            include: {
              order: {
                select: {
                  order_number: true,
                  client: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      })

      if (bundle) {
        return NextResponse.json({
          success: true,
          type: 'bundle',
          data: {
            id: bundle.id,
            bundle_number: bundle.qr_code,
            size: bundle.size_code,
            quantity: bundle.qty,
            status: bundle.status,
            lay_number: bundle.lay?.marker_name,
            order_number: bundle.lay?.order?.order_number,
            client_name: bundle.lay?.order?.client?.name,
          },
          message: `Bundle ${bundle.qr_code} found - ${bundle.qty} pieces`,
        })
      }
    }

    // 2. Check if it's an Order (format: ORD-YYYY-XXXXXX)
    if (code.includes('ORD-') || code.includes('ORDER-')) {
      const order = await prisma.order.findFirst({
        where: {
          order_number: code,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              line_items: true,
            },
          },
        },
      })

      if (order) {
        return NextResponse.json({
          success: true,
          type: 'order',
          data: {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            client: order.client,
            brand: order.brand,
            total_amount: order.total_amount,
            line_items_count: order._count.line_items,
          },
          message: `Order ${order.order_number} - ${order.client.name}`,
        })
      }
    }

    // 3. Check if it's a Finished Unit (format: FU-XXXXXX or SKU-XXXXXX)
    if (code.includes('FU-') || code.includes('SKU-')) {
      const finishedUnit = await prisma.finishedUnit.findFirst({
        where: {
          OR: [
            { sku: code },
            { qr_code: code },
          ],
        },
        include: {
          finishing_run: {
            include: {
              order: {
                select: {
                  order_number: true,
                },
              },
            },
          },
          carton: {
            select: {
              id: true,
              carton_number: true,
            },
          },
        },
      })

      if (finishedUnit) {
        return NextResponse.json({
          success: true,
          type: 'finished_unit',
          data: {
            id: finishedUnit.id,
            sku: finishedUnit.sku,
            quantity: finishedUnit.quantity,
            warehouse_location: finishedUnit.warehouse_location,
            order_number: finishedUnit.finishing_run?.order?.order_number,
            carton: finishedUnit.carton,
          },
          message: `Finished Unit ${finishedUnit.sku} - ${finishedUnit.quantity} pieces`,
        })
      }
    }

    // 4. Check if it's a Carton (format: CTN-XXXXXX)
    if (code.includes('CTN-') || code.includes('CARTON-')) {
      const carton = await prisma.carton.findFirst({
        where: {
          OR: [
            { carton_number: code },
            { qr_code: code },
          ],
        },
        include: {
          finishing_run: {
            include: {
              order: {
                select: {
                  order_number: true,
                  client: {
                    select: { name: true },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              finished_units: true,
            },
          },
        },
      })

      if (carton) {
        return NextResponse.json({
          success: true,
          type: 'carton',
          data: {
            id: carton.id,
            carton_number: carton.carton_number,
            weight_kg: carton.weight_kg,
            length_cm: carton.length_cm,
            width_cm: carton.width_cm,
            height_cm: carton.height_cm,
            order_number: carton.finishing_run?.order?.order_number,
            client_name: carton.finishing_run?.order?.client?.name,
            _count: {
              finished_units: carton._count.finished_units,
            },
          },
          message: `Carton ${carton.carton_number} - ${carton._count.finished_units} units`,
        })
      }
    }

    // 5. If nothing matches, try a generic search by ID
    // This handles cases where QR codes might just be UUIDs
    const results = await Promise.all([
      prisma.bundle.findUnique({ where: { id: code } }),
      prisma.order.findUnique({ where: { id: code } }),
      prisma.finishedUnit.findUnique({ where: { id: code } }),
      prisma.carton.findUnique({ where: { id: code } }),
    ])

    const [bundle, order, finishedUnit, carton] = results

    if (bundle) {
      return NextResponse.json({
        success: true,
        type: 'bundle',
        data: {
          id: bundle.id,
          bundle_number: bundle.qr_code,
          size: bundle.size_code,
          quantity: bundle.qty,
          status: bundle.status,
        },
        message: `Bundle ${bundle.qr_code} found`,
      })
    }

    if (order) {
      return NextResponse.json({
        success: true,
        type: 'order',
        data: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
        },
        message: `Order ${order.order_number} found`,
      })
    }

    if (finishedUnit) {
      return NextResponse.json({
        success: true,
        type: 'finished_unit',
        data: {
          id: finishedUnit.id,
          sku: finishedUnit.sku,
          quantity: finishedUnit.quantity,
        },
        message: `Finished Unit ${finishedUnit.sku} found`,
      })
    }

    if (carton) {
      return NextResponse.json({
        success: true,
        type: 'carton',
        data: {
          id: carton.id,
          carton_number: carton.carton_number,
        },
        message: `Carton ${carton.carton_number} found`,
      })
    }

    // Nothing found
    return NextResponse.json({
      success: false,
      type: 'unknown',
      message: `Code "${code}" not found in the system. Please verify and try again.`,
    })
  } catch (error) {
    console.error('Mobile scan error:', error)
    return NextResponse.json(
      {
        success: false,
        type: 'unknown',
        message: 'An error occurred while processing the scan',
      },
      { status: 500 }
    )
  }
}
