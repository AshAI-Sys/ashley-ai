"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  QrCode,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const [bundleInfo, setBundleInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      setCameraPermission(result.state);
    } catch (error) {
      console.error("Permission check failed:", error);
    }
  };

  const startScanning = async () => {
    try {
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use rear camera on mobile
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        setCameraPermission("granted");

        // Start scanning loop
        scanIntervalRef.current = setInterval(() => {
          captureAndDecode();
        }, 500); // Scan every 500ms
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Camera access denied. Please enable camera permissions.");
      setCameraPermission("denied");
    }
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  };

  const captureAndDecode = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Use browser's built-in barcode detector if available
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["qr_code"],
        });
        const barcodes = await barcodeDetector.detect(canvas);

        if (barcodes.length > 0) {
          const qrData = barcodes[0].rawValue;
          handleQRCodeScanned(qrData);
        }
      } else {
        // Fallback: Manual QR detection (simplified)
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = detectQRCode(imageData);
        if (code) {
          handleQRCodeScanned(code);
        }
      }
    } catch (err) {
      console.error("QR decode error:", err);
    }
  };

  const detectQRCode = (imageData: ImageData): string | null => {
    // Simplified QR detection - in production, use a library like jsQR
    // This is a placeholder that extracts data from a simple pattern
    // For now, return null to indicate no code detected
    return null;
  };

  const handleQRCodeScanned = async (qrData: string) => {
    stopScanning();
    setScannedData(qrData);

    // Fetch bundle information
    try {
      const response = await fetch(`/api/bundles/scan?code=${qrData}`, {
        headers: {
          "x-workspace-id": "default-workspace",
        },
      });

      const data = await response.json();

      if (data.success) {
        setBundleInfo(data.bundle);
      } else {
        setError("Bundle not found");
      }
    } catch (err) {
      console.error("Bundle lookup error:", err);
      setError("Failed to retrieve bundle information");
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setBundleInfo(null);
    setError(null);
    startScanning();
  };

  const updateBundleStatus = async (status: string) => {
    if (!bundleInfo) return;

    try {
      const response = await fetch(`/api/bundles/${bundleInfo.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": "default-workspace",
          "x-user-id": "mobile-scanner",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Bundle status updated to: ${status}`);
        resetScanner();
      } else {
        setError("Failed to update bundle status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError("Failed to update bundle status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QrCode className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold">QR Scanner</h1>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-white"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Camera Permission Info */}
        {cameraPermission === "denied" && (
          <div className="mb-4 rounded-lg border border-red-700 bg-red-900 p-4">
            <div className="flex items-start space-x-3">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <div>
                <p className="font-medium text-red-200">
                  Camera Access Required
                </p>
                <p className="mt-1 text-sm text-red-300">
                  Please enable camera permissions in your browser settings to
                  use the scanner.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner View */}
        {!scannedData && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg border-2 border-gray-700 bg-gray-800">
              {/* Video Preview */}
              <video
                ref={videoRef}
                className="h-auto w-full"
                playsInline
                muted
                style={{ maxHeight: "60vh" }}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-64 w-64 animate-pulse rounded-lg border-4 border-blue-500"></div>
                </div>
              )}

              {/* No Camera Active */}
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
                  <div className="text-center">
                    <Camera className="mx-auto mb-4 h-24 w-24 text-gray-600" />
                    <p className="text-gray-500">Camera is off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scan Button */}
            {!scanning ? (
              <button
                onClick={startScanning}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-4 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Camera className="h-5 w-5" />
                <span>Start Scanning</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-600 px-6 py-4 font-medium text-white transition-colors hover:bg-red-700"
              >
                <XCircle className="h-5 w-5" />
                <span>Stop Scanning</span>
              </button>
            )}

            {/* Instructions */}
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <h3 className="mb-2 font-medium">How to scan:</h3>
              <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600">
                <li>Click "Start Scanning" to activate camera</li>
                <li>Point camera at QR code on bundle</li>
                <li>Hold steady until code is detected</li>
                <li>Bundle information will appear automatically</li>
              </ol>
            </div>
          </div>
        )}

        {/* Scanned Result */}
        {scannedData && bundleInfo && (
          <div className="space-y-4">
            {/* Success Icon */}
            <div className="rounded-lg border border-green-700 bg-green-900 p-6 text-center">
              <CheckCircle className="mx-auto mb-3 h-16 w-16 text-green-400" />
              <h2 className="text-xl font-bold text-green-200">
                Bundle Scanned!
              </h2>
              <p className="mt-1 text-sm text-green-300">Code: {scannedData}</p>
            </div>

            {/* Bundle Information */}
            <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
              <div className="border-b border-gray-600 bg-gray-700 px-4 py-3">
                <h3 className="font-medium">Bundle Information</h3>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bundle ID:</span>
                  <span className="font-medium">
                    {bundleInfo.bundle_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order:</span>
                  <span className="font-medium">
                    {bundleInfo.order?.order_number || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-medium">
                    {bundleInfo.quantity} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      bundleInfo.status === "COMPLETED"
                        ? "bg-green-900 text-green-200"
                        : bundleInfo.status === "IN_PROGRESS"
                          ? "bg-blue-900 text-blue-200"
                          : "bg-gray-700 text-gray-600"
                    }`}
                  >
                    {bundleInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <h3 className="mb-3 font-medium">Update Status</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateBundleStatus("IN_PROGRESS")}
                  className="rounded-lg bg-blue-600 px-4 py-3 font-medium transition-colors hover:bg-blue-700"
                >
                  Start Work
                </button>
                <button
                  onClick={() => updateBundleStatus("COMPLETED")}
                  className="rounded-lg bg-green-600 px-4 py-3 font-medium transition-colors hover:bg-green-700"
                >
                  Complete
                </button>
                <button
                  onClick={() => updateBundleStatus("ON_HOLD")}
                  className="rounded-lg bg-yellow-600 px-4 py-3 font-medium transition-colors hover:bg-yellow-700"
                >
                  Hold
                </button>
                <button
                  onClick={() => updateBundleStatus("DEFECT")}
                  className="rounded-lg bg-red-600 px-4 py-3 font-medium transition-colors hover:bg-red-700"
                >
                  Report Issue
                </button>
              </div>
            </div>

            {/* Scan Another Button */}
            <button
              onClick={resetScanner}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-700 px-6 py-4 font-medium text-white transition-colors hover:bg-gray-600"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Scan Another Bundle</span>
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && !bundleInfo && scannedData && (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-700 bg-red-900 p-6 text-center">
              <XCircle className="mx-auto mb-3 h-16 w-16 text-red-400" />
              <h2 className="text-xl font-bold text-red-200">Error</h2>
              <p className="mt-1 text-sm text-red-300">{error}</p>
              <p className="mt-2 text-xs text-red-400">Code: {scannedData}</p>
            </div>

            <button
              onClick={resetScanner}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-700 px-6 py-4 font-medium text-white transition-colors hover:bg-gray-600"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
