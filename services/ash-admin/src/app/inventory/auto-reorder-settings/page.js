"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AutoReorderSettingsPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
function AutoReorderSettingsPage() {
    const router = (0, navigation_1.useRouter)();
    const [rules, setRules] = (0, react_1.useState)([
        {
            id: "1",
            material: "Cotton Fabric - White",
            sku: "FAB-001",
            reorder_point: 200,
            reorder_quantity: 500,
            preferred_supplier: "Fabric Suppliers Inc.",
            auto_enabled: true,
        },
        {
            id: "2",
            material: "Polyester Thread - Black",
            sku: "THR-001",
            reorder_point: 500,
            reorder_quantity: 1000,
            preferred_supplier: "Thread & Trim Co.",
            auto_enabled: true,
        },
        {
            id: "3",
            material: "Denim Fabric - Blue",
            sku: "FAB-002",
            reorder_point: 200,
            reorder_quantity: 300,
            preferred_supplier: "Fabric Suppliers Inc.",
            auto_enabled: false,
        },
        {
            id: "4",
            material: "Metal Buttons - Silver",
            sku: "TRM-001",
            reorder_point: 2000,
            reorder_quantity: 5000,
            preferred_supplier: "Global Textiles",
            auto_enabled: true,
        },
    ]);
    const [globalSettings, setGlobalSettings] = (0, react_1.useState)({
        auto_approve_pos: false,
        notify_on_creation: true,
        max_daily_pos: 10,
        min_order_value: 5000,
    });
    const toggleRule = (id) => {
        setRules(rules.map(rule => rule.id === id ? { ...rule, auto_enabled: !rule.auto_enabled } : rule));
    };
    const handleSave = () => {
        window.alert("Auto-reorder settings saved successfully!");
        router.push("/inventory");
    };
    return (<div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push("/inventory")} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <lucide_react_1.ArrowLeft className="h-5 w-5"/>
            Back to Inventory
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Auto-Reorder Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Configure automatic purchase order creation rules
          </p>
        </div>

        {/* Global Settings */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Global Settings
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Auto Approve POs */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <h3 className="font-medium text-gray-900">Auto-Approve POs</h3>
                <p className="text-sm text-gray-600">
                  Automatically approve generated POs
                </p>
              </div>
              <button onClick={() => setGlobalSettings({
            ...globalSettings,
            auto_approve_pos: !globalSettings.auto_approve_pos,
        })} className="text-blue-600">
                {globalSettings.auto_approve_pos ? (<lucide_react_1.ToggleRight className="h-10 w-10"/>) : (<lucide_react_1.ToggleLeft className="h-10 w-10 text-gray-500"/>)}
              </button>
            </div>

            {/* Notify on Creation */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Send alerts when POs are created
                </p>
              </div>
              <button onClick={() => setGlobalSettings({
            ...globalSettings,
            notify_on_creation: !globalSettings.notify_on_creation,
        })} className="text-blue-600">
                {globalSettings.notify_on_creation ? (<lucide_react_1.ToggleRight className="h-10 w-10"/>) : (<lucide_react_1.ToggleLeft className="h-10 w-10 text-gray-500"/>)}
              </button>
            </div>

            {/* Max Daily POs */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Max Daily POs
              </label>
              <input type="number" value={globalSettings.max_daily_pos} onChange={e => setGlobalSettings({
            ...globalSettings,
            max_daily_pos: parseInt(e.target.value),
        })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"/>
              <p className="mt-1 text-xs text-gray-500">
                Maximum POs to auto-create per day
              </p>
            </div>

            {/* Min Order Value */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Order Value (₱)
              </label>
              <input type="number" value={globalSettings.min_order_value} onChange={e => setGlobalSettings({
            ...globalSettings,
            min_order_value: parseInt(e.target.value),
        })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"/>
              <p className="mt-1 text-xs text-gray-500">
                Only create POs above this value
              </p>
            </div>
          </div>
        </div>

        {/* Material Rules */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Material Auto-Reorder Rules
          </h2>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Reorder Point
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Reorder Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rules.map(rule => (<tr key={rule.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {rule.material}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {rule.sku}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {rule.reorder_point}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {rule.reorder_quantity}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {rule.preferred_supplier}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button onClick={() => toggleRule(rule.id)} className="flex items-center gap-2">
                        {rule.auto_enabled ? (<>
                            <lucide_react_1.ToggleRight className="h-8 w-8 text-green-600"/>
                            <span className="text-sm font-medium text-green-600">
                              Enabled
                            </span>
                          </>) : (<>
                            <lucide_react_1.ToggleLeft className="h-8 w-8 text-gray-500"/>
                            <span className="text-sm font-medium text-gray-500">
                              Disabled
                            </span>
                          </>)}
                      </button>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="mb-1 text-sm text-blue-700">Total Rules</p>
              <p className="text-2xl font-bold text-blue-900">{rules.length}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="mb-1 text-sm text-green-700">Active Rules</p>
              <p className="text-2xl font-bold text-green-900">
                {rules.filter(r => r.auto_enabled).length}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm text-gray-700">Inactive Rules</p>
              <p className="text-2xl font-bold text-gray-900">
                {rules.filter(r => !r.auto_enabled).length}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button onClick={() => router.push("/inventory")} className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            <lucide_react_1.Save className="h-4 w-4"/>
            Save Settings
          </button>
        </div>
      </div>
    </div>);
}
