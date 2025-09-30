'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Play,
  Pause,
  AlertTriangle,
  Bell,
  Settings,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Link,
  RefreshCw
} from 'lucide-react';

interface AutomationStats {
  summary: {
    automation_rules: {
      total: number;
      active: number;
      inactive: number;
      recent_executions: number;
    };
    notifications: {
      total: number;
      pending: number;
      sent: number;
      failed: number;
      success_rate: number;
    };
    alerts: {
      total: number;
      resolved: number;
      unresolved: number;
      resolution_rate: number;
    };
    integrations: {
      total: number;
      connected: number;
      disconnected: number;
      connection_rate: number;
    };
    executions: {
      total: number;
      successful: number;
      failed: number;
      success_rate: number;
    };
  };
  recent_activity: Array<{
    type: string;
    title: string;
    status: string;
    timestamp: string;
    details: any;
  }>;
}

export default function AutomationPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // React Query: Stats
  const {
    data: stats,
    isLoading: loading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['automation-stats', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/automation/stats?time_range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch automation stats');
      const data = await response.json();
      return data.success ? data.data : null;
    },
    staleTime: 30000,
    refetchInterval: 60000
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }: any) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold text-${color}-600`}>{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 bg-${color}-50 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {Math.abs(trend)}% from last period
          </div>
        </div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }: { activity: any }) => {
    const getStatusColor = (status: string) => {
      if (!status) return 'text-gray-600 bg-gray-50';
      switch (status.toUpperCase()) {
        case 'SUCCESS': case 'SENT': case 'RESOLVED': return 'text-green-600 bg-green-50';
        case 'FAILED': case 'OPEN': return 'text-red-600 bg-red-50';
        case 'PENDING': case 'ACKNOWLEDGED': return 'text-yellow-600 bg-yellow-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'EXECUTION': return <Zap className="h-4 w-4" />;
        case 'ALERT': return <AlertTriangle className="h-4 w-4" />;
        case 'NOTIFICATION': return <Bell className="h-4 w-4" />;
        default: return <Activity className="h-4 w-4" />;
      }
    };

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {getTypeIcon(activity.type)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
            <p className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
          {activity.status}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation & Reminders</h1>
          <p className="text-gray-600">Manage workflows, notifications, and system integrations</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
            Create Rule
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'rules', name: 'Automation Rules', icon: Zap },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
            { id: 'integrations', name: 'Integrations', icon: Link },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Rules"
              value={stats.summary.automation_rules.active}
              subtitle={`${stats.summary.automation_rules.recent_executions} recent executions`}
              icon={Zap}
              color="green"
            />

            <StatCard
              title="Notifications"
              value={stats.summary.notifications.total}
              subtitle={`${stats.summary.notifications.success_rate}% success rate`}
              icon={Bell}
              color="blue"
            />

            <StatCard
              title="Active Alerts"
              value={stats.summary.alerts.unresolved}
              subtitle={`${stats.summary.alerts.resolution_rate}% resolved`}
              icon={AlertTriangle}
              color="red"
            />

            <StatCard
              title="Integrations"
              value={stats.summary.integrations.connected}
              subtitle={`${stats.summary.integrations.connection_rate}% connected`}
              icon={Link}
              color="purple"
            />
          </div>

          {/* Execution Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Execution Performance</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {stats.summary.executions.success_rate}% Success Rate
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Successful</span>
                  <span className="text-sm font-medium text-green-600">
                    {stats.summary.executions.successful}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.summary.executions.successful / stats.summary.executions.total) * 100}%`
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Failed</span>
                  <span className="text-sm font-medium text-red-600">
                    {stats.summary.executions.failed}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.summary.executions.failed / stats.summary.executions.total) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.recent_activity && stats.recent_activity.length > 0 ? (
                  stats.recent_activity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automation Rules</h3>
            <p className="text-gray-600 mb-6">
              Configure automated workflows and business rules
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create First Rule
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Center</h3>
            <p className="text-gray-600 mb-6">
              Manage notification templates and delivery channels
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Template
            </button>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alert Management</h3>
            <p className="text-gray-600 mb-6">
              Monitor system alerts and manage escalations
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View All Alerts
            </button>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Integrations</h3>
            <p className="text-gray-600 mb-6">
              Connect with external services and APIs
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Integration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}