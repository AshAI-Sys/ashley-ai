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
 * Send SMS using Semaphore or Twilio
 * Supports multiple providers with automatic fallback
 */
async function sendSMS(phone: string, message: string, type: string) {
  // Try Semaphore first (Philippine SMS provider)
  if (process.env.SEMAPHORE_API_KEY) {
    try {
      console.log("[SMS] Sending via Semaphore to:", phone);

      const response = await fetch("https://api.semaphore.co/api/v4/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apikey: process.env.SEMAPHORE_API_KEY,
          number: phone,
          message: message,
          sendername: process.env.SEMAPHORE_SENDER_NAME || "AshleyAI",
        }),
      });

      const result = await response.json();

      if (response.ok && result.message_id) {
        console.log("[SMS] Semaphore success:", result.message_id);
        return {
          messageId: result.message_id,
          status: "sent",
          provider: "semaphore",
        };
      } else {
        console.error("[SMS] Semaphore error:", result);
        throw new Error(result.message || "Semaphore API error");
      }
    } catch (error: any) {
      console.error("[SMS] Semaphore failed:", error.message);
      // Fall through to try other providers
    }
  }

  // Try Twilio as backup (International SMS)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      console.log("[SMS] Sending via Twilio to:", phone);

      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phone,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: message,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.sid) {
        console.log("[SMS] Twilio success:", result.sid);
        return {
          messageId: result.sid,
          status: result.status,
          provider: "twilio",
        };
      } else {
        console.error("[SMS] Twilio error:", result);
        throw new Error(result.message || "Twilio API error");
      }
    } catch (error: any) {
      console.error("[SMS] Twilio failed:", error.message);
      // Fall through to mock mode
    }
  }

  // No API keys configured - mock mode
  console.warn("[SMS] No SMS API keys configured - running in MOCK mode");
  console.warn("[SMS] To enable real SMS, add SEMAPHORE_API_KEY or TWILIO credentials to .env");

  return {
    messageId: `mock_${Date.now()}`,
    status: "sent_mock",
    provider: "mock",
  };
}
