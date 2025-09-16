'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FinancePage;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const tabs_1 = require("@/components/ui/tabs");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const lucide_react_1 = require("lucide-react");
function FinancePage() {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [invoices, setInvoices] = (0, react_1.useState)([]);
    const [bills, setBills] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetchFinanceData();
    }, []);
    const fetchFinanceData = async () => {
        try {
            setLoading(true);

            // Fetch real data from our new API endpoints
            const [statsRes, invoicesRes, expensesRes] = await Promise.all([
                fetch('/api/finance/stats'),
                fetch('/api/finance/invoices?limit=10'),
                fetch('/api/finance/expenses?limit=10')
            ]);

            const [statsData, invoicesData, expensesData] = await Promise.all([
                statsRes.json(),
                invoicesRes.json(),
                expensesRes.json()
            ]);

            if (statsData.success) {
                setMetrics({
                    total_revenue: statsData.data.overview?.total_revenue || 0,
                    outstanding_invoices: statsData.data.overview?.outstanding_receivables || 0,
                    overdue_invoices: statsData.data.counts?.overdue_invoices || 0,
                    total_cogs: statsData.data.overview?.total_expenses || 0,
                    gross_margin: statsData.data.overview?.gross_margin || 0,
                    pending_bills: 0, // No bills model yet
                    cash_flow: statsData.data.overview?.gross_profit || 0,
                    ytd_revenue: statsData.data.overview?.total_revenue || 0
                });
            }

            if (invoicesData.success) {
                setInvoices(invoicesData.data);
            }

            if (expensesData.success) {
                setBills(expensesData.data.map(expense => ({
                    id: expense.id,
                    bill_no: expense.expense_number,
                    supplier: { name: expense.supplier || 'Unknown' },
                    total: expense.amount,
                    status: expense.approved ? 'PAID' : 'OPEN',
                    due_date: expense.expense_date,
                    days_until_due: null
                })));
            }

            setLoading(false);
        }
        catch (error) {
            console.error('Error fetching finance data:', error);
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'OVERDUE':
                return <badge_1.Badge className="bg-red-100 text-red-800">Overdue</badge_1.Badge>;
            case 'PAID':
                return <badge_1.Badge className="bg-green-100 text-green-800">Paid</badge_1.Badge>;
            case 'PENDING':
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Pending</badge_1.Badge>;
            case 'DRAFT':
                return <badge_1.Badge className="bg-gray-100 text-gray-800">Draft</badge_1.Badge>;
            case 'SENT':
                return <badge_1.Badge className="bg-blue-100 text-blue-800">Sent</badge_1.Badge>;
            case 'CANCELLED':
                return <badge_1.Badge className="bg-red-100 text-red-800">Cancelled</badge_1.Badge>;
            case 'OPEN':
                return <badge_1.Badge className="bg-blue-100 text-blue-800">Open</badge_1.Badge>;
            case 'PARTIAL':
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Partial</badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</badge_1.Badge>;
        }
    };
    const formatCurrency = (amount) => {
        return `₱${amount.toLocaleString()}`;
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    if (loading) {
        return (<dashboard_layout_1.default>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-gray-600">Loading finance data...</p>
          </div>
        </div>
      </dashboard_layout_1.default>);
    }
    return (<dashboard_layout_1.default>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
            <p className="text-gray-600">Manage invoices, payments, bills, and financial reporting</p>
          </div>
          <div className="flex gap-2">
            <button_1.Button variant="outline">
              <lucide_react_1.Download className="w-4 h-4 mr-2"/>
              Export Reports
            </button_1.Button>
            <button_1.Button>
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              New Invoice
            </button_1.Button>
          </div>
        </div>

        {/* Finance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue (YTD)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.ytd_revenue || 0)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <lucide_react_1.DollarSign className="w-6 h-6 text-green-600"/>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <lucide_react_1.TrendingUp className="w-4 h-4 text-green-500 mr-1"/>
                <span className="text-sm text-green-600">+12.5% from last month</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Outstanding Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.outstanding_invoices || 0)}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <lucide_react_1.Receipt className="w-6 h-6 text-blue-600"/>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <lucide_react_1.AlertCircle className="w-4 h-4 text-red-500 mr-1"/>
                <span className="text-sm text-red-600">{formatCurrency(metrics?.overdue_invoices || 0)} overdue</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Margin</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.gross_margin || 0}%</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <lucide_react_1.TrendingUp className="w-6 h-6 text-purple-600"/>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">COGS: {formatCurrency(metrics?.total_cogs || 0)}</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Bills</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.pending_bills || 0)}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <lucide_react_1.FileText className="w-6 h-6 text-orange-600"/>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <lucide_react_1.Calendar className="w-4 h-4 text-gray-500 mr-1"/>
                <span className="text-sm text-gray-600">Due within 30 days</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Main Content Tabs */}
        <tabs_1.Tabs defaultValue="invoices" className="space-y-4">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="invoices">Accounts Receivable</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="bills">Accounts Payable</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="costing">Cost Analysis</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="reports">Reports</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Invoices/AR Tab */}
          <tabs_1.TabsContent value="invoices" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <card_1.CardTitle>Outstanding Invoices</card_1.CardTitle>
                    <card_1.CardDescription>Manage customer invoices and payments</card_1.CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Filter className="w-4 h-4 mr-2"/>
                      Filter
                    </button_1.Button>
                    <button_1.Button size="sm">
                      <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                      New Invoice
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (<div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{invoice.invoice_number}</h3>
                            {getStatusBadge(invoice.status.toUpperCase())}
                            {invoice.days_overdue > 0 && (<badge_1.Badge className="bg-red-100 text-red-800">
                                {invoice.days_overdue} days overdue
                              </badge_1.Badge>)}
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Client:</span><br />
                              <span className="font-medium">{invoice.client?.name || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Order:</span><br />
                              <span className="font-medium">{invoice.order?.order_number || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span><br />
                              <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Balance:</span><br />
                              <span className="font-medium text-red-600">{formatCurrency(invoice.balance || invoice.total_amount)}</span>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Issued: {formatDate(invoice.created_at)}</span>
                            <span>Due: {formatDate(invoice.due_date)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                            View
                          </button_1.Button>
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.CreditCard className="w-4 h-4 mr-1"/>
                            Payment
                          </button_1.Button>
                        </div>
                      </div>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Bills/AP Tab */}
          <tabs_1.TabsContent value="bills" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <card_1.CardTitle>Pending Bills</card_1.CardTitle>
                    <card_1.CardDescription>Manage supplier bills and payments</card_1.CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Filter className="w-4 h-4 mr-2"/>
                      Filter
                    </button_1.Button>
                    <button_1.Button size="sm">
                      <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                      New Bill
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {bills.map((bill) => (<div key={bill.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{bill.bill_no}</h3>
                            {getStatusBadge(bill.status)}
                            {bill.days_until_due && (<badge_1.Badge className="bg-yellow-100 text-yellow-800">
                                Due in {bill.days_until_due} days
                              </badge_1.Badge>)}
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
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                            View
                          </button_1.Button>
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.CreditCard className="w-4 h-4 mr-1"/>
                            Pay
                          </button_1.Button>
                        </div>
                      </div>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Cost Analysis Tab */}
          <tabs_1.TabsContent value="costing" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Cost Analysis & P&L</card_1.CardTitle>
                <card_1.CardDescription>Manufacturing costs and profitability by order/brand</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-center py-12">
                  <lucide_react_1.FileText className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                  <p className="text-gray-600 mb-4">Cost analysis tools will be available here</p>
                  <p className="text-sm text-gray-500">Material costs, labor allocation, overhead distribution, and P&L analysis</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Reports Tab */}
          <tabs_1.TabsContent value="reports" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Financial Reports</card_1.CardTitle>
                <card_1.CardDescription>Export financial data and compliance reports</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.Receipt className="w-6 h-6"/>
                    <span>Aging Report</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.FileText className="w-6 h-6"/>
                    <span>Sales Book</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.Building2 className="w-6 h-6"/>
                    <span>Purchase Book</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.DollarSign className="w-6 h-6"/>
                    <span>P&L Statement</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.TrendingUp className="w-6 h-6"/>
                    <span>Cash Flow</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.Users className="w-6 h-6"/>
                    <span>BIR Reports</span>
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}
