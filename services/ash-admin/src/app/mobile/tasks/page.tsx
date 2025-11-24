"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ListTodo, AlertCircle } from "lucide-react";

export default function MobileTasksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-3">
              <ListTodo className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mobile Tasks</h1>
              <p className="text-gray-600">Production floor task management</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-indigo-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-indigo-600" />
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Feature Under Development
              </h2>
              <p className="mb-4 text-gray-600">
                The Mobile Tasks module will provide:
              </p>
              <ul className="mb-6 space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600">✓</span>
                  Mobile-friendly task assignment for workers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600">✓</span>
                  Real-time task status updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600">✓</span>
                  QR code scanning for task verification
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600">✓</span>
                  Production progress tracking
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                Use the Mobile App (React Native) for production floor operations.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            onClick={() => router.push("/mobile/dashboard")}
            className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-colors hover:bg-gray-50"
          >
            <h3 className="mb-1 font-semibold text-gray-900">Mobile Dashboard</h3>
            <p className="text-sm text-gray-600">View mobile operations overview</p>
          </button>
          <button
            onClick={() => router.push("/mobile/scanner")}
            className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-colors hover:bg-gray-50"
          >
            <h3 className="mb-1 font-semibold text-gray-900">Scanner</h3>
            <p className="text-sm text-gray-600">QR code scanner for production</p>
          </button>
        </div>
      </div>
    </div>
  );
}
