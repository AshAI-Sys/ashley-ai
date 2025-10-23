import { NextRequest, NextResponse } from "next/server";
import { inventoryManager } from "@/lib/inventory/inventory-manager";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/inventory - Get inventory summary and alerts
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const workspace_id = searchParams.get("workspace_id");
    const action = searchParams.get("action"); // 'summary' | 'alerts' | 'costing' | 'scan'

    if (!workspace_id) {
      return NextResponse.json(
        { error: "workspace_id parameter required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "alerts":
        const alerts = await inventoryManager.getStockAlerts(workspace_id);
        return NextResponse.json({
          success: true,
          alerts,
          total: alerts.length,
        });

      case "costing":
        const costings =
          await inventoryManager.calculateMaterialCost(workspace_id);
        return NextResponse.json({
          success: true,
          material_costings: costings,
        });

      case "scan":
        const code = searchParams.get("code");
        const type = searchParams.get("type"); // 'barcode' | 'rfid'

        if (!code) {
          return NextResponse.json(
            { error: "code parameter required for scan" },
            { status: 400 }
          );
        }

        const scanned =
          type === "rfid"
            ? await inventoryManager.scanRFID(code)
            : await inventoryManager.scanBarcode(code);

        if (!scanned) {
          return NextResponse.json(
            { error: "Material not found", code },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          material: scanned,
          scan_type: type || "barcode",
        });

      case "summary":
      default:
        const summary =
          await inventoryManager.getInventorySummary(workspace_id);
        return NextResponse.json({
          success: true,
          summary,
        });
    }
  } catch (error: any) {
    console.error("Inventory API error:", error);
    return NextResponse.json(
      { error: "Failed to process inventory request", details: error.message },
      { status: 500 }
    );
  }
});

// POST /api/inventory - Create material or update stock
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case "add_material":
        const material = await inventoryManager.addMaterial(data);
        return NextResponse.json({
          success: true,
          material,
          message: "Material added successfully",
        });

      case "update_stock":
        const { material_id, quantity_change, transaction_type } = data;

        if (
          !material_id ||
          quantity_change === undefined ||
          !transaction_type
        ) {
          return NextResponse.json(
            {
              error:
                "material_id, quantity_change, and transaction_type are required",
            },
            { status: 400 }
          );
        }

        await inventoryManager.updateStock(
          material_id,
          quantity_change,
          transaction_type
        );

        return NextResponse.json({
          success: true,
          message: "Stock updated successfully",
        });

      case "create_supplier":
        const supplier = await inventoryManager.createSupplier(data);
        return NextResponse.json({
          success: true,
          supplier,
          message: "Supplier created successfully",
        });

      case "create_po":
        const po = await inventoryManager.createPurchaseOrder(data);
        return NextResponse.json({
          success: true,
          purchase_order: po,
          message: "Purchase order created successfully",
        });

      case "receive_po":
        const { po_id, received_items } = data;

        if (!po_id || !received_items) {
          return NextResponse.json(
            { error: "po_id and received_items are required" },
            { status: 400 }
          );
        }

        await inventoryManager.receivePurchaseOrder(po_id, received_items);

        return NextResponse.json({
          success: true,
          message: "Purchase order received and stock updated",
        });

      case "generate_barcode":
        const { material_id: matId } = data;

        if (!matId) {
          return NextResponse.json(
            { error: "material_id is required" },
            { status: 400 }
          );
        }

        const barcode = await inventoryManager.generateBarcode(matId);

        return NextResponse.json({
          success: true,
          barcode,
          material_id: matId,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Inventory operation error:", error);
    return NextResponse.json(
      { error: "Failed to complete operation", details: error.message },
      { status: 500 }
    );
  }
};
