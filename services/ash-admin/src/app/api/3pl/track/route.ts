/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { threePLService } from "@/lib/3pl";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/3pl/track?provider=LALAMOVE&tracking_number=xxx - Track shipment
export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");
    const tracking_number = searchParams.get("tracking_number");

    if (!provider || !tracking_number) {
      }
      return NextResponse.json(
        { error: "provider and tracking_number are required" },
        { status: 400 }
      );
    }
    const tracking = await threePLService.trackShipment(
      provider as any,
      tracking_number
    );

    return NextResponse.json(tracking);
  } catch (error: any) {
    console.error("Error tracking 3PL shipment:", error);
    return NextResponse.json(
      {
        error: "Failed to track shipment",
        details: error.message,
      },
      { status: 500 }
    );
  }
  });
});
