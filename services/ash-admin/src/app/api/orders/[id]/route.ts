/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { withAudit } from "@/lib/audit-middleware";
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response";
import { logError, ErrorCategory } from "@/lib/error-logger";

const prisma = db;

// GET /api/orders/[id] - Get single order
export const GET = requireAuth(async (
  _request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const orderId = context!.params.id;
    const workspaceId = user.workspaceId;
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        workspace_id: workspaceId,
      },
      include: {
        client: true,
        brand: true,
        line_items: true,
        design_assets: {
          orderBy: { created_at: "desc" },
          take: 5,
        },
        invoices: {
          select: {
            id: true,
            invoice_number: true,
            status: true,
            total_amount: true,
            due_date: true,
          },
        },
        _count: {
          select: {
            line_items: true,
            design_assets: true,
            invoices: true,
          },
        },
      },
    });

    if (!order) {
      
      return apiNotFound("Order");
    }

    return apiSuccess(order);
  } catch (error) {
    logError(error as Error, {
      category: ErrorCategory.API,
      orderId: context!.params.id,
      operation: "fetch_order"
    });
    return apiServerError(error);
  }
});

// PUT /api/orders/[id] - Update order
export const PUT = requireAuth(
  withAudit(
    async (request: NextRequest, user, context?: { params: { id: string } }) => {
      try {
        const orderId = context!.params.id;
        const ____workspaceId = user.workspaceId;
        const body = await request.json();

        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            order_number: body.order_number,
            client_id: body.client_id,
            brand_id: body.brand_id || null,
            status: body.status ? body.status.toLowerCase() : undefined,
            total_amount: body.total_amount
              ? parseFloat(body.total_amount)
              : undefined,
            currency: body.currency,
            delivery_date: body.delivery_date
              ? new Date(body.delivery_date)
              : undefined,
            notes: body.notes,
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

        return apiSuccess(order, "Order updated successfully");
      } catch (error) {
        logError(error as Error, {
          category: ErrorCategory.API,
          orderId: context!.params.id,
          operation: "update_order",
        });
        return apiServerError(error);
      }
    },
    { resource: "order", action: "UPDATE" }
  )
);

// DELETE /api/orders/[id] - Delete order
export const DELETE = requireAuth(
  withAudit(
    async (_request: NextRequest, user, context?: { params: { id: string } }) => {
      try {
        const orderId = context!.params.id;
        const ____workspaceId = user.workspaceId;
        await prisma.order.delete({
          where: { id: orderId },
        });

        return apiSuccess({ id: orderId }, "Order deleted successfully");
      } catch (error) {
        logError(error as Error, {
          category: ErrorCategory.API,
          orderId: context!.params.id,
          operation: "delete_order",
        });
        return apiServerError(error);
      }
    },
    { resource: "order", action: "DELETE" }
  )
);