'use client';

import { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertCircle, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  client: any;
  stats: {
    total_orders: number;
    active_orders: number;
    completed_orders: number;
    unread_notifications: number;
    unread_messages: number;
    pending_invoices: number;
    outstanding_balance: number;
  };
  recent_orders: any[];
  recent_notifications: any[];
}

export default function ClientDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/client-portal/dashboard');
      const data = await response.json();

      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Orders',
      value: dashboard.stats.total_orders,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Active Orders',
      value: dashboard.stats.active_orders,
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      name: 'Completed Orders',
      value: dashboard.stats.completed_orders,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Outstanding Balance',
      value: `₱${dashboard.stats.outstanding_balance.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      IN_PRODUCTION: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Production' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      DELIVERED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Delivered' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {dashboard.client.name}! 👋</h1>
        <p className="text-purple-100">Here's what's happening with your orders today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link href="/client-portal/orders" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All →
            </Link>
          </div>

          {dashboard.recent_orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {dashboard.recent_orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/client-portal/orders/${order.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">
                      ₱{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Notifications</h2>
            <Link
              href="/client-portal/notifications"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {dashboard.recent_notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications</p>
          ) : (
            <div className="space-y-3">
              {dashboard.recent_notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${
                    notification.is_read ? 'border-gray-200 bg-white' : 'border-purple-200 bg-purple-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 mb-1">{notification.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/client-portal/orders"
            className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center group"
          >
            <Package className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900">View All Orders</p>
          </Link>
          <Link
            href="/client-portal/messages"
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center group"
          >
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900">Send Message</p>
          </Link>
          <Link
            href="/client-portal/payments"
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center group"
          >
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900">View Payments</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
