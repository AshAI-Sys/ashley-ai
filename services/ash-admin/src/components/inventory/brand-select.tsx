'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface InventoryBrand {
  id: string;
  name: string;
  code?: string | null;
  logo_url?: string | null;
  description?: string | null;
  is_active: boolean;
  _count?: {
    products: number;
  };
}

interface BrandSelectProps {
  value?: string | null;
  onChange: (brandId: string | null) => void;
  placeholder?: string;
  allowNull?: boolean;
  disabled?: boolean;
}

export function BrandSelect({
  value,
  onChange,
  placeholder = 'Select brand...',
  allowNull = true,
  disabled = false,
}: BrandSelectProps) {
  const [brands, setBrands] = useState<InventoryBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state for new brand
  const [newBrand, setNewBrand] = useState({
    name: '',
    code: '',
    logo_url: '',
    description: '',
  });

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/brands?is_active=true');

      if (!response.ok) {
        throw new Error('Failed to load brands');
      }

      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleCreate = async () => {
    if (!newBrand.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    // Validate logo URL if provided
    if (newBrand.logo_url && !isValidUrl(newBrand.logo_url)) {
      toast.error('Please enter a valid URL for the logo');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/inventory/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBrand.name.trim(),
          code: newBrand.code.trim() || undefined,
          logo_url: newBrand.logo_url.trim() || undefined,
          description: newBrand.description.trim() || undefined,
          is_active: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create brand');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Brand created successfully');
        setBrands([...brands, data.data]);
        onChange(data.data.id); // Auto-select the newly created brand
        setShowCreateDialog(false);
        setNewBrand({ name: '', code: '', logo_url: '', description: '' });
      }
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error((error as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const selectedBrand = brands.find((b) => b.id === value);

  return (
    <>
      <div className="flex gap-2">
        <Select
          value={value || (allowNull ? 'null' : undefined)}
          onValueChange={(val) => onChange(val === 'null' ? null : val)}
          disabled={disabled || loading}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={loading ? 'Loading...' : placeholder}>
              {selectedBrand && (
                <div className="flex items-center gap-2">
                  {selectedBrand.logo_url ? (
                    <img
                      src={selectedBrand.logo_url}
                      alt={selectedBrand.name}
                      className="h-4 w-4 object-contain"
                    />
                  ) : (
                    <Tag className="h-4 w-4" />
                  )}
                  <span>{selectedBrand.name}</span>
                  {selectedBrand.code && (
                    <span className="text-xs text-muted-foreground">
                      ({selectedBrand.code})
                    </span>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allowNull && (
              <SelectItem value="null">
                <span className="text-muted-foreground">No brand</span>
              </SelectItem>
            )}

            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                <div className="flex items-center gap-2">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-4 w-4 object-contain"
                    />
                  ) : (
                    <Tag className="h-4 w-4" />
                  )}
                  <span>{brand.name}</span>
                  {brand.code && (
                    <span className="text-xs text-muted-foreground">
                      ({brand.code})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCreateDialog(true)}
          disabled={disabled || loading}
          title="Add new brand"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Create Brand Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Brand</DialogTitle>
            <DialogDescription>
              Add a new brand for your inventory products
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">
                Brand Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand-name"
                placeholder="e.g., Nike, Adidas, Generic"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-code">Brand Code (Optional)</Label>
              <Input
                id="brand-code"
                placeholder="e.g., NIKE, ADID"
                value={newBrand.code}
                onChange={(e) => setNewBrand({ ...newBrand, code: e.target.value.toUpperCase() })}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from name if empty (max 10 chars)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-logo">Logo URL (Optional)</Label>
              <div className="flex gap-2">
                <ImageIcon className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="brand-logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={newBrand.logo_url}
                  onChange={(e) => setNewBrand({ ...newBrand, logo_url: e.target.value })}
                />
              </div>
              {newBrand.logo_url && isValidUrl(newBrand.logo_url) && (
                <div className="mt-2 p-2 border rounded-md">
                  <p className="text-xs text-muted-foreground mb-2">Logo Preview:</p>
                  <img
                    src={newBrand.logo_url}
                    alt="Logo preview"
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      toast.error('Failed to load logo. Please check the URL.');
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-description">Description (Optional)</Label>
              <Textarea
                id="brand-description"
                placeholder="Describe this brand..."
                rows={3}
                value={newBrand.description}
                onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={creating || !newBrand.name.trim()}
            >
              {creating ? (
                <>Creating...</>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Brand
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
