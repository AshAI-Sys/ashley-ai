/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  cachedQueryWithMetrics,
  CacheKeys,
  CACHE_DURATION,
  InvalidateCache,
} from "@/lib/performance/query-cache";
import { requireAuth } from "@/lib/auth-middleware";

const OrderLineItemSchema = z.object({
  productType: z.string().min(1, "Product type is required"),
  description: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().positive("Unit price must be positive"),
  totalPrice: z.number().positive("Total price must be positive"),
  sizeCurve: z.record(z.number()).optional(),
  specifications: z.record(z.any()).optional(),
});

const CreateOrderSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  brandId: z.string().optional(),
  orderNumber: z.string().optional(),
  status: z
    .enum([
      "DRAFT",
      "PENDING_APPROVAL",
      "APPROVED",
      "IN_PRODUCTION",
      "COMPLETED",
      "CANCELLED",
    ])
    .default("DRAFT"),
  totalAmount: z.number().positive("Total amount must be positive"),
  currency: z.string().default("PHP"),
  deliveryDate: z
    .string()
    .optional()
    .transform(str => (str ? new Date(str) : undefined)),
  notes: z.string().optional(),
  lineItems: z.array(OrderLineItemSchema).optional(),

  // New Order Details fields
  po_number: z.string().optional(),
  order_type: z.string().optional(),
  design_name: z.string().optional(),
  fabric_type: z.string().optional(),
  size_distribution: z.string().optional(),
  mockup_url: z.string().optional(),
});

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspaceId = user.workspaceId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const clientId = searchParams.get("clientId") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      workspace_id: workspaceId,
    };

    if (search) {
      where.OR = [{ order_number: { contains: search, mode: "insensitive" } }];
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.client_id = clientId;
    }

    // Generate cache key
    const cacheKey = CacheKeys.ordersList(page, limit, {
      search,
      status,
      clientId,
      });

    // Use cached query
    const result = await cachedQueryWithMetrics(
      cacheKey,
      async () => {
        const [orders, total] = await Promise.all([
          prisma.order.findMany({
            where,
            skip,
            take: limit,
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              brand: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              line_items: true,
              _count: {
                select: {
                  line_items: true,
                  design_assets: true,
                  bundles: true,
                },
              },
            },
            orderBy: { created_at: "desc" },
          }),
          prisma.order.count({ where }),
        ]);

        return {
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      CACHE_DURATION.ORDERS // 5 minutes cache
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspaceId = user.workspaceId;
    const body = await request.json();
    const validatedData = CreateOrderSchema.parse(body);

    // Generate order number if not provided
    const orderNumber =
      validatedData.orderNumber ||
      `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create new order
    const newOrder = await prisma.order.create({
      data: {
        workspace_id: workspaceId,
        order_number: orderNumber,
        client_id: validatedData.clientId,
        brand_id: validatedData.brandId || null,
        status: validatedData.status.toLowerCase(),
        total_amount: validatedData.totalAmount,
        currency: validatedData.currency,
        delivery_date: validatedData.deliveryDate || null,
        notes: validatedData.notes || null,
        // New Order Details fields
        po_number: validatedData.po_number || null,
        order_type: validatedData.order_type || "NEW",
        design_name: validatedData.design_name || null,
        fabric_type: validatedData.fabric_type || null,
        size_distribution: validatedData.size_distribution || null,
        mockup_url: validatedData.mockup_url || null,
      },
      include: {
        client: true,
        brand: true,
        _count: {
          select: {
            line_items: true,
          },
        },
      },
      });

    // Invalidate orders cache (non-blocking)
    try {
      await InvalidateCache.orders();
    } catch (cacheError) {
      console.warn("Failed to invalidate cache:", cacheError);
      // Don't fail the request if cache invalidation fails
    }

    return NextResponse.json(
      {
        success: true,
        data: { order: newOrder },
        message: "Order created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
});