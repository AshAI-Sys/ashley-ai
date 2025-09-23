'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Scissors, Package, BarChart3, QrCode, Eye, Edit, Trash2 } from 'lucide-react'

interface CutLay {
  id: string
  layNumber: string
  orderNumber: string
  clientName: string
  markerName: string
  layLength: number
  plies: number
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  createdAt: string
  totalPieces: number
  fabricUsed: number
}

interface Bundle {
  id: string
  bundleNumber: string
  layId: string
  orderNumber: string
  sizeCode: string
  quantity: number
  status: 'CUT' | 'READY' | 'ISSUED' | 'COMPLETED'
  qrCode: string
  createdAt: string
}

export default function CuttingPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('lays')
  const [cutLays, setCutLays] = useState<CutLay[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])

  // Mock data for demonstration
  useEffect(() => {
    const mockCutLays: CutLay[] = [
      {
        id: '1',
        layNumber: 'LAY-001',
        orderNumber: 'ORD-2024-001',
        clientName: 'Ashley Fashion Co.',
        markerName: 'MKR-SHIRT-001',
        layLength: 25.5,
        plies: 50,
        status: 'IN_PROGRESS',
        createdAt: '2024-01-15T08:00:00Z',
        totalPieces: 150,
        fabricUsed: 127.5
      },
      {
        id: '2',
        layNumber: 'LAY-002',
        orderNumber: 'ORD-2024-002',
        clientName: 'Urban Styles Ltd.',
        markerName: 'MKR-DRESS-001',
        layLength: 30.0,
        plies: 40,
        status: 'COMPLETED',
        createdAt: '2024-01-14T10:30:00Z',
        totalPieces: 120,
        fabricUsed: 120.0
      }
    ]

    const mockBundles: Bundle[] = [
      {
        id: '1',
        bundleNumber: 'BDL-001',
        layId: '1',
        orderNumber: 'ORD-2024-001',
        sizeCode: 'M',
        quantity: 25,
        status: 'CUT',
        qrCode: 'QR001',
        createdAt: '2024-01-15T09:00:00Z'
      },
      {
        id: '2',
        bundleNumber: 'BDL-002',
        layId: '1',
        orderNumber: 'ORD-2024-001',
        sizeCode: 'L',
        quantity: 30,
        status: 'READY',
        qrCode: 'QR002',
        createdAt: '2024-01-15T09:15:00Z'
      }
    ]

    setCutLays(mockCutLays)
    setBundles(mockBundles)
    setLoading(false)
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PLANNED': { color: 'bg-blue-100 text-blue-800', label: 'Planned' },
      'IN_PROGRESS': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'ON_HOLD': { color: 'bg-red-100 text-red-800', label: 'On Hold' },
      'CUT': { color: 'bg-orange-100 text-orange-800', label: 'Cut' },
      'READY': { color: 'bg-green-100 text-green-800', label: 'Ready' },
      'ISSUED': { color: 'bg-blue-100 text-blue-800', label: 'Issued' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cutting Operations</h1>
            <p className="text-gray-600">Manage fabric laying, cutting, and bundle generation</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => {}}>
              <Plus className="w-4 h-4 mr-2" />
              New Lay
            </Button>
            <Button variant="outline" onClick={() => {}}>
              <QrCode className="w-4 h-4 mr-2" />
              Scan Bundle
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Scissors className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Lays</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bundles Generated</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cutting Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <QrCode className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready Bundles</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="lays">Cut Lays</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          <TabsContent value="lays" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cut Lays Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <Input placeholder="Search by order number..." className="max-w-sm" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cut Lays Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lay Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Measurements
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
                      {cutLays.map((lay) => (
                        <tr key={lay.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lay.layNumber}</div>
                              <div className="text-sm text-gray-500">{lay.markerName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lay.orderNumber}</div>
                              <div className="text-sm text-gray-500">{lay.clientName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Length: {lay.layLength}m</div>
                              <div>Plies: {lay.plies}</div>
                              <div>Pieces: {lay.totalPieces}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(lay.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <QrCode className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bundles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bundle Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Bundles Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bundle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size & Qty
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
                      {bundles.map((bundle) => (
                        <tr key={bundle.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{bundle.bundleNumber}</div>
                              <div className="text-sm text-gray-500">QR: {bundle.qrCode}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{bundle.orderNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Size: {bundle.sizeCode}</div>
                              <div>Qty: {bundle.quantity} pcs</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(bundle.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <QrCode className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cutting Efficiency Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Efficiency Analytics</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cutting efficiency charts and analytics will be displayed here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}