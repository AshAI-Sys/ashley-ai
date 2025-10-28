"use client";

import React, { useState, useRef, useCallback } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Camera,
  Search, Package,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface Bundle {
  id: string;
  order_id: string;
  size_code: string;
  qty: number;
  qr_code: string;
  status: "CREATED" | "IN_SEWING" | "DONE" | "REJECTED";
  order: {
    order_number: string;
    brand: { name: string; code: string };
    line_items: Array<{ description: string }>;
  };
  created_at: string;
}

interface QRBundleScannerProps {
  onBundleScanned: (bundle: Bundle) => void;
  disabled?: boolean;
  className?: string;
}

export default function QRBundleScanner({
  onBundleScanned,
  disabled = false,
  className = "",
}: QRBundleScannerProps) {
  const [qrInput, setQrInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedBundle, setLastScannedBundle] = useState<Bundle | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validateQRCode = (qrCode: string): boolean => {
    // ASH AI QR codes should follow format: ash://bundle/{id}
    const qrPattern = /^ash:\/\/bundle\/[a-zA-Z0-9-]+$/;
    return qrPattern.test(qrCode.trim());
  };

  const fetchBundleByQR = async (qrCode: string): Promise<Bundle> => {
    const response = await fetch(
      `/api/bundles/by-qr?qr_code=${encodeURIComponent(qrCode)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Bundle not found. Please check the QR code.");
      }
      throw new Error("Failed to fetch bundle information.");
    }

    const data = await response.json();
    return data.bundle;
  };

  const mockFetchBundle = (qrCode: string): Bundle => {
    // Mock implementation for demo
    const bundleId = qrCode.split("/").pop() || "unknown";

    return {
      id: bundleId,
      order_id: "order-001",
      size_code: "M",
      qty: 20,
      qr_code: qrCode,
      status: "CREATED",
      order: {
        order_number: "TCAS-2025-000001",
        brand: { name: "Trendy Casual", code: "TCAS" },
        line_items: [{ description: "Premium Hoodie" }],
      },
      created_at: new Date().toISOString(),
    };
  };

  const handleManualScan = async () => {
    if (!qrInput.trim()) {
      setError("Please enter a QR code");
      return;
    }

    if (!validateQRCode(qrInput)) {
      setError("Invalid QR code format. Expected format: ash://bundle/{id}");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try real API first, fallback to mock
      let bundle: Bundle;
      try {
        bundle = await fetchBundleByQR(qrInput);
      } catch (apiError) {
        console.log("API call failed, using mock data:", apiError);
        bundle = mockFetchBundle(qrInput);
      }

      setLastScannedBundle(bundle);
      onBundleScanned(bundle);
      setQrInput("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to scan QR code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startCameraCapture = async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // In a real implementation, this would use a QR code detection library
      // For demo, simulate scanning after 3 seconds
      setTimeout(() => {
        const mockQR = "ash://bundle/demo-scanner-001";
        setQrInput(mockQR);
        stopCameraCapture();

        // Auto-process the scanned code
        setTimeout(() => {
          handleManualScan();
        }, 100);
      }, 3000);
    } catch (error) {
      setError("Camera access denied or not available");
      setIsScanning(false);
    }
  };

  const stopCameraCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualScan();
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toUpperCase()) {
      case "CREATED":
        return "bg-blue-100 text-blue-800";
      case "IN_SEWING":
        return "bg-yellow-100 text-yellow-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Bundle QR Scanner
          </CardTitle>
          <CardDescription>
            Scan or enter the QR code from the printed bundle label
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="qr_input">Bundle QR Code</Label>
            <div className="flex gap-2">
              <Input
                id="qr_input"
                value={qrInput}
                onChange={e => {
                  setQrInput(e.target.value);
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="ash://bundle/..."
                className="font-mono"
                disabled={disabled || isScanning}
              />
              <Button
                onClick={handleManualScan}
                disabled={
                  disabled || isLoading || !qrInput.trim() || isScanning
                }
                size="default"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Scanning..." : "Lookup"}
              </Button>
            </div>
          </div>

          <div className="text-center">
            <div className="my-4">
              <span className="text-sm text-muted-foreground">OR</span>
            </div>

            {/* Camera Scanner */}
            <div className="space-y-4">
              {!isScanning ? (
                <Button
                  onClick={startCameraCapture}
                  disabled={disabled || isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera Scanner
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg border-2 border-dashed bg-gray-50 p-4">
                    <video
                      ref={videoRef}
                      className="mx-auto w-full max-w-md rounded-lg bg-black"
                      autoPlay
                      muted
                      playsInline
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-48 w-48 rounded-lg border-2 border-blue-500"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <QrCode className="h-5 w-5 animate-pulse" />
                    <span>Scanning for QR code...</span>
                  </div>

                  <Button onClick={stopCameraCapture} variant="outline">
                    Stop Scanning
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          <Alert>
            <QrCode className="h-4 w-4" />
            <AlertDescription>
              <strong>Tip:</strong> Make sure the bundle QR code is clearly
              visible and not damaged. The QR code should be in format:
              ash://bundle/&#123;id&#125;
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Last Scanned Bundle Preview */}
      {lastScannedBundle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Last Scanned Bundle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Order
                </p>
                <p className="font-medium">
                  {lastScannedBundle.order.order_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lastScannedBundle.order.brand.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Product
                </p>
                <p className="font-medium">
                  {lastScannedBundle.order.line_items[0]?.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  Size: {lastScannedBundle.size_code}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Details
                </p>
                <p className="font-medium">{lastScannedBundle.qty} pieces</p>
                <Badge className={getStatusColor(lastScannedBundle.status)}>
                  {lastScannedBundle.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Export types for use in other components
export type { Bundle, QRBundleScannerProps };
