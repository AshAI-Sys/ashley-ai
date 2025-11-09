/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { logAuthEvent } from "../../../../lib/audit-logger";
import { validatePassword } from "../../../../lib/password-validator";
import bcrypt from 'bcryptjs';
import { z } from "zod";

export const dynamic = 'force-dynamic';

// Force Node.js runtime (Prisma doesn't support Edge)
export const runtime = "nodejs";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = ResetPasswordSchema.safeParse(body);
    if (!validation.success) {
      
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }
    const { token, password } = validation.data;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      
      return NextResponse.json(
        {
          success: false,
          error: "Password does not meet security requirements",
          details: passwordValidation.errors,
          strength: passwordValidation.strength,
        },
        { status: 400 }
      );
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        password_reset_token: token,
      },
      include: {
        workspace: true,
      },
    });
    if (!user) {
      
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired reset token",
        },
        { status: 400 }
      );
    }

    // Check if token is expired (1 hour)
    if (
      user.password_reset_expires &&
      new Date() > user.password_reset_expires
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Reset token has expired. Please request a new password reset link.",
          expired: true,
        },
        { status: 400 }
      );
    }

    // Hash new password (10 rounds - optimized for speed while maintaining security)
    const password_hash = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        password_reset_token: null,
        password_reset_expires: null,
      },
    });
    // Log successful password reset
    await logAuthEvent("PASSWORD_RESET", user.workspace_id, user.id, request, {
      email: user.email,
    });

console.log("✅ Password reset successful for user:", user.email);

    return NextResponse.json(
      {
        success: true,
        message:
          "Password has been reset successfully! You can now log in with your new password.",
        user: {
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset password",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
