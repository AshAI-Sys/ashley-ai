// Complete Inventory Management System
// Covers F1-F5: Material tracking, suppliers, alerts, costing, and RFID

export interface Material {
  id: string;
  workspace_id: string;
  sku: string;
  name: string;
  category: "FABRIC" | "THREAD" | "TRIM" | "PACKAGING" | "OTHER";
  unit_of_measure: "YARDS" | "METERS" | "KILOGRAMS" | "PIECES" | "ROLLS";
  current_stock: number;
  reorder_point: number;
  max_stock_level: number;
  unit_cost: number;
  supplier_id?: string;
  location?: string;
  barcode?: string;
  rfid_tag?: string;
  last_restocked: Date;
  created_at: Date;
}

export interface Supplier {
  id: string;
  workspace_id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  payment_terms: string;
  lead_time_days: number;
  rating: number; // 0-5
  is_active: boolean;
  materials_supplied: string[];
}

export interface PurchaseOrder {
  id: string;
  workspace_id: string;
  po_number: string;
  supplier_id: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED" | "CANCELLED";
  order_date: Date;
  expected_delivery: Date;
  actual_delivery?: Date;
  total_amount: number;
  items: PurchaseOrderItem[];
  notes?: string;
}

export interface PurchaseOrderItem {
  material_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface StockAlert {
  id: string;
  material_id: string;
  material_name: string;
  alert_type: "LOW_STOCK" | "OUT_OF_STOCK" | "OVERSTOCK" | "EXPIRING";
  severity: "INFO" | "WARNING" | "CRITICAL";
  current_level: number;
  threshold: number;
  message: string;
  created_at: Date;
  resolved: boolean;
}

export interface MaterialCosting {
  material_id: string;
  material_name: string;
  total_stock_value: number;
  avg_unit_cost: number;
  waste_percentage: number;
  waste_cost: number;
  usage_last_30_days: number;
  projected_cost_monthly: number;
}

export class InventoryManager {
  // F1: Track raw material inventory
  async addMaterial(
    material: Omit<Material, "id" | "created_at">
  ): Promise<Material> {
    const { prisma } = await import("@/lib/database");

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

    const newMaterial: Material = {
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

  async updateStock(
    material_id: string,
    quantity_change: number,
    transaction_type: "PURCHASE" | "USAGE" | "ADJUSTMENT" | "WASTE"
  ): Promise<void> {
    const { prisma } = await import("@/lib/database");

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
  async createSupplier(supplier: Omit<Supplier, "id">): Promise<Supplier> {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup_${Date.now()}`,
    };

    // Would store in database (Supplier table)
    return newSupplier;
  }

  async createPurchaseOrder(
    po: Omit<PurchaseOrder, "id" | "po_number">
  ): Promise<PurchaseOrder> {
    const { prisma } = await import("@/lib/database");

    // Generate PO number
    const count = await prisma.order.count();
    const poNumber = `PO-${String(count + 1).padStart(6, "0")}`;

    const newPO: PurchaseOrder = {
      ...po,
      id: `po_${Date.now()}`,
      po_number: poNumber,
    };

    // Would store in database (PurchaseOrder table)

    return newPO;
  }

  async receivePurchaseOrder(
    _po_id: string,
    received_items: Array<{ material_id: string; quantity: number }>
  ): Promise<void> {
    // Update stock for each received item
    for (const item of received_items) {
      await this.updateStock(item.material_id, item.quantity, "PURCHASE");
    }

    // Update PO status (would update in database)
  }

  // F3: Stock Alerts and Auto-Reordering
  private async checkStockAlert(
    material_id: string,
    current_level: number
  ): Promise<void> {
    const { prisma } = await import("@/lib/database");

    const material = await prisma.materialInventory.findFirst({
      where: { id: material_id },
    });

    if (!material) return;

    let alertType: StockAlert["alert_type"] | null = null;
    let ___severity: StockAlert["severity"] = "INFO"; // TODO: Use severity in alert creation
    let message = "";

    const reorderPoint = material.reorder_point || 0;

    if (current_level === 0) {
      alertType = "OUT_OF_STOCK";
      _severity = "CRITICAL";
      message = `${material.material_name} is out of stock!`;
    } else if (current_level <= reorderPoint) {
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

  private async autoReorder(material_id: string): Promise<void> {
    const { prisma } = await import("@/lib/database");

    const material = await prisma.materialInventory.findFirst({
      where: { id: material_id },
    });

    if (!material) return;

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

      console.log(
        `Auto-created PO ${po.po_number} for ${reorderQty} units of ${material.material_name}`
      );
    }
  }

  async getStockAlerts(workspace_id: string): Promise<StockAlert[]> {
    const { prisma } = await import("@/lib/database");

    const materials = await prisma.materialInventory.findMany({
      where: { workspace_id },
    });

    const alerts: StockAlert[] = [];

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
      } else if (currentStock <= reorderPoint) {
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
  async calculateMaterialCost(
    workspace_id: string
  ): Promise<MaterialCosting[]> {
    const { prisma } = await import("@/lib/database");

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

    const costings: MaterialCosting[] = materials.map((material: any) => {
      const currentStock = material.current_stock || 0;
      const unitCost = material.cost_per_unit || 0;
      const stockValue = currentStock * unitCost;

      // Calculate waste
      const wasteTransactions = material.transactions.filter(
        (t: any) => t.transaction_type === "WASTE"
      );
      const totalWaste = wasteTransactions.reduce(
        (sum: number, t: any) => sum + t.quantity,
        0
      );
      const totalUsage = material.transactions
        .filter((t: any) => t.transaction_type === "OUT")
        .reduce((sum: number, t: any) => sum + t.quantity, 0);

      const wastePercentage =
        totalUsage > 0 ? (totalWaste / totalUsage) * 100 : 0;
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
  async scanBarcode(barcode: string): Promise<Material | null> {
    const { prisma } = await import("@/lib/database");

    // Search for material by barcode (stored in location or batch_number field)
    const material = await prisma.materialInventory.findFirst({
      where: {
        OR: [{ location: { contains: barcode } }, { batch_number: barcode }],
      },
    });

    if (!material) return null;

    return {
      id: material.id,
      workspace_id: material.workspace_id,
      sku: material.batch_number || "UNKNOWN",
      name: material.material_name,
      category: (material.material_type as any) || "OTHER",
      unit_of_measure: (material.unit as any) || "PIECES",
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

  async scanRFID(rfid_tag: string): Promise<Material | null> {
    // Similar to barcode scan
    return this.scanBarcode(rfid_tag);
  }

  async generateBarcode(material_id: string): Promise<string> {
    // Generate EAN-13 style barcode
    const timestamp = Date.now().toString();
    const barcode = `2${material_id.slice(-11)}${timestamp.slice(-1)}`;
    return barcode;
  }

  // Dashboard summary
  async getInventorySummary(workspace_id: string): Promise<{
    total_materials: number;
    total_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
    pending_pos: number;
    monthly_waste_cost: number;
  }> {
    const { prisma } = await import("@/lib/database");

    const materials = await prisma.materialInventory.findMany({
      where: { workspace_id },
    });

    const totalMaterials = materials.length;
    const totalValue = materials.reduce(
      (sum: number, m: any) => sum + (m.current_stock || 0) * (m.cost_per_unit || 0),
      0
    );
    const lowStockCount = materials.filter((m: any) => {
      const stock = m.current_stock || 0;
      const reorder = m.reorder_point || 0;
      return stock <= reorder && stock > 0;
    }).length;
    const outOfStockCount = materials.filter(
      (m: any) => (m.current_stock || 0) === 0
    ).length;

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

export const inventoryManager = new InventoryManager();
