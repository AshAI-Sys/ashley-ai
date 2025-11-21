import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse } from '@/lib/error-sanitization';

export const dynamic = 'force-dynamic';


const prisma = db;

// GET /api/bundles/by-qr?qr_code=BUNDLE-XXX - Fetch bundle by QR code for sewing
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const workspaceId = user.workspaceId || "default-workspace";
    const url = new URL(req.url);
    const qr_code = url.searchParams.get("qr_code");

    if (!qr_code) {
      return NextResponse.json(
        { success: false, error: "QR code is required" },
        { status: 400 }
      );
    }

    // Look up bundle by QR code with full relations
    const bundle = await prisma.bundle.findFirst({
      where: {
        workspace_id: workspaceId,
        qr_code: qr_code,
      },
      include: {
        lay: {
          select: {
            id: true,
            marker_name: true,
          },
        },
        order: {
          select: {
            id: true,
            order_number: true,
            brand: {
              select: {
                name: true,
                code: true,
              },
            },
            line_items: {
              select: {
                description: true,
                garment_type: true,
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Get bundle progress from sewing runs
    const sewingRuns = await prisma.sewingRun.findMany({
      where: {
        bundle_id: bundle.id,
      },
      include: {
        operator: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const progress = sewingRuns.map((run: any) => ({
      operation_name: run.operation?.name || "Unknown Operation",
      status: run.status === "DONE" ? "COMPLETED" : "PENDING",
      completed_at: run.ended_at,
    }));

    // Log scan event
    console.log(`Bundle ${bundle.qr_code} scanned for sewing`);

    return NextResponse.json({
      success: true,
      bundle: {
        id: bundle.id,
        order_id: bundle.order_id,
        size_code: bundle.size_code,
        qty: bundle.qty,
        qr_code: bundle.qr_code,
        status: bundle.status,
        order: bundle.order,
        lay: bundle.lay,
        created_at: bundle.created_at,
      },
      progress,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: req.url,
    });
  }
});
