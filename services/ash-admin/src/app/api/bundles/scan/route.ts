import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ash-ai/database';

const prisma = db;

// GET /api/bundles/scan?code=BUNDLE-XXX - Scan bundle QR code
export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'default-workspace';
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'QR code is required' },
        { status: 400 }
      );
    }

    // Look up bundle by QR code or bundle number
    const bundle = await prisma.bundle.findFirst({
      where: {
        workspace_id: workspaceId,
        OR: [
          { qr_code: code },
          { bundle_number: code },
        ],
      },
      include: {
        order: {
          select: {
            order_number: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
        line_item: {
          select: {
            description: true,
            sku: true,
          },
        },
      },
    });

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Log scan event
    await prisma.bundleScanLog.create({
      data: {
        workspace_id: workspaceId,
        bundle_id: bundle.id,
        scan_type: 'MOBILE_SCANNER',
        scanned_at: new Date(),
        location: 'Production Floor',
      },
    }).catch(() => {
      // Ignore if BundleScanLog table doesn't exist yet
      console.log('Bundle scan logging skipped - table may not exist');
    });

    return NextResponse.json({
      success: true,
      bundle: {
        id: bundle.id,
        bundle_number: bundle.bundle_number,
        qr_code: bundle.qr_code,
        quantity: bundle.quantity,
        status: bundle.status,
        order: bundle.order,
        line_item: bundle.line_item,
        created_at: bundle.created_at,
      },
    });
  } catch (error: any) {
    console.error('Bundle scan error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
