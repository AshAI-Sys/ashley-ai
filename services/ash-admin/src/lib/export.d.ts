/**
 * Export Utility
 * Provides Excel and CSV export functionality for orders, invoices, and reports
 */
export interface ExportColumn {
    header: string;
    key: string;
    width?: number;
    format?: (value: any) => string;
}
export interface ExportOptions {
    filename: string;
    sheetName?: string;
    columns: ExportColumn[];
    data: any[];
}
/**
 * Export data to CSV
 */
export declare function exportToCSV(options: ExportOptions): Blob;
/**
 * Export data to Excel (XLSX) - using CSV for simplicity
 * In production, use a library like xlsx or exceljs for proper Excel support
 */
export declare function exportToExcel(options: ExportOptions): Blob;
/**
 * Download file in browser
 */
export declare function downloadFile(blob: Blob, filename: string): void;
/**
 * Export orders to CSV/Excel
 */
export declare function exportOrders(orders: any[], format?: "csv" | "excel"): void;
/**
 * Export invoices to CSV/Excel
 */
export declare function exportInvoices(invoices: any[], format?: "csv" | "excel"): void;
/**
 * Export employees to CSV/Excel
 */
export declare function exportEmployees(employees: any[], format?: "csv" | "excel"): void;
/**
 * Export production runs to CSV/Excel
 */
export declare function exportProductionRuns(runs: any[], type: "cutting" | "printing" | "sewing", format?: "csv" | "excel"): void;
/**
 * Export financial report to CSV/Excel
 */
export declare function exportFinancialReport(data: {
    revenue: any[];
    expenses: any[];
}, format?: "csv" | "excel"): void;
/**
 * Export quality control data to CSV/Excel
 */
export declare function exportQualityControl(inspections: any[], format?: "csv" | "excel"): void;
/**
 * Generic export function for any data
 */
export declare function exportData(data: any[], columns: ExportColumn[], filename: string, format?: "csv" | "excel"): void;
