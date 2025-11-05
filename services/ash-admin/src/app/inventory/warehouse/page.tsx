'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Warehouse, Package, ArrowRightLeft, Edit, FileText, Plus, Minus, CheckCircle, XCircle } from 'lucide-react';

type Tab = 'delivery' | 'transfer' | 'adjust' | 'report';

interface DeliveryItem {
  variant_id?: string;
  quantity?: number;
  notes?: string;
}

interface TransferItem {
  variant_id?: string;
  quantity?: number;
}

export default function WarehousePage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delivery Form State
  const [deliverySupplier, setDeliverySupplier] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Transfer Form State
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [transferNotes, setTransferNotes] = useState('');

  // Adjust Form State
  const [adjustVariant, setAdjustVariant] = useState('');
  const [adjustLocation, setAdjustLocation] = useState('');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  const addDeliveryItem = () => {
    setDeliveryItems([...deliveryItems, { variant_id: '', quantity: 0 }]);
  };

  const updateDeliveryItem = (index: number, field: keyof DeliveryItem, value: any) => {
    const updated = [...deliveryItems];
    updated[index] = { ...updated[index], [field]: value };
    setDeliveryItems(updated);
  };

  const removeDeliveryItem = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
  };

  const handleDeliverySubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // workspace_id and received_by from auth token
      const data = {
        receiving_location_id: deliveryLocation,
        supplier_name: deliverySupplier,
        items: deliveryItems,
        notes: deliveryNotes,
      };

      const response = await fetch('/api/inventory/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process delivery');
      }

      const result = await response.json();
      setSuccess(`Delivery ${result.delivery_number} processed successfully!`);

      // Reset form
      setDeliverySupplier('');
      setDeliveryLocation('');
      setDeliveryItems([]);
      setDeliveryNotes('');

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addTransferItem = () => {
    setTransferItems([...transferItems, { variant_id: '', quantity: 0 }]);
  };

  const updateTransferItem = (index: number, field: keyof TransferItem, value: any) => {
    const updated = [...transferItems];
    updated[index] = { ...updated[index], [field]: value };
    setTransferItems(updated);
  };

  const removeTransferItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  const handleTransferSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // workspace_id and performed_by from auth token
      const data = {
        from_location_id: transferFrom,
        to_location_id: transferTo,
        items: transferItems,
        notes: transferNotes,
      };

      const response = await fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process transfer');
      }

      setSuccess('Stock transfer completed successfully!');

      // Reset form
      setTransferFrom('');
      setTransferTo('');
      setTransferItems([]);
      setTransferNotes('');

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // workspace_id and performed_by from auth token
      const data = {
        variant_id: adjustVariant,
        location_id: adjustLocation,
        quantity_change: parseInt(adjustQuantity),
        reason: adjustReason,
        notes: adjustNotes,
      };

      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adjust stock');
      }

      const result = await response.json();
      setSuccess(`Stock adjusted! Previous: ${result.previous_quantity}, New: ${result.new_quantity}`);

      // Reset form
      setAdjustVariant('');
      setAdjustLocation('');
      setAdjustQuantity('');
      setAdjustReason('');
      setAdjustNotes('');

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Auth check
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Warehouse className="w-8 h-8 text-blue-600" />
            Warehouse Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">User: {user.email}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 ${
                activeTab === 'delivery'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              Receive Delivery
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 ${
                activeTab === 'transfer'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowRightLeft className="w-5 h-5" />
              Transfer Stock
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 ${
                activeTab === 'adjust'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Edit className="w-5 h-5" />
              Adjust Stock
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 ${
                activeTab === 'report'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              Reports
            </button>
          </div>

          <div className="p-6">
            {/* Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Receive New Delivery</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      value={deliverySupplier}
                      onChange={(e) => setDeliverySupplier(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Receiving Location ID
                    </label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g., warehouse-001"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-semibold text-gray-700">Items</label>
                    <button
                      onClick={addDeliveryItem}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                  {deliveryItems.map((item, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={item.variant_id}
                        onChange={(e) => updateDeliveryItem(index, 'variant_id', e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg"
                        placeholder="Variant ID"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateDeliveryItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-32 px-4 py-2 border rounded-lg"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() => removeDeliveryItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                    rows={3}
                    placeholder="Optional notes"
                  />
                </div>

                <button
                  onClick={handleDeliverySubmit}
                  disabled={loading || !deliverySupplier || !deliveryLocation || deliveryItems.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg"
                >
                  {loading ? 'Processing...' : 'Process Delivery'}
                </button>
              </div>
            )}

            {/* Transfer Tab */}
            {activeTab === 'transfer' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Transfer Stock Between Locations</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Location
                    </label>
                    <input
                      type="text"
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g., warehouse-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      To Location
                    </label>
                    <input
                      type="text"
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g., store-001"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-semibold text-gray-700">Items to Transfer</label>
                    <button
                      onClick={addTransferItem}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                  {transferItems.map((item, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={item.variant_id}
                        onChange={(e) => updateTransferItem(index, 'variant_id', e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg"
                        placeholder="Variant ID"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateTransferItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-32 px-4 py-2 border rounded-lg"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() => removeTransferItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                    rows={3}
                    placeholder="Optional notes"
                  />
                </div>

                <button
                  onClick={handleTransferSubmit}
                  disabled={loading || !transferFrom || !transferTo || transferItems.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg"
                >
                  {loading ? 'Processing...' : 'Transfer Stock'}
                </button>
              </div>
            )}

            {/* Adjust Tab */}
            {activeTab === 'adjust' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Manual Stock Adjustment</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Variant ID
                    </label>
                    <input
                      type="text"
                      value={adjustVariant}
                      onChange={(e) => setAdjustVariant(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter variant ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location ID
                    </label>
                    <input
                      type="text"
                      value={adjustLocation}
                      onChange={(e) => setAdjustLocation(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g., warehouse-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity Change
                    </label>
                    <input
                      type="number"
                      value={adjustQuantity}
                      onChange={(e) => setAdjustQuantity(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="Use negative for decrease"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use negative numbers to decrease stock</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason
                    </label>
                    <select
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select reason</option>
                      <option value="Physical Count Correction">Physical Count Correction</option>
                      <option value="Damage">Damage</option>
                      <option value="Loss">Loss</option>
                      <option value="Return">Return</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (Required)
                  </label>
                  <textarea
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                    rows={3}
                    placeholder="Provide detailed notes for this adjustment"
                  />
                </div>

                <button
                  onClick={handleAdjustSubmit}
                  disabled={loading || !adjustVariant || !adjustLocation || !adjustQuantity || !adjustReason || !adjustNotes}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg"
                >
                  {loading ? 'Processing...' : 'Adjust Stock'}
                </button>
              </div>
            )}

            {/* Report Tab */}
            {activeTab === 'report' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Inventory Reports</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Reports</h3>
                  <p className="text-gray-600 mb-4">
                    Access detailed inventory reports from the main inventory management page.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="font-semibold text-gray-900">Stock Levels</p>
                      <p className="text-sm text-gray-600 mt-1">Current inventory status by material</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="font-semibold text-gray-900">Stock Movements</p>
                      <p className="text-sm text-gray-600 mt-1">Transfer and adjustment history</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="font-semibold text-gray-900">Low Stock Alerts</p>
                      <p className="text-sm text-gray-600 mt-1">Materials below reorder point</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    💡 Navigate to Inventory → Materials Management for detailed reports
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
