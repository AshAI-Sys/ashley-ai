"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Note: Supplier model not yet implemented in schema
// Using expense.supplier field as temporary solution
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        // Get unique suppliers from expenses
        const expenses = await db_1.prisma.expense.findMany({
            where: search
                ? {
                    supplier: {
                        contains: search,
                        mode: "insensitive",
                    },
                }
                : {},
            select: {
                supplier: true,
                _count: true,
            },
            distinct: ["supplier"],
        });
        // Format as supplier list
        const suppliers = expenses
            .filter(e => e.supplier)
            .map(e => ({
            name: e.supplier,
            expense_count: 1, // Simplified for now
        }));
        return server_1.NextResponse.json({
            success: true,
            data: suppliers,
        });
    }
    catch (error) {
        console.error("Error fetching suppliers:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch suppliers" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        // Supplier model not implemented yet
        // Return success but don't create anything;
        return server_1.NextResponse.json({
            success: false,
            error: "Supplier model not yet implemented. Suppliers are tracked via Expense records.",
        }, { status: 501 });
    }
    catch (error) {
        console.error("Error creating supplier:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create supplier" }, { status: 500 });
    }
});
