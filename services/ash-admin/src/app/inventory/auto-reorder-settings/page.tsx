'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, ToggleLeft, ToggleRight } from 'lucide-react';

interface AutoReorderRule {
  id: string;
  material: string;
  sku: string;
  reorder_point: number;
  reorder_quantity: number;
  preferred_supplier: string;
  auto_enabled: boolean;
}

export default function AutoReorderSettingsPage() {
  const router = useRouter();
  const [rules, setRules] = useState<AutoReorderRule[]>([
    { id: '1', material: 'Cotton Fabric - White', sku: 'FAB-001', reorder_point: 200, reorder_quantity: 500, preferred_supplier: 'Fabric Suppliers Inc.', auto_enabled: true },
    { id: '2', material: 'Polyester Thread - Black', sku: 'THR-001', reorder_point: 500, reorder_quantity: 1000, preferred_supplier: 'Thread & Trim Co.', auto_enabled: true },
    { id: '3', material: 'Denim Fabric - Blue', sku: 'FAB-002', reorder_point: 200, reorder_quantity: 300, preferred_supplier: 'Fabric Suppliers Inc.', auto_enabled: false },
    { id: '4', material: 'Metal Buttons - Silver', sku: 'TRM-001', reorder_point: 2000, reorder_quantity: 5000, preferred_supplier: 'Global Textiles', auto_enabled: true },
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    auto_approve_pos: false,
    notify_on_creation: true,
    max_daily_pos: 10,
    min_order_value: 5000
  });

  const toggleRule = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, auto_enabled: !rule.auto_enabled } : rule
    ));
  };

  const handleSave = () => {
    window.alert('Auto-reorder settings saved successfully!');
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
          <h1 className="text-3xl font-bold text-gray-900">Auto-Reorder Settings</h1>
          <p className="text-gray-600 mt-2">Configure automatic purchase order creation rules</p>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto Approve POs */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Auto-Approve POs</h3>
                <p className="text-sm text-gray-600">Automatically approve generated POs</p>
              </div>
              <button
                onClick={() => setGlobalSettings({ ...globalSettings, auto_approve_pos: !globalSettings.auto_approve_pos })}
                className="text-blue-600"
              >
                {globalSettings.auto_approve_pos ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Notify on Creation */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Send alerts when POs are created</p>
              </div>
              <button
                onClick={() => setGlobalSettings({ ...globalSettings, notify_on_creation: !globalSettings.notify_on_creation })}
                className="text-blue-600"
              >
                {globalSettings.notify_on_creation ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Max Daily POs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Daily POs
              </label>
              <input
                type="number"
                value={globalSettings.max_daily_pos}
                onChange={(e) => setGlobalSettings({ ...globalSettings, max_daily_pos: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum POs to auto-create per day</p>
            </div>

            {/* Min Order Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Value (₱)
              </label>
              <input
                type="number"
                value={globalSettings.min_order_value}
                onChange={(e) => setGlobalSettings({ ...globalSettings, min_order_value: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Only create POs above this value</p>
            </div>
          </div>
        </div>

        {/* Material Rules */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Material Auto-Reorder Rules</h2>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Point</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rule.material}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rule.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rule.reorder_point}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rule.reorder_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rule.preferred_supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className="flex items-center gap-2"
                      >
                        {rule.auto_enabled ? (
                          <>
                            <ToggleRight className="w-8 h-8 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">Total Rules</p>
              <p className="text-2xl font-bold text-blue-900">{rules.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-1">Active Rules</p>
              <p className="text-2xl font-bold text-green-900">{rules.filter(r => r.auto_enabled).length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-1">Inactive Rules</p>
              <p className="text-2xl font-bold text-gray-900">{rules.filter(r => !r.auto_enabled).length}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => router.push('/inventory')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
