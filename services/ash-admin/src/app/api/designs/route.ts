import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

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
            { method: { contains: search, mode: 'insensitive' } },
          ]
        } : {},
        status ? { status } : {},
      ]
    };

    const [designs, total] = await Promise.all([
      prisma.designAsset.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              client: true,
              brand: true
            }
          },
          versions: {
            orderBy: { version_number: 'desc' },
            take: 1
          },
          approvals: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.designAsset.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        designs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

const CreateDesignSchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  name: z.string().min(1, 'Design name is required'),
  method: z.enum(['SILKSCREEN', 'SUBLIMATION', 'DTF', 'EMBROIDERY']),
  files: z.object({
    mockup_url: z.string().optional(),
    prod_url: z.string().optional(),
    separations: z.array(z.string()).optional(),
    dst_url: z.string().optional()
  }),
  placements: z.array(z.object({
    area: z.string(),
    width_cm: z.number(),
    height_cm: z.number(),
    offset_x: z.number(),
    offset_y: z.number()
  })),
  palette: z.array(z.string()).optional(),
  meta: z.object({
    dpi: z.number(),
    notes: z.string().optional(),
    color_count: z.number()
  }),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']).default('PENDING_APPROVAL')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateDesignSchema.parse(body);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: validatedData.order_id },
      include: { client: true, brand: true }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Generate asset ID
    const asset_id = `DA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create design asset
    const design = await prisma.designAsset.create({
      data: {
        asset_id,
        order_id: validatedData.order_id,
        name: validatedData.name,
        method: validatedData.method,
        mockup_url: validatedData.files.mockup_url || '',
        prod_url: validatedData.files.prod_url || '',
        separations: validatedData.files.separations ? JSON.stringify(validatedData.files.separations) : '',
        dst_url: validatedData.files.dst_url || '',
        placements: JSON.stringify(validatedData.placements),
        palette: validatedData.palette ? JSON.stringify(validatedData.palette) : '',
        meta: JSON.stringify(validatedData.meta),
        status: validatedData.status,
        current_version: 1,
      },
      include: {
        order: {
          include: {
            client: true,
            brand: true
          }
        }
      }
    });

    // Create initial version
    await prisma.designVersion.create({
      data: {
        asset_id: design.asset_id,
        version_number: 1,
        changes: 'Initial design creation',
        mockup_url: validatedData.files.mockup_url || '',
        prod_url: validatedData.files.prod_url || '',
        separations: validatedData.files.separations ? JSON.stringify(validatedData.files.separations) : '',
        dst_url: validatedData.files.dst_url || '',
        meta: JSON.stringify(validatedData.meta),
        is_current: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: design,
      asset_id: design.asset_id,
      message: 'Design created successfully'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating design:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create design' },
      { status: 500 }
    );
  }
}