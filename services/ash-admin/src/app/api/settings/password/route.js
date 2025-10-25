"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.dynamic = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("@/lib/auth-middleware");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
// Force dynamic route (don't pre-render during build)
exports.dynamic = "force-dynamic";
exports.PUT = (0, auth_middleware_1.requireAuth)(async (request, authUser) => {
    try {
        const body = await request.json();
        const { current_password, new_password } = body;
        // Validate inputs
        if (!current_password || !new_password) {
            return server_1.NextResponse.json({ error: "Both current and new password are required" }, { status: 400 });
        }
        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
        });
        if (!user) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Verify current password
        const isPasswordValid = await bcrypt_1.default.compare(current_password, user.password_hash);
        if (!isPasswordValid) {
            return server_1.NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
        }
        // Check if new password is same as old
        const isSamePassword = await bcrypt_1.default.compare(new_password, user.password_hash);
        if (isSamePassword) {
            return server_1.NextResponse.json({ error: "New password must be different from current password" }, { status: 400 });
        }
        // Validate new password strength
        if (new_password.length < 8) {
            return server_1.NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }
        if (!/[A-Z]/.test(new_password)) {
            return server_1.NextResponse.json({ error: "Password must contain an uppercase letter" }, { status: 400 });
        }
        if (!/[a-z]/.test(new_password)) {
            return server_1.NextResponse.json({ error: "Password must contain a lowercase letter" }, { status: 400 });
        }
        if (!/[0-9]/.test(new_password)) {
            return server_1.NextResponse.json({ error: "Password must contain a number" }, { status: 400 });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(new_password)) {
            return server_1.NextResponse.json({ error: "Password must contain a special character" }, { status: 400 });
        }
        // Hash new password (10 rounds - optimized for speed while maintaining security)
        const passwordHash = await bcrypt_1.default.hash(new_password, 10);
        // Update password
        await prisma.user.update({
            where: { id: authUser.id },
            data: {
                password_hash: passwordHash,
                updated_at: new Date(),
            },
            return: server_1.NextResponse.json({
                success: true,
                message: "Password changed successfully",
            }), catch(error) {
                console.error("Error changing password:", error);
                return server_1.NextResponse.json({ error: "Failed to change password" }, { status: 500 });
            }
        });
    }
    finally { }
});
