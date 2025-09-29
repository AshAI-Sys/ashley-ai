import { NextRequest, NextResponse } from 'next/server';
// Temporarily disable database for demo mode
// import { prisma } from '@/lib/db';
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
    // Demo data for client list
    const demoClients = [
      {
        id: 'client-1',
        name: 'Manila Shirts Co.',
        company: 'Manila Shirts Corporation',
        email: 'orders@manilashirts.com',
        phone: '+63 917 123 4567',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-15'),
        brands: [
          { id: 'brand-1', name: 'Manila Classic', code: 'MNLC' },
          { id: 'brand-2', name: 'Manila Pro', code: 'MNLP' }
        ],
        orders: [
          { id: 'order-1', status: 'IN_PROGRESS', totalAmount: 45000, createdAt: new Date('2024-03-01') },
          { id: 'order-2', status: 'COMPLETED', totalAmount: 32000, createdAt: new Date('2024-02-15') }
        ],
        _count: { orders: 12, brands: 2 }
      },
      {
        id: 'client-2',
        name: 'Cebu Sports Apparel',
        company: 'Cebu Sports Inc.',
        email: 'procurement@cebusports.ph',
        phone: '+63 932 987 6543',
        status: 'ACTIVE',
        createdAt: new Date('2024-02-20'),
        brands: [
          { id: 'brand-3', name: 'Cebu Athletes', code: 'CBAT' }
        ],
        orders: [
          { id: 'order-3', status: 'PENDING', totalAmount: 28000, createdAt: new Date('2024-03-10') }
        ],
        _count: { orders: 5, brands: 1 }
      },
      {
        id: 'client-3',
        name: 'Davao Uniform Solutions',
        company: 'Davao Uniform Solutions LLC',
        email: 'info@davaouniform.com',
        phone: '+63 912 345 6789',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-30'),
        brands: [
          { id: 'brand-4', name: 'Davao Corporate', code: 'DVCR' },
          { id: 'brand-5', name: 'Davao Schools', code: 'DVSC' }
        ],
        orders: [],
        _count: { orders: 8, brands: 2 }
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        clients: demoClients,
        pagination: {
          page: 1,
          limit: 10,
          total: demoClients.length,
          pages: 1,
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

    // Demo client creation - just return a mock created client
    const newClient = {
      id: `client-${Date.now()}`,
      ...validatedData,
      createdAt: new Date(),
      brands: [],
      orders: [],
      _count: { orders: 0, brands: 0 }
    };

    return NextResponse.json({
      success: true,
      data: newClient,
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