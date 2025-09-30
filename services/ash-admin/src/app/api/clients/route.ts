import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@ash-ai/database';
import { z } from 'zod';

const prisma = new PrismaClient();

// Default workspace for demo
const DEFAULT_WORKSPACE_ID = 'demo-workspace-1';

const CreateClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  contact_person: z.string().optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  address: z.union([z.string(), z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  })]).optional(),
  tax_id: z.string().optional(),
  payment_terms: z.number().optional(),
  credit_limit: z.number().optional(),
  is_active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const is_active = searchParams.get('is_active');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      workspace_id: DEFAULT_WORKSPACE_ID,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contact_person: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (is_active !== null && is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    // Fetch clients with related data
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          brands: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          orders: {
            select: {
              id: true,
              status: true,
              total_amount: true,
              created_at: true,
            },
            orderBy: { created_at: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              orders: true,
              brands: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
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
        },
      },
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

    // Convert address object to JSON string if it's an object
    const addressData = typeof validatedData.address === 'object'
      ? JSON.stringify(validatedData.address)
      : validatedData.address;

    // Create new client
    const newClient = await prisma.client.create({
      data: {
        workspace_id: DEFAULT_WORKSPACE_ID,
        name: validatedData.name,
        contact_person: validatedData.contact_person || '',
        email: validatedData.email || '',
        phone: validatedData.phone || '',
        address: addressData,
        tax_id: validatedData.tax_id || '',
        payment_terms: validatedData.payment_terms || null,
        credit_limit: validatedData.credit_limit || null,
        is_active: validatedData.is_active,
      },
      include: {
        _count: {
          select: {
            orders: true,
            brands: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newClient,
        message: 'Client created successfully',
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

    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}