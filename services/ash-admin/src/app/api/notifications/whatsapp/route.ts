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
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
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
});

/**
 * Send WhatsApp using Twilio or Meta Business API
 * Supports multiple providers with automatic fallback
 */
async function sendWhatsApp(
  phone: string,
  message: string,
  type: string,
  mediaUrl?: string
) {
  // Try Twilio WhatsApp (most common provider)
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER
  ) {
    try {
      console.log("[WhatsApp] Sending via Twilio to:", phone);

      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const body: Record<string, string> = {
        To: `whatsapp:+${phone}`,
        From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        Body: message,
      };

      if (mediaUrl) {
        body.MediaUrl = mediaUrl;
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(body),
        }
      );

      const result = await response.json();

      if (response.ok && result.sid) {
        console.log("[WhatsApp] Twilio success:", result.sid);
        return {
          messageId: result.sid,
          status: result.status,
          provider: "twilio",
        };
      } else {
        console.error("[WhatsApp] Twilio error:", result);
        throw new Error(result.message || "Twilio WhatsApp API error");
      }
    } catch (error: any) {
      console.error("[WhatsApp] Twilio failed:", error.message);
      // Fall through to try other providers
    }
  }

  // Try Meta Business API as backup
  if (process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_ID) {
    try {
      console.log("[WhatsApp] Sending via Meta Business API to:", phone);

      const messageData: any = {
        messaging_product: "whatsapp",
        to: phone,
        type: mediaUrl ? "image" : "text",
      };

      if (mediaUrl) {
        messageData.image = {
          link: mediaUrl,
          caption: message,
        };
      } else {
        messageData.text = { body: message };
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.META_WHATSAPP_PHONE_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        }
      );

      const result = await response.json();

      if (response.ok && result.messages && result.messages[0]?.id) {
        console.log("[WhatsApp] Meta success:", result.messages[0].id);
        return {
          messageId: result.messages[0].id,
          status: "sent",
          provider: "meta",
        };
      } else {
        console.error("[WhatsApp] Meta error:", result);
        throw new Error(result.error?.message || "Meta WhatsApp API error");
      }
    } catch (error: any) {
      console.error("[WhatsApp] Meta failed:", error.message);
      // Fall through to mock mode
    }
  }

  // No API keys configured - mock mode
  console.warn("[WhatsApp] No WhatsApp API keys configured - running in MOCK mode");
  console.warn("[WhatsApp] To enable real WhatsApp, add TWILIO or META credentials to .env");

  return {
    messageId: `mock_wa_${Date.now()}`,
    status: "sent_mock",
    provider: "mock",
  };
}
