import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  company: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('ACTIVE'),
  notes: z.string().optional(),
});

const UpdateClientSchema = CreateClientSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        } : {},
        status ? { status } : {},
      ]
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          brands: true,
          orders: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              orders: true,
              brands: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateClientSchema.parse(body);

    // Check if client with same email already exists
    const existingClient = await prisma.client.findFirst({
      where: { email: validatedData.email }
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client with this email already exists' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: validatedData,
      include: {
        brands: true,
        _count: {
          select: {
            orders: true,
            brands: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Client created successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating client:', error);
    // Force recompilation
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
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
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateClientSchema.parse(body);

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check email uniqueness if email is being updated
    if (validatedData.email && validatedData.email !== existingClient.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email: validatedData.email,
          id: { not: id }
        }
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Client with this email already exists' },
          { status: 400 }
        );
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: validatedData,
      include: {
        brands: true,
        _count: {
          select: {
            orders: true,
            brands: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Client updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
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
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            brands: true,
          }
        }
      }
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if client has orders or brands (prevent deletion if they do)
    if (existingClient._count.orders > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete client with existing orders' },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}