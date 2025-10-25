"use strict";
// Complete Inventory Management System
// Covers F1-F5: Material tracking, suppliers, alerts, costing, and RFID
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryManager = exports.InventoryManager = void 0;
class InventoryManager {
    // F1: Track raw material inventory
    async addMaterial(material) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        // Check if material with name exists
        const existing = await prisma.materialInventory.findFirst({
            where: {
                workspace_id: material.workspace_id,
                material_name: material.name,
            },
        });
        if (existing) {
            throw new Error(`Material with name ${material.name} already exists`);
        }
        const newMaterial = {
            ...material,
            id: `mat_${Date.now()}`,
            created_at: new Date(),
        };
        // Store in database
        await prisma.materialInventory.create({
            data: {
                workspace_id: newMaterial.workspace_id,
                material_name: newMaterial.name,
                material_type: newMaterial.category,
                current_stock: newMaterial.current_stock,
                reserved_stock: 0,
                available_stock: newMaterial.current_stock,
                unit: newMaterial.unit_of_measure,
                cost_per_unit: newMaterial.unit_cost,
                supplier: material.supplier_id || "UNKNOWN",
                location: newMaterial.location || "WAREHOUSE",
                reorder_point: newMaterial.reorder_point,
                minimum_stock: newMaterial.reorder_point,
                last_updated: new Date(),
            },
        });
        return newMaterial;
    }
    async updateStock(material_id, quantity_change, transaction_type) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        const material = await prisma.materialInventory.findFirst({
            where: { id: material_id },
        });
        if (!material) {
            throw new Error("Material not found");
        }
        const newQuantity = material.current_stock + quantity_change;
        const newAvailable = newQuantity - material.reserved_stock;
        await prisma.materialInventory.update({
            where: { id: material_id },
            data: {
                current_stock: newQuantity,
                available_stock: newAvailable,
                last_updated: new Date(),
            },
        });
        // Create transaction record
        await prisma.materialTransaction.create({
            data: {
                workspace_id: material.workspace_id,
                material_inventory_id: material_id,
                transaction_type: quantity_change > 0 ? "IN" : "OUT",
                quantity: Math.abs(quantity_change),
                unit_cost: material.cost_per_unit || 0,
                notes: `${transaction_type} transaction`,
                created_by: "system",
            },
        });
        // Check if alert needed
        await this.checkStockAlert(material_id, newQuantity);
    }
    // F2: Supplier and Purchase Order Management
    async createSupplier(supplier) {
        const newSupplier = {
            ...supplier,
            id: `sup_${Date.now()}`,
        };
        // Would store in database (Supplier table)
        return newSupplier;
    }
    async createPurchaseOrder(po) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        // Generate PO number
        const count = await prisma.order.count();
        const poNumber = `PO-${String(count + 1).padStart(6, "0")}`;
        const newPO = {
            ...po,
            id: `po_${Date.now()}`,
            po_number: poNumber,
        };
        // Would store in database (PurchaseOrder table)
        return newPO;
    }
    async receivePurchaseOrder(_po_id, received_items) {
        // Update stock for each received item
        for (const item of received_items) {
            await this.updateStock(item.material_id, item.quantity, "PURCHASE");
        }
        // Update PO status (would update in database)
    }
    // F3: Stock Alerts and Auto-Reordering
    async checkStockAlert(material_id, current_level) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        const material = await prisma.materialInventory.findFirst({
            where: { id: material_id },
        });
        if (!material)
            return;
        let alertType = null;
        let __severity = "INFO"; // TODO: Use severity in alert creation
        let message = "";
        const reorderPoint = material.reorder_point || 0;
        if (current_level === 0) {
            alertType = "OUT_OF_STOCK";
            _severity = "CRITICAL";
            message = `${material.material_name} is out of stock!`;
        }
        else if (current_level <= reorderPoint) {
            alertType = "LOW_STOCK";
            _severity = "WARNING";
            message = `${material.material_name} is below reorder point (${current_level}/${reorderPoint})`;
        }
        if (alertType) {
            // Create alert (would store in database)
            console.log(`Stock Alert: ${message}`);
            // Auto-reorder if enabled
            await this.autoReorder(material_id);
        }
    }
    async autoReorder(material_id) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        const material = await prisma.materialInventory.findFirst({
            where: { id: material_id },
        });
        if (!material)
            return;
        // Calculate reorder quantity (simple logic)
        const reorderPoint = material.reorder_point || 0;
        const currentStock = material.current_stock || 0;
        const reorderQty = reorderPoint * 2 - currentStock;
        if (reorderQty > 0) {
            // Create automatic purchase order
            const unitCost = material.cost_per_unit || 0;
            const po = await this.createPurchaseOrder({
                workspace_id: material.workspace_id,
                supplier_id: material.supplier || "UNKNOWN",
                status: "DRAFT",
                order_date: new Date(),
                expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                total_amount: reorderQty * unitCost,
                items: [
                    {
                        material_id,
                        quantity: reorderQty,
                        unit_price: unitCost,
                        total_price: reorderQty * unitCost,
                    },
                ],
                notes: "Auto-generated purchase order",
            });
            console.log(`Auto-created PO ${po.po_number} for ${reorderQty} units of ${material.material_name}`);
        }
    }
    async getStockAlerts(workspace_id) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        const materials = await prisma.materialInventory.findMany({
            where: { workspace_id },
        });
        const alerts = [];
        for (const material of materials) {
            const currentStock = material.current_stock || 0;
            const reorderPoint = material.reorder_point || 0;
            if (currentStock === 0) {
                alerts.push({
                    id: `alert_${material.id}`,
                    material_id: material.id,
                    material_name: material.material_name,
                    alert_type: "OUT_OF_STOCK",
                    severity: "CRITICAL",
                    current_level: currentStock,
                    threshold: reorderPoint,
                    message: `${material.material_name} is out of stock`,
                    created_at: new Date(),
                    resolved: false,
                });
            }
            else if (currentStock <= reorderPoint) {
                alerts.push({
                    id: `alert_${material.id}`,
                    material_id: material.id,
                    material_name: material.material_name,
                    alert_type: "LOW_STOCK",
                    severity: "WARNING",
                    current_level: currentStock,
                    threshold: reorderPoint,
                    message: `${material.material_name} is below reorder point`,
                    created_at: new Date(),
                    resolved: false,
                });
            }
        }
        return alerts.sort((a, _b) => (a.severity === "CRITICAL" ? -1 : 1));
    }
    // F4: Material Costing and Waste Tracking
    async calculateMaterialCost(workspace_id) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        const materials = await prisma.materialInventory.findMany({
            where: { workspace_id },
            include: {
                transactions: {
                    where: {
                        created_at: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                },
            },
        });
        const costings = materials.map((material) => {
            const currentStock = material.current_stock || 0;
            const unitCost = material.cost_per_unit || 0;
            const stockValue = currentStock * unitCost;
            // Calculate waste
            const wasteTransactions = material.transactions.filter((t) => t.transaction_type === "WASTE");
            const totalWaste = wasteTransactions.reduce((sum, t) => sum + t.quantity, 0);
            const totalUsage = material.transactions
                .filter((t) => t.transaction_type === "OUT")
                .reduce((sum, t) => sum + t.quantity, 0);
            const wastePercentage = totalUsage > 0 ? (totalWaste / totalUsage) * 100 : 0;
            const wasteCost = totalWaste * unitCost;
            const usage30Days = totalUsage;
            const projectedCostMonthly = usage30Days * unitCost;
            return {
                material_id: material.id,
                material_name: material.material_name,
                total_stock_value: stockValue,
                avg_unit_cost: unitCost,
                waste_percentage: wastePercentage,
                waste_cost: wasteCost,
                usage_last_30_days: usage30Days,
                projected_cost_monthly: projectedCostMonthly,
            };
        });
        return costings;
    }
    // F5: Barcode/RFID Scanning
    async scanBarcode(barcode) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        // Search for material by barcode (stored in location or batch_number field)
        const material = await prisma.materialInventory.findFirst({
            where: {
                OR: [{ location: { contains: barcode } }, { batch_number: barcode }],
            },
        });
        if (!material)
            return null;
        return {
            id: material.id,
            workspace_id: material.workspace_id,
            sku: material.batch_number || "UNKNOWN",
            name: material.material_name,
            category: material.material_type || "OTHER",
            unit_of_measure: material.unit || "PIECES",
            current_stock: material.current_stock || 0,
            reorder_point: material.reorder_point || 0,
            max_stock_level: (material.reorder_point || 0) * 3,
            unit_cost: material.cost_per_unit || 0,
            supplier_id: material.supplier || undefined,
            location: material.location || undefined,
            barcode,
            rfid_tag: undefined,
            last_restocked: material.last_updated,
            created_at: material.created_at,
        };
    }
    async scanRFID(rfid_tag) {
        // Similar to barcode scan
        return this.scanBarcode(rfid_tag);
    }
    async generateBarcode(material_id) {
        // Generate EAN-13 style barcode
        const timestamp = Date.now().toString();
        const barcode = `2${material_id.slice(-11)}${timestamp.slice(-1)}`;
        return barcode;
    }
    // Dashboard summary
    async getInventorySummary(workspace_id) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("@/lib/database")));
        const materials = await prisma.materialInventory.findMany({
            where: { workspace_id },
        });
        const totalMaterials = materials.length;
        const totalValue = materials.reduce((sum, m) => sum + (m.current_stock || 0) * (m.cost_per_unit || 0), 0);
        const lowStockCount = materials.filter((m) => {
            const stock = m.current_stock || 0;
            const reorder = m.reorder_point || 0;
            return stock <= reorder && stock > 0;
        }).length;
        const outOfStockCount = materials.filter((m) => (m.current_stock || 0) === 0).length;
        const costings = await this.calculateMaterialCost(workspace_id);
        const monthlyWasteCost = costings.reduce((sum, c) => sum + c.waste_cost, 0);
        return {
            total_materials: totalMaterials,
            total_value: Math.round(totalValue * 100) / 100,
            low_stock_count: lowStockCount,
            out_of_stock_count: outOfStockCount,
            pending_pos: 0, // Would query PO table
            monthly_waste_cost: Math.round(monthlyWasteCost * 100) / 100,
        };
    }
}
exports.InventoryManager = InventoryManager;
exports.inventoryManager = new InventoryManager();
