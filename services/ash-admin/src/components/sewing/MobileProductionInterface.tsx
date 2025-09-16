'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Square,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  DollarSign,
  QrCode,
  Camera,
  RefreshCw,
  Smartphone,
  Zap
} from 'lucide-react'

interface MobileSewingRun {
  id: string
  operation_name: string
  bundle_qty: number
  bundle_size: string
  completed: number
  rejected: number
  efficiency: number
  earnings: number
  status: 'running' | 'paused' | 'completed'
  time_started: string
  estimated_completion: string
}

interface QuickAction {
  action: 'complete_1' | 'complete_5' | 'reject_1' | 'pause' | 'complete'
  label: string
  icon: React.ReactNode
  color: string
}

interface MobileProductionInterfaceProps {
  runId?: string
  operatorView?: boolean
  fullScreen?: boolean
  className?: string
}

export default function MobileProductionInterface({
  runId,
  operatorView = true,
  fullScreen = false,
  className = ''
}: MobileProductionInterfaceProps) {
  const [currentRun, setCurrentRun] = useState<MobileSewingRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [completedCount, setCompletedCount] = useState('')
  const [rejectCount, setRejectCount] = useState('')
  
  // Touch-optimized state management
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (runId) {
      fetchRunData()
    }
  }, [runId])

  const fetchRunData = async () => {
    setLoading(true)
    try {
      // In real implementation, fetch from API
      // For demo, use mock data
      const mockRun: MobileSewingRun = {
        id: runId || 'mobile-run-001',
        operation_name: 'Join shoulders',
        bundle_qty: 20,
        bundle_size: 'M',
        completed: 12,
        rejected: 1,
        efficiency: 94,
        earnings: 27.00,
        status: 'running',
        time_started: new Date(Date.now() - 1800000).toISOString(),
        estimated_completion: new Date(Date.now() + 900000).toISOString()
      }
      
      setCurrentRun(mockRun)
      setCompletedCount(mockRun.completed.toString())
    } catch (error) {
      console.error('Failed to fetch run data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      action: 'complete_1',
      label: '+1 Done',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-green-600 hover:bg-green-700 text-white'
    },
    {
      action: 'complete_5',
      label: '+5 Done',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      action: 'reject_1',
      label: '+1 Reject',
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-red-600 hover:bg-red-700 text-white'
    },
    {
      action: 'pause',
      label: 'Pause',
      icon: <Pause className="w-5 h-5" />,
      color: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    }
  ]

  const handleQuickAction = async (action: string) => {
    if (!currentRun) return

    setLastAction(action)
    const updatedRun = { ...currentRun }

    switch (action) {
      case 'complete_1':
        updatedRun.completed = Math.min(updatedRun.completed + 1, updatedRun.bundle_qty)
        updatedRun.earnings = updatedRun.completed * 2.25 // Base rate
        break
      case 'complete_5':
        updatedRun.completed = Math.min(updatedRun.completed + 5, updatedRun.bundle_qty)
        updatedRun.earnings = updatedRun.completed * 2.25
        break
      case 'reject_1':
        updatedRun.rejected = updatedRun.rejected + 1
        break
      case 'pause':
        updatedRun.status = updatedRun.status === 'running' ? 'paused' : 'running'
        break
    }

    // Update efficiency based on progress
    const progressPercentage = (updatedRun.completed / updatedRun.bundle_qty) * 100
    const timeElapsed = (Date.now() - new Date(updatedRun.time_started).getTime()) / (1000 * 60)
    const expectedTime = updatedRun.completed * 1.5 // SMV
    updatedRun.efficiency = Math.round((expectedTime / Math.max(timeElapsed, 1)) * 100)

    setCurrentRun(updatedRun)
    setCompletedCount(updatedRun.completed.toString())

    // Provide haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    // Clear action indicator after 1 second
    setTimeout(() => setLastAction(null), 1000)
  }

  const handleManualUpdate = () => {
    if (!currentRun) return

    const completed = Math.max(0, Math.min(parseInt(completedCount) || 0, currentRun.bundle_qty))
    const rejected = Math.max(0, parseInt(rejectCount) || 0)

    const updatedRun = {
      ...currentRun,
      completed,
      rejected,
      earnings: completed * 2.25
    }

    setCurrentRun(updatedRun)
    handleQuickAction('manual_update')
  }

  const getProgressPercentage = () => {
    if (!currentRun) return 0
    return Math.round((currentRun.completed / currentRun.bundle_qty) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeWorked = () => {
    if (!currentRun) return '0m'
    const minutes = Math.round((Date.now() - new Date(currentRun.time_started).getTime()) / (1000 * 60))
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-lg">Loading production interface...</p>
        </div>
      </div>
    )
  }

  if (!currentRun) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${className}`}>
        <div className="text-center max-w-md">
          <Smartphone className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Production Interface</h2>
          <p className="text-muted-foreground mb-6">
            Scan a bundle QR code or select an active run to begin
          </p>
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode className="w-5 h-5 mr-2" />
            Scan Bundle QR
          </Button>
        </div>
      </div>
    )
  }

  const containerClass = fullScreen 
    ? 'min-h-screen bg-gray-50' 
    : 'min-h-[600px]'

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Header */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{currentRun.operation_name}</CardTitle>
                <CardDescription>
                  Bundle Size {currentRun.bundle_size} • {currentRun.bundle_qty} pieces
                </CardDescription>
              </div>
              <Badge className={getStatusColor(currentRun.status)}>
                {currentRun.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {getProgressPercentage()}%
              </div>
              <div className="text-lg text-muted-foreground">
                {currentRun.completed} of {currentRun.bundle_qty} complete
              </div>
              <Progress 
                value={getProgressPercentage()} 
                className="mt-3 h-3"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-1" />
                <div className="text-xl font-bold text-green-600">{currentRun.completed}</div>
                <div className="text-xs text-green-700">Completed</div>
              </div>

              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 mx-auto text-red-600 mb-1" />
                <div className="text-xl font-bold text-red-600">{currentRun.rejected}</div>
                <div className="text-xs text-red-700">Rejected</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <Target className="w-6 h-6 mx-auto text-gray-600 mb-1" />
                <div className="text-xl font-bold text-gray-600">
                  {currentRun.bundle_qty - currentRun.completed - currentRun.rejected}
                </div>
                <div className="text-xs text-gray-700">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Zap className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                <div className="text-xl font-bold text-blue-600">{currentRun.efficiency}%</div>
                <div className="text-xs text-blue-700">Efficiency</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 mx-auto text-green-600 mb-1" />
                <div className="text-xl font-bold text-green-600">₱{currentRun.earnings.toFixed(2)}</div>
                <div className="text-xs text-green-700">Earned</div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Time worked: {getTimeWorked()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className={`${action.color} h-16 text-lg font-semibold flex flex-col gap-1 ${
                    lastAction === action.action ? 'animate-pulse' : ''
                  }`}
                  disabled={currentRun.status === 'paused' && action.action !== 'pause'}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-sm">Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completed</label>
                  <Input
                    type="number"
                    value={completedCount}
                    onChange={(e) => setCompletedCount(e.target.value)}
                    className="text-center text-lg h-12"
                    min="0"
                    max={currentRun.bundle_qty}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rejected</label>
                  <Input
                    type="number"
                    value={rejectCount}
                    onChange={(e) => setRejectCount(e.target.value)}
                    className="text-center text-lg h-12"
                    min="0"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleManualUpdate}
                className="w-full h-12 text-lg"
                variant="outline"
              >
                Update Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complete Bundle Button */}
        {getProgressPercentage() >= 80 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <Button 
                onClick={() => handleQuickAction('complete')}
                className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 text-white"
              >
                <Square className="w-6 h-6 mr-2" />
                Complete Bundle
              </Button>
              <p className="text-center text-sm text-green-700 mt-2">
                Bundle is nearly complete!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Feedback */}
        {lastAction && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
              Action recorded: {lastAction.replace('_', ' ')}
            </div>
          </div>
        )}

        {/* Emergency Actions */}
        <Card className="border border-orange-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-12 text-orange-600 border-orange-600"
                onClick={() => setShowQRScanner(true)}
              >
                <QrCode className="w-5 h-5 mr-2" />
                New Bundle
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-blue-600 border-blue-600"
                onClick={fetchRunData}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Export types
export type { MobileSewingRun, QuickAction, MobileProductionInterfaceProps }