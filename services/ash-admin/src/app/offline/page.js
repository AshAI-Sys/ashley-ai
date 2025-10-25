"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OfflinePage;
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
function OfflinePage() {
    const router = (0, navigation_1.useRouter)();
    const handleRetry = () => {
        if (navigator.onLine) {
            router.push("/dashboard");
        }
        else {
            window.location.reload();
        }
    };
    return (<div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mb-6">
          <lucide_react_1.WifiOff className="mx-auto h-24 w-24 text-gray-500"/>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          You're Offline
        </h1>

        <p className="mb-6 text-gray-600">
          It looks like you've lost your internet connection. Some features may
          not be available.
        </p>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Don't worry!</strong> Your work is safe. Any changes you
            make will be synced when you're back online.
          </p>
        </div>

        <button onClick={handleRetry} className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
          <lucide_react_1.RefreshCw className="h-5 w-5"/>
          <span>Try Again</span>
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Cached data is available for recent pages
        </p>
      </div>
    </div>);
}
