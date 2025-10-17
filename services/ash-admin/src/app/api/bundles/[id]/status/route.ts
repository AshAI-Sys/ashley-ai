import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

const prisma = db;

// PUT /api/bundles/[id]/status - Update bundle status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'default-workspace';
    const userId = req.headers.get('x-user-id') || 'mobile-scanner';
    const body = await req.json();
    const { status, notes, location } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Verify bundle exists
    const bundle = await prisma.bundle.findFirst({
      where: {
        id: params.id,
        workspace_id: workspaceId,
      },
    });

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Update bundle status
    const updatedBundle = await prisma.bundle.update({
      where: { id: params.id },
      data: {
        status,
        updated_at: new Date(),
      },
      include: {
        order: {
          select: {
            order_number: true,
          },
        },
      },
    });

    // Create status history log
    try {
      await prisma.bundleStatusHistory.create({
        data: {
          workspace_id: workspaceId,
          bundle_id: params.id,
          old_status: bundle.status,
          new_status: status,
          changed_by: userId,
          notes,
          location,
          changed_at: new Date(),
        },
      });
    } catch (err) {
      // Ignore if BundleStatusHistory table doesn't exist
      console.log('Bundle status history logging skipped');
    }

    return NextResponse.json({
      success: true,
      bundle: updatedBundle,
      message: `Bundle status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Bundle status update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
