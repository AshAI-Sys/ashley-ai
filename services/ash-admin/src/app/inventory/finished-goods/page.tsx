'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Package, Search, Filter, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface FinishedUnit {
  sku: string;
  product_name: string;
  category: string;
  size_code: string;
  color: string | null;
  product_image_url: string | null;
  crate_numbers: string[];
  total_quantity: number;
  packed_quantity: number;
  available_quantity: number;
  status: 'available' | 'out_of_stock';
}

export default function FinishedGoodsInventoryPage() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<FinishedUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategory Filter] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, [token, categoryFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);

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

      // Update all finished units with this SKU
      const unitsToUpdate = inventory
        .filter(item => item.sku === sku)
        .flatMap(item => item.units?.map((u: any) => u.id) || []);

      if (unitsToUpdate.length > 0) {
        await fetch('/api/inventory/finished-units', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ids: unitsToUpdate,
            updates: { product_image_url: imageUrl },
          }),
        });
      }

      // Refresh inventory
      await fetchInventory();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadingImage(null);
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
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Finished Goods Inventory</h1>
                <p className="text-sm text-gray-600 mt-1">Product images, stock levels, and warehouse locations</p>
              </div>
            </div>
            <button
              onClick={fetchInventory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by SKU, name, color, or crate..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none"
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
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
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
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
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

                          {/* Category */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
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
      </div>
    </div>
  );
}
