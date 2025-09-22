import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateFabricIssueSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  fabricBatchId: z.string().min(1, 'Fabric batch ID is required'),
  qtyIssued: z.number().positive('Quantity issued must be positive'),
  notes: z.string().optional(),
});

const UpdateFabricIssueSchema = CreateFabricIssueSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const orderId = searchParams.get('orderId') || '';
    const fabricBatchId = searchParams.get('fabricBatchId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        orderId ? { orderId } : {},
        fabricBatchId ? { fabricBatchId } : {},
        startDate ? { createdAt: { gte: new Date(startDate) } } : {},
        endDate ? { createdAt: { lte: new Date(endDate) } } : {},
      ]
    };

    const [fabricIssues, total] = await Promise.all([
      prisma.fabricIssue.findMany({
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
              },
              brand: {
                select: {
                  name: true,
                }
              }
            }
          },
          fabricBatch: {
            select: {
              id: true,
              lotNo: true,
              fabricType: true,
              color: true,
              gsm: true,
              widthCm: true,
              uom: true,
              qtyOnHand: true,
            }
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fabricIssue.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        fabricIssues,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    console.error('Error fetching fabric issues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fabric issues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateFabricIssueSchema.parse(body);

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

    // Check if fabric batch exists and has sufficient quantity
    const fabricBatch = await prisma.fabricBatch.findUnique({
      where: { id: validatedData.fabricBatchId }
    });

    if (!fabricBatch) {
      return NextResponse.json(
        { success: false, error: 'Fabric batch not found' },
        { status: 404 }
      );
    }

    if (fabricBatch.qtyOnHand < validatedData.qtyIssued) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient fabric quantity. Available: ${fabricBatch.qtyOnHand} ${fabricBatch.uom}`
        },
        { status: 400 }
      );
    }

    // Create fabric issue and update batch quantity in a transaction
    const fabricIssue = await prisma.$transaction(async (tx) => {
      // Create the fabric issue
      const newFabricIssue = await tx.fabricIssue.create({
        data: validatedData,
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
              },
              brand: {
                select: {
                  name: true,
                }
              }
            }
          },
          fabricBatch: {
            select: {
              id: true,
              lotNo: true,
              fabricType: true,
              color: true,
              gsm: true,
              widthCm: true,
              uom: true,
              qtyOnHand: true,
            }
          }
        }
      });

      // Update fabric batch quantity
      await tx.fabricBatch.update({
        where: { id: validatedData.fabricBatchId },
        data: {
          qtyOnHand: {
            decrement: validatedData.qtyIssued
          }
        }
      });

      return newFabricIssue;
    });

    return NextResponse.json({
      success: true,
      data: fabricIssue,
      message: 'Fabric issued to cutting successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating fabric issue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to issue fabric to cutting' },
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
        { success: false, error: 'Fabric issue ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateFabricIssueSchema.parse(body);

    // Check if fabric issue exists
    const existingIssue = await prisma.fabricIssue.findUnique({
      where: { id }
    });

    if (!existingIssue) {
      return NextResponse.json(
        { success: false, error: 'Fabric issue not found' },
        { status: 404 }
      );
    }

    const fabricIssue = await prisma.fabricIssue.update({
      where: { id },
      data: validatedData,
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
            },
            brand: {
              select: {
                name: true,
              }
            }
          }
        },
        fabricBatch: {
          select: {
            id: true,
            lotNo: true,
            fabricType: true,
            color: true,
            gsm: true,
            widthCm: true,
            uom: true,
            qtyOnHand: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: fabricIssue,
      message: 'Fabric issue updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating fabric issue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update fabric issue' },
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
        { success: false, error: 'Fabric issue ID is required' },
        { status: 400 }
      );
    }

    // Check if fabric issue exists
    const existingIssue = await prisma.fabricIssue.findUnique({
      where: { id },
      include: {
        fabricBatch: true
      }
    });

    if (!existingIssue) {
      return NextResponse.json(
        { success: false, error: 'Fabric issue not found' },
        { status: 404 }
      );
    }

    // Delete fabric issue and restore batch quantity in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the fabric issue
      await tx.fabricIssue.delete({
        where: { id }
      });

      // Restore fabric batch quantity
      await tx.fabricBatch.update({
        where: { id: existingIssue.fabricBatchId },
        data: {
          qtyOnHand: {
            increment: existingIssue.qtyIssued
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Fabric issue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fabric issue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete fabric issue' },
      { status: 500 }
    );
  }
}