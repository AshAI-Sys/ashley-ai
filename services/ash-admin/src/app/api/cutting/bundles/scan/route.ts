/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const qrCode = searchParams.get("qrCode");

    if (!qrCode) {
      
      return NextResponse.json(
        { success: false, error: "QR code is required" },
        { status: 400 }
      );
    }
    const bundle = await prisma.bundle.findUnique({
      where: { qr_code: qrCode },
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            client: {
              select: {
                name: true,
              },
            },
            brand: {
              select: {
                name: true,
              },
            },
          },
        },
        lay: {
          select: {
            id: true,
            marker_name: true,
            lay_length_m: true,
            plies: true,
          },
        },
        _count: {
          select: {
            sewing_runs: true,
          },
        },
      },
    });

    if (!bundle) {
      
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      bundle,
    });
  } catch (error) {
    console.error("Error scanning bundle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to scan bundle" },
      { status: 500 }
    );
  }
});
