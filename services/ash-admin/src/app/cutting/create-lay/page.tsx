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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  order_number: string;
  brand: {
    name: string;
    code: string;
  };
  line_items: Array<{
    description: string;
    garment_type: string;
    size_breakdown: string;
  }>;
}

interface SizeOutput {
  size_code: string;
  qty: number;
}

export default function CreateLayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    order_id: "",
    marker_name: "",
    marker_width_cm: "",
    lay_length_m: "",
    plies: "",
    gross_used: "",
    offcuts: "",
    defects: "",
    uom: "KG",
  });

  const [outputs, setOutputs] = useState<SizeOutput[]>([
    { size_code: "S", qty: 0 },
    { size_code: "M", qty: 0 },
    { size_code: "L", qty: 0 },
    { size_code: "XL", qty: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculations, setCalculations] = useState({
    expectedPieces: 0,
    totalCut: 0,
    efficiency: 0,
    waste: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [formData, outputs]);

  const fetchOrders = async () => {
    try {
      // Mock data for demo - in real app, fetch from API
      setOrders([
        {
          id: "1",
          order_number: "TCAS-2025-000001",
          brand: { name: "Trendy Casual", code: "TCAS" },
          line_items: [
            {
              description: "Premium Hoodie",
              garment_type: "Hoodie",
              size_breakdown: '{"S":30,"M":60,"L":60,"XL":30}',
            },
          ],
        },
        {
          id: "2",
          order_number: "URBN-2025-000001",
          brand: { name: "Urban Streetwear", code: "URBN" },
          line_items: [
            {
              description: "Street T-Shirt",
              garment_type: "T-Shirt",
              size_breakdown: '{"S":25,"M":50,"L":50,"XL":25}',
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const calculateMetrics = () => {
    const width = parseFloat(formData.marker_width_cm) || 0;
    const length = parseFloat(formData.lay_length_m) || 0;
    const plies = parseInt(formData.plies) || 0;
    const grossUsed = parseFloat(formData.gross_used) || 0;
    const offcuts = parseFloat(formData.offcuts) || 0;
    const defects = parseFloat(formData.defects) || 0;

    const totalCut = outputs.reduce((sum, output) => sum + output.qty, 0);

    // Rough calculation - in real app, use pattern areas
    const expectedPieces =
      width && length && plies
        ? Math.floor((width * length * plies) / 2500)
        : 0; // 2500 cm² per piece estimate

    const efficiency =
      grossUsed > 0
        ? Math.round(((grossUsed - offcuts - defects) / grossUsed) * 100)
        : 0;
    const waste =
      grossUsed > 0 ? Math.round(((offcuts + defects) / grossUsed) * 100) : 0;

    setCalculations({
      expectedPieces,
      totalCut,
      efficiency,
      waste,
    });
  };

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setSelectedOrder(order || null);
    setFormData({ ...formData, order_id: orderId });

    if (order && order.line_items[0]?.size_breakdown) {
      try {
        const sizeBreakdown = JSON.parse(order.line_items[0].size_breakdown);
        const newOutputs = Object.entries(sizeBreakdown).map(([size, qty]) => ({
          size_code: size,
          qty: 0, // Start with 0, user will fill in actual cut quantities
        }));
        setOutputs(newOutputs);
      } catch (e) {
        // Fallback to default sizes if parsing fails
      }
    }
  };

  const handleOutputChange = (
    index: number,
    field: keyof SizeOutput,
    value: string | number
  ) => {
    const newOutputs = [...outputs];
    newOutputs[index] = { ...newOutputs[index], [field]: value } as SizeOutput;
    setOutputs(newOutputs);
  };

  const addOutput = () => {
    setOutputs([...outputs, { size_code: "", qty: 0 }]);
  };

  const removeOutput = (index: number) => {
    if (outputs.length > 1) {
      setOutputs(outputs.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.order_id) newErrors.order_id = "Please select an order";
    if (!formData.lay_length_m)
      newErrors.lay_length_m = "Lay length is required";
    if (!formData.plies) newErrors.plies = "Number of plies is required";
    if (!formData.gross_used)
      newErrors.gross_used = "Gross fabric used is required";

    const totalCut = outputs.reduce((sum, output) => sum + output.qty, 0);
    if (totalCut === 0)
      newErrors.outputs = "At least one size output is required";

    // Validate each output
    outputs.forEach((output, index) => {
      if (!output.size_code.trim()) {
        newErrors[`output_${index}_size`] = "Size code is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        marker_width_cm: formData.marker_width_cm
          ? parseInt(formData.marker_width_cm)
          : null,
        lay_length_m: parseFloat(formData.lay_length_m),
        plies: parseInt(formData.plies),
        gross_used: parseFloat(formData.gross_used),
        offcuts: formData.offcuts ? parseFloat(formData.offcuts) : 0,
        defects: formData.defects ? parseFloat(formData.defects) : 0,
        outputs: outputs.filter(o => o.size_code && o.qty > 0),
      };

      const response = await fetch("/api/cutting/lays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const ___result = await response.json();
        router.push("/cutting");
      } else {
        const error = await response.json();
        console.error("Failed to create lay:", error);
        setErrors({ submit: error.error || "Failed to create lay" });
      }
    } catch (error) {
      console.error("Error creating lay:", error);
      setErrors({ submit: "Network error - please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/cutting">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cutting
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Cut Lay</h1>
          <p className="text-muted-foreground">
            Record lay dimensions and piece outputs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>
              Select the production order for this lay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order">Production Order</Label>
              <Select
                value={formData.order_id}
                onValueChange={handleOrderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.order_id && (
                <p className="text-sm text-red-600">{errors.order_id}</p>
              )}
            </div>

            {selectedOrder && (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge>{selectedOrder.brand.code}</Badge>
                  <span className="font-medium">
                    {selectedOrder.order_number}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.line_items[0]?.description} (
                  {selectedOrder.line_items[0]?.garment_type})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lay Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Lay Setup</CardTitle>
            <CardDescription>
              Configure marker and lay parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="marker_name">Marker Name (optional)</Label>
                <Input
                  id="marker_name"
                  value={formData.marker_name}
                  onChange={e =>
                    setFormData({ ...formData, marker_name: e.target.value })
                  }
                  placeholder="e.g., Hoodie Marker V2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marker_width_cm">
                  Marker Width (cm, optional)
                </Label>
                <Input
                  id="marker_width_cm"
                  type="number"
                  value={formData.marker_width_cm}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      marker_width_cm: e.target.value,
                    })
                  }
                  placeholder="160"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="lay_length_m">Lay Length (meters) *</Label>
                <Input
                  id="lay_length_m"
                  type="number"
                  step="0.1"
                  value={formData.lay_length_m}
                  onChange={e =>
                    setFormData({ ...formData, lay_length_m: e.target.value })
                  }
                  placeholder="25.5"
                  required
                />
                {errors.lay_length_m && (
                  <p className="text-sm text-red-600">{errors.lay_length_m}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plies">Number of Plies *</Label>
                <Input
                  id="plies"
                  type="number"
                  value={formData.plies}
                  onChange={e =>
                    setFormData({ ...formData, plies: e.target.value })
                  }
                  placeholder="12"
                  required
                />
                {errors.plies && (
                  <p className="text-sm text-red-600">{errors.plies}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uom">Unit of Measure</Label>
                <Select
                  value={formData.uom}
                  onValueChange={value =>
                    setFormData({ ...formData, uom: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">Kilograms (KG)</SelectItem>
                    <SelectItem value="M">Meters (M)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fabric Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Fabric Usage</CardTitle>
            <CardDescription>
              Record fabric consumption and waste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="gross_used">
                  Gross Used ({formData.uom}) *
                </Label>
                <Input
                  id="gross_used"
                  type="number"
                  step="0.01"
                  value={formData.gross_used}
                  onChange={e =>
                    setFormData({ ...formData, gross_used: e.target.value })
                  }
                  placeholder="18.2"
                  required
                />
                {errors.gross_used && (
                  <p className="text-sm text-red-600">{errors.gross_used}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="offcuts">Offcuts ({formData.uom})</Label>
                <Input
                  id="offcuts"
                  type="number"
                  step="0.01"
                  value={formData.offcuts}
                  onChange={e =>
                    setFormData({ ...formData, offcuts: e.target.value })
                  }
                  placeholder="0.8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defects">Defects ({formData.uom})</Label>
                <Input
                  id="defects"
                  type="number"
                  step="0.01"
                  value={formData.defects}
                  onChange={e =>
                    setFormData({ ...formData, defects: e.target.value })
                  }
                  placeholder="0.2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Size Outputs */}
        <Card>
          <CardHeader>
            <CardTitle>Piece Outputs by Size</CardTitle>
            <CardDescription>
              Record actual pieces cut for each size
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {outputs.map((output, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`size_${index}`}>Size Code</Label>
                  <Input
                    id={`size_${index}`}
                    value={output.size_code}
                    onChange={e =>
                      handleOutputChange(index, "size_code", e.target.value)
                    }
                    placeholder="M"
                    required
                  />
                  {errors[`output_${index}_size`] && (
                    <p className="text-sm text-red-600">
                      {errors[`output_${index}_size`]}
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor={`qty_${index}`}>Quantity</Label>
                  <Input
                    id={`qty_${index}`}
                    type="number"
                    value={output.qty}
                    onChange={e =>
                      handleOutputChange(
                        index,
                        "qty",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="48"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOutput(index)}
                  disabled={outputs.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addOutput}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Size
            </Button>

            {errors.outputs && (
              <p className="text-sm text-red-600">{errors.outputs}</p>
            )}
          </CardContent>
        </Card>

        {/* Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Lay Calculations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {calculations.totalCut}
                </p>
                <p className="text-sm text-muted-foreground">Total Cut</p>
              </div>

              <div
                className={`rounded-lg p-3 text-center ${
                  calculations.efficiency >= 78 ? "bg-green-50" : "bg-orange-50"
                }`}
              >
                <p
                  className={`text-2xl font-bold ${
                    calculations.efficiency >= 78
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {calculations.efficiency}%
                </p>
                <p className="text-sm text-muted-foreground">Efficiency</p>
              </div>

              <div
                className={`rounded-lg p-3 text-center ${
                  calculations.waste <= 8 ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <p
                  className={`text-2xl font-bold ${
                    calculations.waste <= 8 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {calculations.waste}%
                </p>
                <p className="text-sm text-muted-foreground">Waste</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {calculations.expectedPieces}
                </p>
                <p className="text-sm text-muted-foreground">Est. Pieces</p>
              </div>
            </div>

            {calculations.efficiency < 78 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    Low Efficiency Warning
                  </p>
                  <p className="text-sm text-orange-700">
                    Efficiency is below 78% threshold. Consider checking marker
                    placement or fabric relaxation.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/cutting">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Lay"}
          </Button>
        </div>

        {errors.submit && (
          <p className="text-center text-sm text-red-600">{errors.submit}</p>
        )}
      </form>
    </div>
  );
}
