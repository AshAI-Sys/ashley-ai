"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

// Force dynamic rendering to avoid build-time errors
export const dynamic = "force-dynamic";

interface POLineItem {
  id: string;
  material: string;
  quantity: string;
  unit_price: string;
  total: number;
}

function CreatePOForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierParam = searchParams?.get("supplier") || "";

  const [formData, setFormData] = useState({
    po_number: `PO-${Date.now().toString().slice(-6)}`,
    supplier: supplierParam,
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    payment_terms: "NET30",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<POLineItem[]>([
    { id: "1", material: "", quantity: "", unit_price: "", total: 0 },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        material: "",
        quantity: "",
        unit_price: "",
        total: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: keyof POLineItem,
    value: string
  ) => {
    setLineItems(
      lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unit_price") {
            const qty = parseFloat(updated.quantity) || 0;
            const price = parseFloat(updated.unit_price) || 0;
            updated.total = qty * price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.alert("Purchase Order created successfully!");
    router.push("/inventory");
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            Create Purchase Order
          </h1>
          <p className="mt-2 text-gray-600">
            Create a new purchase order for materials
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 shadow"
        >
          {/* PO Details */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* PO Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                PO Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.po_number}
                onChange={e =>
                  setFormData({ ...formData, po_number: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Supplier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={e =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Select or enter supplier..."
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.payment_terms}
                onChange={e =>
                  setFormData({ ...formData, payment_terms: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Order Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.order_date}
                onChange={e =>
                  setFormData({ ...formData, order_date: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Expected Delivery <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.delivery_date}
                onChange={e =>
                  setFormData({ ...formData, delivery_date: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Line Items
              </h3>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Material
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          required
                          value={item.material}
                          onChange={e =>
                            updateLineItem(item.id, "material", e.target.value)
                          }
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="Material name..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          value={item.quantity}
                          onChange={e =>
                            updateLineItem(item.id, "quantity", e.target.value)
                          }
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.unit_price}
                          onChange={e =>
                            updateLineItem(
                              item.id,
                              "unit_price",
                              e.target.value
                            )
                          }
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          ₱{item.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 flex justify-end">
              <div className="min-w-[300px] rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₱{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or special instructions..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/inventory")}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreatePOPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto max-w-6xl">
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <CreatePOForm />
    </Suspense>
  );
}
