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
const ResendSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        // Validate request
        const validation = ResendSchema.safeParse(body);
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
        if (!user) {
            // Don't reveal if user exists or not for security
            return server_1.NextResponse.json({
                success: true,
                message: "If an account exists with this email, a verification link has been sent.",
            }, { status: 200 });
        }
        // Check if already verified
        if (user.email_verified) {
            return server_1.NextResponse.json({
                success: false,
                error: "Email is already verified. You can log in.",
            }, { status: 400 });
        }
        // Check rate limiting - don't allow resending within 2 minutes
        if (user.email_verification_sent_at) {
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            if (user.email_verification_sent_at > twoMinutesAgo) {
                const waitSeconds = Math.ceil((user.email_verification_sent_at.getTime() -
                    twoMinutesAgo.getTime()) /
                    1000);
                return server_1.NextResponse.json({
                    success: false,
                    error: `Please wait ${waitSeconds} seconds before requesting another verification email`,
                }, { status: 429 });
            }
        }
        // Generate new verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Update user with new token
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: {
                email_verification_token: verificationToken,
                email_verification_expires: verificationExpires,
                email_verification_sent_at: new Date(),
            },
        });
        // Create verification URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
        // Send verification email using Gmail SMTP
        try {
            const { sendEmailVerification } = await Promise.resolve().then(() => __importStar(require("../../../../lib/gmail-email")));
            await sendEmailVerification(user.email, {
                user_name: `${user.first_name} ${user.last_name}`,
                verification_link: verificationUrl,
            });
            console.log("✅ Verification email sent to:", user.email);
        }
        catch (emailError) {
            console.error("❌ Failed to send verification email:", emailError);
            // Don't fail the request - show verification URL in console instead
            console.log("📧 Verification email for:", user.email);
            console.log("🔗 Verification URL:", verificationUrl);
            console.log("⏰ Expires:", verificationExpires);
        }
        // Log event
        await (0, audit_logger_1.logAuthEvent)("VERIFICATION_RESENT", user.workspace_id, user.id, request, {
            email: user.email,
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Verification email sent! Please check your inbox.",
            // Only return verification URL in development (for testing)
            // In production, user must check email
            ...(process.env.NODE_ENV === "development" && {
                verificationUrl,
                expiresAt: verificationExpires,
            }),
        }, { status: 200 });
    }
    catch (error) {
        console.error("Resend verification error:", error);
        return server_1.NextResponse.json({
            success: false,
            error: "Failed to send verification email",
            details: process.env.NODE_ENV === "development" ? error.message : undefined,
        }, { status: 500 });
    }
});
