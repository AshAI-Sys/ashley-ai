"use client";

import { useEffect } from "react";

export const dynamic = 'force-dynamic';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="px-4 text-center">
        <h1 className="text-9xl font-bold text-red-600">500</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-800">
          Something went wrong
        </h2>
        <p className="mb-8 mt-2 text-gray-600">
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-block rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
