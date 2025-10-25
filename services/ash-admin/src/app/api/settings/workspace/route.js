"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.GET = exports.dynamic = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = new client_1.PrismaClient();
// Force dynamic route (don't pre-render during build)
exports.dynamic = "force-dynamic";
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, authUser) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: authUser.workspaceId },
            select: {
                name: true,
                slug: true,
                description: true,
                industry: true,
                company_size: true,
                website: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                country: true,
                postal_code: true,
                timezone: true,
                currency: true,
                date_format: true,
                tax_id: true,
                logo_url: true,
            },
        });
        if (!workspace) {
            return server_1.NextResponse.json({ error: "Workspace not found" }, { status: 404 });
        }
    }
    finally {
    }
    return server_1.NextResponse.json(workspace);
});
try { }
catch (error) {
    console.error("Error fetching workspace settings:", error);
    return server_1.NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
}
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, authUser) => {
    try {
        const body = await request.json();
        const updateData = {
            updated_at: new Date(),
        };
        // Only update fields that are provided
        const allowedFields = [
            "name",
            "description",
            "industry",
            "company_size",
            "website",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "country",
            "postal_code",
            "timezone",
            "currency",
            "date_format",
            "tax_id",
        ];
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
            const updatedWorkspace = await prisma.workspace.update({
                where: { id: authUser.workspaceId },
                data: updateData,
                return: server_1.NextResponse.json({ success: true, workspace: updatedWorkspace })
            });
            try { }
            catch (error) {
                console.error("Error updating workspace settings:", error);
                return server_1.NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
            }
        });
    }
    finally { }
});
