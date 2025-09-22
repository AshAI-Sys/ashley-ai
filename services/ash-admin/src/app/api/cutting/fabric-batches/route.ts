import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateFabricBatchSchema = z.object({
  lotNo: z.string().min(1, 'Lot number is required'),
  brandId: z.string().min(1, 'Brand ID is required'),
  fabricType: z.string().min(1, 'Fabric type is required'),
  color: z.string().min(1, 'Color is required'),
  gsm: z.number().positive('GSM must be positive'),
  widthCm: z.number().positive('Width must be positive'),
  qtyOnHand: z.number().positive('Quantity on hand must be positive'),
  uom: z.enum(['KG', 'M', 'YD']),
  estimatedYield: z.number().positive('Estimated yield must be positive').optional(),
  receivedAt: z.string().transform((str) => new Date(str)),
  supplierInfo: z.string().optional(),
});

const UpdateFabricBatchSchema = CreateFabricBatchSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId') || '';
    const uom = searchParams.get('uom') || '';
    const minQty = searchParams.get('minQty');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { lotNo: { contains: search, mode: 'insensitive' } },
            { fabricType: { contains: search, mode: 'insensitive' } },
            { color: { contains: search, mode: 'insensitive' } },
            { brand: { name: { contains: search, mode: 'insensitive' } } },
          ]
        } : {},
        brandId ? { brandId } : {},
        uom ? { uom } : {},
        minQty ? { qtyOnHand: { gte: parseFloat(minQty) } } : {},
      ]
    };

    const [fabricBatches, total] = await Promise.all([
      prisma.fabricBatch.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              fabricIssues: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fabricBatch.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        fabricBatches,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    console.error('Error fetching fabric batches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fabric batches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateFabricBatchSchema.parse(body);

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: validatedData.brandId }
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Check if fabric batch with same lot number already exists
    const existingBatch = await prisma.fabricBatch.findFirst({
      where: { lotNo: validatedData.lotNo }
    });

    if (existingBatch) {
      return NextResponse.json(
        { success: false, error: 'Fabric batch with this lot number already exists' },
        { status: 400 }
      );
    }

    const fabricBatch = await prisma.fabricBatch.create({
      data: {
        ...validatedData,
        estimatedYield: validatedData.estimatedYield || calculateEstimatedYield(
          validatedData.uom,
          validatedData.gsm,
          validatedData.widthCm
        ),
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            fabricIssues: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: fabricBatch,
      message: 'Fabric batch created successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating fabric batch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create fabric batch' },
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
        { success: false, error: 'Fabric batch ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateFabricBatchSchema.parse(body);

    // Check if fabric batch exists
    const existingBatch = await prisma.fabricBatch.findUnique({
      where: { id }
    });

    if (!existingBatch) {
      return NextResponse.json(
        { success: false, error: 'Fabric batch not found' },
        { status: 404 }
      );
    }

    const fabricBatch = await prisma.fabricBatch.update({
      where: { id },
      data: validatedData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            fabricIssues: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: fabricBatch,
      message: 'Fabric batch updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating fabric batch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update fabric batch' },
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
        { success: false, error: 'Fabric batch ID is required' },
        { status: 400 }
      );
    }

    // Check if fabric batch exists
    const existingBatch = await prisma.fabricBatch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            fabricIssues: true,
          }
        }
      }
    });

    if (!existingBatch) {
      return NextResponse.json(
        { success: false, error: 'Fabric batch not found' },
        { status: 404 }
      );
    }

    // Check if fabric batch has issues (prevent deletion if they do)
    if (existingBatch._count.fabricIssues > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete fabric batch with existing fabric issues' },
        { status: 400 }
      );
    }

    await prisma.fabricBatch.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Fabric batch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fabric batch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete fabric batch' },
      { status: 500 }
    );
  }
}

function calculateEstimatedYield(uom: string, gsm: number, widthCm: number): number {
  const averageGarmentArea = 2500; // cm² for medium garment

  if (uom === 'KG') {
    // kg to pieces conversion
    const areaPerKg = (1000 * 10000) / gsm; // cm² per kg
    return Math.round((areaPerKg / averageGarmentArea) * 100) / 100;
  } else {
    // M/YD to pieces conversion
    const areaPerUnit = widthCm * (uom === 'YD' ? 91.44 : 100); // cm² per unit
    return Math.round((areaPerUnit / averageGarmentArea) * 100) / 100;
  }
}