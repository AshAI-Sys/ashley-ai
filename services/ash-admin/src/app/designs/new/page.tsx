"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Minus,
  Upload,
  Save,
  AlertCircle,
  FileImage,
  File,
  X,
  CheckCircle,
  Clock,
  Eye,
  Zap,
} from "lucide-react";
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

interface FileUpload {
  file: File | null;
  url: string;
  uploaded: boolean;
  uploading: boolean;
  error: string | null;
  type: "mockup" | "production" | "separation" | "embroidery";
}

interface DesignForm {
  order_id: string;
  name: string;
  method: string;
  files: {
    mockups: FileUpload[];
    production: FileUpload[];
    separations: FileUpload[];
    embroidery: FileUpload[];
  };
  placements: Placement[];
  palette: string[];
  meta: {
    dpi: number;
    notes: string;
    color_count: number;
  };
}

export default function NewDesignPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<DesignForm>({
    order_id: "",
    name: "",
    method: "",
    files: {
      mockups: [],
      production: [],
      separations: [],
      embroidery: [],
    },
    placements: [
      {
        id: "1",
        area: "front",
        width_cm: 20,
        height_cm: 25,
        offset_x: 0,
        offset_y: 5,
      },
    ],
    palette: [],
    meta: {
      dpi: 300,
      notes: "",
      color_count: 1,
    },
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/orders?include=brand,client&status=INTAKE,DESIGN_PENDING"
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = orders?.find(o => o.id === formData.order_id);

  // Auto-populate brand when order is selected
  useEffect(() => {
    if (selectedOrder && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: `${selectedOrder.brand.name} - ${selectedOrder.order_number}`,
      }));
    }
  }, [selectedOrder, formData.name]);

  // File upload handling
  const handleFileUpload = useCallback(
    async (file: File, type: keyof DesignForm["files"], index?: number) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const fileUpload: FileUpload = {
        file,
        url: "",
        uploaded: false,
        uploading: true,
        error: null,
        type:
          type === "mockups"
            ? "mockup"
            : type === "production"
              ? "production"
              : type === "separations"
                ? "separation"
                : "embroidery",
      };

      // Update state to show uploading
      setFormData(prev => {
        const newFiles = [...prev.files[type]];
        if (index !== undefined) {
          newFiles[index] = fileUpload;
        } else {
          newFiles.push(fileUpload);
        }
        return {
          ...prev,
          files: { ...prev.files, [type]: newFiles },
        };
      });

      try {
        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          // Update with successful upload
          setFormData(prev => {
            const newFiles = [...prev.files[type]];
            const targetIndex =
              index !== undefined ? index : newFiles.length - 1;
            newFiles[targetIndex] = {
              ...fileUpload,
              url: result.url,
              uploaded: true,
              uploading: false,
            };
            return {
              ...prev,
              files: { ...prev.files, [type]: newFiles },
            };
          });
          toast.success("File uploaded successfully");
        } else {
          throw new Error(result.message || "Upload failed");
        }
      } catch (error) {
        // Update with error
        setFormData(prev => {
          const newFiles = [...prev.files[type]];
          const targetIndex = index !== undefined ? index : newFiles.length - 1;
          newFiles[targetIndex] = {
            ...fileUpload,
            uploading: false,
            error: error instanceof Error ? error.message : "Upload failed",
          };
          return {
            ...prev,
            files: { ...prev.files, [type]: newFiles },
          };
        });
        toast.error("Failed to upload file");
      }
    },
    []
  );

  // Drag and drop handlers
  const handleDrop = useCallback(
    (e: React.DragEvent, type: keyof DesignForm["files"]) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);

      files.forEach(file => {
        // Validate file type
        const validTypes = {
          mockups: ["image/png", "image/jpeg", "image/jpg"],
          production: ["application/pdf", "image/png", "image/jpeg"],
          separations: ["image/png", "image/jpeg", "application/pdf"],
          embroidery: ["application/octet-stream"], // .dst, .emb files
        };

        if (
          validTypes[type].includes(file.type) ||
          (type === "embroidery" &&
            (file.name.endsWith(".dst") || file.name.endsWith(".emb")))
        ) {
          handleFileUpload(file, type);
        } else {
          toast.error(`Invalid file type for ${type}`);
        }
      });
    },
    [handleFileUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Placement management
  const addPlacement = () => {
    const newId = (formData.placements.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      placements: [
        ...prev.placements,
        {
          id: newId,
          area: "front",
          width_cm: 20,
          height_cm: 25,
          offset_x: 0,
          offset_y: 5,
        },
      ],
    }));
  };

  const removePlacement = (id: string) => {
    if (formData.placements.length > 1) {
      setFormData(prev => ({
        ...prev,
        placements: prev.placements.filter(p => p.id !== id),
      }));
    }
  };

  const updatePlacement = (id: string, field: keyof Placement, value: any) => {
    setFormData(prev => ({
      ...prev,
      placements: prev.placements.map(placement =>
        placement.id === id ? { ...placement, [field]: value } : placement
      ),
    }));
  };

  // Color management
  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      palette: [...prev.palette, "#000000"],
    }));
  };

  const updateColor = (index: number, color: string) => {
    setFormData(prev => ({
      ...prev,
      palette: prev.palette.map((c, i) => (i === index ? color : c)),
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      palette: prev.palette.filter((_, i) => i !== index),
    }));
  };

  // Remove file
  const removeFile = (type: keyof DesignForm["files"], index: number) => {
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [type]: prev.files[type].filter((_, i) => i !== index),
      },
    }));
  };

  // Ashley AI Validation
  const runAshleyValidation = async () => {
    if (!formData.order_id || !formData.method) {
      toast.error("Please select order and print method first");
      return;
    }

    setValidating(true);
    try {
      const response = await fetch("/api/ashley/validate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: formData.order_id,
          method: formData.method,
          placements: formData.placements,
          files: formData.files,
          color_count: formData.meta.color_count,
        }),
      });

      const result = await response.json();
      setValidationResult(result);

      if (result.status === "PASS") {
        toast.success("Design validation passed!");
      } else if (result.status === "WARN") {
        toast.warning(
          `Design validation passed with warnings: ${result.issues?.length || 0} issues found`
        );
      } else {
        toast.error(
          `Design validation failed: ${result.issues?.length || 0} critical issues found`
        );
      }
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Ashley AI validation failed");
    } finally {
      setValidating(false);
    }
  };

  // Form validation
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

    const hasFiles = Object.values(formData.files).some(
      fileArray => fileArray.length > 0 && fileArray.some(f => f.uploaded)
    );

    if (!hasFiles) {
      toast.error("Please upload at least one design file");
      return false;
    }

    return true;
  };

  // Form submission
  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const designData = {
        order_id: formData.order_id,
        name: formData.name,
        method: formData.method,
        files: {
          mockup_url: formData.files.mockups.find(f => f.uploaded)?.url || "",
          prod_url: formData.files.production.find(f => f.uploaded)?.url || "",
          separations: formData.files.separations
            .filter(f => f.uploaded)
            .map(f => f.url),
          dst_url: formData.files.embroidery.find(f => f.uploaded)?.url || "",
        },
        placements: formData.placements.map(
          ({ id, ...placement }) => placement
        ),
        palette: formData.palette.length > 0 ? formData.palette : undefined,
        meta: formData.meta,
        status: isDraft ? "DRAFT" : "PENDING_APPROVAL",
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

  const DropZone = ({
    type,
    children,
  }: {
    type: keyof DesignForm["files"];
    children: React.ReactNode;
  }) => (
    <div
      className="rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-400"
      onDrop={e => handleDrop(e, type)}
      onDragOver={handleDragOver}
    >
      {children}
    </div>
  );

  const FileList = ({
    type,
    title,
  }: {
    type: keyof DesignForm["files"];
    title: string;
  }) => (
    <div>
      <Label className="text-sm font-medium">{title}</Label>
      <DropZone type={type}>
        <div className="text-center">
          <FileImage className="mx-auto mb-2 h-8 w-8 text-gray-500" />
          <p className="text-sm text-gray-600">
            Drop files here or click to browse
          </p>
          <input
            type="file"
            className="hidden"
            multiple={type === "separations"}
            accept={
              type === "mockups"
                ? "image/*"
                : type === "production"
                  ? "image/*,.pdf,.ai"
                  : type === "separations"
                    ? "image/*,.pdf"
                    : ".dst,.emb"
            }
            onChange={e => {
              const files = Array.from(e.target.files || []);
              files.forEach(file => handleFileUpload(file, type));
            }}
          />
        </div>
      </DropZone>

      {formData.files[type].length > 0 && (
        <div className="mt-3 space-y-2">
          {formData.files[type].map((fileUpload, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded bg-gray-50 p-2"
            >
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="text-sm">
                  {fileUpload.file?.name || "Unknown file"}
                </span>
                {fileUpload.uploading && (
                  <Clock className="h-4 w-4 animate-spin text-blue-500" />
                )}
                {fileUpload.uploaded && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {fileUpload.error && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(type, index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload New Design</h1>
        <p className="text-muted-foreground">
          Create a new design asset with comprehensive file management and
          validation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Design Information</CardTitle>
              <CardDescription>
                Link this design to a Purchase Order and provide basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="order">Purchase Order (PO) *</Label>
                <Select
                  value={formData.order_id}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, order_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purchase order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders?.map(order => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_number} - {order.client.name} (
                        {order.brand.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOrder && (
                  <div className="mt-2 rounded bg-blue-50 p-2 text-sm">
                    <strong>Brand:</strong> {selectedOrder.brand.name} (
                    {selectedOrder.brand.code})<br />
                    <strong>Client:</strong> {selectedOrder.client.name}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="name">Design Name *</Label>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Summer Collection Logo v1.0"
                />
              </div>

              <div>
                <Label htmlFor="method">Print Method *</Label>
                <Select
                  value={formData.method}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select print method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SILKSCREEN">Silkscreen</SelectItem>
                    <SelectItem value="SUBLIMATION">Sublimation</SelectItem>
                    <SelectItem value="DTF">DTF (Direct to Film)</SelectItem>
                    <SelectItem value="EMBROIDERY">Embroidery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>DPI/Resolution</Label>
                  <Input
                    type="number"
                    value={formData.meta.dpi}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        meta: {
                          ...prev.meta,
                          dpi: parseInt(e.target.value) || 300,
                        },
                      }))
                    }
                    min="72"
                    max="600"
                  />
                </div>
                <div>
                  <Label>Color Count</Label>
                  <Input
                    type="number"
                    value={formData.meta.color_count}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        meta: {
                          ...prev.meta,
                          color_count: parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                    min="1"
                    max="12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload System */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Design Files</CardTitle>
                  <CardDescription>
                    Upload design files with drag & drop support
                  </CardDescription>
                </div>
                <Button
                  onClick={runAshleyValidation}
                  disabled={validating || !formData.method}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {validating ? "Validating..." : "Ashley AI Check"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FileList type="mockups" title="Mockup Files (PNG/JPG)" />
                <FileList
                  type="production"
                  title="Production Files (AI/PDF/PNG)"
                />
              </div>

              {formData.method === "SILKSCREEN" && (
                <FileList type="separations" title="Separations (per color)" />
              )}

              {formData.method === "EMBROIDERY" && (
                <FileList
                  type="embroidery"
                  title="Embroidery Files (DST/EMB)"
                />
              )}

              {validationResult && (
                <div
                  className={`rounded-lg p-4 ${
                    validationResult.status === "PASS"
                      ? "border border-green-200 bg-green-50"
                      : validationResult.status === "WARN"
                        ? "border border-yellow-200 bg-yellow-50"
                        : "border border-red-200 bg-red-50"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {validationResult.status === "PASS" && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {validationResult.status === "WARN" && (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    {validationResult.status === "FAIL" && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <h4 className="font-medium">Ashley AI Validation Result</h4>
                  </div>
                  {validationResult.issues &&
                    validationResult.issues.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {validationResult.issues.map(
                          (issue: any, index: number) => (
                            <li key={index}>• {issue.message}</li>
                          )
                        )}
                      </ul>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Placements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Design Placements</CardTitle>
                  <CardDescription>
                    Specify placement areas, sizes, and positions
                  </CardDescription>
                </div>
                <Button onClick={addPlacement} size="sm" variant="outline">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Placement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.placements.map((placement, index) => (
                <div
                  key={placement.id}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Placement {index + 1}</h4>
                    {formData.placements.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePlacement(placement.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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

          {/* Color Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Color Palette</CardTitle>
                  <CardDescription>
                    Define color specifications and Pantone codes
                  </CardDescription>
                </div>
                <Button onClick={addColor} size="sm" variant="outline">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Color
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {formData.palette.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded border p-2"
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={e => updateColor(index, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-gray-300"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={e => updateColor(index, e.target.value)}
                      className="flex-1 text-xs"
                      placeholder="#000000"
                    />
                    <Button
                      type="button"
                      onClick={() => removeColor(index)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.meta.notes}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    meta: { ...prev.meta, notes: e.target.value },
                  }))
                }
                placeholder="Any special instructions, requirements, or notes about this design..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Preview */}
          {formData.files.mockups.find(f => f.uploaded) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={formData.files.mockups.find(f => f.uploaded)?.url || ""}
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
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                {submitting ? "Creating Design..." : "Create Design"}
              </Button>

              <div className="pt-2 text-xs text-muted-foreground">
                <p>• Draft: Save for later editing</p>
                <p>• Create: Ready for approval workflow</p>
              </div>
            </CardContent>
          </Card>

          {/* Method Guidelines */}
          {formData.method && (
            <Card>
              <CardHeader>
                <CardTitle>Print Method Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {formData.method === "SILKSCREEN" && (
                  <div>
                    <p className="mb-2 font-medium">Silkscreen Requirements:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Provide color separations for each ink</li>
                      <li>Maximum 6 colors recommended</li>
                      <li>Use vector files when possible</li>
                      <li>Consider ink opacity and blending</li>
                      <li>300 DPI minimum resolution</li>
                    </ul>
                  </div>
                )}

                {formData.method === "SUBLIMATION" && (
                  <div>
                    <p className="mb-2 font-medium">
                      Sublimation Requirements:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Works best on polyester fabrics</li>
                      <li>Full color designs supported</li>
                      <li>300+ DPI required</li>
                      <li>Colors may appear lighter on fabric</li>
                      <li>CMYK color mode preferred</li>
                    </ul>
                  </div>
                )}

                {formData.method === "DTF" && (
                  <div>
                    <p className="mb-2 font-medium">DTF Requirements:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Works on most fabric types</li>
                      <li>PNG with transparent background</li>
                      <li>White ink layer automatically added</li>
                      <li>300 DPI minimum resolution</li>
                      <li>Consider stretch and durability</li>
                    </ul>
                  </div>
                )}

                {formData.method === "EMBROIDERY" && (
                  <div>
                    <p className="mb-2 font-medium">Embroidery Requirements:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Digitized file (.dst/.emb) required</li>
                      <li>Stitch count affects cost</li>
                      <li>Limited fine detail capability</li>
                      <li>Thread color chart needed</li>
                      <li>Consider fabric type and weight</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upload Progress */}
          {Object.values(formData.files)
            .flat()
            .some(f => f.uploading) && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(formData.files).map(([type, files]) =>
                    files
                      .filter(f => f.uploading)
                      .map((file, index) => (
                        <div key={`${type}-${index}`} className="text-sm">
                          <div className="mb-1 flex justify-between">
                            <span>{file.file?.name}</span>
                            <span>Uploading...</span>
                          </div>
                          <Progress value={50} className="h-2" />
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
