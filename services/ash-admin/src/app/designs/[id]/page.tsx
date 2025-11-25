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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Edit,
  Send,
  Lock,
  Plus,
  Eye,
  Download,
  Upload,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Image,
  FileText,
  Palette,
  Zap,
  Share,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { formatDate as formatDateUtil } from "@/lib/utils/date";

interface DesignAsset {
  id: string;
  name: string;
  method: string;
  status: string;
  current_version: number;
  is_best_seller: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  order: {
    id: string;
    order_number: string;
    status: string;
  };
  brand: {
    id: string;
    name: string;
    code: string;
  };
  versions: Array<{
    id: string;
    version: number;
    files: string;
    placements: string;
    palette: string;
    meta: string;
    created_by: string;
    created_at: string;
  }>;
  approvals: Array<{
    id: string;
    status: string;
    version: number;
    comments: string;
    approver_name: string;
    approver_email: string;
    created_at: string;
    client: {
      name: string;
    };
  }>;
  checks: Array<{
    id: string;
    version: number;
    method: string;
    result: string;
    issues: string;
    metrics: string;
    created_at: string;
  }>;
  _count: {
    versions: number;
    approvals: number;
    checks: number;
  };
}

export default function DesignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [design, setDesign] = useState<DesignAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDesign(params.id as string);
    }
  }, [params.id]);

  const fetchDesign = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/designs/${id}?include=order,brand,versions,approvals,checks`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch design: ${response.status} ${response.statusText}`);
      }

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

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toUpperCase()) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "LOCKED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodColor = (method: string) => {
    if (!method) return "bg-gray-100 text-gray-800";
    switch (method.toUpperCase()) {
      case "SILKSCREEN":
        return "bg-purple-100 text-purple-800";
      case "SUBLIMATION":
        return "bg-cyan-100 text-cyan-800";
      case "DTF":
        return "bg-orange-100 text-orange-800";
      case "EMBROIDERY":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCheckResultColor = (result: string) => {
    if (!result) return "bg-gray-100 text-gray-800";
    switch (result.toUpperCase()) {
      case "PASS":
        return "bg-green-100 text-green-800";
      case "WARN":
        return "bg-yellow-100 text-yellow-800";
      case "FAIL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSendApproval = async (version?: number) => {
    if (!design) return;

    const targetVersion = version || design.current_version;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/designs/${design.id}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: targetVersion,
          comments: newComment,
        }),
      });

      if (response.ok) {
        toast.success("Design sent for client approval");
        setNewComment("");
        fetchDesign(design.id);
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to send approval");
      }
    } catch (error) {
      console.error("Failed to send approval:", error);
      toast.error("Failed to send approval");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLockDesign = async (version?: number) => {
    if (!design) return;

    const targetVersion = version || design.current_version;

    if (
      !confirm(
        `Are you sure you want to lock version ${targetVersion}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/designs/${design.id}/versions/${targetVersion}/lock`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Design version locked successfully");
        fetchDesign(design.id);
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to lock design");
      }
    } catch (error) {
      console.error("Failed to lock design:", error);
      toast.error("Failed to lock design");
    }
  };

  const runAshleyValidation = async (version?: number) => {
    if (!design) return;

    const designVersions = design.versions || [];
    const targetVersion = version || design.current_version;
    const versionData = designVersions.find(v => v.version === targetVersion);

    if (!versionData) {
      toast.error("Version data not found");
      return;
    }

    try {
      const response = await fetch("/api/ashley/validate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: design.id,
          version: targetVersion,
          method: design.method,
          files: JSON.parse(versionData.files),
          placements: JSON.parse(versionData.placements),
          palette: versionData.palette ? JSON.parse(versionData.palette) : [],
        }),
      });

      if (response.ok) {
        toast.success("Ashley AI validation completed");
        fetchDesign(design.id); // Refresh to show new validation results
      } else {
        const result = await response.json();
        toast.error(result.message || "Validation failed");
      }
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Ashley AI validation failed");
    }
  };

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

  // Ensure versions array exists and is valid
  const versions = design.versions || [];
  const approvals = design.approvals || [];
  const checks = design.checks || [];

  const currentVersion = versions.find(
    v => v.version === design.current_version
  );
  const files = currentVersion ? JSON.parse(currentVersion.files) : {};
  const placements = currentVersion
    ? JSON.parse(currentVersion.placements)
    : [];
  const palette =
    currentVersion && currentVersion.palette
      ? JSON.parse(currentVersion.palette)
      : [];

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/designs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Designs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{design.name}</h1>
            <p className="text-muted-foreground">
              {design.order.order_number} â€¢ {design.brand.name} â€¢ Version{" "}
              {design.current_version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(design.status)}>
            {design.status.replace("_", " ")}
          </Badge>
          <Badge className={getMethodColor(design.method)}>
            {design.method}
          </Badge>
          {design.is_best_seller && (
            <Badge variant="secondary">â­ Best Seller</Badge>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex border-b">
        {[
          { id: "overview", label: "Overview", icon: Eye },
          { id: "versions", label: "Versions", icon: Upload },
          { id: "approvals", label: "Approvals", icon: CheckCircle },
          { id: "validation", label: "AI Checks", icon: Zap },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Current Version Files */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Design Files (Version {design.current_version})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {files.mockup_url && (
                    <div className="flex items-center justify-between rounded bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <Image className="h-5 w-5 text-blue-600" />
                        <span>Mockup File</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={files.mockup_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={files.mockup_url} download>
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {files.prod_url && (
                    <div className="flex items-center justify-between rounded bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <span>Production File</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={files.prod_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={files.prod_url} download>
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {files.separations && files.separations.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Color Separations</h4>
                      {files.separations.map((url: string, index: number) => (
                        <div
                          key={index}
                          className="mb-2 flex items-center justify-between rounded bg-gray-50 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <span>Separation {index + 1}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={url} download>
                                <Download className="mr-1 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {files.dst_url && (
                    <div className="flex items-center justify-between rounded bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-pink-600" />
                        <span>Embroidery File</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={files.dst_url} download>
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Placements */}
              <Card>
                <CardHeader>
                  <CardTitle>Design Placements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {placements.map((placement: any, index: number) => (
                      <div key={index} className="rounded border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium capitalize">
                            {placement.area?.replace("_", " ") ||
                              "Unknown Area"}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {placement.width_cm} Ã— {placement.height_cm} cm
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Offset: X {placement.offset_x}cm, Y{" "}
                          {placement.offset_y}cm
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Color Palette */}
              {palette.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Color Palette
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {palette.map((color: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono text-sm">{color}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Versions Tab */}
          {activeTab === "versions" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Version History</CardTitle>
                  <Link href={`/designs/${design.id}/versions/new`}>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      New Version
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versions
                    .sort((a, b) => b.version - a.version)
                    .map(version => {
                      const versionFiles = JSON.parse(version.files);
                      return (
                        <div key={version.id} className="rounded-lg border p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                Version {version.version}
                              </h4>
                              {version.version === design.current_version && (
                                <Badge variant="secondary">Current</Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={`/designs/${design.id}/versions/${version.version}`}
                              >
                                <Button size="sm" variant="outline">
                                  <Eye className="mr-1 h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  runAshleyValidation(version.version)
                                }
                              >
                                <Zap className="mr-1 h-4 w-4" />
                                Validate
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>
                              Created:{" "}
                              {(version.created_at ? formatDateUtil(version.created_at, "datetime") : "-")}
                            </p>
                            <p>
                              Files:{" "}
                              {
                                Object.keys(versionFiles).filter(
                                  key => versionFiles[key]
                                ).length
                              }{" "}
                              files uploaded
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approvals Tab */}
          {activeTab === "approvals" && (
            <Card>
              <CardHeader>
                <CardTitle>Client Approvals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {approvals.length > 0 ? (
                  approvals
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map(approval => (
                      <div key={approval.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(approval.status)}>
                              {approval.status.replace("_", " ")}
                            </Badge>
                            <span className="font-medium">
                              Version {approval.version}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {(approval.created_at ? formatDateUtil(approval.created_at) : "-")}
                          </span>
                        </div>
                        <p className="text-sm">
                          <strong>Client:</strong> {approval.client.name}
                        </p>
                        {approval.approver_name && (
                          <p className="text-sm">
                            <strong>Approved by:</strong>{" "}
                            {approval.approver_name}
                          </p>
                        )}
                        {approval.comments && (
                          <div className="mt-2 rounded bg-gray-50 p-2">
                            <p className="text-sm">{approval.comments}</p>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-muted-foreground">
                      No approvals yet
                    </p>
                    <Button onClick={() => handleSendApproval()}>
                      <Send className="mr-2 h-4 w-4" />
                      Send for Approval
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Validation Tab */}
          {activeTab === "validation" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Ashley AI Validation Results
                  </CardTitle>
                  <Button onClick={() => runAshleyValidation()}>
                    <Zap className="mr-2 h-4 w-4" />
                    Run New Check
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {checks.length > 0 ? (
                  checks
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map(check => {
                      const issues = check.issues
                        ? JSON.parse(check.issues)
                        : [];
                      const metrics = check.metrics
                        ? JSON.parse(check.metrics)
                        : {};

                      return (
                        <div key={check.id} className="rounded-lg border p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getCheckResultColor(check.result)}
                              >
                                {check.result}
                              </Badge>
                              <span>Version {check.version}</span>
                              <span className="text-muted-foreground">â€¢</span>
                              <span className="text-sm text-muted-foreground">
                                {check.method}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {(check.created_at ? formatDateUtil(check.created_at, "datetime") : "-")}
                            </span>
                          </div>

                          {issues.length > 0 && (
                            <div className="mb-3">
                              <h5 className="mb-2 font-medium">
                                Issues Found:
                              </h5>
                              <ul className="space-y-1">
                                {issues.map((issue: any, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                                    <span>{issue.message}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {Object.keys(metrics).length > 0 && (
                            <div>
                              <h5 className="mb-2 font-medium">Metrics:</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                                {Object.entries(metrics).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="rounded bg-gray-50 p-2"
                                  >
                                    <div className="font-medium capitalize">
                                      {key.replace(/_/g, " ")}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {typeof value === "number"
                                        ? value.toFixed(2)
                                        : String(value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="py-8 text-center">
                    <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-4 text-muted-foreground">
                      No validation results yet
                    </p>
                    <Button onClick={() => runAshleyValidation()}>
                      <Zap className="mr-2 h-4 w-4" />
                      Run Ashley AI Validation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Preview */}
          {files.mockup_url && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={files.mockup_url}
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
              {design.status === "DRAFT" && (
                <>

                  <Button
                    onClick={() => handleSendApproval()}
                    className="w-full"
                    disabled={submitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send for Approval
                  </Button>
                </>
              )}

              {design.status === "APPROVED" && (
                <Button
                  onClick={() => handleLockDesign()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Lock for Production
                </Button>
              )}

              <Link
                href={`/designs/${design.id}/versions/new`}
                className="block"
              >
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Version
                </Button>
              </Link>

              <Button className="w-full" variant="outline">
                <Share className="mr-2 h-4 w-4" />
                Share Design
              </Button>
            </CardContent>
          </Card>

          {/* Design Info */}
          <Card>
            <CardHeader>
              <CardTitle>Design Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Order:</strong>
                <br />
                <Link
                  href={`/orders/${design.order.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {design.order.order_number}
                </Link>
              </div>
              <Separator />
              <div>
                <strong>Brand:</strong>
                <br />
                {design.brand.name} ({design.brand.code})
              </div>
              <Separator />
              <div>
                <strong>Method:</strong>
                <br />
                <Badge
                  className={getMethodColor(design.method)}
                  variant="outline"
                >
                  {design.method}
                </Badge>
              </div>
              <Separator />
              <div>
                <strong>Current Version:</strong>
                <br />v{design.current_version}
              </div>
              <Separator />
              <div>
                <strong>Statistics:</strong>
                <br />
                {versions.length} versions
                <br />
                {approvals.length} approvals
                <br />
                {checks.length} AI checks
              </div>
              <Separator />
              <div>
                <strong>Created:</strong>
                <br />
                {(design.created_at ? formatDateUtil(design.created_at) : "-")}
              </div>
              <div>
                <strong>Last Updated:</strong>
                <br />
                {(design.updated_at ? formatDateUtil(design.updated_at) : "-")}
              </div>
            </CardContent>
          </Card>

          {/* Send Approval */}
          {design.status === "DRAFT" && (
            <Card>
              <CardHeader>
                <CardTitle>Send for Approval</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment for the client (optional)..."
                  rows={3}
                />
                <Button
                  onClick={() => handleSendApproval()}
                  className="w-full"
                  disabled={submitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? "Sending..." : "Send for Approval"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
