'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, AlertTriangle, CheckCircle, Sparkles, Zap } from 'lucide-react'
import { format, addDays, isWeekend, differenceInDays, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'

interface SLAInfo {
  standardDays: number
  expressAvailable: boolean
  expressDays: number
  rushSurcharge: number
}

interface TimelineValidation {
  feasible: boolean
  isRush: boolean
  workingDays: number
  requiredDays: number
  suggestions: string[]
  warnings: string[]
  ashleyConfidence: number
}

interface DatesSLAsSectionProps {
  deliveryDate: string
  printingMethod: string
  totalQuantity: number
  onDeliveryDateChange: (date: string) => void
  onTimelineValidation: (validation: TimelineValidation) => void
  onRushSurcharge: (amount: number) => void
}

const SLA_MATRIX: { [key: string]: SLAInfo } = {
  'silkscreen': {
    standardDays: 7,
    expressAvailable: true,
    expressDays: 5,
    rushSurcharge: 25
  },
  'sublimation': {
    standardDays: 5,
    expressAvailable: true,
    expressDays: 3,
    rushSurcharge: 30
  },
  'dtf': {
    standardDays: 4,
    expressAvailable: true,
    expressDays: 2,
    rushSurcharge: 35
  },
  'embroidery': {
    standardDays: 10,
    expressAvailable: true,
    expressDays: 7,
    rushSurcharge: 20
  }
}

const QUANTITY_MULTIPLIERS = [
  { min: 1, max: 50, multiplier: 1.0 },
  { min: 51, max: 100, multiplier: 1.2 },
  { min: 101, max: 250, multiplier: 1.5 },
  { min: 251, max: 500, multiplier: 2.0 },
  { min: 501, max: 1000, multiplier: 2.5 },
  { min: 1001, max: 9999999, multiplier: 3.0 }
]

const HOLIDAYS_2024 = [
  '2024-01-01', // New Year
  '2024-02-12', // Chinese New Year
  '2024-04-09', // Araw ng Kagitingan
  '2024-05-01', // Labor Day
  '2024-06-12', // Independence Day
  '2024-08-26', // National Heroes Day
  '2024-11-01', // All Saints Day
  '2024-11-30', // Bonifacio Day
  '2024-12-25', // Christmas
  '2024-12-30'  // Rizal Day
]

export function DatesSLAsSection({
  deliveryDate,
  printingMethod,
  totalQuantity,
  onDeliveryDateChange,
  onTimelineValidation,
  onRushSurcharge
}: DatesSLAsSectionProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [validating, setValidating] = useState(false)
  const [timelineValidation, setTimelineValidation] = useState<TimelineValidation | null>(null)
  const [suggestedDates, setSuggestedDates] = useState<Date[]>([])

  useEffect(() => {
    if (deliveryDate && printingMethod && totalQuantity > 0) {
      validateTimeline()
    } else {
      setTimelineValidation(null)
      onRushSurcharge(0)
    }
  }, [deliveryDate, printingMethod, totalQuantity])

  const getSLAInfo = (): SLAInfo | null => {
    return SLA_MATRIX[printingMethod] || null
  }

  const getQuantityMultiplier = (): number => {
    const multiplier = QUANTITY_MULTIPLIERS.find(
      m => totalQuantity >= m.min && totalQuantity <= m.max
    )
    return multiplier?.multiplier || 1.0
  }

  const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
    let workingDays = 0
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
        workingDays++
      }
      currentDate = addDays(currentDate, 1)
    }

    return workingDays
  }

  const isHoliday = (date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd')
    return HOLIDAYS_2024.includes(dateString)
  }

  const addWorkingDays = (startDate: Date, days: number): Date => {
    let currentDate = new Date(startDate)
    let addedDays = 0

    while (addedDays < days) {
      currentDate = addDays(currentDate, 1)
      if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
        addedDays++
      }
    }

    return currentDate
  }

  const validateTimeline = async () => {
    if (!deliveryDate || !printingMethod) return

    setValidating(true)

    try {
      const slaInfo = getSLAInfo()
      if (!slaInfo) return

      const today = new Date()
      const targetDate = parseISO(deliveryDate)
      const quantityMultiplier = getQuantityMultiplier()
      
      const requiredDays = Math.ceil(slaInfo.standardDays * quantityMultiplier)
      const workingDays = calculateWorkingDays(today, targetDate)
      
      const isRush = workingDays < requiredDays
      const feasible = workingDays >= Math.ceil(slaInfo.expressDays * quantityMultiplier)
      
      // Simulate Ashley AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const suggestions: string[] = []
      const warnings: string[] = []
      
      if (isRush && feasible) {
        suggestions.push(`Rush order detected. Consider express production (${slaInfo.expressDays} days base)`)
        suggestions.push(`Additional ${slaInfo.rushSurcharge}% surcharge will apply`)
      }
      
      if (!feasible) {
        const earliestDate = addWorkingDays(today, Math.ceil(slaInfo.expressDays * quantityMultiplier))
        suggestions.push(`Earliest possible delivery: ${format(earliestDate, 'MMM dd, yyyy')}`)
        warnings.push('Timeline not feasible even with express production')
      }
      
      if (workingDays > requiredDays * 1.5) {
        suggestions.push('Extended timeline allows for cost optimization opportunities')
      }
      
      if (quantityMultiplier > 1) {
        suggestions.push(`Large quantity (${totalQuantity}) extends base timeline by ${Math.round((quantityMultiplier - 1) * 100)}%`)
      }
      
      const validation: TimelineValidation = {
        feasible,
        isRush,
        workingDays,
        requiredDays,
        suggestions,
        warnings,
        ashleyConfidence: Math.floor(Math.random() * 20) + 80 // 80-100%
      }
      
      setTimelineValidation(validation)
      onTimelineValidation(validation)
      
      // Calculate rush surcharge
      if (isRush && feasible) {
        onRushSurcharge(slaInfo.rushSurcharge)
      } else {
        onRushSurcharge(0)
      }
      
      // Generate suggested dates
      generateSuggestedDates(slaInfo)
      
    } catch (error) {
      console.error('Timeline validation error:', error)
      toast.error('Ashley AI timeline validation failed')
    } finally {
      setValidating(false)
    }
  }

  const generateSuggestedDates = (slaInfo: SLAInfo) => {
    const today = new Date()
    const quantityMultiplier = getQuantityMultiplier()
    
    const suggested: Date[] = []
    
    // Express delivery
    const expressDate = addWorkingDays(today, Math.ceil(slaInfo.expressDays * quantityMultiplier))
    suggested.push(expressDate)
    
    // Standard delivery
    const standardDate = addWorkingDays(today, Math.ceil(slaInfo.standardDays * quantityMultiplier))
    suggested.push(standardDate)
    
    // Safe delivery (standard + 2 days buffer)
    const safeDate = addWorkingDays(today, Math.ceil(slaInfo.standardDays * quantityMultiplier) + 2)
    suggested.push(safeDate)
    
    setSuggestedDates(suggested)
  }

  const selectSuggestedDate = (date: Date) => {
    onDeliveryDateChange(format(date, 'yyyy-MM-dd'))
    setCalendarOpen(false)
    toast.success('Delivery date updated')
  }

  const slaInfo = getSLAInfo()
  const selectedDate = deliveryDate ? parseISO(deliveryDate) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          E. Dates & SLAs
          <Badge variant="secondary">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Date Picker */}
        <div>
          <Label>Target Delivery Date *</Label>
          <div className="flex gap-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  suppressHydrationWarning
                >
                  <CalendarIcon className="mr-2 h-4 w-4" suppressHydrationWarning />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Select delivery date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={(date) => {
                    if (date) {
                      onDeliveryDateChange(format(date, 'yyyy-MM-dd'))
                      setCalendarOpen(false)
                    }
                  }}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* SLA Information */}
        {slaInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">
                {printingMethod.charAt(0).toUpperCase() + printingMethod.slice(1)} SLA
              </h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Standard Production:</span>
                <div className="text-blue-800">
                  {Math.ceil(slaInfo.standardDays * getQuantityMultiplier())} working days
                  {getQuantityMultiplier() > 1 && (
                    <span className="text-blue-600 ml-1">
                      (base: {slaInfo.standardDays} days × {getQuantityMultiplier().toFixed(1)} qty factor)
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <span className="text-blue-700 font-medium">Express Available:</span>
                <div className="text-blue-800">
                  {slaInfo.expressAvailable ? (
                    <>
                      {Math.ceil(slaInfo.expressDays * getQuantityMultiplier())} working days 
                      <span className="text-amber-600 ml-1">(+{slaInfo.rushSurcharge}% surcharge)</span>
                    </>
                  ) : (
                    'Not available'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ashley AI Timeline Validation */}
        {validating && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="text-purple-900 font-medium">Ashley AI is analyzing timeline...</span>
            </div>
          </div>
        )}

        {timelineValidation && (
          <div className={`border rounded-lg p-4 ${
            timelineValidation.feasible 
              ? timelineValidation.isRush 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {timelineValidation.feasible ? (
                timelineValidation.isRush ? (
                  <Zap className="w-5 h-5 text-amber-600 mt-1" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                )
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
              )}
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-medium ${
                    timelineValidation.feasible 
                      ? timelineValidation.isRush ? 'text-amber-900' : 'text-green-900'
                      : 'text-red-900'
                  }`}>
                    Ashley AI Timeline Analysis
                    {timelineValidation.isRush && timelineValidation.feasible && (
                      <Badge variant="outline" className="ml-2 text-amber-700 border-amber-300">
                        Rush Order
                      </Badge>
                    )}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {timelineValidation.ashleyConfidence}% confidence
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Available Days:</span>
                    <span className="ml-2">{timelineValidation.workingDays} working days</span>
                  </div>
                  <div>
                    <span className="font-medium">Required Days:</span>
                    <span className="ml-2">{timelineValidation.requiredDays} working days</span>
                  </div>
                </div>
                
                {timelineValidation.suggestions.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-2">Suggestions:</h5>
                    <ul className="space-y-1">
                      {timelineValidation.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm flex items-start gap-1">
                          <span className="text-blue-500 mt-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {timelineValidation.warnings.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-red-700">Warnings:</h5>
                    <ul className="space-y-1">
                      {timelineValidation.warnings.map((warning, i) => (
                        <li key={i} className="text-sm flex items-start gap-1 text-red-600">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Dates */}
        {suggestedDates.length > 0 && (
          <div>
            <Label className="mb-3 block">Suggested Delivery Dates</Label>
            <div className="grid md:grid-cols-3 gap-3">
              {suggestedDates.map((date, index) => {
                const types = ['Express', 'Standard', 'Safe']
                const colors = ['amber', 'blue', 'green']
                const today = new Date()
                const workingDays = calculateWorkingDays(today, date)
                
                return (
                  <button
                    key={index}
                    onClick={() => selectSuggestedDate(date)}
                    className={`p-3 border-2 rounded-lg text-left transition-colors ${
                      selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        ? `border-${colors[index]}-500 bg-${colors[index]}-50`
                        : `border-${colors[index]}-200 hover:border-${colors[index]}-300`
                    }`}
                  >
                    <div className={`font-medium text-${colors[index]}-900`}>
                      {types[index]} Delivery
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {format(date, 'MMM dd, yyyy')}
                    </div>
                    <div className={`text-xs text-${colors[index]}-600 mt-1`}>
                      {workingDays} working days
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}