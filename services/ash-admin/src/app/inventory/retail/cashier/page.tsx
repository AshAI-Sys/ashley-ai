"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  QrCode,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Receipt,
  ArrowLeft,
  Percent,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CartItem {
  variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  price: number;
  quantity: number;
  photo_url?: string;
}

export default function CashierPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(12); // Default 12% VAT
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "GCASH" | "BANK_TRANSFER"
  >("CASH");
  const [processing, setProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * taxPercent) / 100;
  const totalAmount = subtotalAfterDiscount + taxAmount;

  const addProductToCart = async () => {
    if (!scanInput.trim()) {
      toast.error("Please enter a product ID or SKU");
      return;
    }

    try {
      // Parse QR code URL or direct product ID
      let productId = scanInput;
      let variantId = "";

      if (scanInput.includes("/i/")) {
        const url = new URL(scanInput);
        productId = url.pathname.split("/i/")[1] || "";
        variantId = url.searchParams.get("v") || "";
      }

      const response = await fetch(
        `/api/inventory/product/${productId}${variantId ? `?v=${variantId}` : ""}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const product = result.data;

        // Check if already in cart
        const existingItem = cart.find((item) => item.sku === product.sku);

        if (existingItem) {
          setCart(
            cart.map((item) =>
              item.sku === product.sku
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
          toast.success(`Increased quantity of ${product.product_name}`);
        } else {
          const newItem: CartItem = {
            variant_id: variantId || productId,
            product_name: product.product_name,
            variant_name: product.variant_name,
            sku: product.sku,
            price: product.price,
            quantity: 1,
            photo_url: product.photo_url,
          };
          setCart([...cart, newItem]);
          toast.success(`Added ${product.product_name} to cart`);
        }

        setScanInput("");
      } else {
        toast.error(result.error || "Product not found");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product to cart");
    }
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.sku === sku) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (sku: string) => {
    setCart(cart.filter((item) => item.sku !== sku));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    toast.success("Cart cleared");
  };

  const processTransaction = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setProcessing(true);
    try {
      const saleData = {
        items: cart.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
        payment_method: paymentMethod,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
      };

      const response = await fetch("/api/inventory/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Sale completed! Total: ₱${totalAmount.toFixed(2)}`);
        clearCart();
        // TODO: Generate and print receipt
      } else {
        toast.error(result.error || "Failed to process sale");
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      toast.error("Failed to process transaction");
    } finally {
      setProcessing(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Cashier (POS)</h1>
              <p className="mt-1 text-gray-600">
                Process sales with auto stock deduction
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="rounded-lg border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cart Items - Left Side (2 columns) */}
        <div className="lg:col-span-2">
          {/* Scan Product */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Scan or Add Product
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addProductToCart()}
                  placeholder="Scan barcode or enter SKU/Product ID"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addProductToCart}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Cart Items ({cart.length})
              </h3>
            </div>

            {cart.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <p className="text-lg font-semibold text-gray-900">Cart is empty</p>
                <p className="text-gray-600">
                  Scan products to add them to the cart
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.sku} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="h-16 w-16 flex-shrink-0">
                        {item.photo_url ? (
                          <img
                            src={item.photo_url}
                            alt={item.product_name}
                            className="h-full w-full rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded bg-gray-200">
                            <Receipt className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {item.product_name}
                        </p>
                        {item.variant_name && (
                          <p className="text-sm text-gray-600">{item.variant_name}</p>
                        )}
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₱{item.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">per unit</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.sku, -1)}
                          className="rounded border border-gray-300 p-1 hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, 1)}
                          className="rounded border border-gray-300 p-1 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="w-24 text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.sku)}
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary - Right Side (1 column) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Payment Summary
            </h3>

            {/* Discount Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Discount (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-11 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tax Input */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tax (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-11 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="mb-6 space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₱{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700">
                <span>Tax ({taxPercent}%)</span>
                <span>₱{taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between border-t border-gray-300 pt-3 text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₱{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as "CASH" | "CARD" | "GCASH" | "BANK_TRANSFER"
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Credit/Debit Card</option>
                <option value="GCASH">GCash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            {/* Process Payment Button */}
            <button
              onClick={processTransaction}
              disabled={cart.length === 0 || processing}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-4 text-lg font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              <CreditCard className="h-6 w-6" />
              {processing ? "Processing..." : "Complete Sale"}
            </button>

            {cart.length > 0 && (
              <p className="mt-4 text-center text-sm text-gray-600">
                Stock will be auto-deducted from STORE_MAIN
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
