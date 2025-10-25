"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const _2fa_server_1 = require("@/lib/2fa-server");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// POST /api/auth/2fa/verify - Verify 2FA token and enable 2FA
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { user_id, token, enable_2fa = false } = body;
        if (!user_id || !token) {
            return server_1.NextResponse.json({ error: "user_id and token are required" }, { status: 400 });
        }
        // Get user with 2FA settings
        const user = await prisma.user.findUnique({
            where: { id: user_id },
        });
        if (!user) {
            return server_1.NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        if (!user.two_factor_secret) {
            return server_1.NextResponse.json({
                error: "2FA not setup for this user. Call /api/auth/2fa/setup first",
            }, { status: 400 });
        }
        // Parse encrypted secret
        const secretData = JSON.parse(user.two_factor_secret);
        const backupCodes = user.two_factor_backup_codes
            ? JSON.parse(user.two_factor_backup_codes)
            : [];
        // Verify token
        const result = await (0, _2fa_server_1.verify2FA)(secretData.encrypted, secretData.iv, token, backupCodes);
        if (!result.valid) {
            return server_1.NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
        }
        // If backup code was used, remove it from the list
        if (result.usedBackupCode && result.backupCodeIndex !== undefined) {
            backupCodes.splice(result.backupCodeIndex, 1);
            await prisma.user.update({
                where: { id: user_id },
                data: {
                    two_factor_backup_codes: JSON.stringify(backupCodes),
                },
            });
        }
        // If this is the first verification (enabling 2FA), enable it now
        if (enable_2fa && !user.two_factor_enabled) {
            await prisma.user.update({
                where: { id: user_id },
                data: {
                    two_factor_enabled: true,
                },
            });
        }
        return server_1.NextResponse.json({
            valid: true,
            used_backup_code: result.usedBackupCode,
            remaining_backup_codes: backupCodes.length,
            message: result.usedBackupCode
                ? "Backup code verified. Please generate new backup codes."
                : "2FA code verified successfully",
        });
    }
    catch (error) {
        console.error("Error verifying 2FA:", error);
        return server_1.NextResponse.json({
            error: "Failed to verify 2FA code",
            details: error.message,
        }, { status: 500 });
    }
});
