"use client";

import { useState, useEffect } from "react";
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
  const [kpiData, setKpiData] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics?type=${selectedReport}&range=${timeRange}`);
        const result = await response.json();

        if (response.ok) {
          setKpiData(result.data);
          setBreakdown(result.data.breakdown || []);
        } else {
          setError(result.error || "Failed to fetch analytics");
        }
      } catch (error: any) {
        setError(error.message || "Network error");
        console.error("[Reports] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedReport, timeRange]);

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

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error loading analytics</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {!loading && kpiData && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {selectedReport === "sales" && (
            <>
              <KPICard title="Total Revenue" value={kpiData.totalRevenue} change={kpiData.growth} />
              <KPICard title="Total Orders" value={kpiData.orders} />
              <KPICard title="Avg Order Value" value={kpiData.avgOrderValue} />
              <KPICard title="Growth Rate" value={kpiData.growth} />
            </>
          )}

          {selectedReport === "production" && (
            <>
              <KPICard title="Units Produced" value={kpiData.unitsProduced} />
              <KPICard title="Efficiency Rate" value={kpiData.efficiency} />
              <KPICard title="Defect Rate" value={kpiData.defectRate} />
              <KPICard title="On-Time Delivery" value={kpiData.onTimeDelivery} />
            </>
          )}

          {selectedReport === "inventory" && (
            <>
              <KPICard title="Total Value" value={kpiData.totalValue} />
              <KPICard title="Turnover Rate" value={kpiData.turnoverRate} />
              <KPICard title="Stockouts" value={kpiData.stockouts} />
              <KPICard title="Excess Stock" value={kpiData.excessStock} />
            </>
          )}

          {selectedReport === "financial" && (
            <>
              <KPICard title="Gross Profit" value={kpiData.grossProfit} />
              <KPICard title="Profit Margin" value={kpiData.margin} />
              <KPICard title="Total Expenses" value={kpiData.expenses} />
              <KPICard title="Net Profit" value={kpiData.netProfit} />
            </>
          )}

          {selectedReport === "hr" && (
            <>
              <KPICard title="Total Employees" value={kpiData.totalEmployees} />
              <KPICard title="Attendance Rate" value={kpiData.attendance} />
              <KPICard title="Productivity" value={kpiData.productivity} />
              <KPICard title="Payroll Cost" value={kpiData.payrollCost} />
            </>
          )}
        </div>
      )}

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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-gray-500">Loading breakdown...</div>
              </div>
            ) : breakdown && breakdown.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="p-3 font-semibold text-gray-700">Category</th>
                    <th className="p-3 font-semibold text-gray-700">Value</th>
                    <th className="p-3 font-semibold text-gray-700">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {breakdown.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3">{item.category}</td>
                      <td className="p-3 font-semibold">{item.value}</td>
                      <td className={`p-3 ${item.change.startsWith("+") ? "text-green-600" : item.change.startsWith("-") ? "text-red-600" : "text-gray-600"}`}>
                        {item.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-gray-500">
                  <BarChart3 className="mx-auto mb-2 h-8 w-8" />
                  <p className="text-sm">No breakdown data available</p>
                </div>
              </div>
            )}
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
