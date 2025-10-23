import { NextRequest, NextResponse } from "next/server";
import { threePLService } from "@/lib/3pl";
import { requireAuth } from "@/lib/auth-middleware";

// POST /api/3pl/cancel - Cancel shipment with 3PL provider
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { provider, booking_id, tracking_number, reason } = body;

    if (!provider || !booking_id) {
      return NextResponse.json(
        { error: "provider and booking_id are required" },
        { status: 400 }
      );
    }
      });

    const result = await threePLService.cancelShipment({
      provider,
      booking_id,
      tracking_number,
      reason,
      });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Cancellation failed" },
        { status: 400 }
      );
    }
      });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error cancelling 3PL shipment:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel shipment",
        details: error.message,
      },
      { status: 500 }
    );
  }
});
