import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  brandColors: z.array(z.string()).optional(),
  defaultPricing: z.record(z.number()).optional(),
  guidelines: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  metadata: z.record(z.any()).optional(),
}).partial();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; brandId: string } }
) {
  try {
    const { id: clientId, brandId } = params;

    const brand = await prisma.brand.findUnique({
      where: {
        id: brandId,
        client_id: clientId,
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
        orders: {
          select: {
            id: true,
            order_number: true,
            status: true,
            total_amount: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
          }
        }
      },
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; brandId: string } }
) {
  try {
    const { id: clientId, brandId } = params;
    const body = await request.json();
    const validatedData = UpdateBrandSchema.parse(body);

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    if (existingBrand.client_id !== clientId) {
      return NextResponse.json(
        { success: false, error: 'Brand does not belong to this client' },
        { status: 403 }
      );
    }

    // Check name uniqueness if name is being updated
    if (validatedData.name && validatedData.name !== existingBrand.name) {
      const nameExists = await prisma.brand.findFirst({
        where: {
          name: validatedData.name,
          client_id: clientId,
          id: { not: brandId }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Brand with this name already exists for this client' },
          { status: 400 }
        );
      }
    }

    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: validatedData,
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
      message: 'Brand updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating brand:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; brandId: string } }
) {
  try {
    const { id: clientId, brandId } = params;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        _count: {
          select: {
            orders: true,
          }
        }
      }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    if (existingBrand.client_id !== clientId) {
      return NextResponse.json(
        { success: false, error: 'Brand does not belong to this client' },
        { status: 403 }
      );
    }

    // Check if brand has orders (prevent deletion if they do)
    if (existingBrand._count.orders > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete brand with existing orders' },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id: brandId }
    });

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
