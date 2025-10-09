'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface POLineItem {
  id: string;
  material: string;
  quantity: string;
  unit_price: string;
  total: number;
}

export default function CreatePOPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierParam = searchParams?.get('supplier') || '';

  const [formData, setFormData] = useState({
    po_number: `PO-${Date.now().toString().slice(-6)}`,
    supplier: supplierParam,
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    payment_terms: 'NET30',
    notes: ''
  });

  const [lineItems, setLineItems] = useState<POLineItem[]>([
    { id: '1', material: '', quantity: '', unit_price: '', total: 0 }
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), material: '', quantity: '', unit_price: '', total: 0 }
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof POLineItem, value: string) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          const qty = parseFloat(updated.quantity) || 0;
          const price = parseFloat(updated.unit_price) || 0;
          updated.total = qty * price;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.alert('Purchase Order created successfully!');
    router.push('/inventory');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/inventory')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Inventory
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Purchase Order</h1>
          <p className="text-gray-600 mt-2">Create a new purchase order for materials</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* PO Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* PO Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.po_number}
                onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Select or enter supplier..."
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NET30">Net 30</option>
                <option value="NET60">Net 60</option>
                <option value="COD">Cash on Delivery</option>
                <option value="ADVANCE">Advance Payment</option>
                <option value="50_50">50/50 Payment</option>
              </select>
            </div>

            {/* Order Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          required
                          value={item.material}
                          onChange={(e) => updateLineItem(item.id, 'material', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Material name..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">₱{item.total.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 flex justify-end">
              <div className="bg-gray-50 rounded-lg p-4 min-w-[300px]">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₱{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or special instructions..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/inventory')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
