'use client';

import { useState, useEffect } from 'react';
import { Plus, FolderTree, Check } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  parent_id?: string | null;
  is_active: boolean;
  _count?: {
    products: number;
    subcategories: number;
  };
  parent?: {
    id: string;
    name: string;
  } | null;
}

interface CategorySelectProps {
  value?: string | null;
  onChange: (categoryId: string | null) => void;
  placeholder?: string;
  allowNull?: boolean;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  placeholder = 'Select category...',
  allowNull = true,
  disabled = false,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state for new category
  const [newCategory, setNewCategory] = useState({
    name: '',
    code: '',
    description: '',
    parent_id: '',
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/categories?is_active=true');

      if (!response.ok) {
        throw new Error('Failed to load categories');
      }

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/inventory/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name.trim(),
          code: newCategory.code.trim() || undefined,
          description: newCategory.description.trim() || undefined,
          parent_id: newCategory.parent_id || undefined,
          is_active: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Category created successfully');
        setCategories([...categories, data.data]);
        onChange(data.data.id); // Auto-select the newly created category
        setShowCreateDialog(false);
        setNewCategory({ name: '', code: '', description: '', parent_id: '' });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error((error as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === value);

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
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  <span>{selectedCategory.name}</span>
                  {selectedCategory.parent && (
                    <span className="text-xs text-muted-foreground">
                      ({selectedCategory.parent.name})
                    </span>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allowNull && (
              <SelectItem value="null">
                <span className="text-muted-foreground">No category</span>
              </SelectItem>
            )}

            {categories
              .filter((c) => !c.parent_id) // Top-level categories
              .map((category) => (
                <div key={category.id}>
                  <SelectItem value={category.id}>
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4" />
                      <span className="font-medium">{category.name}</span>
                      {category.code && (
                        <span className="text-xs text-muted-foreground">
                          ({category.code})
                        </span>
                      )}
                    </div>
                  </SelectItem>

                  {/* Subcategories */}
                  {categories
                    .filter((sc) => sc.parent_id === category.id)
                    .map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id} className="pl-8">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">└─</span>
                          <span>{subcategory.name}</span>
                          {subcategory.code && (
                            <span className="text-xs text-muted-foreground">
                              ({subcategory.code})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                </div>
              ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCreateDialog(true)}
          disabled={disabled || loading}
          title="Add new category"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for organizing your products
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                placeholder="e.g., T-Shirts, Polo, Pants"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-code">Category Code (Optional)</Label>
              <Input
                id="category-code"
                placeholder="e.g., TSHIRT, POLO"
                value={newCategory.code}
                onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate from name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-parent">Parent Category (Optional)</Label>
              <Select
                value={newCategory.parent_id || 'null'}
                onValueChange={(val) => setNewCategory({ ...newCategory, parent_id: val === 'null' ? '' : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">No parent (top-level)</SelectItem>
                  {categories
                    .filter((c) => !c.parent_id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Description (Optional)</Label>
              <Textarea
                id="category-description"
                placeholder="Describe this category..."
                rows={3}
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
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
              disabled={creating || !newCategory.name.trim()}
            >
              {creating ? (
                <>Creating...</>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
