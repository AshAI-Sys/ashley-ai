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
                phone_number: true,
                avatar_url: true,
            },
        });
        if (!user) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Return with backwards compatible fields
        return server_1.NextResponse.json({
            ...user,
            name: `${user.first_name} ${user.last_name}`,
            phone: user.phone_number,
            bio: '', // Bio doesn't exist in schema
        });
    }
    catch (error) {
        console.error("Error fetching account settings:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch account" }, { status: 500 });
    }
});
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, authUser) => {
    try {
        const body = await request.json();
        const { name, email, phone } = body;
        // Check if email is being changed
        let emailVerificationRequired = false;
        if (email) {
            const currentUser = await prisma.user.findUnique({
                where: { id: authUser.id },
                select: { email: true },
            });
            if (currentUser && currentUser.email !== email) {
                // Check if email is already taken with workspace
            }
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    workspace_id: authUser.workspaceId,
                },
            });
            if (existingUser && existingUser.id !== authUser.id) {
                return server_1.NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
            emailVerificationRequired = true;
        }
        const updateData = {
            updated_at: new Date(),
        };
        // Split name into first and last if provided
        if (name) {
            const nameParts = name.split(' ');
            updateData.first_name = nameParts[0] || '';
            updateData.last_name = nameParts.slice(1).join(' ') || '';
        }
    }
    finally { }
});
if (email) {
    updateData.email = email;
}
;
if (phone !== undefined) {
    updateData.phone_number = phone;
}
;
const updatedUser = await prisma.user.update({
    where: { id: authUser.id },
    data: updateData,
    return: server_1.NextResponse.json({
        success: true,
        user: updatedUser,
        email_verification_required: emailVerificationRequired,
    })
});
try { }
catch (error) {
    console.error("Error updating account settings:", error);
    return server_1.NextResponse.json({ error: "Failed to update account" }, { status: 500 });
}
