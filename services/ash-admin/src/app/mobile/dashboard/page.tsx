'use client';

import { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle,
  Clock,
  TrendingUp,
  Package,
  AlertCircle,
  User,
  LogOut,
  Menu
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MobileDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [operatorName, setOperatorName] = useState('Operator');
  const router = useRouter();

  useEffect(() => {
    fetchOperatorStats();
  }, []);

  const fetchOperatorStats = async () => {
    try {
      const response = await fetch('/api/mobile/stats', {
        headers: {
          'x-workspace-id': 'default-workspace',
          'x-user-id': 'mobile-user',
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setOperatorName(data.operator?.name || 'Operator');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Scan Bundle',
      icon: QrCode,
      color: 'bg-blue-600',
      href: '/mobile/scanner',
    },
    {
      name: 'My Tasks',
      icon: CheckCircle,
      color: 'bg-green-600',
      href: '/mobile/tasks',
    },
    {
      name: 'Time Clock',
      icon: Clock,
      color: 'bg-purple-600',
      href: '/mobile/timeclock',
    },
    {
      name: 'Production',
      icon: Package,
      color: 'bg-orange-600',
      href: '/mobile/production',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-blue-100">Welcome back</p>
              <h1 className="text-xl font-bold">{operatorName}</h1>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Today's Stats */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-sm text-blue-100 mb-3">Today's Performance</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{stats?.todayOutput || 0}</p>
              <p className="text-xs text-blue-200">Units Done</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.todayEfficiency || 0}%</p>
              <p className="text-xs text-blue-200">Efficiency</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.todayHours || 0}h</p>
              <p className="text-xs text-blue-200">Work Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => router.push(action.href)}
              className={`${action.color} hover:opacity-90 rounded-xl p-6 text-left transition-opacity`}
            >
              <action.icon className="h-8 w-8 mb-3" />
              <p className="font-medium">{action.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Tasks */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Tasks</h2>
          <button
            onClick={() => router.push('/mobile/tasks')}
            className="text-blue-400 text-sm"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
              Loading tasks...
            </div>
          ) : stats?.activeTasks?.length > 0 ? (
            stats.activeTasks.slice(0, 3).map((task: any) => (
              <div
                key={task.id}
                className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{task.order_number}</p>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full">
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {task.completed} / {task.target} units
                  </span>
                  <span className="text-green-400">
                    {Math.round((task.completed / task.target) * 100)}%
                  </span>
                </div>
                <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${(task.completed / task.target) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No active tasks</p>
              <p className="text-sm text-gray-500 mt-1">
                You're all caught up!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Chart */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Weekly Performance</h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-end justify-between h-32 space-x-2">
            {stats?.weeklyData?.map((day: any, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-700 rounded-t relative overflow-hidden">
                  <div
                    className="bg-blue-500 w-full transition-all"
                    style={{
                      height: `${Math.max(day.efficiency, 10)}px`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{day.day}</p>
              </div>
            )) || (
              <div className="w-full text-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats?.alerts?.length > 0 && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Alerts</h2>
          <div className="space-y-2">
            {stats.alerts.slice(0, 2).map((alert: any) => (
              <div
                key={alert.id}
                className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-3 flex items-start space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-200">{alert.title}</p>
                  <p className="text-sm text-yellow-300">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
