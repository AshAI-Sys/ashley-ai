'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Package2, Printer, Timer, Thermometer, Camera, Eye, Zap } from 'lucide-react'

interface DTFWorkflowProps {
  runId: string
  onUpdate?: (data: any) => void
  readOnly?: boolean
}

interface DTFData {
  film_setup: {
    design_file: string
    film_type: string
    print_resolution: number
    color_profile: string
    rip_software: string
    status: 'pending' | 'complete' | 'needs_adjustment'
  }
  printing: {
    film_consumed_m2: number
    ink_usage_ml: Array<{
      color: string
      amount: number
    }>
    print_quality_check: boolean
    color_density: number
    edge_definition: boolean
  }
  powder_application: {
    powder_type: string
    application_method: 'MANUAL' | 'AUTOMATIC'
    powder_consumed_g: number
    coverage_uniformity: boolean
    excess_powder_recycled: boolean
  }
  curing: {
    temperature_c: number
    time_seconds: number
    conveyor_speed: string
    powder_adhesion_test: boolean
    film_flexibility_test: boolean
  }
  transfer: {
    press_temperature_c: number
    press_time_seconds: number
    pressure: 'LIGHT' | 'MEDIUM' | 'FIRM'
    peeling_method: 'HOT' | 'COLD'
    transfer_quality: boolean
  }
  quality_control: {
    adhesion_test: boolean
    stretch_test: boolean
    wash_durability: boolean
    final_approval: boolean
    notes: string
  }
  ashley_recommendations: {
    optimal_cure_temp: number
    powder_efficiency: number
    transfer_success_rate: number
    quality_score: number
  }
}

export default function DTFWorkflow({ runId, onUpdate, readOnly = false }: DTFWorkflowProps) {
  const [activeStep, setActiveStep] = useState<'setup' | 'print' | 'powder' | 'cure' | 'transfer' | 'quality'>('setup')
  const [data, setData] = useState<DTFData>({
    film_setup: {
      design_file: 'dtf_design_v1.pdf',
      film_type: 'PET_Film_75mic',
      print_resolution: 1440,
      color_profile: 'DTF_Standard',
      rip_software: 'AcroRIP',
      status: 'pending'
    },
    printing: {
      film_consumed_m2: 0,
      ink_usage_ml: [
        { color: 'White', amount: 0 },
        { color: 'Cyan', amount: 0 },
        { color: 'Magenta', amount: 0 },
        { color: 'Yellow', amount: 0 },
        { color: 'Black', amount: 0 }
      ],
      print_quality_check: false,
      color_density: 0,
      edge_definition: false
    },
    powder_application: {
      powder_type: 'Hot_Melt_TPU',
      application_method: 'AUTOMATIC',
      powder_consumed_g: 0,
      coverage_uniformity: false,
      excess_powder_recycled: false
    },
    curing: {
      temperature_c: 160,
      time_seconds: 60,
      conveyor_speed: 'MEDIUM',
      powder_adhesion_test: false,
      film_flexibility_test: false
    },
    transfer: {
      press_temperature_c: 160,
      press_time_seconds: 15,
      pressure: 'MEDIUM',
      peeling_method: 'COLD',
      transfer_quality: false
    },
    quality_control: {
      adhesion_test: false,
      stretch_test: false,
      wash_durability: false,
      final_approval: false,
      notes: ''
    },
    ashley_recommendations: {
      optimal_cure_temp: 165,
      powder_efficiency: 85,
      transfer_success_rate: 92,
      quality_score: 88
    }
  })

  const updateData = (section: keyof DTFData, updates: any) => {
    const newData = {
      ...data,
      [section]: { ...data[section], ...updates }
    }
    setData(newData)
    onUpdate?.(newData)
  }

  const updateInkUsage = (index: number, amount: number) => {
    const updatedInk = [...data.printing.ink_usage_ml]
    updatedInk[index].amount = amount
    updateData('printing', { ink_usage_ml: updatedInk })
  }

  const getStepStatus = (step: keyof Omit<DTFData, 'ashley_recommendations'>) => {
    switch (step) {
      case 'film_setup':
        return data.film_setup.status
      case 'printing':
        return data.printing.print_quality_check ? 'complete' : 'pending'
      case 'powder_application':
        return data.powder_application.coverage_uniformity ? 'complete' : 'pending'
      case 'curing':
        return data.curing.powder_adhesion_test ? 'complete' : 'pending'
      case 'transfer':
        return data.transfer.transfer_quality ? 'complete' : 'pending'
      case 'quality_control':
        return data.quality_control.final_approval ? 'complete' : 'pending'
      default:
        return 'pending'
    }
  }

  const steps = [
    { key: 'setup', title: 'Film Setup', icon: Package2 },
    { key: 'print', title: 'Printing', icon: Printer },
    { key: 'powder', title: 'Powder', icon: Zap },
    { key: 'cure', title: 'Curing', icon: Thermometer },
    { key: 'transfer', title: 'Transfer', icon: Timer },
    { key: 'quality', title: 'Quality', icon: Eye }
  ] as const

  return (
    <div className="space-y-6">
      {/* Ashley AI Recommendations */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Package2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Ashley AI DTF Optimization</CardTitle>
              <CardDescription>Smart recommendations for Direct-to-Film printing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.ashley_recommendations.quality_score}%</div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.ashley_recommendations.transfer_success_rate}%</div>
              <p className="text-sm text-muted-foreground">Transfer Success</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.ashley_recommendations.optimal_cure_temp}°C</div>
              <p className="text-sm text-muted-foreground">Optimal Cure</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{data.ashley_recommendations.powder_efficiency}%</div>
              <p className="text-sm text-muted-foreground">Powder Efficiency</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step) => {
          const status = getStepStatus(step.key)
          const StepIcon = step.icon
          const isActive = activeStep === step.key
          
          return (
            <Button
              key={step.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStep(step.key)}
              className={`flex items-center gap-2 min-w-fit ${
                status === 'complete' ? 'border-green-500 text-green-700' : ''
              }`}
            >
              <StepIcon className="w-4 h-4" />
              {step.title}
              {status === 'complete' && <CheckCircle className="w-4 h-4 text-green-600" />}
            </Button>
          )
        })}
      </div>

      {/* Step Content */}
      {activeStep === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="w-5 h-5" />
              DTF Film Setup
            </CardTitle>
            <CardDescription>Configure film type and print settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Design File</Label>
                <Input
                  value={data.film_setup.design_file}
                  onChange={(e) => updateData('film_setup', { design_file: e.target.value })}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Film Type</Label>
                <Select
                  value={data.film_setup.film_type}
                  onValueChange={(value) => updateData('film_setup', { film_type: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PET_Film_75mic">PET Film 75μm</SelectItem>
                    <SelectItem value="PET_Film_100mic">PET Film 100μm</SelectItem>
                    <SelectItem value="Cold_Peel_Film">Cold Peel Film</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Print Resolution (DPI)</Label>
                <Select
                  value={data.film_setup.print_resolution.toString()}
                  onValueChange={(value) => updateData('film_setup', { print_resolution: parseInt(value) })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720">720 DPI</SelectItem>
                    <SelectItem value="1440">1440 DPI</SelectItem>
                    <SelectItem value="2880">2880 DPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color Profile</Label>
                <Select
                  value={data.film_setup.color_profile}
                  onValueChange={(value) => updateData('film_setup', { color_profile: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DTF_Standard">DTF Standard</SelectItem>
                    <SelectItem value="Epson_DTF">Epson DTF</SelectItem>
                    <SelectItem value="Custom_Profile">Custom Profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>RIP Software</Label>
              <Select
                value={data.film_setup.rip_software}
                onValueChange={(value) => updateData('film_setup', { rip_software: value })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AcroRIP">AcroRIP</SelectItem>
                  <SelectItem value="PhotoPRINT">PhotoPRINT</SelectItem>
                  <SelectItem value="Wasatch">Wasatch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Setup Status</Label>
              <Select
                value={data.film_setup.status}
                onValueChange={(value) => updateData('film_setup', { status: value })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="needs_adjustment">Needs Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!readOnly && (
              <Button className="w-full" onClick={() => setActiveStep('print')}>
                Start Film Printing
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === 'print' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Film Printing
            </CardTitle>
            <CardDescription>Print design onto DTF film with white ink underbase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Film Consumed (m²)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={data.printing.film_consumed_m2}
                  onChange={(e) => updateData('printing', { film_consumed_m2: parseFloat(e.target.value) || 0 })}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Color Density (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={data.printing.color_density}
                  onChange={(e) => updateData('printing', { color_density: parseInt(e.target.value) || 0 })}
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg">Ink Consumption (ml)</Label>
              <div className="grid grid-cols-2 gap-4">
                {data.printing.ink_usage_ml.map((ink, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${
                      ink.color === 'White' ? 'bg-white border-gray-300' :
                      ink.color === 'Cyan' ? 'bg-cyan-500' :
                      ink.color === 'Magenta' ? 'bg-pink-500' :
                      ink.color === 'Yellow' ? 'bg-yellow-500' : 'bg-gray-800'
                    }`} />
                    <Label className="w-16">{ink.color}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={ink.amount}
                      onChange={(e) => updateInkUsage(index, parseFloat(e.target.value) || 0)}
                      className="flex-1"
                      readOnly={readOnly}
                    />
                    <span className="text-sm text-muted-foreground">ml</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="printQuality"
                  checked={data.printing.print_quality_check}
                  onChange={(e) => updateData('printing', { print_quality_check: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="printQuality">Print quality approved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edgeDefinition"
                  checked={data.printing.edge_definition}
                  onChange={(e) => updateData('printing', { edge_definition: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="edgeDefinition">Sharp edge definition</Label>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">DTF Print Checklist:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ White underbase complete and opaque</li>
                <li>✓ CMYK colors printed in correct order</li>
                <li>✓ No ink bleeding or smudging</li>
                <li>✓ Clean, sharp edges</li>
              </ul>
            </div>

            {!readOnly && (
              <Button className="w-full" onClick={() => setActiveStep('powder')}>
                Ready for Powder Application
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === 'powder' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Powder Application
            </CardTitle>
            <CardDescription>Apply hot melt adhesive powder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Powder Type</Label>
                <Select
                  value={data.powder_application.powder_type}
                  onValueChange={(value) => updateData('powder_application', { powder_type: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hot_Melt_TPU">Hot Melt TPU</SelectItem>
                    <SelectItem value="Low_Temp_Powder">Low Temp Powder</SelectItem>
                    <SelectItem value="High_Opacity">High Opacity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Application Method</Label>
                <Select
                  value={data.powder_application.application_method}
                  onValueChange={(value) => updateData('powder_application', { application_method: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual Shaker</SelectItem>
                    <SelectItem value="AUTOMATIC">Automatic Applicator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Powder Consumed (g)</Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={data.powder_application.powder_consumed_g}
                onChange={(e) => updateData('powder_application', { powder_consumed_g: parseFloat(e.target.value) || 0 })}
                readOnly={readOnly}
              />
              <p className="text-xs text-muted-foreground">
                Estimated: {data.ashley_recommendations.powder_efficiency}% efficiency
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="uniformCoverage"
                  checked={data.powder_application.coverage_uniformity}
                  onChange={(e) => updateData('powder_application', { coverage_uniformity: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="uniformCoverage">Uniform powder coverage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recycledPowder"
                  checked={data.powder_application.excess_powder_recycled}
                  onChange={(e) => updateData('powder_application', { excess_powder_recycled: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="recycledPowder">Excess powder recycled</Label>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium mb-2">Powder Application Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Apply powder while ink is still tacky</li>
                <li>• Ensure even coverage across all print areas</li>
                <li>• Remove excess powder for recycling</li>
                <li>• Check for powder-free areas that may cause adhesion issues</li>
              </ul>
            </div>

            {!readOnly && (
              <Button className="w-full" onClick={() => setActiveStep('cure')}>
                Ready for Curing
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === 'cure' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Powder Curing
            </CardTitle>
            <CardDescription>Cure powder to create adhesive layer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  min="140"
                  max="180"
                  value={data.curing.temperature_c}
                  onChange={(e) => updateData('curing', { temperature_c: parseInt(e.target.value) })}
                  readOnly={readOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: {data.ashley_recommendations.optimal_cure_temp}°C
                </p>
              </div>
              <div className="space-y-2">
                <Label>Time (seconds)</Label>
                <Input
                  type="number"
                  min="30"
                  max="120"
                  value={data.curing.time_seconds}
                  onChange={(e) => updateData('curing', { time_seconds: parseInt(e.target.value) })}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Conveyor Speed</Label>
                <Select
                  value={data.curing.conveyor_speed}
                  onValueChange={(value) => updateData('curing', { conveyor_speed: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SLOW">Slow</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="FAST">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="adhesionTest"
                  checked={data.curing.powder_adhesion_test}
                  onChange={(e) => updateData('curing', { powder_adhesion_test: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="adhesionTest">Powder adhesion test passed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="flexibilityTest"
                  checked={data.curing.film_flexibility_test}
                  onChange={(e) => updateData('curing', { film_flexibility_test: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="flexibilityTest">Film flexibility maintained</Label>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium mb-2">Curing Guidelines:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• TPU powder: 160-170°C for 60 seconds</li>
                <li>• Low-temp powder: 140-150°C for 45 seconds</li>
                <li>• Film should remain flexible after curing</li>
                <li>• Powder should be fully melted and adhesive</li>
              </ul>
            </div>

            {!readOnly && (
              <Button className="w-full" onClick={() => setActiveStep('transfer')}>
                Ready for Transfer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === 'transfer' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Heat Press Transfer
            </CardTitle>
            <CardDescription>Transfer DTF print to garment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Press Temperature (°C)</Label>
                <Input
                  type="number"
                  min="140"
                  max="180"
                  value={data.transfer.press_temperature_c}
                  onChange={(e) => updateData('transfer', { press_temperature_c: parseInt(e.target.value) })}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Press Time (seconds)</Label>
                <Input
                  type="number"
                  min="10"
                  max="30"
                  value={data.transfer.press_time_seconds}
                  onChange={(e) => updateData('transfer', { press_time_seconds: parseInt(e.target.value) })}
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pressure</Label>
                <Select
                  value={data.transfer.pressure}
                  onValueChange={(value) => updateData('transfer', { pressure: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIGHT">Light</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="FIRM">Firm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Peeling Method</Label>
                <Select
                  value={data.transfer.peeling_method}
                  onValueChange={(value) => updateData('transfer', { peeling_method: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOT">Hot Peel</SelectItem>
                    <SelectItem value="COLD">Cold Peel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="transferQuality"
                checked={data.transfer.transfer_quality}
                onChange={(e) => updateData('transfer', { transfer_quality: e.target.checked })}
                disabled={readOnly}
              />
              <Label htmlFor="transferQuality">Transfer quality approved</Label>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">Transfer Guidelines:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cotton: 160°C, 15 seconds, Medium pressure</li>
                <li>• Polyester: 150°C, 12 seconds, Light pressure</li>
                <li>• Cold peel recommended for most DTF transfers</li>
                <li>• Apply even pressure across entire design</li>
              </ul>
            </div>

            {!readOnly && (
              <Button className="w-full" onClick={() => setActiveStep('quality')}>
                Transfer Complete
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === 'quality' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Quality Control
            </CardTitle>
            <CardDescription>Final quality assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="adhesionTest"
                  checked={data.quality_control.adhesion_test}
                  onChange={(e) => updateData('quality_control', { adhesion_test: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="adhesionTest">Adhesion test passed</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="stretchTest"
                  checked={data.quality_control.stretch_test}
                  onChange={(e) => updateData('quality_control', { stretch_test: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="stretchTest">Stretch test passed</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="washDurability"
                  checked={data.quality_control.wash_durability}
                  onChange={(e) => updateData('quality_control', { wash_durability: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="washDurability">Wash durability test passed</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="finalApproval"
                  checked={data.quality_control.final_approval}
                  onChange={(e) => updateData('quality_control', { final_approval: e.target.checked })}
                  disabled={readOnly}
                />
                <Label htmlFor="finalApproval">Final quality approval</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quality Control Notes</Label>
              <Textarea
                value={data.quality_control.notes}
                onChange={(e) => updateData('quality_control', { notes: e.target.value })}
                placeholder="Record quality observations, tests performed, any issues..."
                rows={4}
                readOnly={readOnly}
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">DTF Quality Standards:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Strong adhesion to fabric</li>
                <li>✓ Good stretch and recovery</li>
                <li>✓ Vibrant, accurate colors</li>
                <li>✓ No cracking or peeling</li>
                <li>✓ Soft hand feel</li>
              </ul>
            </div>

            {!readOnly && data.quality_control.final_approval && (
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete DTF Run
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}