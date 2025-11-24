"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, AlertCircle } from "lucide-react";

export default function PaymentsPage() {
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
            <div className="rounded-lg bg-emerald-100 p-3">
              <Wallet className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600">Track incoming payments from clients</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-emerald-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-600" />
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Feature Under Development
              </h2>
              <p className="mb-4 text-gray-600">
                The Payments module will help you:
              </p>
              <ul className="mb-6 space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  Record and track client payments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  Match payments to invoices automatically
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  Manage payment methods (Cash, Check, Bank Transfer)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  View payment history and aging reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
