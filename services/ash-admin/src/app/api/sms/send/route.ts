import { NextRequest, NextResponse } from "next/server";
import { smsService } from "@/lib/sms";
import { requireAuth } from "@/lib/auth-middleware";

// POST /api/sms/send - Send SMS
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { to, message, template, variables, provider } = body;

    // Validate input
    if (!to) {
      return NextResponse.json(
        { error: "Recipient phone number is required" },
        { status: 400 }
      );
    }
      });

    // Format and validate phone number
    const formattedPhone = smsService.formatPhoneNumber(to);
    if (!smsService.isValidPhoneNumber(formattedPhone)) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number format. Use Philippine format: 09171234567",
        },
        { status: 400 }
      );
    }
      });

    let result;

    // Send using template
    if (template && variables) {
      result = await smsService.sendTemplatedSMS(
        formattedPhone,
        template,
        variables
      );
    }
    // Send direct message
    else if (message) {
      result = await smsService.sendSMS({
        to: formattedPhone,
        message,
        provider,
      }
    } else {
      return NextResponse.json(
        { error: "Either message or template with variables is required" },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send SMS" },
        { status: 500 }
      );
    }
      });

    return NextResponse.json({
      success: true,
      message_id: result.message_id,
      provider: result.provider,
      status: result.status,
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { error: "Failed to send SMS", details: error.message },
      { status: 500 }
    );
  }
      });

// GET /api/sms/send - Get SMS provider status
export async function GET() {
  try {
    const status = smsService.getProviderStatus();
    const balances = await smsService.getBalances();

    return NextResponse.json({
      providers: status,
      balances,
      configured: Object.values(status).some(v => v === true),
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get SMS status", details: error.message },
      { status: 500 }
    );
  }
});
