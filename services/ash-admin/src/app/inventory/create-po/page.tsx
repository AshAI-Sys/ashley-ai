"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Force dynamic rendering to avoid build-time errors
export const dynamic = "force-dynamic";

interface POLineItem {
  id: string;
  material_name: string;
  material_type: string;
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  tax_rate: string;
  discount_percent: string;
  total: number;
}

interface Supplier {
  id: string;
  supplier_code: string;
  name: string;
  payment_terms: string | null;
}

function CreatePOForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierParam = searchParams?.get("supplier") || "";

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    po_number: `PO-${Date.now().toString().slice(-6)}`,
    supplier_id: supplierParam,
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery: "",
    payment_terms: "NET30",
    shipping_cost: "0",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<POLineItem[]>([
    {
      id: "1",
      material_name: "",
      material_type: "FABRIC",
      description: "",
      quantity: "",
      unit: "YARDS",
      unit_price: "",
      tax_rate: "0",
      discount_percent: "0",
      total: 0,
    },
  ]);

  // Fetch suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(
          "/api/inventory/suppliers?status=active&limit=100",
          {
            headers: {
              "x-workspace-id": "default-workspace",
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setSuppliers(data.suppliers || []);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("Failed to load suppliers");
      }
    };
    fetchSuppliers();
  }, []);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        material_name: "",
        material_type: "FABRIC",
        description: "",
        quantity: "",
        unit: "YARDS",
        unit_price: "",
        tax_rate: "0",
        discount_percent: "0",
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
          // Recalculate total when quantity, unit_price, tax_rate, or discount_percent changes
          if (
            field === "quantity" ||
            field === "unit_price" ||
            field === "tax_rate" ||
            field === "discount_percent"
          ) {
            const qty = parseFloat(updated.quantity) || 0;
            const price = parseFloat(updated.unit_price) || 0;
            const taxRate = parseFloat(updated.tax_rate) || 0;
            const discountPercent = parseFloat(updated.discount_percent) || 0;

            const subtotal = qty * price;
            const discount = subtotal * (discountPercent / 100);
            const taxable = subtotal - discount;
            const tax = taxable * (taxRate / 100);
            updated.total = taxable + tax;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
  };

  const calculateTax = () => {
    return lineItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      const discountPercent = parseFloat(item.discount_percent) || 0;

      const subtotal = qty * price;
      const discount = subtotal * (discountPercent / 100);
      const taxable = subtotal - discount;
      const tax = taxable * (taxRate / 100);
      return sum + tax;
    }, 0);
  };

  const calculateTotal = () => {
    const itemsTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    return itemsTotal + shippingCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare line items data
      const items = lineItems.map(item => ({
        material_name: item.material_name,
        material_type: item.material_type,
        description: item.description || "",
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        unit_price: parseFloat(item.unit_price),
        tax_rate: parseFloat(item.tax_rate) || 0,
        discount_percent: parseFloat(item.discount_percent) || 0,
      }));

      const response = await fetch("/api/inventory/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": "default-workspace",
        },
        body: JSON.stringify({
          po_number: formData.po_number,
          supplier_id: formData.supplier_id,
          order_date: formData.order_date
            ? new Date(formData.order_date).toISOString()
            : new Date().toISOString(),
          expected_delivery: formData.expected_delivery
            ? new Date(formData.expected_delivery).toISOString()
            : undefined,
          payment_terms: formData.payment_terms || undefined,
          shipping_cost: parseFloat(formData.shipping_cost) || 0,
          notes: formData.notes || undefined,
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create purchase order");
      }

      toast.success("Purchase Order created successfully!");
      router.push("/inventory");
    } catch (error: any) {
      console.error("Error creating purchase order:", error);
      toast.error(error.message || "Failed to create purchase order");
    } finally {
      setLoading(false);
    }
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
              <select
                required
                value={formData.supplier_id}
                onChange={e =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select supplier...</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplier_code} - {supplier.name}
                  </option>
                ))}
              </select>
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
                value={formData.expected_delivery}
                onChange={e =>
                  setFormData({
                    ...formData,
                    expected_delivery: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Shipping Cost */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Shipping Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.shipping_cost}
                onChange={e =>
                  setFormData({ ...formData, shipping_cost: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
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

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Material
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Type
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Description
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Qty
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Unit
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Price
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Tax %
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Disc %
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Total
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          required
                          value={item.material_name}
                          onChange={e =>
                            updateLineItem(
                              item.id,
                              "material_name",
                              e.target.value
                            )
                          }
                          className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="Material name"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          required
                          value={item.material_type}
                          onChange={e =>
                            updateLineItem(
                              item.id,
                              "material_type",
                              e.target.value
                            )
                          }
                          className="w-28 rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="FABRIC">Fabric</option>
                          <option value="TRIM">Trim</option>
                          <option value="THREAD">Thread</option>
                          <option value="BUTTON">Button</option>
                          <option value="ZIPPER">Zipper</option>
                          <option value="LABEL">Label</option>
                          <option value="PACKAGING">Packaging</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e =>
                            updateLineItem(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-40 rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional description"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.quantity}
                          onChange={e =>
                            updateLineItem(item.id, "quantity", e.target.value)
                          }
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          required
                          value={item.unit}
                          onChange={e =>
                            updateLineItem(item.id, "unit", e.target.value)
                          }
                          className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="YARDS">Yards</option>
                          <option value="METERS">Meters</option>
                          <option value="PIECES">Pieces</option>
                          <option value="ROLLS">Rolls</option>
                          <option value="KG">Kilograms</option>
                          <option value="LBS">Pounds</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
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
                          className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          step="0.1"
                          value={item.tax_rate}
                          onChange={e =>
                            updateLineItem(item.id, "tax_rate", e.target.value)
                          }
                          className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          step="0.1"
                          value={item.discount_percent}
                          onChange={e =>
                            updateLineItem(
                              item.id,
                              "discount_percent",
                              e.target.value
                            )
                          }
                          className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-medium text-gray-900">
                          ₱{item.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="min-w-[350px] rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      ₱{calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium text-gray-900">
                      ₱{calculateTax().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-gray-900">
                      ₱{parseFloat(formData.shipping_cost || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
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
              disabled={loading}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create Purchase Order"}
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
