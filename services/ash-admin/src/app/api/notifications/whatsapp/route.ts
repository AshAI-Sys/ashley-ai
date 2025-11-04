import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const runtime = "nodejs";

interface WhatsAppRequest {
  to: string;
  message: string;
  type?: "order_update" | "payment_reminder" | "delivery_alert" | "custom";
  mediaUrl?: string;
}

/**
 * Send WhatsApp Notification
 * POST /api/notifications/whatsapp
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: WhatsAppRequest = await request.json();
    const { to, message, type = "custom", mediaUrl } = body;

    // Validate phone number (Philippine format)
    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    if (!phoneRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid Philippine phone number format" },
        { status: 400 }
      );
    }

    // Format phone number to international format (WhatsApp format)
    let formattedPhone = to;
    if (to.startsWith("0")) {
      formattedPhone = "63" + to.slice(1);
    } else if (to.startsWith("+63")) {
      formattedPhone = to.slice(1);
    } else if (!to.startsWith("63")) {
      formattedPhone = "63" + to;
    }

    // WhatsApp Provider Integration (Twilio, Meta Business API, etc.)
    const whatsappResult = await sendWhatsApp(formattedPhone, message, type, mediaUrl);

    return NextResponse.json({
      success: true,
      messageId: whatsappResult.messageId,
      to: `+${formattedPhone}`,
      status: whatsappResult.status,
    });
  } catch (error: any) {
    console.error("[WhatsApp API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}

/**
 * Mock WhatsApp sending function
 * Replace with actual WhatsApp provider (Twilio, Meta Business API, etc.)
 */
async function sendWhatsApp(
  phone: string,
  message: string,
  type: string,
  mediaUrl?: string
) {
  // Check for WhatsApp API credentials
  const apiKey = process.env.TWILIO_WHATSAPP_KEY || process.env.META_WHATSAPP_TOKEN;

  if (!apiKey) {
    console.warn("[WhatsApp] No WhatsApp API key configured - running in mock mode");
    return {
      messageId: `mock_wa_${Date.now()}`,
      status: "sent_mock",
    };
  }

  // TODO: Implement actual WhatsApp provider
  // Example for Twilio WhatsApp:
  /*
  const twilioClient = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const messageData: any = {
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:+${phone}`,
    body: message,
  };

  if (mediaUrl) {
    messageData.mediaUrl = [mediaUrl];
  }

  const result = await twilioClient.messages.create(messageData);

  return {
    messageId: result.sid,
    status: result.status,
  };
  */

  // Mock response for development
  return {
    messageId: `wa_${Date.now()}`,
    status: "sent",
  };
}
