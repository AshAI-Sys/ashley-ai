import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientFromRequest } from '@/lib/client-portal-auth';

// Get single order details with 7-stage production progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch order with all related data
    const order = await db.order.findFirst({
      where: {
        id,
        workspace_id: session.workspace_id,
        client_id: session.client_id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        design_assets: {
          select: {
            id: true,
            file_url: true,
            file_type: true,
            approval_status: true,
            approval_token: true,
            created_at: true,
          },
        },
        color_variants: {
          select: {
            id: true,
            color_name: true,
            quantity: true,
            percentage: true,
          },
        },
        garment_addons: {
          select: {
            id: true,
            addon_type: true,
            addon_name: true,
            unit_price: true,
            quantity: true,
            total_price: true,
          },
        },
        order_files: {
          select: {
            id: true,
            file_type: true,
            file_url: true,
            file_name: true,
            uploaded_at: true,
          },
        },
        print_locations: {
          select: {
            id: true,
            location: true,
            width: true,
            height: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate 7-stage production progress
    const productionProgress = await calculate7StageProgress(order.id);

    // Fetch invoices for this order
    const invoices = await db.invoice.findMany({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        order_id: order.id,
      },
      select: {
        id: true,
        invoice_number: true,
        status: true,
        total_amount: true,
        paid_amount: true,
        due_date: true,
        created_at: true,
      },
    });

    // Fetch recent messages for this order
    const messages = await db.clientMessage.findMany({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        order_id: order.id,
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        production_progress: productionProgress,
      },
      invoices,
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

// Calculate 7-stage production progress
async function calculate7StageProgress(orderId: string) {
  const stages = [
    { name: 'Design & Approval', key: 'design', icon: 'Palette' },
    { name: 'Cutting', key: 'cutting', icon: 'Scissors' },
    { name: 'Printing', key: 'printing', icon: 'Printer' },
    { name: 'Sewing', key: 'sewing', icon: 'Shirt' },
    { name: 'Quality Control', key: 'qc', icon: 'CheckCircle2' },
    { name: 'Finishing & Packing', key: 'finishing', icon: 'Package' },
    { name: 'Delivery', key: 'delivery', icon: 'Truck' },
  ];

  // Fetch production data
  const [designAssets, cuttingRuns, printRuns, sewingRuns, qcChecks, finishingRuns, shipments] =
    await Promise.all([
      db.designAsset.count({ where: { order_id: orderId, approval_status: 'APPROVED' } }),
      db.cuttingRun.count({ where: { order_id: orderId, status: 'COMPLETED' } }),
      db.printRun.count({ where: { order_id: orderId, status: 'COMPLETED' } }),
      db.sewingRun.count({ where: { order_id: orderId, status: 'COMPLETED' } }),
      db.qualityControlCheck.count({ where: { order_id: orderId, status: 'PASS' } }),
      db.finishingRun.count({ where: { order_id: orderId, status: 'COMPLETED' } }),
      db.shipment.count({ where: { order_id: orderId, status: 'DELIVERED' } }),
    ]);

  // Calculate progress for each stage
  const progress = stages.map((stage, index) => {
    let status: 'pending' | 'in_progress' | 'completed' = 'pending';
    let percentage = 0;

    switch (stage.key) {
      case 'design':
        if (designAssets > 0) {
          status = 'completed';
          percentage = 100;
        }
        break;
      case 'cutting':
        if (cuttingRuns > 0) {
          status = 'completed';
          percentage = 100;
        } else if (designAssets > 0) {
          status = 'in_progress';
          percentage = 50;
        }
        break;
      case 'printing':
        if (printRuns > 0) {
          status = 'completed';
          percentage = 100;
        } else if (cuttingRuns > 0) {
          status = 'in_progress';
          percentage = 50;
        }
        break;
      case 'sewing':
        if (sewingRuns > 0) {
          status = 'completed';
          percentage = 100;
        } else if (printRuns > 0 || cuttingRuns > 0) {
          status = 'in_progress';
          percentage = 50;
        }
        break;
      case 'qc':
        if (qcChecks > 0) {
          status = 'completed';
          percentage = 100;
        } else if (sewingRuns > 0) {
          status = 'in_progress';
          percentage = 50;
        }
        break;
      case 'finishing':
        if (finishingRuns > 0) {
          status = 'completed';
          percentage = 100;
        } else if (qcChecks > 0) {
          status = 'in_progress';
          percentage = 50;
        }
        break;
      case 'delivery':
        if (shipments > 0) {
          status = 'completed';
          percentage = 100;
        } else if (finishingRuns > 0) {
          status = 'in_progress';
          percentage = 50;
        }
        break;
    }

    return {
      stage: stage.name,
      key: stage.key,
      icon: stage.icon,
      status,
      percentage,
      order: index + 1,
    };
  });

  // Calculate overall progress
  const overallPercentage = Math.round(
    progress.reduce((sum, stage) => sum + stage.percentage, 0) / stages.length
  );

  return {
    stages: progress,
    overall_percentage: overallPercentage,
    current_stage:
      progress.find((s) => s.status === 'in_progress')?.stage ||
      progress.filter((s) => s.status === 'completed').pop()?.stage ||
      'Design & Approval',
  };
}
