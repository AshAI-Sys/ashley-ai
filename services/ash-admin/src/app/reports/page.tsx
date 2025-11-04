"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  Calendar,
  Filter,
  ArrowLeft,
} from "lucide-react";

type ReportType = "sales" | "production" | "inventory" | "financial" | "hr";
type TimeRange = "today" | "week" | "month" | "quarter" | "year";

export default function ReportsPage() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<ReportType>("sales");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [loading, setLoading] = useState(false);

  // Mock data - in production, fetch from API
  const kpiData = {
    sales: {
      totalRevenue: "₱1,245,000",
      growth: "+12.5%",
      orders: "234",
      avgOrderValue: "₱5,320",
    },
    production: {
      unitsProduced: "12,450",
      efficiency: "94.2%",
      defectRate: "1.8%",
      onTimeDelivery: "96.5%",
    },
    inventory: {
      totalValue: "₱850,000",
      turnoverRate: "8.2x",
      stockouts: "3",
      excessStock: "₱45,000",
    },
    financial: {
      grossProfit: "₱425,000",
      margin: "34.2%",
      expenses: "₱180,000",
      netProfit: "₱245,000",
    },
    hr: {
      totalEmployees: "85",
      attendance: "96.8%",
      productivity: "92.5%",
      payrollCost: "₱380,000",
    },
  };

  const reportTypes = [
    { id: "sales", name: "Sales Report", icon: DollarSign, color: "bg-green-500" },
    { id: "production", name: "Production Report", icon: Package, color: "bg-blue-500" },
    { id: "inventory", name: "Inventory Report", icon: BarChart3, color: "bg-purple-500" },
    { id: "financial", name: "Financial Report", icon: TrendingUp, color: "bg-orange-500" },
    { id: "hr", name: "HR Report", icon: Users, color: "bg-pink-500" },
  ];

  const handleExport = () => {
    setLoading(true);
    // Simulate export
    setTimeout(() => {
      setLoading(false);
      alert("Report exported successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive business intelligence and insights</p>
      </div>

      {/* Report Type Selector */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id as ReportType)}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
              selectedReport === report.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`rounded-lg ${report.color} p-2 text-white`}>
              <report.icon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{report.name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          More Filters
        </button>

        <div className="ml-auto">
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {loading ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {selectedReport === "sales" && (
          <>
            <KPICard title="Total Revenue" value={kpiData.sales.totalRevenue} change={kpiData.sales.growth} />
            <KPICard title="Total Orders" value={kpiData.sales.orders} />
            <KPICard title="Avg Order Value" value={kpiData.sales.avgOrderValue} />
            <KPICard title="Growth Rate" value={kpiData.sales.growth} />
          </>
        )}

        {selectedReport === "production" && (
          <>
            <KPICard title="Units Produced" value={kpiData.production.unitsProduced} />
            <KPICard title="Efficiency Rate" value={kpiData.production.efficiency} change="+2.3%" />
            <KPICard title="Defect Rate" value={kpiData.production.defectRate} change="-0.5%" />
            <KPICard title="On-Time Delivery" value={kpiData.production.onTimeDelivery} change="+1.2%" />
          </>
        )}

        {selectedReport === "inventory" && (
          <>
            <KPICard title="Total Value" value={kpiData.inventory.totalValue} />
            <KPICard title="Turnover Rate" value={kpiData.inventory.turnoverRate} />
            <KPICard title="Stockouts" value={kpiData.inventory.stockouts} />
            <KPICard title="Excess Stock" value={kpiData.inventory.excessStock} />
          </>
        )}

        {selectedReport === "financial" && (
          <>
            <KPICard title="Gross Profit" value={kpiData.financial.grossProfit} change="+15.2%" />
            <KPICard title="Profit Margin" value={kpiData.financial.margin} />
            <KPICard title="Total Expenses" value={kpiData.financial.expenses} />
            <KPICard title="Net Profit" value={kpiData.financial.netProfit} change="+18.5%" />
          </>
        )}

        {selectedReport === "hr" && (
          <>
            <KPICard title="Total Employees" value={kpiData.hr.totalEmployees} />
            <KPICard title="Attendance Rate" value={kpiData.hr.attendance} change="+1.2%" />
            <KPICard title="Productivity" value={kpiData.hr.productivity} />
            <KPICard title="Payroll Cost" value={kpiData.hr.payrollCost} />
          </>
        )}
      </div>

      {/* Chart/Table Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Trend Analysis</h2>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
            <div className="text-center text-gray-500">
              <BarChart3 className="mx-auto mb-2 h-12 w-12" />
              <p>Chart visualization would go here</p>
              <p className="text-sm">(Integration with Chart.js/Recharts)</p>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Detailed Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold text-gray-700">Category</th>
                  <th className="p-3 font-semibold text-gray-700">Value</th>
                  <th className="p-3 font-semibold text-gray-700">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="p-3">Category A</td>
                  <td className="p-3 font-semibold">₱250,000</td>
                  <td className="p-3 text-green-600">+12.5%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">Category B</td>
                  <td className="p-3 font-semibold">₱180,000</td>
                  <td className="p-3 text-green-600">+8.2%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">Category C</td>
                  <td className="p-3 font-semibold">₱120,000</td>
                  <td className="p-3 text-red-600">-3.5%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">Category D</td>
                  <td className="p-3 font-semibold">₱95,000</td>
                  <td className="p-3 text-green-600">+5.8%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Key Insights & Recommendations</h2>
        <div className="space-y-3">
          <InsightCard
            type="success"
            message="Sales are up 12.5% this month compared to last month"
          />
          <InsightCard
            type="warning"
            message="Inventory turnover is slower than industry average - consider promotions"
          />
          <InsightCard
            type="info"
            message="Production efficiency improved by 2.3% - new workflow optimizations working"
          />
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change?: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {change && (
        <p
          className={`mt-1 text-sm font-medium ${
            change.startsWith("+") ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}

function InsightCard({ type, message }: { type: "success" | "warning" | "info"; message: string }) {
  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[type]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}
