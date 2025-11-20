import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/inventory/lookup?code={barcode/sku/qr}
// Lookup material or product by barcode, SKU, or QR code
export const GET = requireAuth(async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const code = searchParams.get("code");

      if (!code) {
        return NextResponse.json(
          { success: false, message: "Code parameter is required" },
          { status: 400 }
        );
      }

      const workspaceId = user.workspaceId;

      // Search in inventory products first
      const product = await prisma.inventoryProduct.findFirst({
        where: {
          workspace_id: workspaceId,
          base_sku: code,
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
            base_sku: product.base_sku,
            description: product.description,
            category: product.category?.name,
            brand: product.brand?.name,
            variants: product.variants,
            photo_url: product.photo_url,
            is_active: product.is_active,
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
            qr_code: bundle.qr_code,
            size_code: bundle.size_code,
            qty: bundle.qty,
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
          sku: code,
        },
      });

      if (finishedUnit) {
        return NextResponse.json({
          success: true,
          type: "finished_unit",
          finished_unit: {
            id: finishedUnit.id,
            sku: finishedUnit.sku,
            size_code: finishedUnit.size_code,
            color: finishedUnit.color,
            category: finishedUnit.category,
            brand: finishedUnit.brand,
            product_image_url: finishedUnit.product_image_url,
            crate_number: finishedUnit.crate_number,
            price: finishedUnit.price?.toString(),
            sale_price: finishedUnit.sale_price?.toString(),
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
