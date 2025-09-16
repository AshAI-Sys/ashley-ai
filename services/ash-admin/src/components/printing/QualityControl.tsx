'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, Camera, Plus, Trash2, Eye, Target, FileText, TrendingUp } from 'lucide-react'

interface DefectReason {
  id: string
  reason_code: string
  quantity: number
  photo_url?: string
  cost_attribution: 'SUPPLIER' | 'STAFF' | 'COMPANY' | 'CLIENT'
  description?: string
  location?: string
}

interface QualityMetrics {
  total_produced: number
  total_good: number
  total_rejected: number
  quality_rate: number
  first_pass_yield: number
  defect_rate: number
}

interface QualityControlProps {
  runId: string
  method: string
  onUpdate?: (data: any) => void
  readOnly?: boolean
}

const defectCodes = {
  SILKSCREEN: [
    { code: 'MISALIGNMENT', name: 'Misalignment', severity: 'MAJOR' },
    { code: 'INK_BLEED', name: 'Ink Bleeding', severity: 'MINOR' },
    { code: 'UNDER_CURE', name: 'Under Cured', severity: 'CRITICAL' },
    { code: 'OVER_CURE', name: 'Over Cured', severity: 'MAJOR' },
    { code: 'PINHOLES', name: 'Pin Holes', severity: 'MINOR' },
    { code: 'GHOSTING', name: 'Ghost Image', severity: 'MAJOR' },
    { code: 'INCOMPLETE', name: 'Incomplete Print', severity: 'CRITICAL' },
    { code: 'COLOR_OFF', name: 'Color Off', severity: 'MAJOR' }
  ],
  SUBLIMATION: [
    { code: 'COLOR_SHIFT', name: 'Color Shift', severity: 'MAJOR' },
    { code: 'GHOSTING', name: 'Ghost Lines', severity: 'MINOR' },
    { code: 'POOR_TRANSFER', name: 'Poor Transfer', severity: 'CRITICAL' },
    { code: 'BLURRY', name: 'Blurry Image', severity: 'MAJOR' },
    { code: 'INCOMPLETE', name: 'Incomplete Transfer', severity: 'CRITICAL' },
    { code: 'FADE_UNEVEN', name: 'Uneven Fade', severity: 'MINOR' },
    { code: 'REGISTRATION', name: 'Registration Off', severity: 'MAJOR' }
  ],
  DTF: [
    { code: 'POOR_ADHESION', name: 'Poor Adhesion', severity: 'CRITICAL' },
    { code: 'POWDER_CLUMPS', name: 'Powder Clumps', severity: 'MINOR' },
    { code: 'FILM_TEAR', name: 'Film Tear', severity: 'MAJOR' },
    { code: 'INK_SMUDGE', name: 'Ink Smudge', severity: 'MINOR' },
    { code: 'INCOMPLETE', name: 'Incomplete Print', severity: 'CRITICAL' },
    { code: 'EDGE_LIFT', name: 'Edge Lifting', severity: 'MAJOR' },
    { code: 'COLOR_OFF', name: 'Color Mismatch', severity: 'MAJOR' }
  ],
  EMBROIDERY: [
    { code: 'THREAD_BREAK', name: 'Thread Break', severity: 'MINOR' },
    { code: 'PUCKERING', name: 'Fabric Puckering', severity: 'MAJOR' },
    { code: 'REGISTRATION', name: 'Poor Registration', severity: 'MAJOR' },
    { code: 'LOOSE_STITCHES', name: 'Loose Stitches', severity: 'MINOR' },
    { code: 'SKIP_STITCHES', name: 'Skip Stitches', severity: 'MAJOR' },
    { code: 'WRONG_COLOR', name: 'Wrong Thread Color', severity: 'CRITICAL' },
    { code: 'INCOMPLETE', name: 'Incomplete Design', severity: 'CRITICAL' },
    { code: 'TENSION_OFF', name: 'Thread Tension Off', severity: 'MINOR' }
  ]
}

const severityColors = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  MAJOR: 'bg-orange-100 text-orange-800 border-orange-200',
  MINOR: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

const attributionOptions = [
  { value: 'SUPPLIER', label: 'Supplier/Material' },
  { value: 'STAFF', label: 'Staff/Operator' },
  { value: 'COMPANY', label: 'Company/Process' },
  { value: 'CLIENT', label: 'Client/Design' }
]

export default function QualityControl({ runId, method, onUpdate, readOnly = false }: QualityControlProps) {
  const [defects, setDefects] = useState<DefectReason[]>([])
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    total_produced: 0,
    total_good: 0,
    total_rejected: 0,
    quality_rate: 100,
    first_pass_yield: 100,
    defect_rate: 0
  })
  
  const [showAddDefect, setShowAddDefect] = useState(false)
  const [newDefect, setNewDefect] = useState<Partial<DefectReason>>({
    reason_code: '',
    quantity: 1,
    cost_attribution: 'COMPANY',
    description: '',
    location: ''
  })

  const [inspectionNotes, setInspectionNotes] = useState('')
  const [finalApproval, setFinalApproval] = useState(false)

  useEffect(() => {
    calculateMetrics()
  }, [defects])

  const calculateMetrics = () => {
    const totalRejected = defects.reduce((sum, defect) => sum + defect.quantity, 0)
    const totalProduced = qualityMetrics.total_good + totalRejected
    const qualityRate = totalProduced > 0 ? ((qualityMetrics.total_good / totalProduced) * 100) : 100
    const defectRate = totalProduced > 0 ? ((totalRejected / totalProduced) * 100) : 0

    setQualityMetrics(prev => ({
      ...prev,
      total_rejected: totalRejected,
      total_produced: totalProduced,
      quality_rate: Math.round(qualityRate * 100) / 100,
      defect_rate: Math.round(defectRate * 100) / 100,
      first_pass_yield: qualityRate // Simplified for demo
    }))
  }

  const addDefect = () => {
    if (!newDefect.reason_code || !newDefect.quantity) return

    const defectCode = getDefectCodes().find(d => d.code === newDefect.reason_code)
    const defect: DefectReason = {
      id: Date.now().toString(),
      reason_code: newDefect.reason_code,
      quantity: newDefect.quantity,
      cost_attribution: newDefect.cost_attribution || 'COMPANY',
      description: newDefect.description,
      location: newDefect.location
    }

    setDefects([...defects, defect])
    setNewDefect({
      reason_code: '',
      quantity: 1,
      cost_attribution: 'COMPANY',
      description: '',
      location: ''
    })
    setShowAddDefect(false)
    onUpdate?.({ defects: [...defects, defect], metrics: qualityMetrics })
  }

  const removeDefect = (defectId: string) => {
    const updated = defects.filter(d => d.id !== defectId)
    setDefects(updated)
    onUpdate?.({ defects: updated, metrics: qualityMetrics })
  }

  const updateDefect = (defectId: string, field: string, value: any) => {
    const updated = defects.map(d =>
      d.id === defectId ? { ...d, [field]: value } : d
    )
    setDefects(updated)
    onUpdate?.({ defects: updated, metrics: qualityMetrics })
  }

  const getDefectCodes = () => {
    return defectCodes[method as keyof typeof defectCodes] || []
  }

  const getDefectsBySeverity = () => {
    const defectCodeMap = getDefectCodes().reduce((map, code) => {
      map[code.code] = code
      return map
    }, {} as any)

    return defects.reduce((acc, defect) => {
      const severity = defectCodeMap[defect.reason_code]?.severity || 'MINOR'
      acc[severity] = (acc[severity] || 0) + defect.quantity
      return acc
    }, {} as Record<string, number>)
  }

  const capturePhoto = (defectId: string) => {
    // In a real app, this would open camera or file picker
    console.log('Capture photo for defect:', defectId)
  }

  const getQualityStatus = () => {
    if (qualityMetrics.quality_rate >= 98) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (qualityMetrics.quality_rate >= 95) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (qualityMetrics.quality_rate >= 90) return { status: 'acceptable', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { status: 'needs improvement', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const qualityStatus = getQualityStatus()
  const defectsBySeverity = getDefectsBySeverity()

  return (
    <div className="space-y-6">
      {/* Quality Metrics Overview */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle>Quality Metrics Summary</CardTitle>
              <CardDescription>Real-time quality tracking for {method} run</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{qualityMetrics.total_produced}</div>
              <p className="text-sm text-muted-foreground">Total Produced</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{qualityMetrics.total_good}</div>
              <p className="text-sm text-muted-foreground">Good Units</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{qualityMetrics.total_rejected}</div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
            <div className={`text-center p-3 rounded-lg ${qualityStatus.bg}`}>
              <div className={`text-2xl font-bold ${qualityStatus.color}`}>
                {qualityMetrics.quality_rate}%
              </div>
              <p className="text-sm text-muted-foreground">Quality Rate</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quality Performance</span>
              <span className={`font-medium capitalize ${qualityStatus.color}`}>
                {qualityStatus.status}
              </span>
            </div>
            <Progress value={qualityMetrics.quality_rate} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="defects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="defects">Defect Tracking</TabsTrigger>
          <TabsTrigger value="inspection">Inspection</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="defects" className="space-y-4">
          {/* Defect Classification */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Defect Classification</CardTitle>
                {!readOnly && (
                  <Dialog open={showAddDefect} onOpenChange={setShowAddDefect}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Defect
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Record Quality Defect</DialogTitle>
                        <DialogDescription>
                          Document defects found during {method} printing
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Defect Type</Label>
                            <Select value={newDefect.reason_code} onValueChange={(value) => setNewDefect({...newDefect, reason_code: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select defect" />
                              </SelectTrigger>
                              <SelectContent>
                                {getDefectCodes().map((defect) => (
                                  <SelectItem key={defect.code} value={defect.code}>
                                    <div className="flex items-center gap-2">
                                      <Badge className={severityColors[defect.severity as keyof typeof severityColors]} variant="outline">
                                        {defect.severity}
                                      </Badge>
                                      {defect.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={newDefect.quantity}
                              onChange={(e) => setNewDefect({...newDefect, quantity: parseInt(e.target.value) || 1})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Cost Attribution</Label>
                          <Select value={newDefect.cost_attribution} onValueChange={(value) => setNewDefect({...newDefect, cost_attribution: value as any})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {attributionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Location (optional)</Label>
                          <Input
                            value={newDefect.location}
                            onChange={(e) => setNewDefect({...newDefect, location: e.target.value})}
                            placeholder="e.g., Front chest, Left sleeve"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newDefect.description}
                            onChange={(e) => setNewDefect({...newDefect, description: e.target.value})}
                            placeholder="Detailed description of the defect..."
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddDefect(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addDefect} disabled={!newDefect.reason_code}>
                            Add Defect
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {defects.length > 0 ? (
                <div className="space-y-3">
                  {defects.map((defect) => {
                    const defectInfo = getDefectCodes().find(d => d.code === defect.reason_code)
                    return (
                      <div key={defect.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={severityColors[defectInfo?.severity as keyof typeof severityColors || 'MINOR']}>
                              {defectInfo?.severity || 'MINOR'}
                            </Badge>
                            <span className="font-medium">
                              {defectInfo?.name || defect.reason_code}
                            </span>
                            <Badge variant="outline">
                              Qty: {defect.quantity}
                            </Badge>
                          </div>
                          
                          {defect.location && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Location: {defect.location}
                            </p>
                          )}
                          
                          {defect.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {defect.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {attributionOptions.find(a => a.value === defect.cost_attribution)?.label}
                            </Badge>
                            {!readOnly && (
                              <Button size="sm" variant="outline" onClick={() => capturePhoto(defect.id)}>
                                <Camera className="w-3 h-3 mr-1" />
                                Photo
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {!readOnly && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeDefect(defect.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">No defects recorded</p>
                  <p className="text-sm text-green-600">Perfect quality run so far!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Quality Inspection
              </CardTitle>
              <CardDescription>
                Final inspection checklist and approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Method-specific inspection checklist */}
              <MethodInspectionChecklist method={method} />

              <div className="space-y-2">
                <Label>Inspector Notes</Label>
                <Textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Record inspection observations, measurements, and findings..."
                  rows={4}
                  readOnly={readOnly}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="finalApproval"
                  checked={finalApproval}
                  onChange={(e) => setFinalApproval(e.target.checked)}
                  disabled={readOnly}
                />
                <Label htmlFor="finalApproval" className="text-lg font-medium">
                  Final Quality Approval
                </Label>
              </div>

              {finalApproval && qualityMetrics.quality_rate >= 95 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Quality Approved</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Run meets quality standards with {qualityMetrics.quality_rate}% quality rate
                  </p>
                </div>
              )}

              {finalApproval && qualityMetrics.quality_rate < 95 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Quality Review Required</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Quality rate {qualityMetrics.quality_rate}% is below 95% threshold
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Defect Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(defectsBySeverity).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(defectsBySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={severityColors[severity as keyof typeof severityColors]}>
                            {severity}
                          </Badge>
                        </div>
                        <span className="font-bold">{count} units</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No defects to analyze</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Benchmarks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Industry Standard</span>
                  <span className="font-bold">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Company Target</span>
                  <span className="font-bold">98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Achievement</span>
                  <span className={`font-bold ${qualityStatus.color}`}>
                    {qualityMetrics.quality_rate}%
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    First Pass Yield: {qualityMetrics.first_pass_yield}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Defect Rate: {qualityMetrics.defect_rate}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MethodInspectionChecklist({ method }: { method: string }) {
  const checklists = {
    SILKSCREEN: [
      'Registration accuracy within 1mm tolerance',
      'Ink coverage is uniform and complete',
      'No bleeding or ink contamination',
      'Proper cure - no ink transfer when scratched',
      'Color matches approved sample',
      'No pinholes or screen marks'
    ],
    SUBLIMATION: [
      'Color vibrancy and accuracy',
      'No ghosting or double images',
      'Complete transfer with no fade areas',
      'Sharp edge definition',
      'Proper adhesion to fabric',
      'No paper residue or marks'
    ],
    DTF: [
      'Strong adhesion to fabric',
      'No peeling at edges',
      'Color accuracy and vibrancy',
      'Complete powder coverage',
      'Proper film removal',
      'Soft hand feel after application'
    ],
    EMBROIDERY: [
      'Stitch density and consistency',
      'Proper thread tension',
      'Accurate design placement',
      'No fabric puckering',
      'Clean thread cuts',
      'Color accuracy per specification'
    ]
  }

  const methodChecklist = checklists[method as keyof typeof checklists] || []

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">Inspection Checklist - {method}</Label>
      <div className="space-y-2">
        {methodChecklist.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`check-${index}`}
              className="rounded"
            />
            <Label htmlFor={`check-${index}`} className="text-sm">
              {item}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}