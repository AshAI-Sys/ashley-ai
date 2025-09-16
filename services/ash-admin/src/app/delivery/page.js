'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Scan,
  Phone,
  DollarSign,
  AlertTriangle,
  User,
  Edit,
  Navigation,
  Printer,
  Search
} from 'lucide-react'

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState('dispatch')
  const [shipments, setShipments] = useState([])
  const [availableCartons, setAvailableCartons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCartons, setSelectedCartons] = useState([])
  const [showCreateShipment, setShowCreateShipment] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)

  const [shipmentForm, setShipmentForm] = useState({
    consignee_name: '',
    consignee_address: {
      line1: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Philippines'
    },
    contact_phone: '',
    method: 'DRIVER',
    cod_amount: 0,
    special_instructions: ''
  })

  useEffect(() => {
    loadDispatchBoard()
  }, [])

  const loadDispatchBoard = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/delivery/dispatch-board')
      const data = await response.json()

      if (data.success) {
        setShipments(data.shipments || [])
        setAvailableCartons(data.available_cartons || [])
      }
    } catch (error) {
      console.error('Error loading dispatch board:', error)
      // Load mock data for demo
      setShipments([
        {
          id: '1',
          order: { order_number: 'ORD-2024-001', client: { name: 'ABC Corp' } },
          consignee_name: 'John Doe',
          consignee_address: { line1: '123 Main St', city: 'Quezon City' },
          contact_phone: '+63917123456',
          method: 'DRIVER',
          status: 'READY_FOR_PICKUP',
          carton_count: 3,
          total_weight: 15.5,
          cod_amount: 5000,
          delivery: { delivery_reference: 'DEL-001', status: 'PENDING' },
          created_at: new Date().toISOString()
        }
      ])
      setAvailableCartons([
        {
          id: 'c1',
          carton_no: 1,
          actual_weight_kg: 5.2,
          order: { order_number: 'ORD-2024-002', client: { name: 'XYZ Ltd' } }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShipment = async () => {
    try {
      if (selectedCartons.length === 0) {
        alert('Please select at least one carton')
        return
      }

      const response = await fetch('/api/delivery/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carton_ids: selectedCartons,
          ...shipmentForm
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Shipment created successfully!')
        setShowCreateShipment(false)
        setSelectedCartons([])
        setShipmentForm({
          consignee_name: '',
          consignee_address: {
            line1: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Philippines'
          },
          contact_phone: '',
          method: 'DRIVER',
          cod_amount: 0,
          special_instructions: ''
        })
        loadDispatchBoard()
      } else {
        alert('Error creating shipment: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating shipment:', error)
      alert('Error creating shipment')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'READY_FOR_PICKUP': 'bg-yellow-100 text-yellow-800',
      'IN_TRANSIT': 'bg-blue-100 text-blue-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'BOOKED_3PL': 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleTrackDelivery = async (deliveryRef) => {
    try {
      const response = await fetch(`/api/delivery/tracking/${deliveryRef}`)
      const data = await response.json()

      if (data.success) {
        setSelectedDelivery(data.delivery)
        setShowTrackingModal(true)
      }
    } catch (error) {
      console.error('Error tracking delivery:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Operations</h1>
          <p className="text-gray-600 mt-2">Stage 8 - Manage shipments and delivery tracking</p>
        </div>
        <Button onClick={() => setShowCreateShipment(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Shipment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready for Pickup</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {shipments.filter(s => s.status === 'READY_FOR_PICKUP').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {shipments.filter(s => s.status === 'IN_TRANSIT').length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {shipments.filter(s => s.status === 'DELIVERED').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {shipments.filter(s => s.status === 'FAILED').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dispatch">Dispatch Board</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
        </TabsList>

        <TabsContent value="dispatch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {shipment.order.client.name} - {shipment.order.order_number}
                            </h3>
                            <p className="text-sm text-gray-600">
                              To: {shipment.consignee_name}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                {shipment.carton_count} cartons
                              </span>
                              <span className="flex items-center gap-1">
                                <Truck className="h-4 w-4" />
                                {shipment.total_weight?.toFixed(1)}kg
                              </span>
                              {shipment.cod_amount > 0 && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ₱{shipment.cod_amount.toLocaleString()} COD
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <Badge className={getStatusColor(shipment.status)}>
                              {shipment.status.replace('_', ' ')}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {shipment.method}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {shipment.delivery && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTrackDelivery(shipment.delivery.delivery_reference)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Track
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Delivery Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Enter tracking number or delivery reference" />
                  <Button>Track Delivery</Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  Enter a tracking number to view live delivery status
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Scan carton QR code" />
                  <Button>
                    <Scan className="h-4 w-4 mr-2" />
                    Scan Out
                  </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  Scan carton QR codes to mark them as ready for pickup
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Shipment Modal */}
      <Dialog open={showCreateShipment} onOpenChange={setShowCreateShipment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Select Cartons */}
            <div>
              <Label>Select Cartons</Label>
              <div className="border rounded p-4 max-h-48 overflow-y-auto">
                {availableCartons.map((carton) => (
                  <div key={carton.id} className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedCartons.includes(carton.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCartons([...selectedCartons, carton.id])
                        } else {
                          setSelectedCartons(selectedCartons.filter(id => id !== carton.id))
                        }
                      }}
                    />
                    <span className="text-sm">
                      Carton #{carton.carton_no} - {carton.order.order_number}
                      ({carton.order.client.name}) - {carton.actual_weight_kg}kg
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Consignee Name</Label>
                <Input
                  value={shipmentForm.consignee_name}
                  onChange={(e) => setShipmentForm({
                    ...shipmentForm,
                    consignee_name: e.target.value
                  })}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={shipmentForm.contact_phone}
                  onChange={(e) => setShipmentForm({
                    ...shipmentForm,
                    contact_phone: e.target.value
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Delivery Address</Label>
              <Input
                placeholder="Street Address"
                value={shipmentForm.consignee_address.line1}
                onChange={(e) => setShipmentForm({
                  ...shipmentForm,
                  consignee_address: {
                    ...shipmentForm.consignee_address,
                    line1: e.target.value
                  }
                })}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="City"
                  value={shipmentForm.consignee_address.city}
                  onChange={(e) => setShipmentForm({
                    ...shipmentForm,
                    consignee_address: {
                      ...shipmentForm.consignee_address,
                      city: e.target.value
                    }
                  })}
                />
                <Input
                  placeholder="Province"
                  value={shipmentForm.consignee_address.province}
                  onChange={(e) => setShipmentForm({
                    ...shipmentForm,
                    consignee_address: {
                      ...shipmentForm.consignee_address,
                      province: e.target.value
                    }
                  })}
                />
                <Input
                  placeholder="Postal Code"
                  value={shipmentForm.consignee_address.postal_code}
                  onChange={(e) => setShipmentForm({
                    ...shipmentForm,
                    consignee_address: {
                      ...shipmentForm.consignee_address,
                      postal_code: e.target.value
                    }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Delivery Method</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={shipmentForm.method}
                  onChange={(e) => setShipmentForm({
                    ...shipmentForm,
                    method: e.target.value
                  })}
                >
                  <option value="DRIVER">Company Driver</option>
                  <option value="LALAMOVE">Lalamove</option>
                  <option value="GRAB_EXPRESS">GrabExpress</option>
                  <option value="LBC">LBC</option>
                  <option value="JRS">JRS</option>
                </select>
              </div>
              <div>
                <Label>COD Amount (₱)</Label>
                <Input
                  type="number"
                  value={shipmentForm.cod_amount}
                  onChange={(e) => setShipmentForm({
                    ...shipmentForm,
                    cod_amount: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>

            <div>
              <Label>Special Instructions</Label>
              <Textarea
                value={shipmentForm.special_instructions}
                onChange={(e) => setShipmentForm({
                  ...shipmentForm,
                  special_instructions: e.target.value
                })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateShipment(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateShipment}>
                Create Shipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tracking Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Tracking</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Delivery Reference</Label>
                  <p className="font-mono text-sm">{selectedDelivery.delivery_reference}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedDelivery.status)}>
                    {selectedDelivery.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Tracking Events</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedDelivery.tracking_events?.map((event, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{event.status}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          {event.location && (
                            <p className="text-xs text-gray-500">{event.location}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}