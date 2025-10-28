import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Fetch all purchase orders
export async function GET(request: NextRequest) {
  try {
    const workspace_id = request.headers.get("x-workspace-id") || "default-workspace";
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const supplier_id = searchParams.get("supplier_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = { workspace_id };

    if (search) {
      where.OR = [
        { po_number: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (supplier_id) {
      where.supplier_id = supplier_id;
    }

    // Fetch purchase orders
    const [orders, totalCount] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        orderBy: { order_date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              supplier_code: true,
            },
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
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      purchase_orders: orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("[API] Error fetching purchase orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch purchase orders" },
      { status: 500 }
    );
  }
}

// POST - Create new purchase order
export async function POST(request: NextRequest) {
  try {
    const workspace_id = request.headers.get("x-workspace-id") || "default-workspace";
    const user_id = request.headers.get("x-user-id") || "system";
    const body = await request.json();

    const {
      po_number,
      supplier_id,
      order_date,
      expected_delivery,
      payment_terms,
      notes,
      items,
      currency,
    } = body;

    // Validation
    if (!po_number || !supplier_id || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: po_number, supplier_id, items",
        },
        { status: 400 }
      );
    }

    // Check if PO number already exists
    const existing = await prisma.purchaseOrder.findFirst({
      where: {
        workspace_id,
        po_number,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Purchase Order "${po_number}" already exists`,
        },
        { status: 409 }
      );
    }

    // Validate supplier exists
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: supplier_id,
        workspace_id,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    let tax_amount = 0;

    const itemsData = items.map((item: any) => {
      const item_subtotal = item.quantity * item.unit_price;
      const discount = item_subtotal * (item.discount_percent || 0) / 100;
      const taxable = item_subtotal - discount;
      const item_tax = taxable * (item.tax_rate || 0) / 100;
      const total = taxable + item_tax;

      subtotal += item_subtotal;
      tax_amount += item_tax;

      return {
        material_name: item.material_name,
        material_type: item.material_type || "OTHER",
        description: item.description || null,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        discount_percent: item.discount_percent || 0,
        total_price: total,
      };
    });

    const shipping_cost = body.shipping_cost || 0;
    const total_amount = subtotal + tax_amount + shipping_cost;

    // Create purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        workspace_id,
        po_number,
        supplier_id,
        order_date: order_date ? new Date(order_date) : new Date(),
        expected_delivery: expected_delivery ? new Date(expected_delivery) : null,
        status: "DRAFT",
        subtotal,
        tax_amount,
        shipping_cost,
        total_amount,
        currency: currency || supplier.currency || "PHP",
        payment_terms: payment_terms || supplier.payment_terms || null,
        notes: notes || null,
        created_by: user_id,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        supplier: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Purchase order created successfully",
      purchase_order: purchaseOrder,
    });
  } catch (error) {
    console.error("[API] Error creating purchase order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}
