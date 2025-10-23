"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Download,
  Eye,
  Sparkles,
  AlertCircle,
  CheckCircle,
  FileImage,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  category: string;
  preview?: string;
  uploadProgress?: number;
  uploaded?: boolean;
  ashleyAnalysis?: {
    requirements: string[];
    suggestions: string[];
    warnings: string[];
    feasible: boolean;
  };
}

interface FilesNotesSectionProps {
  uploadedFiles: UploadedFile[];
  specialInstructions: string;
  onFilesChange: (files: UploadedFile[]) => void;
  onInstructionsChange: (instructions: string) => void;
}

const FILE_CATEGORIES = [
  { value: "reference", label: "Reference Materials", icon: FileImage },
  { value: "specification", label: "Specifications", icon: FileText },
  { value: "artwork", label: "Additional Artwork", icon: Image },
  { value: "measurements", label: "Size/Measurements", icon: FileSpreadsheet },
  { value: "contract", label: "Contracts/Agreements", icon: FileText },
  { value: "other", label: "Other Documents", icon: File },
];

const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ai",
  ".eps",
  ".psd",
  ".txt",
  ".zip",
  ".rar",
];

const INSTRUCTION_TEMPLATES = [
  {
    name: "Color Matching",
    template:
      "Please ensure exact color matching using Pantone [COLOR CODE]. Sample reference attached.",
  },
  {
    name: "Special Placement",
    template:
      "Design placement: [X] inches from collar, centered horizontally. Please verify with sample before production.",
  },
  {
    name: "Quality Requirements",
    template:
      "This order requires premium quality standards. Please use top-grade materials and extra QC attention.",
  },
  {
    name: "Packaging Instructions",
    template:
      "Individual poly bags required. Include care labels and hang tags as specified in attached documents.",
  },
  {
    name: "Rush Order",
    template:
      "RUSH ORDER: Please prioritize this order. Client has strict deadline. Coordinate with production manager.",
  },
  {
    name: "Sample Request",
    template:
      "Please prepare 1-2 samples for client approval before proceeding with full production.",
  },
];

export function FilesNotesSection({
  uploadedFiles,
  specialInstructions,
  onFilesChange,
  onInstructionsChange,
}: FilesNotesSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [analyzingFiles, setAnalyzingFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    return file.size <= 100 * 1024 * 1024; // 100MB limit
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const _getFileIcon = (type: string, category: string) => {
    const categoryData = FILE_CATEGORIES.find(c => c.value === category);
    if (categoryData) return categoryData.icon;

    if (type.startsWith("image/")) return Image;
    if (type.includes("pdf")) return FileText;
    if (type.includes("sheet") || type.includes("excel"))
      return FileSpreadsheet;
    return File;
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
    const validFiles: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      if (!validateFileType(file)) {
        toast.error(`${file.name}: Unsupported file type`);
        continue;
      }

      if (!validateFileSize(file)) {
        toast.error(`${file.name}: File too large (max 100MB)`);
        continue;
      }

      const preview = await createFilePreview(file);

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        category: "other",
        preview,
        uploadProgress: 0,
        uploaded: false,
      };

      validFiles.push(uploadedFile);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...uploadedFiles, ...validFiles];
      onFilesChange(updatedFiles);

      // Start upload simulation
      validFiles.forEach(file => uploadFile(file));
    }
  };

  const uploadFile = async (file: UploadedFile) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedFiles = uploadedFiles.map(f =>
        f.id === file.id ? { ...f, uploadProgress: progress } : f
      );
      onFilesChange(updatedFiles);
    }

    // Mark as uploaded
    const uploadedFiles_ = uploadedFiles.map(f =>
      f.id === file.id ? { ...f, uploaded: true } : f
    );
    onFilesChange(uploadedFiles_);

    // Start Ashley AI analysis
    analyzeFileWithAshley(file);
  };

  const analyzeFileWithAshley = async (file: UploadedFile) => {
    setAnalyzingFiles(prev => [...prev, file.id]);

    try {
      // Simulate Ashley AI file analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockAnalysis = {
        requirements: [
          "Color specifications clearly defined",
          "Size measurements are accurate",
          "Print placement details provided",
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        suggestions: [
          "Consider adding bleed area specifications",
          "Include fabric care instructions",
          "Specify thread colors for embroidery",
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        warnings:
          Math.random() > 0.7
            ? [
                "File resolution may be too low for printing",
                "Color profile not optimized for production",
              ]
            : [],
        feasible: Math.random() > 0.2, // 80% chance feasible
      };

      const analyzedFiles = uploadedFiles.map(f =>
        f.id === file.id ? { ...f, ashleyAnalysis: mockAnalysis } : f
      );
      onFilesChange(analyzedFiles);

      if (mockAnalysis.feasible) {
        toast.success(`Ashley AI: File "${file.name}" analysis complete`);
      } else {
        toast.error(`Ashley AI: Issues found in "${file.name}"`);
      }
    } catch (error) {
      console.error("File analysis error:", error);
      toast.error("Ashley AI file analysis failed");
    } finally {
      setAnalyzingFiles(prev => prev.filter(id => id !== file.id));
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
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const updateFileCategory = (fileId: string, category: string) => {
    const updatedFiles = uploadedFiles.map(f =>
      f.id === fileId ? { ...f, category } : f
    );
    onFilesChange(updatedFiles);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const insertTemplate = (template: string) => {
    const currentInstructions = specialInstructions || "";
    const newInstructions = currentInstructions
      ? `${currentInstructions}\n\n${template}`
      : template;
    onInstructionsChange(newInstructions);
  };

  const getFilesByCategory = () => {
    const grouped: { [key: string]: UploadedFile[] } = {};
    uploadedFiles.forEach(file => {
      if (!grouped[file.category]) {
        grouped[file.category] = [];
      }
      grouped[file.category].push(file);
    });
    return grouped;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          H. Files & Special Instructions
          <Badge variant="outline">Optional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div>
          <Label className="mb-3 block">Additional Files</Label>
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
            <p className="mb-2 text-lg font-medium">Upload Additional Files</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Drag and drop files here, or click to browse
            </p>
            <Button onClick={triggerFileSelect} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Supported: {ACCEPTED_FILE_TYPES.slice(0, 8).join(", ")}, and more
              (Max 100MB each)
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
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div>
            <h4 className="mb-4 font-medium">
              Uploaded Files ({uploadedFiles.length})
            </h4>

            {Object.entries(getFilesByCategory()).map(([category, files]) => {
              const categoryData = FILE_CATEGORIES.find(
                c => c.value === category
              );
              const IconComponent = categoryData?.icon || File;

              return (
                <div key={category} className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <h5 className="font-medium">
                      {categoryData?.label || "Other"}
                    </h5>
                    <Badge variant="outline" className="text-xs">
                      {files.length} file{files.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {files.map(file => (
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
                                <FileText className="h-6 w-6 text-gray-700" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {file.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {file.size}
                              </p>

                              <div className="mt-2 flex gap-2">
                                <Select
                                  value={file.category}
                                  onValueChange={value =>
                                    updateFileCategory(file.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FILE_CATEGORIES.map(cat => (
                                      <SelectItem
                                        key={cat.value}
                                        value={cat.value}
                                      >
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

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
                                analyzingFiles.includes(file.id) && (
                                  <div className="mt-2 flex items-center gap-2 text-sm text-purple-600">
                                    <Sparkles className="h-4 w-4 animate-pulse" />
                                    Ashley AI is analyzing...
                                  </div>
                                )}

                              {file.ashleyAnalysis && (
                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    {file.ashleyAnalysis.feasible ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span
                                      className={`text-sm font-medium ${
                                        file.ashleyAnalysis.feasible
                                          ? "text-green-700"
                                          : "text-red-700"
                                      }`}
                                    >
                                      Ashley AI:{" "}
                                      {file.ashleyAnalysis.feasible
                                        ? "Analysis Complete"
                                        : "Issues Found"}
                                    </span>
                                  </div>

                                  {file.ashleyAnalysis.requirements.length >
                                    0 && (
                                    <div className="text-sm">
                                      <p className="mb-1 font-medium text-blue-700">
                                        Requirements Identified:
                                      </p>
                                      <ul className="space-y-1">
                                        {file.ashleyAnalysis.requirements.map(
                                          (req, i) => (
                                            <li
                                              key={i}
                                              className="flex items-start gap-1 text-blue-600"
                                            >
                                              <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                              {req}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {file.ashleyAnalysis.suggestions.length >
                                    0 && (
                                    <div className="text-sm">
                                      <p className="mb-1 font-medium text-green-700">
                                        Suggestions:
                                      </p>
                                      <ul className="space-y-1">
                                        {file.ashleyAnalysis.suggestions.map(
                                          (suggestion, i) => (
                                            <li
                                              key={i}
                                              className="flex items-start gap-1 text-green-600"
                                            >
                                              <span className="mt-1 text-green-400">
                                                •
                                              </span>
                                              {suggestion}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {file.ashleyAnalysis.warnings.length > 0 && (
                                    <div className="text-sm">
                                      <p className="mb-1 font-medium text-amber-700">
                                        Warnings:
                                      </p>
                                      <ul className="space-y-1">
                                        {file.ashleyAnalysis.warnings.map(
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

                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  URL.createObjectURL(file.file),
                                  "_blank"
                                )
                              }
                              title="Preview file"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Special Instructions */}
        <div>
          <Label htmlFor="special-instructions">Special Instructions</Label>
          <p className="mb-3 text-sm text-muted-foreground">
            Provide any specific requirements, color matching details, placement
            instructions, or other important notes
          </p>

          {/* Instruction Templates */}
          <div className="mb-3">
            <Label className="text-sm">Quick Templates</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {INSTRUCTION_TEMPLATES.map((template, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate(template.template)}
                  className="text-xs"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            id="special-instructions"
            value={specialInstructions}
            onChange={e => onInstructionsChange(e.target.value)}
            placeholder="Enter any special instructions, requirements, or notes for production..."
            rows={6}
            className="resize-vertical"
          />

          <div className="mt-2 text-xs text-muted-foreground">
            {specialInstructions.length}/2000 characters
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
