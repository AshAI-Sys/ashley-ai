/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { logAuthEvent } from "../../../../lib/audit-logger";
import crypto from "crypto";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";

// Force Node.js runtime (Prisma doesn't support Edge)
export const runtime = "nodejs";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();

    // Validate request
    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address",
        },
        { status: 400 }
      );
    }
    const { email } = validation.data;

    // Find user
    const user = await prisma.user.findFirst({
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
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists with this email, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }

    // Check rate limiting - don't allow resending within 2 minutes
    if (user.password_reset_sent_at) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      if (user.password_reset_sent_at > twoMinutesAgo) {
        const waitSeconds = Math.ceil(
          (user.password_reset_sent_at.getTime() - twoMinutesAgo.getTime()) /
            1000
        );
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${waitSeconds} seconds before requesting another reset link`,
          },
          { status: 429 }
        );
      }
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
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
      const { sendPasswordResetEmail } = await import("../../../../lib/email");
      await sendPasswordResetEmail(user.email, {
        user_name: `${user.first_name} ${user.last_name}`,
        reset_link: resetUrl,
      });
      console.log("✅ Password reset email sent to:", user.email);
    } catch (emailError) {
      console.error("❌ Failed to send password reset email:", emailError);
      // Don't fail the request - show reset URL in console instead
      console.log("📧 Password reset for:", user.email);
      console.log("🔗 Reset URL:", resetUrl);
      console.log("⏰ Expires:", resetExpires);
    }

    // Log event
    await logAuthEvent(
      "PASSWORD_RESET_REQUESTED",
      user.workspace_id,
      user.id,
      request,
      {
        email: user.email,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
        // Return URL for easy access (can be shown in UI or clicked from console)
        resetUrl,
        expiresAt: resetExpires,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process password reset request",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
});