import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/suppliers/[id]
 * Get single supplier for authenticated user's workspace
 * SECURITY: Requires authentication - workspace isolation enforced
 */
export const GET = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const workspace_id = user.workspaceId; // Use authenticated workspace ID
    const { id } = context!.params;

    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        workspace_id,
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
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error("[API] Error fetching supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch supplier" },
      { status: 500 }
    );
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
  context?: { params: { id: string } }
) => {
  try {
    const workspace_id = user.workspaceId; // Use authenticated workspace ID
    const { id } = context!.params;
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
      where: { id, workspace_id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
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
    console.error("[API] Error updating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update supplier" },
      { status: 500 }
    );
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
  context?: { params: { id: string } }
) => {
  try {
    const workspace_id = user.workspaceId; // Use authenticated workspace ID
    const { id } = context!.params;

    // Check if supplier exists
    const existing = await prisma.supplier.findFirst({
      where: { id, workspace_id },
      include: {
        _count: {
          select: { purchase_orders: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
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
    console.error("[API] Error deleting supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
});
