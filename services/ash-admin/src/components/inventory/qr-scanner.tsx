'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        setIsScanning(true);
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const videoInputDevices = await reader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          throw new Error('No camera found');
        }

        // Use back camera on mobile if available
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear')
        );
        
        const selectedDevice = backCamera || videoInputDevices[0];

        if (videoRef.current) {
          reader.decodeFromVideoDevice(
            selectedDevice.deviceId,
            videoRef.current,
            (result: Result | undefined, error: Error | undefined) => {
              if (result) {
                const text = result.getText();
                onScan(text);
              }
              if (error && error.message !== 'No MultiFormat Readers were able to detect the code.') {
                console.error('QR Scanner error:', error);
              }
            }
          );
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        if (onError) {
          onError(error);
        }
      }
    };

    startScanner();

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [onScan, onError]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Camera Error</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-4 border-white border-opacity-50 w-64 h-64 rounded-lg">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
          </div>
        </div>
      )}
    </div>
  );
}
