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
    rating: number;
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
export declare class InventoryManager {
    addMaterial(material: Omit<Material, "id" | "created_at">): Promise<Material>;
    updateStock(material_id: string, quantity_change: number, transaction_type: "PURCHASE" | "USAGE" | "ADJUSTMENT" | "WASTE"): Promise<void>;
    createSupplier(supplier: Omit<Supplier, "id">): Promise<Supplier>;
    createPurchaseOrder(po: Omit<PurchaseOrder, "id" | "po_number">): Promise<PurchaseOrder>;
    receivePurchaseOrder(_po_id: string, received_items: Array<{
        material_id: string;
        quantity: number;
    }>): Promise<void>;
    private checkStockAlert;
    private autoReorder;
    getStockAlerts(workspace_id: string): Promise<StockAlert[]>;
    calculateMaterialCost(workspace_id: string): Promise<MaterialCosting[]>;
    scanBarcode(barcode: string): Promise<Material | null>;
    scanRFID(rfid_tag: string): Promise<Material | null>;
    generateBarcode(material_id: string): Promise<string>;
    getInventorySummary(workspace_id: string): Promise<{
        total_materials: number;
        total_value: number;
        low_stock_count: number;
        out_of_stock_count: number;
        pending_pos: number;
        monthly_waste_cost: number;
    }>;
}
export declare const inventoryManager: InventoryManager;
