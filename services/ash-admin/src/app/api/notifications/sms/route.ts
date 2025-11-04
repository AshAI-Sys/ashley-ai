import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const runtime = "nodejs";

interface SMSRequest {
  to: string;
  message: string;
  type?: "order_update" | "payment_reminder" | "delivery_alert" | "custom";
}

/**
 * Send SMS Notification
 * POST /api/notifications/sms
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SMSRequest = await request.json();
    const { to, message, type = "custom" } = body;

    // Validate phone number (Philippine format)
    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    if (!phoneRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid Philippine phone number format" },
        { status: 400 }
      );
    }

    // Format phone number to international format
    let formattedPhone = to;
    if (to.startsWith("0")) {
      formattedPhone = "+63" + to.slice(1);
    } else if (!to.startsWith("+")) {
      formattedPhone = "+63" + to;
    }

    // SMS Provider Integration (Semaphore, Twilio, etc.)
    // This is a mock implementation - replace with actual SMS API
    const smsResult = await sendSMS(formattedPhone, message, type);

    return NextResponse.json({
      success: true,
      messageId: smsResult.messageId,
      to: formattedPhone,
      status: smsResult.status,
    });
  } catch (error: any) {
    console.error("[SMS API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}

/**
 * Mock SMS sending function
 * Replace with actual SMS provider (Semaphore, Twilio, etc.)
 */
async function sendSMS(phone: string, message: string, type: string) {
  // Check for SMS API credentials
  const apiKey = process.env.SEMAPHORE_API_KEY || process.env.TWILIO_API_KEY;

  if (!apiKey) {
    console.warn("[SMS] No SMS API key configured - running in mock mode");
    return {
      messageId: `mock_${Date.now()}`,
      status: "sent_mock",
    };
  }

  // TODO: Implement actual SMS provider
  // Example for Semaphore (Philippine SMS provider):
  /*
  const response = await fetch("https://api.semaphore.co/api/v4/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.SEMAPHORE_API_KEY,
      number: phone,
      message: message,
      sendername: "AshleyAI",
    }),
  });
  const result = await response.json();
  return {
    messageId: result.message_id,
    status: result.status,
  };
  */

  // Mock response for development
  return {
    messageId: `sms_${Date.now()}`,
    status: "sent",
  };
}
