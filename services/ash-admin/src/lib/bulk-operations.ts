/**
 * Bulk Operations Utility
 * Provides batch processing capabilities for orders, invoices, and other entities
 */

import { prisma } from "./db";

export interface BulkOperationResult<T = any> {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ index: number; error: string; item?: T }>;
  results?: T[];
}

/**
 * Bulk update order status
 */
export async function bulkUpdateOrderStatus(
  orderIds: string[],
  status: string,
  userId: string
): Promise<BulkOperationResult> {
  const errors: Array<{ index: number; error: string }> = [];
  let processed = 0;
  let failed = 0;

  try {
    for (let i = 0; i < orderIds.length; i++) {
      try {
        await prisma.order.update({
          where: { id: orderIds[i] },
          data: {
            status,
            updated_at: new Date(),
          },
        });

        // Log activity
        await prisma.orderActivityLog
          .create({
            data: {
              workspace_id: workspaceId,
              order_id: orderIds[i]!,
              event_type: "STATUS_CHANGED",
              title: "Status Changed",
              description: `Status changed to ${status} (bulk operation)`,
              performed_by: userId,
              metadata: JSON.stringify({ bulkOperation: true }),
            },
          })
          .catch(() => {}); // Ignore activity log errors

        processed++;
      } catch (error) {
        failed++;
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      processed,
      failed: orderIds.length - processed,
      errors: [
        {
          index: -1,
          error:
            error instanceof Error ? error.message : "Bulk operation failed",
        },
      ],
    };
  }
}

/**
 * Bulk delete orders
 */
export async function bulkDeleteOrders(
  orderIds: string[],
  userId: string
): Promise<BulkOperationResult> {
  const errors: Array<{ index: number; error: string }> = [];
  let processed = 0;
  let failed = 0;

  try {
    for (let i = 0; i < orderIds.length; i++) {
      try {
        // Soft delete by setting is_deleted flag or status
        await prisma.order.update({
          where: { id: orderIds[i] },
          data: {
            status: "CANCELLED",
            updated_at: new Date(),
          },
        });

        processed++;
      } catch (error) {
        failed++;
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      processed,
      failed: orderIds.length - processed,
      errors: [
        {
          index: -1,
          error:
            error instanceof Error ? error.message : "Bulk operation failed",
        },
      ],
    };
  }
}

/**
 * Bulk create invoices from orders
 */
export async function bulkCreateInvoices(
  orderIds: string[],
  workspaceId: string
): Promise<BulkOperationResult<{ orderId: string; invoiceId: string }>> {
  const errors: Array<{ index: number; error: string; item?: any }> = [];
  const results: Array<{ orderId: string; invoiceId: string }> = [];
  let processed = 0;
  let failed = 0;

  try {
    for (let i = 0; i < orderIds.length; i++) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderIds[i] },
          include: {
            client: true,
            brand: true,
          },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        if (!order.client_id) {
          throw new Error("Order has no client");
        }

        // Create invoice
        const invoice = await prisma.invoice.create({
          data: {
            workspace_id: workspaceId,
            client_id: order.client_id,
            order_id: order.id,
            invoice_number: `INV-${Date.now()}-${i}`,
            issue_date: new Date(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            subtotal: order.total_amount || 0,
            total_amount: order.total_amount || 0,
            status: "draft",
            currency: "PHP",
          },
        });

        results.push({
          orderId: order.id,
          invoiceId: invoice.id,
        });

        processed++;
      } catch (error) {
        failed++;
        errors.push({
          index: i,
          item: { orderId: orderIds[i] },
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
      results,
    };
  } catch (error) {
    return {
      success: false,
      processed,
      failed: orderIds.length - processed,
      errors: [
        {
          index: -1,
          error:
            error instanceof Error ? error.message : "Bulk operation failed",
        },
      ],
      results,
    };
  }
}

/**
 * Bulk update invoice status
 */
export async function bulkUpdateInvoiceStatus(
  invoiceIds: string[],
  status: string
): Promise<BulkOperationResult> {
  const errors: Array<{ index: number; error: string }> = [];
  let processed = 0;
  let failed = 0;

  try {
    for (let i = 0; i < invoiceIds.length; i++) {
      try {
        await prisma.invoice.update({
          where: { id: invoiceIds[i] },
          data: {
            status,
            updated_at: new Date(),
          },
        });

        processed++;
      } catch (error) {
        failed++;
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      processed,
      failed: invoiceIds.length - processed,
      errors: [
        {
          index: -1,
          error:
            error instanceof Error ? error.message : "Bulk operation failed",
        },
      ],
    };
  }
}

/**
 * Bulk import orders from CSV/Excel data
 */
export interface OrderImportData {
  client_name: string;
  brand_name?: string;
  order_number: string;
  quantity: number;
  total_amount?: number;
  delivery_date?: string;
  notes?: string;
}

export async function bulkImportOrders(
  orders: OrderImportData[],
  workspaceId: string
): Promise<BulkOperationResult<{ orderNumber: string; orderId: string }>> {
  const errors: Array<{ index: number; error: string; item?: any }> = [];
  const results: Array<{ orderNumber: string; orderId: string }> = [];
  let processed = 0;
  let failed = 0;

  try {
    for (let i = 0; i < orders.length; i++) {
      try {
        const orderData = orders[i];
        if (!orderData) continue;

        // Find or create client
        let client = await prisma.client.findFirst({
          where: { workspace_id: workspaceId, name: orderData.client_name },
        });

        if (!client) {
          client = await prisma.client.create({
            data: {
              workspace_id: workspaceId,
              name: orderData.client_name,
              email: `${orderData.client_name.toLowerCase().replace(/\s+/g, "")}@example.com`,
              is_active: true,
            },
          });
        }

        // Find or create brand if provided
        let brand_id: string | undefined;
        if (orderData.brand_name) {
          let brand = await prisma.brand.findFirst({
            where: {
              workspace_id: workspaceId,
              client_id: client.id,
              name: orderData.brand_name,
            },
          });

          if (!brand) {
            brand = await prisma.brand.create({
              data: {
                workspace_id: workspaceId,
                client_id: client.id,
                name: orderData.brand_name,
                code: orderData.brand_name.substring(0, 3).toUpperCase(),
                is_active: true,
              },
            });
          }

          brand_id = brand.id;
        }

        // Create order
        const order = await prisma.order.create({
          data: {
            workspace_id: workspaceId,
            client_id: client.id,
            brand_id,
            order_number: orderData.order_number,
            total_amount: orderData.total_amount || 0,
            delivery_date: orderData.delivery_date
              ? new Date(orderData.delivery_date)
              : undefined,
            notes: orderData.notes,
            status: "ORDER_RECEIVED",
          },
        });

        results.push({
          orderNumber: order.order_number,
          orderId: order.id,
        });

        processed++;
      } catch (error) {
        failed++;
        errors.push({
          index: i,
          item: orders[i],
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
      results,
    };
  } catch (error) {
    return {
      success: false,
      processed,
      failed: orders.length - processed,
      errors: [
        {
          index: -1,
          error:
            error instanceof Error ? error.message : "Bulk operation failed",
        },
      ],
      results,
    };
  }
}

/**
 * Bulk assign orders to production runs
 */
export async function bulkAssignToProduction(
  orderIds: string[],
  runType: "cutting" | "printing" | "sewing",
  workspaceId: string
): Promise<BulkOperationResult> {
  const errors: Array<{ index: number; error: string }> = [];
  let processed = 0;
  let failed = 0;

  try {
    for (let i = 0; i < orderIds.length; i++) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderIds[i] },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        // Update order status based on run type
        const statusMap = {
          cutting: "IN_CUTTING",
          printing: "IN_PRINTING",
          sewing: "IN_SEWING",
        };

        await prisma.order.update({
          where: { id: orderIds[i] },
          data: {
            status: statusMap[runType],
            updated_at: new Date(),
          },
        });

        processed++;
      } catch (error) {
        failed++;
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      processed,
      failed: orderIds.length - processed,
      errors: [
        {
          index: -1,
          error:
            error instanceof Error ? error.message : "Bulk operation failed",
        },
      ],
    };
  }
}
