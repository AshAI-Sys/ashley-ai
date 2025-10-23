/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { logAuthEvent } from "../../../../lib/audit-logger";
import { requireAuth } from "@/lib/auth-middleware";

// Force Node.js runtime (Prisma doesn't support Edge)
export const runtime = "nodejs";

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification token is required",
        },
        { status: 400 }
      );
      }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        email_verification_token: token,
        email_verified: false,
      },
      include: {
        workspace: true,
      },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired verification token",
        },
        { status: 400 }
      );
    }

    // Check if token is expired (24 hours)
    if (
      user.email_verification_expires &&
      new Date() > user.email_verification_expires
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification token has expired. Please request a new one.",
          expired: true,
        },
        { status: 400 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
      },

    // Log successful verification
    await logAuthEvent("EMAIL_VERIFIED", user.workspace_id, user.id, request, {
      email: user.email,
    }

    console.log("✅ Email verified for user:", user.email);

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now log in.",
        user: {
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify email",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
});
