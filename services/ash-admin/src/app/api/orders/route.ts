import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// Demo mode - auth temporarily disabled
// import { requireAnyPermission } from '../../../lib/auth-middleware';

const OrderLineItemSchema = z.object({
  productType: z.string().min(1, 'Product type is required'),
  description: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  totalPrice: z.number().positive('Total price must be positive'),
  sizeCurve: z.record(z.number()).optional(),
  specifications: z.record(z.any()).optional(),
});

const CreateOrderSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  brandId: z.string().optional(),
  orderNumber: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  targetDeliveryDate: z.string().transform((str) => new Date(str)),
  totalAmount: z.number().positive('Total amount must be positive'),
  currency: z.string().default('PHP'),
  paymentTerms: z.string().optional(),
  specialInstructions: z.string().optional(),
  shippingAddress: z.string().optional(),
  lineItems: z.array(OrderLineItemSchema).min(1, 'At least one line item is required'),
});

// Demo mode - no auth required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const clientId = searchParams.get('clientId') || '';
    const priority = searchParams.get('priority') || '';

    // Return demo orders data
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
    ];

    // Apply filters to demo data
    let filteredOrders = demoOrders.filter(order => {
      let matches = true;

      if (search) {
        matches = matches && (
          order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          order.client.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (status) {
        matches = matches && order.status === status;
      }

      if (clientId) {
        matches = matches && order.clientId === clientId;
      }

      if (priority) {
        matches = matches && order.priority === priority;
      }

      return matches;
    });

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          page,
          limit,
          total: filteredOrders.length,
          totalPages: Math.ceil(filteredOrders.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = CreateOrderSchema.parse(body);

    // Generate order number if not provided
    const orderNumber = validatedData.orderNumber || `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create demo order response
    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { lineItems: validatedData.lineItems.length }
    };

    return NextResponse.json({
      success: true,
      data: { order: newOrder },
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}