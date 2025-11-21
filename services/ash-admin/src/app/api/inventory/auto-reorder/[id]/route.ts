import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse, notFoundError } from "@/lib/error-sanitization";
import { getRouteParam, type RouteContext } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/auto-reorder/[id]
 * Get single auto-reorder setting for authenticated user's workspace
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

    const setting = await prisma.autoReorderSetting.findFirst({
      where: {
        id,
        workspace_id,
      },
    });

    if (!setting) {
      return notFoundError("Auto-reorder setting");
    }

    // Get related material inventory details
    const materialInventory = await prisma.materialInventory.findUnique({
      where: { id: setting.material_inventory_id },
    });

    // Get preferred supplier details if exists
    let preferredSupplier = null;
    if (setting.preferred_supplier_id) {
      preferredSupplier = await prisma.supplier.findFirst({
        where: {
          id: setting.preferred_supplier_id,
          workspace_id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      setting: {
        ...setting,
        material_inventory: materialInventory,
        preferred_supplier: preferredSupplier,
      },
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

/**
 * PUT /api/inventory/auto-reorder/[id]
 * Update auto-reorder setting in authenticated user's workspace
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

    const {
      enabled,
      reorder_point,
      reorder_quantity,
      preferred_supplier_id,
      lead_time_days,
      safety_stock_days,
      notes,
    } = body;

    // Check if setting exists
    const existing = await prisma.autoReorderSetting.findFirst({
      where: { id, workspace_id },
    });

    if (!existing) {
      return notFoundError("Auto-reorder setting");
    }

    // Verify preferred_supplier if provided
    if (preferred_supplier_id) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          id: preferred_supplier_id,
          workspace_id,
        },
      });

      if (!supplier) {
        return NextResponse.json(
          { success: false, error: "Preferred supplier not found" },
          { status: 404 }
        );
      }
    }

    // Update auto-reorder setting
    const setting = await prisma.autoReorderSetting.update({
      where: { id },
      data: {
        enabled: enabled !== undefined ? enabled : existing.enabled,
        reorder_point: reorder_point || existing.reorder_point,
        reorder_quantity: reorder_quantity || existing.reorder_quantity,
        preferred_supplier_id: preferred_supplier_id !== undefined
          ? preferred_supplier_id
          : existing.preferred_supplier_id,
        lead_time_days: lead_time_days !== undefined
          ? lead_time_days
          : existing.lead_time_days,
        safety_stock_days: safety_stock_days !== undefined
          ? safety_stock_days
          : existing.safety_stock_days,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Auto-reorder setting updated successfully",
      setting,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

/**
 * DELETE /api/inventory/auto-reorder/[id]
 * Delete auto-reorder setting from authenticated user's workspace
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

    // Check if setting exists
    const existing = await prisma.autoReorderSetting.findFirst({
      where: { id, workspace_id },
    });

    if (!existing) {
      return notFoundError("Auto-reorder setting");
    }

    // Delete auto-reorder setting
    await prisma.autoReorderSetting.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Auto-reorder setting deleted successfully",
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});
