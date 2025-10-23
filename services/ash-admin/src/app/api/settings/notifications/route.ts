import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// Stub API for notification preferences
// TODO: Implement database storage for notification preferences

// Force dynamic route (don't pre-render during build)
export const dynamic = "force-dynamic";

export const GET = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Return default notification settings;
    const settings = {
      orders: { email: true, sms: false, push: true, in_app: true },
      production: { email: true, sms: false, push: true, in_app: true },
      quality: { email: true, sms: true, push: true, in_app: true },
      delivery: { email: true, sms: false, push: true, in_app: true },
      finance: { email: true, sms: false, push: false, in_app: true },
      hr: { email: false, sms: false, push: false, in_app: true },
      maintenance: { email: true, sms: false, push: true, in_app: true },
      system: { email: true, sms: false, push: true, in_app: true },
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json();
    // TODO: Save to database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
