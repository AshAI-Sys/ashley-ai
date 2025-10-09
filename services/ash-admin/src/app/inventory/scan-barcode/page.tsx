'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, Camera } from 'lucide-react';

export default function ScanBarcodePage() {
  const router = useRouter();
  const [scannedCode, setScannedCode] = useState('');

  const handleScan = () => {
    window.alert('Barcode scanning feature will be implemented with camera integration');
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    window.alert(`Looking up material with code: ${scannedCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/inventory')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Inventory
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Scan Barcode</h1>
          <p className="text-gray-600 mt-2">Scan material barcodes for quick lookup</p>
        </div>

        {/* Scanner */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>
            <button
              onClick={handleScan}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Camera className="w-5 h-5" />
              Start Camera Scanner
            </button>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
            <form onSubmit={handleManualEntry} className="flex gap-4">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Enter barcode or SKU..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Look Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
