import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = db;

// GET /api/bundles/scan?code=BUNDLE-XXX - Scan bundle QR code
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "QR code is required" },
        { status: 400 }
      );
    }

    // Look up bundle by QR code
    const bundle = await prisma.bundle.findFirst({
      where: {
        workspace_id: workspaceId,
        qr_code: code,
      },
      include: {
        lay: {
          include: {
            order: {
              select: {
                order_number: true,
                client: {
                  select: {
                    name: true,
                  },
                },
              },
            },
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

    // Log scan event would go here if BundleScanLog model existed
    console.log(`Bundle ${bundle.qr_code} scanned at Production Floor`);

    return NextResponse.json({
      success: true,
      bundle: {
        id: bundle.id,
        qr_code: bundle.qr_code,
        quantity: bundle.qty,
        status: bundle.status,
        order: bundle.lay?.order,
        size_code: bundle.size_code,
        created_at: bundle.created_at,
      },
  } catch (error: any) {
    console.error("Bundle scan error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
});
