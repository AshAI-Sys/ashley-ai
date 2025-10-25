"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const database_1 = require("@ash-ai/database");
const crypto_1 = __importDefault(require("crypto"));
const prisma = database_1.db;
async function POST(request) {
    try {
        const { email } = await request.json();
        if (!email) {
            return server_1.NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
        // Find client by email across all workspaces
        const client = await prisma.client.findFirst({
            where: {
                email: email.toLowerCase(),
                is_active: true,
            },
            include: {
                workspace: true,
            },
        });
        if (!client) {
            // For security, don't reveal if email exists or not
            return server_1.NextResponse.json({
                success: true,
                message: "If your email is registered, you will receive a magic link shortly.",
            });
        }
        // Generate magic token
        const magicToken = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        // Create or update client session
        await prisma.clientSession.upsert({
            where: {
                workspace_id_magic_token: {
                    workspace_id: client.workspace_id,
                    magic_token: magicToken,
                },
            },
            create: {
                workspace_id: client.workspace_id,
                client_id: client.id,
                email: email.toLowerCase(),
                magic_token: magicToken,
                expires_at: expiresAt,
            },
            update: {
                is_used: false,
                expires_at: expiresAt,
            },
        });
        // TODO: Send actual email with magic link
        // For now, we'll return the magic link in development
        const magicLink = `${process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3003"}/auth/verify?token=${magicToken}`;
        console.log("🔗 Magic Link for", email, ":", magicLink);
        // Log client activity
        await prisma.clientActivity.create({
            data: {
                workspace_id: client.workspace_id,
                client_id: client.id,
                activity_type: "MAGIC_LINK_REQUESTED",
                description: `Magic link requested for ${email}`,
                ip_address: request.headers.get("x-forwarded-for") ||
                    request.headers.get("x-real-ip") ||
                    "unknown",
                user_agent: request.headers.get("user-agent") || "unknown",
            },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Magic link sent to your email!",
            // Remove this in production
            ...(process.env.NODE_ENV === "development" && { magicLink }),
        });
    }
    catch (error) {
        console.error("Magic link error:", error);
        return server_1.NextResponse.json({
            error: "Failed to send magic link",
        }, { status: 500 });
    }
}
