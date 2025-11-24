"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

/**
 * Order Edit Page - Redirects to view page
 *
 * TODO: Implement full edit functionality
 * For now, redirects to order details page with message
 */
export default function OrderEditPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to view page after showing message
    const timer = setTimeout(() => {
      router.push(`/orders/${params.id}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [params.id, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-blue-200 bg-white p-8 shadow-lg">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">
            Order Edit Feature
          </h1>

          {/* Message */}
          <div className="mb-6 space-y-3 text-center">
            <p className="text-gray-600">
              The order edit page is being enhanced with a full-featured form.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to order details...
            </p>
          </div>

          {/* Loading indicator */}
          <div className="mb-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-full animate-pulse bg-blue-600" style={{
                animation: "pulse 2s ease-in-out infinite"
              }}></div>
            </div>
          </div>

          {/* Manual redirect button */}
          <button
            onClick={() => router.push(`/orders/${params.id}`)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft size={18} />
            Go to Order Details Now
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Order ID: {params.id}
          </p>
        </div>
      </div>
    </div>
  );
}
