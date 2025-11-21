import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse } from '@/lib/error-sanitization';

const prisma = db;

// PUT /api/bundles/[id]/status - Update bundle status
export const PUT = requireAuth(async (
  req: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const bundleId = context?.params?.id;
    if (!bundleId) {
      return NextResponse.json(
        { success: false, error: "Bundle ID is required" },
        { status: 400 }
      );
    }

    const workspaceId = user.workspaceId;
    const _userId = user.id;
    const body = await req.json();
    const { status, ___notes, ___location } = body;

    if (!status) {

      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Verify bundle exists
    const bundle = await prisma.bundle.findFirst({
      where: {
        id: bundleId,
        workspace_id: workspaceId,
      },
      });

    if (!bundle) {

      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Update bundle status
    const updatedBundle = await prisma.bundle.update({
      where: { id: bundleId },
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
    // TODO: BundleStatusHistory model doesn't exist in schema
    // Uncomment when model is added to schema:
    // try {
    //   await prisma.bundleStatusHistory.create({
    //     data: {
    //       workspace_id: workspaceId,
    //       bundle_id: context.params.id,
    //       old_status: bundle.status,
    //       new_status: status,
    //       changed_by: userId,
    //       notes,
    //       location,
    //       changed_at: new Date(),
    //     },
    //   });
    // } catch (err) {
    //   console.log("Bundle status history logging skipped");
    // }

    return NextResponse.json({
      success: true,
      bundle: updatedBundle,
      message: `Bundle status updated to ${status}`,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: req.url,
    });
  }
});