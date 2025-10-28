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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Save,
  FileImage,
  File,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface DesignAsset {
  id: string;
  name: string;
  method: string;
  current_version: number;
  brand: {
    name: string;
    code: string;
  };
  order: {
    order_number: string;
  };
}

interface FileUpload {
  file: File | null;
  url: string;
  uploaded: boolean;
  uploading: boolean;
  error: string | null;
  type: "mockup" | "production" | "separation" | "embroidery";
}

export default function NewVersionPage() {
  const params = useParams();
  const router = useRouter();
  const [design, setDesign] = useState<DesignAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Version form data
  const [versionData, setVersionData] = useState({
    files: {
      mockups: [] as FileUpload[],
      production: [] as FileUpload[],
      separations: [] as FileUpload[],
      embroidery: [] as FileUpload[],
    },
    changes_description: "",
    notes: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchDesign(params.id as string);
    }
  }, [params.id]);

  const fetchDesign = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/designs/${id}?include=brand,order`);
      const data = await response.json();

      if (data.success) {
        setDesign(data.data);
      } else {
        toast.error("Failed to fetch design details");
        router.push("/designs");
      }
    } catch (error) {
      console.error("Failed to fetch design:", error);
      toast.error("Failed to fetch design details");
      router.push("/designs");
    } finally {
      setLoading(false);
    }
  };

  // File upload handling
  const handleFileUpload = useCallback(
    async (
      file: File,
      type: keyof typeof versionData.files,
      index?: number
    ) => {
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
      setVersionData(prev => {
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
          setVersionData(prev => {
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
        setVersionData(prev => {
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
    (e: React.DragEvent, type: keyof typeof versionData.files) => {
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

  // Remove file
  const removeFile = (type: keyof typeof versionData.files, index: number) => {
    setVersionData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [type]: prev.files[type].filter((_, i) => i !== index),
      },
    }));
  };

  // Ashley AI Validation
  const runAshleyValidation = async () => {
    if (!design) return;

    const hasFiles = Object.values(versionData.files).some(
      fileArray => fileArray.length > 0 && fileArray.some(f => f.uploaded)
    );

    if (!hasFiles) {
      toast.error("Please upload at least one file first");
      return;
    }

    setValidating(true);
    try {
      // Get current version data to copy placements and other info
      const currentVersionResponse = await fetch(
        `/api/designs/${design.id}/versions/${design.current_version}`
      );
      const currentVersionData = await currentVersionResponse.json();

      let placements = [];
      let palette = [];

      if (currentVersionData.success) {
        placements = JSON.parse(currentVersionData.data.placements || "[]");
        palette = currentVersionData.data.palette
          ? JSON.parse(currentVersionData.data.palette)
          : [];
      }

      const response = await fetch("/api/ashley/validate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: design.id,
          method: design.method,
          placements: placements,
          files: {
            mockup_url:
              versionData.files.mockups.find(f => f.uploaded)?.url || "",
            prod_url:
              versionData.files.production.find(f => f.uploaded)?.url || "",
            separations: versionData.files.separations
              .filter(f => f.uploaded)
              .map(f => f.url),
            dst_url:
              versionData.files.embroidery.find(f => f.uploaded)?.url || "",
          },
          color_count: palette.length || 1,
        }),
      });

      const result = await response.json();
      setValidationResult(result);

      if (result.status === "PASS") {
        toast.success("Design validation passed!");
      } else if (result.status === "WARN") {
        toast(
          `Design validation passed with warnings: ${result.issues?.length || 0} issues found`,
          { style: { background: "#f59e0b", color: "white" } }
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
    const hasFiles = Object.values(versionData.files).some(
      fileArray => fileArray.length > 0 && fileArray.some(f => f.uploaded)
    );

    if (!hasFiles) {
      toast.error("Please upload at least one file");
      return false;
    }

    if (!versionData.changes_description.trim()) {
      toast.error("Please describe what changed in this version");
      return false;
    }

    return true;
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateForm() || !design) return;

    setSubmitting(true);

    try {
      // Get current version data to copy placements and palette
      const currentVersionResponse = await fetch(
        `/api/designs/${design.id}/versions/${design.current_version}`
      );
      const currentVersionData = await currentVersionResponse.json();

      let placements = [];
      let palette = [];
      let meta = { notes: versionData.notes };

      if (currentVersionData.success) {
        placements = JSON.parse(currentVersionData.data.placements || "[]");
        palette = currentVersionData.data.palette
          ? JSON.parse(currentVersionData.data.palette)
          : [];
        const currentMeta = currentVersionData.data.meta
          ? JSON.parse(currentVersionData.data.meta)
          : {};
        meta = {
          ...currentMeta,
          notes: versionData.notes,
          changes: versionData.changes_description,
        };
      }

      const newVersionData = {
        files: {
          mockup_url:
            versionData.files.mockups.find(f => f.uploaded)?.url || "",
          prod_url:
            versionData.files.production.find(f => f.uploaded)?.url || "",
          separations: versionData.files.separations
            .filter(f => f.uploaded)
            .map(f => f.url),
          dst_url:
            versionData.files.embroidery.find(f => f.uploaded)?.url || "",
        },
        placements: placements,
        palette: palette.length > 0 ? palette : undefined,
        meta: meta,
      };

      const response = await fetch(`/api/designs/${design.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVersionData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Version ${design.current_version + 1} created successfully`
        );
        router.push(`/designs/${design.id}`);
      } else {
        toast.error(result.message || "Failed to create new version");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to create new version");
    } finally {
      setSubmitting(false);
    }
  };

  const DropZone = ({
    type,
    children,
  }: {
    type: keyof typeof versionData.files;
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
    type: keyof typeof versionData.files;
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

      {versionData.files[type].length > 0 && (
        <div className="mt-3 space-y-2">
          {versionData.files[type].map((fileUpload, index) => (
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Design not found</p>
            <Link href="/designs">
              <Button className="mt-4">Back to Designs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/designs/${design.id}/versions`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Versions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create New Version</h1>
            <p className="text-muted-foreground">
              {design.name} â€¢ Version {design.current_version + 1}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Version Information */}
          <Card>
            <CardHeader>
              <CardTitle>Version Information</CardTitle>
              <CardDescription>
                Describe the changes in this new version
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="changes">What Changed? *</Label>
                <Textarea
                  value={versionData.changes_description}
                  onChange={e =>
                    setVersionData(prev => ({
                      ...prev,
                      changes_description: e.target.value,
                    }))
                  }
                  placeholder="e.g., Updated logo colors, adjusted placement sizes, fixed color separations..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  value={versionData.notes}
                  onChange={e =>
                    setVersionData(prev => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Any additional notes about this version..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload System */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Updated Files</CardTitle>
                  <CardDescription>
                    Upload new or updated files for this version
                  </CardDescription>
                </div>
                <Button
                  onClick={runAshleyValidation}
                  disabled={validating}
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

              {design.method === "SILKSCREEN" && (
                <FileList type="separations" title="Color Separations" />
              )}

              {design.method === "EMBROIDERY" && (
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
                            <li key={index}>â€¢ {issue.message}</li>
                          )
                        )}
                      </ul>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Design Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Name:</strong>
                <br />
                {design.name}
              </div>
              <div>
                <strong>Order:</strong>
                <br />
                {design.order.order_number}
              </div>
              <div>
                <strong>Brand:</strong>
                <br />
                {design.brand.name} ({design.brand.code})
              </div>
              <div>
                <strong>Method:</strong>
                <br />
                <Badge variant="outline">{design.method}</Badge>
              </div>
              <div>
                <strong>Current Version:</strong>
                <br />v{design.current_version}
              </div>
              <div>
                <strong>Next Version:</strong>
                <br />
                <Badge className="bg-blue-100 text-blue-800">
                  v{design.current_version + 1}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                <Upload className="mr-2 h-4 w-4" />
                {submitting
                  ? "Creating Version..."
                  : `Create Version ${design.current_version + 1}`}
              </Button>

              <div className="pt-2 text-xs text-muted-foreground">
                <p>â€¢ This will create version {design.current_version + 1}</p>
                <p>
                  â€¢ Placements and colors will be copied from current version
                </p>
                <p>â€¢ You can edit these after creation</p>
              </div>
            </CardContent>
          </Card>

          {/* Version Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Version Control Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>â€¢ Each version is immutable once created</p>
              <p>â€¢ Previous versions remain accessible</p>
              <p>â€¢ Placements and colors are inherited</p>
              <p>â€¢ Ashley AI will validate the new version</p>
              <p>â€¢ Client approvals are per-version</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
