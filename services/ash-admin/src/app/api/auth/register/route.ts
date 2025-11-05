/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import * as bcrypt from 'bcrypt';
import { logAuthEvent } from "../../../../lib/audit-logger";
import { validatePassword } from "../../../../lib/password-validator";
import { sendEmail } from "../../../../lib/email";
import { z } from "zod";
import crypto from "crypto";

// Force Node.js runtime (Prisma doesn't support Edge)
export const runtime = "nodejs";

// Validation schema with Zod
const RegisterSchema = z.object({
  // Workspace info
  workspaceName: z.string().min(1, "Workspace name is required").max(100),
  workspaceSlug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Workspace slug must be lowercase alphanumeric with hyphens"
    ),

  // User info
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string().optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),

  // Optional
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request with Zod
    const validation = RegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      workspaceName,
      workspaceSlug,
      email,
      password,
      firstName,
      lastName,
      companyAddress,
      companyPhone,
    } = validation.data;

    // Validate password strength
    const passwordValidation = validatePassword(password);

    console.log("Password validation result:", passwordValidation);

    if (!passwordValidation.valid) {
      console.log("Password validation failed:", passwordValidation.errors);
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

    // Check if workspace slug already exists and auto-generate unique one if needed
    let finalSlug = workspaceSlug;
    let existingWorkspace = await prisma.workspace.findUnique({
      where: { slug: finalSlug },
    });

    // If slug exists, append random suffix to make it unique
    if (existingWorkspace) {
      let attempts = 0;
      const maxAttempts = 10;

      while (existingWorkspace && attempts < maxAttempts) {
        const randomSuffix = Math.floor(Math.random() * 10000);
        finalSlug = `${workspaceSlug}-${randomSuffix}`;

        existingWorkspace = await prisma.workspace.findUnique({
          where: { slug: finalSlug },
        });

        attempts++;
      }

      // If still can't find unique slug after 10 attempts, give up
      if (existingWorkspace) {
        return NextResponse.json(
          {
            success: false,
            error: "Unable to generate unique workspace slug. Please try a different name.",
          },
          { status: 409 }
        );
      }

      console.log(`✅ Auto-generated unique slug: ${finalSlug} (original: ${workspaceSlug})`);
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      await logAuthEvent("REGISTER_FAILED", "system", undefined, request, {
        email,
        reason: "Email already exists"});

      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 rounds - optimized for speed while maintaining security)
    // 10 rounds = ~100-500ms (fast & secure, OWASP recommended minimum)
    // 12 rounds = ~1-3s (maximum security but slower UX)
    const password_hash = await bcrypt.hash(password, 10);

    // Generate email verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create workspace and admin user in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create workspace with unique slug
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: finalSlug, // Use the unique slug (may have random suffix)
          is_active: true,
          settings: JSON.stringify({
            timezone: "Asia/Manila",
            currency: "PHP",
            date_format: "YYYY-MM-DD",
            time_format: "24h",
            companyAddress: companyAddress || null,
            companyPhone: companyPhone || null,
          }),
        },
      });

      // Create admin user with verification token
      // In development mode, auto-verify emails to skip email sending
      const isDevelopment = process.env.NODE_ENV === "development";

      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password_hash,
          first_name: firstName,
          last_name: lastName,
          role: "admin", // Admin role for first user
          position: "Administrator",
          department: "Management",
          workspace_id: workspace.id,
          is_active: true,
          permissions: JSON.stringify(["*"]), // Full permissions
          email_verified: isDevelopment ? true : false, // Auto-verify in development
          email_verification_token: isDevelopment ? null : verificationToken,
          email_verification_expires: isDevelopment ? null : verificationExpires,
          email_verification_sent_at: isDevelopment ? null : new Date(),
        },
      });

      return { workspace, user };
    });

    const { workspace, user } = result;

    // Send verification email only in production (skip in development)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      // Send verification email - MUST succeed before showing success page
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3001}`;
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

      // Send email and check result
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Ashley AI",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to Ashley AI!</h1>
              </div>
              <div class="content">
                <h2>Hi ${user.first_name}!</h2>
                <p>Thank you for registering with Ashley AI. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
                  ${verificationUrl}
                </p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p><strong>Workspace Details:</strong></p>
                <ul>
                  <li><strong>Workspace Name:</strong> ${workspace.name}</li>
                  <li><strong>Workspace Slug:</strong> ${workspace.slug}</li>
                  <li><strong>Your Email:</strong> ${user.email}</li>
                </ul>
                <p>If you didn't create this account, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 Ashley AI - Manufacturing ERP System</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to Ashley AI!

Hi ${user.first_name},

Thank you for registering with Ashley AI. We're excited to have you on board!

Please verify your email address by visiting this link:
${verificationUrl}

This link will expire in 24 hours.

Workspace Details:
- Workspace Name: ${workspace.name}
- Workspace Slug: ${workspace.slug}
- Your Email: ${user.email}

If you didn't create this account, please ignore this email.

---
© 2025 Ashley AI - Manufacturing ERP System
This is an automated email. Please do not reply.
        `
      });

      // Check if email was sent successfully
      if (!emailResult.success) {
        console.error("❌ Failed to send verification email:", emailResult.error);

        // Email sending failed - delete the user and workspace to allow retry
        try {
          await prisma.user.delete({ where: { id: user.id } });
          await prisma.workspace.delete({ where: { id: workspace.id } });
          console.log("🗑️ Cleaned up user and workspace after email failure");
        } catch (cleanupError) {
          console.error("Failed to cleanup after email error:", cleanupError);
        }

        // Return error to user
        return NextResponse.json(
          {
            success: false,
            error: "Failed to send verification email",
            message: emailResult.error || "Could not send verification email. Please try again later.",
            details: process.env.NODE_ENV === "development" ? emailResult.error : undefined,
          },
          { status: 500 }
        );
      }

      console.log("✅ Verification email sent successfully to:", user.email, "ID:", emailResult.id);
    } else {
      console.log("✅ Development mode - Email verification skipped. Account auto-verified.");
    }

    // Log successful registration
    await logAuthEvent("REGISTER", workspace.id, user.id, request, {
      email: user.email,
      role: user.role,
    });

    console.log("âœ… New admin account created:", {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      userId: user.id,
      email: user.email,
      emailVerified: isDevelopment ? true : false,
    });

    return NextResponse.json(
      {
        success: true,
        message: isDevelopment
          ? "Account created successfully! You can now log in."
          : "Account created successfully! Please check your email to verify your account.",
        requiresVerification: !isDevelopment,
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
        },
        user: {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create account",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
