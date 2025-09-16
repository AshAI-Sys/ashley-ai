'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Play, Pause, Square, AlertCircle, CheckCircle, Clock, Zap, Package2, Palette, Shirt, Camera, Plus, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import SilkscreenWorkflow from '@/components/printing/SilkscreenWorkflow'
import SublimationWorkflow from '@/components/printing/SublimationWorkflow'
import DTFWorkflow from '@/components/printing/DTFWorkflow'
import EmbroideryWorkflow from '@/components/printing/EmbroideryWorkflow'
import MaterialConsumption from '@/components/printing/MaterialConsumption'
import AshleyAIOptimization from '@/components/printing/AshleyAIOptimization'

interface PrintRun {
  id: string
  method: 'SILKSCREEN' | 'SUBLIMATION' | 'DTF' | 'EMBROIDERY'
  status: 'CREATED' | 'IN_PROGRESS' | 'PAUSED' | 'DONE' | 'CANCELLED'
  workcenter: string
  started_at?: string
  ended_at?: string
  created_at: string
  order: {
    order_number: string
    brand: { name: string; code: string }
    line_items: Array<{ description: string; garment_type: string }>
    bundles: Array<{ id: string; qr_code: string; size_code: string; qty: number }>
  }
  machine: {
    id: string
    name: string
    workcenter: string
  } | null
  routing_step: {
    id: string
    step_name: string
    department: string
  } | null
  target_qty: number
  completed_qty: number
  rejected_qty: number
  materials_used: number
  runtime_minutes?: number
  method_data: any
}

interface MaterialConsumption {
  item_id: string
  item_name: string
  uom: string
  qty: number
  source_batch_id?: string
}

interface QualityData {
  qty_good: number
  qty_reject: number
  reject_reasons: Array<{
    reason_code: string
    qty: number
    photo_url?: string
    cost_attribution: string
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

export default function PrintRunDetailsPage() {
  const params = useParams()
  const runId = params.id as string
  
  const [run, setRun] = useState<PrintRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Material tracking
  const [materialData, setMaterialData] = useState<MaterialConsumption[]>([])
  const [newMaterial, setNewMaterial] = useState({
    item_name: '',
    uom: '',
    qty: '',
    source_batch_id: ''
  })
  
  // Quality tracking
  const [qualityData, setQualityData] = useState<QualityData>({
    qty_good: 0,
    qty_reject: 0,
    reject_reasons: []
  })
  
  // Method-specific data
  const [methodSpecificData, setMethodSpecificData] = useState<any>({})
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (runId) {
      fetchRunDetails()
    }
  }, [runId])

  const fetchRunDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/printing/runs/${runId}`)
      
      if (response.ok) {
        const data = await response.json()
        setRun(data.data)
        setMethodSpecificData(data.data.method_data || {})
      } else {
        console.error('Failed to fetch run details')
      }
    } catch (error) {
      console.error('Error fetching run details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunAction = async (action: 'start' | 'pause' | 'complete') => {
    try {
      setUpdating(true)
      const endpoint = action === 'start' ? 'start' : 
                     action === 'pause' ? 'pause' : 'complete'
      
      const body = action === 'complete' ? {
        qty_completed: qualityData.qty_good,
        qty_rejected: qualityData.qty_reject,
        reject_reasons: qualityData.reject_reasons,
        material_consumption: materialData,
        quality_notes: notes,
        ...methodSpecificData
      } : {}

      const response = await fetch(`/api/printing/runs/${runId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await fetchRunDetails()
      } else {
        console.error(`Failed to ${action} run`)
      }
    } catch (error) {
      console.error(`Error ${action}ing run:`, error)
    } finally {
      setUpdating(false)
    }
  }

  const addMaterial = () => {
    if (newMaterial.item_name && newMaterial.uom && newMaterial.qty) {
      setMaterialData([
        ...materialData,
        {
          item_id: `temp_${Date.now()}`,
          item_name: newMaterial.item_name,
          uom: newMaterial.uom,
          qty: parseFloat(newMaterial.qty),
          source_batch_id: newMaterial.source_batch_id || undefined
        }
      ])
      setNewMaterial({ item_name: '', uom: '', qty: '', source_batch_id: '' })
    }
  }

  const addRejectReason = () => {
    setQualityData({
      ...qualityData,
      reject_reasons: [
        ...qualityData.reject_reasons,
        {
          reason_code: '',
          qty: 1,
          cost_attribution: 'COMPANY'
        }
      ]
    })
  }

  const updateRejectReason = (index: number, field: string, value: any) => {
    const updatedReasons = [...qualityData.reject_reasons]
    updatedReasons[index] = { ...updatedReasons[index], [field]: value }
    setQualityData({ ...qualityData, reject_reasons: updatedReasons })
  }

  const getProgressPercentage = () => {
    if (!run || run.target_qty === 0) return 0
    return Math.round(((run.completed_qty + qualityData.qty_good) / run.target_qty) * 100)
  }

  const getRuntimeDisplay = () => {
    if (!run?.started_at) return 'Not started'
    
    const startTime = new Date(run.started_at)
    const endTime = run.ended_at ? new Date(run.ended_at) : new Date()
    const runtimeMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
    
    const hours = Math.floor(runtimeMinutes / 60)
    const minutes = runtimeMinutes % 60
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-4 animate-pulse" />
            <p>Loading print run details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
              <p className="text-red-600">Print run not found</p>
              <Link href="/printing">
                <Button className="mt-4" variant="outline">Back to Printing</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const MethodIcon = methodIcons[run.method]
  const progress = getProgressPercentage()

  return (
    <div className="container mx-auto py-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/printing">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Printing
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${methodColors[run.method]}`}>
              <MethodIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{run.order.order_number}</h1>
              <p className="text-muted-foreground">
                {run.order.brand.name} - {run.method} Print Run
              </p>
            </div>
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

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {run.completed_qty + qualityData.qty_good} / {run.target_qty}
            </div>
            <Progress value={progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getRuntimeDisplay()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {run.completed_qty + qualityData.qty_good > 0 ? 
                Math.round(((run.completed_qty + qualityData.qty_good) / 
                (run.completed_qty + qualityData.qty_good + run.rejected_qty + qualityData.qty_reject)) * 100) : 100}%
            </div>
            {(run.rejected_qty + qualityData.qty_reject) > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {run.rejected_qty + qualityData.qty_reject} rejected
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Machine</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {run.machine?.name || 'No machine assigned'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {run.machine?.workcenter.replace('_', ' ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {run.status === 'CREATED' && (
          <Button 
            onClick={() => handleRunAction('start')}
            disabled={updating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Run
          </Button>
        )}
        
        {run.status === 'IN_PROGRESS' && (
          <>
            <Button 
              onClick={() => handleRunAction('pause')}
              disabled={updating}
              variant="outline"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button 
              onClick={() => handleRunAction('complete')}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Square className="w-4 h-4 mr-2" />
              Complete Run
            </Button>
          </>
        )}

        {run.status === 'PAUSED' && (
          <Button 
            onClick={() => handleRunAction('start')}
            disabled={updating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
        )}
      </div>

      <Tabs defaultValue="tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="ashley-ai">Ashley AI</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="method">Method Details</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          {/* Live production tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Production Input</CardTitle>
                <CardDescription>Record production quantities in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qty_good">Good Quantity</Label>
                    <Input
                      id="qty_good"
                      type="number"
                      min="0"
                      value={qualityData.qty_good}
                      onChange={(e) => setQualityData({
                        ...qualityData,
                        qty_good: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qty_reject">Reject Quantity</Label>
                    <Input
                      id="qty_reject"
                      type="number"
                      min="0"
                      value={qualityData.qty_reject}
                      onChange={(e) => setQualityData({
                        ...qualityData,
                        qty_reject: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Production Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Record any observations, issues, or notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bundle Processing</CardTitle>
                <CardDescription>Scan and process bundles</CardDescription>
              </CardHeader>
              <CardContent>
                {run.order.bundles.length > 0 ? (
                  <div className="space-y-2">
                    {run.order.bundles.map((bundle) => (
                      <div key={bundle.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{bundle.qr_code}</span>
                          <p className="text-sm text-muted-foreground">
                            Size: {bundle.size_code} | Qty: {bundle.qty}
                          </p>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Package2 className="w-8 h-8 mx-auto mb-2" />
                    <p>No bundles available for processing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ashley-ai" className="space-y-4">
          <AshleyAIOptimization 
            runId={runId}
            printMethod={run.method}
            quantity={run.target_qty}
            materials={materialData}
            machineId={run.machine?.id}
            orderData={{
              quality_requirements: run.order.line_items[0]?.description?.includes('premium') ? { high_quality: true } : {},
              rush_order: run.created_at && new Date().getTime() - new Date(run.created_at).getTime() < 24 * 60 * 60 * 1000
            }}
          />
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <MaterialConsumption 
            runId={runId} 
            method={run.method} 
            onUpdate={setMaterialData}
            readOnly={run.status === 'DONE'}
          />
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control & Rejects</CardTitle>
              <CardDescription>Record defects and quality issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Reject Reasons</h3>
                <Button size="sm" variant="outline" onClick={addRejectReason}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reason
                </Button>
              </div>
              
              {qualityData.reject_reasons.map((reason, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded">
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={reason.reason_code}
                      onChange={(e) => updateRejectReason(index, 'reason_code', e.target.value)}
                    >
                      <option value="">Select reason</option>
                      <option value="MISALIGNMENT">Misalignment</option>
                      <option value="PEEL">Peel/Adhesion</option>
                      <option value="CRACK">Crack</option>
                      <option value="GHOST">Ghost Image</option>
                      <option value="PUCKERING">Puckering</option>
                      <option value="COLOR_OFF">Color Off</option>
                      <option value="INCOMPLETE">Incomplete Print</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={reason.qty}
                      onChange={(e) => updateRejectReason(index, 'qty', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attribution</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={reason.cost_attribution}
                      onChange={(e) => updateRejectReason(index, 'cost_attribution', e.target.value)}
                    >
                      <option value="COMPANY">Company</option>
                      <option value="SUPPLIER">Supplier</option>
                      <option value="STAFF">Staff</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <Button size="sm" variant="outline" className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture
                    </Button>
                  </div>
                </div>
              ))}
              
              {qualityData.reject_reasons.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No reject reasons recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="method" className="space-y-4">
          <MethodSpecificPanel method={run.method} runId={runId} data={methodSpecificData} onUpdate={setMethodSpecificData} readOnly={run.status === 'DONE'} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MethodSpecificPanel({ method, runId, data, onUpdate, readOnly }: { 
  method: string, 
  runId: string,
  data: any, 
  onUpdate: (data: any) => void,
  readOnly: boolean 
}) {
  switch (method) {
    case 'SILKSCREEN':
      return <SilkscreenWorkflow runId={runId} onUpdate={onUpdate} readOnly={readOnly} />
    case 'SUBLIMATION':
      return <SublimationWorkflow runId={runId} onUpdate={onUpdate} readOnly={readOnly} />
    case 'DTF':
      return <DTFWorkflow runId={runId} onUpdate={onUpdate} readOnly={readOnly} />
    case 'EMBROIDERY':
      return <EmbroideryWorkflow runId={runId} onUpdate={onUpdate} readOnly={readOnly} />
    default:
      return <div>Method-specific workflow not available</div>
  }
}

