import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateSewingRunSchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  bundle_id: z.string().optional(),
  operation_name: z.string().min(1, 'Operation name is required'),
  machine_id: z.string().optional(),
  operator_id: z.string().min(1, 'Operator ID is required'),
  planned_quantity: z.number().int().positive('Planned quantity must be positive'),
  target_efficiency: z.number().min(0).max(200).default(85),
  piece_rate: z.number().positive('Piece rate must be positive'),
  standard_time: z.number().positive('Standard time must be positive'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  scheduled_start: z.string().transform((str) => new Date(str)),
  scheduled_end: z.string().transform((str) => new Date(str)),
  instructions: z.string().optional(),
  quality_requirements: z.record(z.any()).optional(),
});

const UpdateSewingRunSchema = CreateSewingRunSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  actual_quantity: z.number().int().min(0).optional(),
  actual_efficiency: z.number().min(0).max(200).optional(),
  start_time: z.string().transform((str) => new Date(str)).optional(),
  end_time: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const operator_id = searchParams.get('operator_id') || '';
    const order_id = searchParams.get('order_id') || '';
    const priority = searchParams.get('priority') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { operation_name: { contains: search, mode: 'insensitive' } },
            { instructions: { contains: search, mode: 'insensitive' } },
            { order: { order_number: { contains: search, mode: 'insensitive' } } },
          ]
        } : {},
        status ? { status } : {},
        operator_id ? { operator_id } : {},
        order_id ? { order_id } : {},
        priority ? { priority } : {},
      ]
    };

    const [sewingRuns, total] = await Promise.all([
      prisma.sewingRun.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              client: {
                select: {
                  name: true,
                  company: true,
                }
              }
            }
          },
          bundle: {
            select: {
              id: true,
              bundle_number: true,
              qr_code: true,
            }
          },
          machine: {
            select: {
              id: true,
              name: true,
              status: true,
            }
          },
          operator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              employee_id: true,
            }
          },
          sewing_operations: {
            select: {
              id: true,
              operation_type: true,
              completed_quantity: true,
              status: true,
            }
          },
          _count: {
            select: {
              sewing_operations: true,
            }
          }
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.sewingRun.count({ where }),
    ]);

    // Transform data to match frontend expectations
    const transformedRuns = sewingRuns.map(run => ({
      id: run.id,
      operation_name: run.operation_name,
      status: run.status === 'PENDING' ? 'CREATED' : run.status,
      order: run.order ? {
        order_number: run.order.order_number,
        brand: { name: run.order.client?.name || '', code: run.order.client?.company || '' }
      } : null,
      operator: run.operator ? {
        first_name: run.operator.first_name,
        last_name: run.operator.last_name,
        employee_number: run.operator.employee_id || ''
      } : null,
      bundle: run.bundle ? {
        id: run.bundle.id,
        size_code: run.bundle.bundle_number.split('-')[1] || 'M',
        qty: run.planned_quantity,
        qr_code: run.bundle.qr_code
      } : null,
      qty_good: run.actual_quantity || 0,
      qty_reject: 0,
      earned_minutes: run.standard_time * (run.actual_quantity || 0),
      actual_minutes: run.start_time && run.end_time
        ? (run.end_time.getTime() - run.start_time.getTime()) / (1000 * 60)
        : undefined,
      efficiency_pct: run.actual_efficiency ? Math.round(run.actual_efficiency) : undefined,
      piece_rate_pay: run.piece_rate * (run.actual_quantity || 0),
      started_at: run.start_time?.toISOString(),
      ended_at: run.end_time?.toISOString(),
      created_at: run.created_at.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: transformedRuns
    });
  } catch (error) {
    console.error('Error fetching sewing runs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sewing runs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateSewingRunSchema.parse(body);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: validatedData.order_id }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if operator exists
    const operator = await prisma.employee.findUnique({
      where: { id: validatedData.operator_id }
    });

    if (!operator) {
      return NextResponse.json(
        { success: false, error: 'Operator not found' },
        { status: 404 }
      );
    }

    // Check if machine exists (if provided)
    if (validatedData.machine_id) {
      const machine = await prisma.machine.findUnique({
        where: { id: validatedData.machine_id }
      });

      if (!machine) {
        return NextResponse.json(
          { success: false, error: 'Machine not found' },
          { status: 404 }
        );
      }
    }

    // Check if bundle exists (if provided)
    if (validatedData.bundle_id) {
      const bundle = await prisma.bundle.findUnique({
        where: { id: validatedData.bundle_id }
      });

      if (!bundle) {
        return NextResponse.json(
          { success: false, error: 'Bundle not found' },
          { status: 404 }
        );
      }
    }

    const sewingRun = await prisma.sewingRun.create({
      data: {
        ...validatedData,
        status: 'PENDING',
      },
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            client: {
              select: {
                name: true,
                company: true,
              }
            }
          }
        },
        bundle: {
          select: {
            id: true,
            bundle_number: true,
            qr_code: true,
          }
        },
        machine: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        operator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            employee_id: true,
          }
        },
      }
    });

    return NextResponse.json({
      success: true,
      data: sewingRun,
      message: 'Sewing run created successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating sewing run:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sewing run' },
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
        { success: false, error: 'Sewing run ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateSewingRunSchema.parse(body);

    // Check if sewing run exists
    const existingSewingRun = await prisma.sewingRun.findUnique({
      where: { id }
    });

    if (!existingSewingRun) {
      return NextResponse.json(
        { success: false, error: 'Sewing run not found' },
        { status: 404 }
      );
    }

    // Calculate actual efficiency if actual_quantity and times are provided
    let calculatedEfficiency = validatedData.actual_efficiency;
    if (validatedData.actual_quantity && validatedData.start_time && validatedData.end_time) {
      const totalTimeMinutes = (validatedData.end_time.getTime() - validatedData.start_time.getTime()) / (1000 * 60);
      const standardTimeTotal = existingSewingRun.standard_time * validatedData.actual_quantity;
      calculatedEfficiency = (standardTimeTotal / totalTimeMinutes) * 100;
    }

    const sewingRun = await prisma.sewingRun.update({
      where: { id },
      data: {
        ...validatedData,
        actual_efficiency: calculatedEfficiency,
      },
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            client: {
              select: {
                name: true,
                company: true,
              }
            }
          }
        },
        bundle: {
          select: {
            id: true,
            bundle_number: true,
            qr_code: true,
          }
        },
        machine: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        operator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            employee_id: true,
          }
        },
      }
    });

    return NextResponse.json({
      success: true,
      data: sewingRun,
      message: 'Sewing run updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating sewing run:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sewing run' },
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
        { success: false, error: 'Sewing run ID is required' },
        { status: 400 }
      );
    }

    // Check if sewing run exists
    const existingSewingRun = await prisma.sewingRun.findUnique({
      where: { id }
    });

    if (!existingSewingRun) {
      return NextResponse.json(
        { success: false, error: 'Sewing run not found' },
        { status: 404 }
      );
    }

    // Check if sewing run is completed (prevent deletion)
    if (existingSewingRun.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete completed sewing run' },
        { status: 400 }
      );
    }

    await prisma.sewingRun.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Sewing run deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sewing run:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sewing run' },
      { status: 500 }
    );
  }
}