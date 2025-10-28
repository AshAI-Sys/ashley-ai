"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, X, CheckCircle, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanBarcodePage() {
  const router = useRouter();
  const [scannedCode, setScannedCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [isScanning]);

  const startScanner = async () => {
    try {
      setError("");
      setSuccess("");

      // Check camera permission
      const permissionStatus = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      setCameraPermission(permissionStatus.state);

      if (permissionStatus.state === "denied") {
        setError(
          "Camera access denied. Please enable camera permissions in your browser settings."
        );
        return;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        (decodedText, _decodedResult) => {
          // Handle successful scan
          console.log("Scanned:", decodedText);
          setLastScanned(decodedText);
          setScannedCode(decodedText);
          setSuccess(`Successfully scanned: ${decodedText}`);

          // Auto-stop after successful scan
          setTimeout(() => {
            stopScanner();
          }, 1500);
        },
        (_errorMessage) => {
          // Handle scan errors silently (this fires continuously while scanning)
        }
      );

      setIsScanning(true);
      setCameraPermission("granted");
    } catch (err) {
      console.error("Error starting scanner:", err);
      if (err instanceof Error) {
        if (err.message.includes("Permission denied")) {
          setError(
            "Camera access denied. Please allow camera access to scan barcodes."
          );
          setCameraPermission("denied");
        } else if (err.message.includes("NotFoundError")) {
          setError(
            "No camera found on this device. Please use manual entry instead."
          );
        } else {
          setError(`Failed to start scanner: ${err.message}`);
        }
      } else {
        setError("Failed to start camera scanner. Please try again.");
      }
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
      setIsScanning(false);
    } catch (err) {
      console.error("Error stopping scanner:", err);
      setIsScanning(false);
    }
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (scannedCode.trim()) {
      setLastScanned(scannedCode);
      setSuccess(`Looking up material: ${scannedCode}`);
      setError("");

      // Here you would typically make an API call to look up the material
      setTimeout(() => {
        setSuccess(`Material found: ${scannedCode}`);
      }, 500);
    } else {
      setError("Please enter a barcode or SKU");
    }
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
            <ArrowLeft className="h-5 w-5" />
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
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Last Scanned */}
        {lastScanned && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Last Scanned Code:
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-blue-700">
              {lastScanned}
            </p>
          </div>
        )}

        {/* Scanner */}
        <div className="rounded-lg bg-white p-8 shadow">
          <div className="mb-8">
            {!isScanning ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-64 w-64 items-center justify-center rounded-lg bg-gray-100">
                  <Camera className="h-32 w-32 text-gray-500" />
                </div>
                <button
                  onClick={startScanner}
                  className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                  <Camera className="h-5 w-5" />
                  Start Camera Scanner
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Click to activate your device camera
                </p>
              </div>
            ) : (
              <div>
                <div className="relative mx-auto overflow-hidden rounded-lg">
                  {/* Scanner container */}
                  <div id="qr-reader" className="w-full"></div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={stopScanner}
                    className="mx-auto flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
                  >
                    <X className="h-5 w-5" />
                    Stop Scanner
                  </button>
                  <p className="mt-2 text-xs text-gray-600">
                    Point camera at barcode or QR code
                  </p>
                </div>
              </div>
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
        </div>

        {/* Camera Permission Help */}
        {cameraPermission === "denied" && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 font-semibold text-yellow-900">
              Camera Access Required
            </h4>
            <p className="mb-2 text-sm text-yellow-800">
              To use the barcode scanner, please enable camera permissions:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800">
              <li>Click the camera icon in your browser's address bar</li>
              <li>Select "Allow" for camera access</li>
              <li>Refresh the page and try again</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
