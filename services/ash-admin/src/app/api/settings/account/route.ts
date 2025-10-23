import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = new PrismaClient();

// Force dynamic route (don't pre-render during build)
export const dynamic = "force-dynamic";

export const GET = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        name: true,
        email: true,
        phone: true,
        bio: true,
        avatar_url: true,
      },
      });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching account settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json();
    const { name, email, phone, bio } = body;

    // Check if email is being changed
    let emailVerificationRequired = false;
    if (email) {
      const currentUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { email: true },
      });

      if (currentUser && currentUser.email !== email) {
        // Check if email is already taken
        const existingUser = await prisma.user.findUnique({
          where: { email },
      });

        if (existingUser && existingUser.id !== authUser.id) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 400 }
          );
        }

        emailVerificationRequired = true;
      }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (name) updateData.name = name;
    if (email) {
      updateData.email = email;
      if (emailVerificationRequired) {
        updateData.email_verified = false;
        // TODO: Send verification email
      });
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      email_verification_required: emailVerificationRequired,
  } catch (error) {
    console.error("Error updating account settings:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
