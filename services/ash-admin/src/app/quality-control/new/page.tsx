"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  Save,
  Send,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";

interface DefectCode {
  id: string;
  code: string;
  name: string;
  category: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  description?: string;
}

interface Sample {
  sample_no: number;
  bundle_ref?: string;
  qty_sampled: number;
  pass_fail: boolean;
  defects: Array<{
    defect_code_id: string;
    severity: string;
    quantity: number;
    location?: string;
    description?: string;
    photo_url?: string;
  }>;
}

export default function NewInspectionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    order_id: "",
    bundle_id: "",
    inspection_type: "FINAL",
    lot_size: 0,
    aql_major: 2.5,
    aql_minor: 4.0,
    inspector_id: "",
    notes: "",
  });
  const [samples, setSamples] = useState<Sample[]>([]);
  const [defectCodes, setDefectCodes] = useState<DefectCode[]>([]);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [inspectionResult, setInspectionResult] = useState<{
    sample_size: number;
    acceptance: number;
    rejection: number;
    result: "ACCEPT" | "REJECT" | "PENDING_REVIEW";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [newDefect, setNewDefect] = useState({
    defect_code_id: "",
    severity: "MINOR",
    quantity: 1,
    location: "",
    description: "",
    photo_url: "",
  });

  useEffect(() => {
    loadDefectCodes();
    loadOrders();
  }, []);

  useEffect(() => {
    if (formData.lot_size > 0) {
      calculateSampling();
    }
  }, [formData.lot_size, formData.aql_major]);

  const loadDefectCodes = async () => {
    try {
      const response = await fetch("/api/quality-control/defect-codes");
      const data = await response.json();
      setDefectCodes(data);
    } catch (error) {
      console.error("Error loading defect codes:", error);
    }
  };

  const loadOrders = async () => {
    // In production, load available orders for inspection
  };

  const calculateSampling = () => {
    // AQL sampling calculation - simplified version
    const lotSize = formData.lot_size;
    let sampleSize = 8;
    let acceptance = 1;
    let rejection = 2;

    if (lotSize <= 50) {
      sampleSize = 5;
      acceptance = 0;
      rejection = 1;
    } else if (lotSize <= 90) {
      sampleSize = 8;
      acceptance = 0;
      rejection = 1;
    } else if (lotSize <= 150) {
      sampleSize = 13;
      acceptance = 1;
      rejection = 2;
    } else if (lotSize <= 280) {
      sampleSize = 20;
      acceptance = 1;
      rejection = 2;
    } else if (lotSize <= 500) {
      sampleSize = 32;
      acceptance = 2;
      rejection = 3;
    } else if (lotSize <= 1200) {
      sampleSize = 50;
      acceptance = 3;
      rejection = 4;
    } else {
      sampleSize = 80;
      acceptance = 5;
      rejection = 6;
    }

    setInspectionResult({
      sampleSize,
      acceptance,
      rejection,
      result: "PENDING_REVIEW",
    });

    // Initialize samples
    const newSamples: Sample[] = [];
    for (let i = 1; i <= sampleSize; i++) {
      newSamples.push({
        sample_no: i,
        qty_sampled: 1,
        pass_fail: true,
        defects: [],
      });
    }
    setSamples(newSamples);
  };

  const ___addDefectToSample = (sampleIndex: number, defect: any) => {
    const updatedSamples = [...samples];
    updatedSamples[sampleIndex]!.defects.push(defect);
    updatedSamples[sampleIndex]!.pass_fail = false;
    setSamples(updatedSamples);
    evaluateInspectionResult(updatedSamples);
  };

  const evaluateInspectionResult = (samplesData: Sample[]) => {
    if (!inspectionResult) return;

    const totalDefects = samplesData.reduce(
      (sum, sample) =>
        sum +
        sample.defects.reduce(
          (defectSum, defect) => defectSum + defect.quantity,
          0
        ),
      0
    );

    let result: "ACCEPT" | "REJECT" | "PENDING_REVIEW" = "PENDING_REVIEW";
    if (totalDefects <= inspectionResult.acceptance) {
      result = "ACCEPT";
    } else if (totalDefects >= inspectionResult.rejection) {
      result = "REJECT";
    }

    setInspectionResult({
      ...inspectionResult,
      result,
    });
  };

  const addDefect = () => {
    if (!currentSample || !newDefect.defect_code_id) return;

    // Add defect to current sample
    const updatedSample = {
      ...currentSample,
      defects: [...currentSample.defects, newDefect],
      pass_fail: false, // Sample fails if it has defects
    };

    // Update samples list
    const updatedSamples = samples.map(s =>
      s.sample_no === currentSample.sample_no ? updatedSample : s
    );
    setSamples(updatedSamples);

    // Reset form and close modal
    setNewDefect({
      defect_code_id: "",
      severity: "MINOR",
      quantity: 1,
      location: "",
      description: "",
      photo_url: "",
    });
    setCurrentSample(null);
  };

  const saveInspection = async () => {
    setLoading(true);
    try {
      const inspectionData = {
        ...formData,
        samples,
        ...inspectionResult,
      };

      const response = await fetch("/api/quality-control/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspectionData),
      });

      if (response.ok) {
        router.push("/quality-control");
      }
    } catch (error) {
      console.error("Error saving inspection:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case "ACCEPT":
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case "REJECT":
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                New Quality Inspection
              </h1>
              <p className="text-sm text-gray-500">
                AQL-based statistical sampling inspection
              </p>
            </div>
          </div>

          {inspectionResult && (
            <div className="flex items-center space-x-4">
              {getResultBadge(inspectionResult.result)}
              <Button onClick={saveInspection} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Complete Inspection"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Inspection Setup */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="order_id">Order</Label>
                  <Input
                    id="order_id"
                    placeholder="ORD-2024-001"
                    value={formData.order_id}
                    onChange={e =>
                      setFormData({ ...formData, order_id: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="inspection_type">Inspection Type</Label>
                  <Select
                    value={formData.inspection_type}
                    onValueChange={value =>
                      setFormData({ ...formData, inspection_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INLINE_PRINTING">
                        Inline Printing
                      </SelectItem>
                      <SelectItem value="INLINE_SEWING">
                        Inline Sewing
                      </SelectItem>
                      <SelectItem value="FINAL">Final QC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lot_size">Lot Size (pcs)</Label>
                  <Input
                    id="lot_size"
                    type="number"
                    value={formData.lot_size || ""}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        lot_size: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="aql_major">AQL Major</Label>
                    <Input
                      id="aql_major"
                      type="number"
                      step="0.1"
                      value={formData.aql_major}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          aql_major: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="aql_minor">AQL Minor</Label>
                    <Input
                      id="aql_minor"
                      type="number"
                      step="0.1"
                      value={formData.aql_minor}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          aql_minor: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                {inspectionResult && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium text-blue-900">
                      Sampling Plan
                    </h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div>
                        Sample Size:{" "}
                        <strong>{inspectionResult.sample_size}</strong>
                      </div>
                      <div>
                        Acceptance:{" "}
                        <strong>{inspectionResult.acceptance}</strong>
                      </div>
                      <div>
                        Rejection: <strong>{inspectionResult.rejection}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sampling & Defects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sample Inspection</CardTitle>
              </CardHeader>
              <CardContent>
                {samples.length > 0 ? (
                  <div className="space-y-4">
                    {samples.map((sample, _index) => (
                      <div
                        key={sample.sample_no}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-medium">
                            Sample #{sample.sample_no}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {sample.pass_fail ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCurrentSample(sample)}
                            >
                              Add Defect
                            </Button>
                          </div>
                        </div>

                        {sample.defects.length > 0 && (
                          <div className="space-y-2">
                            {sample.defects.map((defect, defectIndex) => (
                              <div
                                key={defectIndex}
                                className="flex items-center justify-between rounded bg-red-50 p-2"
                              >
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {defect.severity}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    Qty: {defect.quantity}
                                  </span>
                                  {defect.location && (
                                    <span className="ml-2 text-gray-600">
                                      @ {defect.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                    <p>Enter lot size to generate sampling plan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Defect Entry Modal would go here */}
      {currentSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                Add Defect - Sample #{currentSample.sample_no}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-500">
                Select defect type and provide details
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="defect_code">Defect Code</Label>
                  <Select
                    value={newDefect.defect_code_id}
                    onValueChange={value =>
                      setNewDefect({ ...newDefect, defect_code_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select defect" />
                    </SelectTrigger>
                    <SelectContent>
                      {defectCodes.map(code => (
                        <SelectItem key={code.id} value={code.id}>
                          {code.code} - {code.name} ({code.severity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={newDefect.severity}
                      onValueChange={value =>
                        setNewDefect({ ...newDefect, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="MAJOR">Major</SelectItem>
                        <SelectItem value="MINOR">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newDefect.quantity}
                      onChange={e =>
                        setNewDefect({
                          ...newDefect,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Left sleeve, Front panel"
                    value={newDefect.location}
                    onChange={e =>
                      setNewDefect({ ...newDefect, location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the defect..."
                    value={newDefect.description}
                    onChange={e =>
                      setNewDefect({
                        ...newDefect,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Defect Photo (Optional)</Label>
                  <FileUpload
                    onUpload={url =>
                      setNewDefect({ ...newDefect, photo_url: url })
                    }
                    accept="image/*"
                    maxSizeMB={5}
                    folder="qc-defects"
                    type="image"
                    existingUrls={
                      newDefect.photo_url ? [newDefect.photo_url] : []
                    }
                    onRemove={() =>
                      setNewDefect({ ...newDefect, photo_url: "" })
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSample(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={addDefect}
                  disabled={!newDefect.defect_code_id}
                >
                  Add Defect
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
