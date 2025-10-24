/* eslint-disable */
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
        first_name: true,
        last_name: true,
        email: true,
        position: true,
        department: true,
      },
    });

    if (!user) {
      }
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return with backwards compatible name field
    return NextResponse.json({
      ...user,
      name: `${user.first_name} ${user.last_name}`,
      timezone: 'UTC',
      language: 'en',
      date_format: 'YYYY-MM-DD',
      time_format: '24h',
    });
  } catch (error) {
    console.error("Error fetching general settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json();
    const {
      name,
      position,
      department,
    } = body;

    // Split name into first and last
    const nameParts = name?.split(' ') || [];
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        first_name,
        last_name,
        position,
        department,
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
  }