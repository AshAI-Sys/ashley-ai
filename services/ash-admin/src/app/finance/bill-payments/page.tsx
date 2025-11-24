"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, AlertCircle } from "lucide-react";

export default function BillPaymentsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.push("/finance")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Finance
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bill Payments</h1>
              <p className="text-gray-600">Track supplier and vendor payments</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-green-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Feature Under Development
              </h2>
              <p className="mb-4 text-gray-600">
                The Bill Payments module will help you:
              </p>
              <ul className="mb-6 space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Track payments to suppliers and vendors
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Manage payment schedules and due dates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Record payment methods and receipts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  View payment history and analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
