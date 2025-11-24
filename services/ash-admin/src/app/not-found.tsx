"use client";

// Custom 404 page for App Router (without Html component to avoid build warnings)
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="px-4 text-center">
        <h1 className="text-9xl font-bold text-orange-600">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="mb-8 mt-2 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
