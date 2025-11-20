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
import {
  ArrowLeft,
  Plus,
  Eye,
  Download,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Image,
  FileText,
  Lock,
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
  brand: {
    id: string;
    name: string;
    code: string;
  };
  order: {
    id: string;
    order_number: string;
  };
}

interface DesignVersion {
  id: string;
  version: number;
  files: string;
  placements: string;
  palette: string;
  meta: string;
  created_by: string;
  created_at: string;
}

interface ValidationCheck {
  id: string;
  version: number;
  method: string;
  result: string;
  issues: string;
  metrics: string;
  created_at: string;
}

export default function VersionManagementPage() {
  const params = useParams();
  const router = useRouter();
  const [design, setDesign] = useState<DesignAsset | null>(null);
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [checks, setChecks] = useState<ValidationCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDesignVersions(params.id as string);
    }
  }, [params.id]);

  const fetchDesignVersions = async (id: string) => {
    try {
      setLoading(true);

      // Fetch design info
      const designResponse = await fetch(
        `/api/designs/${id}?include=brand,order`
      );
      const designData = await designResponse.json();

      // Fetch versions
      const versionsResponse = await fetch(`/api/designs/${id}/versions`);
      const versionsData = await versionsResponse.json();

      // Fetch validation checks
      const checksResponse = await fetch(`/api/designs/${id}/checks`);
      const checksData = await checksResponse.json();

      if (designData.success) {
        setDesign(designData.data);
      }

      if (versionsData.success) {
        setVersions(versionsData.data);
      }

      if (checksData.success) {
        setChecks(checksData.data);
      }
    } catch (error) {
      console.error("Failed to fetch design versions:", error);
      toast.error("Failed to fetch design versions");
    } finally {
      setLoading(false);
    }
  };

  const getCheckResultColor = (result: string) => {
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

  const runValidation = async (version: number) => {
    if (!design) return;

    const versionData = versions.find(v => v.version === version);
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
          version: version,
          method: design.method,
          files: JSON.parse(versionData.files),
          placements: JSON.parse(versionData.placements),
          palette: versionData.palette ? JSON.parse(versionData.palette) : [],
        }),
      });

      if (response.ok) {
        toast.success("Ashley AI validation completed");
        fetchDesignVersions(design.id); // Refresh to show new validation results
      } else {
        const result = await response.json();
        toast.error(result.message || "Validation failed");
      }
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Ashley AI validation failed");
    }
  };

  const setCurrentVersion = async (version: number) => {
    if (!design) return;

    if (!confirm(`Set version ${version} as the current active version?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/designs/${design.id}/versions/${version}/set-current`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success(`Version ${version} is now the current version`);
        router.push(`/designs/${design.id}`);
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to set current version");
      }
    } catch (error) {
      console.error("Failed to set current version:", error);
      toast.error("Failed to set current version");
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

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/designs/${design.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Design
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Version Management</h1>
            <p className="text-muted-foreground">
              {design.name} â€¢ {design.order.order_number} â€¢ {design.brand.name}
            </p>
          </div>
        </div>

        <Link href={`/designs/${design.id}/versions/new`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Version
          </Button>
        </Link>
      </div>

      {/* Version History */}
      <div className="space-y-6">
        {versions.length > 0 ? (
          versions
            .sort((a, b) => b.version - a.version)
            .map(version => {
              const files = JSON.parse(version.files);
              const placements = JSON.parse(version.placements);
              const palette = version.palette
                ? JSON.parse(version.palette)
                : [];
              const meta = version.meta ? JSON.parse(version.meta) : {};

              // Find validation checks for this version
              const versionChecks = checks.filter(
                check => check.version === version.version
              );
              const latestCheck = versionChecks.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];

              return (
                <Card key={version.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          Version {version.version}
                        </h3>
                        {version.version === design.current_version && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Current
                          </Badge>
                        )}
                        {latestCheck && (
                          <Badge
                            className={getCheckResultColor(latestCheck.result)}
                          >
                            AI: {latestCheck.result}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {version.version !== design.current_version && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentVersion(version.version)}
                          >
                            Set as Current
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runValidation(version.version)}
                        >
                          <Zap className="mr-1 h-4 w-4" />
                          Validate
                        </Button>
                        <Link
                          href={`/designs/${design.id}/versions/${version.version}`}
                        >
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Created: {(version.created_at ? formatDateUtil(version.created_at, "datetime") : "-")}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Files Overview */}
                    <div>
                      <h4 className="mb-2 font-medium">Files</h4>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {files.mockup_url && (
                          <div className="flex items-center gap-2 rounded bg-gray-50 p-2 text-sm">
                            <Image className="h-4 w-4 text-blue-600" />
                            <span>Mockup</span>
                          </div>
                        )}
                        {files.prod_url && (
                          <div className="flex items-center gap-2 rounded bg-gray-50 p-2 text-sm">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span>Production</span>
                          </div>
                        )}
                        {files.separations && files.separations.length > 0 && (
                          <div className="flex items-center gap-2 rounded bg-gray-50 p-2 text-sm">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <span>{files.separations.length} Separations</span>
                          </div>
                        )}
                        {files.dst_url && (
                          <div className="flex items-center gap-2 rounded bg-gray-50 p-2 text-sm">
                            <FileText className="h-4 w-4 text-pink-600" />
                            <span>Embroidery</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Placements Summary */}
                    <div>
                      <h4 className="mb-2 font-medium">Placements</h4>
                      <div className="flex flex-wrap gap-2">
                        {placements.map((placement: any, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {placement.area?.replace("_", " ") || "Unknown"}:{" "}
                            {placement.width_cm}Ã—{placement.height_cm}cm
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Color Palette */}
                    {palette.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium">
                          Colors ({palette.length})
                        </h4>
                        <div className="flex gap-1">
                          {palette
                            .slice(0, 8)
                            .map((color: string, index: number) => (
                              <div
                                key={index}
                                className="h-6 w-6 rounded border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          {palette.length > 8 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-gray-100 text-xs">
                              +{palette.length - 8}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Latest Validation Results */}
                    {latestCheck && (
                      <div className="border-t pt-4">
                        <h4 className="mb-2 font-medium">Latest Validation</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getCheckResultColor(
                                latestCheck.result
                              )}
                            >
                              {latestCheck.result}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(
                                latestCheck.created_at
                              ).toLocaleString()}
                            </span>
                          </div>
                          {JSON.parse(latestCheck.issues || "[]").length >
                            0 && (
                            <span className="text-sm text-amber-600">
                              {JSON.parse(latestCheck.issues).length} issues
                              found
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Version Notes */}
                    {meta.notes && (
                      <div className="border-t pt-4">
                        <h4 className="mb-2 font-medium">Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {meta.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">No versions found</p>
              <Link href={`/designs/${design.id}/versions/new`}>
                <Button>Create First Version</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Statistics */}
      {versions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Version Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {versions.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Versions
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {design.current_version}
                </div>
                <div className="text-sm text-muted-foreground">
                  Current Version
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {checks.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  AI Validations
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {checks.filter(check => check.result === "PASS").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Passed Validations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
