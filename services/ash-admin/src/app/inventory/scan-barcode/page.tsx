"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { Scanner } from "@/components/mobile/Scanner";
import HydrationSafeIcon from "@/components/hydration-safe-icon";

export default function ScanBarcodePage() {
  const router = useRouter();
  const [scannedCode, setScannedCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);

  const handleScan = async (code: string, format: string) => {
    console.log("Scanned:", code, format);
    setLastScanned(code);
    setSuccess(`Scanned: ${code}`);
    setError("");
    setIsScanning(false);

    // API lookup
    try {
      const response = await fetch(`/api/inventory/lookup?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (data.success && data.material) {
        setLookupResult(data.material);
        setSuccess(`Material found: ${data.material.name || code}`);
      } else {
        setError("Material not found in inventory");
        setLookupResult(null);
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setError("Failed to look up material");
      setLookupResult(null);
    }
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scannedCode.trim()) {
      handleScan(scannedCode.trim(), "MANUAL");
      setScannedCode("");
    } else {
      setError("Please enter a barcode or SKU");
    }
  };

  const resetScanner = () => {
    setLastScanned("");
    setSuccess("");
    setError("");
    setLookupResult(null);
    setScannedCode("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/inventory")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <HydrationSafeIcon Icon={ArrowLeft} className="h-5 w-5" />
            Back to Inventory
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Scan Barcode</h1>
          <p className="mt-2 text-gray-600">
            Scan material barcodes for quick lookup
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-green-300 bg-green-50 p-4 text-sm font-semibold text-green-800">
            <HydrationSafeIcon Icon={CheckCircle} className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            <HydrationSafeIcon Icon={AlertCircle} className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Last Scanned Result */}
        {lookupResult && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Material Found:</p>
            <p className="mt-1 font-mono text-lg font-bold text-blue-700">
              {lookupResult.name || lookupResult.sku || lastScanned}
            </p>
            {lookupResult.quantity && (
              <p className="mt-1 text-sm text-blue-600">
                Quantity: {lookupResult.quantity}
              </p>
            )}
          </div>
        )}

        {/* Scanner */}
        <div className="rounded-lg bg-white p-8 shadow">
          <div className="mb-8">
            {!isScanning ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-64 w-64 items-center justify-center rounded-lg bg-gray-100">
                  <HydrationSafeIcon Icon={Camera} className="h-32 w-32 text-gray-500" />
                </div>
                <button
                  onClick={() => setIsScanning(true)}
                  className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                  <HydrationSafeIcon Icon={Camera} className="h-5 w-5" />
                  Start Camera Scanner
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Click to activate your device camera
                </p>
              </div>
            ) : (
              <Scanner
                onScan={handleScan}
                onClose={() => setIsScanning(false)}
              />
            )}
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Manual Entry
            </h3>
            <form onSubmit={handleManualEntry} className="flex gap-4">
              <input
                type="text"
                value={scannedCode}
                onChange={e => setScannedCode(e.target.value)}
                placeholder="Enter barcode or SKU..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Look Up
              </button>
            </form>
          </div>

          {/* Reset Button */}
          {(lastScanned || lookupResult) && (
            <div className="mt-6 text-center">
              <button
                onClick={resetScanner}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Clear and scan another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
