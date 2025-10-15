import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateSewingRunSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  bundleId: z.string().optional(),
  operationName: z.string().min(1, 'Operation name is required'),
  machineId: z.string().optional(),
  operatorId: z.string().min(1, 'Operator ID is required'),
  plannedQuantity: z.number().int().positive('Planned quantity must be positive'),
  targetEfficiency: z.number().min(0).max(200).default(85),
  pieceRate: z.number().positive('Piece rate must be positive'),
  standardTime: z.number().positive('Standard time must be positive'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  scheduledStart: z.string().transform((str) => new Date(str)),
  scheduledEnd: z.string().transform((str) => new Date(str)),
  instructions: z.string().optional(),
  qualityRequirements: z.record(z.any()).optional(),
});

const UpdateSewingRunSchema = CreateSewingRunSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  actualQuantity: z.number().int().min(0).optional(),
  actualEfficiency: z.number().min(0).max(200).optional(),
  startTime: z.string().transform((str) => new Date(str)).optional(),
  endTime: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const operatorId = searchParams.get('operatorId') || '';
    const orderId = searchParams.get('orderId') || '';
    const priority = searchParams.get('priority') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { operationName: { contains: search, mode: 'insensitive' } },
            { instructions: { contains: search, mode: 'insensitive' } },
            { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
          ]
        } : {},
        status ? { status } : {},
        operatorId ? { operatorId } : {},
        orderId ? { orderId } : {},
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
              orderNumber: true,
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
              bundleNumber: true,
              qrCode: true,
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
              firstName: true,
              lastName: true,
              employeeId: true,
            }
          },
          sewingOperations: {
            select: {
              id: true,
              operationType: true,
              completedQuantity: true,
              status: true,
            }
          },
          _count: {
            select: {
              sewingOperations: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sewingRun.count({ where }),
    ]);

    // Transform data to match frontend expectations
    const transformedRuns = sewingRuns.map(run => ({
      id: run.id,
      operation_name: run.operationName,
      status: run.status === 'PENDING' ? 'CREATED' : run.status,
      order: run.order ? {
        order_number: run.order.orderNumber,
        brand: { name: run.order.client?.name || '', code: run.order.client?.company || '' }
      } : null,
      operator: run.operator ? {
        first_name: run.operator.firstName,
        last_name: run.operator.lastName,
        employee_number: run.operator.employeeId || ''
      } : null,
      bundle: run.bundle ? {
        id: run.bundle.id,
        size_code: run.bundle.bundleNumber.split('-')[1] || 'M',
        qty: run.plannedQuantity,
        qr_code: run.bundle.qrCode
      } : null,
      qty_good: run.actualQuantity || 0,
      qty_reject: 0,
      earned_minutes: run.standardTime * (run.actualQuantity || 0),
      actual_minutes: run.startTime && run.endTime
        ? (run.endTime.getTime() - run.startTime.getTime()) / (1000 * 60)
        : undefined,
      efficiency_pct: run.actualEfficiency ? Math.round(run.actualEfficiency) : undefined,
      piece_rate_pay: run.pieceRate * (run.actualQuantity || 0),
      started_at: run.startTime?.toISOString(),
      ended_at: run.endTime?.toISOString(),
      created_at: run.createdAt.toISOString()
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
      where: { id: validatedData.orderId }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if operator exists
    const operator = await prisma.employee.findUnique({
      where: { id: validatedData.operatorId }
    });

    if (!operator) {
      return NextResponse.json(
        { success: false, error: 'Operator not found' },
        { status: 404 }
      );
    }

    // Check if machine exists (if provided)
    if (validatedData.machineId) {
      const machine = await prisma.machine.findUnique({
        where: { id: validatedData.machineId }
      });

      if (!machine) {
        return NextResponse.json(
          { success: false, error: 'Machine not found' },
          { status: 404 }
        );
      }
    }

    // Check if bundle exists (if provided)
    if (validatedData.bundleId) {
      const bundle = await prisma.bundle.findUnique({
        where: { id: validatedData.bundleId }
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
            orderNumber: true,
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
            bundleNumber: true,
            qrCode: true,
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
            firstName: true,
            lastName: true,
            employeeId: true,
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

    // Calculate actual efficiency if actualQuantity and times are provided
    let calculatedEfficiency = validatedData.actualEfficiency;
    if (validatedData.actualQuantity && validatedData.startTime && validatedData.endTime) {
      const totalTimeMinutes = (validatedData.endTime.getTime() - validatedData.startTime.getTime()) / (1000 * 60);
      const standardTimeTotal = existingSewingRun.standardTime * validatedData.actualQuantity;
      calculatedEfficiency = (standardTimeTotal / totalTimeMinutes) * 100;
    }

    const sewingRun = await prisma.sewingRun.update({
      where: { id },
      data: {
        ...validatedData,
        actualEfficiency: calculatedEfficiency,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
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
            bundleNumber: true,
            qrCode: true,
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
            firstName: true,
            lastName: true,
            employeeId: true,
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