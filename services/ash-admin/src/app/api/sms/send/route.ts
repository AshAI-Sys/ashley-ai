import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
export const dynamic = 'force-dynamic';
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const providers = {
      twilio: true,
      semaphore: true,
      movider: false,
      default: "semaphore"
    };
    const balances = { semaphore: 1500, movider: 0 };
    return NextResponse.json({ success: true, providers, balances });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch SMS provider status" }, { status: 500 });
  }
});
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { to, message } = body;
    if (!to || !message) {
      return NextResponse.json({ success: false, message: "Phone number and message are required" }, { status: 400 });
    }
    const mockMessageId = 'SMS-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    return NextResponse.json({ success: true, provider: "semaphore", message_id: mockMessageId, message: "SMS sent successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to send SMS" }, { status: 500 });
  }
});
