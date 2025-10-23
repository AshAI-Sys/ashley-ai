/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * Mobile Scan API
 * Processes QR/barcode scans and identifies the entity type
 */
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { code, format } = await request.json();

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          type: "unknown",
          message: "No code provided",
        },
        { status: 400 }
      );
    }

    // Try to identify what was scanned based on code format and database lookup

    // 1. Check if it's a Bundle (format: BDL-YYYYMMDD-XXXX or similar)
    if (code.includes("BDL-") || code.includes("BUNDLE-")) {
      const bundle = await prisma.bundle.findFirst({
        where: {
          OR: [{ qr_code: code }, { id: code }],
        },
        include: {
          lay: {
            include: {
              order: {
                select: {
                  order_number: true,
                  client: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      });

      if (bundle) {
        return NextResponse.json({
          success: true,
          type: "bundle",
          data: {
            id: bundle.id,
            bundle_number: bundle.qr_code,
            size: bundle.size_code,
            quantity: bundle.qty,
            status: bundle.status,
            lay_number: bundle.lay?.marker_name,
            order_number: bundle.lay?.order?.order_number,
            client_name: bundle.lay?.order?.client?.name,
          },
          message: `Bundle ${bundle.qr_code} found - ${bundle.qty} pieces`,
        });

    // 2. Check if it's an Order (format: ORD-YYYY-XXXXXX)
    if (code.includes("ORD-") || code.includes("ORDER-")) {
      const order = await prisma.order.findFirst({
        where: {
          order_number: code,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              line_items: true,
            },
          },
        },

      if (order) {
        return NextResponse.json({
          success: true,
          type: "order",
          data: {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            client: order.client,
            brand: order.brand,
            total_amount: order.total_amount,
            line_items_count: order._count.line_items,
          },
          message: `Order ${order.order_number} - ${order.client.name}`,
        });

    // 3. Check if it's a Finished Unit (format: FU-XXXXXX or SKU-XXXXXX)
    if (code.includes("FU-") || code.includes("SKU-")) {
      const finishedUnit = await prisma.finishedUnit.findFirst({
        where: {
          OR: [{ sku: code }, { id: code }],
        },
        include: {
          order: {
            select: {
              order_number: true,
            },
          },
          carton_contents: {
            take: 1,
            include: {
              carton: {
                select: {
                  id: true,
                  carton_no: true,
                },
              },
            },
          },
        },

      if (finishedUnit) {
        return NextResponse.json({
          success: true,
          type: "finished_unit",
          data: {
            id: finishedUnit.id,
            sku: finishedUnit.sku,
            quantity: 1, // FinishedUnit doesn't have quantity field
            warehouse_location: finishedUnit.packed ? "PACKED" : "UNPACKED",
            order_number: finishedUnit.order?.order_number,
            carton: finishedUnit.carton_contents[0]?.carton,
          },
          message: `Finished Unit ${finishedUnit.sku} - 1 piece`,
        });

    // 4. Check if it's a Carton (format: CTN-XXXXXX)
    if (code.includes("CTN-") || code.includes("CARTON-")) {
      const carton = await prisma.carton.findFirst({
        where: {
          OR: [{ qr_code: code }, { id: code }],
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true },
              },
            },
          },
          _count: {
            select: {
              contents: true,
            },
          },
        },

      if (carton) {
        return NextResponse.json({
          success: true,
          type: "carton",
          data: {
            id: carton.id,
            carton_number: String(carton.carton_no),
            weight_kg: carton.actual_weight_kg,
            length_cm: carton.length_cm,
            width_cm: carton.width_cm,
            height_cm: carton.height_cm,
            order_number: carton.order?.order_number,
            client_name: carton.order?.client?.name,
            _count: {
              finished_units: carton._count.contents,
            },
          },
          message: `Carton ${carton.carton_no} - ${carton._count.contents} units`,
        });

    // 5. If nothing matches, try a generic search by ID
    // This handles cases where QR codes might just be UUIDs
    const results = await Promise.all([
      prisma.bundle.findUnique({ where: { id: code } }),
      prisma.order.findUnique({ where: { id: code } }),
      prisma.finishedUnit.findUnique({ where: { id: code } }),
      prisma.carton.findUnique({ where: { id: code } }),
    ]);

    const [bundle, order, finishedUnit, carton] = results;

    if (bundle) {
      return NextResponse.json({
        success: true,
        type: "bundle",
        data: {
          id: bundle.id,
          bundle_number: bundle.qr_code,
          size: bundle.size_code,
          quantity: bundle.qty,
          status: bundle.status,
        },
        message: `Bundle ${bundle.qr_code} found`,
      });

    if (order) {
      return NextResponse.json({
        success: true,
        type: "order",
        data: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
        },
        message: `Order ${order.order_number} found`,
      });

    if (finishedUnit) {
      return NextResponse.json({
        success: true,
        type: "finished_unit",
        data: {
          id: finishedUnit.id,
          sku: finishedUnit.sku,
          quantity: 1,
        },
        message: `Finished Unit ${finishedUnit.sku} found`,
      });

    if (carton) {
      return NextResponse.json({
        success: true,
        type: "carton",
        data: {
          id: carton.id,
          carton_number: String(carton.carton_no),
        },
        message: `Carton ${carton.carton_no} found`,
      });

    // Nothing found
    return NextResponse.json({
      success: false,
      type: "unknown",
      message: `Code "${code}" not found in the system. Please verify and try again.`,
  } catch (error) {
    console.error("Mobile scan error:", error);
    return NextResponse.json(
      {
        success: false,
        type: "unknown",
        message: "An error occurred while processing the scan",
      },
      { status: 500 }
    );
});
