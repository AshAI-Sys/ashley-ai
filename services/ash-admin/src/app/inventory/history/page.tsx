'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  History,
  Search,
  Filter,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import HydrationSafeIcon from '@/components/hydration-safe-icon';

interface StockLedgerEntry {
  id: string;
  transaction_type: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  performed_by: string | null;
  created_at: string;
  variant: {
    id: string;
    sku: string;
    size_code: string;
    color: string | null;
    product: {
      product_name: string;
      category: string;
    };
  };
  location: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

interface Statistics {
  [key: string]: {
    count: number;
    total_quantity: number;
  };
}

export default function InventoryHistoryPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({});

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('');
  const [referenceTypeFilter, setReferenceTypeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchStockLedger();
  }, [token, transactionTypeFilter, referenceTypeFilter, startDate, endDate, page]);

  const fetchStockLedger = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (transactionTypeFilter) params.append('transaction_type', transactionTypeFilter);
      if (referenceTypeFilter) params.append('reference_type', referenceTypeFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/inventory/stock-ledger?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock ledger');
      }

      const result = await response.json();
      setEntries(result.data || []);
      setStatistics(result.statistics || {});
      setTotalPages(result.pagination.pages);
      setTotalEntries(result.pagination.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
      case 'ADJUSTMENT':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'OUT':
      case 'SALE':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'TRANSFER':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'IN':
      case 'ADJUSTMENT':
        return <ArrowUpCircle className="w-4 h-4" />;
      case 'OUT':
      case 'SALE':
        return <ArrowDownCircle className="w-4 h-4" />;
      case 'TRANSFER':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      entry.variant.product.product_name.toLowerCase().includes(search) ||
      entry.variant.sku.toLowerCase().includes(search) ||
      entry.location.name.toLowerCase().includes(search) ||
      (entry.notes && entry.notes.toLowerCase().includes(search))
    );
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Product', 'SKU', 'Size', 'Color', 'Location', 'Type', 'Quantity Change', 'Before', 'After', 'Reference', 'Notes', 'Performed By'];
    const rows = filteredEntries.map(entry => [
      new Date(entry.created_at).toLocaleString(),
      entry.variant.product.product_name,
      entry.variant.sku,
      entry.variant.size_code,
      entry.variant.color || 'N/A',
      entry.location.name,
      entry.transaction_type,
      entry.quantity_change,
      entry.quantity_before,
      entry.quantity_after,
      entry.reference_type || 'N/A',
      entry.notes || 'N/A',
      entry.user?.full_name || entry.user?.email || 'System'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HydrationSafeIcon
                Icon={History}
                className="w-6 h-6 text-purple-600"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory History</h1>
              <p className="text-sm text-gray-500">Complete transaction ledger for all inventory movements</p>
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statistics).map(([type, stat]) => (
          <div key={type} className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderLeftColor: getTransactionTypeColor(type).includes('green') ? '#10b981' : getTransactionTypeColor(type).includes('red') ? '#ef4444' : '#3b82f6' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{type}</span>
              {getTransactionTypeIcon(type)}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stat.total_quantity > 0 ? '+' : ''}{stat.total_quantity} units
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products, SKU, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Transaction Type Filter */}
          <select
            value={transactionTypeFilter}
            onChange={(e) => setTransactionTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Transaction Types</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="SALE">SALE</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
          </select>

          {/* Reference Type Filter */}
          <select
            value={referenceTypeFilter}
            onChange={(e) => setReferenceTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Reference Types</option>
            <option value="SALE">SALE</option>
            <option value="DELIVERY">DELIVERY</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Start Date"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchStockLedger}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No inventory transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Before</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{entry.variant.product.product_name}</div>
                        <div className="text-gray-500 text-xs">
                          {entry.variant.sku} | {entry.variant.size_code}
                          {entry.variant.color && ` | ${entry.variant.color}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.location.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTransactionTypeColor(entry.transaction_type)}`}>
                          {getTransactionTypeIcon(entry.transaction_type)}
                          {entry.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={entry.quantity_change > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.quantity_before}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                        {entry.quantity_after}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.reference_type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {entry.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.user?.full_name || entry.user?.email || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalEntries)}</span> of{' '}
                <span className="font-medium">{totalEntries}</span> transactions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-1 text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
