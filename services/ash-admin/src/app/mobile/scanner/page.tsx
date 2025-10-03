'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, CheckCircle, XCircle, RefreshCw, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
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
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  };

  const startScanning = async () => {
    try {
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use rear camera on mobile
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        setCameraPermission('granted');

        // Start scanning loop
        scanIntervalRef.current = setInterval(() => {
          captureAndDecode();
        }, 500); // Scan every 500ms
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please enable camera permissions.');
      setCameraPermission('denied');
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
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Use browser's built-in barcode detector if available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code']
        });
        const barcodes = await barcodeDetector.detect(canvas);

        if (barcodes.length > 0) {
          const qrData = barcodes[0].rawValue;
          handleQRCodeScanned(qrData);
        }
      } else {
        // Fallback: Manual QR detection (simplified)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = detectQRCode(imageData);
        if (code) {
          handleQRCodeScanned(code);
        }
      }
    } catch (err) {
      console.error('QR decode error:', err);
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
          'x-workspace-id': 'default-workspace',
        },
      });

      const data = await response.json();

      if (data.success) {
        setBundleInfo(data.bundle);
      } else {
        setError('Bundle not found');
      }
    } catch (err) {
      console.error('Bundle lookup error:', err);
      setError('Failed to retrieve bundle information');
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': 'default-workspace',
          'x-user-id': 'mobile-scanner',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Bundle status updated to: ${status}`);
        resetScanner();
      } else {
        setError('Failed to update bundle status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      setError('Failed to update bundle status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QrCode className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold">QR Scanner</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Camera Permission Info */}
        {cameraPermission === 'denied' && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-200">Camera Access Required</p>
                <p className="text-sm text-red-300 mt-1">
                  Please enable camera permissions in your browser settings to use the scanner.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner View */}
        {!scannedData && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 relative">
              {/* Video Preview */}
              <video
                ref={videoRef}
                className="w-full h-auto"
                playsInline
                muted
                style={{ maxHeight: '60vh' }}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-blue-500 rounded-lg w-64 h-64 animate-pulse"></div>
                </div>
              )}

              {/* No Camera Active */}
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
                  <div className="text-center">
                    <Camera className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scan Button */}
            {!scanning ? (
              <button
                onClick={startScanning}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
              >
                <Camera className="h-5 w-5" />
                <span>Start Scanning</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
              >
                <XCircle className="h-5 w-5" />
                <span>Stop Scanning</span>
              </button>
            )}

            {/* Instructions */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-medium mb-2">How to scan:</h3>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
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
            <div className="bg-green-900 border border-green-700 rounded-lg p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-200">Bundle Scanned!</h2>
              <p className="text-sm text-green-300 mt-1">Code: {scannedData}</p>
            </div>

            {/* Bundle Information */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                <h3 className="font-medium">Bundle Information</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bundle ID:</span>
                  <span className="font-medium">{bundleInfo.bundle_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order:</span>
                  <span className="font-medium">{bundleInfo.order?.order_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="font-medium">{bundleInfo.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bundleInfo.status === 'COMPLETED' ? 'bg-green-900 text-green-200' :
                    bundleInfo.status === 'IN_PROGRESS' ? 'bg-blue-900 text-blue-200' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {bundleInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="font-medium mb-3">Update Status</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateBundleStatus('IN_PROGRESS')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Work
                </button>
                <button
                  onClick={() => updateBundleStatus('COMPLETED')}
                  className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Complete
                </button>
                <button
                  onClick={() => updateBundleStatus('ON_HOLD')}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Hold
                </button>
                <button
                  onClick={() => updateBundleStatus('DEFECT')}
                  className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Report Issue
                </button>
              </div>
            </div>

            {/* Scan Another Button */}
            <button
              onClick={resetScanner}
              className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Scan Another Bundle</span>
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && !bundleInfo && scannedData && (
          <div className="space-y-4">
            <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-red-200">Error</h2>
              <p className="text-sm text-red-300 mt-1">{error}</p>
              <p className="text-xs text-red-400 mt-2">Code: {scannedData}</p>
            </div>

            <button
              onClick={resetScanner}
              className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-medium transition-colors"
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
