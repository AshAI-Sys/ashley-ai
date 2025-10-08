'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileText, Package, Shirt, Type } from 'lucide-react'

interface OrderDetailsSectionProps {
  poNumber: string
  orderType: string
  designName: string
  fabricType: string
  sizeDistributionType: string
  onPoNumberChange: (value: string) => void
  onOrderTypeChange: (value: string) => void
  onDesignNameChange: (value: string) => void
  onFabricTypeChange: (value: string) => void
  onSizeDistributionTypeChange: (value: string) => void
}

const ORDER_TYPES = [
  { value: 'NEW', label: 'New Order', description: 'First time production' },
  { value: 'REORDER', label: 'Reorder', description: 'Repeat production' }
]

const SIZE_DISTRIBUTION_TYPES = [
  { value: 'BOXTYPE', label: 'Boxtype', description: 'Standard fit sizing' },
  { value: 'OVERSIZED', label: 'Oversized', description: 'Loose/relaxed fit' }
]

const FABRIC_TYPES = [
  { value: 'cotton', label: 'Cotton' },
  { value: 'polyester', label: 'Polyester' },
  { value: 'cotton-poly', label: 'Cotton/Poly Blend' },
  { value: 'dri-fit', label: 'Dri-Fit/Performance' },
  { value: 'jersey', label: 'Jersey' },
  { value: 'pique', label: 'Pique' },
  { value: 'fleece', label: 'Fleece' },
  { value: 'custom', label: 'Custom' }
]

export function OrderDetailsSection({
  poNumber,
  orderType,
  designName,
  fabricType,
  sizeDistributionType,
  onPoNumberChange,
  onOrderTypeChange,
  onDesignNameChange,
  onFabricTypeChange,
  onSizeDistributionTypeChange
}: OrderDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Order Details
          <Badge variant="outline">Optional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PO Number & Order Type */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="po-number">
              P.O. Number
            </Label>
            <Input
              id="po-number"
              value={poNumber}
              onChange={(e) => onPoNumberChange(e.target.value)}
              placeholder="e.g., PO-2024-001"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Purchase order reference number
            </p>
          </div>

          <div>
            <Label htmlFor="order-type">
              Order Type <span className="text-red-500">*</span>
            </Label>
            <Select value={orderType} onValueChange={onOrderTypeChange}>
              <SelectTrigger id="order-type">
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Design Name & Fabric Type */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="design-name" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Design Name
            </Label>
            <Input
              id="design-name"
              value={designName}
              onChange={(e) => onDesignNameChange(e.target.value)}
              placeholder="e.g., Summer Collection 2024"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Name or title of the design
            </p>
          </div>

          <div>
            <Label htmlFor="fabric-type" className="flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              Fabric Type
            </Label>
            <Select value={fabricType} onValueChange={onFabricTypeChange}>
              <SelectTrigger id="fabric-type">
                <SelectValue placeholder="Select fabric type" />
              </SelectTrigger>
              <SelectContent>
                {FABRIC_TYPES.map((fabric) => (
                  <SelectItem key={fabric.value} value={fabric.value}>
                    {fabric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Size Distribution Type */}
        <div>
          <Label htmlFor="size-distribution" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Size Distribution Type
          </Label>
          <Select value={sizeDistributionType} onValueChange={onSizeDistributionTypeChange}>
            <SelectTrigger id="size-distribution">
              <SelectValue placeholder="Select size distribution type" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_DISTRIBUTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Affects sizing chart and fit recommendations
          </p>
        </div>

        {/* Info Box */}
        {orderType === 'REORDER' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Reorder Detected</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This order is marked as a reorder. Make sure to reference the previous
                  order for consistency in specifications and quality.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
