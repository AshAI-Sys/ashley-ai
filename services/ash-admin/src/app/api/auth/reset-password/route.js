"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.runtime = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("../../../../lib/db");
const audit_logger_1 = require("../../../../lib/audit-logger");
const password_validator_1 = require("../../../../lib/password-validator");
const bcrypt = __importStar(require("bcryptjs"));
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Force Node.js runtime (Prisma doesn't support Edge)
exports.runtime = "nodejs";
const ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Reset token is required"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        // Validate request
        const validation = ResetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return server_1.NextResponse.json({
                success: false,
                error: "Invalid request data",
                details: validation.error.format(),
            }, { status: 400 });
        }
        const { token, password } = validation.data;
        // Validate password strength
        const passwordValidation = (0, password_validator_1.validatePassword)(password);
        if (!passwordValidation.valid) {
            return server_1.NextResponse.json({
                success: false,
                error: "Password does not meet security requirements",
                details: passwordValidation.errors,
                strength: passwordValidation.strength,
            }, { status: 400 });
        }
        // Find user with this reset token
        const user = await db_1.prisma.user.findFirst({
            where: {
                password_reset_token: token,
            },
            include: {
                workspace: true,
            },
        });
        if (!user) {
            return server_1.NextResponse.json({
                success: false,
                error: "Invalid or expired reset token",
            }, { status: 400 });
        }
        // Check if token is expired (1 hour)
        if (user.password_reset_expires &&
            new Date() > user.password_reset_expires) {
            return server_1.NextResponse.json({
                success: false,
                error: "Reset token has expired. Please request a new password reset link.",
                expired: true,
            }, { status: 400 });
        }
        // Hash new password (10 rounds - optimized for speed while maintaining security)
        const password_hash = await bcrypt.hash(password, 10);
        // Update password and clear reset token
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash,
                password_reset_token: null,
                password_reset_expires: null,
            },
        });
        // Log successful password reset
        await (0, audit_logger_1.logAuthEvent)("PASSWORD_RESET", user.workspace_id, user.id, request, {
            email: user.email,
        });
        console.log("✅ Password reset successful for user:", user.email);
        return server_1.NextResponse.json({
            success: true,
            message: "Password has been reset successfully! You can now log in with your new password.",
            user: {
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
            },
        }, { status: 200 });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return server_1.NextResponse.json({
            success: false,
            error: "Failed to reset password",
            details: process.env.NODE_ENV === "development" ? error.message : undefined,
        }, { status: 500 });
    }
});
