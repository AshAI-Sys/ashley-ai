"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialRequirementPlanner = void 0;
const database_1 = require("@ash-ai/database");
const date_fns_1 = require("date-fns");
class MaterialRequirementPlanner {
    constructor(workspaceId, planningHorizon = 30) {
        this.workspaceId = workspaceId;
        this.planningHorizon = planningHorizon;
    }
    async generateMRPPlan(orderId) {
        // Get material demands from orders
        const demands = await this.getMaterialDemands(orderId);
        // Get current inventory levels
        const inventory = await this.getCurrentInventory();
        // Get planned supplies (existing purchase orders)
        const supplies = await this.getPlannedSupplies();
        // Group demands by material
        const demandsByMaterial = this.groupDemandsByMaterial(demands);
        const mrpResults = [];
        for (const [materialId, materialDemands] of Object.entries(demandsByMaterial)) {
            const currentInventory = inventory.find(inv => inv.id === materialId);
            const materialSupplies = supplies.filter(supply => supply.materialId === materialId);
            const result = await this.calculateMaterialRequirement(materialId, materialDemands, currentInventory, materialSupplies);
            mrpResults.push(result);
        }
        return mrpResults.sort((a, b) => {
            // Sort by urgency and shortfall
            if (a.shortfall > 0 && b.shortfall <= 0)
                return -1;
            if (b.shortfall > 0 && a.shortfall <= 0)
                return 1;
            return b.shortfall - a.shortfall;
        });
    }
    async projectStockLevels(materialId) {
        const startDate = new Date();
        const endDate = (0, date_fns_1.addDays)(startDate, this.planningHorizon);
        // Get current stock
        const inventory = await database_1.db.materialInventory.findFirst({
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
        const projections = [];
        let runningStock = inventory.current_stock;
        for (let date = startDate; date <= endDate; date = (0, date_fns_1.addDays)(date, 1)) {
            const dateStr = (0, date_fns_1.format)(date, "yyyy-MM-dd");
            const dayDemands = demands.filter(d => (0, date_fns_1.format)(d.requiredDate, "yyyy-MM-dd") === dateStr);
            const daySupplies = supplies.filter(s => (0, date_fns_1.format)(s.plannedDate, "yyyy-MM-dd") === dateStr);
            const totalDemand = dayDemands.reduce((sum, d) => sum + d.requiredQuantity, 0);
            const totalSupply = daySupplies.reduce((sum, s) => sum + s.plannedQuantity, 0);
            const beginningStock = runningStock;
            const endingStock = beginningStock + totalSupply - totalDemand;
            const shortfall = Math.max(0, totalDemand - (beginningStock + totalSupply));
            const actions = [];
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
    async createPurchaseRequisition(materialId, quantity, requiredDate, justification) {
        // In a real implementation, this would create a purchase requisition
        // For now, we'll create a planned supply record
        const material = await database_1.db.materialInventory.findFirst({
            where: { id: materialId, workspace_id: this.workspaceId },
        });
        if (!material) {
            throw new Error("Material not found");
        }
        // Calculate lead time and order date
        const leadTime = 7; // Default 7 days lead time
        const orderDate = (0, date_fns_1.subDays)(requiredDate, leadTime);
        // Create material transaction record for planned receipt
        await database_1.db.materialTransaction.create({
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
    async optimizeMaterialPlan(mrpResults) {
        // Group materials by supplier for consolidation
        const materialsBySupplier = {};
        for (const result of mrpResults.filter(r => r.shortfall > 0)) {
            // Get material details to find preferred supplier
            const material = await database_1.db.materialInventory.findFirst({
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
        const bulkDiscountSavings = consolidatedOrders.reduce((sum, order) => (order.totalCost > 1000 ? order.totalCost * 0.05 : 0), 0); // 5% bulk discount for orders over $1000
        return {
            consolidatedOrders,
            savings: {
                consolidationSavings,
                bulkDiscountSavings,
                totalSavings: consolidationSavings + bulkDiscountSavings,
            },
        };
    }
    async getMaterialDemands(orderId) {
        const whereClause = orderId
            ? { order_id: orderId, workspace_id: this.workspaceId }
            : { workspace_id: this.workspaceId };
        const requirements = await database_1.db.materialRequirement.findMany({
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
            requiredDate: req.order.delivery_date || (0, date_fns_1.addDays)(new Date(), 30),
            unit: req.material_inventory.unit,
            priority: "NORMAL", // TODO: Get from order priority
        }));
    }
    async getCurrentInventory() {
        return database_1.db.materialInventory.findMany({
            where: { workspace_id: this.workspaceId },
        });
    }
    async getPlannedSupplies() {
        // Get planned receipts from material transactions
        const transactions = await database_1.db.materialTransaction.findMany({
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
            status: "PLANNED",
        }));
    }
    groupDemandsByMaterial(demands) {
        return demands.reduce((acc, demand) => {
            if (!acc[demand.materialId]) {
                acc[demand.materialId] = [];
            }
            acc[demand.materialId].push(demand);
            return acc;
        }, {});
    }
    async calculateMaterialRequirement(materialId, demands, inventory, supplies) {
        const currentStock = inventory?.current_stock || 0;
        const totalDemand = demands.reduce((sum, d) => sum + d.requiredQuantity, 0);
        const plannedSupply = supplies.reduce((sum, s) => s.plannedQuantity, 0);
        const projectedStock = currentStock + plannedSupply - totalDemand;
        const shortfall = Math.max(0, -projectedStock);
        // Determine recommended action
        let recommendedAction = "ADEQUATE";
        if (shortfall > 0) {
            recommendedAction = "ORDER_NOW";
        }
        else if (projectedStock < (inventory?.minimum_stock || 0)) {
            recommendedAction = "ORDER_SOON";
        }
        else if (projectedStock > currentStock * 2) {
            recommendedAction = "EXCESS";
        }
        // Find urgent orders
        const urgentOrders = demands
            .filter(d => d.priority === "URGENT" ||
            (0, date_fns_1.differenceInDays)(d.requiredDate, new Date()) < 7)
            .map(d => d.orderId);
        // Generate recommendations
        const recommendations = [];
        if (shortfall > 0) {
            recommendations.push(`Order ${shortfall} ${inventory?.unit || "units"} immediately`);
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
    async getMaterialDemandsForPeriod(materialId, startDate, endDate) {
        // Get all demands for the material within the period
        // This is a simplified implementation
        return [];
    }
    async getPlannedSuppliesForPeriod(materialId, startDate, endDate) {
        // Get all planned supplies for the material within the period
        // This is a simplified implementation
        return [];
    }
}
exports.MaterialRequirementPlanner = MaterialRequirementPlanner;
