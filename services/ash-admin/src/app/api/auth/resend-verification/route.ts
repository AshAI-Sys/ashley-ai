import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { logAuthEvent } from "../../../../lib/audit-logger";
import crypto from "crypto";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse } from "../../../../lib/error-sanitization";

export const dynamic = 'force-dynamic';


// Force Node.js runtime (Prisma doesn't support Edge)
export const runtime = "nodejs";

const ResendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();

    // Validate request
    const validation = ResendSchema.safeParse(body);
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

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists with this email, a verification link has been sent.",
        },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is already verified. You can log in.",
        },
        { status: 400 }
      );
    }

    // Check rate limiting - don't allow resending within 2 minutes
    if (user.email_verification_sent_at) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      if (user.email_verification_sent_at > twoMinutesAgo) {
        const waitSeconds = Math.ceil(
          (user.email_verification_sent_at.getTime() -
            twoMinutesAgo.getTime()) /
            1000
        );
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${waitSeconds} seconds before requesting another verification email`,
          },
          { status: 429 }
        );
      }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
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
      const { sendEmailVerification } = await import(
        "../../../../lib/email"
      );
      await sendEmailVerification(user.email, {
        user_name: `${user.first_name} ${user.last_name}`,
        verification_link: verificationUrl,
      });
      console.log("✅ Verification email sent to:", user.email);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError);
      // Don't fail the request - show verification URL in console instead
      console.log("📧 Verification email for:", user.email);
      console.log("🔗 Verification URL:", verificationUrl);
      console.log("⏰ Expires:", verificationExpires);
    }

    // Log event
    await logAuthEvent(
      "VERIFICATION_RESENT",
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
        message: "Verification email sent! Please check your inbox.",
        // Only return verification URL in development (for testing)
        // In production, user must check email
        ...(process.env.NODE_ENV === "development" && {
          verificationUrl,
          expiresAt: verificationExpires,
        }),
      },
      { status: 200 }
    );

  } catch (error) {
    return createErrorResponse(error, 500, {
      path: request.url,
    });
  }
});
