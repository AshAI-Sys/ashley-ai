'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SizeCurve {
  [key: string]: number
}

interface SizeTemplate {
  name: string
  description: string
  percentages: SizeCurve
}

interface QuantitiesSizeSectionProps {
  totalQuantity: number
  sizeCurve: SizeCurve
  onTotalQuantityChange: (quantity: number) => void
  onSizeCurveChange: (curve: SizeCurve) => void
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

const SIZE_TEMPLATES: SizeTemplate[] = [
  {
    name: 'Standard Adult',
    description: 'Typical adult distribution',
    percentages: { XS: 5, S: 15, M: 30, L: 30, XL: 15, XXL: 5, XXXL: 0 }
  },
  {
    name: 'Corporate Events',
    description: 'Business/corporate events',
    percentages: { XS: 8, S: 20, M: 35, L: 25, XL: 10, XXL: 2, XXXL: 0 }
  },
  {
    name: 'Sports Teams',
    description: 'Athletic/sports teams',
    percentages: { XS: 10, S: 20, M: 25, L: 25, XL: 15, XXL: 5, XXXL: 0 }
  },
  {
    name: 'Youth/School',
    description: 'Schools and youth programs',
    percentages: { XS: 15, S: 25, M: 30, L: 20, XL: 8, XXL: 2, XXXL: 0 }
  },
  {
    name: 'Retail/General',
    description: 'General retail distribution',
    percentages: { XS: 12, S: 18, M: 28, L: 25, XL: 12, XXL: 4, XXXL: 1 }
  },
  {
    name: 'Plus Size Focus',
    description: 'Extended sizes emphasis',
    percentages: { XS: 3, S: 10, M: 20, L: 25, XL: 22, XXL: 15, XXXL: 5 }
  }
]

export function QuantitiesSizeSection({
  totalQuantity,
  sizeCurve,
  onTotalQuantityChange,
  onSizeCurveChange
}: QuantitiesSizeSectionProps) {
  const [calculatedTotal, setCalculatedTotal] = useState(0)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [activeTemplate, setActiveTemplate] = useState<string>('')

  useEffect(() => {
    const total = Object.values(sizeCurve).reduce((sum, qty) => sum + qty, 0)
    setCalculatedTotal(total)
    
    const errors: string[] = []
    
    if (totalQuantity > 0 && total !== totalQuantity) {
      errors.push(`Size breakdown (${total}) doesn't match total quantity (${totalQuantity})`)
    }
    
    if (total === 0) {
      errors.push('Please set quantities for at least one size')
    }
    
    const negativeValues = Object.entries(sizeCurve).filter(([_, qty]) => qty < 0)
    if (negativeValues.length > 0) {
      errors.push('Quantities cannot be negative')
    }
    
    setValidationErrors(errors)
  }, [sizeCurve, totalQuantity])

  const applySizeTemplate = (template: SizeTemplate) => {
    if (totalQuantity === 0) {
      toast.error('Please set total quantity first')
      return
    }
    
    const newSizeCurve: SizeCurve = {}
    let remainingQty = totalQuantity
    
    // Calculate quantities based on percentages
    DEFAULT_SIZES.forEach((size, index) => {
      const percentage = template.percentages[size] || 0
      if (index === DEFAULT_SIZES.length - 1) {
        // Last size gets remaining quantity to ensure exact total
        newSizeCurve[size] = remainingQty
      } else {
        const qty = Math.round((totalQuantity * percentage) / 100)
        newSizeCurve[size] = qty
        remainingQty -= qty
      }
    })
    
    onSizeCurveChange(newSizeCurve)
    setActiveTemplate(template.name)
    toast.success(`Applied ${template.name} size template`)
  }

  const updateSizeQuantity = (size: string, quantity: number) => {
    const newSizeCurve = { ...sizeCurve, [size]: Math.max(0, quantity) }
    onSizeCurveChange(newSizeCurve)
    setActiveTemplate('') // Clear template when manually editing
  }

  const autoCalculateFromTotal = () => {
    if (totalQuantity === 0) {
      toast.error('Please set total quantity first')
      return
    }
    
    // Apply standard adult template by default
    const standardTemplate = SIZE_TEMPLATES[0]
    applySizeTemplate(standardTemplate)
  }

  const resetSizeCurve = () => {
    const emptyCurve: SizeCurve = {}
    DEFAULT_SIZES.forEach(size => {
      emptyCurve[size] = 0
    })
    onSizeCurveChange(emptyCurve)
    setActiveTemplate('')
  }

  const getSizePercentage = (size: string): number => {
    if (calculatedTotal === 0) return 0
    return Math.round((sizeCurve[size] / calculatedTotal) * 100)
  }

  const isValidQuantityBreakdown = validationErrors.length === 0 && calculatedTotal > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          C. Quantities & Size Curve
          <Badge variant="secondary">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Quantity Input */}
        <div>
          <Label htmlFor="total-quantity">Total Quantity *</Label>
          <div className="flex gap-2">
            <Input
              id="total-quantity"
              type="number"
              min="1"
              value={totalQuantity || ''}
              onChange={(e) => onTotalQuantityChange(parseInt(e.target.value) || 0)}
              placeholder="Enter total quantity"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={autoCalculateFromTotal}
              disabled={totalQuantity === 0}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Auto Calculate
            </Button>
          </div>
        </div>

        {/* Size Templates */}
        <div>
          <Label>Size Distribution Templates</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            {SIZE_TEMPLATES.map((template) => (
              <button
                key={template.name}
                onClick={() => applySizeTemplate(template)}
                disabled={totalQuantity === 0}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  activeTemplate === template.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${totalQuantity === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  M: {template.percentages.M}% • L: {template.percentages.L}% • XL: {template.percentages.XL}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Size Breakdown Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label>Size Breakdown</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSizeCurve}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {DEFAULT_SIZES.map((size) => (
              <div key={size} className="space-y-2">
                <Label className="text-sm font-medium">{size}</Label>
                <Input
                  type="number"
                  min="0"
                  value={sizeCurve[size] || 0}
                  onChange={(e) => updateSizeQuantity(size, parseInt(e.target.value) || 0)}
                  className="text-center"
                />
                <div className="text-xs text-center text-muted-foreground">
                  {getSizePercentage(size)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary and Validation */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Quantity Summary</h4>
            {isValidQuantityBreakdown ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Issues</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Target Total:</span>
              <div className="font-medium">{totalQuantity.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Size Breakdown Total:</span>
              <div className={`font-medium ${
                calculatedTotal === totalQuantity ? 'text-green-600' : 'text-red-600'
              }`}>
                {calculatedTotal.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Difference:</span>
              <div className={`font-medium ${
                calculatedTotal === totalQuantity ? 'text-green-600' : 'text-red-600'
              }`}>
                {(calculatedTotal - totalQuantity).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Sizes Used:</span>
              <div className="font-medium">
                {Object.values(sizeCurve).filter(qty => qty > 0).length}/{DEFAULT_SIZES.length}
              </div>
            </div>
          </div>
          
          {validationErrors.length > 0 && (
            <div className="mt-3 space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visual Size Distribution */}
        {calculatedTotal > 0 && (
          <div>
            <Label className="mb-3 block">Size Distribution Visualization</Label>
            <div className="space-y-2">
              {DEFAULT_SIZES.filter(size => sizeCurve[size] > 0).map((size) => {
                const percentage = getSizePercentage(size)
                return (
                  <div key={size} className="flex items-center gap-3">
                    <div className="w-8 text-sm font-medium">{size}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      >
                        {percentage >= 10 && (
                          <span className="text-white text-xs font-medium">
                            {sizeCurve[size]}
                          </span>
                        )}
                      </div>
                      {percentage < 10 && sizeCurve[size] > 0 && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-700">
                          {sizeCurve[size]}
                        </span>
                      )}
                    </div>
                    <div className="w-12 text-sm text-muted-foreground text-right">
                      {percentage}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}