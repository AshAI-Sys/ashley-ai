/**
 * Export Utility
 * Provides Excel and CSV export functionality for orders, invoices, and reports
 */

export interface ExportColumn {
  header: string
  key: string
  width?: number
  format?: (value: any) => string
}

export interface ExportOptions {
  filename: string
  sheetName?: string
  columns: ExportColumn[]
  data: any[]
}

/**
 * Export data to CSV
 */
export function exportToCSV(options: ExportOptions): Blob {
  const { columns, data } = options

  // Create header row
  const headers = columns.map(col => col.header)
  const headerRow = headers.map(h => `"${h}"`).join(',')

  // Create data rows
  const dataRows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key]
      const formatted = col.format ? col.format(value) : value
      const escaped = formatted !== null && formatted !== undefined
        ? `"${String(formatted).replace(/"/g, '""')}"`
        : '""'
      return escaped
    }).join(',')
  })

  // Combine all rows
  const csv = [headerRow, ...dataRows].join('\n')

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Export data to Excel (XLSX) - using CSV for simplicity
 * In production, use a library like xlsx or exceljs for proper Excel support
 */
export function exportToExcel(options: ExportOptions): Blob {
  // For now, export as CSV which can be opened in Excel
  // TODO: Implement proper XLSX export using exceljs library
  return exportToCSV(options)
}

/**
 * Download file in browser
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Export orders to CSV/Excel
 */
export function exportOrders(orders: any[], format: 'csv' | 'excel' = 'csv') {
  const columns: ExportColumn[] = [
    { header: 'Order Number', key: 'order_number', width: 15 },
    { header: 'Client', key: 'client_name', width: 20 },
    { header: 'Brand', key: 'brand_name', width: 20 },
    { header: 'Line Items', key: 'line_items_count', width: 10 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Total Amount', key: 'total_amount', width: 15, format: (v) => `₱${v?.toLocaleString() || '0'}` },
    { header: 'Delivery Date', key: 'delivery_date', width: 15, format: (v) => v ? new Date(v).toLocaleDateString() : '' },
    { header: 'Created At', key: 'created_at', width: 20, format: (v) => new Date(v).toLocaleString() }
  ]

  const options: ExportOptions = {
    filename: `orders-export-${Date.now()}.${format}`,
    sheetName: 'Orders',
    columns,
    data: orders.map(order => ({
      ...order,
      client_name: order.client?.name || '',
      brand_name: order.brand?.name || '',
      line_items_count: order._count?.line_items || 0
    }))
  }

  const blob = format === 'excel' ? exportToExcel(options) : exportToCSV(options)
  downloadFile(blob, options.filename)
}

/**
 * Export invoices to CSV/Excel
 */
export function exportInvoices(invoices: any[], format: 'csv' | 'excel' = 'csv') {
  const columns: ExportColumn[] = [
    { header: 'Invoice Number', key: 'invoice_number', width: 15 },
    { header: 'Client', key: 'client_name', width: 20 },
    { header: 'Order Number', key: 'order_number', width: 15 },
    { header: 'Issue Date', key: 'issue_date', width: 15, format: (v) => new Date(v).toLocaleDateString() },
    { header: 'Due Date', key: 'due_date', width: 15, format: (v) => new Date(v).toLocaleDateString() },
    { header: 'Total Amount', key: 'total_amount', width: 15, format: (v) => `₱${v?.toLocaleString() || '0'}` },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created At', key: 'created_at', width: 20, format: (v) => new Date(v).toLocaleString() }
  ]

  const options: ExportOptions = {
    filename: `invoices-export-${Date.now()}.${format}`,
    sheetName: 'Invoices',
    columns,
    data: invoices.map(invoice => ({
      ...invoice,
      client_name: invoice.client?.name || '',
      order_number: invoice.order?.order_number || ''
    }))
  }

  const blob = format === 'excel' ? exportToExcel(options) : exportToCSV(options)
  downloadFile(blob, options.filename)
}

/**
 * Export employees to CSV/Excel
 */
export function exportEmployees(employees: any[], format: 'csv' | 'excel' = 'csv') {
  const columns: ExportColumn[] = [
    { header: 'Employee ID', key: 'employee_id', width: 12 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Position', key: 'position', width: 20 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Salary Type', key: 'salary_type', width: 12 },
    { header: 'Base Salary', key: 'base_salary', width: 15, format: (v) => `₱${v?.toLocaleString() || '0'}` },
    { header: 'Hire Date', key: 'hire_date', width: 15, format: (v) => v ? new Date(v).toLocaleDateString() : '' },
    { header: 'Status', key: 'is_active', width: 10, format: (v) => v ? 'Active' : 'Inactive' }
  ]

  const options: ExportOptions = {
    filename: `employees-export-${Date.now()}.${format}`,
    sheetName: 'Employees',
    columns,
    data: employees
  }

  const blob = format === 'excel' ? exportToExcel(options) : exportToCSV(options)
  downloadFile(blob, options.filename)
}

/**
 * Export production runs to CSV/Excel
 */
export function exportProductionRuns(
  runs: any[],
  type: 'cutting' | 'printing' | 'sewing',
  format: 'csv' | 'excel' = 'csv'
) {
  const columns: ExportColumn[] = [
    { header: 'Run ID', key: 'id', width: 15 },
    { header: 'Order Number', key: 'order_number', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Quantity Good', key: 'qty_good', width: 12 },
    { header: 'Quantity Reject', key: 'qty_reject', width: 12 },
    { header: 'Started At', key: 'started_at', width: 20, format: (v) => v ? new Date(v).toLocaleString() : '' },
    { header: 'Ended At', key: 'ended_at', width: 20, format: (v) => v ? new Date(v).toLocaleString() : '' },
    { header: 'Created At', key: 'created_at', width: 20, format: (v) => new Date(v).toLocaleString() }
  ]

  const options: ExportOptions = {
    filename: `${type}-runs-export-${Date.now()}.${format}`,
    sheetName: `${type.charAt(0).toUpperCase() + type.slice(1)} Runs`,
    columns,
    data: runs.map(run => ({
      ...run,
      order_number: run.order?.order_number || ''
    }))
  }

  const blob = format === 'excel' ? exportToExcel(options) : exportToCSV(options)
  downloadFile(blob, options.filename)
}

/**
 * Export financial report to CSV/Excel
 */
export function exportFinancialReport(
  data: { revenue: any[]; expenses: any[] },
  format: 'csv' | 'excel' = 'csv'
) {
  // Revenue columns
  const revenueColumns: ExportColumn[] = [
    { header: 'Date', key: 'date', width: 15, format: (v) => new Date(v).toLocaleDateString() },
    { header: 'Invoice Number', key: 'invoice_number', width: 15 },
    { header: 'Client', key: 'client_name', width: 20 },
    { header: 'Amount', key: 'amount', width: 15, format: (v) => `₱${v?.toLocaleString() || '0'}` },
    { header: 'Status', key: 'status', width: 12 }
  ]

  // For simplicity, export revenue data only
  // In production, create multiple sheets or separate files
  const options: ExportOptions = {
    filename: `financial-report-${Date.now()}.${format}`,
    sheetName: 'Revenue',
    columns: revenueColumns,
    data: data.revenue
  }

  const blob = format === 'excel' ? exportToExcel(options) : exportToCSV(options)
  downloadFile(blob, options.filename)
}

/**
 * Export quality control data to CSV/Excel
 */
export function exportQualityControl(
  inspections: any[],
  format: 'csv' | 'excel' = 'csv'
) {
  const columns: ExportColumn[] = [
    { header: 'Inspection ID', key: 'id', width: 15 },
    { header: 'Order Number', key: 'order_number', width: 15 },
    { header: 'Inspector', key: 'inspector_name', width: 20 },
    { header: 'Sample Size', key: 'sample_size', width: 12 },
    { header: 'Defects Found', key: 'defects_found', width: 12 },
    { header: 'Result', key: 'result', width: 10 },
    { header: 'AQL Level', key: 'aql_level', width: 10 },
    { header: 'Inspected At', key: 'inspected_at', width: 20, format: (v) => v ? new Date(v).toLocaleString() : '' }
  ]

  const options: ExportOptions = {
    filename: `qc-inspections-${Date.now()}.${format}`,
    sheetName: 'QC Inspections',
    columns,
    data: inspections
  }

  const blob = format === 'excel' ? exportToExcel(options) : exportToCSV(options)
  downloadFile(blob, options.filename)
}

/**
 * Generic export function for any data
 */
export function exportData(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  format: 'csv' | 'excel' = 'csv'
) {
  const options: ExportOptions = {
    filename: `${filename}-${Date.now()}.${format}`,
    sheetName: 'Data',
    columns,
    data
  }

  const blob = format === 'excel' ? exportToExcel(options) : exportToCSV(options)
  downloadFile(blob, options.filename)
}
