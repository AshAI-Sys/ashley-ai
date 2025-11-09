"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
          <WifiOff className="h-10 w-10 text-gray-600 dark:text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
          You're Offline
        </h1>

        {/* Description */}
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          It looks like you've lost your internet connection. Some features may not be available right now.
        </p>

        {/* Offline Capabilities */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            What you can still do:
          </h2>
          <ul className="space-y-2 text-left text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>View cached orders and production data</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Scan QR codes for bundle tracking</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>View client information</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Access previously loaded reports</span>
            </li>
          </ul>
        </div>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          You'll automatically reconnect when your internet is back
        </p>
      </div>
    </div>
  );
}
