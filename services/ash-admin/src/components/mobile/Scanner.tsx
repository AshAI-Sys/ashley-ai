/**
 * QR/Barcode Scanner Component
 * Uses device camera to scan QR codes and barcodes
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Camera, Flashlight, FlashlightOff, X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScannerProps {
  onScan: (code: string, format: string) => void;
  onClose?: () => void;
}

interface ScanHistory {
  code: string;
  format: string;
  timestamp: Date;
}

export function Scanner({ onScan, onClose }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);

      // Initialize scanner
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Get available video devices
      const videoInputDevices = await reader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error("No camera found on this device");
      }

      // Prefer back camera on mobile
      const backCamera = videoInputDevices.find(
        device =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear")
      );
      const selectedDevice = backCamera || videoInputDevices[0];

      // Start decoding
      reader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const code = result.getText();
            const format = result.getBarcodeFormat().toString();

            // Vibrate on successful scan
            if ("vibrate" in navigator) {
              navigator.vibrate(200);
            }

            // Add to history
            setScanHistory(prev => [
              { code, format, timestamp: new Date() },
              ...prev.slice(0, 4), // Keep last 5 scans
            ]);

            // Call callback
            onScan(code, format);

            // Optional: Auto-close after scan
            // setTimeout(() => stopScanning(), 1000)
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error("Scan error:", error);
          }
        }
      );

      // Store stream for torch control
      if (videoRef.current?.srcObject) {
        setCameraStream(videoRef.current.srcObject as MediaStream);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(err.message || "Failed to access camera");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }

    setIsScanning(false);
  };

  const toggleTorch = async () => {
    if (!cameraStream) return;

    try {
      const track = cameraStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;

      if (capabilities.torch) {
        await track.applyConstraints({
          // @ts-ignore
          advanced: [{ torch: !torchEnabled }],
        });
        setTorchEnabled(!torchEnabled);
      } else {
        setError("Torch not supported on this device");
      }
    } catch (err) {
      console.error("Torch error:", err);
      setError("Failed to toggle torch");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim(), "MANUAL");
      setManualCode("");
      setShowManualEntry(false);
    }
  };

  if (showManualEntry) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between bg-gray-900 p-4 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManualEntry(false)}
            className="text-white"
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Enter Code Manually</h2>
          <div className="w-10" />
        </div>

        <form
          onSubmit={handleManualSubmit}
          className="flex flex-1 flex-col p-6"
        >
          <input
            type="text"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            placeholder="Enter QR code or barcode"
            autoFocus
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
          />
          <Button
            type="submit"
            size="lg"
            className="mt-4 h-14 w-full text-lg"
            disabled={!manualCode.trim()}
          >
            Submit Code
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 p-4 text-white">
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-lg font-semibold">Scan Code</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTorch}
          className="text-white"
          disabled={!cameraStream}
        >
          {torchEnabled ? (
            <Flashlight className="h-5 w-5" />
          ) : (
            <FlashlightOff className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Camera View */}
      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
            <Camera className="mb-4 h-16 w-16 text-red-500" />
            <p className="mb-2 text-lg font-semibold">Camera Error</p>
            <p className="mb-4 text-center text-sm text-gray-300">{error}</p>
            <Button
              onClick={startScanning}
              variant="outline"
              className="border-white text-white"
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              muted
            />

            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Viewfinder corners */}
                <div className="h-64 w-64 rounded-lg border-4 border-white opacity-50">
                  <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-blue-500" />
                  <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-blue-500" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-blue-500" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-blue-500" />
                </div>

                {/* Scanning line animation */}
                {isScanning && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="animate-scan h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
              <p className="mb-4 text-center text-sm">
                📷 Point camera at QR code or barcode
              </p>

              {/* Recent scans */}
              {scanHistory.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs text-gray-400">
                    Recently Scanned:
                  </p>
                  <div className="space-y-1">
                    {scanHistory.map((scan, index) => (
                      <div
                        key={index}
                        className="flex justify-between rounded bg-gray-800 bg-opacity-50 px-3 py-2 text-xs"
                      >
                        <span className="font-mono">{scan.code}</span>
                        <span className="text-gray-400">
                          {Math.floor(
                            (Date.now() - scan.timestamp.getTime()) / 1000
                          )}
                          s ago
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual entry button */}
              <Button
                onClick={() => setShowManualEntry(true)}
                variant="outline"
                className="w-full border-white text-white"
              >
                <Keyboard className="mr-2 h-4 w-4" />
                Enter Code Manually
              </Button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(256px);
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
