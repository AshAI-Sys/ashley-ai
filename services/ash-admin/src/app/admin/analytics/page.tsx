'use client';

import { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';

export default function AnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'dashboards'>('reports');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchDashboards();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports', {
        headers: {
          'x-workspace-id': 'default-workspace',
        },
      });
      const data = await response.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboards = async () => {
    try {
      const response = await fetch('/api/dashboards', {
        headers: {
          'x-workspace-id': 'default-workspace',
        },
      });
      const data = await response.json();
      if (data.success) {
        setDashboards(data.dashboards || []);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    }
  };

  const executeReport = async (reportId: string) => {
    try {
      const response = await fetch('/api/reports/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': 'default-workspace',
          'x-user-id': 'system',
        },
        body: JSON.stringify({ report_id: reportId }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Report executed successfully! ${data.metadata.row_count} rows returned in ${data.metadata.execution_time}ms`);
      }
    } catch (error) {
      console.error('Error executing report:', error);
      alert('Error executing report');
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'CHART': return <BarChart3 className="h-5 w-5" />;
      case 'PIVOT': return <PieChart className="h-5 w-5" />;
      case 'TABLE': return <Table className="h-5 w-5" />;
      default: return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getDataSourceBadge = (source: string) => {
    const colors: any = {
      ORDERS: 'bg-blue-100 text-blue-800',
      PRODUCTION: 'bg-green-100 text-green-800',
      FINANCE: 'bg-purple-100 text-purple-800',
      HR: 'bg-orange-100 text-orange-800',
      INVENTORY: 'bg-yellow-100 text-yellow-800',
      QUALITY: 'bg-red-100 text-red-800',
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-600 mt-1">
          Create custom reports and executive dashboards with real-time data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dashboards</p>
              <p className="text-2xl font-bold text-gray-900">{dashboards.length}</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.is_favorite).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Public Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.is_public).length}
              </p>
            </div>
            <Share2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Custom Reports
            </button>
            <button
              onClick={() => setActiveTab('dashboards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Executive Dashboards
            </button>
          </div>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Calendar className="h-4 w-4" />
                  <span>Date Range</span>
                </button>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create Report</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-600 mt-2">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-600 mt-4">No reports created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Report
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          {getReportIcon(report.report_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{report.name}</h3>
                          <p className="text-xs text-gray-500">{report.report_type}</p>
                        </div>
                      </div>
                      {report.is_favorite && (
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>

                    {report.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {report.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getDataSourceBadge(
                          report.data_source
                        )}`}
                      >
                        {report.data_source}
                      </span>
                      <span className="text-xs text-gray-500">
                        {report.view_count} views
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        by {report.creator?.first_name} {report.creator?.last_name}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => executeReport(report.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Run Report"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Export"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
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
        {activeTab === 'dashboards' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Executive Dashboards</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create Dashboard</span>
              </button>
            </div>

            {dashboards.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <PieChart className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-600 mt-4">No dashboards created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Dashboard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboards.map((dashboard) => (
                  <div
                    key={dashboard.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {dashboard.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {dashboard.description}
                        </p>
                      </div>
                      {dashboard.is_default && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">
                          {dashboard.widgets_data?.length || 0} widgets
                        </span>
                        <span className="text-xs text-gray-500">
                          {dashboard.dashboard_type}
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Create {activeTab === 'reports' ? 'Report' : 'Dashboard'}
            </h3>
            <p className="text-gray-600 mb-6">
              Report builder interface coming soon...
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
