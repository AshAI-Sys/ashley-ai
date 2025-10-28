"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Upload,
  XCircle,
  AlertTriangle,
  CheckCircle, Package,
  User, Clock,
  Image,
  Save,
  RefreshCw,
} from "lucide-react";

interface DefectType {
  id: string;
  name: string;
  severity: "minor" | "major" | "critical";
  category: "stitching" | "material" | "alignment" | "measurement" | "other";
}

interface QualityReject {
  id?: string;
  run_id: string;
  bundle_id: string;
  operator_id: string;
  defect_type: string;
  defect_category: string;
  severity: "minor" | "major" | "critical";
  quantity_rejected: number;
  description: string;
  photo_urls: string[];
  corrective_action?: string;
  created_at?: string;
}

interface QualityControlInterfaceProps {
  runId: string;
  bundleId: string;
  operatorId: string;
  onRejectSubmitted?: (reject: QualityReject) => void;
  className?: string;
}

const defectTypes: DefectType[] = [
  {
    id: "1",
    name: "Uneven stitching",
    severity: "major",
    category: "stitching",
  },
  {
    id: "2",
    name: "Broken stitch",
    severity: "critical",
    category: "stitching",
  },
  { id: "3", name: "Loose thread", severity: "minor", category: "stitching" },
  {
    id: "4",
    name: "Misaligned seam",
    severity: "major",
    category: "alignment",
  },
  {
    id: "5",
    name: "Incorrect measurements",
    severity: "critical",
    category: "measurement",
  },
  { id: "6", name: "Fabric defect", severity: "major", category: "material" },
  { id: "7", name: "Color variation", severity: "minor", category: "material" },
  { id: "8", name: "Hole or tear", severity: "critical", category: "material" },
  {
    id: "9",
    name: "Wrong placement",
    severity: "major",
    category: "alignment",
  },
  {
    id: "10",
    name: "Missing component",
    severity: "critical",
    category: "other",
  },
];

export default function QualityControlInterface({
  runId,
  bundleId,
  operatorId,
  onRejectSubmitted,
  className = "",
}: QualityControlInterfaceProps) {
  const [selectedDefectType, setSelectedDefectType] = useState("");
  const [quantityRejected, setQuantityRejected] = useState("");
  const [description, setDescription] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedDefect = defectTypes.find(d => d.id === selectedDefectType);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "major":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "minor":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "stitching":
        return "ðŸ§µ";
      case "material":
        return "ðŸ§¶";
      case "alignment":
        return "ðŸ“";
      case "measurement":
        return "ðŸ“";
      case "other":
        return "âš ï¸";
      default:
        return "â“";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPhotos = Array.from(files).slice(0, 5 - photos.length); // Max 5 photos
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Failed to start camera:", error);
      alert("Camera access denied or not available");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          blob => {
            if (blob) {
              const file = new File([blob], `defect-photo-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              setPhotos(prev => [...prev, file]);
              stopCamera();
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    setShowCamera(false);
  };

  const handleSubmitReject = async () => {
    if (!selectedDefect || !quantityRejected || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const quantity = parseInt(quantityRejected);
    if (quantity <= 0) {
      alert("Quantity rejected must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("run_id", runId);
      formData.append("bundle_id", bundleId);
      formData.append("operator_id", operatorId);
      formData.append("defect_type", selectedDefect.name);
      formData.append("defect_category", selectedDefect.category);
      formData.append("severity", selectedDefect.severity);
      formData.append("quantity_rejected", quantity.toString());
      formData.append("description", description);

      if (correctiveAction.trim()) {
        formData.append("corrective_action", correctiveAction);
      }

      // Add photos
      photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      // Submit to API
      const response = await fetch(
        `/api/sewing/runs/${runId}/quality-rejects`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Create reject object for callback
        const reject: QualityReject = {
          id: result.id,
          run_id: runId,
          bundle_id: bundleId,
          operator_id: operatorId,
          defect_type: selectedDefect.name,
          defect_category: selectedDefect.category,
          severity: selectedDefect.severity,
          quantity_rejected: quantity,
          description,
          photo_urls: result.photo_urls || [],
          corrective_action: correctiveAction || undefined,
          created_at: new Date().toISOString(),
        };

        if (onRejectSubmitted) {
          onRejectSubmitted(reject);
        }

        // Reset form
        resetForm();
        alert("Quality reject submitted successfully");
      } else {
        // For demo, still call the callback
        const reject: QualityReject = {
          run_id: runId,
          bundle_id: bundleId,
          operator_id: operatorId,
          defect_type: selectedDefect.name,
          defect_category: selectedDefect.category,
          severity: selectedDefect.severity,
          quantity_rejected: quantity,
          description,
          photo_urls: [],
          corrective_action: correctiveAction || undefined,
          created_at: new Date().toISOString(),
        };

        if (onRejectSubmitted) {
          onRejectSubmitted(reject);
        }

        resetForm();
        alert("Quality reject recorded (demo mode)");
      }
    } catch (error) {
      console.error("Failed to submit quality reject:", error);
      alert("Failed to submit quality reject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDefectType("");
    setQuantityRejected("");
    setDescription("");
    setCorrectiveAction("");
    setPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <XCircle className="h-5 w-5" />
            Quality Control - Reject Report
          </CardTitle>
          <CardDescription className="text-red-700">
            Document defective pieces with detailed information and photos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Defect Type Selection */}
          <div className="space-y-3">
            <Label className="font-medium text-red-900">Defect Type *</Label>
            <Select
              value={selectedDefectType}
              onValueChange={setSelectedDefectType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select defect type" />
              </SelectTrigger>
              <SelectContent>
                {defectTypes.map(defect => (
                  <SelectItem key={defect.id} value={defect.id}>
                    <div className="flex items-center gap-3">
                      <span>{getCategoryIcon(defect.category)}</span>
                      <div>
                        <div className="font-medium">{defect.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {defect.category} â€¢ {defect.severity}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedDefect && (
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(selectedDefect.severity)}>
                  {selectedDefect.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline">{selectedDefect.category}</Badge>
              </div>
            )}
          </div>

          {/* Quantity Rejected */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium text-red-900">
                Quantity Rejected *
              </Label>
              <Input
                type="number"
                min="1"
                value={quantityRejected}
                onChange={e => setQuantityRejected(e.target.value)}
                placeholder="Number of pieces"
                className="border-red-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Estimated Impact</Label>
              <div className="rounded-md bg-red-100 p-3">
                {selectedDefect && quantityRejected ? (
                  <div className="text-sm">
                    <div className="font-medium text-red-800">
                      {selectedDefect.severity === "critical"
                        ? "ðŸš¨ Critical"
                        : selectedDefect.severity === "major"
                          ? "âš ï¸ Major"
                          : "âš¡ Minor"}{" "}
                      Impact
                    </div>
                    <div className="text-red-700">
                      {parseInt(quantityRejected)} pieces affected
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select defect type and quantity
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="font-medium text-red-900">
              Defect Description *
            </Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description of the defect, location, and severity..."
              className="min-h-20 border-red-300"
            />
          </div>

          {/* Photo Documentation */}
          <div className="space-y-3">
            <Label className="font-medium text-red-900">
              Photo Documentation
            </Label>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-red-300"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={startCamera}
                className="border-red-300"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>

              <span className="self-center text-sm text-muted-foreground">
                ({photos.length}/5 photos)
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Defect photo ${index + 1}`}
                      className="h-24 w-full rounded border object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                    >
                      Ã—
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Corrective Action */}
          <div className="space-y-2">
            <Label className="text-gray-700">
              Corrective Action (Optional)
            </Label>
            <Textarea
              value={correctiveAction}
              onChange={e => setCorrectiveAction(e.target.value)}
              placeholder="Suggested corrective actions or preventive measures..."
              className="min-h-16"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 border-t pt-4">
            <Button
              onClick={handleSubmitReject}
              disabled={
                isSubmitting ||
                !selectedDefect ||
                !quantityRejected ||
                !description.trim()
              }
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Quality Reject"}
            </Button>

            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-full max-w-md rounded-lg bg-white p-4">
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold">
                Capture Defect Photo
              </h3>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Quality Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Quality Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="rounded-lg bg-yellow-50 p-3">
              <div className="mb-2 font-medium text-yellow-800">
                âš¡ Minor Defects
              </div>
              <ul className="space-y-1 text-yellow-700">
                <li>â€¢ Loose threads</li>
                <li>â€¢ Minor color variations</li>
                <li>â€¢ Small measurement deviations</li>
              </ul>
            </div>

            <div className="rounded-lg bg-orange-50 p-3">
              <div className="mb-2 font-medium text-orange-800">
                âš ï¸ Major Defects
              </div>
              <ul className="space-y-1 text-orange-700">
                <li>â€¢ Uneven stitching</li>
                <li>â€¢ Misaligned seams</li>
                <li>â€¢ Fabric defects</li>
              </ul>
            </div>

            <div className="rounded-lg bg-red-50 p-3">
              <div className="mb-2 font-medium text-red-800">
                ðŸš¨ Critical Defects
              </div>
              <ul className="space-y-1 text-red-700">
                <li>â€¢ Broken stitches</li>
                <li>â€¢ Holes or tears</li>
                <li>â€¢ Missing components</li>
              </ul>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Remember:</strong> Always document defects with clear
              photos showing the issue. Include suggested corrective actions to
              help prevent similar issues in the future.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

// Export types
export type { DefectType, QualityReject, QualityControlInterfaceProps };
