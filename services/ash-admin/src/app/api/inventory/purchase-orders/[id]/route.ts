import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse, notFoundError } from "@/lib/error-sanitization";
import { getRouteParam, type RouteContext } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/purchase-orders/[id]
 * Get single purchase order for authenticated user's workspace
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const GET = requireAuth(async (
  request: NextRequest,
  user,
  context?: RouteContext
) => {
  try {
    const workspace_id = user.workspaceId;
    const id = getRouteParam(context, 'id');

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        workspace_id,
      },
      include: {
        supplier: true,
        items: {
          orderBy: { created_at: "asc" },
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        approved_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return notFoundError("Purchase order");
    }

    return NextResponse.json({
      success: true,
      purchase_order: purchaseOrder,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

/**
 * PUT /api/inventory/purchase-orders/[id]
 * Update purchase order in authenticated user's workspace
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const PUT = requireAuth(async (
  request: NextRequest,
  user,
  context?: RouteContext
) => {
  try {
    const workspace_id = user.workspaceId;
    const id = getRouteParam(context, 'id');
    const body = await request.json();

    const { status, expected_delivery, notes, payment_status } = body;

    // Check if purchase order exists
    const existing = await prisma.purchaseOrder.findFirst({
      where: { id, workspace_id },
    });

    if (!existing) {
      return notFoundError("Purchase order");
    }

    // Update purchase order
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: status || existing.status,
        expected_delivery: expected_delivery ? new Date(expected_delivery) : existing.expected_delivery,
        notes: notes !== undefined ? notes : existing.notes,
        payment_status: payment_status || existing.payment_status,
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Purchase order updated successfully",
      purchase_order: purchaseOrder,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

/**
 * DELETE /api/inventory/purchase-orders/[id]
 * Delete purchase order from authenticated user's workspace
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const DELETE = requireAuth(async (
  request: NextRequest,
  user,
  context?: RouteContext
) => {
  try {
    const workspace_id = user.workspaceId;
    const id = getRouteParam(context, 'id');

    // Check if purchase order exists
    const existing = await prisma.purchaseOrder.findFirst({
      where: { id, workspace_id },
    });

    if (!existing) {
      return notFoundError("Purchase order");
    }

    // Only allow deletion of DRAFT orders
    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: "Only DRAFT purchase orders can be deleted",
        },
        { status: 400 }
      );
    }

    // Delete purchase order (items cascade delete)
    await prisma.purchaseOrder.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Purchase order deleted successfully",
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});
