/**
 * Analytics Metrics Service
 * Provides real-time business intelligence and KPIs
 */
export interface ProductionMetrics {
    total_orders: number;
    orders_in_production: number;
    orders_completed_today: number;
    orders_completed_this_month: number;
    total_pieces_produced: number;
    pieces_produced_today: number;
    average_production_time_hours: number;
    on_time_delivery_rate: number;
    production_efficiency_rate: number;
}
export interface FinancialMetrics {
    total_revenue: number;
    revenue_this_month: number;
    revenue_this_year: number;
    outstanding_invoices: number;
    outstanding_amount: number;
    paid_invoices: number;
    paid_amount: number;
    profit_margin: number;
    average_order_value: number;
    revenue_growth_rate: number;
}
export interface QualityMetrics {
    total_inspections: number;
    passed_inspections: number;
    failed_inspections: number;
    pass_rate: number;
    defect_rate: number;
    top_defects: Array<{
        code: string;
        count: number;
        severity: string;
    }>;
    capa_open: number;
    capa_closed: number;
}
export interface EmployeeMetrics {
    total_employees: number;
    active_employees: number;
    attendance_rate: number;
    average_productivity: number;
    top_performers: Array<{
        id: string;
        name: string;
        productivity: number;
    }>;
    department_breakdown: Record<string, number>;
}
export interface InventoryMetrics {
    total_materials: number;
    low_stock_items: number;
    out_of_stock_items: number;
    inventory_value: number;
    inventory_turnover_rate: number;
    stock_accuracy: number;
}
/**
 * Get production metrics
 */
export declare function getProductionMetrics(workspace_id: string): Promise<ProductionMetrics>;
/**
 * Get financial metrics
 */
export declare function getFinancialMetrics(workspace_id: string): Promise<FinancialMetrics>;
/**
 * Get quality metrics
 */
export declare function getQualityMetrics(workspace_id: string): Promise<QualityMetrics>;
/**
 * Get employee metrics
 */
export declare function getEmployeeMetrics(workspace_id: string): Promise<EmployeeMetrics>;
/**
 * Get all metrics at once
 */
export declare function getAllMetrics(workspace_id: string): Promise<{
    production: ProductionMetrics;
    financial: FinancialMetrics;
    quality: QualityMetrics;
    employee: EmployeeMetrics;
}>;
/**
 * Invalidate metrics cache
 */
export declare function invalidateMetricsCache(workspace_id: string, type?: string): Promise<void>;
