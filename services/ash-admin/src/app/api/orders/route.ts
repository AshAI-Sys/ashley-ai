import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

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

const UpdateOrderSchema = CreateOrderSchema.partial().extend({
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
    const priority = searchParams.get('priority') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { client: { name: { contains: search, mode: 'insensitive' } } },
            { specialInstructions: { contains: search, mode: 'insensitive' } },
          ]
        } : {},
        status ? { status } : {},
        clientId ? { clientId } : {},
        priority ? { priority } : {},
      ]
    };

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
              company: true,
              email: true,
            }
          },
          brand: {
            select: {
              id: true,
              name: true,
            }
          },
          lineItems: true,
          routingSteps: {
            select: {
              id: true,
              stepName: true,
              status: true,
              startDate: true,
              endDate: true,
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              lineItems: true,
              routingSteps: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
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
          pages: Math.ceil(total / limit),
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
    const validatedData = CreateOrderSchema.parse(body);

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: validatedData.clientId }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if brand exists (if provided)
    if (validatedData.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: validatedData.brandId }
      });

      if (!brand) {
        return NextResponse.json(
          { success: false, error: 'Brand not found' },
          { status: 404 }
        );
      }
    }

    // Generate order number if not provided
    let orderNumber = validatedData.orderNumber;
    if (!orderNumber) {
      const orderCount = await prisma.order.count();
      orderNumber = `ASH-${String(orderCount + 1).padStart(6, '0')}`;
    }

    // Create order with line items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          ...validatedData,
          orderNumber,
          lineItems: {
            create: validatedData.lineItems,
          },
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
            }
          },
          brand: {
            select: {
              id: true,
              name: true,
            }
          },
          lineItems: true,
        }
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateOrderSchema.parse(body);

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { lineItems: true }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update line items if provided
      if (validatedData.lineItems) {
        // Delete existing line items
        await tx.orderLineItem.deleteMany({
          where: { orderId: id }
        });

        // Create new line items
        await tx.orderLineItem.createMany({
          data: validatedData.lineItems.map(item => ({
            ...item,
            orderId: id,
          }))
        });
      }

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          ...validatedData,
          lineItems: undefined, // Remove lineItems from update data
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
            }
          },
          brand: {
            select: {
              id: true,
              name: true,
            }
          },
          lineItems: true,
        }
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        routingSteps: true,
        _count: {
          select: {
            routingSteps: true,
          }
        }
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is in production (prevent deletion)
    if (existingOrder.status === 'IN_PRODUCTION' || existingOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete order that is in production or completed' },
        { status: 400 }
      );
    }

    // Delete order (cascade will handle line items)
    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}