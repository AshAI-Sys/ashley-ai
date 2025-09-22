'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Package,
  User,
  Phone,
  Navigation,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Printer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface DeliveryShipment {
  id: string
  shipment_number: string
  order: { order_number: string }
  consignee: {
    name: string
    address: string
    phone: string
  }
  method: 'DRIVER' | 'LALAMOVE' | 'GRAB' | 'JNT' | 'LBC'
  status: 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'CANCELLED'
  cartons_count: number
  total_weight: number
  cod_amount?: number
  driver?: {
    first_name: string
    last_name: string
    phone: string
  }
  vehicle?: {
    plate_no: string
    type: string
  }
  tracking_events: Array<{
    event_type: string
    location: string
    timestamp: string
    notes?: string
  }>
  eta: string
  created_at: string
  delivered_at?: string
}

interface DeliveryStats {
  ready_for_pickup: number
  in_transit: number
  delivered_today: number
  failed_deliveries: number
  on_time_rate: number
  avg_delivery_time: number
}

export default function DeliveryPage() {
  const [shipments, setShipments] = useState<DeliveryShipment[]>([])
  const [stats, setStats] = useState<DeliveryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [selectedView, setSelectedView] = useState<'list' | 'map'>('list')

  useEffect(() => {
    loadData()
  }, [filterStatus, filterMethod])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })

      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterMethod !== 'all') params.append('method', filterMethod)

      const response = await fetch(`/api/delivery/shipments?${params}`)
      const data = await response.json()

      if (data.shipments) {
        setShipments(data.shipments || [])
      }

      const statsResponse = await fetch('/api/delivery/stats')
      const statsData = await statsResponse.json()
      setStats(statsData)

    } catch (error) {
      console.error('Error loading delivery data:', error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    // Mock data for demonstration
    setShipments([
      {
        id: '1',
        shipment_number: 'SH-2024-001',
        order: { order_number: 'ORD-2024-001' },
        consignee: {
          name: 'Juan Dela Cruz',
          address: '123 Main St, Quezon City, Metro Manila',
          phone: '+63 917 123 4567'
        },
        method: 'DRIVER',
        status: 'IN_TRANSIT',
        cartons_count: 3,
        total_weight: 8.5,
        cod_amount: 2500,
        driver: {
          first_name: 'Pedro',
          last_name: 'Santos',
          phone: '+63 917 987 6543'
        },
        vehicle: {
          plate_no: 'ABC-123',
          type: 'Van'
        },
        tracking_events: [
          {
            event_type: 'DISPATCHED',
            location: 'Warehouse - Manila',
            timestamp: '2024-09-15T08:00:00Z',
            notes: 'Package picked up by driver'
          },
          {
            event_type: 'IN_TRANSIT',
            location: 'EDSA - Quezon City',
            timestamp: '2024-09-15T09:30:00Z'
          }
        ],
        eta: '2024-09-15T12:00:00Z',
        created_at: '2024-09-15T07:30:00Z'
      },
      {
        id: '2',
        shipment_number: 'SH-2024-002',
        order: { order_number: 'ORD-2024-002' },
        consignee: {
          name: 'Maria Santos',
          address: '456 Commerce Ave, Makati City, Metro Manila',
          phone: '+63 918 234 5678'
        },
        method: 'LALAMOVE',
        status: 'DELIVERED',
        cartons_count: 2,
        total_weight: 4.2,
        tracking_events: [
          {
            event_type: 'DELIVERED',
            location: '456 Commerce Ave, Makati City',
            timestamp: '2024-09-15T10:45:00Z',
            notes: 'Package delivered successfully'
          }
        ],
        eta: '2024-09-15T11:00:00Z',
        created_at: '2024-09-15T08:00:00Z',
        delivered_at: '2024-09-15T10:45:00Z'
      },
      {
        id: '3',
        shipment_number: 'SH-2024-003',
        order: { order_number: 'ORD-2024-003' },
        consignee: {
          name: 'Robert Chen',
          address: '789 Business Park, BGC, Taguig City',
          phone: '+63 919 345 6789'
        },
        method: 'GRAB',
        status: 'FAILED',
        cartons_count: 1,
        total_weight: 2.1,
        cod_amount: 1200,
        tracking_events: [
          {
            event_type: 'FAILED_DELIVERY',
            location: '789 Business Park, BGC',
            timestamp: '2024-09-15T11:15:00Z',
            notes: 'Recipient not available'
          }
        ],
        eta: '2024-09-15T12:30:00Z',
        created_at: '2024-09-15T09:00:00Z'
      }
    ])

    setStats({
      ready_for_pickup: 8,
      in_transit: 5,
      delivered_today: 12,
      failed_deliveries: 2,
      on_time_rate: 89.5,
      avg_delivery_time: 3.2
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return <Badge className="bg-blue-100 text-blue-800">Ready for Pickup</Badge>
      case 'IN_TRANSIT':
        return <Badge className="bg-yellow-100 text-yellow-800">In Transit</Badge>
      case 'OUT_FOR_DELIVERY':
        return <Badge className="bg-orange-100 text-orange-800">Out for Delivery</Badge>
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      'DRIVER': 'bg-purple-100 text-purple-800',
      'LALAMOVE': 'bg-green-100 text-green-800',
      'GRAB': 'bg-blue-100 text-blue-800',
      'JNT': 'bg-red-100 text-red-800',
      'LBC': 'bg-yellow-100 text-yellow-800'
    }
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {method}
      </Badge>
    )
  }

  const filteredShipments = shipments.filter(shipment =>
    (searchTerm === '' ||
     shipment.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     shipment.order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     shipment.consignee.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || shipment.status === filterStatus) &&
    (filterMethod === 'all' || shipment.method === filterMethod)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery data...</p>
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
              Delivery Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Stage 8 - Track shipments and manage deliveries
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Dispatch Reports
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Ready for Pickup</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.ready_for_pickup}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Truck className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Transit</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.in_transit}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Delivered Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.delivered_today}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.failed_deliveries}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">On-Time Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.on_time_rate}%</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Navigation className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Time (hrs)</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.avg_delivery_time}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Toggle & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search shipments..."
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
                    <SelectItem value="READY_FOR_PICKUP">Ready for Pickup</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="DRIVER">Driver</SelectItem>
                    <SelectItem value="LALAMOVE">Lalamove</SelectItem>
                    <SelectItem value="GRAB">Grab</SelectItem>
                    <SelectItem value="JNT">J&T</SelectItem>
                    <SelectItem value="LBC">LBC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedView === 'list' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('list')}
                  size="sm"
                >
                  List
                </Button>
                <Button
                  variant={selectedView === 'map' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('map')}
                  size="sm"
                >
                  Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipments List */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipment / Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method / Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ETA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filteredShipments || []).map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {shipment.shipment_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order: {shipment.order.order_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {shipment.consignee.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-start mt-1">
                            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{shipment.consignee.address}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-1" />
                            {shipment.consignee.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          {getMethodBadge(shipment.method)}
                          {shipment.driver && (
                            <div className="text-sm text-gray-600">
                              {shipment.driver.first_name} {shipment.driver.last_name}
                              {shipment.vehicle && (
                                <div className="text-xs text-gray-500">
                                  {shipment.vehicle.plate_no} ({shipment.vehicle.type})
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(shipment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shipment.cartons_count} cartons
                        </div>
                        <div className="text-sm text-gray-500">
                          {shipment.total_weight} kg
                        </div>
                        {shipment.cod_amount && (
                          <div className="text-sm text-green-600 font-medium">
                            COD: ₱{shipment.cod_amount.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(shipment.eta).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(shipment.eta).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {shipment.status !== 'DELIVERED' && shipment.status !== 'CANCELLED' && (
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {shipment.method === 'DRIVER' && shipment.status === 'IN_TRANSIT' && (
                            <Button size="sm" variant="outline">
                              <MapPin className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredShipments.length === 0 && (
              <div className="text-center py-12">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new shipment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}