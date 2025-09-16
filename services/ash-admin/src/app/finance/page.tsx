'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
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
  Filter
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
}

interface Invoice {
  id: string
  invoice_no: string
  client: { name: string }
  brand: { name: string }
  total: number
  balance: number
  status: string
  date_issued: string
  due_date: string
  days_overdue?: number
}

interface Bill {
  id: string
  bill_no: string
  supplier: { name: string }
  total: number
  status: string
  due_date: string
  days_until_due?: number
}

export default function FinancePage() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      setLoading(true)

      // Mock data for now - would be real API calls
      setTimeout(() => {
        setMetrics({
          total_revenue: 2450000,
          outstanding_invoices: 185000,
          overdue_invoices: 45000,
          total_cogs: 1680000,
          gross_margin: 31.4,
          pending_bills: 98000,
          cash_flow: 67000,
          ytd_revenue: 28500000
        })

        setInvoices([
          {
            id: '1',
            invoice_no: 'BRAND-2025-001',
            client: { name: 'Nike Inc' },
            brand: { name: 'Nike Performance' },
            total: 125000,
            balance: 125000,
            status: 'OVERDUE',
            date_issued: '2024-12-01',
            due_date: '2024-12-31',
            days_overdue: 15
          },
          {
            id: '2',
            invoice_no: 'BRAND-2025-002',
            client: { name: 'Adidas Corp' },
            brand: { name: 'Adidas Originals' },
            total: 89500,
            balance: 45000,
            status: 'PARTIAL',
            date_issued: '2025-01-05',
            due_date: '2025-02-05',
          },
          {
            id: '3',
            invoice_no: 'BRAND-2025-003',
            client: { name: 'Under Armour' },
            brand: { name: 'UA Sports' },
            total: 156000,
            balance: 156000,
            status: 'OPEN',
            date_issued: '2025-01-10',
            due_date: '2025-02-10',
          }
        ])

        setBills([
          {
            id: '1',
            bill_no: 'SUPP-001-2025',
            supplier: { name: 'Textile Corp Ltd' },
            total: 45000,
            status: 'OPEN',
            due_date: '2025-01-25',
            days_until_due: 10
          },
          {
            id: '2',
            bill_no: 'SUPP-002-2025',
            supplier: { name: 'Pacific Inks Inc' },
            total: 28500,
            status: 'OPEN',
            due_date: '2025-01-30',
            days_until_due: 15
          }
        ])

        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching finance data:', error)
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading finance data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
            <p className="text-gray-600">Manage invoices, payments, bills, and financial reporting</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Finance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5% from last month</span>
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
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Outstanding Invoices</CardTitle>
                    <CardDescription>Manage customer invoices and payments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Invoice
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{invoice.invoice_no}</h3>
                            {getStatusBadge(invoice.status)}
                            {invoice.days_overdue && (
                              <Badge className="bg-red-100 text-red-800">
                                {invoice.days_overdue} days overdue
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Client:</span><br />
                              <span className="font-medium">{invoice.client.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Brand:</span><br />
                              <span className="font-medium">{invoice.brand.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span><br />
                              <span className="font-medium">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Balance:</span><br />
                              <span className="font-medium text-red-600">{formatCurrency(invoice.balance)}</span>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Issued: {formatDate(invoice.date_issued)}</span>
                            <span>Due: {formatDate(invoice.due_date)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bills/AP Tab */}
          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Bills</CardTitle>
                    <CardDescription>Manage supplier bills and payments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Bill
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.map((bill) => (
                    <div key={bill.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{bill.bill_no}</h3>
                            {getStatusBadge(bill.status)}
                            {bill.days_until_due && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Due in {bill.days_until_due} days
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Supplier:</span><br />
                              <span className="font-medium">{bill.supplier.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span><br />
                              <span className="font-medium">{formatCurrency(bill.total)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due Date:</span><br />
                              <span className="font-medium">{formatDate(bill.due_date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <CreditCard className="w-4 h-4 mr-1" />
                            Pay
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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