"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Warehouse,
  Truck,
  ArrowLeftRight,
  AlertTriangle,
  Plus,
  Minus,
  ArrowLeft,
  PackageCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface DeliveryItem {
  variant_id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_cost?: number;
}

interface TransferItem {
  variant_id: string;
  sku: string;
  product_name: string;
  quantity: number;
  available_stock: number;
}

export default function WarehouseInterfacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"delivery" | "transfer" | "adjustment">(
    "delivery"
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/inventory/retail")}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Warehouse Operations</h1>
              <p className="mt-1 text-gray-600">
                Manage deliveries, transfers, and stock adjustments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 rounded-lg bg-white shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: "delivery", label: "Receive Delivery", icon: Truck },
              { id: "transfer", label: "Transfer Stock", icon: ArrowLeftRight },
              { id: "adjustment", label: "Adjust Stock", icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "delivery" && <ReceiveDeliveryTab />}
          {activeTab === "transfer" && <TransferStockTab />}
          {activeTab === "adjustment" && <AdjustStockTab />}
        </div>
      </div>
    </div>
  );
}

function ReceiveDeliveryTab() {
  const [supplierName, setSupplierName] = useState("");
  const [deliveryNumber, setDeliveryNumber] = useState("");
  const [receivingLocation, setReceivingLocation] = useState("WH_MAIN");
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [processing, setProcessing] = useState(false);

  const addItem = async () => {
    if (!sku.trim()) {
      toast.error("Please enter a SKU");
      return;
    }

    // TODO: Fetch product details from API
    const newItem: DeliveryItem = {
      variant_id: sku,
      sku,
      product_name: `Product ${sku}`,
      quantity,
      unit_cost: unitCost > 0 ? unitCost : undefined,
    };

    setItems([...items, newItem]);
    setSku("");
    setQuantity(1);
    setUnitCost(0);
    toast.success("Item added to delivery");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const processDelivery = async () => {
    if (!supplierName.trim()) {
      toast.error("Please enter supplier name");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/inventory/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_name: supplierName,
          delivery_number: deliveryNumber || undefined,
          receiving_location_code: receivingLocation,
          items: items.map((item) => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Delivery received successfully!");
        // Reset form
        setSupplierName("");
        setDeliveryNumber("");
        setItems([]);
      } else {
        toast.error(result.error || "Failed to process delivery");
      }
    } catch (error) {
      console.error("Error processing delivery:", error);
      toast.error("Failed to process delivery");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delivery Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Supplier Name *
          </label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="Enter supplier name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Delivery Number (Optional)
          </label>
          <input
            type="text"
            value={deliveryNumber}
            onChange={(e) => setDeliveryNumber(e.target.value)}
            placeholder="Auto-generated if blank"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Receiving Location
          </label>
          <select
            value={receivingLocation}
            onChange={(e) => setReceivingLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="WH_MAIN">WH_MAIN - Main Warehouse</option>
            <option value="STORE_MAIN">STORE_MAIN - Main Store</option>
          </select>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Add Item to Delivery</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Product SKU"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Unit Cost (Optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))}
              placeholder="₱0.00"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addItem}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="rounded-lg border border-gray-200">
          <div className="bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Delivery Items ({items.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.product_name}</p>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.quantity} units</p>
                  {item.unit_cost && (
                    <p className="text-sm text-gray-600">
                      ₱{item.unit_cost.toFixed(2)} each
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="ml-4 rounded p-2 text-red-600 hover:bg-red-50"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={processDelivery}
        disabled={processing || items.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-4 text-lg font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
      >
        <PackageCheck className="h-6 w-6" />
        {processing ? "Processing..." : "Receive Delivery"}
      </button>
    </div>
  );
}

function TransferStockTab() {
  const [fromLocation, setFromLocation] = useState("WH_MAIN");
  const [toLocation, setToLocation] = useState("STORE_MAIN");
  const [items, setItems] = useState<TransferItem[]>([]);
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  const addItem = async () => {
    if (!sku.trim()) {
      toast.error("Please enter a SKU");
      return;
    }

    // TODO: Fetch product details and stock from API
    const newItem: TransferItem = {
      variant_id: sku,
      sku,
      product_name: `Product ${sku}`,
      quantity,
      available_stock: 100, // Mock data
    };

    setItems([...items, newItem]);
    setSku("");
    setQuantity(1);
    toast.success("Item added to transfer");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const processTransfer = async () => {
    if (fromLocation === toLocation) {
      toast.error("Source and destination locations must be different");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_location_code: fromLocation,
          to_location_code: toLocation,
          items: items.map((item) => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Stock transferred successfully!");
        setItems([]);
      } else {
        toast.error(result.error || "Failed to transfer stock");
      }
    } catch (error) {
      console.error("Error transferring stock:", error);
      toast.error("Failed to transfer stock");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Transfer Locations */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            From Location
          </label>
          <select
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="WH_MAIN">WH_MAIN - Main Warehouse</option>
            <option value="STORE_MAIN">STORE_MAIN - Main Store</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            To Location
          </label>
          <select
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="STORE_MAIN">STORE_MAIN - Main Store</option>
            <option value="WH_MAIN">WH_MAIN - Main Warehouse</option>
          </select>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Add Item to Transfer</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Product SKU"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addItem}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="rounded-lg border border-gray-200">
          <div className="bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Transfer Items ({items.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.product_name}</p>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  <p className="text-xs text-gray-500">
                    Available: {item.available_stock} units
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.quantity} units</p>
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="ml-4 rounded p-2 text-red-600 hover:bg-red-50"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={processTransfer}
        disabled={processing || items.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-4 text-lg font-semibold text-white hover:bg-purple-700 disabled:bg-gray-400"
      >
        <ArrowLeftRight className="h-6 w-6" />
        {processing ? "Processing..." : "Transfer Stock"}
      </button>
    </div>
  );
}

function AdjustStockTab() {
  const [sku, setSku] = useState("");
  const [location, setLocation] = useState("STORE_MAIN");
  const [adjustmentType, setAdjustmentType] = useState<"ADD" | "DEDUCT">("DEDUCT");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const processAdjustment = async () => {
    if (!sku.trim()) {
      toast.error("Please enter a SKU");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please enter a reason for adjustment");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: sku,
          location_code: location,
          adjustment_type: adjustmentType,
          quantity,
          reason,
          notes: notes || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Stock adjusted successfully!");
        // Reset form
        setSku("");
        setQuantity(1);
        setReason("");
        setNotes("");
      } else {
        toast.error(result.error || "Failed to adjust stock");
      }
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Failed to adjust stock");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-900">Stock Adjustment</p>
            <p className="text-sm text-yellow-800">
              Use this to manually adjust stock for damage, loss, corrections, etc.
              All adjustments are logged for audit purposes.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Product SKU *
        </label>
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="Enter product SKU"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="STORE_MAIN">STORE_MAIN - Main Store</option>
          <option value="WH_MAIN">WH_MAIN - Main Warehouse</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Adjustment Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setAdjustmentType("ADD")}
            className={`rounded-lg border-2 p-4 text-center transition-colors ${
              adjustmentType === "ADD"
                ? "border-green-600 bg-green-50"
                : "border-gray-300 hover:border-green-400"
            }`}
          >
            <Plus className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <p className="font-semibold text-gray-900">Add Stock</p>
            <p className="text-sm text-gray-600">Increase quantity</p>
          </button>

          <button
            onClick={() => setAdjustmentType("DEDUCT")}
            className={`rounded-lg border-2 p-4 text-center transition-colors ${
              adjustmentType === "DEDUCT"
                ? "border-red-600 bg-red-50"
                : "border-gray-300 hover:border-red-400"
            }`}
          >
            <Minus className="mx-auto mb-2 h-8 w-8 text-red-600" />
            <p className="font-semibold text-gray-900">Deduct Stock</p>
            <p className="text-sm text-gray-600">Decrease quantity</p>
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Quantity *
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Reason *
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select reason...</option>
          <option value="DAMAGED">Damaged</option>
          <option value="LOST">Lost</option>
          <option value="EXPIRED">Expired</option>
          <option value="CORRECTION">Stock Correction</option>
          <option value="RETURNED">Customer Return</option>
          <option value="FOUND">Found (Miscount)</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Enter additional notes or explanation..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={processAdjustment}
        disabled={processing}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold text-white disabled:bg-gray-400 ${
          adjustmentType === "ADD"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <AlertTriangle className="h-6 w-6" />
        {processing
          ? "Processing..."
          : `${adjustmentType === "ADD" ? "Add" : "Deduct"} ${quantity} Units`}
      </button>
    </div>
  );
}
