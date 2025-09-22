'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import {
  Package,
  PackageCheck,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  Scissors,
  Tags,
  Box
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface FinishingRun {
  id: string
  order: { order_number: string }
  bundle: { qr_code: string, size_code: string, qty: number }
  operator: { first_name: string, last_name: string }
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PACKED'
  tasks_completed: number
  total_tasks: number
  started_at?: string
  completed_at?: string
  materials_used: Array<{
    item_name: string
    quantity: number
    uom: string
  }>
}

interface Carton {
  id: string
  carton_no: string
  order: { order_number: string }
  dimensions: { length: number, width: number, height: number }
  actual_weight: number
  fill_percent: number
  status: 'OPEN' | 'CLOSED' | 'SHIPPED'
  units_count: number
  created_at: string
}

interface FinishingStats {
  pending_orders: number
  in_progress: number
  completed_today: number
  packed_today: number
  efficiency_rate: number
}

export default function FinishingPackingPage() {
  const [activeTab, setActiveTab] = useState<'finishing' | 'packing'>('finishing')
  const [finishingRuns, setFinishingRuns] = useState<FinishingRun[]>([])
  const [cartons, setCartons] = useState<Carton[]>([])
  const [stats, setStats] = useState<FinishingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'finishing') {
        await loadFinishingData()
      } else {
        await loadPackingData()
      }
      await loadStats()
    } catch (error) {
      console.error('Error loading data:', error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadFinishingData = async () => {
    const response = await fetch('/api/finishing/runs')
    const data = await response.json()
    setFinishingRuns(data.runs || [])
  }

  const loadPackingData = async () => {
    const response = await fetch('/api/packing/cartons')
    const data = await response.json()
    setCartons(data.cartons || [])
  }

  const loadStats = async () => {
    const response = await fetch('/api/finishing-packing/stats')
    const data = await response.json()
    setStats(data)
  }

  const loadMockData = () => {
    // Mock data for demonstration
    if (activeTab === 'finishing') {
      setFinishingRuns([
        {
          id: '1',
          order: { order_number: 'ORD-2024-001' },
          bundle: { qr_code: 'BDL-001', size_code: 'M', qty: 50 },
          operator: { first_name: 'Maria', last_name: 'Santos' },
          status: 'IN_PROGRESS',
          tasks_completed: 3,
          total_tasks: 5,
          started_at: '2024-09-15T08:30:00Z',
          materials_used: [
            { item_name: 'Hangtags', quantity: 50, uom: 'pcs' },
            { item_name: 'Polybags', quantity: 50, uom: 'pcs' }
          ]
        },
        {
          id: '2',
          order: { order_number: 'ORD-2024-002' },
          bundle: { qr_code: 'BDL-002', size_code: 'L', qty: 75 },
          operator: { first_name: 'Juan', last_name: 'Cruz' },
          status: 'COMPLETED',
          tasks_completed: 5,
          total_tasks: 5,
          started_at: '2024-09-15T09:00:00Z',
          completed_at: '2024-09-15T11:30:00Z',
          materials_used: [
            { item_name: 'Hangtags', quantity: 75, uom: 'pcs' },
            { item_name: 'Polybags', quantity: 75, uom: 'pcs' },
            { item_name: 'Size Labels', quantity: 75, uom: 'pcs' }
          ]
        }
      ])
    } else {
      setCartons([
        {
          id: '1',
          carton_no: 'CTN-001',
          order: { order_number: 'ORD-2024-001' },
          dimensions: { length: 40, width: 30, height: 25 },
          actual_weight: 2.5,
          fill_percent: 85,
          status: 'OPEN',
          units_count: 25,
          created_at: '2024-09-15T10:00:00Z'
        },
        {
          id: '2',
          carton_no: 'CTN-002',
          order: { order_number: 'ORD-2024-001' },
          dimensions: { length: 40, width: 30, height: 25 },
          actual_weight: 3.1,
          fill_percent: 95,
          status: 'CLOSED',
          units_count: 30,
          created_at: '2024-09-15T10:30:00Z'
        }
      ])
    }

    setStats({
      pending_orders: 12,
      in_progress: 5,
      completed_today: 8,
      packed_today: 6,
      efficiency_rate: 87.5
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'PACKED':
        return <Badge className="bg-purple-100 text-purple-800">Packed</Badge>
      case 'OPEN':
        return <Badge className="bg-orange-100 text-orange-800">Open</Badge>
      case 'CLOSED':
        return <Badge className="bg-green-100 text-green-800">Closed</Badge>
      case 'SHIPPED':
        return <Badge className="bg-gray-100 text-gray-800">Shipped</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredFinishingRuns = finishingRuns.filter(run =>
    (searchTerm === '' ||
     run.order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     run.bundle.qr_code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || run.status === filterStatus)
  )

  const filteredCartons = cartons.filter(carton =>
    (searchTerm === '' ||
     carton.order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     carton.carton_no.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || carton.status === filterStatus)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading finishing & packing data...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Finishing & Packing
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Stage 7 - Final production steps and cartonization
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print Labels
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Start {activeTab === 'finishing' ? 'Finishing' : 'Packing'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pending_orders}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Scissors className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.in_progress}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.completed_today}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Packed Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.packed_today}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Efficiency</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.efficiency_rate}%</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('finishing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'finishing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Scissors className="w-4 h-4 inline mr-2" />
              Finishing Operations
            </button>
            <button
              onClick={() => setActiveTab('packing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'packing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Box className="w-4 h-4 inline mr-2" />
              Packing & Cartonization
            </button>
          </nav>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    className="pl-10 pr-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {activeTab === 'finishing' ? (
                      <>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PACKED">Packed</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === 'finishing' ? (
          <FinishingRunsTable runs={filteredFinishingRuns} getStatusBadge={getStatusBadge} />
        ) : (
          <PackingCartonsTable cartons={filteredCartons} getStatusBadge={getStatusBadge} />
        )}
      </div>
    </DashboardLayout>
  )
}

// Separate component for Finishing Runs Table
function FinishingRunsTable({ runs, getStatusBadge }: { runs: FinishingRun[], getStatusBadge: (status: string) => JSX.Element }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finishing Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order / Bundle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materials Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(finishingRuns || []).map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {run.order.order_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        Bundle: {run.bundle.qr_code} ({run.bundle.size_code}) - {run.bundle.qty} pcs
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {run.operator.first_name} {run.operator.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {run.tasks_completed}/{run.total_tasks} tasks
                      </div>
                      <div className="ml-3 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(run.tasks_completed / run.total_tasks) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(run.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(run.materials_used || []).map((material, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          {material.item_name}: {material.quantity} {material.uom}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {run.status === 'COMPLETED' && (
                        <Button size="sm" variant="outline">
                          <Package className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {runs.length === 0 && (
          <div className="text-center py-12">
            <Scissors className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No finishing operations</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new finishing run.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Separate component for Packing Cartons Table
function PackingCartonsTable({ cartons, getStatusBadge }: { cartons: Carton[], getStatusBadge: (status: string) => JSX.Element }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Packing & Cartonization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carton / Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensions (L×W×H)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight & Fill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(cartons || []).map((carton) => (
                <tr key={carton.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {carton.carton_no}
                      </div>
                      <div className="text-sm text-gray-500">
                        Order: {carton.order.order_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {carton.dimensions.length}×{carton.dimensions.width}×{carton.dimensions.height} cm
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {carton.actual_weight} kg
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="text-sm text-gray-500 mr-2">
                          {carton.fill_percent}% fill
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              carton.fill_percent >= 90 ? 'bg-green-600' :
                              carton.fill_percent >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${carton.fill_percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {carton.units_count} units
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(carton.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {carton.status === 'OPEN' && (
                        <Button size="sm" variant="outline">
                          <PackageCheck className="w-4 h-4" />
                        </Button>
                      )}
                      {carton.status === 'CLOSED' && (
                        <Button size="sm" variant="outline">
                          <Truck className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cartons.length === 0 && (
          <div className="text-center py-12">
            <Box className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cartons found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new carton for packing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}