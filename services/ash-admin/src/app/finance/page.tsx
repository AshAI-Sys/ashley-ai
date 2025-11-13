"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Receipt,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  Building2,
  Users,
  Wallet,
  ShoppingCart,
  Package,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

interface FinanceStats {
  // AR Stats
  total_receivables: number;
  overdue_invoices: number;
  aging_0_30: number;
  aging_31_60: number;
  aging_61_90: number;
  aging_90_plus: number;

  // AP Stats
  total_payables: number;
  overdue_bills: number;
  upcoming_payments: number;

  // P&L Stats
  total_revenue: number;
  total_cogs: number;
  gross_profit: number;
  gross_margin: number;
  net_profit: number;

  // Costing Stats
  materials_cost: number;
  labor_cost: number;
  overhead_cost: number;
}

export default function FinancePage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("current_month");

  // Fetch finance statistics
  const { data: stats, isLoading, error, refetch } = useQuery<FinanceStats>({
    queryKey: ["finance-stats", selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/finance/stats?period=${selectedPeriod}`);
      if (!response.ok) throw new Error("Failed to fetch finance stats");
      const data = await response.json();
      return data.data;
    },
    staleTime: 30000,
  });

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Finance Management
            </h1>
            <p className="text-gray-600">
              Accounts Receivable, Payable, Costing & P&L
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="current_quarter">Current Quarter</option>
              <option value="ytd">Year to Date</option>
            </select>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Receivables */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Receivables</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : formatCurrency(stats?.total_receivables || 0)}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-red-600">
                  {formatCurrency(stats?.overdue_invoices || 0)} overdue
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Payables */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Payables</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : formatCurrency(stats?.total_payables || 0)}
                  </p>
                </div>
                <div className="rounded-full bg-orange-100 p-3">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-orange-600">
                  {formatCurrency(stats?.upcoming_payments || 0)} due soon
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Gross Profit */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : formatCurrency(stats?.gross_profit || 0)}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-600">
                  {stats?.gross_margin?.toFixed(1) || 0}% margin
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Net Profit */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? "..." : formatCurrency(stats?.net_profit || 0)}
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">
                  After all expenses
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="ar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ar">
              <Receipt className="h-4 w-4 mr-2" />
              Accounts Receivable
            </TabsTrigger>
            <TabsTrigger value="ap">
              <FileText className="h-4 w-4 mr-2" />
              Accounts Payable
            </TabsTrigger>
            <TabsTrigger value="costing">
              <Package className="h-4 w-4 mr-2" />
              Costing & P&L
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <Building2 className="h-4 w-4 mr-2" />
              Compliance & Exports
            </TabsTrigger>
          </TabsList>

          {/* AR Tab */}
          <TabsContent value="ar" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/finance/invoices")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Invoices
                  </CardTitle>
                  <CardDescription>
                    Create and manage customer invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/finance/payments")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payments
                  </CardTitle>
                  <CardDescription>
                    Apply payments and allocations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/finance/credit-notes")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Credit Notes
                  </CardTitle>
                  <CardDescription>
                    Refunds and adjustments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Credit Note
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Aging Report */}
            <Card>
              <CardHeader>
                <CardTitle>Aging Report</CardTitle>
                <CardDescription>
                  Receivables aging by period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">0-30 Days</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(stats?.aging_0_30 || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">31-60 Days</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {formatCurrency(stats?.aging_31_60 || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">61-90 Days</p>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(stats?.aging_61_90 || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">90+ Days</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(stats?.aging_90_plus || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AP Tab */}
          <TabsContent value="ap" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/finance/bills")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bills
                  </CardTitle>
                  <CardDescription>
                    Supplier invoices and expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Bill
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/finance/bill-payments")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Bill Payments
                  </CardTitle>
                  <CardDescription>
                    Pay suppliers and vendors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Payment
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/finance/suppliers")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Suppliers
                  </CardTitle>
                  <CardDescription>
                    Manage supplier database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Supplier
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Costing & P&L Tab */}
          <TabsContent value="costing" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Materials Cost</CardTitle>
                  <CardDescription>BOM and fabric costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.materials_cost || 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {((stats?.materials_cost || 0) / (stats?.total_cogs || 1) * 100).toFixed(1)}% of COGS
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Labor Cost</CardTitle>
                  <CardDescription>Payroll allocations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.labor_cost || 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {((stats?.labor_cost || 0) / (stats?.total_cogs || 1) * 100).toFixed(1)}% of COGS
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overhead Cost</CardTitle>
                  <CardDescription>Utilities and other</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.overhead_cost || 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {((stats?.overhead_cost || 0) / (stats?.total_cogs || 1) * 100).toFixed(1)}% of COGS
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Brand P&L Analysis</CardTitle>
                    <CardDescription>Profitability by brand and channel</CardDescription>
                  </div>
                  <Button onClick={() => router.push("/finance/brand-pl")}>
                    View Details
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Channel Settlements</CardTitle>
                    <CardDescription>Shopee, TikTok, and marketplace imports</CardDescription>
                  </div>
                  <Button onClick={() => router.push("/finance/settlements")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Import Settlement
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Compliance & Exports Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Sales Book (BIR)
                  </CardTitle>
                  <CardDescription>
                    Export sales for BIR compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Purchase Book (BIR)
                  </CardTitle>
                  <CardDescription>
                    Export purchases for BIR compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    SSS/PhilHealth/Pag-IBIG
                  </CardTitle>
                  <CardDescription>
                    Government remittance schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    General Ledger
                  </CardTitle>
                  <CardDescription>
                    CSV/Excel for accounting software
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    VAT Report
                  </CardTitle>
                  <CardDescription>
                    Input/Output VAT summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Withholding Tax (2307)
                  </CardTitle>
                  <CardDescription>
                    EWT certificates and schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
