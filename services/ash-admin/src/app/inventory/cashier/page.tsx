"use client";

import { Smartphone, QrCode, ShoppingCart, CreditCard } from "lucide-react";

export default function CashierPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cashier / POS System</h1>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-blue-600" />

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Use the Ashley AI Mobile App
          </h2>

          <p className="text-gray-600 mb-6">
            For the best Point of Sale experience, use the Ashley AI Mobile App on your tablet or smartphone.
            The mobile app is optimized for cashier operations with a faster, touch-friendly interface.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <QrCode className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">QR Scanning</h3>
              <p className="text-sm text-gray-600">
                Fast product lookup with camera
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">Cart Management</h3>
              <p className="text-sm text-gray-600">
                Add items and calculate totals
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-1">Payment Processing</h3>
              <p className="text-sm text-gray-600">
                Cash and change calculation
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Setup Instructions:</h3>
            <ol className="text-left text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">1.</span>
                <span>Download the Ashley AI Mobile App from the app store</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">2.</span>
                <span>Log in with your cashier credentials</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">3.</span>
                <span>Navigate to the Cashier POS screen</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">4.</span>
                <span>Start scanning products and processing sales</span>
              </li>
            </ol>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            💡 The mobile app is located in: <code className="bg-white px-2 py-1 rounded">services/ash-mobile</code>
          </div>
        </div>
      </div>
    </div>
  );
}
