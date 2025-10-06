import { db } from '@ash-ai/database'
import { redisClient } from '@/lib/redis'

const prisma = db

/**
 * Analytics Metrics Service
 * Provides real-time business intelligence and KPIs
 */

export interface ProductionMetrics {
  total_orders: number
  orders_in_production: number
  orders_completed_today: number
  orders_completed_this_month: number
  total_pieces_produced: number
  pieces_produced_today: number
  average_production_time_hours: number
  on_time_delivery_rate: number
  production_efficiency_rate: number
}

export interface FinancialMetrics {
  total_revenue: number
  revenue_this_month: number
  revenue_this_year: number
  outstanding_invoices: number
  outstanding_amount: number
  paid_invoices: number
  paid_amount: number
  profit_margin: number
  average_order_value: number
  revenue_growth_rate: number
}

export interface QualityMetrics {
  total_inspections: number
  passed_inspections: number
  failed_inspections: number
  pass_rate: number
  defect_rate: number
  top_defects: Array<{ code: string; count: number; severity: string }>
  capa_open: number
  capa_closed: number
}

export interface EmployeeMetrics {
  total_employees: number
  active_employees: number
  attendance_rate: number
  average_productivity: number
  top_performers: Array<{ id: string; name: string; productivity: number }>
  department_breakdown: Record<string, number>
}

export interface InventoryMetrics {
  total_materials: number
  low_stock_items: number
  out_of_stock_items: number
  inventory_value: number
  inventory_turnover_rate: number
  stock_accuracy: number
}

/**
 * Cache duration for metrics (in seconds)
 */
const CACHE_DURATION = {
  production: 300, // 5 minutes
  financial: 600, // 10 minutes
  quality: 300, // 5 minutes
  employee: 600, // 10 minutes
  inventory: 300 // 5 minutes
}

/**
 * Get production metrics
 */
export async function getProductionMetrics(workspace_id: string): Promise<ProductionMetrics> {
  const cacheKey = `metrics:production:${workspace_id}`

  // Try cache first
  const cached = await redisClient.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Calculate metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    totalOrders,
    ordersInProduction,
    ordersCompletedToday,
    ordersCompletedThisMonth,
    allOrders
  ] = await Promise.all([
    prisma.order.count({ where: { workspace_id } }),
    prisma.order.count({
      where: {
        workspace_id,
        status: { in: ['PRODUCTION', 'QC', 'PACKING'] }
      }
    }),
    prisma.order.count({
      where: {
        workspace_id,
        status: 'COMPLETED',
        updated_at: { gte: today }
      }
    }),
    prisma.order.count({
      where: {
        workspace_id,
        status: 'COMPLETED',
        updated_at: { gte: thisMonth }
      }
    }),
    prisma.order.findMany({
      where: { workspace_id },
      select: {
        total_amount: true,
        delivery_date: true,
        created_at: true,
        updated_at: true,
        status: true
      }
    })
  ])

  // Calculate production statistics
  const totalPieces = allOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const piecesToday = allOrders
    .filter(o => o.updated_at >= today)
    .reduce((sum, order) => sum + (order.total_amount || 0), 0)

  // Calculate average production time
  const completedOrders = allOrders.filter(o => o.status === 'COMPLETED')
  const avgProductionTime = completedOrders.length > 0
    ? completedOrders.reduce((sum, order) => {
        const hours = (order.updated_at.getTime() - order.created_at.getTime()) / (1000 * 60 * 60)
        return sum + hours
      }, 0) / completedOrders.length
    : 0

  // Calculate on-time delivery rate
  const onTimeDeliveries = completedOrders.filter(o =>
    o.delivery_date ? o.updated_at <= o.delivery_date : true
  ).length
  const onTimeRate = completedOrders.length > 0
    ? (onTimeDeliveries / completedOrders.length) * 100
    : 0

  // Production efficiency (simplified - could be enhanced)
  const efficiencyRate = 85 // Placeholder - would calculate from actual production data

  const metrics: ProductionMetrics = {
    total_orders: totalOrders,
    orders_in_production: ordersInProduction,
    orders_completed_today: ordersCompletedToday,
    orders_completed_this_month: ordersCompletedThisMonth,
    total_pieces_produced: totalPieces,
    pieces_produced_today: piecesToday,
    average_production_time_hours: Math.round(avgProductionTime * 10) / 10,
    on_time_delivery_rate: Math.round(onTimeRate * 10) / 10,
    production_efficiency_rate: efficiencyRate
  }

  // Cache metrics
  await redisClient.set(cacheKey, JSON.stringify(metrics), CACHE_DURATION.production)

  return metrics
}

/**
 * Get financial metrics
 */
export async function getFinancialMetrics(workspace_id: string): Promise<FinancialMetrics> {
  const cacheKey = `metrics:financial:${workspace_id}`

  // Try cache first
  const cached = await redisClient.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const thisYear = new Date(today.getFullYear(), 0, 1)
  const lastYear = new Date(today.getFullYear() - 1, 0, 1)
  const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)

  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { workspace_id },
      select: {
        total_amount: true,
        status: true,
        created_at: true
      }
    }),
    prisma.payment.findMany({
      where: { workspace_id },
      select: {
        amount: true,
        created_at: true
      }
    })
  ])

  // Calculate totals
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const revenueThisMonth = payments
    .filter(p => p.created_at >= thisMonth)
    .reduce((sum, p) => sum + p.amount, 0)
  const revenueThisYear = payments
    .filter(p => p.created_at >= thisYear)
    .reduce((sum, p) => sum + p.amount, 0)
  const revenueLastYear = payments
    .filter(p => p.created_at >= lastYear && p.created_at <= lastYearEnd)
    .reduce((sum, p) => sum + p.amount, 0)

  // Invoice statistics
  const paidInvoices = invoices.filter(i => i.status === 'PAID')
  const outstandingInvoices = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE')

  const paidAmount = paidInvoices.reduce((sum, i) => sum + i.total_amount, 0)
  const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + i.total_amount, 0)

  // Calculate averages
  const avgOrderValue = invoices.length > 0
    ? invoices.reduce((sum, i) => sum + i.total_amount, 0) / invoices.length
    : 0

  // Revenue growth rate (year-over-year)
  const growthRate = revenueLastYear > 0
    ? ((revenueThisYear - revenueLastYear) / revenueLastYear) * 100
    : 0

  // Profit margin (simplified - would need cost data)
  const profitMargin = 35 // Placeholder

  const metrics: FinancialMetrics = {
    total_revenue: totalRevenue,
    revenue_this_month: revenueThisMonth,
    revenue_this_year: revenueThisYear,
    outstanding_invoices: outstandingInvoices.length,
    outstanding_amount: outstandingAmount,
    paid_invoices: paidInvoices.length,
    paid_amount: paidAmount,
    profit_margin: profitMargin,
    average_order_value: Math.round(avgOrderValue * 100) / 100,
    revenue_growth_rate: Math.round(growthRate * 10) / 10
  }

  // Cache metrics
  await redisClient.set(cacheKey, JSON.stringify(metrics), CACHE_DURATION.financial)

  return metrics
}

/**
 * Get quality metrics
 */
export async function getQualityMetrics(workspace_id: string): Promise<QualityMetrics> {
  const cacheKey = `metrics:quality:${workspace_id}`

  // Try cache first
  const cached = await redisClient.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const [inspections, capa] = await Promise.all([
    prisma.qualityControlCheck.findMany({
      where: { workspace_id },
      select: {
        result: true,
        defects_found: true
      }
    }),
    prisma.cAPA.findMany({
      where: { workspace_id },
      select: { status: true }
    })
  ])

  const totalInspections = inspections.length
  const passedInspections = inspections.filter(i => i.result === 'PASS').length
  const failedInspections = inspections.filter(i => i.result === 'FAIL').length

  const passRate = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0

  // Calculate defect rate
  const totalDefects = inspections.reduce((sum, i) => sum + (i.defects_found || 0), 0)
  const defectRate = totalInspections > 0 ? (totalDefects / totalInspections) : 0

  // CAPA statistics
  const capaOpen = capa.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length
  const capaClosed = capa.filter(c => c.status === 'CLOSED').length

  const metrics: QualityMetrics = {
    total_inspections: totalInspections,
    passed_inspections: passedInspections,
    failed_inspections: failedInspections,
    pass_rate: Math.round(passRate * 10) / 10,
    defect_rate: Math.round(defectRate * 100) / 100,
    top_defects: [], // Would need defect code tracking
    capa_open: capaOpen,
    capa_closed: capaClosed
  }

  // Cache metrics
  await redisClient.set(cacheKey, JSON.stringify(metrics), CACHE_DURATION.quality)

  return metrics
}

/**
 * Get employee metrics
 */
export async function getEmployeeMetrics(workspace_id: string): Promise<EmployeeMetrics> {
  const cacheKey = `metrics:employee:${workspace_id}`

  // Try cache first
  const cached = await redisClient.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [employees, attendance] = await Promise.all([
    prisma.employee.findMany({
      where: { workspace_id },
      select: {
        id: true,
        name: true,
        department: true,
        status: true
      }
    }),
    prisma.attendanceLog.findMany({
      where: {
        workspace_id,
        created_at: { gte: thisMonth }
      },
      select: {
        employee_id: true,
        time_in: true,
        time_out: true
      }
    })
  ])

  const totalEmployees = employees.length
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length

  // Calculate attendance rate
  const workingDays = Math.floor((Date.now() - thisMonth.getTime()) / (1000 * 60 * 60 * 24))
  const expectedAttendance = activeEmployees * workingDays
  const actualAttendance = attendance.length
  const attendanceRate = expectedAttendance > 0
    ? (actualAttendance / expectedAttendance) * 100
    : 0

  // Department breakdown
  const departmentBreakdown: Record<string, number> = {}
  employees.forEach(emp => {
    const dept = emp.department || 'Unknown'
    departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1
  })

  const metrics: EmployeeMetrics = {
    total_employees: totalEmployees,
    active_employees: activeEmployees,
    attendance_rate: Math.round(attendanceRate * 10) / 10,
    average_productivity: 82, // Placeholder - would calculate from production data
    top_performers: [], // Would need performance tracking
    department_breakdown: departmentBreakdown
  }

  // Cache metrics
  await redisClient.set(cacheKey, JSON.stringify(metrics), CACHE_DURATION.employee)

  return metrics
}

/**
 * Get all metrics at once
 */
export async function getAllMetrics(workspace_id: string) {
  const [production, financial, quality, employee] = await Promise.all([
    getProductionMetrics(workspace_id),
    getFinancialMetrics(workspace_id),
    getQualityMetrics(workspace_id),
    getEmployeeMetrics(workspace_id)
  ])

  return {
    production,
    financial,
    quality,
    employee
  }
}

/**
 * Invalidate metrics cache
 */
export async function invalidateMetricsCache(workspace_id: string, type?: string) {
  if (type) {
    await redisClient.del(`metrics:${type}:${workspace_id}`)
  } else {
    // Invalidate all
    await Promise.all([
      redisClient.del(`metrics:production:${workspace_id}`),
      redisClient.del(`metrics:financial:${workspace_id}`),
      redisClient.del(`metrics:quality:${workspace_id}`),
      redisClient.del(`metrics:employee:${workspace_id}`)
    ])
  }
}
