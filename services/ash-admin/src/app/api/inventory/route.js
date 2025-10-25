"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const inventory_manager_1 = require("@/lib/inventory/inventory-manager");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/inventory - Get inventory summary and alerts
exports.GET = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const workspace_id = searchParams.get("workspace_id");
        const action = searchParams.get("action"); // 'summary' | 'alerts' | 'costing' | 'scan'
        if (!workspace_id) {
            return server_1.NextResponse.json({ error: "workspace_id parameter required" }, { status: 400 });
        }
    }
    finally { }
});
switch (action) {
    case "alerts":
        const alerts = await inventory_manager_1.inventoryManager.getStockAlerts(workspace_id);
        return server_1.NextResponse.json({
            success: true,
            alerts,
            total: alerts.length,
        });
    case "costing":
        const costings = await inventory_manager_1.inventoryManager.calculateMaterialCost(workspace_id);
        return server_1.NextResponse.json({
            success: true,
            material_costings: costings,
        });
    case "scan":
        const code = searchParams.get("code");
        const type = searchParams.get("type"); // 'barcode' | 'rfid'
        if (!code) {
            return server_1.NextResponse.json({ error: "code parameter required for scan" }, { status: 400 });
        }
        const scanned = type === "rfid"
            ? await inventory_manager_1.inventoryManager.scanRFID(code)
            : await inventory_manager_1.inventoryManager.scanBarcode(code);
        if (!scanned) {
            return server_1.NextResponse.json({ error: "Material not found", code }, { status: 404 });
        }
        return server_1.NextResponse.json({
            success: true,
            material: scanned,
            scan_type: type || "barcode",
        });
    case "summary":
    default:
        const summary = await inventory_manager_1.inventoryManager.getInventorySummary(workspace_id);
        return server_1.NextResponse.json({
            success: true,
            summary,
        });
}
try { }
catch (error) {
    console.error("Inventory API error:", error);
    return server_1.NextResponse.json({ error: "Failed to process inventory request", details: error.message }, { status: 500 });
}
;
// POST /api/inventory - Create material or update stock
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const body = await req.json();
        const { action, ...data } = body;
        switch (action) {
            case "add_material":
                const material = await inventory_manager_1.inventoryManager.addMaterial(data);
                return server_1.NextResponse.json({
                    success: true,
                    material,
                    message: "Material added successfully",
                });
            case "update_stock":
                const { material_id, quantity_change, transaction_type } = data;
                if (!material_id ||
                    quantity_change === undefined ||
                    !transaction_type) {
                    return server_1.NextResponse.json({
                        error: "material_id, quantity_change, and transaction_type are required",
                    }, { status: 400 });
                }
                await inventory_manager_1.inventoryManager.updateStock(material_id, quantity_change, transaction_type);
                return server_1.NextResponse.json({
                    success: true,
                    message: "Stock updated successfully",
                });
            case "create_supplier":
                const supplier = await inventory_manager_1.inventoryManager.createSupplier(data);
                return server_1.NextResponse.json({
                    success: true,
                    supplier,
                    message: "Supplier created successfully",
                });
            case "create_po":
                const po = await inventory_manager_1.inventoryManager.createPurchaseOrder(data);
                return server_1.NextResponse.json({
                    success: true,
                    purchase_order: po,
                    message: "Purchase order created successfully",
                });
            case "receive_po":
                const { po_id, received_items } = data;
                if (!po_id || !received_items) {
                    return server_1.NextResponse.json({ error: "po_id and received_items are required" }, { status: 400 });
                }
                await inventory_manager_1.inventoryManager.receivePurchaseOrder(po_id, received_items);
                return server_1.NextResponse.json({
                    success: true,
                    message: "Purchase order received and stock updated",
                });
            case "generate_barcode":
                const { material_id: matId } = data;
                if (!matId) {
                    return server_1.NextResponse.json({ error: "material_id is required" }, { status: 400 });
                }
                const barcode = await inventory_manager_1.inventoryManager.generateBarcode(matId);
                return server_1.NextResponse.json({
                    success: true,
                    barcode,
                    material_id: matId,
                });
            default:
                return server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
        try { }
        catch (error) {
            console.error("Inventory operation error:", error);
            return server_1.NextResponse.json({ error: "Failed to complete operation", details: error.message }, { status: 500 });
        }
    }
    finally { }
});
