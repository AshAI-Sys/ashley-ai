"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";

/**
 * Credit Notes Page
 *
 * TODO: Implement full credit notes management
 * - List all credit notes
 * - Create new credit notes
 * - Link to invoices
 * - Track credit note status
 */
export default function CreditNotesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/finance")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Finance
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
              <p className="text-gray-600">Manage credit notes and refunds</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="rounded-lg border-2 border-blue-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Feature Under Development
              </h2>
              <p className="mb-4 text-gray-600">
                The Credit Notes module is being developed to help you:
              </p>
              <ul className="mb-6 space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Issue credit notes for returns and refunds
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Link credit notes to invoices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Track credit note status and usage
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Apply credits to future orders
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                For now, you can manage invoices and payments from the Finance dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            onClick={() => router.push("/finance/invoices")}
            className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-colors hover:bg-gray-50"
          >
            <h3 className="mb-1 font-semibold text-gray-900">Invoices</h3>
            <p className="text-sm text-gray-600">Manage invoices and billing</p>
          </button>
          <button
            onClick={() => router.push("/finance")}
            className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-colors hover:bg-gray-50"
          >
            <h3 className="mb-1 font-semibold text-gray-900">Finance Dashboard</h3>
            <p className="text-sm text-gray-600">View financial overview</p>
          </button>
        </div>
      </div>
    </div>
  );
}
