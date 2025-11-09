/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { getWorkspaceIdFromRequest } from "@/lib/workspace";

export const dynamic = 'force-dynamic';


// GET - Fetch all shipments for workspace
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspaceId = user.workspaceId;
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const orderId = searchParams.get("order_id");

    // Build where clause
    const where: any = {
      workspace_id: workspaceId ?? undefined,
    };

    if (status) where.status = status;
    if (method) where.method = method;
    if (orderId) where.order_id = orderId;

    // Fetch shipments with pagination
    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              client: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          cartons: {
            include: {
              carton: {
                select: {
                  id: true,
                  carton_no: true,
                  actual_weight_kg: true,
                },
              },
            },
          },
          deliveries: {
            select: {
              delivery_id: true,
              shipment_id: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.shipment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch shipments" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});

// POST - Create a new shipment
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspaceId = user.workspaceId;
    const body = await request.json();

    const {
      order_id,
      consignee_name,
      consignee_address,
      contact_phone,
      method,
      carrier_ref,
      cod_amount,
      carton_ids,
      eta,
    } = body;

    // Validate required fields
    if (!order_id || !consignee_name || !consignee_address || !method) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: order_id, consignee_name, consignee_address, method",
        },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to workspace
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        workspace_id: workspaceId ?? undefined,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify cartons exist if provided
    if (carton_ids && carton_ids.length > 0) {
      const cartonCount = await prisma.carton.count({
        where: {
          id: { in: carton_ids },
          workspace_id: workspaceId ?? undefined,
        },
      });

      if (cartonCount !== carton_ids.length) {
        return NextResponse.json(
          { success: false, message: "One or more cartons not found" },
          { status: 404 }
        );
      }
    }

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        workspace_id: workspaceId!,
        order_id,
        consignee_name,
        consignee_address,
        contact_phone: contact_phone || null,
        method,
        carrier_ref: carrier_ref || null,
        cod_amount: cod_amount ? parseFloat(cod_amount) : null,
        eta: eta ? new Date(eta) : null,
        status: "READY_FOR_PICKUP",
        // Link cartons if provided
        cartons: carton_ids && carton_ids.length > 0 ? {
          create: carton_ids.map((carton_id: string) => ({
            carton_id,
          })),
        } : undefined,
      },
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        cartons: {
          include: {
            carton: {
              select: {
                id: true,
                carton_no: true,
                actual_weight_kg: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspace_id: workspaceId!,
        user_id: user.id,
        action: "SHIPMENT_CREATED",
        resource: "shipment",
        resource_id: shipment.id,
        new_values: JSON.stringify({
          order_id,
          consignee_name,
          method,
          carton_count: carton_ids?.length || 0,
          status: "READY_FOR_PICKUP",
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shipment created successfully",
      data: shipment,
    });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create shipment" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});
