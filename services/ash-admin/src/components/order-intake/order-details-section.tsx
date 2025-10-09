'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Package, Shirt, Type, Plus, Pencil, Trash2 } from 'lucide-react'

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

const DEFAULT_FABRIC_TYPES = [
  { value: 'cotton', label: 'Cotton' },
  { value: 'polyester', label: 'Polyester' },
  { value: 'cotton-poly', label: 'Cotton/Poly Blend' },
  { value: 'dri-fit', label: 'Dri-Fit/Performance' },
  { value: 'jersey', label: 'Jersey' },
  { value: 'pique', label: 'Pique' },
  { value: 'fleece', label: 'Fleece' }
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
  // State for fabric type management
  const [fabricTypes, setFabricTypes] = useState(DEFAULT_FABRIC_TYPES)
  const [showFabricDialog, setShowFabricDialog] = useState(false)
  const [newFabricName, setNewFabricName] = useState('')
  const [editingFabricIndex, setEditingFabricIndex] = useState<number | null>(null)

  // Auto-generate PO number on component mount
  React.useEffect(() => {
    if (!poNumber) {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      const generatedPO = `PO-${year}${month}-${random}`
      onPoNumberChange(generatedPO)
    }
  }, [])

  const handleAddFabricType = () => {
    if (!newFabricName.trim()) return

    const value = newFabricName.toLowerCase().replace(/\s+/g, '-')
    const newFabric = { value, label: newFabricName.trim() }

    if (editingFabricIndex !== null) {
      // Edit existing
      const updated = [...fabricTypes]
      updated[editingFabricIndex] = newFabric
      setFabricTypes(updated)
      setEditingFabricIndex(null)
    } else {
      // Add new
      setFabricTypes([...fabricTypes, newFabric])
    }

    setNewFabricName('')
    setShowFabricDialog(false)
  }

  const handleEditFabricType = (index: number) => {
    setEditingFabricIndex(index)
    setNewFabricName(fabricTypes[index].label)
    setShowFabricDialog(true)
  }

  const handleDeleteFabricType = (index: number) => {
    const updated = fabricTypes.filter((_, i) => i !== index)
    setFabricTypes(updated)
    // If the deleted fabric was selected, clear the selection
    if (fabricTypes[index].value === fabricType) {
      onFabricTypeChange('')
    }
  }

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
              P.O. Number <Badge variant="secondary" className="ml-2">Auto-generated</Badge>
            </Label>
            <Input
              id="po-number"
              value={poNumber}
              readOnly
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Automatically generated purchase order number
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="design-name" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Design Name
              </Label>
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="fabric-type" className="flex items-center gap-2">
                <Shirt className="w-4 h-4" />
                Fabric Type
              </Label>
              <Dialog open={showFabricDialog} onOpenChange={(open) => {
                setShowFabricDialog(open)
                if (!open) {
                  setNewFabricName('')
                  setEditingFabricIndex(null)
                }
              }}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Manage Types
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Fabric Types</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Add/Edit Form */}
                    <div className="flex gap-2">
                      <Input
                        value={newFabricName}
                        onChange={(e) => setNewFabricName(e.target.value)}
                        placeholder="Enter fabric type name"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFabricType()}
                      />
                      <Button onClick={handleAddFabricType}>
                        {editingFabricIndex !== null ? 'Update' : 'Add'}
                      </Button>
                    </div>

                    {/* Fabric Types List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {fabricTypes.map((fabric, index) => (
                        <div
                          key={fabric.value}
                          className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                        >
                          <span>{fabric.label}</span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFabricType(index)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFabricType(index)}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Select value={fabricType} onValueChange={onFabricTypeChange}>
              <SelectTrigger id="fabric-type">
                <SelectValue placeholder="Select fabric type" />
              </SelectTrigger>
              <SelectContent>
                {fabricTypes.map((fabric) => (
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
