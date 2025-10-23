"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Minus,
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle,
  Box,
  Scale,
  Maximize,
  Zap,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FinishedUnit {
  id: string;
  sku: string;
  size_code: string;
  color: string;
  unit_serial: string;
  order_number: string;
  estimated_weight: number;
  estimated_volume: number;
}

interface CartonOptimization {
  recommended_dimensions: {
    length: number;
    width: number;
    height: number;
  };
  max_units: number;
  fill_efficiency: number;
  weight_distribution: string;
  cost_analysis: {
    shipping_cost: number;
    material_cost: number;
    total_cost: number;
  };
}

interface CartonState {
  id?: string;
  order_id: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  tare_weight: number;
  contents: Array<{
    finished_unit_id: string;
    quantity: number;
    unit: FinishedUnit;
  }>;
  metrics: {
    actual_weight: number;
    dimensional_weight: number;
    fill_percentage: number;
    unit_count: number;
  };
}

export default function CartonBuilderPage() {
  const router = useRouter();
  const [cartonState, setCartonState] = useState<CartonState>({
    order_id: "",
    dimensions: { length: 40, width: 30, height: 25 },
    tare_weight: 0.5,
    contents: [],
    metrics: {
      actual_weight: 0.5,
      dimensional_weight: 0,
      fill_percentage: 0,
      unit_count: 0,
    },
  });

  const [availableUnits, setAvailableUnits] = useState<FinishedUnit[]>([]);
  const [optimization, setOptimization] = useState<CartonOptimization | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [ashleyMode, setAshleyMode] = useState(false);

  useEffect(() => {
    loadAvailableUnits();
    calculateMetrics();
  }, []);

  useEffect(() => {
    calculateMetrics();
    if (ashleyMode) {
      getAshleyOptimization();
    }
  }, [cartonState.contents, cartonState.dimensions]);

  const loadAvailableUnits = async () => {
    try {
      const response = await fetch(
        "/api/packing/available-units?status=FINISHED"
      );
      const data = await response.json();
      setAvailableUnits(data.units || []);
    } catch (error) {
      console.error("Error loading available units:", error);
      // Mock data for demo
      setAvailableUnits([
        {
          id: "1",
          sku: "TEE-BLK-M",
          size_code: "M",
          color: "Black",
          unit_serial: "BDL-001-001",
          order_number: "ORD-2024-001",
          estimated_weight: 0.15,
          estimated_volume: 300,
        },
        {
          id: "2",
          sku: "TEE-BLK-L",
          size_code: "L",
          color: "Black",
          unit_serial: "BDL-001-002",
          order_number: "ORD-2024-001",
          estimated_weight: 0.18,
          estimated_volume: 350,
        },
        {
          id: "3",
          sku: "TEE-WHT-M",
          size_code: "M",
          color: "White",
          unit_serial: "BDL-002-001",
          order_number: "ORD-2024-002",
          estimated_weight: 0.15,
          estimated_volume: 300,
        },
      ]);
    }
  };

  const calculateMetrics = () => {
    const unitCount = cartonState.contents.reduce(
      (sum, content) => sum + content.quantity,
      0
    );
    const contentWeight = cartonState.contents.reduce(
      (sum, content) => sum + content.quantity * content.unit.estimated_weight,
      0
    );
    const actualWeight = cartonState.tare_weight + contentWeight;

    const cartonVolume =
      cartonState.dimensions.length *
      cartonState.dimensions.width *
      cartonState.dimensions.height;
    const usedVolume = cartonState.contents.reduce(
      (sum, content) => sum + content.quantity * content.unit.estimated_volume,
      0
    );
    const fillPercentage =
      cartonVolume > 0 ? (usedVolume / cartonVolume) * 100 : 0;

    // Calculate dimensional weight (carrier-specific divisor)
    const dimensionalWeight = cartonVolume / 5000; // 5000 is common divisor

    setCartonState(prev => ({
      ...prev,
      metrics: {
        actual_weight: actualWeight,
        dimensional_weight: dimensionalWeight,
        fill_percentage: Math.min(100, fillPercentage),
        unit_count: unitCount,
      },
    }));
  };

  const getAshleyOptimization = async () => {
    try {
      const response = await fetch("/api/packing/ashley-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: cartonState.contents,
          current_dimensions: cartonState.dimensions,
        }),
      });
      const data = await response.json();
      setOptimization(data);
    } catch (error) {
      console.error("Error getting Ashley optimization:", error);
      // Mock optimization for demo
      setOptimization({
        recommended_dimensions: {
          length: Math.ceil(cartonState.dimensions.length * 0.95),
          width: Math.ceil(cartonState.dimensions.width * 1.05),
          height: Math.ceil(cartonState.dimensions.height * 0.9),
        },
        max_units: 45,
        fill_efficiency: 92.5,
        weight_distribution: "OPTIMAL",
        cost_analysis: {
          shipping_cost: 125.5,
          material_cost: 12.75,
          total_cost: 138.25,
        },
      });
    }
  };

  const addUnitToCarton = (unit: FinishedUnit, quantity: number = 1) => {
    setCartonState(prev => {
      const existingContent = prev.contents.find(
        c => c.finished_unit_id === unit.id
      );

      if (existingContent) {
        return {
          ...prev,
          contents: prev.contents.map(c =>
            c.finished_unit_id === unit.id
              ? { ...c, quantity: c.quantity + quantity }
              : c
          ),
        };
      } else {
        return {
          ...prev,
          contents: [
            ...prev.contents,
            {
              finished_unit_id: unit.id,
              quantity,
              unit,
            },
          ],
        };
      }
    });
  };

  const removeUnitFromCarton = (unitId: string, quantity: number = 1) => {
    setCartonState(prev => ({
      ...prev,
      contents: prev.contents.reduce(
        (acc, content) => {
          if (content.finished_unit_id === unitId) {
            const newQuantity = content.quantity - quantity;
            if (newQuantity > 0) {
              acc.push({ ...content, quantity: newQuantity });
            }
          } else {
            acc.push(content);
          }
          return acc;
        },
        [] as CartonState["contents"]
      ),
    }));
  };

  const applyAshleyOptimization = () => {
    if (!optimization) return;

    setCartonState(prev => ({
      ...prev,
      dimensions: optimization.recommended_dimensions,
    }));
  };

  const saveCarton = async () => {
    setLoading(true);
    try {
      const cartonData = {
        order_id: cartonState.order_id,
        length_cm: cartonState.dimensions.length,
        width_cm: cartonState.dimensions.width,
        height_cm: cartonState.dimensions.height,
        tare_weight_kg: cartonState.tare_weight,
        contents: cartonState.contents,
      };

      const response = await fetch("/api/packing/cartons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartonData),
      });

      if (response.ok) {
        router.push("/finishing-packing");
      }
    } catch (error) {
      console.error("Error saving carton:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Carton Builder
              </h1>
              <p className="text-sm text-gray-500">
                AI-powered packing optimization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant={ashleyMode ? "default" : "outline"}
              onClick={() => setAshleyMode(!ashleyMode)}
              className="flex items-center"
            >
              <Zap className="mr-2 h-4 w-4" />
              Ashley AI {ashleyMode ? "ON" : "OFF"}
            </Button>
            <Button
              onClick={saveCarton}
              disabled={loading || cartonState.contents.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Carton"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Available Units */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Available Units
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {availableUnits.map(unit => (
                    <div
                      key={unit.id}
                      className="rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{unit.sku}</div>
                          <div className="text-xs text-gray-500">
                            {unit.size_code} • {unit.color}
                          </div>
                          <div className="text-xs text-gray-500">
                            {unit.order_number}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addUnitToCarton(unit)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {availableUnits.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <Package className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">No units available for packing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Carton Builder */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Carton Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Box className="mr-2 h-5 w-5" />
                      Carton Configuration
                    </span>
                    {optimization && ashleyMode && (
                      <Button
                        size="sm"
                        onClick={applyAshleyOptimization}
                        className="flex items-center"
                      >
                        <Zap className="mr-1 h-4 w-4" />
                        Apply AI Optimization
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="length">Length (cm)</Label>
                      <Input
                        id="length"
                        type="number"
                        value={cartonState.dimensions.length}
                        onChange={e =>
                          setCartonState(prev => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              length: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="width">Width (cm)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={cartonState.dimensions.width}
                        onChange={e =>
                          setCartonState(prev => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              width: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={cartonState.dimensions.height}
                        onChange={e =>
                          setCartonState(prev => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              height: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="rounded bg-gray-50 p-3">
                      <div className="text-sm font-medium text-gray-600">
                        Volume
                      </div>
                      <div className="text-lg font-bold">
                        {(
                          (cartonState.dimensions.length *
                            cartonState.dimensions.width *
                            cartonState.dimensions.height) /
                          1000
                        ).toFixed(1)}
                        L
                      </div>
                    </div>
                    <div className="rounded bg-gray-50 p-3">
                      <div className="text-sm font-medium text-gray-600">
                        Weight
                      </div>
                      <div className="text-lg font-bold">
                        {cartonState.metrics.actual_weight.toFixed(2)}kg
                      </div>
                    </div>
                    <div className="rounded bg-gray-50 p-3">
                      <div className="text-sm font-medium text-gray-600">
                        Fill
                      </div>
                      <div
                        className={`text-lg font-bold ${getEfficiencyColor(cartonState.metrics.fill_percentage)}`}
                      >
                        {cartonState.metrics.fill_percentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="rounded bg-gray-50 p-3">
                      <div className="text-sm font-medium text-gray-600">
                        Units
                      </div>
                      <div className="text-lg font-bold">
                        {cartonState.metrics.unit_count}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Carton Contents */}
              <Card>
                <CardHeader>
                  <CardTitle>Carton Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  {cartonState.contents.length > 0 ? (
                    <div className="space-y-3">
                      {cartonState.contents.map((content, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <div className="font-medium">
                              {content.unit.sku}
                            </div>
                            <div className="text-sm text-gray-500">
                              {content.unit.size_code} • {content.unit.color}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              Qty: {content.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addUnitToCarton(content.unit)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                removeUnitFromCarton(content.finished_unit_id)
                              }
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <Box className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                      <p>No units added to carton</p>
                      <p className="text-sm">
                        Add units from the available list
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ashley AI Optimization */}
              {ashleyMode && optimization && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                        <span className="text-sm font-bold text-white">AI</span>
                      </div>
                      Ashley AI Packing Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="mb-2 font-medium text-gray-900">
                            Recommended Dimensions
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>
                              Length:{" "}
                              {optimization.recommended_dimensions.length} cm
                            </div>
                            <div>
                              Width: {optimization.recommended_dimensions.width}{" "}
                              cm
                            </div>
                            <div>
                              Height:{" "}
                              {optimization.recommended_dimensions.height} cm
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 font-medium text-gray-900">
                            Efficiency Analysis
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Max Units: {optimization.max_units}</div>
                            <div>
                              Fill Efficiency: {optimization.fill_efficiency}%
                            </div>
                            <div>
                              Distribution: {optimization.weight_distribution}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="mb-2 font-medium text-gray-900">
                          Cost Analysis
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="rounded bg-blue-50 p-3">
                            <div className="font-medium text-blue-600">
                              Shipping Cost
                            </div>
                            <div className="text-lg font-bold text-blue-900">
                              ₱
                              {optimization.cost_analysis.shipping_cost.toFixed(
                                2
                              )}
                            </div>
                          </div>
                          <div className="rounded bg-green-50 p-3">
                            <div className="font-medium text-green-600">
                              Material Cost
                            </div>
                            <div className="text-lg font-bold text-green-900">
                              ₱
                              {optimization.cost_analysis.material_cost.toFixed(
                                2
                              )}
                            </div>
                          </div>
                          <div className="rounded bg-purple-50 p-3">
                            <div className="font-medium text-purple-600">
                              Total Cost
                            </div>
                            <div className="text-lg font-bold text-purple-900">
                              ₱
                              {optimization.cost_analysis.total_cost.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
