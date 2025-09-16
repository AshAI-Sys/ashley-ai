'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  X, 
  Palette,
  Pipette,
  Copy,
  Check
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Color {
  id: string
  hex: string
  name?: string
  pantone?: string
  cmyk?: string
  rgb?: string
}

interface ColorPaletteProps {
  colors: string[]
  onColorsChange: (colors: string[]) => void
  maxColors?: number
  allowCustomNames?: boolean
  showColorInfo?: boolean
  className?: string
}

const PRESET_COLORS = [
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#FF0000', name: 'Red' },
  { hex: '#00FF00', name: 'Green' },
  { hex: '#0000FF', name: 'Blue' },
  { hex: '#FFFF00', name: 'Yellow' },
  { hex: '#FF00FF', name: 'Magenta' },
  { hex: '#00FFFF', name: 'Cyan' },
  { hex: '#808080', name: 'Gray' },
  { hex: '#800000', name: 'Maroon' },
  { hex: '#808000', name: 'Olive' },
  { hex: '#008000', name: 'Dark Green' },
  { hex: '#800080', name: 'Purple' },
  { hex: '#008080', name: 'Teal' },
  { hex: '#000080', name: 'Navy' },
  { hex: '#FFA500', name: 'Orange' }
]

export default function ColorPalette({
  colors,
  onColorsChange,
  maxColors = 12,
  allowCustomNames = false,
  showColorInfo = true,
  className = ''
}: ColorPaletteProps) {
  const [newColor, setNewColor] = useState('#000000')
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const addColor = (hexColor: string) => {
    if (colors.length >= maxColors) {
      toast.error(`Maximum ${maxColors} colors allowed`)
      return
    }

    if (colors.includes(hexColor)) {
      toast.error('Color already in palette')
      return
    }

    const updatedColors = [...colors, hexColor]
    onColorsChange(updatedColors)
    setNewColor('#000000')
  }

  const removeColor = (index: number) => {
    const updatedColors = colors.filter((_, i) => i !== index)
    onColorsChange(updatedColors)
  }

  const updateColor = (index: number, hexColor: string) => {
    const updatedColors = colors.map((color, i) => i === index ? hexColor : color)
    onColorsChange(updatedColors)
  }

  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(null), 2000)
      toast.success('Color copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy color')
    }
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const getContrastColor = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (!rgb) return '#000000'
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#FFFFFF'
  }

  const getColorName = (hex: string) => {
    const preset = PRESET_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase())
    return preset?.name || hex
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Color Palette</h3>
          <Badge variant="outline">{colors.length}/{maxColors}</Badge>
        </div>
      </div>

      {/* Current Colors */}
      {colors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Colors ({colors.length})</CardTitle>
            <CardDescription>
              Click on colors to edit, or use the copy button to copy hex codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {colors.map((color, index) => (
                <div key={index} className="relative group">
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {/* Color Swatch */}
                      <div className="relative">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="w-12 h-12 border-2 border-white rounded-lg cursor-pointer shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      </div>

                      {/* Color Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {getColorName(color)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {color.toUpperCase()}
                        </div>
                        {showColorInfo && (() => {
                          const rgb = hexToRgb(color)
                          return rgb ? (
                            <div className="text-xs text-muted-foreground">
                              RGB({rgb.r}, {rgb.g}, {rgb.b})
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(color)}
                        className="text-xs px-2 py-1 h-6"
                      >
                        {copiedColor === color ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeColor(index)}
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 h-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Color */}
      {colors.length < maxColors && (
        <Card>
          <CardHeader>
            <CardTitle>Add Color</CardTitle>
            <CardDescription>
              Add colors to your palette using the color picker or presets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Picker */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Custom Color:</Label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="#000000"
                className="w-24 font-mono text-sm"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <Button 
                onClick={() => addColor(newColor)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Preset Colors */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Quick Add:</Label>
              <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                {PRESET_COLORS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => addColor(preset.hex)}
                    className={`w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors ${
                      colors.includes(preset.hex) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                    disabled={colors.includes(preset.hex)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color Analysis */}
      {colors.length > 0 && showColorInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Color Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{colors.length}</div>
                <div className="text-muted-foreground">Total Colors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {colors.filter(c => {
                    const rgb = hexToRgb(c)
                    return rgb && (rgb.r + rgb.g + rgb.b) / 3 > 128
                  }).length}
                </div>
                <div className="text-muted-foreground">Light Colors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {colors.filter(c => {
                    const rgb = hexToRgb(c)
                    return rgb && (rgb.r + rgb.g + rgb.b) / 3 <= 128
                  }).length}
                </div>
                <div className="text-muted-foreground">Dark Colors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {maxColors - colors.length}
                </div>
                <div className="text-muted-foreground">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print Method Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Color Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex items-center gap-2 text-purple-600">
            <div className="w-2 h-2 bg-purple-600 rounded-full" />
            <span><strong>Silkscreen:</strong> Maximum 6 colors recommended for cost efficiency</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-600">
            <div className="w-2 h-2 bg-cyan-600 rounded-full" />
            <span><strong>Sublimation:</strong> Unlimited colors, works best with light fabrics</span>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <div className="w-2 h-2 bg-orange-600 rounded-full" />
            <span><strong>DTF:</strong> Full color support with automatic white underbase</span>
          </div>
          <div className="flex items-center gap-2 text-pink-600">
            <div className="w-2 h-2 bg-pink-600 rounded-full" />
            <span><strong>Embroidery:</strong> Limited colors, consider thread availability</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}