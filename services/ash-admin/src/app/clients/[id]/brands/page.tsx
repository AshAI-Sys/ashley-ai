"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Building2,
  Edit,
  Image,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Client {
  id: string;
  name: string;
  is_active: boolean;
}

interface Brand {
  id: string;
  name: string;
  code?: string;
  logo_url?: string;
  settings?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BrandFormData {
  name: string;
  code: string;
  logo_url: string;
  settings: {
    color_primary: string;
    color_secondary: string;
    notes: string;
  };
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  code?: string;
  logo_url?: string;
}

export default function ClientBrandsPage() {
  const ___router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    code: "",
    logo_url: "",
    settings: {
      color_primary: "#000000",
      color_secondary: "#ffffff",
      notes: "",
    },
    is_active: true,
  });

  useEffect(() => {
    if (clientId) {
      fetchClient();
      fetchBrands();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const response = await api.getClient(clientId);
      if (response.success) {
        setClient(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.getClientBrands(clientId);

      if (response.success) {
        setBrands(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      logo_url: "",
      settings: {
        color_primary: "#000000",
        color_secondary: "#ffffff",
        notes: "",
      },
      is_active: true,
    });
    setErrors({});
    setEditingBrand(null);
    setShowForm(false);
  };

  const handleEdit = (brand: Brand) => {
    let parsedSettings = {
      color_primary: "#000000",
      color_secondary: "#ffffff",
      notes: "",
    };

    if (brand.settings) {
      try {
        parsedSettings = { ...parsedSettings, ...JSON.parse(brand.settings) };
      } catch {
        // Keep defaults if parsing fails
      }
    }

    setFormData({
      name: brand.name,
      code: brand.code || "",
      logo_url: brand.logo_url || "",
      settings: parsedSettings,
      is_active: brand.is_active,
    });
    setEditingBrand(brand);
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Brand name is required";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Brand code is required";
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code =
        "Brand code must contain only uppercase letters, numbers, and underscores";
    }

    if (formData.logo_url && !/^https?:\/\/.+/.test(formData.logo_url)) {
      newErrors.logo_url = "Logo URL must be a valid HTTP/HTTPS URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        settings: JSON.stringify(formData.settings),
        logo_url: formData.logo_url || undefined,
      };

      let response;
      if (editingBrand) {
        // Update existing brand
        response = await api.updateClientBrand(
          clientId,
          editingBrand.id,
          payload
        );
      } else {
        // Create new brand
        response = await api.createClientBrand(clientId, payload);
      }

      if (response.success) {
        toast.success(
          editingBrand
            ? "Brand updated successfully"
            : "Brand created successfully"
        );
        resetForm();
        fetchBrands();
      } else {
        throw new Error(response.error || "Failed to save brand");
      }
    } catch (error) {
      console.error("Failed to save brand:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save brand"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("settings.")) {
      const settingField = field.replace("settings.", "");
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const formatSettings = (settings: string | null) => {
    if (!settings) return null;
    try {
      const parsed = JSON.parse(settings);
      return parsed;
    } catch {
      return null;
    }
  };

  if (loading && !client) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/clients/${clientId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Client
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Brands for {client?.name}</h1>
            <p className="text-muted-foreground">
              Manage brands associated with this client
            </p>
          </div>
        </div>

        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        )}
      </div>

      {/* Add/Edit Brand Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </span>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Brand Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => handleInputChange("name", e.target.value)}
                    placeholder="Enter brand name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">
                    Brand Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={e =>
                      handleInputChange("code", e.target.value.toUpperCase())
                    }
                    placeholder="e.g. NIKE, ADIDAS"
                    className={errors.code ? "border-red-500" : ""}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Used for order numbering. Only uppercase letters, numbers,
                    and underscores.
                  </p>
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={e => handleInputChange("logo_url", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className={errors.logo_url ? "border-red-500" : ""}
                />
                {errors.logo_url && (
                  <p className="text-sm text-red-500">{errors.logo_url}</p>
                )}
              </div>

              {/* Brand Settings */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Brand Settings
                </Label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="color_primary">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color_primary"
                        type="color"
                        value={formData.settings.color_primary}
                        onChange={e =>
                          handleInputChange(
                            "settings.color_primary",
                            e.target.value
                          )
                        }
                        className="h-10 w-16 p-1"
                      />
                      <Input
                        type="text"
                        value={formData.settings.color_primary}
                        onChange={e =>
                          handleInputChange(
                            "settings.color_primary",
                            e.target.value
                          )
                        }
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color_secondary">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color_secondary"
                        type="color"
                        value={formData.settings.color_secondary}
                        onChange={e =>
                          handleInputChange(
                            "settings.color_secondary",
                            e.target.value
                          )
                        }
                        className="h-10 w-16 p-1"
                      />
                      <Input
                        type="text"
                        value={formData.settings.color_secondary}
                        onChange={e =>
                          handleInputChange(
                            "settings.color_secondary",
                            e.target.value
                          )
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.settings.notes}
                    onChange={e =>
                      handleInputChange("settings.notes", e.target.value)
                    }
                    placeholder="Additional notes about this brand"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div>
                  <Label className="text-base font-semibold">
                    Brand Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Active brands can be used for orders
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleInputChange("is_active", !formData.is_active)
                  }
                  className="flex items-center gap-2"
                >
                  {formData.is_active ? (
                    <>
                      <ToggleRight className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-600">
                        Inactive
                      </span>
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      {editingBrand ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingBrand ? "Update Brand" : "Create Brand"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Brands List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {(brands || []).map(brand => {
            const settings = formatSettings(brand.settings);
            return (
              <Card
                key={brand.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        {brand.logo_url && (
                          <img
                            src={brand.logo_url}
                            alt={`${brand.name} logo`}
                            className="h-8 w-8 rounded object-contain"
                            onError={e => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <h3 className="text-lg font-semibold">{brand.name}</h3>
                        {brand.code && (
                          <Badge variant="outline" className="font-mono">
                            {brand.code}
                          </Badge>
                        )}
                        <Badge
                          className={
                            brand.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {brand.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {settings && (
                        <div className="mb-3 flex items-center gap-4">
                          {settings.color_primary && (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded border"
                                style={{
                                  backgroundColor: settings.color_primary,
                                }}
                              ></div>
                              <span className="text-sm text-muted-foreground">
                                {settings.color_primary}
                              </span>
                            </div>
                          )}
                          {settings.color_secondary && (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded border"
                                style={{
                                  backgroundColor: settings.color_secondary,
                                }}
                              ></div>
                              <span className="text-sm text-muted-foreground">
                                {settings.color_secondary}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {settings?.notes && (
                        <p className="mb-3 text-sm text-muted-foreground">
                          {settings.notes}
                        </p>
                      )}

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          Created{" "}
                          {new Date(brand.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Updated{" "}
                          {new Date(brand.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(brand)}
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {brands.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                <p className="mb-4 text-muted-foreground">
                  No brands found for this client
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Brand
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
