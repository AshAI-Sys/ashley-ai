import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateSewingRunSchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  bundle_id: z.string().min(1, 'Bundle ID is required'),
  routing_step_id: z.string().min(1, 'Routing step ID is required'),
  operation_name: z.string().min(1, 'Operation name is required'),
  sewing_type: z.string().optional(),
  operator_id: z.string().min(1, 'Operator ID is required'),
});

const UpdateSewingRunSchema = z.object({
  status: z.enum(['CREATED', 'IN_PROGRESS', 'DONE']).optional(),
  qty_good: z.number().int().min(0).optional(),
  qty_reject: z.number().int().min(0).optional(),
  started_at: z.string().transform((str) => new Date(str)).optional(),
  ended_at: z.string().transform((str) => new Date(str)).optional(),
  reject_reason: z.string().optional(),
  reject_photo_url: z.string().optional(),
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
                }
              }
            }
          },
          bundle: {
            select: {
              id: true,
              qr_code: true,
              size_code: true,
              qty: true,
            }
          },
          operator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              employee_number: true,
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
      status: run.status,
      order: run.order ? {
        order_number: run.order.order_number,
        brand: { name: run.order.client?.name || '', code: '' }
      } : null,
      operator: run.operator ? {
        first_name: run.operator.first_name,
        last_name: run.operator.last_name,
        employee_number: run.operator.employee_number || ''
      } : null,
      bundle: run.bundle ? {
        id: run.bundle.id,
        size_code: run.bundle.size_code,
        qty: run.bundle.qty,
        qr_code: run.bundle.qr_code
      } : null,
      qty_good: run.qty_good || 0,
      qty_reject: run.qty_reject || 0,
      earned_minutes: run.earned_minutes || 0,
      actual_minutes: run.actual_minutes || undefined,
      efficiency_pct: run.efficiency_pct ? Math.round(run.efficiency_pct) : undefined,
      piece_rate_pay: run.piece_rate_pay || 0,
      started_at: run.started_at?.toISOString(),
      ended_at: run.ended_at?.toISOString(),
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

    // Check if bundle exists
    const bundle = await prisma.bundle.findUnique({
      where: { id: validatedData.bundle_id }
    });

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Check if routing step exists
    const routingStep = await prisma.routingStep.findUnique({
      where: { id: validatedData.routing_step_id }
    });

    if (!routingStep) {
      return NextResponse.json(
        { success: false, error: 'Routing step not found' },
        { status: 404 }
      );
    }

    const sewingRun = await prisma.sewingRun.create({
      data: {
        ...validatedData,
        status: 'CREATED',
      },
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            client: {
              select: {
                name: true,
              }
            }
          }
        },
        bundle: {
          select: {
            id: true,
            qr_code: true,
          }
        },
        operator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            employee_number: true,
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

    // Calculate efficiency and metrics if times are provided
    let updateData: any = { ...validatedData };

    if (validatedData.started_at && validatedData.ended_at) {
      const actualMinutes = (validatedData.ended_at.getTime() - validatedData.started_at.getTime()) / (1000 * 60);
      updateData.actual_minutes = actualMinutes;

      // Calculate efficiency if qty_good is provided
      if (validatedData.qty_good) {
        // Simplified efficiency calculation - would normally use SMV from routing step
        const earnedMinutes = validatedData.qty_good * 0.5; // placeholder SMV
        updateData.earned_minutes = earnedMinutes;
        updateData.efficiency_pct = actualMinutes > 0 ? (earnedMinutes / actualMinutes) * 100 : 0;
      }
    }

    const sewingRun = await prisma.sewingRun.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            client: {
              select: {
                name: true,
              }
            }
          }
        },
        bundle: {
          select: {
            id: true,
            qr_code: true,
          }
        },
        operator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            employee_number: true,
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
    if (existingSewingRun.status === 'DONE') {
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