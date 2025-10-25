"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.GET = void 0;
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const api_response_1 = require("@/lib/api-response");
const logger_1 = require("@/lib/logger");
const prisma = database_1.db;
// GET /api/orders/[id] - Get single order
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user, context) => {
    try {
        const workspaceId = user.workspaceId;
        const order = await prisma.order.findFirst({
            where: {
                id: context.params.id,
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
            return (0, api_response_1.apiNotFound)("Order");
        }
        return (0, api_response_1.apiSuccess)(order);
    }
    catch (error) {
        (0, logger_1.logError)("Failed to fetch order", error, { orderId: context.params.id });
        return (0, api_response_1.apiServerError)(error);
    }
});
// PUT /api/orders/[id] - Update order
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, user, context) => {
    try {
        const _workspaceId = user.workspaceId;
        const body = await request.json();
        const order = await prisma.order.update({
            where: { id: context.params.id },
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
        return (0, api_response_1.apiSuccess)(order, "Order updated successfully");
    }
    catch (error) {
        (0, logger_1.logError)("Failed to update order", error, { orderId: context.params.id });
        return (0, api_response_1.apiServerError)(error);
    }
});
// DELETE /api/orders/[id] - Delete order
exports.DELETE = (0, auth_middleware_1.requireAuth)(async (request, user, context) => {
    try {
        const _workspaceId = user.workspaceId;
        await prisma.order.delete({
            where: { id: context.params.id },
        });
        return (0, api_response_1.apiSuccess)({ id: context.params.id }, "Order deleted successfully");
    }
    catch (error) {
        (0, logger_1.logError)("Failed to delete order", error, { orderId: context.params.id });
        return (0, api_response_1.apiServerError)(error);
    }
});
