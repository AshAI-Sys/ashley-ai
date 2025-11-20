import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guards";

// GET /api/inventory/lookup?code={barcode/sku/qr}
// Lookup material or product by barcode, SKU, or QR code
export async function GET(req: NextRequest) {
  return requireAuth(req, async (user) => {
    try {
      const { searchParams } = new URL(req.url);
      const code = searchParams.get("code");

      if (!code) {
        return NextResponse.json(
          { success: false, message: "Code parameter is required" },
          { status: 400 }
        );
      }

      const workspaceId = user.workspace_id || user.workspaceId;

      // Search in inventory products first
      const product = await prisma.inventoryProduct.findFirst({
        where: {
          workspace_id: workspaceId,
          OR: [
            { barcode: code },
            { sku: code },
            { qr_code: code },
          ],
        },
        include: {
          category: true,
          brand: true,
          variants: true,
        },
      });

      if (product) {
        return NextResponse.json({
          success: true,
          type: "product",
          product: {
            id: product.id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            qr_code: product.qr_code,
            current_stock: product.current_stock,
            reorder_point: product.reorder_point,
            unit_price: product.unit_price,
            category: product.category?.name,
            brand: product.brand?.name,
            variants: product.variants,
            image_url: product.image_url,
          },
        });
      }

      // Search in raw materials (if you have a materials table)
      // For now, search in bundles as a fallback
      const bundle = await prisma.bundle.findFirst({
        where: {
          workspace_id: workspaceId,
          qr_code: code,
        },
        include: {
          lay: {
            include: {
              order: {
                include: {
                  client: true,
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
          bundle: {
            id: bundle.id,
            bundle_number: bundle.bundle_number,
            qr_code: bundle.qr_code,
            total_pieces: bundle.total_pieces,
            status: bundle.status,
            order_number: bundle.lay?.order?.order_number,
            client_name: bundle.lay?.order?.client?.name,
          },
        });
      }

      // Search in finished units
      const finishedUnit = await prisma.finishedUnit.findFirst({
        where: {
          workspace_id: workspaceId,
          OR: [
            { sku: code },
            { barcode: code },
          ],
        },
      });

      if (finishedUnit) {
        return NextResponse.json({
          success: true,
          type: "finished_unit",
          finished_unit: {
            id: finishedUnit.id,
            sku: finishedUnit.sku,
            barcode: finishedUnit.barcode,
            size: finishedUnit.size,
            color: finishedUnit.color,
            quantity: finishedUnit.quantity,
            status: finishedUnit.status,
            product_image_url: finishedUnit.product_image_url,
            crate_number: finishedUnit.crate_number,
          },
        });
      }

      // Not found
      return NextResponse.json(
        {
          success: false,
          message: `No item found with code: ${code}`,
        },
        { status: 404 }
      );
    } catch (error) {
      console.error("Inventory lookup error:", error);
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  });
}
