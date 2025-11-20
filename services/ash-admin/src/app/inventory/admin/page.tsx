'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  BarChart3,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  MapPin,
  RefreshCw,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate as formatDateUtil } from "@/lib/utils/date";

interface InventoryReport {
  success: boolean;
  summary: {
    total_items: number;
    total_quantity: number;
    total_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
    by_location: Array<{
      location_id: string;
      location_code: string;
      location_name: string;
      total_items: number;
      total_quantity: number;
      total_value: number;
      low_stock_items: number;
      out_of_stock_items: number;
    }>;
  };
  items: Array<{
    product_id: string;
    product_name: string;
    product_category: string;
    variant_id: string;
    variant_name: string;
    sku: string;
    size: string;
    color: string;
    location_id: string;
    location_code: string;
    location_name: string;
    quantity: number;
    unit_price: number;
    total_value: number;
    reorder_point: number;
    is_low_stock: boolean;
    is_out_of_stock: boolean;
  }>;
}

export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // workspace_id comes from auth token
      const response = await fetch('/api/inventory/report', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load inventory report');
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const filteredItems = report?.items.filter((item) => {
    if (filter === 'low_stock') return item.is_low_stock && !item.is_out_of_stock;
    if (filter === 'out_of_stock') return item.is_out_of_stock;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold mb-2">Error Loading Inventory</p>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadReport}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Inventory Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage your inventory</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Items</h3>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{report.summary.total_items}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Quantity</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {report.summary.total_quantity.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Value</h3>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              ₱{report.summary.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Low Stock</h3>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {report.summary.low_stock_count}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Out of Stock</h3>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {report.summary.out_of_stock_count}
            </p>
          </div>
        </div>

        {/* Location Summary */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Stock by Location
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.summary.by_location.map((loc) => (
                <div
                  key={loc.location_id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{loc.location_name}</h3>
                      <p className="text-sm text-gray-500">{loc.location_code}</p>
                    </div>
                    {loc.low_stock_items > 0 && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                        {loc.low_stock_items} low
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Items</p>
                      <p className="font-bold text-gray-800">{loc.total_items}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-bold text-gray-800">{loc.total_quantity}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Value</p>
                      <p className="font-bold text-blue-600">
                        ₱{loc.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Link
            href="/inventory/store"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md p-6 text-center transition-colors"
          >
            <Package className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Store Scanner</h3>
            <p className="text-sm opacity-90 mt-1">Scan QR codes</p>
          </Link>

          <Link
            href="/inventory/cashier"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md p-6 text-center transition-colors"
          >
            <DollarSign className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Cashier POS</h3>
            <p className="text-sm opacity-90 mt-1">Process sales</p>
          </Link>

          <Link
            href="/inventory/warehouse"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md p-6 text-center transition-colors"
          >
            <Package className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Warehouse</h3>
            <p className="text-sm opacity-90 mt-1">Manage stock</p>
          </Link>

          <button
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-md p-6 text-center transition-colors"
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Reports</h3>
            <p className="text-sm opacity-90 mt-1">View analytics</p>
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Inventory Items</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({report.items.length})
                </button>
                <button
                  onClick={() => setFilter('low_stock')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    filter === 'low_stock'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Low Stock ({report.summary.low_stock_count})
                </button>
                <button
                  onClick={() => setFilter('out_of_stock')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    filter === 'out_of_stock'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Out of Stock ({report.summary.out_of_stock_count})
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No items to display
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{item.product_name}</p>
                          <p className="text-sm text-gray-600">{item.variant_name}</p>
                          {item.size && (
                            <span className="text-xs text-gray-500">Size: {item.size}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.sku}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.location_name}
                          </p>
                          <p className="text-xs text-gray-500">{item.location_code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold ${
                            item.is_out_of_stock
                              ? 'text-red-600'
                              : item.is_low_stock
                              ? 'text-orange-600'
                              : 'text-gray-800'
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        ₱{item.unit_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                        ₱{item.total_value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {item.is_out_of_stock ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : item.is_low_stock ? (
                          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
