"use strict";
/**
 * Export Utility
 * Provides Excel and CSV export functionality for orders, invoices, and reports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToCSV = exportToCSV;
exports.exportToExcel = exportToExcel;
exports.downloadFile = downloadFile;
exports.exportOrders = exportOrders;
exports.exportInvoices = exportInvoices;
exports.exportEmployees = exportEmployees;
exports.exportProductionRuns = exportProductionRuns;
exports.exportFinancialReport = exportFinancialReport;
exports.exportQualityControl = exportQualityControl;
exports.exportData = exportData;
/**
 * Export data to CSV
 */
function exportToCSV(options) {
    const { columns, data } = options;
    // Create header row
    const headers = columns.map(col => col.header);
    const headerRow = headers.map(h => `"${h}"`).join(",");
    // Create data rows
    const dataRows = data.map(row => {
        return columns
            .map(col => {
            const value = row[col.key];
            const formatted = col.format ? col.format(value) : value;
            const escaped = formatted !== null && formatted !== undefined
                ? `"${String(formatted).replace(/"/g, '""')}"`
                : '""';
            return escaped;
        })
            .join(",");
    });
    // Combine all rows
    const csv = [headerRow, ...dataRows].join("\n");
    return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}
/**
 * Export data to Excel (XLSX) - using CSV for simplicity
 * In production, use a library like xlsx or exceljs for proper Excel support
 */
function exportToExcel(options) {
    // For now, export as CSV which can be opened in Excel
    // TODO: Implement proper XLSX export using exceljs library
    return exportToCSV(options);
}
/**
 * Download file in browser
 */
function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
/**
 * Export orders to CSV/Excel
 */
function exportOrders(orders, format = "csv") {
    const columns = [
        { header: "Order Number", key: "order_number", width: 15 },
        { header: "Client", key: "client_name", width: 20 },
        { header: "Brand", key: "brand_name", width: 20 },
        { header: "Line Items", key: "line_items_count", width: 10 },
        { header: "Status", key: "status", width: 15 },
        {
            header: "Total Amount",
            key: "total_amount",
            width: 15,
            format: v => `₱${v?.toLocaleString() || "0"}`,
        },
        {
            header: "Delivery Date",
            key: "delivery_date",
            width: 15,
            format: v => (v ? new Date(v).toLocaleDateString() : ""),
        },
        {
            header: "Created At",
            key: "created_at",
            width: 20,
            format: v => new Date(v).toLocaleString(),
        },
    ];
    const options = {
        filename: `orders-export-${Date.now()}.${format}`,
        sheetName: "Orders",
        columns,
        data: orders.map(order => ({
            ...order,
            client_name: order.client?.name || "",
            brand_name: order.brand?.name || "",
            line_items_count: order._count?.line_items || 0,
        })),
    };
    const blob = format === "excel" ? exportToExcel(options) : exportToCSV(options);
    downloadFile(blob, options.filename);
}
/**
 * Export invoices to CSV/Excel
 */
function exportInvoices(invoices, format = "csv") {
    const columns = [
        { header: "Invoice Number", key: "invoice_number", width: 15 },
        { header: "Client", key: "client_name", width: 20 },
        { header: "Order Number", key: "order_number", width: 15 },
        {
            header: "Issue Date",
            key: "issue_date",
            width: 15,
            format: v => new Date(v).toLocaleDateString(),
        },
        {
            header: "Due Date",
            key: "due_date",
            width: 15,
            format: v => new Date(v).toLocaleDateString(),
        },
        {
            header: "Total Amount",
            key: "total_amount",
            width: 15,
            format: v => `₱${v?.toLocaleString() || "0"}`,
        },
        { header: "Status", key: "status", width: 15 },
        {
            header: "Created At",
            key: "created_at",
            width: 20,
            format: v => new Date(v).toLocaleString(),
        },
    ];
    const options = {
        filename: `invoices-export-${Date.now()}.${format}`,
        sheetName: "Invoices",
        columns,
        data: invoices.map(invoice => ({
            ...invoice,
            client_name: invoice.client?.name || "",
            order_number: invoice.order?.order_number || "",
        })),
    };
    const blob = format === "excel" ? exportToExcel(options) : exportToCSV(options);
    downloadFile(blob, options.filename);
}
/**
 * Export employees to CSV/Excel
 */
function exportEmployees(employees, format = "csv") {
    const columns = [
        { header: "Employee ID", key: "employee_id", width: 12 },
        { header: "Name", key: "name", width: 25 },
        { header: "Department", key: "department", width: 20 },
        { header: "Position", key: "position", width: 20 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Salary Type", key: "salary_type", width: 12 },
        {
            header: "Base Salary",
            key: "base_salary",
            width: 15,
            format: v => `₱${v?.toLocaleString() || "0"}`,
        },
        {
            header: "Hire Date",
            key: "hire_date",
            width: 15,
            format: v => (v ? new Date(v).toLocaleDateString() : ""),
        },
        {
            header: "Status",
            key: "is_active",
            width: 10,
            format: v => (v ? "Active" : "Inactive"),
        },
    ];
    const options = {
        filename: `employees-export-${Date.now()}.${format}`,
        sheetName: "Employees",
        columns,
        data: employees,
    };
    const blob = format === "excel" ? exportToExcel(options) : exportToCSV(options);
    downloadFile(blob, options.filename);
}
/**
 * Export production runs to CSV/Excel
 */
function exportProductionRuns(runs, type, format = "csv") {
    const columns = [
        { header: "Run ID", key: "id", width: 15 },
        { header: "Order Number", key: "order_number", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Quantity Good", key: "qty_good", width: 12 },
        { header: "Quantity Reject", key: "qty_reject", width: 12 },
        {
            header: "Started At",
            key: "started_at",
            width: 20,
            format: v => (v ? new Date(v).toLocaleString() : ""),
        },
        {
            header: "Ended At",
            key: "ended_at",
            width: 20,
            format: v => (v ? new Date(v).toLocaleString() : ""),
        },
        {
            header: "Created At",
            key: "created_at",
            width: 20,
            format: v => new Date(v).toLocaleString(),
        },
    ];
    const options = {
        filename: `${type}-runs-export-${Date.now()}.${format}`,
        sheetName: `${type.charAt(0).toUpperCase() + type.slice(1)} Runs`,
        columns,
        data: runs.map(run => ({
            ...run,
            order_number: run.order?.order_number || "",
        })),
    };
    const blob = format === "excel" ? exportToExcel(options) : exportToCSV(options);
    downloadFile(blob, options.filename);
}
/**
 * Export financial report to CSV/Excel
 */
function exportFinancialReport(data, format = "csv") {
    // Revenue columns
    const revenueColumns = [
        {
            header: "Date",
            key: "date",
            width: 15,
            format: v => new Date(v).toLocaleDateString(),
        },
        { header: "Invoice Number", key: "invoice_number", width: 15 },
        { header: "Client", key: "client_name", width: 20 },
        {
            header: "Amount",
            key: "amount",
            width: 15,
            format: v => `₱${v?.toLocaleString() || "0"}`,
        },
        { header: "Status", key: "status", width: 12 },
    ];
    // For simplicity, export revenue data only
    // In production, create multiple sheets or separate files
    const options = {
        filename: `financial-report-${Date.now()}.${format}`,
        sheetName: "Revenue",
        columns: revenueColumns,
        data: data.revenue,
    };
    const blob = format === "excel" ? exportToExcel(options) : exportToCSV(options);
    downloadFile(blob, options.filename);
}
/**
 * Export quality control data to CSV/Excel
 */
function exportQualityControl(inspections, format = "csv") {
    const columns = [
        { header: "Inspection ID", key: "id", width: 15 },
        { header: "Order Number", key: "order_number", width: 15 },
        { header: "Inspector", key: "inspector_name", width: 20 },
        { header: "Sample Size", key: "sample_size", width: 12 },
        { header: "Defects Found", key: "defects_found", width: 12 },
        { header: "Result", key: "result", width: 10 },
        { header: "AQL Level", key: "aql_level", width: 10 },
        {
            header: "Inspected At",
            key: "inspected_at",
            width: 20,
            format: v => (v ? new Date(v).toLocaleString() : ""),
        },
    ];
    const options = {
        filename: `qc-inspections-${Date.now()}.${format}`,
        sheetName: "QC Inspections",
        columns,
        data: inspections,
    };
    const blob = format === "excel" ? exportToExcel(options) : exportToCSV(options);
    downloadFile(blob, options.filename);
}
/**
 * Generic export function for any data
 */
function exportData(data, columns, filename, format = "csv") {
    const options = {
        filename: `${filename}-${Date.now()}.${format}`,
        sheetName: "Data",
        columns,
        data,
    };
    const blob = format === "excel" ? exportToExcel(options) : exportToCSV(options);
    downloadFile(blob, options.filename);
}
