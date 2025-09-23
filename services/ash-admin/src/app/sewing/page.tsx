'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Scissors, 
  Play, 
  Pause, 
  Square,
  Clock,
  TrendingUp, 
  Users,
  AlertCircle,
  CheckCircle,
  QrCode,
  Search,
  Filter,
  Plus,
  Eye,
  BarChart3,
  Brain,
  Timer
} from 'lucide-react'
import Link from 'next/link'

interface SewingRun {
  id: string
  operation_name: string
  status: 'CREATED' | 'IN_PROGRESS' | 'DONE'
  order: {
    order_number: string
    brand: { name: string; code: string }
  }
  operator: {
    first_name: string
    last_name: string
    employee_number: string
  }
  bundle: {
    id: string
    size_code: string
    qty: number
    qr_code: string
  }
  qty_good: number
  qty_reject: number
  earned_minutes?: number
  actual_minutes?: number
  efficiency_pct?: number
  piece_rate_pay?: number
  started_at?: string
  ended_at?: string
  created_at: string
}

interface SewingOperation {
  id: string
  product_type: string
  name: string
  standard_minutes: number
  piece_rate?: number
  depends_on?: string[]
}

interface Employee {
  id: string
  employee_number: string
  first_name: string
  last_name: string
  position: string
  department: string
}

interface DashboardStats {
  active_runs: number
  todays_completed: number
  operators_working: number
  avg_efficiency: number
  pending_bundles: number
  total_pieces_today: number
}

const statusColors = {
  CREATED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
  DONE: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function SewingPage() {
  const [sewingRuns, setSewingRuns] = useState<SewingRun[]>([])
  const [operations, setOperations] = useState<SewingOperation[]>([])
  const [operators, setOperators] = useState<Employee[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState({
    status: '',
    operation: '',
    operator: '',
    search: ''
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.operation) params.append('operation', filters.operation)
      if (filters.operator) params.append('operator', filters.operator)
      if (filters.search) params.append('search', filters.search)

      const [runsResponse, operationsResponse, operatorsResponse, statsResponse] = await Promise.all([
        fetch(`/api/sewing/runs?${params}`),
        fetch('/api/sewing/operations'),
        fetch('/api/employees?department=SEWING'),
        fetch('/api/sewing/dashboard')
      ])

      // Handle API responses or use mock data
      if (runsResponse.ok) {
        const runsData = await runsResponse.json()
        setSewingRuns(runsData.data || [])
      } else {
        // Mock data for demo
        setSewingRuns([
          {
            id: '1',
            operation_name: 'Join shoulders',
            status: 'IN_PROGRESS',
            order: {
              order_number: 'TCAS-2025-000001',
              brand: { name: 'Trendy Casual', code: 'TCAS' }
            },
            operator: {
              first_name: 'Maria',
              last_name: 'Santos',
              employee_number: 'EMP001'
            },
            bundle: {
              id: 'bundle-001',
              size_code: 'M',
              qty: 20,
              qr_code: 'ash://bundle/001'
            },
            qty_good: 15,
            qty_reject: 0,
            earned_minutes: 22.5,
            actual_minutes: 25,
            efficiency_pct: 90,
            piece_rate_pay: 45.00,
            started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            operation_name: 'Attach collar',
            status: 'CREATED',
            order: {
              order_number: 'URBN-2025-000001',
              brand: { name: 'Urban Streetwear', code: 'URBN' }
            },
            operator: {
              first_name: 'Carlos',
              last_name: 'Rodriguez',
              employee_number: 'EMP002'
            },
            bundle: {
              id: 'bundle-002',
              size_code: 'L',
              qty: 25,
              qr_code: 'ash://bundle/002'
            },
            qty_good: 0,
            qty_reject: 0,
            created_at: new Date().toISOString()
          }
        ])
      }

      if (operationsResponse.ok) {
        const operationsData = await operationsResponse.json()
        setOperations(operationsData.data || [])
      } else {
        setOperations([
          { id: '1', product_type: 'Hoodie', name: 'Join shoulders', standard_minutes: 1.5, piece_rate: 2.25 },
          { id: '2', product_type: 'Hoodie', name: 'Attach collar', standard_minutes: 2.0, piece_rate: 3.00, depends_on: ['Join shoulders'] },
          { id: '3', product_type: 'Hoodie', name: 'Set sleeves', standard_minutes: 3.5, piece_rate: 5.25 },
          { id: '4', product_type: 'Hoodie', name: 'Side seams', standard_minutes: 2.8, piece_rate: 4.20 },
          { id: '5', product_type: 'Hoodie', name: 'Hem bottom', standard_minutes: 1.2, piece_rate: 1.80 }
        ])
      }

      if (operatorsResponse.ok) {
        const operatorsData = await operatorsResponse.json()
        setOperators(operatorsData.data || [])
      } else {
        setOperators([
          { id: '1', employee_number: 'EMP001', first_name: 'Maria', last_name: 'Santos', position: 'Sewing Operator', department: 'SEWING' },
          { id: '2', employee_number: 'EMP002', first_name: 'Carlos', last_name: 'Rodriguez', position: 'Senior Operator', department: 'SEWING' },
          { id: '3', employee_number: 'EMP003', first_name: 'Ana', last_name: 'Cruz', position: 'Sewing Operator', department: 'SEWING' },
          { id: '4', employee_number: 'EMP004', first_name: 'Juan', last_name: 'Dela Cruz', position: 'Team Leader', department: 'SEWING' }
        ])
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setDashboardStats(statsData.data)
      } else {
        setDashboardStats({
          active_runs: 8,
          todays_completed: 24,
          operators_working: 12,
          avg_efficiency: 94,
          pending_bundles: 15,
          total_pieces_today: 580
        })
      }

    } catch (error) {
      console.error('Failed to fetch sewing data:', error)
      setSewingRuns([])
      setOperations([])
      setOperators([])
      setDashboardStats(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRunAction = async (runId: string, action: 'start' | 'pause' | 'complete') => {
    try {
      const response = await fetch(`/api/sewing/runs/${runId}/${action}`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchData() // Refresh data
      } else {
        console.error(`Failed to ${action} sewing run`)
      }
    } catch (error) {
      console.error(`Error ${action}ing sewing run:`, error)
    }
  }

  const getEfficiencyColor = (efficiency?: number) => {
    if (!efficiency) return 'text-gray-500'
    if (efficiency >= 95) return 'text-green-600'
    if (efficiency >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Scissors className="w-8 h-8 mx-auto mb-4 animate-pulse" />
            <p>Loading sewing operations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sewing Operations</h1>
          <p className="text-muted-foreground">Production tracking with real-time efficiency monitoring</p>
        </div>
        <div className="flex gap-2">
          <Link href="/sewing/operations">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Operations
            </Button>
          </Link>
          <Link href="/sewing/runs/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Run
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Runs</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardStats.active_runs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.todays_completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{dashboardStats.operators_working}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEfficiencyColor(dashboardStats.avg_efficiency)}`}>
                {dashboardStats.avg_efficiency}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bundles</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboardStats.pending_bundles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Output</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{dashboardStats.total_pieces_today}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="runs">Active Runs</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="ashley-ai">Ashley AI</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest sewing operations and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">Bundle #B-001 completed</p>
                      <p className="text-sm text-muted-foreground">20 pieces • 95% efficiency</p>
                    </div>
                    <span className="text-sm text-muted-foreground">5 min ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Play className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">New run started: Attach collar</p>
                      <p className="text-sm text-muted-foreground">Operator: Carlos Rodriguez</p>
                    </div>
                    <span className="text-sm text-muted-foreground">12 min ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium">Low efficiency detected</p>
                      <p className="text-sm text-muted-foreground">Bundle #B-005 • 72% efficiency</p>
                    </div>
                    <span className="text-sm text-muted-foreground">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers Today</CardTitle>
                <CardDescription>Operators with highest efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Maria Santos</p>
                      <p className="text-sm text-muted-foreground">EMP001 • Join shoulders</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">98%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Ana Cruz</p>
                      <p className="text-sm text-muted-foreground">EMP003 • Set sleeves</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">96%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Juan Dela Cruz</p>
                      <p className="text-sm text-muted-foreground">EMP004 • Side seams</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">94%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search runs..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-9"
                  />
                </div>
                
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.operation} onValueChange={(value) => setFilters({...filters, operation: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All operations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All operations</SelectItem>
                    {(operations || []).map(op => (
                      <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.operator} onValueChange={(value) => setFilters({...filters, operator: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All operators" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All operators</SelectItem>
                    {(operators || []).map(op => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.first_name} {op.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sewing Runs List */}
          <div className="space-y-4">
            {(sewingRuns || []).map((run) => (
              <Card key={run.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{run.order.order_number}</h3>
                          <Badge variant="outline">{run.order.brand.code}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {run.operation_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[run.status]}>
                        {run.status.replace('_', ' ')}
                      </Badge>
                      {run.efficiency_pct && (
                        <Badge variant="outline" className={getEfficiencyColor(run.efficiency_pct)}>
                          {run.efficiency_pct}% eff
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {run.qty_good} / {run.bundle.qty}</span>
                      <span>{Math.round((run.qty_good / run.bundle.qty) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(run.qty_good / run.bundle.qty) * 100}%` }}
                      />
                    </div>
                    {run.qty_reject > 0 && (
                      <p className="text-sm text-red-600">
                        {run.qty_reject} rejected
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Operator:</span><br />
                      {run.operator.first_name} {run.operator.last_name}
                    </div>
                    <div>
                      <span className="font-medium">Bundle:</span><br />
                      {run.bundle.size_code} • {run.bundle.qty} pcs
                    </div>
                    <div>
                      <span className="font-medium">Pay:</span><br />
                      {run.piece_rate_pay ? `₱${run.piece_rate_pay.toFixed(2)}` : 'Pending'}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span><br />
                      {run.actual_minutes ? `${run.actual_minutes} min` : 'Running'}
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

                    <Link href={`/sewing/runs/${run.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sewingRuns.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Scissors className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No sewing runs found</p>
                    <Link href="/sewing/runs/new">
                      <Button className="mt-2" variant="outline">Create First Run</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="operators" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(operators || []).map((operator) => (
              <Card key={operator.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {operator.first_name} {operator.last_name}
                      </CardTitle>
                      <CardDescription>
                        {operator.employee_number} • {operator.position}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Today's efficiency:</span>
                      <span className="font-medium text-green-600">96%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completed pieces:</span>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current operation:</span>
                      <span className="font-medium">Join shoulders</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ashley-ai" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <CardTitle>AI Performance Insights</CardTitle>
                </div>
                <CardDescription>
                  Real-time efficiency analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg bg-green-50">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Efficiency Trending Up</p>
                        <p className="text-sm text-green-700">
                          Overall line efficiency increased 3% in the last hour. 
                          Maria Santos leading with 98% efficiency.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg bg-yellow-50">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Bottleneck Detected</p>
                        <p className="text-sm text-yellow-700">
                          "Set sleeves" operation is 15% slower than standard. 
                          Consider operator rotation or additional training.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-start gap-2">
                      <Timer className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Break Recommendation</p>
                        <p className="text-sm text-blue-700">
                          Operator Carlos Rodriguez has been working for 2.5 hours. 
                          Recommend a 15-minute break to maintain efficiency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Optimization</CardTitle>
                <CardDescription>Smart recommendations for today's production</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Operator Rebalancing</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Suggested operator reassignments to optimize flow:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Move EMP002 to "Hem bottom"</span>
                        <Badge variant="outline" className="text-xs">+8% throughput</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Assign EMP003 to parallel "Set sleeves"</span>
                        <Badge variant="outline" className="text-xs">-15min/bundle</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Quality Prediction</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Bundle quality risk assessment:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Bundle #B-003 (Size L)</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">Low Risk</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Bundle #B-005 (Size XL)</span>
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium Risk</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Efficiency</span>
                    <span className="font-medium text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pieces Completed</span>
                    <span className="font-medium">580</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earnings</span>
                    <span className="font-medium">₱1,450.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reject Rate</span>
                    <span className="font-medium text-green-600">0.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operation Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(operations || []).slice(0, 5).map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{operation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {operation.standard_minutes}min • ₱{operation.piece_rate?.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="outline">8 runs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  )
}