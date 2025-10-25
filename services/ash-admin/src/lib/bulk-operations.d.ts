/**
 * Bulk Operations Utility
 * Provides batch processing capabilities for orders, invoices, and other entities
 */
export interface BulkOperationResult<T = any> {
    success: boolean;
    processed: number;
    failed: number;
    errors: Array<{
        index: number;
        error: string;
        item?: T;
    }>;
    results?: T[];
}
/**
 * Bulk update order status
 */
export declare function bulkUpdateOrderStatus(orderIds: string[], status: string, userId: string): Promise<BulkOperationResult>;
/**
 * Bulk delete orders
 */
export declare function bulkDeleteOrders(orderIds: string[], userId: string): Promise<BulkOperationResult>;
/**
 * Bulk create invoices from orders
 */
export declare function bulkCreateInvoices(orderIds: string[], workspaceId: string): Promise<BulkOperationResult<{
    orderId: string;
    invoiceId: string;
}>>;
/**
 * Bulk update invoice status
 */
export declare function bulkUpdateInvoiceStatus(invoiceIds: string[], status: string): Promise<BulkOperationResult>;
/**
 * Bulk import orders from CSV/Excel data
 */
export interface OrderImportData {
    client_name: string;
    brand_name?: string;
    order_number: string;
    quantity: number;
    total_amount?: number;
    delivery_date?: string;
    notes?: string;
}
export declare function bulkImportOrders(orders: OrderImportData[], workspaceId: string): Promise<BulkOperationResult<{
    orderNumber: string;
    orderId: string;
}>>;
/**
 * Bulk assign orders to production runs
 */
export declare function bulkAssignToProduction(orderIds: string[], runType: "cutting" | "printing" | "sewing", workspaceId: string): Promise<BulkOperationResult>;
