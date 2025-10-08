'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X, Image as ImageIcon, FileImage, Shirt } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PrintLocation {
  location: string
  location_label: string
  design_file_url?: string
  width_cm?: number
  height_cm?: number
  offset_x_cm?: number
  offset_y_cm?: number
  notes?: string
  selected: boolean
}

interface GraphicEditingSectionProps {
  artistFilename: string
  mockupImageUrl: string
  notesRemarks: string
  printLocations: PrintLocation[]
  onArtistFilenameChange: (value: string) => void
  onMockupImageUrlChange: (value: string) => void
  onNotesRemarksChange: (value: string) => void
  onPrintLocationsChange: (locations: PrintLocation[]) => void
}

const AVAILABLE_PRINT_LOCATIONS = [
  { value: 'BODY_FRONT', label: 'Body Front' },
  { value: 'BODY_BACK', label: 'Body Back' },
  { value: 'SLEEVE_RIGHT', label: 'Sleeve Right' },
  { value: 'SLEEVE_LEFT', label: 'Sleeve Left' },
  { value: 'POCKET_RIGHT', label: 'Pocket Right' },
  { value: 'POCKET_LEFT', label: 'Pocket Left' },
  { value: 'LEG_RIGHT_FRONT', label: 'Leg Right Front' },
  { value: 'LEG_RIGHT_BACK', label: 'Leg Right Back' },
  { value: 'LEG_RIGHT_SIDE', label: 'Leg Right Side' },
  { value: 'LEG_LEFT_FRONT', label: 'Leg Left Front' },
  { value: 'LEG_LEFT_BACK', label: 'Leg Left Back' },
  { value: 'LEG_LEFT_SIDE', label: 'Leg Left Side' },
  { value: 'HOOD', label: 'Hood' }
]

export function GraphicEditingSection({
  artistFilename,
  mockupImageUrl,
  notesRemarks,
  printLocations,
  onArtistFilenameChange,
  onMockupImageUrlChange,
  onNotesRemarksChange,
  onPrintLocationsChange
}: GraphicEditingSectionProps) {
  const togglePrintLocation = (locationValue: string) => {
    const exists = printLocations.find(loc => loc.location === locationValue)

    if (exists) {
      // Toggle selection
      const updated = printLocations.map(loc =>
        loc.location === locationValue
          ? { ...loc, selected: !loc.selected }
          : loc
      )
      onPrintLocationsChange(updated)
    } else {
      // Add new location
      const locationConfig = AVAILABLE_PRINT_LOCATIONS.find(l => l.value === locationValue)
      if (locationConfig) {
        const newLocation: PrintLocation = {
          location: locationConfig.value,
          location_label: locationConfig.label,
          selected: true
        }
        onPrintLocationsChange([...printLocations, newLocation])
      }
    }
  }

  const updatePrintLocation = (locationValue: string, field: keyof PrintLocation, value: any) => {
    const updated = printLocations.map(loc =>
      loc.location === locationValue
        ? { ...loc, [field]: value }
        : loc
    )
    onPrintLocationsChange(updated)
  }

  const removePrintLocation = (locationValue: string) => {
    const updated = printLocations.filter(loc => loc.location !== locationValue)
    onPrintLocationsChange(updated)
  }

  const selectedLocations = printLocations.filter(loc => loc.selected)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="w-5 h-5" />
          Graphic Editing Section
          <Badge variant="outline">Design Details</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Artist Filename */}
        <div>
          <Label htmlFor="artist-filename" className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Artist Filename
          </Label>
          <Input
            id="artist-filename"
            value={artistFilename}
            onChange={(e) => onArtistFilenameChange(e.target.value)}
            placeholder="e.g., CLIENT_BRAND_DESIGN_v1.ai"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Original filename from the artist/designer
          </p>
        </div>

        {/* Mockup Image URL */}
        <div>
          <Label htmlFor="mockup-url" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Mockup Image URL
          </Label>
          <Input
            id="mockup-url"
            value={mockupImageUrl}
            onChange={(e) => onMockupImageUrlChange(e.target.value)}
            placeholder="https://..."
            type="url"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Link to the mockup/preview image
          </p>
          {mockupImageUrl && (
            <div className="mt-3 border rounded-lg p-2 bg-gray-50">
              <img
                src={mockupImageUrl}
                alt="Mockup preview"
                className="w-full max-w-md rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  toast.error('Failed to load mockup image')
                }}
              />
            </div>
          )}
        </div>

        {/* Notes/Remarks */}
        <div>
          <Label htmlFor="notes-remarks">
            Notes/Remarks
          </Label>
          <Textarea
            id="notes-remarks"
            value={notesRemarks}
            onChange={(e) => onNotesRemarksChange(e.target.value)}
            placeholder="Add any special notes, design instructions, or remarks..."
            rows={3}
          />
        </div>

        {/* Print Locations */}
        <div>
          <div className="mb-4">
            <Label className="text-base font-medium">Print Locations</Label>
            <p className="text-sm text-muted-foreground">
              Select where the design will be printed on the garment
            </p>
          </div>

          {/* Location Selection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
            {AVAILABLE_PRINT_LOCATIONS.map((location) => {
              const isSelected = printLocations.some(
                loc => loc.location === location.value && loc.selected
              )

              return (
                <button
                  key={location.value}
                  onClick={() => togglePrintLocation(location.value)}
                  className={`
                    px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  {location.label}
                </button>
              )
            })}
          </div>

          {/* Selected Locations Details */}
          {selectedLocations.length > 0 && (
            <div className="space-y-4">
              <div className="font-medium">
                Location Details ({selectedLocations.length} selected)
              </div>

              {selectedLocations.map((location) => (
                <div
                  key={location.location}
                  className="border rounded-lg p-4 space-y-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{location.location_label}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrintLocation(location.location)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Design File URL</Label>
                      <Input
                        value={location.design_file_url || ''}
                        onChange={(e) =>
                          updatePrintLocation(
                            location.location,
                            'design_file_url',
                            e.target.value
                          )
                        }
                        placeholder="https://..."
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Input
                        value={location.notes || ''}
                        onChange={(e) =>
                          updatePrintLocation(location.location, 'notes', e.target.value)
                        }
                        placeholder="Special instructions..."
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">Width (cm)</Label>
                      <Input
                        type="number"
                        value={location.width_cm || ''}
                        onChange={(e) =>
                          updatePrintLocation(
                            location.location,
                            'width_cm',
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        placeholder="0.0"
                        step="0.1"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Height (cm)</Label>
                      <Input
                        type="number"
                        value={location.height_cm || ''}
                        onChange={(e) =>
                          updatePrintLocation(
                            location.location,
                            'height_cm',
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        placeholder="0.0"
                        step="0.1"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Offset X (cm)</Label>
                      <Input
                        type="number"
                        value={location.offset_x_cm || ''}
                        onChange={(e) =>
                          updatePrintLocation(
                            location.location,
                            'offset_x_cm',
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        placeholder="0.0"
                        step="0.1"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Offset Y (cm)</Label>
                      <Input
                        type="number"
                        value={location.offset_y_cm || ''}
                        onChange={(e) =>
                          updatePrintLocation(
                            location.location,
                            'offset_y_cm',
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        placeholder="0.0"
                        step="0.1"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedLocations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Shirt className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No print locations selected</p>
              <p className="text-sm">Select locations from the options above</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
