import { db } from "@ash-ai/database";
import { addDays, subDays, format, differenceInDays } from "date-fns";
import type { MaterialRequirementPlan } from "./types";

export interface MaterialDemand {
  materialId: string;
  materialName: string;
  orderId: string;
  requiredQuantity: number;
  requiredDate: Date;
  unit: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface SupplyPlan {
  materialId: string;
  plannedQuantity: number;
  plannedDate: Date;
  supplier?: string;
  leadTime: number; // days
  cost: number;
  status: "PLANNED" | "ORDERED" | "SHIPPED" | "RECEIVED";
}

export interface MRPResult {
  materialId: string;
  materialName: string;
  currentStock: number;
  totalDemand: number;
  plannedSupply: number;
  projectedStock: number;
  shortfall: number;
  recommendedAction: "ORDER_NOW" | "ORDER_SOON" | "ADEQUATE" | "EXCESS";
  urgentOrders: string[]; // order IDs that need this material urgently
  recommendations: string[];
}

export interface StockProjection {
  date: string; // YYYY-MM-DD
  beginningStock: number;
  receipts: number;
  demands: number;
  endingStock: number;
  shortfall: number;
  actions: string[];
}

export class MaterialRequirementPlanner {
  private workspaceId: string;
  private planningHorizon: number; // days

  constructor(workspaceId: string, planningHorizon: number = 30) {
    this.workspaceId = workspaceId;
    this.planningHorizon = planningHorizon;
  }

  async generateMRPPlan(orderId?: string): Promise<MRPResult[]> {
    // Get material demands from orders
    const demands = await this.getMaterialDemands(orderId);
    
    // Get current inventory levels
    const inventory = await this.getCurrentInventory();
    
    // Get planned supplies (existing purchase orders)
    const supplies = await this.getPlannedSupplies();
    
    // Group demands by material
    const demandsByMaterial = this.groupDemandsByMaterial(demands);
    
    const mrpResults: MRPResult[] = [];
    
    for (const [materialId, materialDemands] of Object.entries(demandsByMaterial)) {
      const currentInventory = inventory.find(inv => inv.id === materialId);
      const materialSupplies = supplies.filter(supply => supply.materialId === materialId);
      
      const result = await this.calculateMaterialRequirement(
        materialId,
        materialDemands,
        currentInventory,
        materialSupplies
      );
      
      mrpResults.push(result);
    }
    
    return mrpResults.sort((a, b) => {
      // Sort by urgency and shortfall
      if (a.shortfall > 0 && b.shortfall <= 0) return -1;
      if (b.shortfall > 0 && a.shortfall <= 0) return 1;
      return b.shortfall - a.shortfall;
    });
  }

  async projectStockLevels(materialId: string): Promise<StockProjection[]> {
    const startDate = new Date();
    const endDate = addDays(startDate, this.planningHorizon);
    
    // Get current stock
    const inventory = await db.materialInventory.findFirst({
      where: {
        workspace_id: this.workspaceId,
        id: materialId,
      },
    });
    
    if (!inventory) {
      throw new Error("Material not found");
    }
    
    // Get demands and supplies for the period
    const demands = await this.getMaterialDemandsForPeriod(materialId, startDate, endDate);
    const supplies = await this.getPlannedSuppliesForPeriod(materialId, startDate, endDate);
    
    // Generate daily projections
    const projections: StockProjection[] = [];
    let runningStock = inventory.current_stock;
    
    for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
      const dateStr = format(date, "yyyy-MM-dd");
      
      const dayDemands = demands.filter(d => 
        format(d.requiredDate, "yyyy-MM-dd") === dateStr
      );
      
      const daySupplies = supplies.filter(s => 
        format(s.plannedDate, "yyyy-MM-dd") === dateStr
      );
      
      const totalDemand = dayDemands.reduce((sum, d) => sum + d.requiredQuantity, 0);
      const totalSupply = daySupplies.reduce((sum, s) => sum + s.plannedQuantity, 0);
      
      const beginningStock = runningStock;
      const endingStock = beginningStock + totalSupply - totalDemand;
      const shortfall = Math.max(0, totalDemand - (beginningStock + totalSupply));
      
      const actions: string[] = [];
      if (shortfall > 0) {
        actions.push(`Order ${shortfall} ${inventory.unit} immediately`);
      }
      if (endingStock < inventory.minimum_stock) {
        actions.push("Below minimum stock level");
      }
      if (endingStock < inventory.reorder_point) {
        actions.push("Reached reorder point");
      }
      
      projections.push({
        date: dateStr,
        beginningStock,
        receipts: totalSupply,
        demands: totalDemand,
        endingStock,
        shortfall,
        actions,
      });
      
      runningStock = endingStock;
    }
    
    return projections;
  }

  async createPurchaseRequisition(
    materialId: string,
    quantity: number,
    requiredDate: Date,
    justification: string
  ): Promise<string> {
    // In a real implementation, this would create a purchase requisition
    // For now, we'll create a planned supply record
    
    const material = await db.materialInventory.findFirst({
      where: { id: materialId, workspace_id: this.workspaceId },
    });
    
    if (!material) {
      throw new Error("Material not found");
    }
    
    // Calculate lead time and order date
    const leadTime = 7; // Default 7 days lead time
    const orderDate = subDays(requiredDate, leadTime);
    
    // Create material transaction record for planned receipt
    await db.materialTransaction.create({
      data: {
        workspace_id: this.workspaceId,
        material_inventory_id: materialId,
        transaction_type: "IN",
        quantity,
        reference_type: "PURCHASE_REQUISITION",
        reference_id: `PR-${Date.now()}`,
        notes: `Auto-generated by MRP: ${justification}`,
        created_by: "system", // TODO: Use actual user ID
      },
    });
    
    return `PR-${Date.now()}`;
  }

  async optimizeMaterialPlan(mrpResults: MRPResult[]): Promise<{
    consolidatedOrders: Array<{
      supplier: string;
      materials: Array<{
        materialId: string;
        quantity: number;
        estimatedCost: number;
      }>;
      totalCost: number;
      recommendedDate: Date;
    }>;
    savings: {
      consolidationSavings: number;
      bulkDiscountSavings: number;
      totalSavings: number;
    };
  }> {
    // Group materials by supplier for consolidation
    const materialsBySupplier: Record<string, MRPResult[]> = {};
    
    for (const result of mrpResults.filter(r => r.shortfall > 0)) {
      // Get material details to find preferred supplier
      const material = await db.materialInventory.findFirst({
        where: { id: result.materialId, workspace_id: this.workspaceId },
      });
      
      const supplier = material?.supplier || "Default Supplier";
      
      if (!materialsBySupplier[supplier]) {
        materialsBySupplier[supplier] = [];
      }
      materialsBySupplier[supplier].push(result);
    }
    
    // Create consolidated orders
    const consolidatedOrders = Object.entries(materialsBySupplier).map(([supplier, materials]) => {
      const orderMaterials = materials.map(material => ({
        materialId: material.materialId,
        quantity: material.shortfall,
        estimatedCost: material.shortfall * 10, // Placeholder cost
      }));
      
      const totalCost = orderMaterials.reduce((sum, m) => sum + m.estimatedCost, 0);
      
      // Find the most urgent required date
      const urgentDate = new Date();
      urgentDate.setDate(urgentDate.getDate() + 7); // Default 7 days
      
      return {
        supplier,
        materials: orderMaterials,
        totalCost,
        recommendedDate: urgentDate,
      };
    });
    
    // Calculate potential savings
    const consolidationSavings = consolidatedOrders.length * 50; // $50 per consolidated order
    const bulkDiscountSavings = consolidatedOrders.reduce((sum, order) => 
      order.totalCost > 1000 ? order.totalCost * 0.05 : 0, 0
    ); // 5% bulk discount for orders over $1000
    
    return {
      consolidatedOrders,
      savings: {
        consolidationSavings,
        bulkDiscountSavings,
        totalSavings: consolidationSavings + bulkDiscountSavings,
      },
    };
  }

  private async getMaterialDemands(orderId?: string): Promise<MaterialDemand[]> {
    const whereClause = orderId 
      ? { order_id: orderId, workspace_id: this.workspaceId }
      : { workspace_id: this.workspaceId };
    
    const requirements = await db.materialRequirement.findMany({
      where: whereClause,
      include: {
        order: true,
        material_inventory: true,
      },
    });
    
    return requirements.map(req => ({
      materialId: req.material_inventory_id,
      materialName: req.material_inventory.material_name,
      orderId: req.order_id,
      requiredQuantity: req.required_quantity,
      requiredDate: req.order.delivery_date || addDays(new Date(), 30),
      unit: req.material_inventory.unit,
      priority: "NORMAL", // TODO: Get from order priority
    }));
  }

  private async getCurrentInventory() {
    return db.materialInventory.findMany({
      where: { workspace_id: this.workspaceId },
    });
  }

  private async getPlannedSupplies(): Promise<SupplyPlan[]> {
    // Get planned receipts from material transactions
    const transactions = await db.materialTransaction.findMany({
      where: {
        workspace_id: this.workspaceId,
        transaction_type: "IN",
        reference_type: "PURCHASE_ORDER",
        created_at: {
          gte: new Date(), // Future receipts only
        },
      },
      include: {
        material_inventory: true,
      },
    });
    
    return transactions.map(tx => ({
      materialId: tx.material_inventory_id,
      plannedQuantity: tx.quantity,
      plannedDate: tx.created_at, // TODO: Use actual planned receipt date
      leadTime: 7, // Default lead time
      cost: tx.unit_cost || 0,
      status: "PLANNED" as const,
    }));
  }

  private groupDemandsByMaterial(demands: MaterialDemand[]) {
    return demands.reduce((acc, demand) => {
      if (!acc[demand.materialId]) {
        acc[demand.materialId] = [];
      }
      acc[demand.materialId].push(demand);
      return acc;
    }, {} as Record<string, MaterialDemand[]>);
  }

  private async calculateMaterialRequirement(
    materialId: string,
    demands: MaterialDemand[],
    inventory: any,
    supplies: SupplyPlan[]
  ): Promise<MRPResult> {
    const currentStock = inventory?.current_stock || 0;
    const totalDemand = demands.reduce((sum, d) => sum + d.requiredQuantity, 0);
    const plannedSupply = supplies.reduce((sum, s) => s.plannedQuantity, 0);
    const projectedStock = currentStock + plannedSupply - totalDemand;
    const shortfall = Math.max(0, -projectedStock);
    
    // Determine recommended action
    let recommendedAction: MRPResult["recommendedAction"] = "ADEQUATE";
    if (shortfall > 0) {
      recommendedAction = "ORDER_NOW";
    } else if (projectedStock < (inventory?.minimum_stock || 0)) {
      recommendedAction = "ORDER_SOON";
    } else if (projectedStock > currentStock * 2) {
      recommendedAction = "EXCESS";
    }
    
    // Find urgent orders
    const urgentOrders = demands
      .filter(d => d.priority === "URGENT" || differenceInDays(d.requiredDate, new Date()) < 7)
      .map(d => d.orderId);
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (shortfall > 0) {
      recommendations.push(`Order ${shortfall} ${inventory?.unit || 'units'} immediately`);
    }
    if (urgentOrders.length > 0) {
      recommendations.push(`${urgentOrders.length} urgent orders require this material`);
    }
    if (projectedStock < (inventory?.reorder_point || 0)) {
      recommendations.push("Stock level below reorder point");
    }
    
    return {
      materialId,
      materialName: inventory?.material_name || "Unknown Material",
      currentStock,
      totalDemand,
      plannedSupply,
      projectedStock,
      shortfall,
      recommendedAction,
      urgentOrders,
      recommendations,
    };
  }

  private async getMaterialDemandsForPeriod(
    materialId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<MaterialDemand[]> {
    // Get all demands for the material within the period
    // This is a simplified implementation
    return [];
  }

  private async getPlannedSuppliesForPeriod(
    materialId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<SupplyPlan[]> {
    // Get all planned supplies for the material within the period
    // This is a simplified implementation
    return [];
  }
}