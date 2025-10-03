/**
 * Mobile Dashboard Page
 * Production floor worker interface
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  QrCode,
  ClipboardList,
  Clock,
  TrendingUp,
  Package,
  CheckCircle,
  AlertCircle,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  tasks_pending: number
  tasks_completed_today: number
  pieces_produced_today: number
  efficiency_percentage: number
  current_shift: string
  hours_worked_today: number
}

interface QuickAction {
  id: string
  icon: React.ReactNode
  label: string
  description: string
  href: string
  color: string
}

export default function MobileDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update clock every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Load dashboard stats
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/mobile/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: 'scan',
      icon: <QrCode className="w-8 h-8" />,
      label: 'Scan QR Code',
      description: 'Scan bundles, cartons, or orders',
      href: '/mobile/scanner',
      color: 'bg-blue-600',
    },
    {
      id: 'tasks',
      icon: <ClipboardList className="w-8 h-8" />,
      label: 'My Tasks',
      description: 'View assigned production tasks',
      href: '/mobile/tasks',
      color: 'bg-green-600',
    },
    {
      id: 'attendance',
      icon: <Clock className="w-8 h-8" />,
      label: 'Attendance',
      description: 'Clock in/out and view hours',
      href: '/mobile/attendance',
      color: 'bg-purple-600',
    },
    {
      id: 'performance',
      icon: <TrendingUp className="w-8 h-8" />,
      label: 'Performance',
      description: 'View your productivity metrics',
      href: '/mobile/performance',
      color: 'bg-orange-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Ashley AI</h1>
              <p className="text-sm text-blue-100">Production Floor</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</p>
            <p className="text-sm text-blue-100">{currentTime.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Stats Cards */}
        {!isLoading && stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-100">Tasks Today</span>
                <CheckCircle className="w-4 h-4 text-green-300" />
              </div>
              <p className="text-2xl font-bold">{stats.tasks_completed_today}</p>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-100">Pieces Made</span>
                <Package className="w-4 h-4 text-yellow-300" />
              </div>
              <p className="text-2xl font-bold">{stats.pieces_produced_today}</p>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-100">Efficiency</span>
                <TrendingUp className="w-4 h-4 text-purple-300" />
              </div>
              <p className="text-2xl font-bold">{stats.efficiency_percentage}%</p>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-100">Hours Today</span>
                <Clock className="w-4 h-4 text-orange-300" />
              </div>
              <p className="text-2xl font-bold">{stats.hours_worked_today.toFixed(1)}h</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
            <div className="animate-pulse">Loading stats...</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              className="bg-gray-800 rounded-lg p-4 text-left hover:bg-gray-750 transition-colors active:scale-95"
            >
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                {action.icon}
              </div>
              <h3 className="font-semibold mb-1">{action.label}</h3>
              <p className="text-xs text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>

        {/* Pending Tasks Alert */}
        {stats && stats.tasks_pending > 0 && (
          <div className="mt-6 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-200">
                You have {stats.tasks_pending} pending task{stats.tasks_pending > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => router.push('/mobile/tasks')}
                className="text-sm text-yellow-300 underline mt-1"
              >
                View tasks →
              </button>
            </div>
          </div>
        )}

        {/* Current Shift Info */}
        {stats && (
          <div className="mt-4 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Shift</p>
                <p className="text-lg font-semibold">{stats.current_shift || 'Day Shift'}</p>
              </div>
              <Button
                onClick={() => router.push('/mobile/attendance')}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Clock In/Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-20" />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-6 py-3 flex items-center justify-around">
        <button className="flex flex-col items-center py-2 px-3 text-blue-500">
          <Package className="w-6 h-6 mb-1" />
          <span className="text-xs font-semibold">Dashboard</span>
        </button>

        <button
          onClick={() => router.push('/mobile/scanner')}
          className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white"
        >
          <QrCode className="w-6 h-6 mb-1" />
          <span className="text-xs">Scan</span>
        </button>

        <button
          onClick={() => router.push('/mobile/tasks')}
          className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white relative"
        >
          <ClipboardList className="w-6 h-6 mb-1" />
          <span className="text-xs">Tasks</span>
          {stats && stats.tasks_pending > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {stats.tasks_pending}
            </span>
          )}
        </button>

        <button
          onClick={() => router.push('/mobile/performance')}
          className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white"
        >
          <TrendingUp className="w-6 h-6 mb-1" />
          <span className="text-xs">Stats</span>
        </button>
      </div>
    </div>
  )
}
