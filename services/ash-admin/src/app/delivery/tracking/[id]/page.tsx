'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  User,
  Phone,
  Truck,
  CheckCircle,
  AlertCircle,
  Navigation,
  Camera,
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TrackingEvent {
  id: string
  event_type: string
  location: string
  timestamp: string
  notes?: string
  photo_url?: string
  gps_coordinates?: {
    lat: number
    lng: number
  }
}

interface ShipmentDetails {
  id: string
  shipment_number: string
  order: { order_number: string }
  consignee: {
    name: string
    address: string
    phone: string
  }
  method: string
  status: string
  cartons: Array<{
    id: string
    carton_number: string
    weight: number
  }>
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
  tracking_events: TrackingEvent[]
  eta: string
  created_at: string
  delivered_at?: string
  current_location?: {
    lat: number
    lng: number
    address: string
  }
}

export default function ShipmentTrackingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadShipmentDetails()

    // Set up real-time updates
    const interval = setInterval(() => {
      if (shipment?.status === 'IN_TRANSIT' || shipment?.status === 'OUT_FOR_DELIVERY') {
        refreshTrackingData()
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [params.id])

  const loadShipmentDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/delivery/shipments/${params.id}`)
      const data = await response.json()

      if (data) {
        setShipment(data)
      }
    } catch (error) {
      console.error('Error loading shipment details:', error)
      // Load mock data for demo
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const refreshTrackingData = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/delivery/shipments/${params.id}/tracking`)
      const data = await response.json()

      if (data) {
        setShipment(prev => prev ? { ...prev, ...data } : null)
      }
    } catch (error) {
      console.error('Error refreshing tracking data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const loadMockData = () => {
    // Mock data for demonstration
    setShipment({
      id: params.id,
      shipment_number: 'SH-2024-001',
      order: { order_number: 'ORD-2024-001' },
      consignee: {
        name: 'Juan Dela Cruz',
        address: '123 Main St, Barangay San Antonio, Quezon City, Metro Manila 1105',
        phone: '+63 917 123 4567'
      },
      method: 'DRIVER',
      status: 'IN_TRANSIT',
      cartons: [
        { id: '1', carton_number: 'CTN-001', weight: 2.5 },
        { id: '2', carton_number: 'CTN-002', weight: 3.1 },
        { id: '3', carton_number: 'CTN-003', weight: 2.9 }
      ],
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
          id: '1',
          event_type: 'CREATED',
          location: 'Warehouse - Manila Distribution Center',
          timestamp: '2024-09-15T07:30:00Z',
          notes: 'Shipment created and cartons prepared'
        },
        {
          id: '2',
          event_type: 'DISPATCHED',
          location: 'Warehouse - Loading Bay 3',
          timestamp: '2024-09-15T08:00:00Z',
          notes: 'Package picked up by driver Pedro Santos'
        },
        {
          id: '3',
          event_type: 'IN_TRANSIT',
          location: 'EDSA Northbound - Ortigas',
          timestamp: '2024-09-15T09:30:00Z',
          gps_coordinates: { lat: 14.5862, lng: 121.0558 }
        },
        {
          id: '4',
          event_type: 'IN_TRANSIT',
          location: 'Commonwealth Avenue - Quezon City',
          timestamp: '2024-09-15T10:15:00Z',
          gps_coordinates: { lat: 14.6560, lng: 121.0348 }
        }
      ],
      eta: '2024-09-15T12:00:00Z',
      created_at: '2024-09-15T07:30:00Z',
      current_location: {
        lat: 14.6560,
        lng: 121.0348,
        address: 'Commonwealth Avenue, Quezon City'
      }
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
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CREATED':
        return <Package className="w-4 h-4" />
      case 'DISPATCHED':
        return <Truck className="w-4 h-4" />
      case 'IN_TRANSIT':
        return <Navigation className="w-4 h-4" />
      case 'OUT_FOR_DELIVERY':
        return <MapPin className="w-4 h-4" />
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />
      case 'FAILED':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipment tracking...</p>
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Shipment Not Found</h2>
          <p className="text-gray-600 mt-2">The requested shipment could not be found.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Shipment Tracking - {shipment.shipment_number}
              </h1>
              <p className="text-sm text-gray-500">
                Order: {shipment.order.order_number}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={refreshTrackingData}
              disabled={refreshing}
              className="flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {getStatusBadge(shipment.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipment Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Consignee Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium text-gray-900">{shipment.consignee.name}</div>
                    <div className="text-sm text-gray-600 flex items-start mt-1">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{shipment.consignee.address}</span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center mt-2">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href={`tel:${shipment.consignee.phone}`} className="text-blue-600 hover:underline">
                        {shipment.consignee.phone}
                      </a>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Method</div>
                      <div className="font-medium">{shipment.method}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">ETA</div>
                      <div className="font-medium">
                        {new Date(shipment.eta).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {shipment.cod_amount && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-800 font-medium">
                        COD Amount: ₱{shipment.cod_amount.toLocaleString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Driver Information */}
              {shipment.driver && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Driver Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {shipment.driver.first_name} {shipment.driver.last_name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2" />
                        <a href={`tel:${shipment.driver.phone}`} className="text-blue-600 hover:underline">
                          {shipment.driver.phone}
                        </a>
                      </div>
                    </div>

                    {shipment.vehicle && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-800">
                          Vehicle: {shipment.vehicle.plate_no} ({shipment.vehicle.type})
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Package Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cartons</span>
                      <span className="font-medium">{shipment.cartons.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Weight</span>
                      <span className="font-medium">{shipment.total_weight} kg</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Carton List</div>
                    {shipment.cartons.map(carton => (
                      <div key={carton.id} className="flex justify-between text-sm">
                        <span>{carton.carton_number}</span>
                        <span>{carton.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Tracking Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Navigation className="w-5 h-5 mr-2" />
                    Tracking Timeline
                  </span>
                  {shipment.current_location && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {shipment.current_location.address}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {shipment.tracking_events.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getEventIcon(event.event_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
                            {event.event_type?.replace('_', ' ') || 'Unknown Event'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        {event.notes && (
                          <div className="text-sm text-gray-500 mt-2 flex items-start">
                            <MessageSquare className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{event.notes}</span>
                          </div>
                        )}

                        {event.photo_url && (
                          <div className="mt-2">
                            <img
                              src={event.photo_url}
                              alt="Tracking event"
                              className="w-24 h-24 object-cover rounded-lg border"
                            />
                          </div>
                        )}

                        {event.gps_coordinates && (
                          <div className="text-xs text-gray-400 mt-1">
                            GPS: {event.gps_coordinates.lat.toFixed(6)}, {event.gps_coordinates.lng.toFixed(6)}
                          </div>
                        )}
                      </div>

                      {index < shipment.tracking_events.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-300"></div>
                      )}
                    </div>
                  ))}

                  {shipment.status !== 'DELIVERED' && shipment.status !== 'FAILED' && (
                    <div className="flex items-center space-x-4 text-gray-400">
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="text-sm">
                        Next update expected within 30 minutes
                      </div>
                    </div>
                  )}
                </div>

                {/* Map placeholder */}
                <div className="mt-8">
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Live Map View</p>
                      <p className="text-sm">Real-time GPS tracking visualization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}