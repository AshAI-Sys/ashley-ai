"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Eye, Move, Maximize, RotateCw } from "lucide-react";
import { toast } from "react-hot-toast";

export interface Placement {
  id: string;
  area: string;
  width_cm: number;
  height_cm: number;
  offset_x: number;
  offset_y: number;
  rotation?: number;
}

interface PlacementEditorProps {
  placements: Placement[];
  onPlacementsChange: (placements: Placement[]) => void;
  mockupUrl?: string;
  className?: string;
}

const PLACEMENT_AREAS = [
  { value: "front", label: "Front", color: "bg-blue-100 text-blue-800" },
  { value: "back", label: "Back", color: "bg-green-100 text-green-800" },
  {
    value: "left_chest",
    label: "Left Chest",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "right_chest",
    label: "Right Chest",
    color: "bg-pink-100 text-pink-800",
  },
  { value: "sleeve", label: "Sleeve", color: "bg-orange-100 text-orange-800" },
  { value: "all_over", label: "All Over", color: "bg-red-100 text-red-800" },
];

const GARMENT_TEMPLATES = {
  tshirt: {
    width: 50,
    height: 70,
    areas: {
      front: { maxWidth: 35, maxHeight: 40, defaultX: 7.5, defaultY: 15 },
      back: { maxWidth: 35, maxHeight: 40, defaultX: 7.5, defaultY: 15 },
      left_chest: { maxWidth: 10, maxHeight: 10, defaultX: 5, defaultY: 10 },
      right_chest: { maxWidth: 10, maxHeight: 10, defaultX: 35, defaultY: 10 },
      sleeve: { maxWidth: 15, maxHeight: 20, defaultX: 45, defaultY: 20 },
      all_over: { maxWidth: 50, maxHeight: 70, defaultX: 0, defaultY: 0 },
    },
  },
};

export default function PlacementEditor({
  placements,
  onPlacementsChange,
  mockupUrl,
  className = "",
}: PlacementEditorProps) {
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(
    null
  );
  const [previewMode, setPreviewMode] = useState(false);

  const addPlacement = () => {
    const newId = `placement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPlacement: Placement = {
      id: newId,
      area: "front",
      width_cm: 20,
      height_cm: 25,
      offset_x: 7.5,
      offset_y: 15,
      rotation: 0,
    };

    const updatedPlacements = [...placements, newPlacement];
    onPlacementsChange(updatedPlacements);
    setSelectedPlacement(newId);
  };

  const removePlacement = (id: string) => {
    if (placements.length <= 1) {
      toast.error("At least one placement is required");
      return;
    }

    const updatedPlacements = placements.filter(p => p.id !== id);
    onPlacementsChange(updatedPlacements);

    if (selectedPlacement === id) {
      setSelectedPlacement(updatedPlacements[0]?.id || null);
    }
  };

  const updatePlacement = (id: string, field: keyof Placement, value: any) => {
    const updatedPlacements = placements.map(placement => {
      if (placement.id === id) {
        let updatedValue = value;

        // Validate dimensions based on area
        if (field === "area") {
          const template =
            GARMENT_TEMPLATES.tshirt.areas[
              value as keyof typeof GARMENT_TEMPLATES.tshirt.areas
            ];
          if (template) {
            return {
              ...placement,
              area: value,
              width_cm: Math.min(placement.width_cm, template.maxWidth),
              height_cm: Math.min(placement.height_cm, template.maxHeight),
              offset_x: template.defaultX,
              offset_y: template.defaultY,
            };
          }
        }

        // Validate dimensions
        if (field === "width_cm" || field === "height_cm") {
          const template =
            GARMENT_TEMPLATES.tshirt.areas[
              placement.area as keyof typeof GARMENT_TEMPLATES.tshirt.areas
            ];
          if (template) {
            const maxValue =
              field === "width_cm" ? template.maxWidth : template.maxHeight;
            updatedValue = Math.min(
              Math.max(0.1, parseFloat(value) || 0),
              maxValue
            );
          }
        }

        // Validate offsets
        if (field === "offset_x" || field === "offset_y") {
          updatedValue = parseFloat(value) || 0;
        }

        return { ...placement, [field]: updatedValue };
      }
      return placement;
    });

    onPlacementsChange(updatedPlacements);
  };

  const getAreaColor = (area: string) => {
    return (
      PLACEMENT_AREAS.find(a => a.value === area)?.color ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getAreaLabel = (area: string) => {
    return PLACEMENT_AREAS.find(a => a.value === area)?.label || area;
  };

  // Calculate placement position on visual preview (as percentage)
  const getPlacementStyle = (placement: Placement) => {
    const template = GARMENT_TEMPLATES.tshirt;
    return {
      left: `${(placement.offset_x / template.width) * 100}%`,
      top: `${(placement.offset_y / template.height) * 100}%`,
      width: `${(placement.width_cm / template.width) * 100}%`,
      height: `${(placement.height_cm / template.height) * 100}%`,
      transform: placement.rotation
        ? `rotate(${placement.rotation}deg)`
        : undefined,
    };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Design Placements</h3>
          <p className="text-sm text-muted-foreground">
            Define where and how the design will be placed on the garment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-1 h-4 w-4" />
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </Button>
          <Button onClick={addPlacement} size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Add Placement
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visual Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Maximize className="h-4 w-4" />
              Visual Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative min-h-[400px] rounded-lg bg-gray-50 p-6">
              {/* Garment Template */}
              <div
                className="relative mx-auto rounded-lg border-2 border-gray-300 bg-white"
                style={{
                  width: "280px",
                  height: "400px",
                }}
              >
                {/* Mockup Image */}
                {mockupUrl && (
                  <img
                    src={mockupUrl}
                    alt="Design mockup"
                    className="absolute inset-0 h-full w-full rounded-lg object-cover opacity-30"
                  />
                )}

                {/* Placement Overlays */}
                {placements.map(placement => (
                  <div
                    key={placement.id}
                    className={`absolute cursor-pointer rounded border-2 border-blue-500 transition-all ${
                      selectedPlacement === placement.id
                        ? "border-blue-600 bg-blue-200 bg-opacity-50"
                        : "bg-blue-100 bg-opacity-30 hover:bg-opacity-50"
                    }`}
                    style={getPlacementStyle(placement)}
                    onClick={() => setSelectedPlacement(placement.id)}
                  >
                    <div className="absolute -top-6 left-0 text-xs font-medium text-blue-600">
                      {getAreaLabel(placement.area)}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-blue-600">
                      {placement.width_cm}×{placement.height_cm}
                    </div>

                    {/* Resize handles */}
                    {selectedPlacement === placement.id && !previewMode && (
                      <>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-full bg-blue-600" />
                        <div className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 cursor-e-resize rounded-full bg-blue-600" />
                        <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-s-resize rounded-full bg-blue-600" />
                      </>
                    )}
                  </div>
                ))}

                {/* Garment Guide Lines */}
                <div className="pointer-events-none absolute inset-0">
                  {/* Center lines */}
                  <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-px bg-gray-300 opacity-50" />
                  <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-px bg-gray-300 opacity-50" />
                </div>
              </div>

              {/* Grid overlay for precise positioning */}
              {selectedPlacement && !previewMode && (
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  <svg className="h-full w-full">
                    <defs>
                      <pattern
                        id="grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="#000"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Properties Panel */}
        <div className="space-y-4">
          {/* Placement List */}
          <Card>
            <CardHeader>
              <CardTitle>Placements ({placements.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {placements.map((placement, index) => (
                  <div
                    key={placement.id}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                      selectedPlacement === placement.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPlacement(placement.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          #{index + 1}
                        </span>
                        <Badge
                          className={getAreaColor(placement.area)}
                          variant="outline"
                        >
                          {getAreaLabel(placement.area)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {placement.width_cm}×{placement.height_cm}cm
                        </span>
                        {placements.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              removePlacement(placement.id);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Placement Properties */}
          {selectedPlacement && (
            <Card>
              <CardHeader>
                <CardTitle>Placement Properties</CardTitle>
                <CardDescription>
                  Edit the selected placement settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const placement = placements.find(
                    p => p.id === selectedPlacement
                  );
                  if (!placement) return null;

                  return (
                    <>
                      {/* Area Selection */}
                      <div>
                        <Label>Placement Area</Label>
                        <Select
                          value={placement.area}
                          onValueChange={value =>
                            updatePlacement(placement.id, "area", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PLACEMENT_AREAS.map(area => (
                              <SelectItem key={area.value} value={area.value}>
                                {area.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dimensions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Width (cm)</Label>
                          <Input
                            type="number"
                            value={placement.width_cm}
                            onChange={e =>
                              updatePlacement(
                                placement.id,
                                "width_cm",
                                e.target.value
                              )
                            }
                            min="0.1"
                            step="0.1"
                            max={
                              GARMENT_TEMPLATES.tshirt.areas[
                                placement.area as keyof typeof GARMENT_TEMPLATES.tshirt.areas
                              ]?.maxWidth || 50
                            }
                          />
                        </div>
                        <div>
                          <Label>Height (cm)</Label>
                          <Input
                            type="number"
                            value={placement.height_cm}
                            onChange={e =>
                              updatePlacement(
                                placement.id,
                                "height_cm",
                                e.target.value
                              )
                            }
                            min="0.1"
                            step="0.1"
                            max={
                              GARMENT_TEMPLATES.tshirt.areas[
                                placement.area as keyof typeof GARMENT_TEMPLATES.tshirt.areas
                              ]?.maxHeight || 70
                            }
                          />
                        </div>
                      </div>

                      {/* Position */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Offset X (cm)</Label>
                          <Input
                            type="number"
                            value={placement.offset_x}
                            onChange={e =>
                              updatePlacement(
                                placement.id,
                                "offset_x",
                                e.target.value
                              )
                            }
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label>Offset Y (cm)</Label>
                          <Input
                            type="number"
                            value={placement.offset_y}
                            onChange={e =>
                              updatePlacement(
                                placement.id,
                                "offset_y",
                                e.target.value
                              )
                            }
                            step="0.1"
                          />
                        </div>
                      </div>

                      {/* Rotation */}
                      <div>
                        <Label>Rotation (degrees)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={placement.rotation || 0}
                            onChange={e =>
                              updatePlacement(
                                placement.id,
                                "rotation",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="-180"
                            max="180"
                            step="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updatePlacement(
                                placement.id,
                                "rotation",
                                ((placement.rotation || 0) + 90) % 360
                              )
                            }
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Placement Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-blue-600">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <span>Front: Best for main designs and logos</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <span>Back: Perfect for large graphics</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <div className="h-2 w-2 rounded-full bg-purple-600" />
                <span>Left Chest: Small logos and text</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <div className="h-2 w-2 rounded-full bg-orange-600" />
                <span>Sleeve: Accent designs</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <div className="h-2 w-2 rounded-full bg-red-600" />
                <span>All Over: Full coverage prints</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
