"use strict";
/**
 * Bulk Operations Utility
 * Provides batch processing capabilities for orders, invoices, and other entities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateOrderStatus = bulkUpdateOrderStatus;
exports.bulkDeleteOrders = bulkDeleteOrders;
exports.bulkCreateInvoices = bulkCreateInvoices;
exports.bulkUpdateInvoiceStatus = bulkUpdateInvoiceStatus;
exports.bulkImportOrders = bulkImportOrders;
exports.bulkAssignToProduction = bulkAssignToProduction;
const db_1 = require("./db");
/**
 * Bulk update order status
 */
async function bulkUpdateOrderStatus(orderIds, status, userId) {
    const errors = [];
    let processed = 0;
    let failed = 0;
    try {
        for (let i = 0; i < orderIds.length; i++) {
            try {
                await db_1.prisma.order.update({
                    where: { id: orderIds[i] },
                    data: {
                        status,
                        updated_at: new Date(),
                    },
                });
                // Log activity
                await db_1.prisma.orderActivityLog
                    .create({
                    data: {
                        order_id: orderIds[i],
                        event_type: "STATUS_CHANGED",
                        description: `Status changed to ${status} (bulk operation)`,
                        performed_by: userId,
                        metadata: JSON.stringify({ bulkOperation: true }),
                    },
                })
                    .catch(() => { }); // Ignore activity log errors
                processed++;
            }
            catch (error) {
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
    }
    catch (error) {
        return {
            success: false,
            processed,
            failed: orderIds.length - processed,
            errors: [
                {
                    index: -1,
                    error: error instanceof Error ? error.message : "Bulk operation failed",
                },
            ],
        };
    }
}
/**
 * Bulk delete orders
 */
async function bulkDeleteOrders(orderIds, userId) {
    const errors = [];
    let processed = 0;
    let failed = 0;
    try {
        for (let i = 0; i < orderIds.length; i++) {
            try {
                // Soft delete by setting is_deleted flag or status
                await db_1.prisma.order.update({
                    where: { id: orderIds[i] },
                    data: {
                        status: "CANCELLED",
                        updated_at: new Date(),
                    },
                });
                processed++;
            }
            catch (error) {
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
    }
    catch (error) {
        return {
            success: false,
            processed,
            failed: orderIds.length - processed,
            errors: [
                {
                    index: -1,
                    error: error instanceof Error ? error.message : "Bulk operation failed",
                },
            ],
        };
    }
}
/**
 * Bulk create invoices from orders
 */
async function bulkCreateInvoices(orderIds, workspaceId) {
    const errors = [];
    const results = [];
    let processed = 0;
    let failed = 0;
    try {
        for (let i = 0; i < orderIds.length; i++) {
            try {
                const order = await db_1.prisma.order.findUnique({
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
                const invoice = await db_1.prisma.invoice.create({
                    data: {
                        workspace_id: workspaceId,
                        client_id: order.client_id,
                        order_id: order.id,
                        brand_id: order.brand_id,
                        invoice_number: `INV-${Date.now()}-${i}`,
                        issue_date: new Date(),
                        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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
            }
            catch (error) {
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
    }
    catch (error) {
        return {
            success: false,
            processed,
            failed: orderIds.length - processed,
            errors: [
                {
                    index: -1,
                    error: error instanceof Error ? error.message : "Bulk operation failed",
                },
            ],
            results,
        };
    }
}
/**
 * Bulk update invoice status
 */
async function bulkUpdateInvoiceStatus(invoiceIds, status) {
    const errors = [];
    let processed = 0;
    let failed = 0;
    try {
        for (let i = 0; i < invoiceIds.length; i++) {
            try {
                await db_1.prisma.invoice.update({
                    where: { id: invoiceIds[i] },
                    data: {
                        status,
                        updated_at: new Date(),
                    },
                });
                processed++;
            }
            catch (error) {
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
    }
    catch (error) {
        return {
            success: false,
            processed,
            failed: invoiceIds.length - processed,
            errors: [
                {
                    index: -1,
                    error: error instanceof Error ? error.message : "Bulk operation failed",
                },
            ],
        };
    }
}
async function bulkImportOrders(orders, workspaceId) {
    const errors = [];
    const results = [];
    let processed = 0;
    let failed = 0;
    try {
        for (let i = 0; i < orders.length; i++) {
            try {
                const orderData = orders[i];
                // Find or create client
                let client = await db_1.prisma.client.findFirst({
                    where: { workspace_id: workspaceId, name: orderData.client_name },
                });
                if (!client) {
                    client = await db_1.prisma.client.create({
                        data: {
                            workspace_id: workspaceId,
                            name: orderData.client_name,
                            code: orderData.client_name.substring(0, 3).toUpperCase(),
                            email: `${orderData.client_name.toLowerCase().replace(/\s+/g, "")}@example.com`,
                            is_active: true,
                        },
                    });
                }
                // Find or create brand if provided
                let brand_id;
                if (orderData.brand_name) {
                    let brand = await db_1.prisma.brand.findFirst({
                        where: {
                            workspace_id: workspaceId,
                            client_id: client.id,
                            name: orderData.brand_name,
                        },
                    });
                    if (!brand) {
                        brand = await db_1.prisma.brand.create({
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
                const order = await db_1.prisma.order.create({
                    data: {
                        workspace_id: workspaceId,
                        client_id: client.id,
                        brand_id,
                        order_number: orderData.order_number,
                        qty: orderData.quantity,
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
            }
            catch (error) {
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
    }
    catch (error) {
        return {
            success: false,
            processed,
            failed: orders.length - processed,
            errors: [
                {
                    index: -1,
                    error: error instanceof Error ? error.message : "Bulk operation failed",
                },
            ],
            results,
        };
    }
}
/**
 * Bulk assign orders to production runs
 */
async function bulkAssignToProduction(orderIds, runType, workspaceId) {
    const errors = [];
    let processed = 0;
    let failed = 0;
    try {
        for (let i = 0; i < orderIds.length; i++) {
            try {
                const order = await db_1.prisma.order.findUnique({
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
                await db_1.prisma.order.update({
                    where: { id: orderIds[i] },
                    data: {
                        status: statusMap[runType],
                        updated_at: new Date(),
                    },
                });
                processed++;
            }
            catch (error) {
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
    }
    catch (error) {
        return {
            success: false,
            processed,
            failed: orderIds.length - processed,
            errors: [
                {
                    index: -1,
                    error: error instanceof Error ? error.message : "Bulk operation failed",
                },
            ],
        };
    }
}
