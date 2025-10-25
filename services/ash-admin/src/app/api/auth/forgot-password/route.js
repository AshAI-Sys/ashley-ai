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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.runtime = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("../../../../lib/db");
const audit_logger_1 = require("../../../../lib/audit-logger");
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Force Node.js runtime (Prisma doesn't support Edge)
exports.runtime = "nodejs";
const ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        // Validate request
        const validation = ForgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return server_1.NextResponse.json({
                success: false,
                error: "Invalid email address",
            }, { status: 400 });
        }
        const { email } = validation.data;
        // Find user
        const user = await db_1.prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
            },
            include: {
                workspace: true,
            },
        });
        // For security, always return success even if user doesn't exist
        // This prevents email enumeration attacks
        if (!user) {
            console.log("📧 Password reset requested for non-existent email:", email);
            return server_1.NextResponse.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link.",
            }, { status: 200 });
        }
        // Check rate limiting - don't allow resending within 2 minutes
        if (user.password_reset_sent_at) {
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            if (user.password_reset_sent_at > twoMinutesAgo) {
                const waitSeconds = Math.ceil((user.password_reset_sent_at.getTime() - twoMinutesAgo.getTime()) /
                    1000);
                return server_1.NextResponse.json({
                    success: false,
                    error: `Please wait ${waitSeconds} seconds before requesting another reset link`,
                }, { status: 429 });
            }
        }
        // Generate password reset token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Update user with reset token
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password_reset_token: resetToken,
                password_reset_expires: resetExpires,
                password_reset_sent_at: new Date(),
            },
        });
        // Create reset URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
        // Send password reset email
        try {
            const { sendPasswordResetEmail } = await Promise.resolve().then(() => __importStar(require("../../../../lib/email")));
            await sendPasswordResetEmail(user.email, {
                user_name: `${user.first_name} ${user.last_name}`,
                reset_link: resetUrl,
            });
            console.log("✅ Password reset email sent to:", user.email);
        }
        catch (emailError) {
            console.error("❌ Failed to send password reset email:", emailError);
            // Don't fail the request - show reset URL in console instead
            console.log("📧 Password reset for:", user.email);
            console.log("🔗 Reset URL:", resetUrl);
            console.log("⏰ Expires:", resetExpires);
        }
        // Log event
        await (0, audit_logger_1.logAuthEvent)("PASSWORD_RESET_REQUESTED", user.workspace_id, user.id, request, {
            email: user.email,
        });
        return server_1.NextResponse.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link.",
            // Return URL for easy access (can be shown in UI or clicked from console)
            resetUrl,
            expiresAt: resetExpires,
        }, { status: 200 });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return server_1.NextResponse.json({
            success: false,
            error: "Failed to process password reset request",
            details: process.env.NODE_ENV === "development" ? error.message : undefined,
        }, { status: 500 });
    }
});
