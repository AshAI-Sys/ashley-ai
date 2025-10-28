import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get single purchase order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspace_id = request.headers.get("x-workspace-id") || "default-workspace";
    const { id } = params;

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
      return NextResponse.json(
        { success: false, error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase_order: purchaseOrder,
    });
  } catch (error) {
    console.error("[API] Error fetching purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch purchase order" },
      { status: 500 }
    );
  }
}

// PUT - Update purchase order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspace_id = request.headers.get("x-workspace-id") || "default-workspace";
    const { id } = params;
    const body = await request.json();

    const { status, expected_delivery, notes, payment_status } = body;

    // Check if purchase order exists
    const existing = await prisma.purchaseOrder.findFirst({
      where: { id, workspace_id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Purchase order not found" },
        { status: 404 }
      );
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
    console.error("[API] Error updating purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update purchase order" },
      { status: 500 }
    );
  }
}

// DELETE - Delete purchase order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspace_id = request.headers.get("x-workspace-id") || "default-workspace";
    const { id } = params;

    // Check if purchase order exists
    const existing = await prisma.purchaseOrder.findFirst({
      where: { id, workspace_id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Purchase order not found" },
        { status: 404 }
      );
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
    console.error("[API] Error deleting purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete purchase order" },
      { status: 500 }
    );
  }
}
