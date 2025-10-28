"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle, Upload,
  ChevronLeft,
  Save,
  Search,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function MobileQCPage() {
  const [step, setStep] = useState<
    "search" | "inspect" | "defects" | "summary"
  >("search");
  const [bundleCode, setBundleCode] = useState("");
  const [bundle, setBundle] = useState<any>(null);
  const [inspectionData, setInspectionData] = useState({
    sample_size: 0,
    inspected: 0,
    passed: 0,
    failed: 0,
    defects: [] as any[],
    photos: [] as string[],
    notes: "",
    inspector_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [defectTypes, setDefectTypes] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDefectTypes();
  }, []);

  const fetchDefectTypes = async () => {
    try {
      const response = await fetch("/api/qc/defect-types", {
        headers: {
          "x-workspace-id": "default-workspace",
        },
      });
      const data = await response.json();
      if (data.success) {
        setDefectTypes(data.defectTypes || []);
      }
    } catch (error) {
      console.error("Error fetching defect types:", error);
    }
  };

  const searchBundle = async () => {
    if (!bundleCode.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/bundles/scan?code=${bundleCode}`, {
        headers: {
          "x-workspace-id": "default-workspace",
        },
      });

      const data = await response.json();
      if (data.success) {
        setBundle(data.bundle);
        // Calculate AQL sample size based on quantity
        const sampleSize = calculateAQLSampleSize(data.bundle.quantity);
        setInspectionData(prev => ({ ...prev, sample_size: sampleSize }));
        setStep("inspect");
      } else {
        alert("Bundle not found");
      }
    } catch (error) {
      console.error("Bundle search error:", error);
      alert("Failed to find bundle");
    } finally {
      setLoading(false);
    }
  };

  const calculateAQLSampleSize = (lotSize: number): number => {
    // Simplified AQL sample size calculation (based on ANSI/ASQ Z1.4)
    if (lotSize <= 50) return Math.min(lotSize, 8);
    if (lotSize <= 90) return 13;
    if (lotSize <= 150) return 20;
    if (lotSize <= 280) return 32;
    if (lotSize <= 500) return 50;
    if (lotSize <= 1200) return 80;
    return 125;
  };

  const recordDefect = (defectType: any) => {
    const newDefect = {
      id: Date.now().toString(),
      defect_type_id: defectType.id,
      defect_code: defectType.code,
      defect_name: defectType.name,
      severity: defectType.default_severity,
      quantity: 1,
      timestamp: new Date().toISOString(),
    };

    setInspectionData(prev => ({
      ...prev,
      defects: [...prev.defects, newDefect],
      failed: prev.failed + 1,
    }));
  };

  const recordPass = () => {
    setInspectionData(prev => ({
      ...prev,
      inspected: prev.inspected + 1,
      passed: prev.passed + 1,
    }));
  };

  const recordFail = () => {
    setStep("defects");
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setInspectionData(prev => ({
        ...prev,
        photos: [...prev.photos, base64],
      }));
    };
    reader.readAsDataURL(file);
  };

  const submitInspection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/mobile/qc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": "default-workspace",
          "x-user-id": "mobile-qc",
        },
        body: JSON.stringify({
          bundle_id: bundle.id,
          order_id: bundle.order?.id,
          ...inspectionData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("QC Inspection submitted successfully!");
        // Reset
        setBundleCode("");
        setBundle(null);
        setInspectionData({
          sample_size: 0,
          inspected: 0,
          passed: 0,
          failed: 0,
          defects: [],
          photos: [],
          notes: "",
          inspector_name: "",
        });
        setStep("search");
      } else {
        alert("Failed to submit inspection");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit inspection");
    } finally {
      setLoading(false);
    }
  };

  const defectRate =
    inspectionData.inspected > 0
      ? ((inspectionData.failed / inspectionData.inspected) * 100).toFixed(1)
      : "0.0";

  const progress =
    inspectionData.sample_size > 0
      ? (inspectionData.inspected / inspectionData.sample_size) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-900 pb-20 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {step !== "search" && (
              <button
                onClick={() => setStep("search")}
                className="rounded-lg p-2 hover:bg-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-xl font-bold">Mobile QC</h1>
          </div>
          <button
            onClick={() => router.push("/mobile/dashboard")}
            className="text-sm text-gray-500 hover:text-white"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Search Step */}
      {step === "search" && (
        <div className="space-y-4 p-4">
          <div className="rounded-lg bg-gray-800 p-6">
            <div className="mb-6 text-center">
              <Package className="mx-auto mb-3 h-16 w-16 text-blue-400" />
              <h2 className="mb-2 text-lg font-semibold">
                Start QC Inspection
              </h2>
              <p className="text-sm text-gray-500">
                Enter bundle code or scan QR code
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={bundleCode}
                  onChange={e => setBundleCode(e.target.value)}
                  placeholder="Enter bundle code..."
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  onKeyPress={e => e.key === "Enter" && searchBundle()}
                />
              </div>

              <button
                onClick={searchBundle}
                disabled={loading || !bundleCode.trim()}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-600"
              >
                <Search className="h-5 w-5" />
                <span>{loading ? "Searching..." : "Find Bundle"}</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-800 px-2 text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/mobile/scanner")}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-700 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
              >
                <Camera className="h-5 w-5" />
                <span>Scan QR Code</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <h3 className="mb-2 font-medium">How to inspect:</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600">
              <li>Find and scan the bundle</li>
              <li>Inspect sample units one by one</li>
              <li>Mark each unit as Pass or Fail</li>
              <li>Record defects with photos</li>
              <li>Submit inspection results</li>
            </ol>
          </div>
        </div>
      )}

      {/* Inspection Step */}
      {step === "inspect" && bundle && (
        <div className="space-y-4 p-4">
          {/* Bundle Info */}
          <div className="rounded-lg border-l-4 border-blue-500 bg-gray-800 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-medium">{bundle.bundle_number}</p>
                <p className="text-sm text-gray-500">
                  Order: {bundle.order?.order_number || "N/A"}
                </p>
              </div>
              <span className="rounded-full bg-blue-900 px-2 py-1 text-xs text-blue-200">
                {bundle.quantity} units
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Sample Size: {inspectionData.sample_size} units
            </p>
          </div>

          {/* Progress */}
          <div className="rounded-lg bg-gray-800 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Inspection Progress</span>
              <span className="text-sm text-gray-500">
                {inspectionData.inspected} / {inspectionData.sample_size}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-green-700 bg-green-900 bg-opacity-30 p-3 text-center">
              <p className="text-2xl font-bold text-green-400">
                {inspectionData.passed}
              </p>
              <p className="text-xs text-green-300">Passed</p>
            </div>
            <div className="rounded-lg border border-red-700 bg-red-900 bg-opacity-30 p-3 text-center">
              <p className="text-2xl font-bold text-red-400">
                {inspectionData.failed}
              </p>
              <p className="text-xs text-red-300">Failed</p>
            </div>
            <div className="rounded-lg border border-yellow-700 bg-yellow-900 bg-opacity-30 p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {defectRate}%
              </p>
              <p className="text-xs text-yellow-300">Defect Rate</p>
            </div>
          </div>

          {/* Inspection Actions */}
          {inspectionData.inspected < inspectionData.sample_size && (
            <div className="rounded-lg bg-gray-800 p-4">
              <h3 className="mb-4 font-medium">
                Inspect Unit #{inspectionData.inspected + 1}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={recordPass}
                  className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-green-600 py-6 transition-colors hover:bg-green-700"
                >
                  <CheckCircle className="h-12 w-12" />
                  <span className="font-medium">PASS</span>
                </button>
                <button
                  onClick={recordFail}
                  className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-red-600 py-6 transition-colors hover:bg-red-700"
                >
                  <XCircle className="h-12 w-12" />
                  <span className="font-medium">FAIL</span>
                </button>
              </div>
            </div>
          )}

          {/* Defects List */}
          {inspectionData.defects.length > 0 && (
            <div className="rounded-lg bg-gray-800 p-4">
              <h3 className="mb-3 font-medium">
                Recorded Defects ({inspectionData.defects.length})
              </h3>
              <div className="space-y-2">
                {inspectionData.defects.map(defect => (
                  <div
                    key={defect.id}
                    className="flex items-center justify-between rounded-lg bg-gray-700 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {defect.defect_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {defect.defect_code}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        defect.severity === "CRITICAL"
                          ? "bg-red-900 text-red-200"
                          : defect.severity === "MAJOR"
                            ? "bg-orange-900 text-orange-200"
                            : "bg-yellow-900 text-yellow-200"
                      }`}
                    >
                      {defect.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Inspection */}
          {inspectionData.inspected >= inspectionData.sample_size && (
            <button
              onClick={() => setStep("summary")}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-4 font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Save className="h-5 w-5" />
              <span>Continue to Summary</span>
            </button>
          )}
        </div>
      )}

      {/* Defects Step */}
      {step === "defects" && (
        <div className="space-y-4 p-4">
          <div className="rounded-lg border border-red-700 bg-red-900 bg-opacity-20 p-4">
            <div className="mb-2 flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h3 className="font-medium text-red-200">Record Defect</h3>
            </div>
            <p className="text-sm text-red-300">
              Select the defect type found on this unit
            </p>
          </div>

          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="mb-3 font-medium">Defect Types</h3>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {defectTypes.map(defectType => (
                <button
                  key={defectType.id}
                  onClick={() => {
                    recordDefect(defectType);
                    setStep("inspect");
                  }}
                  className="w-full rounded-lg bg-gray-700 p-4 text-left transition-colors hover:bg-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{defectType.name}</p>
                      <p className="text-sm text-gray-500">{defectType.code}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {defectType.description}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        defectType.default_severity === "CRITICAL"
                          ? "bg-red-900 text-red-200"
                          : defectType.default_severity === "MAJOR"
                            ? "bg-orange-900 text-orange-200"
                            : "bg-yellow-900 text-yellow-200"
                      }`}
                    >
                      {defectType.default_severity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("inspect")}
            className="w-full rounded-lg bg-gray-700 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
          >
            Back to Inspection
          </button>
        </div>
      )}

      {/* Summary Step */}
      {step === "summary" && (
        <div className="space-y-4 p-4">
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-center text-lg font-semibold">
              Inspection Summary
            </h2>

            <div className="space-y-4">
              {/* Results */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-sm text-gray-500">Inspected</p>
                  <p className="text-2xl font-bold">
                    {inspectionData.inspected}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-sm text-gray-500">Sample Size</p>
                  <p className="text-2xl font-bold">
                    {inspectionData.sample_size}
                  </p>
                </div>
                <div className="rounded-lg border border-green-700 bg-green-900 bg-opacity-30 p-4">
                  <p className="text-sm text-green-300">Passed</p>
                  <p className="text-2xl font-bold text-green-400">
                    {inspectionData.passed}
                  </p>
                </div>
                <div className="rounded-lg border border-red-700 bg-red-900 bg-opacity-30 p-4">
                  <p className="text-sm text-red-300">Failed</p>
                  <p className="text-2xl font-bold text-red-400">
                    {inspectionData.failed}
                  </p>
                </div>
              </div>

              {/* Decision */}
              <div
                className={`rounded-lg p-6 text-center ${
                  parseFloat(defectRate) <= 2.5
                    ? "border border-green-700 bg-green-900 bg-opacity-30"
                    : "border border-red-700 bg-red-900 bg-opacity-30"
                }`}
              >
                {parseFloat(defectRate) <= 2.5 ? (
                  <>
                    <CheckCircle className="mx-auto mb-3 h-16 w-16 text-green-400" />
                    <h3 className="mb-2 text-xl font-bold text-green-200">
                      PASS
                    </h3>
                    <p className="text-sm text-green-300">
                      Defect rate: {defectRate}% (Acceptable)
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="mx-auto mb-3 h-16 w-16 text-red-400" />
                    <h3 className="mb-2 text-xl font-bold text-red-200">
                      FAIL
                    </h3>
                    <p className="text-sm text-red-300">
                      Defect rate: {defectRate}% (Exceeds limit)
                    </p>
                  </>
                )}
              </div>

              {/* Photos */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">
                    Photos ({inspectionData.photos.length})
                  </h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Add Photo</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                {inspectionData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {inspectionData.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Defect ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Inspector Notes
                </label>
                <textarea
                  value={inspectionData.notes}
                  onChange={e =>
                    setInspectionData(prev => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Add any additional notes..."
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Inspector Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Inspector Name
                </label>
                <input
                  type="text"
                  value={inspectionData.inspector_name}
                  onChange={e =>
                    setInspectionData(prev => ({
                      ...prev,
                      inspector_name: e.target.value,
                    }))
                  }
                  placeholder="Enter your name..."
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={submitInspection}
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-4 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-600"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? "Submitting..." : "Submit Inspection"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
