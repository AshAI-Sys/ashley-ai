'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/dashboard');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <WifiOff className="h-24 w-24 mx-auto text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're Offline
        </h1>

        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Some features may not be available.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Don't worry!</strong> Your work is safe. Any changes you make will be synced
            when you're back online.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Try Again</span>
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Cached data is available for recent pages
        </p>
      </div>
    </div>
  );
}
