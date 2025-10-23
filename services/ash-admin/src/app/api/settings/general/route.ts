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
        position: true,
        department: true,
        timezone: true,
        language: true,
        date_format: true,
        time_format: true,
      },

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching general settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json();
    const {
      name,
      position,
      department,
      timezone,
      language,
      date_format,
      time_format,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name,
        position,
        department,
        timezone,
        language,
        date_format,
        time_format,
        updated_at: new Date(),
      },

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating general settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
});
