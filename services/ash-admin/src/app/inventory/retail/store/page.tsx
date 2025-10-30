"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Package,
  MapPin,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

interface ProductDetails {
  product_name: string;
  variant_name: string;
  sku: string;
  price: number;
  photo_url?: string;
  stock: Array<{
    location_code: string;
    location_name: string;
    quantity: number;
  }>;
  total_stock: number;
  is_out_of_stock: boolean;
}

export default function StoreInterfacePage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (productId: string, variantId?: string) => {
    setLoading(true);
    try {
      const url = variantId
        ? `/api/inventory/product/${productId}?v=${variantId}`
        : `/api/inventory/product/${productId}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setProductDetails(result.data);
        toast.success("Product loaded successfully!");
      } else {
        toast.error(result.error || "Product not found");
        setProductDetails(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
      setProductDetails(null);
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const handleManualScan = () => {
    if (!manualInput.trim()) {
      toast.error("Please enter a product ID or SKU");
      return;
    }

    // Parse the QR code URL format: https://inventory.yourdomain.com/i/{product_id}?v={variant_id}
    if (manualInput.includes("/i/")) {
      try {
        const url = new URL(manualInput);
        const productId = url.pathname.split("/i/")[1] || "";
        const variantId = url.searchParams.get("v");
        if (productId) {
          handleScan(productId, variantId ?? undefined);
        }
      } catch (error) {
        // If not a URL, treat as product ID
        handleScan(manualInput);
      }
    } else {
      // Direct product ID or SKU
      handleScan(manualInput);
    }
  };

  const startCameraScan = () => {
    setScanning(true);
    toast.success("Camera scanning feature coming soon! Use manual input for now.");
    // TODO: Integrate @zxing/browser for QR code scanning
    setTimeout(() => setScanning(false), 2000);
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
              <h1 className="text-3xl font-bold text-gray-900">Store Interface</h1>
              <p className="mt-1 text-gray-600">
                Scan QR codes to check product details and stock
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Scan Product</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Camera Scanner */}
          <div>
            <button
              onClick={startCameraScan}
              disabled={scanning}
              className={`flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors ${
                scanning
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
            >
              {scanning ? (
                <div className="text-center">
                  <Camera className="mx-auto mb-2 h-16 w-16 animate-pulse text-blue-600" />
                  <p className="font-semibold text-blue-900">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="mx-auto mb-2 h-16 w-16 text-gray-400" />
                  <p className="font-semibold text-gray-900">Open Camera</p>
                  <p className="text-sm text-gray-600">Scan QR code from product</p>
                </div>
              )}
            </button>
          </div>

          {/* Manual Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Manual Entry
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
                placeholder="Enter Product ID, SKU, or QR URL"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManualScan}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Loading..." : "Scan"}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Example: https://inventory.yourdomain.com/i/abc123?v=xyz789
            </p>
          </div>
        </div>
      </div>

      {/* Product Details */}
      {productDetails && (
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start gap-6">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {productDetails.photo_url ? (
                  <img
                    src={productDetails.photo_url}
                    alt={productDetails.product_name}
                    className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {productDetails.product_name}
                </h3>
                {productDetails.variant_name && (
                  <p className="mb-2 text-lg text-gray-600">
                    {productDetails.variant_name}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      SKU: {productDetails.sku}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-1">
                    <DollarSign className="h-4 w-4 text-green-700" />
                    <span className="text-sm font-bold text-green-900">
                      ₱{productDetails.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Status Badge */}
              <div>
                {productDetails.is_out_of_stock ? (
                  <div className="flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">OUT OF STOCK</p>
                      <p className="text-xs text-red-700">No units available</p>
                    </div>
                  </div>
                ) : productDetails.total_stock <= 10 ? (
                  <div className="flex items-center gap-2 rounded-lg border-2 border-yellow-200 bg-yellow-50 px-4 py-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">LOW STOCK</p>
                      <p className="text-xs text-yellow-700">
                        {productDetails.total_stock} units left
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border-2 border-green-200 bg-green-50 px-4 py-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">IN STOCK</p>
                      <p className="text-xs text-green-700">
                        {productDetails.total_stock} units
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stock by Location */}
          <div className="p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">
              Stock by Location
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {productDetails.stock.map((loc) => (
                <div
                  key={loc.location_code}
                  className={`rounded-lg border-2 p-4 ${
                    loc.quantity === 0
                      ? "border-red-200 bg-red-50"
                      : loc.quantity <= 5
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-green-200 bg-green-50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin
                        className={`h-5 w-5 ${
                          loc.quantity === 0
                            ? "text-red-600"
                            : loc.quantity <= 5
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      />
                      <p className="font-semibold text-gray-900">{loc.location_name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{loc.location_code}</p>
                  <p
                    className={`mt-2 text-2xl font-bold ${
                      loc.quantity === 0
                        ? "text-red-900"
                        : loc.quantity <= 5
                          ? "text-yellow-900"
                          : "text-green-900"
                    }`}
                  >
                    {loc.quantity} units
                  </p>
                </div>
              ))}
            </div>

            {/* Total Stock Summary */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Total Stock (All Locations)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {productDetails.total_stock} units
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!productDetails && !loading && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <QrCode className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="mb-2 text-lg font-semibold text-gray-900">
            Scan a product to view details
          </p>
          <p className="text-gray-600">
            Use the camera scanner or manual input above to get started
          </p>
        </div>
      )}
    </div>
  );
}
