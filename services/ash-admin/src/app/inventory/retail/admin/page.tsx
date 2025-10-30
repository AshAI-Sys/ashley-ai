"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Package,
  Layers,
  MapPin,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description?: string;
  photo_url?: string;
  base_sku: string;
  category?: string;
  is_active: boolean;
  variants?: Variant[];
}

interface Variant {
  id: string;
  variant_name: string;
  sku: string;
  price: number;
  size?: string;
  color?: string;
  is_active: boolean;
}

interface Location {
  id: string;
  location_code: string;
  location_name: string;
  location_type: string;
  address?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "variants" | "locations" | "reports">(
    "products"
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Manage products, variants, locations, and view reports
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: "products", label: "Products", icon: Package },
              { id: "variants", label: "Variants", icon: Layers },
              { id: "locations", label: "Locations", icon: MapPin },
              { id: "reports", label: "Reports", icon: BarChart3 },
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
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "variants" && <VariantsTab />}
          {activeTab === "locations" && <LocationsTab />}
          {activeTab === "reports" && <ReportsTab />}
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    photo_url: "",
    base_sku: "",
    category: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/inventory/products");
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.base_sku) {
      toast.error("Name and Base SKU are required");
      return;
    }

    try {
      const response = await fetch("/api/inventory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Product created successfully!");
        fetchProducts();
        setShowAddForm(false);
        setFormData({ name: "", description: "", photo_url: "", base_sku: "", category: "" });
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/inventory/products?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Product deleted successfully!");
        fetchProducts();
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.base_sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Create New Product</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Base SKU *
              </label>
              <input
                type="text"
                value={formData.base_sku}
                onChange={(e) => setFormData({ ...formData, base_sku: e.target.value })}
                placeholder="e.g., SHIRT-001"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Apparel, Accessories"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Photo URL</label>
              <input
                type="text"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Product description..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreateProduct}
              className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              Create Product
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-lg font-semibold text-gray-900">No products found</p>
          <p className="text-gray-600">
            {searchQuery ? "Try a different search" : "Create your first product to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {product.base_sku}</p>
                  {product.category && (
                    <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {product.category}
                    </span>
                  )}
                </div>
                {product.photo_url && (
                  <img
                    src={product.photo_url}
                    alt={product.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
              </div>

              {product.description && (
                <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span
                  className={`text-xs font-medium ${
                    product.is_active ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {product.variants?.length || 0} variants
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast("Edit feature coming soon")}
                    className="rounded p-1 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VariantsTab() {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <Layers className="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <p className="text-lg font-semibold text-gray-900">Variants Management</p>
      <p className="text-gray-600">Create and manage product variants (size, color, etc.)</p>
      <button className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
        Coming Soon
      </button>
    </div>
  );
}

function LocationsTab() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    location_code: "",
    location_name: "",
    location_type: "STORE",
    address: "",
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/inventory/locations");
      const result = await response.json();
      if (result.success) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!formData.location_code || !formData.location_name || !formData.location_type) {
      toast.error("Location code, name, and type are required");
      return;
    }

    try {
      const response = await fetch("/api/inventory/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Location created successfully!");
        fetchLocations();
        setShowAddForm(false);
        setFormData({ location_code: "", location_name: "", location_type: "STORE", address: "" });
      } else {
        toast.error(result.error || "Failed to create location");
      }
    } catch (error) {
      console.error("Error creating location:", error);
      toast.error("Failed to create location");
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const response = await fetch(`/api/inventory/locations?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Location deleted successfully!");
        fetchLocations();
      } else {
        toast.error(result.error || "Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Create New Location</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location Code *
              </label>
              <input
                type="text"
                value={formData.location_code}
                onChange={(e) => setFormData({ ...formData, location_code: e.target.value })}
                placeholder="e.g., STORE_MAIN, WH_MAIN"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location Name *
              </label>
              <input
                type="text"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                placeholder="Main Store"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location Type *
              </label>
              <select
                value={formData.location_type}
                onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="STORE">Store</option>
                <option value="WAREHOUSE">Warehouse</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreateLocation}
              className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              Create Location
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Locations List */}
      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <MapPin className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-lg font-semibold text-gray-900">No locations found</p>
          <p className="text-gray-600">Create your first location to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{location.location_name}</h3>
                  <p className="text-sm text-gray-600">{location.location_code}</p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      location.location_type === "WAREHOUSE"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {location.location_type}
                  </span>
                </div>
                <MapPin className="h-6 w-6 text-gray-400" />
              </div>

              {location.address && (
                <p className="mb-4 text-sm text-gray-600">{location.address}</p>
              )}

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button
                  onClick={() => toast("Edit feature coming soon")}
                  className="rounded p-2 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteLocation(location.id)}
                  className="rounded p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  const [reportType, setReportType] = useState("low_stock");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportType === "low_stock") {
        params.append("low_stock", "true");
        params.append("threshold", "10");
      }

      const response = await fetch(`/api/inventory/report?${params}`);
      const result = await response.json();

      if (result.success) {
        setReportData(result.data);
        toast.success("Report generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Options */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Generate Report</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="low_stock">Low Stock Alert</option>
              <option value="all_stock">All Stock Levels</option>
              <option value="by_location">Stock by Location</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              <BarChart3 className="h-4 w-4" />
              {loading ? "Generating..." : "Generate Report"}
            </button>
            {reportData && (
              <button
                onClick={() => toast("Export feature coming soon")}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.summary.total_products}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">Total Variants</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.summary.total_variants}
              </p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-800">
                {reportData.summary.low_stock_count}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">Out of Stock</p>
              <p className="text-2xl font-bold text-red-800">
                {reportData.summary.out_of_stock_count}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reportData.items.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {item.sku}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {item.location_name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.is_out_of_stock
                              ? "bg-red-100 text-red-800"
                              : item.is_low_stock
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.is_out_of_stock
                            ? "Out of Stock"
                            : item.is_low_stock
                              ? "Low Stock"
                              : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <BarChart3 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-lg font-semibold text-gray-900">No report generated</p>
          <p className="text-gray-600">Select a report type and click Generate Report</p>
        </div>
      )}
    </div>
  );
}
