"use client";

import { useRouter } from "next/navigation";
import {
  Store,
  CreditCard,
  Warehouse,
  Settings,
  QrCode,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function RetailInventoryPage() {
  const router = useRouter();

  const modules = [
    {
      id: "store",
      title: "Store Interface",
      description: "QR scanner for store clerks to check product details",
      icon: Store,
      href: "/inventory/retail/store",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      features: ["Scan QR codes", "View stock levels", "Product details", "Location tracking"],
    },
    {
      id: "cashier",
      title: "Cashier (POS)",
      description: "Point of Sale system with auto stock deduction",
      icon: CreditCard,
      href: "/inventory/retail/cashier",
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700",
      features: ["Process sales", "Auto deduct stock", "Payment methods", "Receipt generation"],
    },
    {
      id: "warehouse",
      title: "Warehouse Operations",
      description: "Manage deliveries, transfers, and adjustments",
      icon: Warehouse,
      href: "/inventory/retail/warehouse",
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      features: ["Receive deliveries", "Stock transfers", "Damage adjustments", "Stock counts"],
    },
    {
      id: "admin",
      title: "Admin Dashboard",
      description: "Product management, reports, and monitoring",
      icon: Settings,
      href: "/inventory/retail/admin",
      color: "bg-orange-600",
      hoverColor: "hover:bg-orange-700",
      features: ["Product CRUD", "Reports", "Real-time monitoring", "Low stock alerts"],
    },
  ];

  const summary = {
    total_products: 256,
    total_stock_value: 1250000,
    low_stock_count: 12,
    out_of_stock_count: 5,
    sales_today: 45,
    revenue_today: 85000,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR-Based Retail Inventory</h1>
            <p className="mt-2 text-gray-600">
              Store, Cashier, Warehouse, and Admin operations
            </p>
          </div>
          <button
            onClick={() => router.push("/inventory")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Back to Materials Inventory
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Total Products</p>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.total_products}</p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Stock Value</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ₱{(summary.total_stock_value / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-yellow-700">Low Stock</p>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-800">{summary.low_stock_count}</p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-red-700">Out of Stock</p>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-800">{summary.out_of_stock_count}</p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-blue-700">Sales Today</p>
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-800">{summary.sales_today}</p>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-green-700">Revenue Today</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-800">
            ₱{(summary.revenue_today / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              className="group rounded-lg bg-white p-6 shadow transition-all hover:shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`rounded-lg ${module.color} p-3 transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <button
                  onClick={() => router.push(module.href)}
                  className={`rounded-lg ${module.color} px-4 py-2 text-white transition-colors ${module.hoverColor}`}
                >
                  Open
                </button>
              </div>

              <h3 className="mb-2 text-xl font-bold text-gray-900">{module.title}</h3>
              <p className="mb-4 text-gray-600">{module.description}</p>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Features:</p>
                <ul className="space-y-1">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <span className="mr-2 text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <button
            onClick={() => router.push("/inventory/retail/store")}
            className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <QrCode className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Scan Product</p>
              <p className="text-sm text-gray-600">Check stock levels</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/inventory/retail/cashier")}
            className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <CreditCard className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">New Sale</p>
              <p className="text-sm text-gray-600">Process transaction</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/inventory/retail/warehouse")}
            className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <Warehouse className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-semibold text-gray-900">Receive Stock</p>
              <p className="text-sm text-gray-600">Log delivery</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/inventory/retail/admin")}
            className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 text-left transition-colors hover:bg-gray-50"
          >
            <Settings className="h-6 w-6 text-orange-600" />
            <div>
              <p className="font-semibold text-gray-900">Admin Panel</p>
              <p className="text-sm text-gray-600">Manage products</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
