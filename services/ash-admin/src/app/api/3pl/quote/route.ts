/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { threePLService } from "@/lib/3pl";
import { requireAuth } from "@/lib/auth-middleware";

// POST /api/3pl/quote - Get shipping quotes from 3PL providers
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { provider, shipment } = body;

    if (!shipment) {
      return NextResponse.json(
        { error: "shipment details are required" },
        { status: 400 }
      );
    }

    // Validate required shipment fields
    if (
      !shipment.pickup_address ||
      !shipment.delivery_address ||
      !shipment.package_details
    ) {
      return NextResponse.json(
        {
          error:
            "pickup_address, delivery_address, and package_details are required",
        },
        { status: 400 }
      );
    }

    // Get quotes
    const quotes = await threePLService.getQuotes({
      provider,
      shipment,
      });

    // Get comparison
    const comparison = await threePLService.compareProviders(shipment);

    return NextResponse.json({
      quotes,
      recommended: comparison.cheapest,
      cheapest: comparison.cheapest,
      fastest: comparison.fastest,
  } catch (error: any) {
    console.error("Error getting 3PL quotes:", error);
    return NextResponse.json(
      {
        error: "Failed to get shipping quotes",
        details: error.message,
      },
      { status: 500 }
    );
  }
});