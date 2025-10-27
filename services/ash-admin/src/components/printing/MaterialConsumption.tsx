"use client";

import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Package2,
  Plus,
  Search,
  Trash2,
  Save,
  CheckCircle,
} from "lucide-react";

interface Material {
  id: string;
  name: string;
  type: string;
  supplier?: string;
  color?: string;
  unit: string;
  current_stock: number;
  available_stock: number;
  cost_per_unit?: number;
  batch_number?: string;
  location?: string;
}

interface MaterialConsumption {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  cost: number;
  batch_id?: string;
  notes?: string;
}

interface MaterialConsumptionProps {
  runId: string;
  method: string;
  onUpdate?: (materials: MaterialConsumption[]) => void;
  readOnly?: boolean;
}

export default function MaterialConsumption({
  runId,
  method,
  onUpdate,
  readOnly = false,
}: MaterialConsumptionProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [consumedMaterials, setConsumedMaterials] = useState<
    MaterialConsumption[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);

  const [newConsumption, setNewConsumption] = useState({
    material_id: "",
    quantity: "",
    notes: "",
  });

  useEffect(() => {
    fetchMaterials();
    fetchMaterialTypes();
    fetchExistingConsumption();
  }, []);

  useEffect(() => {
    if (searchTerm || selectedType) {
      fetchMaterials();
    }
  }, [searchTerm, selectedType]);

  const fetchMaterials = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append("type", selectedType);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/printing/materials?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.data || []);
      } else {
        // Mock data for demo
        setMaterials([
          {
            id: "1",
            name: "Plastisol Ink - Black",
            type: "INK",
            supplier: "Union Ink",
            unit: "g",
            current_stock: 5000,
            available_stock: 4500,
            cost_per_unit: 0.05,
            batch_number: "PI-BLK-001",
            location: "A1-B2",
          },
          {
            id: "2",
            name: "Sublimation Paper - A3",
            type: "PAPER",
            supplier: "TexPrint",
            unit: "sheets",
            current_stock: 1000,
            available_stock: 850,
            cost_per_unit: 0.25,
            batch_number: "SP-A3-202501",
            location: "B2-C1",
          },
          {
            id: "3",
            name: "DTF Hot Melt Powder",
            type: "POWDER",
            supplier: "DTF Supplies",
            unit: "g",
            current_stock: 2000,
            available_stock: 1800,
            cost_per_unit: 0.08,
            batch_number: "HMP-001",
            location: "C1-D3",
          },
          {
            id: "4",
            name: "Embroidery Thread - Navy",
            type: "THREAD",
            supplier: "Madeira",
            color: "Navy Blue",
            unit: "m",
            current_stock: 500,
            available_stock: 450,
            cost_per_unit: 0.02,
            batch_number: "ET-NAV-001",
            location: "D3-E1",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchMaterialTypes = async () => {
    try {
      const response = await fetch("/api/printing/materials", {
        method: "OPTIONS",
      });
      if (response.ok) {
        const data = await response.json();
        setMaterialTypes(data.data || []);
      } else {
        setMaterialTypes([
          "INK",
          "PAPER",
          "POWDER",
          "THREAD",
          "FILM",
          "STABILIZER",
        ]);
      }
    } catch (error) {
      console.error("Error fetching material types:", error);
      setMaterialTypes([
        "INK",
        "PAPER",
        "POWDER",
        "THREAD",
        "FILM",
        "STABILIZER",
      ]);
    }
  };

  const fetchExistingConsumption = async () => {
    // This would fetch existing material consumption for the run
    // For now, we'll start with empty array
    setConsumedMaterials([]);
  };

  const addMaterial = () => {
    const selectedMaterial = materials.find(
      m => m.id === newConsumption.material_id
    );
    if (!selectedMaterial || !newConsumption.quantity) return;

    const quantity = parseFloat(newConsumption.quantity);
    if (quantity <= 0) return;

    // Check if material already consumed
    const existingIndex = consumedMaterials.findIndex(
      c => c.material_id === selectedMaterial.id
    );

    if (existingIndex >= 0) {
      // Update existing consumption
      const updated = [...consumedMaterials];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
        cost:
          (updated[existingIndex].quantity + quantity) *
          (selectedMaterial.cost_per_unit || 0),
        notes: newConsumption.notes || updated[existingIndex].notes,
      };
      setConsumedMaterials(updated);
    } else {
      // Add new consumption
      const newItem: MaterialConsumption = {
        material_id: selectedMaterial.id,
        material_name: selectedMaterial.name,
        quantity,
        unit: selectedMaterial.unit,
        cost: quantity * (selectedMaterial.cost_per_unit || 0),
        batch_id: selectedMaterial.batch_number,
        notes: newConsumption.notes,
      };
      setConsumedMaterials([...consumedMaterials, newItem]);
    }

    // Reset form
    setNewConsumption({ material_id: "", quantity: "", notes: "" });
    setShowAddDialog(false);

    // Notify parent component
    onUpdate?.(consumedMaterials);
  };

  const removeMaterial = (materialId: string) => {
    const updated = consumedMaterials.filter(c => c.material_id !== materialId);
    setConsumedMaterials(updated);
    onUpdate?.(updated);
  };

  const saveMaterialConsumption = async () => {
    if (consumedMaterials.length === 0) return;

    try {
      setLoading(true);
      const response = await fetch("/api/printing/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: runId,
          materials: consumedMaterials.map(m => ({
            material_id: m.material_id,
            quantity: m.quantity,
            unit: m.unit,
            batch_id: m.batch_id,
            notes: m.notes,
          })),
        }),
      });

      if (response.ok) {
        // Material consumption saved successfully
        console.log("Material consumption saved");
      } else {
        console.error("Failed to save material consumption");
      }
    } catch (error) {
      console.error("Error saving material consumption:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCost = () => {
    return consumedMaterials.reduce((sum, material) => sum + material.cost, 0);
  };

  const getMethodSpecificMaterials = () => {
    const methodMaterials = {
      SILKSCREEN: ["INK", "EMULSION", "SCREEN"],
      SUBLIMATION: ["INK", "PAPER"],
      DTF: ["INK", "FILM", "POWDER"],
      EMBROIDERY: ["THREAD", "STABILIZER", "BOBBIN"],
    };
    return methodMaterials[method as keyof typeof methodMaterials] || [];
  };

  const getRelevantMaterials = () => {
    const methodTypes = getMethodSpecificMaterials();
    if (methodTypes.length === 0) return materials;
    return materials.filter(m => methodTypes.includes(m.type));
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package2 className="h-5 w-5 text-orange-600" />
            <div>
              <CardTitle>Material Consumption Summary</CardTitle>
              <CardDescription>
                Track materials used for {method} printing
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {consumedMaterials.length}
              </div>
              <p className="text-sm text-muted-foreground">Materials Used</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                ₱{getTotalCost().toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {consumedMaterials.reduce((sum, m) => sum + m.quantity, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Quantity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Consumption List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consumed Materials</CardTitle>
            <div className="flex gap-2">
              {!readOnly && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Material Consumption</DialogTitle>
                      <DialogDescription>
                        Select material and record consumption for this print
                        run
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Material Search */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Search Materials</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              placeholder="Search by name or supplier..."
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Filter by Type</Label>
                          <Select
                            value={selectedType}
                            onValueChange={setSelectedType}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All types</SelectItem>
                              {materialTypes.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Material Selection */}
                      <div className="space-y-2">
                        <Label>Material</Label>
                        <Select
                          value={newConsumption.material_id}
                          onValueChange={value =>
                            setNewConsumption({
                              ...newConsumption,
                              material_id: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {getRelevantMaterials().map(material => (
                              <SelectItem key={material.id} value={material.id}>
                                <div className="flex w-full items-center justify-between">
                                  <span>{material.name}</span>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline">
                                      {material.type}
                                    </Badge>
                                    <span>
                                      {material.available_stock} {material.unit}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity and Notes */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newConsumption.quantity}
                            onChange={e =>
                              setNewConsumption({
                                ...newConsumption,
                                quantity: e.target.value,
                              })
                            }
                            placeholder="0.00"
                          />
                          {newConsumption.material_id && (
                            <p className="text-xs text-muted-foreground">
                              Available:{" "}
                              {
                                materials.find(
                                  m => m.id === newConsumption.material_id
                                )?.available_stock
                              }{" "}
                              {
                                materials.find(
                                  m => m.id === newConsumption.material_id
                                )?.unit
                              }
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Notes (optional)</Label>
                          <Input
                            value={newConsumption.notes}
                            onChange={e =>
                              setNewConsumption({
                                ...newConsumption,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Usage notes..."
                          />
                        </div>
                      </div>

                      {/* Cost Preview */}
                      {newConsumption.material_id &&
                        newConsumption.quantity && (
                          <div className="rounded-lg bg-green-50 p-3">
                            <div className="flex items-center justify-between">
                              <span>Estimated Cost:</span>
                              <span className="font-bold text-green-600">
                                ₱
                                {(
                                  parseFloat(newConsumption.quantity || "0") *
                                  (materials.find(
                                    m => m.id === newConsumption.material_id
                                  )?.cost_per_unit || 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addMaterial}
                          disabled={
                            !newConsumption.material_id ||
                            !newConsumption.quantity
                          }
                        >
                          Add Material
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {consumedMaterials.length > 0 && !readOnly && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveMaterialConsumption}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save to Inventory
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {consumedMaterials.length > 0 ? (
            <div className="space-y-3">
              {consumedMaterials.map((material, _index) => (
                <div
                  key={material.material_id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">
                        {material.material_name}
                      </span>
                      {material.batch_id && (
                        <Badge variant="outline" className="text-xs">
                          Batch: {material.batch_id}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {material.quantity} {material.unit} • ₱
                      {material.cost.toFixed(2)}
                      {material.notes && (
                        <span className="ml-2 italic">({material.notes})</span>
                      )}
                    </div>
                  </div>

                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMaterial(material.material_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No materials consumed yet</p>
              {!readOnly && (
                <Button
                  className="mt-2"
                  variant="outline"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add First Material
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Method-specific recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Material Guidelines for {method}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MethodMaterialGuidelines method={method} />
        </CardContent>
      </Card>
    </div>
  );
}

function MethodMaterialGuidelines({ method }: { method: string }) {
  const guidelines = {
    SILKSCREEN: [
      "• Track ink consumption per color and design complexity",
      "• Monitor screen preparation materials (emulsion, chemicals)",
      "• Record cleaning solvents and maintenance supplies",
      "• Typical ink usage: 10-20g per print depending on coverage",
    ],
    SUBLIMATION: [
      "• Monitor sublimation paper consumption (usually 1.1-1.2x print area)",
      "• Track ink usage across all colors (CMYK)",
      "• Record transfer tape or protective paper usage",
      "• Consider paper waste for test prints and trimming",
    ],
    DTF: [
      "• Track DTF film consumption (typically 1.1x design area)",
      "• Monitor hot melt powder usage (varies by design coverage)",
      "• Record both CMYK and white ink consumption",
      "• Account for powder recycling and reuse",
    ],
    EMBROIDERY: [
      "• Track thread consumption by color and design complexity",
      "• Monitor stabilizer usage (varies by fabric and design)",
      "• Record bobbin thread consumption",
      "• Account for thread waste from changes and breaks",
    ],
  };

  const methodGuidelines = guidelines[method as keyof typeof guidelines] || [
    "• No specific guidelines available",
  ];

  return (
    <ul className="space-y-1 text-sm text-muted-foreground">
      {methodGuidelines.map((guideline, index) => (
        <li key={index}>{guideline}</li>
      ))}
    </ul>
  );
}
