"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, AlertCircle } from "lucide-react";

export default function BrandPLPage() {
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
            <div className="rounded-lg bg-purple-100 p-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand P&L</h1>
              <p className="text-gray-600">Profit & Loss analysis by brand</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-purple-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-purple-600" />
            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Feature Under Development
              </h2>
              <p className="mb-4 text-gray-600">
                The Brand P&L module will provide:
              </p>
              <ul className="mb-6 space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  Profit and loss analysis per brand
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  Revenue and cost breakdown
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  Margin analysis and profitability insights
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  Comparative brand performance reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
