/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// Stub API for appearance preferences
// TODO: Implement database storage for appearance preferences

// Force dynamic route (don't pre-render during build)
export const dynamic = "force-dynamic";

export const GET = requireAuth(async (request: NextRequest, _authUser) => {
  try {
    // Return default appearance settings;
    const settings = {
      theme: "system",
      color_scheme: "blue",
      compact_mode: false,
      show_avatars: true,
      font_size: "medium",
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching appearance settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: NextRequest, _authUser) => {
  try {
    const _body = await request.json();
    // TODO: Save to database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
});
