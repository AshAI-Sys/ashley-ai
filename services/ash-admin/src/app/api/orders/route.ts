import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@ash-ai/database';
import { z } from 'zod';

const prisma = new PrismaClient();
const DEFAULT_WORKSPACE_ID = 'demo-workspace-1';

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
  totalAmount: z.number().positive('Total amount must be positive'),
  currency: z.string().default('PHP'),
  deliveryDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  notes: z.string().optional(),
  lineItems: z.array(OrderLineItemSchema).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const clientId = searchParams.get('clientId') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      workspace_id: DEFAULT_WORKSPACE_ID,
    };

    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.client_id = clientId;
    }

    // Fetch orders with related data
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          line_items: true,
          _count: {
            select: {
              line_items: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
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
    const validatedData = CreateOrderSchema.parse(body);

    // Generate order number if not provided
    const orderNumber = validatedData.orderNumber || `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create new order
    const newOrder = await prisma.order.create({
      data: {
        workspace_id: DEFAULT_WORKSPACE_ID,
        order_number: orderNumber,
        client_id: validatedData.clientId,
        brand_id: validatedData.brandId || null,
        status: validatedData.status.toLowerCase(),
        total_amount: validatedData.totalAmount,
        currency: validatedData.currency,
        delivery_date: validatedData.deliveryDate || null,
        notes: validatedData.notes || null,
      },
      include: {
        client: true,
        brand: true,
        _count: {
          select: {
            line_items: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { order: newOrder },
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
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