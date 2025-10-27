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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Upload, Save, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  order_number: string;
  status: string;
  brand: {
    id: string;
    name: string;
    code: string;
  };
  client: {
    id: string;
    name: string;
  };
}

interface Placement {
  id: string;
  area: string;
  width_cm: number;
  height_cm: number;
  offset_x: number;
  offset_y: number;
}

export default function DesignUploadPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    order_id: "",
    name: "",
    method: "",
    files: {
      mockup_url: "",
      prod_url: "",
      separations: [] as string[],
      dst_url: "",
    },
    palette: [] as string[],
    meta: {
      dpi: 300,
      notes: "",
    },
  });

  const [placements, setPlacements] = useState<Placement[]>([
    {
      id: "1",
      area: "front",
      width_cm: 20,
      height_cm: 25,
      offset_x: 0,
      offset_y: 5,
    },
  ]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        "/api/orders?include=brand,client&status=INTAKE,DESIGN_PENDING"
      );
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const selectedOrder = orders.find(o => o.id === formData.order_id);

  const addPlacement = () => {
    const newId = (placements.length + 1).toString();
    setPlacements([
      ...placements,
      {
        id: newId,
        area: "front",
        width_cm: 20,
        height_cm: 25,
        offset_x: 0,
        offset_y: 5,
      },
    ]);
  };

  const removePlacement = (id: string) => {
    if (placements.length > 1) {
      setPlacements(placements.filter(p => p.id !== id));
    }
  };

  const updatePlacement = (id: string, field: keyof Placement, value: any) => {
    setPlacements(
      placements.map(placement =>
        placement.id === id ? { ...placement, [field]: value } : placement
      )
    );
  };

  const addSeparation = () => {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        separations: [...formData.files.separations, ""],
      },
    });
  };

  const updateSeparation = (index: number, value: string) => {
    const newSeparations = [...formData.files.separations];
    newSeparations[index] = value;
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        separations: newSeparations,
      },
    });
  };

  const removeSeparation = (index: number) => {
    setFormData({
      ...formData,
      files: {
        ...formData.files,
        separations: formData.files.separations.filter((_, i) => i !== index),
      },
    });
  };

  const addColor = () => {
    setFormData({
      ...formData,
      palette: [...formData.palette, "#000000"],
    });
  };

  const updateColor = (index: number, color: string) => {
    const newPalette = [...formData.palette];
    newPalette[index] = color;
    setFormData({
      ...formData,
      palette: newPalette,
    });
  };

  const removeColor = (index: number) => {
    setFormData({
      ...formData,
      palette: formData.palette.filter((_, i) => i !== index),
    });
  };

  const validateForm = () => {
    if (!formData.order_id) {
      toast.error("Please select an order");
      return false;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a design name");
      return false;
    }

    if (!formData.method) {
      toast.error("Please select a printing method");
      return false;
    }

    if (!formData.files.mockup_url && !formData.files.prod_url) {
      toast.error("Please provide at least a mockup or production file");
      return false;
    }

    return true;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const designData = {
        ...formData,
        placements: placements.map(({ id, ...placement }) => placement),
        palette: formData.palette.length > 0 ? formData.palette : undefined,
      };

      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Design ${isDraft ? "saved as draft" : "uploaded successfully"}`
        );
        router.push(`/designs/${result.asset_id}`);
      } else {
        toast.error(result.message || "Failed to upload design");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to upload design");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload Design</h1>
        <p className="text-muted-foreground">
          Create a new design asset with files and specifications
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Link this design to an order and provide basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="order">Order *</Label>
                <Select
                  value={formData.order_id}
                  onValueChange={value =>
                    setFormData({ ...formData, order_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(order => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_number} - {order.client.name} (
                        {order.brand.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOrder && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Brand: {selectedOrder.brand.name} (
                    {selectedOrder.brand.code})
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="name">Design Name *</Label>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Summer Collection Logo"
                />
              </div>

              <div>
                <Label htmlFor="method">Printing Method *</Label>
                <Select
                  value={formData.method}
                  onValueChange={value =>
                    setFormData({ ...formData, method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SILKSCREEN">Silkscreen</SelectItem>
                    <SelectItem value="SUBLIMATION">Sublimation</SelectItem>
                    <SelectItem value="DTF">DTF (Direct to Film)</SelectItem>
                    <SelectItem value="EMBROIDERY">Embroidery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Design Files */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Design Files</CardTitle>
                  <CardDescription>
                    Upload or link to your design files
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mockup File (Preview)</Label>
                <Input
                  type="url"
                  value={formData.files.mockup_url}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      files: { ...formData.files, mockup_url: e.target.value },
                    })
                  }
                  placeholder="https://example.com/mockup.jpg"
                />
              </div>

              <div>
                <Label>Production File</Label>
                <Input
                  type="url"
                  value={formData.files.prod_url}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      files: { ...formData.files, prod_url: e.target.value },
                    })
                  }
                  placeholder="https://example.com/design.ai"
                />
              </div>

              {formData.method === "SILKSCREEN" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Color Separations</Label>
                    <Button
                      type="button"
                      onClick={addSeparation}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.files.separations.map((separation, index) => (
                    <div key={index} className="mb-2 flex gap-2">
                      <Input
                        type="url"
                        value={separation}
                        onChange={e => updateSeparation(index, e.target.value)}
                        placeholder={`Color ${index + 1} separation URL`}
                      />
                      <Button
                        type="button"
                        onClick={() => removeSeparation(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {formData.method === "EMBROIDERY" && (
                <div>
                  <Label>Embroidery File (.dst, .emb)</Label>
                  <Input
                    type="url"
                    value={formData.files.dst_url}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        files: { ...formData.files, dst_url: e.target.value },
                      })
                    }
                    placeholder="https://example.com/design.dst"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Placements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Design Placements</CardTitle>
                  <CardDescription>
                    Specify where and how the design will be placed
                  </CardDescription>
                </div>
                <Button onClick={addPlacement} size="sm" variant="outline">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Placement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {placements.map((placement, index) => (
                <div
                  key={placement.id}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Placement {index + 1}</h4>
                    {placements.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePlacement(placement.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div>
                      <Label>Area</Label>
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
                          <SelectItem value="front">Front</SelectItem>
                          <SelectItem value="back">Back</SelectItem>
                          <SelectItem value="left_chest">Left Chest</SelectItem>
                          <SelectItem value="sleeve">Sleeve</SelectItem>
                          <SelectItem value="all_over">All Over</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Width (cm)</Label>
                      <Input
                        type="number"
                        value={placement.width_cm}
                        onChange={e =>
                          updatePlacement(
                            placement.id,
                            "width_cm",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.1"
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
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <Label>Offset X (cm)</Label>
                      <Input
                        type="number"
                        value={placement.offset_x}
                        onChange={e =>
                          updatePlacement(
                            placement.id,
                            "offset_x",
                            parseFloat(e.target.value) || 0
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
                            parseFloat(e.target.value) || 0
                          )
                        }
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Color Palette</Label>
                  <Button
                    type="button"
                    onClick={addColor}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.palette.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={e => updateColor(index, e.target.value)}
                        className="h-8 w-8 rounded border border-gray-300"
                      />
                      <Input
                        type="text"
                        value={color}
                        onChange={e => updateColor(index, e.target.value)}
                        className="w-20 text-xs"
                      />
                      <Button
                        type="button"
                        onClick={() => removeColor(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>DPI/Resolution</Label>
                <Input
                  type="number"
                  value={formData.meta.dpi}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      meta: {
                        ...formData.meta,
                        dpi: parseInt(e.target.value) || 300,
                      },
                    })
                  }
                  min="72"
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.meta.notes}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      meta: { ...formData.meta, notes: e.target.value },
                    })
                  }
                  placeholder="Any special instructions or notes about this design..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Preview */}
          {formData.files.mockup_url && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={formData.files.mockup_url}
                  alt="Design preview"
                  className="w-full rounded-lg"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Button
                onClick={() => handleSubmit(true)}
                variant="outline"
                className="w-full"
                disabled={submitting}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>

              <Button
                onClick={() => handleSubmit(false)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Design
              </Button>
            </CardContent>
          </Card>

          {/* Method Information */}
          {formData.method && (
            <Card>
              <CardHeader>
                <CardTitle>Method Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {formData.method === "SILKSCREEN" && (
                  <div>
                    <p className="mb-2">For silkscreen printing:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Provide color separations for each ink color</li>
                      <li>Maximum 6 colors recommended</li>
                      <li>Use vector files when possible</li>
                      <li>Consider ink opacity and blending</li>
                    </ul>
                  </div>
                )}

                {formData.method === "SUBLIMATION" && (
                  <div>
                    <p className="mb-2">For sublimation printing:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Works best on polyester fabrics</li>
                      <li>Full color designs are supported</li>
                      <li>High resolution required (300+ DPI)</li>
                      <li>Colors may appear lighter on final product</li>
                    </ul>
                  </div>
                )}

                {formData.method === "DTF" && (
                  <div>
                    <p className="mb-2">For DTF printing:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Works on most fabric types</li>
                      <li>Full color support with white ink</li>
                      <li>PNG with transparent background preferred</li>
                      <li>Consider stretch and durability</li>
                    </ul>
                  </div>
                )}

                {formData.method === "EMBROIDERY" && (
                  <div>
                    <p className="mb-2">For embroidery:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Provide digitized embroidery file (.dst)</li>
                      <li>Consider stitch count for cost</li>
                      <li>Limited fine detail capability</li>
                      <li>Thread color chart reference needed</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
