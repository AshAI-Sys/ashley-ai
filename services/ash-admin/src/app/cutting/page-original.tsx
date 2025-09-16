'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Scissors, 
  QrCode, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface FabricBatch {
  id: string
  lot_no: string
  uom: string
  qty_on_hand: number
  gsm?: number
  width_cm?: number
  brand: {
    name: string
    code: string
  }
  created_at: string
}

interface CutLay {
  id: string
  marker_name?: string
  marker_width_cm?: number
  lay_length_m: number
  plies: number
  gross_used: number
  offcuts?: number
  defects?: number
  uom: string
  created_at: string
  outputs: Array<{
    size_code: string
    qty: number
  }>
}

interface Bundle {
  id: string
  size_code: string
  qty: number
  qr_code: string
  status: string
  created_at: string
}

export default function CuttingPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [fabricBatches, setFabricBatches] = useState<FabricBatch[]>([])
  const [cutLays, setCutLays] = useState<CutLay[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [search, brandFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch fabric batches
      const batchesResponse = await fetch(`/api/cutting/fabric-batches${brandFilter !== 'all' ? `?brand_id=${brandFilter}` : ''}`)
      if (batchesResponse.ok) {
        const batchesData = await batchesResponse.json()
        setFabricBatches(batchesData.data || [])
      }

      // For demo, we'll use mock data for lays and bundles
      // In real implementation, these would come from API
      setCutLays([
        {
          id: '1',
          marker_name: 'Hoodie Marker V2',
          marker_width_cm: 160,
          lay_length_m: 25.5,
          plies: 12,
          gross_used: 18.2,
          offcuts: 0.8,
          defects: 0.2,
          uom: 'KG',
          created_at: new Date().toISOString(),
          outputs: [
            { size_code: 'M', qty: 48 },
            { size_code: 'L', qty: 48 },
            { size_code: 'XL', qty: 24 }
          ]
        }
      ])

      setBundles([
        {
          id: '1',
          size_code: 'M',
          qty: 20,
          qr_code: 'ash://bundle/demo-1',
          status: 'CREATED',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          size_code: 'L',
          qty: 20,
          qr_code: 'ash://bundle/demo-2',
          status: 'IN_SEWING',
          created_at: new Date().toISOString()
        }
      ])

    } catch (error) {
      console.error('Failed to fetch cutting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CREATED': return 'bg-blue-100 text-blue-800'
      case 'IN_SEWING': return 'bg-yellow-100 text-yellow-800'
      case 'DONE': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cutting Operations</h1>
          <p className="text-muted-foreground">Manage fabric cutting, lays, and bundle creation</p>
        </div>
        <div className="flex gap-2">
          <Link href="/cutting/issue-fabric">
            <Button variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Issue Fabric
            </Button>
          </Link>
          <Link href="/cutting/create-lay">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Scissors className="w-4 h-4 mr-2" />
              Create Lay
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Batches</p>
                <p className="text-2xl font-bold">{fabricBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cut Lays</p>
                <p className="text-2xl font-bold">{cutLays.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bundles</p>
                <p className="text-2xl font-bold">{bundles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">
                  {cutLays.length > 0 ? 
                    Math.round(cutLays.reduce((sum, lay) => {
                      const efficiency = ((lay.gross_used - (lay.offcuts || 0) - (lay.defects || 0)) / lay.gross_used) * 100
                      return sum + efficiency
                    }, 0) / cutLays.length) : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search batches, lays, bundles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="brand1">Trendy Casual</SelectItem>
                  <SelectItem value="brand2">Urban Streetwear</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Fabric Batches</TabsTrigger>
          <TabsTrigger value="lays">Cut Lays</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest cutting operations and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Scissors className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">New lay created for TCAS-2025-000001</p>
                      <p className="text-sm text-muted-foreground">120 pieces cut across 3 sizes</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <QrCode className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">6 bundles created and ready for sewing</p>
                      <p className="text-sm text-muted-foreground">Bundle sizes: 20 pcs each</p>
                    </div>
                    <span className="text-sm text-muted-foreground">4 hours ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium">Low fabric efficiency detected</p>
                      <p className="text-sm text-muted-foreground">Lay #12 efficiency: 72% (below 78% threshold)</p>
                    </div>
                    <span className="text-sm text-muted-foreground">6 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batches" className="mt-6">
          <div className="grid gap-4">
            {fabricBatches.map((batch) => (
              <Card key={batch.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{batch.lot_no}</h3>
                        <Badge variant="secondary">{batch.brand.name}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Available:</span><br />
                          {batch.qty_on_hand} {batch.uom}
                        </div>
                        <div>
                          <span className="font-medium">GSM:</span><br />
                          {batch.gsm || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Width:</span><br />
                          {batch.width_cm ? `${batch.width_cm} cm` : 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Received:</span><br />
                          {new Date(batch.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Issue to Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {fabricBatches.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No fabric batches available</p>
                  <Button>Add Fabric Batch</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="lays" className="mt-6">
          <div className="grid gap-4">
            {cutLays.map((lay) => (
              <Card key={lay.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{lay.marker_name || `Lay #${lay.id}`}</h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          {lay.outputs.reduce((sum, output) => sum + output.qty, 0)} pieces
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span className="font-medium">Dimensions:</span><br />
                          {lay.marker_width_cm ? `${lay.marker_width_cm}cm × ` : ''}{lay.lay_length_m}m × {lay.plies} plies
                        </div>
                        <div>
                          <span className="font-medium">Used:</span><br />
                          {lay.gross_used} {lay.uom}
                        </div>
                        <div>
                          <span className="font-medium">Waste:</span><br />
                          {(lay.offcuts || 0) + (lay.defects || 0)} {lay.uom}
                        </div>
                        <div>
                          <span className="font-medium">Efficiency:</span><br />
                          {Math.round(((lay.gross_used - (lay.offcuts || 0) - (lay.defects || 0)) / lay.gross_used) * 100)}%
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {lay.outputs.map((output) => (
                          <Badge key={output.size_code} variant="outline">
                            {output.size_code}: {output.qty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="w-4 h-4 mr-1" />
                        Create Bundles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {cutLays.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No cut lays recorded</p>
                  <Link href="/cutting/create-lay">
                    <Button>Create First Lay</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bundles" className="mt-6">
          <div className="grid gap-4">
            {bundles.map((bundle) => (
              <Card key={bundle.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">Bundle #{bundle.id}</h3>
                        <Badge className={getStatusColor(bundle.status)}>
                          {bundle.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {bundle.size_code}: {bundle.qty} pcs
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">QR Code:</span> {bundle.qr_code}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(bundle.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="w-4 h-4 mr-1" />
                        Print Label
                      </Button>
                      <Button variant="outline" size="sm">
                        Track Bundle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {bundles.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No bundles created</p>
                  <p className="text-sm text-muted-foreground">Bundles are created after cutting lays</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  )
}