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
        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: {
                first_name: true,
                last_name: true,
                email: true,
                position: true,
                department: true,
            },
        });
        if (!user) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Return with backwards compatible name field
        return server_1.NextResponse.json({
            ...user,
            name: `${user.first_name} ${user.last_name}`,
            timezone: 'UTC',
            language: 'en',
            date_format: 'YYYY-MM-DD',
            time_format: '24h',
        });
    }
    catch (error) {
        console.error("Error fetching general settings:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, authUser) => {
    try {
        const body = await request.json();
        const { name, position, department, } = body;
        // Split name into first and last
        const nameParts = name?.split(' ') || [];
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';
        const updatedUser = await prisma.user.update({
            where: { id: authUser.id },
            data: {
                first_name,
                last_name,
                position,
                department,
                updated_at: new Date(),
            },
        });
        return server_1.NextResponse.json({ success: true, user: updatedUser });
    }
    catch (error) {
        console.error("Error updating general settings:", error);
        return server_1.NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
});
