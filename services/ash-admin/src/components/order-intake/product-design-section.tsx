"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Unused import removed: Input
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  FileImage,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface DesignFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  preview?: string;
  uploadProgress?: number;
  uploaded?: boolean;
  ashleyValidation?: {
    feasible: boolean;
    confidence: number;
    suggestions: string[];
    warnings: string[];
  };
}

interface ProductDesignSectionProps {
  garmentType: string;
  printingMethod: string;
  designFiles: DesignFile[];
  onGarmentTypeChange: (type: string) => void;
  onPrintingMethodChange: (method: string) => void;
  onDesignFilesChange: (
    files: DesignFile[] | ((prevFiles: DesignFile[]) => DesignFile[])
  ) => void;
}

const GARMENT_TYPES = [
  { value: "t-shirt", label: "👕 T-Shirt", icon: "👕" },
  { value: "polo", label: "👔 Polo Shirt", icon: "👔" },
  { value: "hoodie", label: "🧥 Hoodie", icon: "🧥" },
  { value: "jersey", label: "👕 Jersey", icon: "👕" },
  { value: "uniform", label: "👮 Uniform", icon: "👮" },
  { value: "cap", label: "🧢 Cap/Hat", icon: "🧢" },
  { value: "bag", label: "🎒 Bag", icon: "🎒" },
  { value: "custom", label: "✨ Custom", icon: "✨" },
];

const PRINTING_METHODS = [
  {
    value: "silkscreen",
    label: "Silkscreen",
    description: "Best for large quantities, solid colors",
    minQty: 50,
  },
  {
    value: "sublimation",
    label: "Sublimation",
    description: "Full-color, polyester garments only",
    minQty: 10,
  },
  {
    value: "dtf",
    label: "DTF (Direct to Film)",
    description: "Any garment color, detailed designs",
    minQty: 1,
  },
  {
    value: "embroidery",
    label: "Embroidery",
    description: "Premium finish, logos and text",
    minQty: 12,
  },
  {
    value: "rubberized",
    label: "Rubberized Print",
    description: "Raised rubber texture, durable finish",
    minQty: 25,
  },
];

const ACCEPTED_FILE_TYPES = [
  ".png",
  ".jpg",
  ".jpeg",
  ".pdf",
  ".ai",
  ".eps",
  ".svg",
  ".psd",
];

export function ProductDesignSection({
  garmentType,
  printingMethod,
  designFiles,
  onGarmentTypeChange,
  onPrintingMethodChange,
  onDesignFilesChange,
}: ProductDesignSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [validatingWithAshley, setValidatingWithAshley] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPrintingMethod = PRINTING_METHODS.find(
    m => m.value === printingMethod
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFileType = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    return ACCEPTED_FILE_TYPES.includes(extension);
  };

  const validateFileSize = (file: File): boolean => {
    return file.size <= 50 * 1024 * 1024; // 50MB limit
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise(resolve => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const validFiles: DesignFile[] = [];

    for (const file of Array.from(files)) {
      if (!validateFileType(file)) {
        toast.error(`${file.name}: Unsupported file type`);
        continue;
      }

      if (!validateFileSize(file)) {
        toast.error(`${file.name}: File too large (max 50MB)`);
        continue;
      }

      const preview = await createFilePreview(file);

      const designFile: DesignFile = {
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        preview,
        uploadProgress: 0,
        uploaded: false,
      };

      validFiles.push(designFile);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...designFiles, ...validFiles];
      onDesignFilesChange(updatedFiles);

      // Start upload simulation and Ashley validation
      validFiles.forEach(file => uploadFile(file));
    }
  };

  const uploadFile = async (file: DesignFile) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));

      onDesignFilesChange(prevFiles =>
        prevFiles.map(f =>
          f.id === file.id ? { ...f, uploadProgress: progress } : f
        )
      );
    }

    // Mark as uploaded
    onDesignFilesChange(prevFiles =>
      prevFiles.map(f => (f.id === file.id ? { ...f, uploaded: true } : f))
    );

    // Start Ashley AI validation
    validateWithAshley(file);
  };

  const validateWithAshley = async (file: DesignFile) => {
    if (!printingMethod || !garmentType) {
      return;
    }

    setValidatingWithAshley(file.id);

    try {
      // Simulate Ashley AI validation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockValidation = {
        feasible: Math.random() > 0.2, // 80% chance feasible
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        suggestions: [
          "Consider using vector format for better quality",
          "Colors may require adjustment for sublimation",
          'Add 0.25" bleed area for better results',
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        warnings:
          Math.random() > 0.7
            ? ["High detail areas may not print clearly at small sizes"]
            : [],
      };

      onDesignFilesChange(prevFiles =>
        prevFiles.map(f =>
          f.id === file.id ? { ...f, ashleyValidation: mockValidation } : f
        )
      );

      if (mockValidation.feasible) {
        toast.success(
          `Ashley AI: Design "${file.name}" looks good for ${printingMethod}!`
        );
      } else {
        toast.error(
          `Ashley AI: Design "${file.name}" may have issues with ${printingMethod}`
        );
      }
    } catch (error) {
      console.error("Ashley validation error:", error);
      toast.error("Ashley AI validation failed");
    } finally {
      setValidatingWithAshley(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = designFiles.filter(f => f.id !== fileId);
    onDesignFilesChange(updatedFiles);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-2">
      <CardHeader className="border-b-2 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            B
          </span>
          <span className="font-bold">Product & Design</span>
          <Badge variant="destructive" className="ml-auto">
            Required
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Garment Type *</Label>
            <Select value={garmentType} onValueChange={onGarmentTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select garment type" />
              </SelectTrigger>
              <SelectContent>
                {GARMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Printing Method *</Label>
            <Select
              value={printingMethod}
              onValueChange={onPrintingMethodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select printing method" />
              </SelectTrigger>
              <SelectContent>
                {PRINTING_METHODS.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label} - {method.description} (Min: {method.minQty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedPrintingMethod && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <h4 className="mb-1 font-medium text-blue-900">
              {selectedPrintingMethod.label} Guidelines
            </h4>
            <p className="text-sm text-blue-800">
              {selectedPrintingMethod.description}
            </p>
            <p className="mt-1 text-sm text-blue-700">
              Minimum quantity: {selectedPrintingMethod.minQty} pieces
            </p>
          </div>
        )}

        <div>
          <Label>Design Files *</Label>
          <div className="space-y-3">
            <div
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto mb-4 h-10 w-10 text-gray-700" />
              <p className="mb-2 text-lg font-medium">Upload Design Files</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <Button onClick={triggerFileSelect} variant="outline">
                <FileImage className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Supported: {ACCEPTED_FILE_TYPES.join(", ")} (Max 50MB each)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES.join(",")}
              onChange={handleFileInput}
              className="hidden"
            />

            {designFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">
                  Uploaded Files ({designFiles.length})
                </h4>
                {designFiles.map(file => (
                  <div key={file.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="h-16 w-16 rounded border object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100">
                            <FileImage className="h-6 w-6 text-gray-700" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.size}
                          </p>

                          {!file.uploaded &&
                            file.uploadProgress !== undefined && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm">
                                  <span>Uploading...</span>
                                  <span>{file.uploadProgress}%</span>
                                </div>
                                <Progress
                                  value={file.uploadProgress}
                                  className="mt-1"
                                />
                              </div>
                            )}

                          {file.uploaded &&
                            validatingWithAshley === file.id && (
                              <div
                                className="mt-2 flex items-center gap-2 text-sm text-blue-600"
                                suppressHydrationWarning
                              >
                                <Loader2
                                  className="h-4 w-4 animate-spin"
                                  suppressHydrationWarning
                                />
                                <Sparkles
                                  className="h-4 w-4"
                                  suppressHydrationWarning
                                />
                                Ashley AI is validating...
                              </div>
                            )}

                          {file.ashleyValidation && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2">
                                {file.ashleyValidation.feasible ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    file.ashleyValidation.feasible
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  Ashley AI:{" "}
                                  {file.ashleyValidation.feasible
                                    ? "Feasible"
                                    : "Issues Found"}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {file.ashleyValidation.confidence}% confidence
                                </Badge>
                              </div>

                              {file.ashleyValidation.suggestions.length > 0 && (
                                <div className="text-sm">
                                  <p className="mb-1 font-medium text-blue-700">
                                    Suggestions:
                                  </p>
                                  <ul className="space-y-1">
                                    {file.ashleyValidation.suggestions.map(
                                      (suggestion, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-1 text-blue-600"
                                        >
                                          <span className="mt-1 text-blue-400">
                                            â€¢
                                          </span>
                                          {suggestion}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {file.ashleyValidation.warnings.length > 0 && (
                                <div className="text-sm">
                                  <p className="mb-1 font-medium text-amber-700">
                                    Warnings:
                                  </p>
                                  <ul className="space-y-1">
                                    {file.ashleyValidation.warnings.map(
                                      (warning, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-1 text-amber-600"
                                        >
                                          <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                          {warning}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
