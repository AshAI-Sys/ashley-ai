'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Square, Eye, Package2, Printer, Zap, Shirt, Palette, Brain, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import AIInsightsDashboard from '@/components/printing/AIInsightsDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

interface PrintRun {
  id: string
  method: 'SILKSCREEN' | 'SUBLIMATION' | 'DTF' | 'EMBROIDERY'
  status: 'CREATED' | 'IN_PROGRESS' | 'PAUSED' | 'DONE' | 'CANCELLED'
  order: {
    order_number: string
    brand: { name: string; code: string }
    line_items: Array<{ description: string }>
  }
  machine: {
    name: string
    workcenter: string
  }
  target_qty: number
  outputs: Array<{ qty_completed: number }>
  rejects: Array<{ qty_rejected: number }>
  started_at?: string
  created_at: string
}

interface Machine {
  id: string
  name: string
  workcenter: 'PRINTING' | 'HEAT_PRESS' | 'EMB' | 'DRYER'
  is_active: boolean
}

interface Dashboard {
  active_runs: number
  todays_runs: number
  method_breakdown: Array<{ method: string; _count: number }>
  recent_rejects: Array<{
    id: string
    reason: string
    qty_rejected: number
    run: { method: string; order: { order_number: string } }
  }>
}

const methodIcons = {
  SILKSCREEN: Palette,
  SUBLIMATION: Zap,
  DTF: Package2,
  EMBROIDERY: Shirt
}

const methodColors = {
  SILKSCREEN: 'bg-purple-100 text-purple-800 border-purple-200',
  SUBLIMATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DTF: 'bg-blue-100 text-blue-800 border-blue-200',
  EMBROIDERY: 'bg-green-100 text-green-800 border-green-200'
}

const statusColors = {
  CREATED: 'bg-gray-100 text-gray-800 border-gray-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  PAUSED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DONE: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200'
}

export default function PrintingPage() {
  const [filter, setFilter] = useState({
    method: '',
    status: '',
    machine: ''
  })

  // Fetch print runs with filters
  const {
    data: printRuns = [],
    isLoading: runsLoading,
    error: runsError,
    refetch: refetchRuns,
    isFetching: runsFetching
  } = useQuery({
    queryKey: ['printing-runs', filter.method, filter.status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter.method && filter.method !== 'all') params.append('method', filter.method)
      if (filter.status && filter.status !== 'all') params.append('status', filter.status)

      const response = await fetch(`/api/printing/runs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch print runs')
      const data = await response.json()
      return data.data as PrintRun[]
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch machines
  const {
    data: machines = [],
    isLoading: machinesLoading,
    error: machinesError,
    refetch: refetchMachines,
    isFetching: machinesFetching
  } = useQuery({
    queryKey: ['printing-machines'],
    queryFn: async () => {
      const response = await fetch('/api/printing/machines')
      if (!response.ok) throw new Error('Failed to fetch machines')
      const data = await response.json()
      return data.data as Machine[]
    },
    staleTime: 60000,
    refetchInterval: 120000,
  })

  // Fetch dashboard stats
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
    isFetching: dashboardFetching
  } = useQuery({
    queryKey: ['printing-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/printing/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard')
      const data = await response.json()
      return data.data as Dashboard
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  const handleRefreshAll = () => {
    refetchRuns()
    refetchMachines()
    refetchDashboard()
  }

  const isLoading = runsLoading || machinesLoading || dashboardLoading
  const isFetching = runsFetching || machinesFetching || dashboardFetching

  const handleRunAction = async (runId: string, action: 'start' | 'pause' | 'complete') => {
    try {
      const endpoint = action === 'start' ? 'start' :
                     action === 'pause' ? 'pause' : 'complete'

      const response = await fetch(`/api/printing/runs/${runId}/${endpoint}`, {
        method: 'POST'
      })

      if (response.ok) {
        refetchRuns() // Refresh data
        refetchDashboard()
      } else {
        console.error(`Failed to ${action} print run`)
      }
    } catch (error) {
      console.error(`Error ${action}ing print run:`, error)
    }
  }

  const getCompletedQty = (run: PrintRun) => {
    return run.outputs.reduce((sum, output) => sum + output.qty_completed, 0)
  }

  const getRejectedQty = (run: PrintRun) => {
    return run.rejects.reduce((sum, reject) => sum + reject.qty_rejected, 0)
  }

  const getProgressPercentage = (run: PrintRun) => {
    const completed = getCompletedQty(run)
    return run.target_qty > 0 ? Math.round((completed / run.target_qty) * 100) : 0
  }

  // Error Alert Component
  const ErrorAlert = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Error</AlertTitle>
      <AlertDescription className="text-red-700">
        {error.message}
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )

  // Skeleton Loaders
  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  )

  const PrintRunCardSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-2 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Printing Operations</h1>
          <p className="text-muted-foreground">Multi-method printing workflow management</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/printing/create-run">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              New Print Run
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alerts */}
      {dashboardError && <ErrorAlert error={dashboardError as Error} onRetry={refetchDashboard} />}
      {runsError && <ErrorAlert error={runsError as Error} onRetry={refetchRuns} />}
      {machinesError && <ErrorAlert error={machinesError as Error} onRetry={refetchMachines} />}

      {/* Dashboard Cards */}
      {dashboardLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : dashboard ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Runs</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboard.active_runs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Runs</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboard.todays_runs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {machines.filter(m => m.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Methods Today</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboard.method_breakdown.length}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Tabs defaultValue="runs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="runs">Print Runs</TabsTrigger>
          <TabsTrigger value="ashley-ai">Ashley AI</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={filter.method} onValueChange={(value) => setFilter({...filter, method: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All methods</SelectItem>
                      <SelectItem value="SILKSCREEN">Silkscreen</SelectItem>
                      <SelectItem value="SUBLIMATION">Sublimation</SelectItem>
                      <SelectItem value="DTF">DTF</SelectItem>
                      <SelectItem value="EMBROIDERY">Embroidery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filter.status} onValueChange={(value) => setFilter({...filter, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="CREATED">Created</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="PAUSED">Paused</SelectItem>
                      <SelectItem value="DONE">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Machine</Label>
                  <Select value={filter.machine} onValueChange={(value) => setFilter({...filter, machine: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All machines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All machines</SelectItem>
                      {(machines || []).map(machine => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print Runs List */}
          <div className="space-y-4">
            {runsLoading ? (
              [...Array(3)].map((_, i) => <PrintRunCardSkeleton key={i} />)
            ) : (printRuns || []).map((run) => {
              const MethodIcon = methodIcons[run.method]
              const completed = getCompletedQty(run)
              const rejected = getRejectedQty(run)
              const progress = getProgressPercentage(run)

              return (
                <Card key={run.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${methodColors[run.method]}`}>
                          <MethodIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{run.order.order_number}</h3>
                            <Badge variant="outline">{run.order.brand.code}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {run.order.line_items[0]?.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[run.status]}>
                          {run.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={methodColors[run.method]}>
                          {run.method}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {completed} / {run.target_qty}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {rejected > 0 && (
                        <p className="text-sm text-red-600">
                          {rejected} rejected
                        </p>
                      )}
                    </div>

                    {/* Machine and timing */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Machine:</span><br />
                        {run.machine.name}
                      </div>
                      <div>
                        <span className="font-medium">Started:</span><br />
                        {run.started_at 
                          ? new Date(run.started_at).toLocaleString()
                          : 'Not started'
                        }
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {run.status === 'CREATED' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRunAction(run.id, 'start')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {run.status === 'IN_PROGRESS' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRunAction(run.id, 'pause')}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleRunAction(run.id, 'complete')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Square className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        </>
                      )}

                      <Link href={`/printing/runs/${run.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {!runsLoading && printRuns.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Printer className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {filter.method || filter.status ? 'No print runs match your filters' : 'No print runs found'}
                    </p>
                    <Link href="/printing/create-run">
                      <Button className="mt-2" variant="outline">Create First Run</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ashley-ai" className="space-y-4">
          <AIInsightsDashboard />
        </TabsContent>

        <TabsContent value="machines" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(machines || []).map((machine) => (
              <Card key={machine.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{machine.name}</CardTitle>
                    <Badge variant={machine.is_active ? "default" : "secondary"}>
                      {machine.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Workcenter: {machine.workcenter?.replace('_', ' ') || 'No workcenter'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Currently {machine.is_active ? 'available for production' : 'offline'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Method Breakdown (Today)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(dashboard?.method_breakdown || []).map((item) => {
                      const MethodIcon = methodIcons[item.method as keyof typeof methodIcons]
                      return (
                        <div key={item.method} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${methodColors[item.method as keyof typeof methodColors]}`}>
                              <MethodIcon className="w-4 h-4" />
                            </div>
                            <span>{item.method}</span>
                          </div>
                          <Badge variant="outline">{item._count} runs</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Rejects</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard.recent_rejects.length > 0 ? (
                    <div className="space-y-2">
                      {(dashboard?.recent_rejects || []).map((reject) => (
                        <div key={reject.id} className="p-2 border rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{reject.run.order.order_number}</p>
                              <p className="text-xs text-muted-foreground">{reject.reason}</p>
                            </div>
                            <Badge variant="destructive">{reject.qty_rejected}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent rejects</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  )
}