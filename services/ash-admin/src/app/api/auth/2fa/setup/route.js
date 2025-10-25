"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const _2fa_server_1 = require("@/lib/2fa-server");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// POST /api/auth/2fa/setup - Generate 2FA secret and QR code
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { user_id } = body;
        if (!user_id) {
            return server_1.NextResponse.json({ error: "user_id is required" }, { status: 400 });
        }
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: user_id },
        });
        if (!user) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        if (user.two_factor_enabled) {
            return server_1.NextResponse.json({ error: "2FA is already enabled for this user" }, { status: 400 });
        }
        // Generate 2FA credentials
        const result = await (0, _2fa_server_1.setup2FA)(user.email);
        // Store encrypted secret in database (but don't enable yet)
        await prisma.user.update({
            where: { id: user_id },
            data: {
                two_factor_secret: JSON.stringify({
                    encrypted: result.encrypted_secret,
                    iv: result.iv,
                }),
                two_factor_backup_codes: JSON.stringify(result.backup_codes_hashed),
            },
        });
        // Return otpauth URL and backup codes to user
        // NOTE: This is the ONLY time backup codes are shown
        // Client will generate QR code from otpauth_url
        return server_1.NextResponse.json({
            otpauth_url: result.otpauth_url,
            backup_codes: result.backup_codes,
            message: "Scan QR code with Google Authenticator or similar app",
        });
    }
    catch (error) {
        console.error("Error setting up 2FA:", error);
        return server_1.NextResponse.json({
            error: "Failed to setup 2FA",
            details: error.message,
        }, { status: 500 });
    }
});
// DELETE /api/auth/2fa/setup - Disable 2FA
exports.DELETE = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get("user_id");
        if (!user_id) {
            return server_1.NextResponse.json({ error: "user_id is required" }, { status: 400 });
        }
        // Disable 2FA
        await prisma.user.update({
            where: { id: user_id },
            data: {
                two_factor_enabled: false,
                two_factor_secret: null,
                two_factor_backup_codes: null,
            },
        });
        return server_1.NextResponse.json({
            message: "2FA has been disabled",
        });
    }
    catch (error) {
        console.error("Error disabling 2FA:", error);
        return server_1.NextResponse.json({
            error: "Failed to disable 2FA",
            details: error.message,
        }, { status: 500 });
    }
});
