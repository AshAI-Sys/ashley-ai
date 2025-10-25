"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.dynamic = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = new client_1.PrismaClient();
// Force dynamic route (don't pre-render during build)
exports.dynamic = "force-dynamic";
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, authUser) => {
    try {
        const formData = await request.formData();
        const file = formData.get("avatar");
        if (!file) {
            return server_1.NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        // Validate file type
        if (!file.type.startsWith("image/")) {
            return server_1.NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return server_1.NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
        }
        // TODO: In production, upload to cloud storage (S3, Cloudinary, etc.)
        // For now, we'll use a data URL (not recommended for production)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const avatar_url = `data:${file.type};base64,${base64}`;
        // Update user avatar
        await prisma.user.update({
            where: { id: authUser.id },
            data: {
                avatar_url,
                updated_at: new Date(),
            },
        });
        return server_1.NextResponse.json({ success: true, avatar_url });
    }
    catch (error) {
        console.error("Error uploading avatar:", error);
        return server_1.NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
    }
    export const DELETE = (0, auth_middleware_1.requireAuth)(async (request, authUser) => {
        try {
            await prisma.user.update({
                where: { id: authUser.id },
                data: {
                    avatar_url: null,
                    updated_at: new Date(),
                },
            });
            return server_1.NextResponse.json({ success: true });
        }
        catch (error) {
            console.error("Error removing avatar:", error);
            return server_1.NextResponse.json({ error: "Failed to remove avatar" }, { status: 500 });
        }
    });
});
