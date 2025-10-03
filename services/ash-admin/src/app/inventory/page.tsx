'use client';

import { useState } from 'react';
import {
  Package,
  TruckIcon,
  AlertTriangle,
  DollarSign,
  Barcode,
  Plus,
  Search,
  Download,
  Upload
} from 'lucide-react';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'materials' | 'suppliers' | 'purchase-orders' | 'alerts'>('materials');

  const summary = {
    total_materials: 145,
    total_value: 2850000,
    low_stock_count: 8,
    out_of_stock_count: 3,
    pending_pos: 5,
    monthly_waste_cost: 45000,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Materials, suppliers, and stock control</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Materials</p>
          <p className="text-2xl font-bold text-gray-900">{summary.total_materials}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Stock Value</p>
          <p className="text-2xl font-bold text-green-600">₱{(summary.total_value / 1000000).toFixed(1)}M</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700 mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-800">{summary.low_stock_count}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">{summary.out_of_stock_count}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 mb-1">Pending POs</p>
          <p className="text-2xl font-bold text-blue-800">{summary.pending_pos}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700 mb-1">Monthly Waste</p>
          <p className="text-2xl font-bold text-purple-800">₱{(summary.monthly_waste_cost / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'materials', label: 'Materials', icon: Package },
              { id: 'suppliers', label: 'Suppliers', icon: TruckIcon },
              { id: 'purchase-orders', label: 'Purchase Orders', icon: DollarSign },
              { id: 'alerts', label: 'Stock Alerts', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 inline-block mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'materials' && <MaterialsTab />}
          {activeTab === 'suppliers' && <SuppliersTab />}
          {activeTab === 'purchase-orders' && <PurchaseOrdersTab />}
          {activeTab === 'alerts' && <AlertsTab />}
        </div>
      </div>
    </div>
  );
}

function MaterialsTab() {
  const materials = [
    { sku: 'FAB-001', name: 'Cotton Fabric - White', category: 'FABRIC', stock: 500, unit: 'YARDS', reorder: 200, cost: 150 },
    { sku: 'THR-001', name: 'Polyester Thread - Black', category: 'THREAD', stock: 1500, unit: 'ROLLS', reorder: 500, cost: 45 },
    { sku: 'FAB-002', name: 'Denim Fabric - Blue', category: 'FABRIC', stock: 180, unit: 'YARDS', reorder: 200, cost: 280 },
    { sku: 'TRM-001', name: 'Metal Buttons - Silver', category: 'TRIM', stock: 5000, unit: 'PIECES', reorder: 2000, cost: 2.5 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials by SKU or name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Barcode className="w-4 h-4" />
            Scan Barcode
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Point</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.map((mat) => {
              const stockPercent = (mat.stock / (mat.reorder * 3)) * 100;
              const isLow = mat.stock <= mat.reorder;

              return (
                <tr key={mat.sku} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {mat.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {mat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {mat.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                        {mat.stock} {mat.unit}
                      </span>
                      {isLow && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {mat.reorder} {mat.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{mat.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">Adjust</button>
                    <button className="text-green-600 hover:text-green-800">Reorder</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuppliersTab() {
  const suppliers = [
    { name: 'Fabric Suppliers Inc.', contact: 'John Doe', email: 'john@fabrics.com', phone: '+63 917 123 4567', rating: 4.5 },
    { name: 'Thread & Trim Co.', contact: 'Jane Smith', email: 'jane@thread.com', phone: '+63 917 234 5678', rating: 4.8 },
    { name: 'Global Textiles', contact: 'Bob Johnson', email: 'bob@global.com', phone: '+63 917 345 6789', rating: 4.2 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Suppliers</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{supplier.rating}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Contact:</strong> {supplier.contact}</p>
              <p><strong>Email:</strong> {supplier.email}</p>
              <p><strong>Phone:</strong> {supplier.phone}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                Create PO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PurchaseOrdersTab() {
  const orders = [
    { po: 'PO-000123', supplier: 'Fabric Suppliers Inc.', date: '2024-10-01', delivery: '2024-10-08', amount: 125000, status: 'PENDING' },
    { po: 'PO-000124', supplier: 'Thread & Trim Co.', date: '2024-10-02', delivery: '2024-10-09', amount: 45000, status: 'APPROVED' },
    { po: 'PO-000125', supplier: 'Global Textiles', date: '2024-09-28', delivery: '2024-10-05', amount: 280000, status: 'RECEIVED' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Purchase Orders</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create PO
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.po} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.po}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.supplier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.delivery}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₱{order.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                    order.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {order.status === 'APPROVED' && (
                    <button className="text-green-600 hover:text-green-800">Mark Received</button>
                  )}
                  {order.status === 'PENDING' && (
                    <button className="text-blue-600 hover:text-blue-800">Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlertsTab() {
  const alerts = [
    { material: 'Denim Fabric - Blue', type: 'LOW_STOCK', severity: 'WARNING', current: 180, threshold: 200, message: 'Below reorder point' },
    { material: 'Cotton Fabric - Red', type: 'OUT_OF_STOCK', severity: 'CRITICAL', current: 0, threshold: 150, message: 'Completely out of stock' },
    { material: 'Zipper - Metal 10"', type: 'OUT_OF_STOCK', severity: 'CRITICAL', current: 0, threshold: 500, message: 'Completely out of stock' },
    { material: 'Elastic Band - 1"', type: 'LOW_STOCK', severity: 'WARNING', current: 450, threshold: 500, message: 'Below reorder point' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Stock Alerts</h2>
        <p className="text-gray-600">Materials requiring immediate attention</p>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`border-l-4 rounded-lg p-4 ${
              alert.severity === 'CRITICAL'
                ? 'bg-red-50 border-red-500'
                : 'bg-yellow-50 border-yellow-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-6 h-6 ${
                  alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'
                }`} />
                <div>
                  <h3 className="font-semibold text-gray-900">{alert.material}</h3>
                  <p className={`text-sm ${
                    alert.severity === 'CRITICAL' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {alert.message} • Current: {alert.current} / Threshold: {alert.threshold}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                  View Material
                </button>
                <button className={`px-4 py-2 text-sm text-white rounded ${
                  alert.severity === 'CRITICAL' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}>
                  Auto-Reorder
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Auto-Reordering Status</h3>
        <p className="text-sm text-blue-800 mb-4">
          Automatic purchase orders will be created when stock reaches reorder point
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">Auto-reorder enabled for 8 materials</span>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            Configure Auto-Reorder
          </button>
        </div>
      </div>
    </div>
  );
}
