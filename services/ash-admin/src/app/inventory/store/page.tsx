'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { QRScanner } from '@/components/inventory/qr-scanner';
import { Package, MapPin, AlertCircle, CheckCircle, Camera, XCircle } from 'lucide-react';

interface ProductData {
  product: {
    id: string;
    name: string;
    description: string;
    photo_url: string;
    base_sku: string;
    category: string;
  };
  variant: {
    id: string;
    variant_name: string;
    sku: string;
    barcode: string;
    qr_code: string;
    price: number;
    size: string;
    color: string;
  };
  stock: {
    total_quantity: number;
    by_location: Array<{
      location_code: string;
      location_name: string;
      quantity: number;
    }>;
    is_out_of_stock: boolean;
  };
}

export default function StorePage() {
  const { token } = useAuth();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanActive, setScanActive] = useState(true);

  const handleScan = async (qrData: string) => {
    try {
      setLoading(true);
      setError(null);

      // Parse QR code URL: https://inventory.yourdomain.com/i/{product_id}?v={variant_id}
      const url = new URL(qrData);
      const pathParts = url.pathname.split('/');
      const productId = pathParts[pathParts.length - 1];
      const variantId = url.searchParams.get('v');

      if (!productId || !variantId) {
        throw new Error('Invalid QR code format');
      }

      // Call API to get product details
      const response = await fetch(`/api/inventory/product/${productId}?v=${variantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch product');
      }

      const data = await response.json();
      setProductData(data);
      setScanActive(false);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('Scan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setProductData(null);
    setError(null);
    setScanActive(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="w-8 h-8 text-blue-600" />
            Store Scanner
          </h1>
          <p className="text-gray-600 mt-2">Scan QR code to view product details</p>
        </div>

        {/* Scanner Section */}
        {scanActive && !productData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <QRScanner
              onScan={handleScan}
              onError={(err) => setError(err.message)}
            />
            {loading && (
              <div className="mt-4 text-center">
                <p className="text-blue-600">Loading product details...</p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={resetScanner}
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Product Details */}
        {productData && (
          <div className="space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {productData.product.photo_url && (
                <img
                  src={productData.product.photo_url}
                  alt={productData.product.name}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {productData.product.name}
                </h2>
                {productData.product.description && (
                  <p className="text-gray-600 mb-4">{productData.product.description}</p>
                )}

                {/* Variant Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Variant Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Variant:</span>
                      <span className="ml-2 font-medium">{productData.variant.variant_name}</span>
                    </div>
                    {productData.variant.size && (
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium">{productData.variant.size}</span>
                      </div>
                    )}
                    {productData.variant.color && (
                      <div>
                        <span className="text-gray-600">Color:</span>
                        <span className="ml-2 font-medium">{productData.variant.color}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <span className="ml-2 font-medium">{productData.variant.sku}</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ₱{productData.variant.price.toFixed(2)}
                </div>

                {/* Stock Status */}
                <div className={`rounded-lg p-4 mb-4 ${
                  productData.stock.is_out_of_stock
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {productData.stock.is_out_of_stock ? (
                      <>
                        <XCircle className="w-6 h-6 text-red-600" />
                        <span className="font-semibold text-red-800">Out of Stock</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-green-800">In Stock</span>
                      </>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {productData.stock.total_quantity} {productData.stock.total_quantity === 1 ? 'unit' : 'units'}
                  </div>
                </div>

                {/* Stock by Location */}
                {productData.stock.by_location.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Stock by Location
                    </h3>
                    <div className="space-y-2">
                      {productData.stock.by_location.map((loc, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white rounded p-3">
                          <div>
                            <p className="font-medium text-gray-800">{loc.location_name}</p>
                            <p className="text-sm text-gray-500">{loc.location_code}</p>
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            {loc.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scan Another Button */}
            <button
              onClick={resetScanner}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Scan Another Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
