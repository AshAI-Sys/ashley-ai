"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const productType = searchParams.get("product_type");
        const method = searchParams.get("method");
        const where = {};
        if (productType && productType !== "all") {
            where.product_type = productType;
            if (method && method !== "all") {
                where.method = method;
            }
            const checklists = await db_1.prisma.qCChecklist.findMany({
                where,
                orderBy: { name: "asc" },
            });
            return server_1.NextResponse.json(checklists);
        }
        try { }
        catch (error) {
            console.error("Error fetching checklists:", error);
            return server_1.NextResponse.json({ error: "Failed to fetch checklists" }, { status: 500 });
        }
        export const POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
            try {
                const data = await request.json();
                const checklist = await db_1.prisma.qCChecklist.create({
                    data: {
                        workspace_id: data.workspace_id || "default",
                        name: data.name,
                        type: data.type || "FINAL", // Changed from product_type/method to type
                        category: data.category || "VISUAL", // Added category field
                        items: JSON.stringify(data.items),
                    },
                });
                return server_1.NextResponse.json(checklist, { status: 201 });
            }
            catch (error) {
                console.error("Error creating checklist:", error);
                return server_1.NextResponse.json({ error: "Failed to create checklist" }, { status: 500 });
            }
        });
    }
    finally { }
});
