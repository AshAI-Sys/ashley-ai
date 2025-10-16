'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Package, TrendingUp, Users, Zap } from 'lucide-react'
import { useDashboardWebSocket } from '@/hooks/useWebSocket'
import { useEffect, useState } from 'react'

interface MetricCardProps {
  title: string
  value: number | string
  change?: number
  icon: React.ElementType
  color: string
  suffix?: string
  isLive?: boolean
}

function MetricCard({ title, value, change, icon: Icon, color, suffix = '', isLive }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true)
      const timeout = setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [value, displayValue])

  return (
    <Card className={`dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden transition-all ${isAnimating ? 'scale-105' : ''}`}>
      {isLive && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">LIVE</span>
          </div>
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className={`text-3xl font-bold text-gray-900 dark:text-white transition-all ${isAnimating ? 'blur-sm' : ''}`}>
              {displayValue}{suffix}
            </p>
            {change !== undefined && (
              <p className={`text-sm mt-2 flex items-center gap-1 ${
                change >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <TrendingUp className={`w-4 h-4 ${change < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(change)}% from yesterday
              </p>
            )}
          </div>
          <div className={`${color} p-3 rounded-full`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RealTimeMetrics() {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    ordersInProduction: 0,
    completedToday: 0,
    efficiency: 0
  })

  const { data, connectionStatus } = useDashboardWebSocket((update) => {
    setMetrics(prev => ({
      ...prev,
      ...update
    }))
  })

  useEffect(() => {
    // Initialize with some data
    setMetrics({
      totalOrders: 87,
      ordersInProduction: 24,
      completedToday: 12,
      efficiency: 92
    })
  }, [])

  const isConnected = connectionStatus === 'connected'

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Real-Time Metrics
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isConnected
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          change={8.2}
          icon={Package}
          color="bg-blue-500"
          isLive={isConnected}
        />
        <MetricCard
          title="In Production"
          value={metrics.ordersInProduction}
          change={-3.1}
          icon={Zap}
          color="bg-purple-500"
          isLive={isConnected}
        />
        <MetricCard
          title="Completed Today"
          value={metrics.completedToday}
          change={15.4}
          icon={TrendingUp}
          color="bg-green-500"
          isLive={isConnected}
        />
        <MetricCard
          title="Efficiency"
          value={metrics.efficiency}
          change={2.3}
          icon={Activity}
          color="bg-orange-500"
          suffix="%"
          isLive={isConnected}
        />
      </div>

      {/* Live Activity Feed */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Order #1234 moved to Printing', time: 'Just now', icon: Package, color: 'text-blue-500' },
              { action: 'Cutting run completed - 250 units', time: '2 minutes ago', icon: TrendingUp, color: 'text-green-500' },
              { action: 'New order created by John Doe', time: '5 minutes ago', icon: Users, color: 'text-purple-500' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className={`${activity.color} mt-0.5`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
