/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = new PrismaClient();

// Force dynamic route (don't pre-render during build)
export const dynamic = "force-dynamic";

export const GET = requireAuth(async (_request: NextRequest, authUser) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        avatar_url: true,
      },
    });

    if (!user) {
      
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return with backwards compatible fields
    return NextResponse.json({
      ...user,
      name: `${user.first_name} ${user.last_name}`,
      phone: user.phone_number,
      bio: '', // Bio doesn't exist in schema
    });
  } catch (error) {
    console.error("Error fetching account settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    // Check if email is being changed
    let emailVerificationRequired = false;
    if (email) {
      
      const currentUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { email: true },
      });

      if (currentUser && currentUser.email !== email) {
        // Check if email is already taken with workspace
        }
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            workspace_id: authUser.workspaceId,
          },
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

    // Split name into first and last if provided
    if (name) {

      const nameParts = name.split(' ');
      updateData.first_name = nameParts[0] || '';
      updateData.last_name = nameParts.slice(1).join(' ') || '';
    }

    if (email) {
      updateData.email = email;
    }

    if (phone !== undefined) {
      updateData.phone_number = phone;
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      email_verification_required: emailVerificationRequired,
    });
  } catch (error) {
    console.error("Error updating account settings:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
});