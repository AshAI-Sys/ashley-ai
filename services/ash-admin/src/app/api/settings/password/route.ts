import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth-middleware";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Force dynamic route (don't pre-render during build)
export const dynamic = "force-dynamic";

export const PUT = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json();
    const { current_password, new_password } = body;

    // Validate inputs
    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: "Both current and new password are required" },
        { status: 400 }
      );
    }
      });

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
      });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      current_password,
      user.password_hash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }
      });

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(
      new_password,
      user.password_hash
    );
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }
      });

    // Validate new password strength
    if (new_password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(new_password)) {
      return NextResponse.json(
        { error: "Password must contain an uppercase letter" },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(new_password)) {
      return NextResponse.json(
        { error: "Password must contain a lowercase letter" },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(new_password)) {
      return NextResponse.json(
        { error: "Password must contain a number" },
        { status: 400 }
      );
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(new_password)) {
      return NextResponse.json(
        { error: "Password must contain a special character" },
        { status: 400 }
      );
    }

    // Hash new password (10 rounds - optimized for speed while maintaining security)
    const passwordHash = await bcrypt.hash(new_password, 10);

    // Update password
    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        password_hash: passwordHash,
        updated_at: new Date(),
      },

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
});
