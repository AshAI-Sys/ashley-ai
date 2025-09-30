import { NextRequest, NextResponse } from 'next/server'

// Demo orders data (same as list endpoint)
const demoOrders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    clientId: 'client-1',
    client: {
      id: 'client-1',
      name: 'Manila Shirts Co.',
      company: 'Manila Shirts Corporation'
    },
    brandId: 'brand-1',
    brand: {
      id: 'brand-1',
      name: 'Manila Classic',
      code: 'MNLC'
    },
    status: 'IN_PRODUCTION',
    priority: 'HIGH',
    totalAmount: 125000,
    currency: 'PHP',
    targetDeliveryDate: new Date('2024-12-15'),
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-09-28'),
    lineItems: [
      {
        id: 'item-1',
        productType: 'T-Shirt',
        description: 'Cotton crew neck t-shirts with custom print',
        quantity: 500,
        unitPrice: 250,
        totalPrice: 125000,
        sizeCurve: { XS: 50, S: 100, M: 150, L: 125, XL: 75 }
      }
    ],
    _count: { lineItems: 1 }
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024-002',
    clientId: 'client-2',
    client: {
      id: 'client-2',
      name: 'Cebu Fashion House',
      company: 'Cebu Fashion House Inc.'
    },
    brandId: 'brand-2',
    brand: {
      id: 'brand-2',
      name: 'Cebu Style',
      code: 'CEBU'
    },
    status: 'PENDING_APPROVAL',
    priority: 'MEDIUM',
    totalAmount: 89500,
    currency: 'PHP',
    targetDeliveryDate: new Date('2024-12-20'),
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-09-27'),
    lineItems: [
      {
        id: 'item-2',
        productType: 'Polo Shirt',
        description: 'Polo shirts with embroidered logo',
        quantity: 300,
        unitPrice: 298.33,
        totalPrice: 89500
      }
    ],
    _count: { lineItems: 1 }
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2024-003',
    clientId: 'client-3',
    client: {
      id: 'client-3',
      name: 'Davao Apparel Co.',
      company: 'Davao Apparel Corporation'
    },
    status: 'COMPLETED',
    priority: 'LOW',
    totalAmount: 67500,
    currency: 'PHP',
    targetDeliveryDate: new Date('2024-11-30'),
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-25'),
    lineItems: [
      {
        id: 'item-3',
        productType: 'Hoodie',
        description: 'Custom printed hoodies',
        quantity: 200,
        unitPrice: 337.5,
        totalPrice: 67500
      }
    ],
    _count: { lineItems: 1 }
  }
]

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = demoOrders.find(o => o.id === params.id)

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // In demo mode, just return success with updated data
    return NextResponse.json({
      success: true,
      data: {
        id: params.id,
        ...body,
        updatedAt: new Date().toISOString()
      },
      message: 'Order updated successfully'
    })
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}