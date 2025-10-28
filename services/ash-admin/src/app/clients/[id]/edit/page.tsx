"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Building2,
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface BrandData {
  id?: string;
  name: string;
  logo_url: string;
  settings: {
    notes: string;
  };
  is_active: boolean;
  _action?: "create" | "update" | "delete";
}

interface ClientFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  is_active: boolean;
  brands: BrandData[];
}

interface FormErrors {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [existingBrands, setExistingBrands] = useState<BrandData[]>([]);

  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Philippines",
    },
    is_active: true,
    brands: [],
  });

  useEffect(() => {
    if (clientId) {
      fetchClientAndBrands();
    }
  }, [clientId]);

  const fetchClientAndBrands = async () => {
    try {
      setLoading(true);

      // Fetch client details
      const clientResponse = await api.getClient(clientId);

      if (clientResponse.success) {
        const client = clientResponse.data;
        let parsedAddress = {
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "Philippines",
        };

        if (client.address) {
          try {
            parsedAddress = JSON.parse(client.address);
          } catch {
            parsedAddress.street = client.address;
          }
        }

        // Fetch client brands
        const brandsResponse = await api.getClientBrands(clientId);
        const clientBrands = brandsResponse.success ? brandsResponse.data : [];

        const formattedBrands = clientBrands.map((brand: any) => {
          let settings = { notes: "" };
          if (brand.settings) {
            try {
              settings = JSON.parse(brand.settings);
            } catch (e) {
              // Invalid JSON, use default settings
              console.warn("Failed to parse brand settings:", e);
            }
          }

          return {
            id: brand.id,
            name: brand.name,
            logo_url: brand.logo_url || "",
            settings,
            is_active: brand.is_active,
          };
        });

        setFormData({
          name: client.name || "",
          contact_person: client.contact_person || "",
          email: client.email || "",
          phone: client.phone || "",
          address: parsedAddress,
          is_active: client.is_active,
          brands: formattedBrands,
        });

        setExistingBrands(formattedBrands);
      } else {
        toast.error("Client not found");
        router.push("/clients");
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
      toast.error("Failed to load client details");
      router.push("/clients");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = "Contact person is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
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

    setSaving(true);

    try {
      // Update client information
      const clientPayload = {
        name: formData.name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        address: JSON.stringify(formData.address),
        is_active: formData.is_active,
      };

      const clientResponse = await api.updateClient(clientId, clientPayload);

      if (!clientResponse.success) {
        throw new Error(clientResponse.error || "Failed to update client");
      }

      // Handle brand operations
      const brandPromises: Promise<any>[] = [];

      // Determine which brands to create, update, or delete
      const ____existingBrandIds = existingBrands.map(b => b.id);
      const currentBrandIds = formData.brands.filter(b => b.id).map(b => b.id);

      // Delete brands that were removed
      const brandsToDelete = existingBrands.filter(
        eb => !currentBrandIds.includes(eb.id)
      );
      brandsToDelete.forEach(brand => {
        if (brand.id) {
          brandPromises.push(api.deleteClientBrand(clientId, brand.id));
        }
      });

      // Create or update brands
      formData.brands.forEach(brand => {
        const brandPayload = {
          name: brand.name,
          logo_url: brand.logo_url || undefined,
          settings: JSON.stringify(brand.settings),
          is_active: brand.is_active,
        };

        if (brand.id) {
          // Update existing brand
          brandPromises.push(
            api.updateClientBrand(clientId, brand.id, brandPayload)
          );
        } else {
          // Create new brand
          brandPromises.push(api.createClientBrand(clientId, brandPayload));
        }
      });

      // Wait for all brand operations to complete
      await Promise.all(brandPromises);

      toast.success("Client updated successfully");
      router.push(`/clients/${clientId}`);
    } catch (error) {
      console.error("Failed to update client:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update client"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleAddressChange = (
    field: keyof ClientFormData["address"],
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleAddBrand = () => {
    setFormData(prev => ({
      ...prev,
      brands: [
        ...prev.brands,
        {
          name: "",
          logo_url: "",
          settings: { notes: "" },
          is_active: true,
        },
      ],
    }));
  };

  const handleRemoveBrand = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index),
    }));
  };

  const handleBrandChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.map((brand, i) => {
        if (i === index) {
          if (field.startsWith("settings.")) {
            const settingField = field.replace("settings.", "");
            return {
              ...brand,
              settings: {
                ...brand.settings,
                [settingField]: value,
              },
            };
          }
          return {
            ...brand,
            [field]: value,
          };
        }
        return brand;
      }),
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/clients/${clientId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Client</h1>
          <p className="text-muted-foreground">Update client information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Toggle */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div>
                <Label className="text-base font-semibold">Client Status</Label>
                <p className="text-sm text-muted-foreground">
                  Active clients can place orders
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
                    <span className="font-medium text-gray-600">Inactive</span>
                  </>
                )}
              </Button>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  placeholder="Enter client name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact_person"
                  type="text"
                  value={formData.contact_person}
                  onChange={e =>
                    handleInputChange("contact_person", e.target.value)
                  }
                  placeholder="Enter contact person name"
                  className={errors.contact_person ? "border-red-500" : ""}
                />
                {errors.contact_person && (
                  <p className="text-sm text-red-500">
                    {errors.contact_person}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Address</Label>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  type="text"
                  value={formData.address.street}
                  onChange={e => handleAddressChange("street", e.target.value)}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.address.city}
                    onChange={e => handleAddressChange("city", e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.address.state}
                    onChange={e => handleAddressChange("state", e.target.value)}
                    placeholder="Enter state or province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    type="text"
                    value={formData.address.postal_code}
                    onChange={e =>
                      handleAddressChange("postal_code", e.target.value)
                    }
                    placeholder="Enter postal code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    value={formData.address.country}
                    onChange={e =>
                      handleAddressChange("country", e.target.value)
                    }
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brands Section */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Brands (Optional)
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBrand}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.brands.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Tag className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>No brands added yet</p>
                <p className="text-sm">
                  Click "Add Brand" to create brands for this client
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.brands.map((brand, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-lg border bg-gray-50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        Brand #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBrand(index)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Brand Name */}
                    <div className="space-y-2">
                      <Label htmlFor={`brand-name-${index}`}>
                        Brand Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`brand-name-${index}`}
                        type="text"
                        value={brand.name}
                        onChange={e =>
                          handleBrandChange(index, "name", e.target.value)
                        }
                        placeholder="e.g., Nike, Adidas"
                      />
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-2">
                      <Label htmlFor={`brand-logo-${index}`}>Logo URL</Label>
                      <Input
                        id={`brand-logo-${index}`}
                        type="url"
                        value={brand.logo_url}
                        onChange={e =>
                          handleBrandChange(index, "logo_url", e.target.value)
                        }
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor={`brand-notes-${index}`}>Notes</Label>
                      <Input
                        id={`brand-notes-${index}`}
                        type="text"
                        value={brand.settings.notes}
                        onChange={e =>
                          handleBrandChange(
                            index,
                            "settings.notes",
                            e.target.value
                          )
                        }
                        placeholder="Additional notes about this brand"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-4">
          <Link href={`/clients/${clientId}`}>
            <Button type="button" variant="outline" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
