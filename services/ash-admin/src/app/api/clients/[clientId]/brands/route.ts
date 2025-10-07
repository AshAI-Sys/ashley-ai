import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  brandColors: z.array(z.string()).optional(),
  defaultPricing: z.record(z.number()).optional(),
  guidelines: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  metadata: z.record(z.any()).optional(),
});

const UpdateBrandSchema = CreateBrandSchema.partial();

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const clientId = params.clientId;

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const brands = await prisma.brand.findMany({
      where: { clientId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          }
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
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
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching client brands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const clientId = params.clientId;
    const body = await request.json();
    const validatedData = CreateBrandSchema.parse(body);

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if brand with same name already exists for this client
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: validatedData.name,
        clientId: clientId,
      }
    });

    if (existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand with this name already exists for this client' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        ...validatedData,
        clientId,
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
        _count: {
          select: {
            orders: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating brand:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
