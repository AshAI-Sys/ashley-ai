'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Download, DollarSign } from 'lucide-react';

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await fetch('/api/client-portal/payments');
      const data = await response.json();
      if (data.success) {
        setInvoices(data.invoices);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      PAID: { bg: 'bg-green-100', text: 'text-green-800' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
      PARTIAL: { bg: 'bg-blue-100', text: 'text-blue-800' },
    };
    const c = (config[status] || config.PENDING)!;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
            <p className="text-3xl font-bold text-red-600">₱{summary.outstanding_balance.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Total Paid</p>
            <p className="text-3xl font-bold text-green-600">₱{summary.total_paid.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Overdue Invoices</p>
            <p className="text-3xl font-bold text-orange-600">{summary.overdue_count}</p>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
          <CreditCard className="w-8 h-8 text-purple-600" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Paid</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Balance</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{invoice.order?.order_number || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">₱{invoice.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₱{invoice.paid_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                      ₱{(invoice.total_amount - invoice.paid_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
