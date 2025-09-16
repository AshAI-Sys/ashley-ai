'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Route, Sparkles, Clock, Users, TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProductionStep {
  id: string
  name: string
  department: string
  estimatedHours: number
  dependencies: string[]
  resources: string[]
}

interface ProductionRoute {
  id: string
  name: string
  description: string
  printingMethod: string
  efficiency: number
  estimatedDays: number
  steps: ProductionStep[]
  isRecommended?: boolean
  isCustom?: boolean
}

interface AshleyOptimization {
  recommendedRoute: string
  efficiencyGain: number
  timeSaving: number
  costSaving: number
  confidence: number
  reasoning: string[]
  warnings: string[]
}

interface ProductionRouteSectionProps {
  printingMethod: string
  totalQuantity: number
  deliveryDate: string
  selectedRoute: string
  onRouteChange: (routeId: string) => void
  onRouteOptimized: (optimization: AshleyOptimization) => void
}

const PRODUCTION_ROUTES: ProductionRoute[] = [
  {
    id: 'silkscreen_standard',
    name: 'Standard Silkscreen Route',
    description: 'Traditional silkscreen production flow',
    printingMethod: 'silkscreen',
    efficiency: 75,
    estimatedDays: 7,
    steps: [
      {
        id: 'design_prep',
        name: 'Design Preparation',
        department: 'Pre-Production',
        estimatedHours: 2,
        dependencies: [],
        resources: ['Design Software', 'Designer']
      },
      {
        id: 'screen_making',
        name: 'Screen Making',
        department: 'Pre-Production',
        estimatedHours: 4,
        dependencies: ['design_prep'],
        resources: ['Screen Room', 'Screen Maker']
      },
      {
        id: 'ink_mixing',
        name: 'Ink Mixing',
        department: 'Production',
        estimatedHours: 1,
        dependencies: ['design_prep'],
        resources: ['Ink Station', 'Color Matcher']
      },
      {
        id: 'printing',
        name: 'Screen Printing',
        department: 'Production',
        estimatedHours: 8,
        dependencies: ['screen_making', 'ink_mixing'],
        resources: ['Print Station', 'Printer Operator']
      },
      {
        id: 'curing',
        name: 'Curing/Drying',
        department: 'Production',
        estimatedHours: 2,
        dependencies: ['printing'],
        resources: ['Conveyor Dryer', 'Machine Operator']
      },
      {
        id: 'qc_folding',
        name: 'Quality Check & Folding',
        department: 'Quality Control',
        estimatedHours: 4,
        dependencies: ['curing'],
        resources: ['QC Station', 'QC Inspector']
      },
      {
        id: 'packaging',
        name: 'Packaging',
        department: 'Finishing',
        estimatedHours: 2,
        dependencies: ['qc_folding'],
        resources: ['Pack Station', 'Packer']
      }
    ]
  },
  {
    id: 'silkscreen_express',
    name: 'Express Silkscreen Route',
    description: 'Optimized for faster turnaround',
    printingMethod: 'silkscreen',
    efficiency: 85,
    estimatedDays: 5,
    isRecommended: true,
    steps: [
      {
        id: 'design_prep_express',
        name: 'Express Design Prep',
        department: 'Pre-Production',
        estimatedHours: 1.5,
        dependencies: [],
        resources: ['Design Software', 'Senior Designer']
      },
      {
        id: 'parallel_screen_ink',
        name: 'Parallel Screen & Ink Prep',
        department: 'Pre-Production',
        estimatedHours: 3,
        dependencies: ['design_prep_express'],
        resources: ['Screen Room', 'Ink Station', 'Multi-tasker']
      },
      {
        id: 'express_printing',
        name: 'Express Printing',
        department: 'Production',
        estimatedHours: 6,
        dependencies: ['parallel_screen_ink'],
        resources: ['Express Print Station', 'Lead Printer']
      },
      {
        id: 'flash_cure',
        name: 'Flash Curing',
        department: 'Production',
        estimatedHours: 1,
        dependencies: ['express_printing'],
        resources: ['Flash Dryer', 'Machine Operator']
      },
      {
        id: 'inline_qc_pack',
        name: 'Inline QC & Pack',
        department: 'Quality Control',
        estimatedHours: 3,
        dependencies: ['flash_cure'],
        resources: ['QC Station', 'Pack Station', 'QC Inspector']
      }
    ]
  },
  {
    id: 'dtf_standard',
    name: 'Standard DTF Route',
    description: 'Direct to Film production flow',
    printingMethod: 'dtf',
    efficiency: 90,
    estimatedDays: 4,
    steps: [
      {
        id: 'design_rip',
        name: 'Design RIP Processing',
        department: 'Pre-Production',
        estimatedHours: 1,
        dependencies: [],
        resources: ['RIP Software', 'Designer']
      },
      {
        id: 'film_printing',
        name: 'Film Printing',
        department: 'Production',
        estimatedHours: 2,
        dependencies: ['design_rip'],
        resources: ['DTF Printer', 'Printer Operator']
      },
      {
        id: 'powder_application',
        name: 'Powder Application',
        department: 'Production',
        estimatedHours: 1,
        dependencies: ['film_printing'],
        resources: ['Powder Station', 'Operator']
      },
      {
        id: 'curing_film',
        name: 'Film Curing',
        department: 'Production',
        estimatedHours: 0.5,
        dependencies: ['powder_application'],
        resources: ['Curing Oven', 'Machine Operator']
      },
      {
        id: 'heat_pressing',
        name: 'Heat Pressing',
        department: 'Production',
        estimatedHours: 4,
        dependencies: ['curing_film'],
        resources: ['Heat Press', 'Press Operator']
      },
      {
        id: 'finishing_dtf',
        name: 'Finishing & QC',
        department: 'Quality Control',
        estimatedHours: 2,
        dependencies: ['heat_pressing'],
        resources: ['QC Station', 'QC Inspector']
      }
    ]
  }
]

export function ProductionRouteSection({
  printingMethod,
  totalQuantity,
  deliveryDate,
  selectedRoute,
  onRouteChange,
  onRouteOptimized
}: ProductionRouteSectionProps) {
  const [optimizing, setOptimizing] = useState(false)
  const [ashleyOptimization, setAshleyOptimization] = useState<AshleyOptimization | null>(null)
  const [routeVisualization, setRouteVisualization] = useState<boolean>(false)

  useEffect(() => {
    if (printingMethod && totalQuantity > 0) {
      // Auto-select recommended route when printing method changes
      const recommendedRoute = getAvailableRoutes().find(r => r.isRecommended)
      if (recommendedRoute && !selectedRoute) {
        onRouteChange(recommendedRoute.id)
      }
    }
  }, [printingMethod])

  const getAvailableRoutes = (): ProductionRoute[] => {
    return PRODUCTION_ROUTES.filter(route => 
      route.printingMethod === printingMethod || route.printingMethod === 'any'
    )
  }

  const getCurrentRoute = (): ProductionRoute | null => {
    return PRODUCTION_ROUTES.find(route => route.id === selectedRoute) || null
  }

  const optimizeWithAshley = async () => {
    if (!printingMethod || totalQuantity === 0) {
      toast.error('Please select printing method and quantity first')
      return
    }

    setOptimizing(true)
    try {
      // Simulate Ashley AI route optimization
      await new Promise(resolve => setTimeout(resolve, 4000))

      const availableRoutes = getAvailableRoutes()
      const currentRoute = getCurrentRoute()
      
      const optimization: AshleyOptimization = {
        recommendedRoute: availableRoutes.find(r => r.isRecommended)?.id || availableRoutes[0]?.id || '',
        efficiencyGain: Math.floor(Math.random() * 15) + 5, // 5-20%
        timeSaving: Math.floor(Math.random() * 2) + 1, // 1-3 days
        costSaving: Math.floor(Math.random() * 8000) + 2000, // ₱2000-10000
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
        reasoning: [
          'Current route has optimal efficiency for quantity and timeline',
          'Parallel processing can reduce lead time by 1-2 days',
          'Express route recommended for rush delivery requirements',
          'Resource allocation optimized for peak efficiency'
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        warnings: Math.random() > 0.7 ? [
          'Express route requires premium resource allocation',
          'Quality checks may need additional attention in fast route'
        ] : []
      }

      setAshleyOptimization(optimization)
      onRouteOptimized(optimization)
      
      toast.success('Ashley AI route optimization completed')

    } catch (error) {
      console.error('Route optimization error:', error)
      toast.error('Ashley AI optimization failed')
    } finally {
      setOptimizing(false)
    }
  }

  const applyOptimizedRoute = () => {
    if (ashleyOptimization?.recommendedRoute) {
      onRouteChange(ashleyOptimization.recommendedRoute)
      toast.success('Applied optimized production route')
    }
  }

  const calculateTotalEstimatedHours = (route: ProductionRoute): number => {
    return route.steps.reduce((total, step) => total + step.estimatedHours, 0)
  }

  const getRouteEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 85) return 'text-green-600'
    if (efficiency >= 75) return 'text-blue-600'
    return 'text-amber-600'
  }

  const availableRoutes = getAvailableRoutes()
  const currentRoute = getCurrentRoute()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          G. Production Route
          <Badge variant="secondary">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Route Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <label className="text-sm font-medium">Select Production Route *</label>
              <p className="text-sm text-muted-foreground">
                Choose the optimal production flow for your order
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRouteVisualization(!routeVisualization)}
            >
              {routeVisualization ? 'Hide' : 'Show'} Steps
            </Button>
          </div>

          <div className="grid gap-3">
            {availableRoutes.map((route) => (
              <div
                key={route.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRoute === route.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onRouteChange(route.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{route.name}</h4>
                      {route.isRecommended && (
                        <Badge variant="default" className="bg-green-600">
                          Recommended
                        </Badge>
                      )}
                      {route.isCustom && (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {route.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${getRouteEfficiencyColor(route.efficiency)}`}>
                      {route.efficiency}% efficiency
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ~{route.estimatedDays} days
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {calculateTotalEstimatedHours(route)}h total
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {route.steps.length} steps
                  </div>
                  <div className="flex items-center gap-1">
                    <Route className="w-4 h-4" />
                    {[...new Set(route.steps.map(s => s.department))].length} departments
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ashley AI Route Optimization */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Ashley AI Route Optimization</h4>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={optimizeWithAshley}
              disabled={optimizing || !printingMethod || totalQuantity === 0}
            >
              {optimizing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Optimizing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Optimize Route
                </>
              )}
            </Button>
          </div>

          {ashleyOptimization && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-800 font-medium">Optimization Results</span>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  {ashleyOptimization.confidence}% confidence
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-100 rounded p-2">
                  <div className="text-green-700 font-medium">Efficiency Gain</div>
                  <div className="text-green-800">+{ashleyOptimization.efficiencyGain}%</div>
                </div>
                <div className="bg-blue-100 rounded p-2">
                  <div className="text-blue-700 font-medium">Time Saving</div>
                  <div className="text-blue-800">{ashleyOptimization.timeSaving} days</div>
                </div>
                <div className="bg-amber-100 rounded p-2">
                  <div className="text-amber-700 font-medium">Cost Saving</div>
                  <div className="text-amber-800">₱{ashleyOptimization.costSaving.toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-purple-900">Reasoning:</h5>
                <ul className="space-y-1">
                  {ashleyOptimization.reasoning.map((reason, i) => (
                    <li key={i} className="text-sm text-purple-800 flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {ashleyOptimization.warnings.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-amber-900">Considerations:</h5>
                  <ul className="space-y-1">
                    {ashleyOptimization.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={applyOptimizedRoute}
                size="sm"
                className="w-full"
                disabled={selectedRoute === ashleyOptimization.recommendedRoute}
              >
                <Zap className="w-4 h-4 mr-2" />
                Apply Optimized Route
              </Button>
            </div>
          )}
        </div>

        {/* Route Steps Visualization */}
        {routeVisualization && currentRoute && (
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Route className="w-4 h-4" />
              Production Steps - {currentRoute.name}
            </h4>
            
            <div className="space-y-3">
              {currentRoute.steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {index < currentRoute.steps.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">{step.name}</h5>
                          <p className="text-sm text-muted-foreground">{step.department}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{step.estimatedHours}h</div>
                          <div className="text-xs text-muted-foreground">estimated</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {step.resources.map((resource, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                      
                      {step.dependencies.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Depends on: {step.dependencies.map(dep => 
                            currentRoute.steps.find(s => s.id === dep)?.name
                          ).filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Total Production Time:</span>
                <span className="font-medium">{calculateTotalEstimatedHours(currentRoute)} hours</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span>Estimated Duration:</span>
                <span className="font-medium">{currentRoute.estimatedDays} working days</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span>Route Efficiency:</span>
                <span className={`font-medium ${getRouteEfficiencyColor(currentRoute.efficiency)}`}>
                  {currentRoute.efficiency}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}