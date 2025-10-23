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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  QrCode,
  Package,
  AlertTriangle,
  CheckCircle,
  Printer,
  Eye,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CutLay {
  id: string;
  order_id: string;
  marker_name?: string;
  marker_width_cm?: number;
  lay_length_m: number;
  plies: number;
  gross_used: number;
  offcuts?: number;
  defects?: number;
  uom: string;
  order: {
    order_number: string;
    brand: {
      name: string;
      code: string;
    };
  };
  outputs: Array<{
    size_code: string;
    qty: number;
  }>;
}

interface BundleCreate {
  size_code: string;
  total_pieces: number;
  pieces_per_bundle: number;
  bundles_count: number;
  qr_codes: string[];
}

export default function CreateBundlesPage({
  params,
}: {
  params: { layId: string };
}) {
  const _router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lay, setLay] = useState<CutLay | null>(null);
  const [bundleConfig, setBundleConfig] = useState<BundleCreate[]>([]);
  const [createdBundles, setCreatedBundles] = useState<any[]>([]);
  const [step, setStep] = useState<"config" | "preview" | "created">("config");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLayData();
  }, [params.layId]);

  const fetchLayData = async () => {
    try {
      // In real implementation, fetch from API
      // Mock data for demo
      const mockLay: CutLay = {
        id: params.layId,
        order_id: "1",
        marker_name: "Hoodie Marker V2",
        marker_width_cm: 160,
        lay_length_m: 25.5,
        plies: 12,
        gross_used: 18.2,
        offcuts: 0.8,
        defects: 0.2,
        uom: "KG",
        order: {
          order_number: "TCAS-2025-000001",
          brand: { name: "Trendy Casual", code: "TCAS" },
        },
        outputs: [
          { size_code: "M", qty: 48 },
          { size_code: "L", qty: 48 },
          { size_code: "XL", qty: 24 },
        ],
      };

      setLay(mockLay);

      // Initialize bundle configuration
      const initialConfig = mockLay.outputs.map(output => ({
        size_code: output.size_code,
        total_pieces: output.qty,
        pieces_per_bundle: 20, // Default bundle size
        bundles_count: Math.ceil(output.qty / 20),
        qr_codes: [],
      }));

      setBundleConfig(initialConfig);
    } catch (error) {
      console.error("Failed to fetch lay data:", error);
    }
  };

  const generateQRCode = (
    orderId: string,
    layId: string,
    sizeCode: string,
    bundleNumber: number
  ): string => {
    const timestamp = new Date().getTime();
    return `ASH-${orderId}-${layId}-${sizeCode}-${bundleNumber}-${timestamp}`;
  };

  const updateBundleConfig = (
    index: number,
    field: keyof BundleCreate,
    value: any
  ) => {
    const newConfig = [...bundleConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };

    if (field === "pieces_per_bundle") {
      const piecesPerBundle = parseInt(value) || 1;
      newConfig[index].bundles_count = Math.ceil(
        newConfig[index].total_pieces / piecesPerBundle
      );
    }

    setBundleConfig(newConfig);
  };

  const generateBundlePreviews = () => {
    const previews = bundleConfig.map(config => {
      const qrCodes = [];
      for (let i = 1; i <= config.bundles_count; i++) {
        const remainingPieces =
          config.total_pieces - (i - 1) * config.pieces_per_bundle;
        const bundlePieces = Math.min(
          config.pieces_per_bundle,
          remainingPieces
        );

        qrCodes.push({
          bundle_number: i,
          qr_code: generateQRCode(
            lay?.order_id || "1",
            params.layId,
            config.size_code,
            i
          ),
          pieces: bundlePieces,
        });
      }

      return {
        ...config,
        qr_codes: qrCodes,
      };
    });

    setBundleConfig(previews);
    setStep("preview");
  };

  const createBundles = async () => {
    if (!lay) return;

    setLoading(true);

    try {
      const bundlesToCreate = bundleConfig.flatMap(config =>
        config.qr_codes.map((qr: any) => ({
          order_id: lay.order_id,
          lay_id: params.layId,
          size_code: config.size_code,
          qty: qr.pieces,
          qr_code: qr.qr_code,
          status: "CREATED",
        }))
      );

      // Mock API call - in real implementation, call actual API
      console.log("Creating bundles:", bundlesToCreate);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCreatedBundles(bundlesToCreate);
      setStep("created");
    } catch (error) {
      console.error("Error creating bundles:", error);
      setErrors({ submit: "Failed to create bundles. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const printBundleLabels = (bundleGroup?: any) => {
    // Mock print functionality
    alert(
      `Printing labels for ${bundleGroup ? `${bundleGroup.size_code} bundles` : "all bundles"}...`
    );
  };

  if (!lay) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/cutting">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cutting
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Bundles</h1>
          <p className="text-muted-foreground">
            Generate QR-coded bundles for {lay.order.order_number} -{" "}
            {lay.marker_name || `Lay #${lay.id}`}
          </p>
        </div>
      </div>

      {/* Lay Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lay Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="font-medium">Order:</span>
              <br />
              <Badge className="mt-1">{lay.order.brand.code}</Badge>{" "}
              {lay.order.order_number}
            </div>
            <div>
              <span className="font-medium">Marker:</span>
              <br />
              {lay.marker_name || `Lay #${lay.id}`}
            </div>
            <div>
              <span className="font-medium">Dimensions:</span>
              <br />
              {lay.marker_width_cm ? `${lay.marker_width_cm}cm × ` : ""}
              {lay.lay_length_m}m × {lay.plies} plies
            </div>
            <div>
              <span className="font-medium">Total Pieces:</span>
              <br />
              <span className="text-lg font-bold text-blue-600">
                {lay.outputs.reduce((sum, output) => sum + output.qty, 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {step === "config" && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Configuration</CardTitle>
            <CardDescription>
              Set up bundle sizes for each size category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {bundleConfig.map((config, index) => (
              <div key={config.size_code} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1 text-lg">
                      {config.size_code}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {config.total_pieces} pieces total
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Pieces per Bundle</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newValue = Math.max(
                            1,
                            config.pieces_per_bundle - 5
                          );
                          updateBundleConfig(
                            index,
                            "pieces_per_bundle",
                            newValue
                          );
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={config.total_pieces}
                        value={config.pieces_per_bundle}
                        onChange={e =>
                          updateBundleConfig(
                            index,
                            "pieces_per_bundle",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newValue = Math.min(
                            config.total_pieces,
                            config.pieces_per_bundle + 5
                          );
                          updateBundleConfig(
                            index,
                            "pieces_per_bundle",
                            newValue
                          );
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Number of Bundles</Label>
                    <div className="text-2xl font-bold text-green-600">
                      {config.bundles_count}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bundle Breakdown</Label>
                    <div className="text-sm text-muted-foreground">
                      {config.bundles_count > 1 && (
                        <>
                          {config.bundles_count - 1} ×{" "}
                          {config.pieces_per_bundle} pieces
                          <br />1 ×{" "}
                          {config.total_pieces -
                            (config.bundles_count - 1) *
                              config.pieces_per_bundle}{" "}
                          pieces
                        </>
                      )}
                      {config.bundles_count === 1 && (
                        <>1 × {config.total_pieces} pieces</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                onClick={generateBundlePreviews}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Bundles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Preview</CardTitle>
              <CardDescription>
                Review generated QR codes before creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {bundleConfig.map((config, index) => (
                  <div key={config.size_code}>
                    <div className="mb-3 flex items-center gap-3">
                      <Badge className="px-3 py-1 text-lg">
                        {config.size_code}
                      </Badge>
                      <span className="font-medium">
                        {config.bundles_count} bundles
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {config.qr_codes.map((qr: any, qrIndex: number) => (
                        <div
                          key={qrIndex}
                          className="rounded-lg border bg-gray-50 p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="font-mono text-sm">
                              Bundle #{qr.bundle_number}
                            </div>
                            <Badge variant="outline">{qr.pieces} pcs</Badge>
                          </div>
                          <div className="break-all font-mono text-xs text-muted-foreground">
                            {qr.qr_code}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("config")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Configuration
            </Button>
            <Button
              onClick={createBundles}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>Creating Bundles...</>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Create All Bundles
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "created" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Bundles Created Successfully
              </CardTitle>
              <CardDescription>
                {createdBundles.length} bundles have been created and are ready
                for sewing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bundleConfig.map(config => (
                  <div key={config.size_code} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="px-3 py-1 text-lg">
                          {config.size_code}
                        </Badge>
                        <span>{config.bundles_count} bundles created</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printBundleLabels(config)}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print Labels
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Bundle IDs:{" "}
                      {config.qr_codes
                        .slice(0, 3)
                        .map((qr: any) =>
                          qr.qr_code.split("-").slice(-2).join("-")
                        )
                        .join(", ")}
                      {config.qr_codes.length > 3 &&
                        ` and ${config.qr_codes.length - 3} more...`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ashley AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🤖</span>
                <span>Ashley AI Bundle Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-900">
                  Bundle Optimization Insights
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    • Bundle sizes are optimal for {lay.order.order_number} -
                    matches sewing line capacity
                  </li>
                  <li>
                    • QR code generation: {createdBundles.length} unique
                    trackable units created
                  </li>
                  <li>
                    • Estimated sewing time:{" "}
                    {Math.round(
                      createdBundles.reduce(
                        (sum, bundle) => sum + bundle.qty,
                        0
                      ) * 0.15
                    )}{" "}
                    minutes
                  </li>
                  <li>
                    • Recommended print: Bundle labels should be printed on 4x2
                    inch thermal labels
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Link href="/cutting">
              <Button variant="outline">Back to Cutting Dashboard</Button>
            </Link>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => printBundleLabels()}>
                <Printer className="mr-2 h-4 w-4" />
                Print All Labels
              </Button>
              <Link
                href={`/sewing?bundles=${createdBundles.map(b => b.qr_code).join(",")}`}
              >
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Package className="mr-2 h-4 w-4" />
                  Send to Sewing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}
