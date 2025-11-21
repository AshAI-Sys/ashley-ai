import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse, notFoundError } from "@/lib/error-sanitization";
import { getRouteParam, type RouteContext } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/suppliers/[id]
 * Get single supplier for authenticated user's workspace
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const GET = requireAuth(async (
  request: NextRequest,
  user,
  context?: RouteContext
) => {
  try {
    const workspaceId = user.workspaceId;
    const id = getRouteParam(context, 'id');

    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
      },
      include: {
        purchase_orders: {
          orderBy: { order_date: "desc" },
          take: 10,
        },
        _count: {
          select: { purchase_orders: true },
        },
      },
    });

    if (!supplier) {
      return notFoundError("Supplier");
    }

    return NextResponse.json({
      success: true,
      supplier,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

/**
 * PUT /api/inventory/suppliers/[id]
 * Update supplier in authenticated user's workspace
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const PUT = requireAuth(async (
  request: NextRequest,
  user,
  context?: RouteContext
) => {
  try {
    const workspaceId = user.workspaceId;
    const id = getRouteParam(context, 'id');
    const body = await request.json();

    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      country,
      payment_terms,
      currency,
      tax_id,
      rating,
      is_active,
      notes,
    } = body;

    // Check if supplier exists
    const existing = await prisma.supplier.findFirst({
      where: { id, workspace_id: workspaceId },
    });

    if (!existing) {
      return notFoundError("Supplier");
    }

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name || existing.name,
        contact_person: contact_person !== undefined ? contact_person : existing.contact_person,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        address: address !== undefined ? address : existing.address,
        city: city !== undefined ? city : existing.city,
        country: country !== undefined ? country : existing.country,
        payment_terms: payment_terms !== undefined ? payment_terms : existing.payment_terms,
        currency: currency !== undefined ? currency : existing.currency,
        tax_id: tax_id !== undefined ? tax_id : existing.tax_id,
        rating: rating !== undefined ? rating : existing.rating,
        is_active: is_active !== undefined ? is_active : existing.is_active,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

/**
 * DELETE /api/inventory/suppliers/[id]
 * Delete supplier from authenticated user's workspace
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const DELETE = requireAuth(async (
  request: NextRequest,
  user,
  context?: RouteContext
) => {
  try {
    const workspaceId = user.workspaceId;
    const id = getRouteParam(context, 'id');

    // Check if supplier exists
    const existing = await prisma.supplier.findFirst({
      where: { id, workspace_id: workspaceId },
      include: {
        _count: {
          select: { purchase_orders: true },
        },
      },
    });

    if (!existing) {
      return notFoundError("Supplier");
    }

    // Check if supplier has purchase orders
    if (existing._count.purchase_orders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete supplier with ${existing._count.purchase_orders} purchase orders. Deactivate instead.`,
        },
        { status: 400 }
      );
    }

    // Delete supplier
    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});
