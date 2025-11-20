"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ToggleLeft, ToggleRight, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface AutoReorderSetting {
  id: string;
  workspace_id: string;
  material_inventory_id: string;
  enabled: boolean;
  reorder_point: number;
  reorder_quantity: number;
  preferred_supplier_id: string | null;
  lead_time_days: number | null;
  safety_stock_days: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface MaterialInventory {
  id: string;
  material_name: string;
  material_type: string;
  quantity_on_hand: number;
  unit: string;
}

interface Supplier {
  id: string;
  supplier_code: string;
  name: string;
}

export default function AutoReorderSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AutoReorderSetting[]>([]);
  const [materials, setMaterials] = useState<MaterialInventory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, materialsRes, suppliersRes] = await Promise.all([
        fetch("/api/inventory/auto-reorder", {
          headers: { "x-workspace-id": "default-workspace" },
        }),
        fetch("/api/inventory/materials?limit=100", {
          headers: { "x-workspace-id": "default-workspace" },
        }),
        fetch("/api/inventory/suppliers?status=active&limit=100", {
          headers: { "x-workspace-id": "default-workspace" },
        }),
      ]);

      const [settingsData, materialsData, suppliersData] = await Promise.all([
        settingsRes.json(),
        materialsRes.json(),
        suppliersRes.json(),
      ]);

      if (settingsData.success) setSettings(settingsData.settings || []);
      if (materialsData.success) setMaterials(materialsData.materials || []);
      if (suppliersData.success) setSuppliers(suppliersData.suppliers || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load auto-reorder settings");
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (id: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/inventory/auto-reorder/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": "default-workspace",
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update setting");
      }

      // Update local state
      setSettings(
        settings.map(s => (s.id === id ? { ...s, enabled: !currentEnabled } : s))
      );
      toast.success(`Auto-reorder ${!currentEnabled ? "enabled" : "disabled"}`);
    } catch (error: any) {
      console.error("Error updating setting:", error);
      toast.error(error.message || "Failed to update setting");
    }
  };

  const deleteSetting = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auto-reorder setting?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/auto-reorder/${id}`, {
        method: "DELETE",
        headers: {
          "x-workspace-id": "default-workspace",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete setting");
      }

      setSettings(settings.filter(s => s.id !== id));
      toast.success("Auto-reorder setting deleted");
    } catch (error: any) {
      console.error("Error deleting setting:", error);
      toast.error(error.message || "Failed to delete setting");
    }
  };

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? `${material.material_name} (${material.material_type})` : "Unknown";
  };

  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return "No preferred supplier";
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? `${supplier.supplier_code} - ${supplier.name}` : "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">Loading auto-reorder settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/inventory")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Inventory
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Auto-Reorder Settings
              </h1>
              <p className="mt-2 text-gray-600">
                Configure automatic purchase order creation rules
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create New Rule
            </button>
          </div>
        </div>

        {/* Material Rules */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Material Auto-Reorder Rules ({settings.length})
          </h2>

          {settings.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="mb-2 text-lg font-medium text-gray-900">
                No auto-reorder rules configured
              </p>
              <p className="mb-4 text-sm text-gray-600">
                Create your first rule to automatically generate purchase orders when
                inventory runs low
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Create First Rule
              </button>
            </div>
          ) : (
            <>
              <div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Material
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Reorder Point
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Reorder Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Lead Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {settings.map(setting => (
                      <tr key={setting.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {getMaterialName(setting.material_inventory_id)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {setting.reorder_point}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {setting.reorder_quantity}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {setting.lead_time_days ? `${setting.lead_time_days} days` : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {getSupplierName(setting.preferred_supplier_id)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <button
                            onClick={() => toggleSetting(setting.id, setting.enabled)}
                            className="flex items-center gap-2"
                          >
                            {setting.enabled ? (
                              <>
                                <ToggleRight className="h-8 w-8 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                  Enabled
                                </span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-8 w-8 text-gray-500" />
                                <span className="text-sm font-medium text-gray-500">
                                  Disabled
                                </span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteSetting(setting.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete rule"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="mb-1 text-sm text-blue-700">Total Rules</p>
                  <p className="text-2xl font-bold text-blue-900">{settings.length}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="mb-1 text-sm text-green-700">Active Rules</p>
                  <p className="text-2xl font-bold text-green-900">
                    {settings.filter(s => s.enabled).length}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-gray-700">Inactive Rules</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {settings.filter(s => !s.enabled).length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Create Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Create Auto-Reorder Rules
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Auto-reorder rules help maintain optimal inventory levels by automatically
                  triggering reorder notifications when stock falls below threshold.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">How to Create Rules:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                    <li>Navigate to Inventory → Materials Management</li>
                    <li>Select a material to view details</li>
                    <li>Set the reorder point and quantity in material settings</li>
                    <li>Enable auto-reorder and save changes</li>
                  </ol>
                </div>
                <p className="text-sm text-gray-500">
                  Rules created through material settings will appear in this list automatically.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
