'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelect, BrandSelect } from '@/components/inventory';
import { toast } from 'react-hot-toast';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo_url: '',
    base_sku: '',
    category_id: null as string | null,
    brand_id: null as string | null,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.base_sku.trim()) {
      toast.error('Product name and SKU are required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Product created successfully!');
        router.push('/inventory/products');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Create New Product
            </h1>
            <p className="text-muted-foreground">
              Add a new product to your inventory with category and brand assignment
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Enter the basic details for your new product. You can add variants later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Basic Cotton T-Shirt"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Base SKU */}
            <div className="space-y-2">
              <Label htmlFor="base_sku">
                Base SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="base_sku"
                placeholder="e.g., TSHIRT-BASIC-001"
                value={formData.base_sku}
                onChange={(e) => setFormData({ ...formData, base_sku: e.target.value.toUpperCase() })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for this product (will be used as base for variant SKUs)
              </p>
            </div>

            {/* Category Selection with Inline Add */}
            <div className="space-y-2">
              <Label htmlFor="category">Product Category</Label>
              <CategorySelect
                value={formData.category_id}
                onChange={(categoryId) => setFormData({ ...formData, category_id: categoryId })}
                placeholder="Select a category or create new..."
                allowNull={true}
              />
              <p className="text-xs text-muted-foreground">
                Click the <strong>+</strong> button to create a new category
              </p>
            </div>

            {/* Brand Selection with Inline Add */}
            <div className="space-y-2">
              <Label htmlFor="brand">Product Brand</Label>
              <BrandSelect
                value={formData.brand_id}
                onChange={(brandId) => setFormData({ ...formData, brand_id: brandId })}
                placeholder="Select a brand or create new..."
                allowNull={true}
              />
              <p className="text-xs text-muted-foreground">
                Click the <strong>+</strong> button to create a new brand
              </p>
            </div>

            {/* Product Image URL */}
            <div className="space-y-2">
              <Label htmlFor="photo_url">Product Image URL (Optional)</Label>
              <Input
                id="photo_url"
                type="url"
                placeholder="https://example.com/product-image.jpg"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              />
              {formData.photo_url && (
                <div className="mt-2 p-2 border rounded-md">
                  <p className="text-xs text-muted-foreground mb-2">Image Preview:</p>
                  <img
                    src={formData.photo_url}
                    alt="Product preview"
                    className="h-32 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the product..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Product is active (available for sale/use)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <Link href="/inventory/products">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              <strong>Inline Creation:</strong> You can create categories and brands on-the-fly using the <strong>+</strong> button next to each dropdown
            </li>
            <li>
              <strong>SKU Format:</strong> Use a consistent format like CATEGORY-TYPE-NUMBER (e.g., TSHIRT-BASIC-001)
            </li>
            <li>
              <strong>Hierarchical Categories:</strong> When creating a category, you can set a parent to create subcategories
            </li>
            <li>
              <strong>Brand Codes:</strong> Brand codes are auto-generated from the brand name if you don't provide one
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
