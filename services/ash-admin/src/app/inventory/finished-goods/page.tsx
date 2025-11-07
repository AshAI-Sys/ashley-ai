'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Package, Search, Filter, Upload, Image as ImageIcon, QrCode, X, Edit2, Keyboard, FileSpreadsheet } from 'lucide-react';
import Image from 'next/image';
import { Scanner } from '@/components/mobile/Scanner';
import HydrationSafeIcon from '@/components/hydration-safe-icon';

interface FinishedUnit {
  sku: string;
  product_name: string;
  category: string;
  brand: string | null;
  size_code: string;
  color: string | null;
  product_image_url: string | null;
  crate_numbers: string[];
  total_quantity: number;
  packed_quantity: number;
  available_quantity: number;
  status: 'available' | 'out_of_stock';
  price: number | null;
  sale_price: number | null;
}

interface ProductDetails {
  sku: string;
  product_name: string;
  category: string;
  brand: string | null;
  size_code: string;
  color: string | null;
  product_image_url: string | null;
  crate_number: string | null;
  price: number | null;
  sale_price: number | null;
  available_quantity: number;
}

export default function FinishedGoodsInventoryPage() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<FinishedUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [manualSKU, setManualSKU] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [token, categoryFilter, brandFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (brandFilter) params.append('brand', brandFilter);

      const response = await fetch(`/api/inventory/finished-units?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const result = await response.json();
      setInventory(result.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (sku: string, file: File) => {
    try {
      setUploadingImage(sku);

      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'finished-goods');
      formData.append('type', 'image');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.url;

      // Note: Image URL is now uploaded. The inventory will be updated when we refresh.
      // Individual units would need to be updated separately via the API if needed.

      // Refresh inventory to show updated data
      await fetchInventory();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleQRScan = async (code: string, format: string) => {
    console.log('QR Code scanned:', code, format);
    setShowScanner(false);

    // Lookup product by SKU
    await lookupProductBySKU(code);
  };

  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualSKU.trim()) {
      await lookupProductBySKU(manualSKU.trim());
      setManualSKU('');
      setShowManualEntry(false);
    }
  };

  const lookupProductBySKU = async (sku: string) => {
    try {
      const response = await fetch(`/api/inventory/lookup?code=${encodeURIComponent(sku)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const result = await response.json();

      if (result.success && result.material) {
        // Convert to ProductDetails format
        setSelectedProduct({
          sku: result.material.sku || sku,
          product_name: result.material.name || result.material.product_name || 'Unknown Product',
          category: result.material.category || 'UNCATEGORIZED',
          brand: result.material.brand || null,
          size_code: result.material.size_code || 'N/A',
          color: result.material.color || null,
          product_image_url: result.material.product_image_url || null,
          crate_number: result.material.crate_number || null,
          price: result.material.price || null,
          sale_price: result.material.sale_price || null,
          available_quantity: result.material.quantity || result.material.available_quantity || 0,
        });
        setShowDetailsModal(true);
      } else {
        alert('Product not found in inventory');
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleUpdateProduct = async (updates: Partial<ProductDetails>) => {
    if (!selectedProduct) return;

    try {
      const response = await fetch('/api/inventory/finished-units', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sku: selectedProduct.sku,
          updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      setShowDetailsModal(false);
      setSelectedProduct(null);
      await fetchInventory();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      alert('Please paste your Google Sheets data');
      return;
    }

    try {
      setImporting(true);

      // Parse CSV data (tab-separated or comma-separated)
      const lines = importData.trim().split('\n');
      const sheetData = [];

      if (lines.length === 0) {
        throw new Error('No data found in import file');
      }

      // Get header row to detect format
      const headerLine = lines[0]?.trim() || '';
      const headers = headerLine.includes('\t') ? headerLine.split('\t') : headerLine.split(',');
      const headerMap = headers.map(h => h.trim().toLowerCase());

      // Detect column indices
      const scanProductIndex = headerMap.findIndex(h => h.includes('scan') || h.includes('product'));
      const quantityIndex = headerMap.findIndex(h => h.includes('quantity'));
      const crateIndex = headerMap.findIndex(h => h.includes('crate'));
      const skuIndex = headerMap.findIndex(h => h === 'sku');
      const sizeIndex = headerMap.findIndex(h => h.includes('size'));
      const priceIndex = headerMap.findIndex(h => h.includes('price') && !h.includes('sale'));
      const salePriceIndex = headerMap.findIndex(h => h.includes('sale'));

      // Skip header row (first line)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;

        // Split by tab or comma
        const columns = line.includes('\t') ? line.split('\t') : line.split(',');

        // Get SKU from either SCAN PRODUCT or SKU column
        let sku = '';
        if (scanProductIndex >= 0 && columns[scanProductIndex]) {
          sku = columns[scanProductIndex]?.trim() || '';
        } else if (skuIndex >= 0 && columns[skuIndex]) {
          sku = columns[skuIndex]?.trim() || '';
        }

        if (!sku) continue; // Skip if no SKU

        // Extract size from SKU if not provided (e.g., R001US -> S, R208UL -> L)
        let size = 'N/A';
        if (sizeIndex >= 0 && columns[sizeIndex]) {
          size = columns[sizeIndex]?.trim() || 'N/A';
        } else {
          // Try to extract size from SKU
          const sizeMatch = sku.match(/U(XS|S|M|L|XL|2XL|3XL|XXL)$/i);
          if (sizeMatch && sizeMatch[1]) {
            size = sizeMatch[1].toUpperCase();
          }
        }

        const quantity = quantityIndex >= 0 && columns[quantityIndex] ? (parseInt(columns[quantityIndex]?.trim() || '0') || 0) : 0;
        const crate = crateIndex >= 0 && columns[crateIndex] ? (columns[crateIndex]?.trim() || '') : '';
        const price = priceIndex >= 0 && columns[priceIndex] ? (parseFloat(columns[priceIndex]?.trim() || '0') || 450.00) : 450.00;
        const salePrice = salePriceIndex >= 0 && columns[salePriceIndex] ? (columns[salePriceIndex]?.trim() ? parseFloat(columns[salePriceIndex]?.trim() || '0') : null) : null;
        const status = quantity > 0 ? 'Available' : 'Out of Stock';

        sheetData.push({
          sku,
          size,
          crate,
          quantity,
          price,
          salePrice,
          status,
        });
      }

      if (sheetData.length === 0) {
        throw new Error('No valid data found. Please check your format.');
      }

      // Import the data
      const response = await fetch('/api/inventory/import-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sheetData,
          productName: "REEFER'S INN (Black)",
          clientName: "Reefer's Inn",
          orderNumber: 'ORD-REEFER-001',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import data');
      }

      const result = await response.json();
      alert(result.message);

      // Reset and refresh
      setImportData('');
      setShowImportModal(false);
      await fetchInventory();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setImporting(false);
    }
  };

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.sku.toLowerCase().includes(search) ||
      item.product_name.toLowerCase().includes(search) ||
      (item.color?.toLowerCase() || '').includes(search) ||
      item.crate_numbers.some(crate => crate.toLowerCase().includes(search))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HydrationSafeIcon Icon={Package} className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Finished Goods Inventory</h1>
                <p className="text-sm text-gray-600 mt-1">Product images, prices, stock levels, and warehouse locations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <HydrationSafeIcon Icon={FileSpreadsheet} className="w-4 h-4" />
                Import from Sheets
              </button>
              <button
                onClick={() => setShowManualEntry(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <HydrationSafeIcon Icon={Keyboard} className="w-4 h-4" />
                Manual Entry
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <HydrationSafeIcon Icon={QrCode} className="w-4 h-4" />
                Scan QR Code
              </button>
              <button
                onClick={fetchInventory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by SKU, name, brand, color, or crate..."
                className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                <option value="T-SHIRT">T-SHIRT</option>
                <option value="POLO">POLO</option>
                <option value="HOODIE">HOODIE</option>
                <option value="JACKET">JACKET</option>
                <option value="PANTS">PANTS</option>
                <option value="SHORTS">SHORTS</option>
                <option value="DRESS">DRESS</option>
                <option value="SKIRT">SKIRT</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none"
              >
                <option value="">All Brands</option>
                <option value="Reefer's Inn">Reefer's Inn</option>
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Puma">Puma</option>
                <option value="Under Armour">Under Armour</option>
                <option value="Bench">Bench</option>
                <option value="Penshoppe">Penshoppe</option>
                <option value="Uniqlo">Uniqlo</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-end gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-gray-900">{filteredInventory.length}</p>
                <p className="text-gray-600">Products</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-600">
                  {filteredInventory.filter(i => i.status === 'available').length}
                </p>
                <p className="text-gray-600">Available</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-red-600">
                  {filteredInventory.filter(i => i.status === 'out_of_stock').length}
                </p>
                <p className="text-gray-600">Out of Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Brand Statistics */}
        {!loading && filteredInventory.length > 0 && (() => {
          const brandCounts = filteredInventory.reduce((acc, item) => {
            const brandName = item.brand || 'No Brand';
            if (!acc[brandName]) {
              acc[brandName] = {
                total: 0,
                available: 0,
              };
            }
            acc[brandName].total += item.total_quantity;
            acc[brandName].available += item.available_quantity;
            return acc;
          }, {} as Record<string, { total: number; available: number }>);

          const sortedBrands = Object.entries(brandCounts).sort((a, b) => b[1].total - a[1].total);

          return sortedBrands.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory by Brand</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedBrands.map(([brand, counts]) => (
                  <div
                    key={brand}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setBrandFilter(brand === 'No Brand' ? '' : brand)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">{brand}</h4>
                      {brandFilter === brand && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Filtered</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-purple-600">{counts.total}</p>
                      <p className="text-xs text-gray-600">Total Units</p>
                      <p className="text-sm text-green-600">{counts.available} available</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        ) : (
          <>
            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Photo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        QR Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Crate #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Codes
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sale Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Stocks
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                          No inventory found
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((item) => (
                        <tr key={`${item.sku}-${item.size_code}-${item.color}`} className="hover:bg-gray-50">
                          {/* Product Image */}
                          <td className="px-6 py-4">
                            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden group">
                              {item.product_image_url ? (
                                <Image
                                  src={item.product_image_url}
                                  alt={item.product_name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              {/* Upload overlay */}
                              <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploadingImage === item.sku ? (
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : (
                                  <Upload className="w-6 h-6 text-white" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(item.sku, file);
                                  }}
                                  disabled={uploadingImage === item.sku}
                                />
                              </label>
                            </div>
                          </td>

                          {/* QR Code */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-16 h-16 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(item.sku)}`}
                                  alt={`QR: ${item.sku}`}
                                  className="w-14 h-14"
                                />
                              </div>
                              <button
                                onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(item.sku)}`, '_blank')}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Print
                              </button>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          </td>

                          {/* Brand */}
                          <td className="px-6 py-4">
                            {item.brand ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {item.brand}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>

                          {/* Crate Numbers */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {item.crate_numbers.length > 0 ? (
                                item.crate_numbers.slice(0, 3).map((crate, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-1 text-xs font-mono bg-purple-100 text-purple-800 rounded"
                                  >
                                    {crate}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                              {item.crate_numbers.length > 3 && (
                                <span className="text-xs text-gray-500">+{item.crate_numbers.length - 3}</span>
                              )}
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-6 py-4">
                            <p className="text-sm font-mono text-gray-900">{item.sku}</p>
                          </td>

                          {/* Name */}
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                            {item.color && (
                              <p className="text-xs text-gray-500">({item.color})</p>
                            )}
                          </td>

                          {/* Size */}
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">{item.size_code}</span>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4">
                            {item.price ? (
                              <p className="text-sm font-semibold text-gray-900">₱{Number(item.price).toFixed(2)}</p>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>

                          {/* Sale Price */}
                          <td className="px-6 py-4">
                            {item.sale_price ? (
                              <div className="text-sm">
                                <p className="font-semibold text-green-600">₱{Number(item.sale_price).toFixed(2)}</p>
                                {item.price && (
                                  <p className="text-xs text-gray-500">
                                    {Math.round(((Number(item.price) - Number(item.sale_price)) / Number(item.price)) * 100)}% off
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>

                          {/* Stock Quantity */}
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-bold text-gray-900">{item.available_quantity}</p>
                              <p className="text-xs text-gray-500">({item.total_quantity} total)</p>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {item.status === 'available' ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-300">
                                Out of Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* QR Scanner Modal */}
        {showScanner && (
          <Scanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Manual Entry Modal */}
        {showManualEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Manual SKU Entry</h2>
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <HydrationSafeIcon Icon={X} className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleManualLookup}>
                <input
                  type="text"
                  value={manualSKU}
                  onChange={(e) => setManualSKU(e.target.value)}
                  placeholder="Enter SKU or barcode..."
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!manualSKU.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Look Up
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showDetailsModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedProduct(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <HydrationSafeIcon Icon={X} className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Product Image */}
                  {selectedProduct.product_image_url && (
                    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={selectedProduct.product_image_url}
                        alt={selectedProduct.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Product Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">SKU</label>
                      <p className="text-lg font-mono text-gray-900">{selectedProduct.sku}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                      <p className="text-lg text-gray-900">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                      <p className="text-lg text-gray-900">{selectedProduct.product_name}</p>
                    </div>
                    {selectedProduct.brand && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                        <p className="text-lg text-gray-900">{selectedProduct.brand}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Size</label>
                      <p className="text-lg text-gray-900">{selectedProduct.size_code}</p>
                    </div>
                    {selectedProduct.color && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                        <p className="text-lg text-gray-900">{selectedProduct.color}</p>
                      </div>
                    )}
                    {selectedProduct.crate_number && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Crate Number</label>
                        <p className="text-lg font-mono text-purple-800 bg-purple-100 px-3 py-1 rounded inline-block">
                          {selectedProduct.crate_number}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Available Stock</label>
                      <p className="text-2xl font-bold text-green-600">{selectedProduct.available_quantity}</p>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Product Details</h3>

                    {/* Brand Field */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.brand || ''}
                        onChange={(e) => setSelectedProduct({
                          ...selectedProduct,
                          brand: e.target.value || null,
                        })}
                        placeholder="e.g., Reefer's Inn, Nike, Adidas"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>

                    {/* Price Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₱</span>
                          <input
                            type="number"
                            step="0.01"
                            value={selectedProduct.price || ''}
                            onChange={(e) => setSelectedProduct({
                              ...selectedProduct,
                              price: e.target.value ? parseFloat(e.target.value) : null,
                            })}
                            placeholder="0.00"
                            className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Sale Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₱</span>
                          <input
                            type="number"
                            step="0.01"
                            value={selectedProduct.sale_price || ''}
                            onChange={(e) => setSelectedProduct({
                              ...selectedProduct,
                              sale_price: e.target.value ? parseFloat(e.target.value) : null,
                            })}
                            placeholder="0.00"
                            className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          />
                        </div>
                        {selectedProduct.price && selectedProduct.sale_price && selectedProduct.sale_price < selectedProduct.price && (
                          <p className="text-sm text-green-600 mt-1">
                            {Math.round(((selectedProduct.price - selectedProduct.sale_price) / selectedProduct.price) * 100)}% discount
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleUpdateProduct({
                        brand: selectedProduct.brand,
                        price: selectedProduct.price,
                        sale_price: selectedProduct.sale_price,
                      })}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <HydrationSafeIcon Icon={Edit2} className="w-4 h-4" />
                      Update Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import from Google Sheets Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Import from Google Sheets</h2>
                    <p className="text-sm text-gray-600 mt-1">Copy and paste your inventory data from Google Sheets</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportData('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <HydrationSafeIcon Icon={X} className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                      <li>Open your Google Sheets inventory</li>
                      <li>Select all data (including header row)</li>
                      <li>Copy (Ctrl+C or Cmd+C)</li>
                      <li>Paste below (Ctrl+V or Cmd+V)</li>
                    </ol>
                    <p className="text-xs text-blue-700 mt-2">
                      Expected format: SKU, Size, Crate, Quantity, Price, Sale Price, Status
                    </p>
                  </div>

                  {/* Textarea for pasting data */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Paste your data here:
                    </label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="SKU	Size	Crate	Quantity	Price	Sale Price	Status
R001US	SMALL	α16	6	450.00	350.00	Available
R001UM	MEDIUM	α16	0	450.00		Out of Stock"
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {importData ? `${importData.split('\n').length} lines` : 'No data pasted yet'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportData('');
                      }}
                      disabled={importing}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={importing || !importData.trim()}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {importing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <HydrationSafeIcon Icon={FileSpreadsheet} className="w-4 h-4" />
                          Import Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
