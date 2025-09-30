'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  Printer,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [selectedView, setSelectedView] = useState<'list' | 'map'>('list')

  // Fetch delivery stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
    isFetching: statsFetching
  } = useQuery({
    queryKey: ['delivery-stats'],
    queryFn: async () => {
      const response = await fetch('/api/delivery/stats')
      if (!response.ok) throw new Error('Failed to fetch delivery stats')
      return response.json() as Promise<DeliveryStats>
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch shipments with filters
  const {
    data: shipments = [],
    isLoading: shipmentsLoading,
    error: shipmentsError,
    refetch: refetchShipments,
    isFetching: shipmentsFetching
  } = useQuery({
    queryKey: ['delivery-shipments', filterStatus, filterMethod],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })

      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterMethod !== 'all') params.append('method', filterMethod)

      const response = await fetch(`/api/delivery/shipments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch shipments')
      const data = await response.json()
      return data.shipments as DeliveryShipment[]
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  const handleRefreshAll = () => {
    refetchStats()
    refetchShipments()
  }

  const isLoading = statsLoading || shipmentsLoading
  const isFetching = statsFetching || shipmentsFetching

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
    searchTerm === '' ||
    shipment.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.consignee.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <CardContent className="p-6">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="ml-5 w-0 flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ShipmentRowSkeleton = () => (
    <tr>
      <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
      <td className="px-6 py-4"><Skeleton className="h-16 w-48" /></td>
      <td className="px-6 py-4"><Skeleton className="h-12 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-12 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-10 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
    </tr>
  )

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
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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

        {/* Error Alerts */}
        {statsError && <ErrorAlert error={statsError as Error} onRetry={refetchStats} />}
        {shipmentsError && <ErrorAlert error={shipmentsError as Error} onRetry={refetchShipments} />}

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : stats ? (
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
        ) : null}

        {/* Empty State for Stats */}
        {!statsLoading && !stats && !statsError && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Statistics Available</AlertTitle>
            <AlertDescription>
              Unable to load delivery statistics. Please check back later.
            </AlertDescription>
          </Alert>
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
            <CardTitle>Delivery Shipments ({filteredShipments.length})</CardTitle>
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
                  {shipmentsLoading ? (
                    [...Array(5)].map((_, i) => <ShipmentRowSkeleton key={i} />)
                  ) : (filteredShipments || []).map((shipment) => (
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

            {!shipmentsLoading && filteredShipments.length === 0 && (
              <div className="text-center py-12">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new shipment.'}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}