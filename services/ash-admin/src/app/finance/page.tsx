'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTableSkeleton } from '@/components/ui/loading-skeletons'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorAlert } from '@/components/ui/error-alert'
import DashboardLayout from '@/components/dashboard-layout'
import { exportInvoices } from '@/lib/export'
import {
  DollarSign,
  Receipt,
  FileText,
  CreditCard,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Building2,
  Plus,
  Eye,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

interface FinanceMetrics {
  total_revenue: number
  outstanding_invoices: number
  overdue_invoices: number
  total_cogs: number
  gross_margin: number
  pending_bills: number
  cash_flow: number
  ytd_revenue: number
  revenue_growth?: number
}

interface Invoice {
  id: string
  invoice_no: string
  client: { name: string } | null
  brand: { name: string } | null
  total: number
  balance: number
  status: string
  date_issued: string
  due_date: string
  days_overdue?: number | null
}

interface Bill {
  id: string
  bill_no: string
  supplier: { name: string } | null
  total: number
  status: string
  due_date: string
  days_until_due?: number | null
}

export default function FinancePage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch finance metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
    isFetching: metricsFetching
  } = useQuery({
    queryKey: ['finance-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/finance/stats')
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to fetch finance metrics')
      return data.data as FinanceMetrics
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch invoices
  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
    isFetching: invoicesFetching
  } = useQuery({
    queryKey: ['finance-invoices', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/finance/invoices?${params}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to fetch invoices')
      return data.data as Invoice[]
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch bills
  const {
    data: bills = [],
    isLoading: billsLoading,
    error: billsError,
    refetch: refetchBills,
    isFetching: billsFetching
  } = useQuery({
    queryKey: ['finance-bills'],
    queryFn: async () => {
      const response = await fetch('/api/finance/bills')
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to fetch bills')

      // Calculate days_until_due for each bill
      return (data.data || []).map((bill: any) => {
        const today = new Date()
        const dueDate = new Date(bill.due_date)
        const daysUntilDue = bill.status !== 'PAID' && dueDate > today
          ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : null

        return {
          ...bill,
          days_until_due: daysUntilDue
        }
      })
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  const handleRefreshAll = () => {
    refetchMetrics()
    refetchInvoices()
    refetchBills()
  }

  const isLoading = metricsLoading || invoicesLoading || billsLoading
  const isFetching = metricsFetching || invoicesFetching || billsFetching

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'OPEN':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
      case 'PARTIAL':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Finance Management</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage invoices, payments, bills, and financial reporting</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isFetching}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">{isFetching ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => exportInvoices(invoices, 'excel')}
              disabled={invoices.length === 0}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Export</span>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Error Alerts */}
        {metricsError && (
          <ErrorAlert
            title="Failed to load metrics"
            message={metricsError.message}
            retry={refetchMetrics}
          />
        )}

        {/* Finance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue (YTD)</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.ytd_revenue || 0)}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    {(metrics?.revenue_growth || 0) >= 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+{metrics?.revenue_growth?.toFixed(1) || 0}% from last month</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-600">{metrics?.revenue_growth?.toFixed(1) || 0}% from last month</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Outstanding Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.outstanding_invoices || 0)}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">{formatCurrency(metrics?.overdue_invoices || 0)} overdue</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Margin</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.gross_margin || 0}%</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">COGS: {formatCurrency(metrics?.total_cogs || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Bills</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.pending_bills || 0)}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">Due within 30 days</span>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Accounts Receivable</TabsTrigger>
            <TabsTrigger value="bills">Accounts Payable</TabsTrigger>
            <TabsTrigger value="costing">Cost Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Invoices/AR Tab */}
          <TabsContent value="invoices" className="space-y-4">
            {invoicesError && (
              <ErrorAlert
                title="Failed to load invoices"
                message={invoicesError.message}
                retry={refetchInvoices}
              />
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Outstanding Invoices</CardTitle>
                    <CardDescription>Manage customer invoices and payments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="OPEN">Open</option>
                      <option value="PARTIAL">Partial</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Invoice
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <DataTableSkeleton rows={5} />
                ) : invoices.length === 0 ? (
                  <EmptyState
                    icon={Receipt}
                    title="No invoices found"
                    description={statusFilter !== 'all' ? `No invoices with status "${statusFilter}"` : "No invoices in the system yet"}
                    action={{
                      label: "Create Invoice",
                      onClick: () => console.log('Create invoice')
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <h3 className="font-semibold truncate">{invoice.invoice_no}</h3>
                            {getStatusBadge(invoice.status)}
                            {invoice.days_overdue && (
                              <Badge className="bg-red-100 text-red-800 w-fit">
                                {invoice.days_overdue}d overdue
                              </Badge>
                            )}
                          </div>

                          {/* Details Grid - Optimized for mobile */}
                          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Client</span>
                              <span className="font-medium mt-0.5 truncate">{invoice.client?.name || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Brand</span>
                              <span className="font-medium mt-0.5 truncate">{invoice.brand?.name || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Amount</span>
                              <span className="font-medium mt-0.5">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Balance</span>
                              <span className="font-medium mt-0.5 text-red-600">{formatCurrency(invoice.balance)}</span>
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                            <span>Issued: {formatDate(invoice.date_issued)}</span>
                            <span>Due: {formatDate(invoice.due_date)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <Eye className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <CreditCard className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Payment</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bills/AP Tab */}
          <TabsContent value="bills" className="space-y-4">
            {billsError && (
              <ErrorAlert
                title="Failed to load bills"
                message={billsError.message}
                retry={refetchBills}
              />
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Bills</CardTitle>
                    <CardDescription>Manage supplier bills and payments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Bill
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {billsLoading ? (
                  <DataTableSkeleton rows={3} />
                ) : bills.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No bills found"
                    description="No pending bills in the system"
                    action={{
                      label: "Create Bill",
                      onClick: () => console.log('Create bill')
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {bills.map((bill) => (
                    <div key={bill.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <h3 className="font-semibold truncate">{bill.bill_no}</h3>
                            {getStatusBadge(bill.status)}
                            {bill.days_until_due && (
                              <Badge className="bg-yellow-100 text-yellow-800 w-fit">
                                Due in {bill.days_until_due}d
                              </Badge>
                            )}
                          </div>

                          {/* Details Grid - Optimized for mobile */}
                          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Supplier</span>
                              <span className="font-medium mt-0.5 truncate">{bill.supplier?.name || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Amount</span>
                              <span className="font-medium mt-0.5">{formatCurrency(bill.total)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500">Due Date</span>
                              <span className="font-medium mt-0.5">{formatDate(bill.due_date)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <Eye className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <CreditCard className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Pay</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Analysis Tab */}
          <TabsContent value="costing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis & P&L</CardTitle>
                <CardDescription>Manufacturing costs and profitability by order/brand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Cost analysis tools will be available here</p>
                  <p className="text-sm text-gray-500">Material costs, labor allocation, overhead distribution, and P&L analysis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Export financial data and compliance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Receipt className="w-6 h-6" />
                    <span>Aging Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText className="w-6 h-6" />
                    <span>Sales Book</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Building2 className="w-6 h-6" />
                    <span>Purchase Book</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <DollarSign className="w-6 h-6" />
                    <span>P&L Statement</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Cash Flow</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Users className="w-6 h-6" />
                    <span>BIR Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}