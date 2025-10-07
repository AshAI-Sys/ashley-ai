'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Calculator, TrendingDown, Sparkles, DollarSign, Percent, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PricingBreak {
  minQuantity: number
  maxQuantity: number
  basePrice: number
  discount: number
}

interface CommercialsData {
  unitPrice: number
  subtotal: number
  addOnsCost: number
  colorVariantsCost: number
  rushSurcharge: number
  quantityDiscount: number
  depositPercentage: number
  paymentTerms: string
  taxInclusive: boolean
  currency: string
  finalTotal: number
  depositAmount: number
  balanceAmount: number
}

interface CommercialsProps {
  totalQuantity: number
  printingMethod: string
  garmentType: string
  addOnsCost: number
  colorVariantsCost: number
  rushSurchargePercent: number
  commercials: CommercialsData
  onCommercialsChange: (data: CommercialsData) => void
}

const PRICING_MATRIX: { [key: string]: { [key: string]: PricingBreak[] } } = {
  'silkscreen': {
    't-shirt': [
      { minQuantity: 1, maxQuantity: 50, basePrice: 180, discount: 0 },
      { minQuantity: 51, maxQuantity: 100, basePrice: 160, discount: 5 },
      { minQuantity: 101, maxQuantity: 250, basePrice: 140, discount: 10 },
      { minQuantity: 251, maxQuantity: 500, basePrice: 120, discount: 15 },
      { minQuantity: 501, maxQuantity: 1000, basePrice: 100, discount: 20 },
      { minQuantity: 1001, maxQuantity: 999999, basePrice: 85, discount: 25 }
    ],
    'hoodie': [
      { minQuantity: 1, maxQuantity: 50, basePrice: 420, discount: 0 },
      { minQuantity: 51, maxQuantity: 100, basePrice: 380, discount: 5 },
      { minQuantity: 101, maxQuantity: 250, basePrice: 340, discount: 10 },
      { minQuantity: 251, maxQuantity: 500, basePrice: 300, discount: 15 },
      { minQuantity: 501, maxQuantity: 1000, basePrice: 260, discount: 20 },
      { minQuantity: 1001, maxQuantity: 999999, basePrice: 220, discount: 25 }
    ]
  },
  'sublimation': {
    't-shirt': [
      { minQuantity: 1, maxQuantity: 25, basePrice: 220, discount: 0 },
      { minQuantity: 26, maxQuantity: 50, basePrice: 200, discount: 5 },
      { minQuantity: 51, maxQuantity: 100, basePrice: 180, discount: 10 },
      { minQuantity: 101, maxQuantity: 250, basePrice: 160, discount: 15 },
      { minQuantity: 251, maxQuantity: 500, basePrice: 140, discount: 20 },
      { minQuantity: 501, maxQuantity: 999999, basePrice: 120, discount: 25 }
    ]
  },
  'dtf': {
    't-shirt': [
      { minQuantity: 1, maxQuantity: 12, basePrice: 250, discount: 0 },
      { minQuantity: 13, maxQuantity: 25, basePrice: 230, discount: 5 },
      { minQuantity: 26, maxQuantity: 50, basePrice: 210, discount: 10 },
      { minQuantity: 51, maxQuantity: 100, basePrice: 190, discount: 15 },
      { minQuantity: 101, maxQuantity: 250, basePrice: 170, discount: 20 },
      { minQuantity: 251, maxQuantity: 999999, basePrice: 150, discount: 25 }
    ]
  },
  'embroidery': {
    't-shirt': [
      { minQuantity: 1, maxQuantity: 25, basePrice: 280, discount: 0 },
      { minQuantity: 26, maxQuantity: 50, basePrice: 260, discount: 5 },
      { minQuantity: 51, maxQuantity: 100, basePrice: 240, discount: 10 },
      { minQuantity: 101, maxQuantity: 250, basePrice: 220, discount: 15 },
      { minQuantity: 251, maxQuantity: 500, basePrice: 200, discount: 20 },
      { minQuantity: 501, maxQuantity: 999999, basePrice: 180, discount: 25 }
    ]
  }
}

const PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15 Days', description: 'Payment due within 15 days' },
  { value: 'net_30', label: 'Net 30 Days', description: 'Payment due within 30 days' },
  { value: 'cod', label: 'Cash on Delivery', description: 'Payment upon delivery' },
  { value: '50_50', label: '50/50 Split', description: '50% deposit, 50% on delivery' },
  { value: 'prepaid', label: 'Full Prepayment', description: '100% payment upfront' }
]

export function CommercialsSection({
  totalQuantity,
  printingMethod,
  garmentType,
  addOnsCost,
  colorVariantsCost,
  rushSurchargePercent,
  commercials,
  onCommercialsChange
}: CommercialsProps) {
  const [optimizingPrice, setOptimizingPrice] = useState(false)
  const [priceRecommendation, setPriceRecommendation] = useState<string | null>(null)

  useEffect(() => {
    calculatePricing()
  }, [totalQuantity, printingMethod, garmentType, addOnsCost, colorVariantsCost, rushSurchargePercent, commercials.unitPrice, commercials.depositPercentage, commercials.taxInclusive])

  const getPricingBreak = (): PricingBreak | null => {
    const methodPricing = PRICING_MATRIX[printingMethod]
    if (!methodPricing) return null

    const garmentPricing = methodPricing[garmentType] || methodPricing['t-shirt']
    if (!garmentPricing) return null

    return garmentPricing.find(
      break_ => totalQuantity >= break_.minQuantity && totalQuantity <= break_.maxQuantity
    ) || null
  }

  const calculatePricing = () => {
    const pricingBreak = getPricingBreak()
    const unitPrice = commercials.unitPrice || (pricingBreak?.basePrice || 200)

    const subtotal = unitPrice * totalQuantity
    const rushSurchargeAmount = (subtotal * rushSurchargePercent) / 100
    const totalBeforeDiscount = subtotal + addOnsCost + colorVariantsCost + rushSurchargeAmount

    const quantityDiscount = pricingBreak?.discount || 0
    const discountAmount = (subtotal * quantityDiscount) / 100

    const finalTotal = totalBeforeDiscount - discountAmount
    const depositAmount = (finalTotal * commercials.depositPercentage) / 100
    const balanceAmount = finalTotal - depositAmount

    const updatedCommercials: CommercialsData = {
      ...commercials,
      unitPrice,
      subtotal,
      addOnsCost,
      colorVariantsCost,
      rushSurcharge: rushSurchargeAmount,
      quantityDiscount: discountAmount,
      finalTotal: commercials.taxInclusive ? finalTotal : finalTotal * 1.12, // Add 12% VAT if not inclusive
      depositAmount: commercials.taxInclusive ? depositAmount : depositAmount * 1.12,
      balanceAmount: commercials.taxInclusive ? balanceAmount : balanceAmount * 1.12
    }

    onCommercialsChange(updatedCommercials)
  }

  const optimizeWithAshley = async () => {
    setOptimizingPrice(true)
    try {
      // Simulate Ashley AI price optimization
      await new Promise(resolve => setTimeout(resolve, 3000))

      const pricingBreak = getPricingBreak()
      if (!pricingBreak) return

      const suggestions = []
      
      // Volume discount opportunities
      const nextBreak = PRICING_MATRIX[printingMethod][garmentType]?.find(
        break_ => break_.minQuantity > totalQuantity
      )
      
      if (nextBreak) {
        const additionalQty = nextBreak.minQuantity - totalQuantity
        const savings = (commercials.unitPrice - nextBreak.basePrice) * nextBreak.minQuantity
        suggestions.push(
          `Add ${additionalQty} pieces to reach next price break (₱${nextBreak.basePrice}/pc) for total savings of ₱${savings.toLocaleString()}`
        )
      }

      // Competitive pricing analysis
      const currentMargin = ((commercials.unitPrice - 80) / commercials.unitPrice) * 100 // Assuming ₱80 base cost
      if (currentMargin > 60) {
        suggestions.push('Price is competitive with good margin. Consider slight reduction for bulk orders.')
      } else if (currentMargin < 30) {
        suggestions.push('Margin is tight. Consider increasing price or optimizing production costs.')
      }

      // Market timing
      suggestions.push('Current market conditions favor standard pricing. No seasonal adjustments needed.')

      setPriceRecommendation(suggestions.join(' | '))
      toast.success('Ashley AI pricing optimization completed')

    } catch (error) {
      console.error('Price optimization error:', error)
      toast.error('Ashley AI optimization failed')
    } finally {
      setOptimizingPrice(false)
    }
  }

  const applySuggestedPrice = () => {
    const pricingBreak = getPricingBreak()
    if (pricingBreak) {
      onCommercialsChange({
        ...commercials,
        unitPrice: pricingBreak.basePrice
      })
      toast.success('Applied suggested pricing')
    }
  }

  const pricingBreak = getPricingBreak()
  const nextBreak = PRICING_MATRIX[printingMethod]?.[garmentType]?.find(
    break_ => break_.minQuantity > totalQuantity
  )

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm">F</span>
          <span className="font-bold">Commercials</span>
          <Badge variant="destructive" className="ml-auto">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Pricing Break Information */}
        {pricingBreak && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">
                  Volume Pricing Applied
                </h4>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300">
                {pricingBreak.discount}% discount
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700 font-medium">Current Break:</span>
                <div className="text-green-800">
                  {pricingBreak.minQuantity} - {pricingBreak.maxQuantity} pieces
                </div>
              </div>
              <div>
                <span className="text-green-700 font-medium">Base Price:</span>
                <div className="text-green-800">₱{pricingBreak.basePrice}/piece</div>
              </div>
            </div>

            {nextBreak && (
              <div className="mt-3 p-3 bg-blue-50 rounded border">
                <p className="text-sm text-blue-800">
                  <strong>Next break:</strong> Order {nextBreak.minQuantity} pieces for ₱{nextBreak.basePrice}/piece 
                  ({nextBreak.discount}% discount)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pricing Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Unit Price (₱) *</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={commercials.unitPrice || ''}
                onChange={(e) => onCommercialsChange({
                  ...commercials,
                  unitPrice: parseFloat(e.target.value) || 0
                })}
                placeholder="0.00"
              />
              {pricingBreak && (
                <Button
                  variant="outline"
                  onClick={applySuggestedPrice}
                  disabled={commercials.unitPrice === pricingBreak.basePrice}
                >
                  Use Suggested
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Deposit Percentage (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={commercials.depositPercentage || ''}
              onChange={(e) => onCommercialsChange({
                ...commercials,
                depositPercentage: parseInt(e.target.value) || 50
              })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Payment Terms</Label>
            <Select 
              value={commercials.paymentTerms} 
              onValueChange={(value) => onCommercialsChange({
                ...commercials,
                paymentTerms: value
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS.map(term => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label} - {term.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Currency</Label>
            <Select 
              value={commercials.currency} 
              onValueChange={(value) => onCommercialsChange({
                ...commercials,
                currency: value
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHP">Philippine Peso (₱)</SelectItem>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={commercials.taxInclusive}
              onCheckedChange={(checked) => onCommercialsChange({
                ...commercials,
                taxInclusive: checked
              })}
            />
            <Label className="text-sm font-semibold text-gray-700">Tax Inclusive (12% VAT)</Label>
          </div>
        </div>

        {/* Ashley AI Price Optimization */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Ashley AI Price Optimization</h4>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={optimizeWithAshley}
              disabled={optimizingPrice || totalQuantity === 0}
            >
              {optimizingPrice ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Optimize Pricing
                </>
              )}
            </Button>
          </div>
          
          {priceRecommendation && (
            <div className="text-sm text-purple-800 bg-purple-100 rounded p-3">
              <strong>Recommendations:</strong> {priceRecommendation}
            </div>
          )}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing Breakdown
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Subtotal ({totalQuantity} × ₱{commercials.unitPrice})</span>
              <span>₱{commercials.subtotal.toLocaleString()}</span>
            </div>
            
            {addOnsCost > 0 && (
              <div className="flex justify-between items-center text-blue-600">
                <span>Add-ons Cost</span>
                <span>₱{addOnsCost.toLocaleString()}</span>
              </div>
            )}
            
            {colorVariantsCost > 0 && (
              <div className="flex justify-between items-center text-purple-600">
                <span>Color Variants Cost</span>
                <span>₱{colorVariantsCost.toLocaleString()}</span>
              </div>
            )}
            
            {commercials.rushSurcharge > 0 && (
              <div className="flex justify-between items-center text-amber-600">
                <span>Rush Surcharge ({rushSurchargePercent}%)</span>
                <span>₱{commercials.rushSurcharge.toLocaleString()}</span>
              </div>
            )}
            
            {commercials.quantityDiscount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Quantity Discount ({pricingBreak?.discount}%)</span>
                <span>-₱{commercials.quantityDiscount.toLocaleString()}</span>
              </div>
            )}
            
            {!commercials.taxInclusive && (
              <div className="flex justify-between items-center text-gray-600">
                <span>VAT (12%)</span>
                <span>₱{((commercials.finalTotal / 1.12) * 0.12).toLocaleString()}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span>₱{commercials.finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Payment Breakdown
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-900 font-medium mb-1">Deposit ({commercials.depositPercentage}%)</div>
              <div className="text-2xl font-bold text-blue-700">
                ₱{commercials.depositAmount.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600 mt-1">Due upon order confirmation</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-900 font-medium mb-1">Balance ({100 - commercials.depositPercentage}%)</div>
              <div className="text-2xl font-bold text-green-700">
                ₱{commercials.balanceAmount.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Due {PAYMENT_TERMS.find(t => t.value === commercials.paymentTerms)?.label.toLowerCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Profitability Indicator */}
        {commercials.unitPrice > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Estimated Margin</span>
            </div>
            <div className="text-sm text-gray-700">
              Based on estimated production cost of ₱80/piece:
              <span className="font-medium ml-2">
                {Math.round(((commercials.unitPrice - 80) / commercials.unitPrice) * 100)}% margin
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}