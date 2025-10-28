"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Table,
  Plus,
  Play,
  Download,
  Share2,
  Star,
  Filter,
  Calendar,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "reports" | "dashboards" | "heatmap" | "profit"
  >("reports");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchDashboards();
    fetchHeatmapData();
    fetchProfitData();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports", {
        headers: {
          "x-workspace-id": "default-workspace",
        },
      });
      const data = await response.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboards = async () => {
    try {
      const response = await fetch("/api/dashboards", {
        headers: {
          "x-workspace-id": "default-workspace",
        },
      });
      const data = await response.json();
      if (data.success) {
        setDashboards(data.dashboards || []);
      }
    } catch (error) {
      console.error("Error fetching dashboards:", error);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      const response = await fetch(
        `/api/analytics/heatmap?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            "x-workspace-id": "default-workspace",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setHeatmapData(data);
      }
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
    }
  };

  const fetchProfitData = async () => {
    try {
      const response = await fetch("/api/analytics/profit", {
        headers: {
          "x-workspace-id": "default-workspace",
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfitData(data);
      }
    } catch (error) {
      console.error("Error fetching profit data:", error);
    }
  };

  const executeReport = async (reportId: string) => {
    try {
      const response = await fetch("/api/reports/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": "default-workspace",
          "x-user-id": "system",
        },
        body: JSON.stringify({ report_id: reportId }),
      });
      const data = await response.json();
      if (data.success) {
        alert(
          `Report executed successfully! ${data.metadata.row_count} rows returned in ${data.metadata.execution_time}ms`
        );
      }
    } catch (error) {
      console.error("Error executing report:", error);
      alert("Error executing report");
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "CHART":
        return <BarChart3 className="h-5 w-5" />;
      case "PIVOT":
        return <PieChart className="h-5 w-5" />;
      case "TABLE":
        return <Table className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getDataSourceBadge = (source: string) => {
    const colors: any = {
      ORDERS: "bg-blue-100 text-blue-800",
      PRODUCTION: "bg-green-100 text-green-800",
      FINANCE: "bg-purple-100 text-purple-800",
      HR: "bg-orange-100 text-orange-800",
      INVENTORY: "bg-yellow-100 text-yellow-800",
      QUALITY: "bg-red-100 text-red-800",
    };
    return colors[source] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Advanced Analytics
        </h1>
        <p className="mt-1 text-gray-600">
          Create custom reports and executive dashboards with real-time data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Total Reports
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.length}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Dashboards
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboards.length}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Favorites
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.is_favorite).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Public Reports
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.is_public).length}
              </p>
            </div>
            <Share2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("reports")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "reports"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Custom Reports
            </button>
            <button
              onClick={() => setActiveTab("dashboards")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "dashboards"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Executive Dashboards
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "heatmap"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Production Heatmap
            </button>
            <button
              onClick={() => setActiveTab("profit")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "profit"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Profit Analysis
            </button>
          </div>
        </div>

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:bg-gray-800">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:bg-gray-800">
                  <Calendar className="h-4 w-4" />
                  <span>Date Range</span>
                </button>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create Report</span>
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-500" />
                <p className="mt-2 text-gray-600">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-lg bg-gray-50 py-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-500" />
                <p className="mt-4 text-gray-600">No reports created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Create Your First Report
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          {getReportIcon(report.report_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {report.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {report.report_type}
                          </p>
                        </div>
                      </div>
                      {report.is_favorite && (
                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      )}
                    </div>

                    {report.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {report.description}
                      </p>
                    )}

                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getDataSourceBadge(
                          report.data_source
                        )}`}
                      >
                        {report.data_source}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {report.view_count} views
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        by {report.creator?.first_name}{" "}
                        {report.creator?.last_name}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => executeReport(report.id)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Run Report"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-50"
                          title="Export"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-50"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dashboards Tab */}
        {activeTab === "dashboards" && (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Executive Dashboards
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create Dashboard</span>
              </button>
            </div>

            {dashboards.length === 0 ? (
              <div className="rounded-lg bg-gray-50 py-12 text-center">
                <PieChart className="mx-auto h-12 w-12 text-gray-500" />
                <p className="mt-4 text-gray-600">No dashboards created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Create Your First Dashboard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {dashboards.map(dashboard => (
                  <div
                    key={dashboard.id}
                    className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {dashboard.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {dashboard.description}
                        </p>
                      </div>
                      {dashboard.is_default && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {dashboard.widgets_data?.length || 0} widgets
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {dashboard.dashboard_type}
                        </span>
                      </div>
                      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Production Heatmap Tab */}
        {activeTab === "heatmap" && (
          <div className="p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Production Efficiency Heatmap
            </h2>

            {heatmapData ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-600">
                      Avg Efficiency
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {heatmapData.stats?.avgEfficiency?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800">
                    <p className="text-xs font-medium text-green-600">
                      Total Output
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {heatmapData.stats?.totalOutput?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <p className="text-xs font-medium text-purple-600">
                      Target
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {heatmapData.stats?.totalTarget?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-medium text-red-600">
                      Avg Defect Rate
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {heatmapData.stats?.avgDefectRate?.toFixed(2) || 0}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs font-medium text-orange-600">
                      Total Downtime
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {heatmapData.stats?.totalDowntime || 0} mins
                    </p>
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            Station
                          </th>
                          {Array.from({ length: 24 }, (_, i) => (
                            <th
                              key={i}
                              className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500"
                            >
                              {i}:00
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {[
                          "CUTTING",
                          "PRINTING",
                          "SEWING",
                          "QC",
                          "FINISHING",
                        ].map(station => (
                          <tr key={station}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {station}
                            </td>
                            {Array.from({ length: 24 }, (_, hour) => {
                              const dataPoint = heatmapData.heatmap?.find(
                                (d: any) =>
                                  d.station_type === station && d.hour === hour
                              );
                              const efficiency = dataPoint?.avg_efficiency || 0;
                              const bgColor =
                                efficiency >= 90
                                  ? "bg-green-500"
                                  : efficiency >= 75
                                    ? "bg-green-300"
                                    : efficiency >= 50
                                      ? "bg-yellow-300"
                                      : efficiency > 0
                                        ? "bg-red-300"
                                        : "bg-gray-100";

                              return (
                                <td
                                  key={hour}
                                  className={`px-3 py-4 text-center text-xs ${bgColor}`}
                                  title={`${station} at ${hour}:00 - ${efficiency.toFixed(1)}% efficient`}
                                >
                                  {efficiency > 0 ? efficiency.toFixed(0) : "-"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-500">
                    <strong>Legend:</strong>
                    <span className="ml-2 inline-block h-4 w-4 bg-green-500 align-middle"></span>{" "}
                    90-100%
                    <span className="ml-2 inline-block h-4 w-4 bg-green-300 align-middle"></span>{" "}
                    75-89%
                    <span className="ml-2 inline-block h-4 w-4 bg-yellow-300 align-middle"></span>{" "}
                    50-74%
                    <span className="ml-2 inline-block h-4 w-4 bg-red-300 align-middle"></span>{" "}
                    Below 50%
                    <span className="ml-2 inline-block h-4 w-4 bg-gray-100 align-middle"></span>{" "}
                    No data
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 py-12 text-center">
                <p className="text-gray-600 dark:text-gray-500">
                  No heatmap data available. Data will appear as production runs
                  are tracked.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Profit Analysis Tab */}
        {activeTab === "profit" && (
          <div className="p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Profit Margin Analysis
            </h2>

            {profitData ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800">
                    <p className="text-xs font-medium text-green-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      ₱{profitData.stats?.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-600">
                      Gross Profit
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      ₱
                      {profitData.stats?.totalGrossProfit?.toLocaleString() ||
                        0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <p className="text-xs font-medium text-purple-600">
                      Avg Gross Margin
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {profitData.stats?.avgGrossMargin?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                    <p className="text-xs font-medium text-indigo-600">
                      Avg Net Margin
                    </p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {profitData.stats?.avgNetMargin?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>

                {/* Client Comparison */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:bg-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Profitability by Client
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            Client
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                            Orders
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                            Profit
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                            Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {profitData.clientComparison
                          ?.slice(0, 10)
                          .map((client: any) => (
                            <tr
                              key={client.client_id}
                              className="hover:bg-gray-50 dark:bg-gray-800"
                            >
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                {client.client_name}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                                {client.orders}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                                ₱{client.total_revenue.toLocaleString()}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                                ₱{client.total_profit.toLocaleString()}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    client.avg_margin >= 30
                                      ? "bg-green-100 text-green-800"
                                      : client.avg_margin >= 20
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {client.avg_margin.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 py-12 text-center">
                <p className="text-gray-600 dark:text-gray-500">
                  No profit analysis data available. Analyze your orders to see
                  profitability insights.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Create {activeTab === "reports" ? "Report" : "Dashboard"}
            </h3>
            <p className="mb-4 text-gray-600">
              Custom report builder is in development. For now, you can generate reports through:
            </p>
            <ul className="mb-6 space-y-2 text-sm text-gray-700">
              <li>• Finance dashboard for financial reports</li>
              <li>• HR & Payroll for employee reports</li>
              <li>• Quality Control analytics for QC insights</li>
              <li>• Production dashboard for manufacturing metrics</li>
            </ul>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
