"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// GET /api/clients/[id] - Get single client
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user, context) => {
    try {
        const workspaceId = user.workspaceId;
        const client = await prisma.client.findFirst({
            where: {
                id: context.params.id,
                workspace_id: workspaceId,
            },
            include: {
                brands: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        is_active: true,
                        created_at: true,
                    },
                    orderBy: { created_at: "desc" },
                },
                orders: {
                    select: {
                        id: true,
                        order_number: true,
                        status: true,
                        total_amount: true,
                        currency: true,
                        delivery_date: true,
                        created_at: true,
                    },
                    orderBy: { created_at: "desc" },
                    take: 10,
                },
                _count: {
                    select: {
                        orders: true,
                        brands: true,
                    },
                },
            },
        });
        if (!client) {
            return server_1.NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }
        return server_1.NextResponse.json({
            success: true,
            data: client,
        });
    }
    catch (error) {
        console.error("Failed to fetch client:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch client" }, { status: 500 });
    }
});
// PUT /api/clients/[id] - Update client
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, user, context) => {
    try {
        const body = await request.json();
        // Convert address object to JSON string if it's an object
        const addressData = body.address && typeof body.address === "object"
            ? JSON.stringify(body.address)
            : body.address;
        const client = await prisma.client.update({
            where: { id: context.params.id },
            data: {
                name: body.name,
                contact_person: body.contact_person,
                email: body.email,
                phone: body.phone,
                address: addressData,
                tax_id: body.tax_id,
                payment_terms: body.payment_terms ? parseInt(body.payment_terms) : null,
                credit_limit: body.credit_limit ? parseFloat(body.credit_limit) : null,
                is_active: body.is_active !== undefined ? body.is_active : true,
            },
            include: {
                _count: {
                    select: {
                        orders: true,
                        brands: true,
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: client,
            message: "Client updated successfully",
        });
    }
    catch (error) {
        console.error("Failed to update client:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update client" }, { status: 500 });
    }
});
// DELETE /api/clients/[id] - Delete client
exports.DELETE = (0, auth_middleware_1.requireAuth)(async (request, user, context) => {
    try {
        await prisma.client.delete({
            where: { id: context.params.id },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Client deleted successfully",
        });
    }
    catch (error) {
        console.error("Failed to delete client:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to delete client" }, { status: 500 });
    }
});
