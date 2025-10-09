'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Building2, Tag, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface BrandData {
  name: string
  code: string
  logo_url: string
  settings: {
    color_primary: string
    color_secondary: string
    notes: string
  }
  is_active: boolean
}

interface ClientFormData {
  name: string
  contact_person: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  tax_id: string
  payment_terms: number | null
  credit_limit: number | null
  brands: BrandData[]
}

interface FormErrors {
  name?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  tax_id?: string
  payment_terms?: string
  credit_limit?: string
}

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Philippines'
    },
    tax_id: '',
    payment_terms: null,
    credit_limit: null,
    brands: []
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required'
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'Contact person is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Optional fields validation
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (formData.payment_terms !== null && (formData.payment_terms < 0 || formData.payment_terms > 365)) {
      newErrors.payment_terms = 'Payment terms must be between 0 and 365 days'
    }

    if (formData.credit_limit !== null && formData.credit_limit < 0) {
      newErrors.credit_limit = 'Credit limit cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...formData,
        address: formData.address,
        payment_terms: formData.payment_terms || undefined,
        credit_limit: formData.credit_limit || undefined
      }

      const response = await api.createClient(payload)

      if (response.success && response.data) {
        const clientId = response.data.id

        // Create brands if any
        if (formData.brands.length > 0) {
          for (const brand of formData.brands) {
            try {
              const brandPayload = {
                ...brand,
                settings: JSON.stringify(brand.settings),
                logo_url: brand.logo_url || undefined
              }
              await fetch(`/api/clients/${clientId}/brands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(brandPayload)
              })
            } catch (brandError) {
              console.error('Failed to create brand:', brandError)
            }
          }
        }

        toast.success(`Client created successfully${formData.brands.length > 0 ? ` with ${formData.brands.length} brand(s)` : ''}`)
        router.push('/clients')
      } else {
        throw new Error(response.error || 'Failed to create client')
      }
    } catch (error) {
      console.error('Failed to create client:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBrand = () => {
    setFormData(prev => ({
      ...prev,
      brands: [...prev.brands, {
        name: '',
        code: '',
        logo_url: '',
        settings: {
          color_primary: '#000000',
          color_secondary: '#ffffff',
          notes: ''
        },
        is_active: true
      }]
    }))
  }

  const handleRemoveBrand = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index)
    }))
  }

  const handleBrandChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.map((brand, i) => {
        if (i !== index) return brand

        if (field.startsWith('settings.')) {
          const settingKey = field.split('.')[1]
          return {
            ...brand,
            settings: {
              ...brand.settings,
              [settingKey]: value
            }
          }
        }

        return { ...brand, [field]: value }
      })
    }))
  }

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleAddressChange = (field: keyof ClientFormData['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }))
    
    // Clear address errors
    if (errors.address?.[field]) {
      setErrors(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: undefined
        }
      }))
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/clients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Client</h1>
          <p className="text-muted-foreground">Create a new client record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter client name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact_person"
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="Enter contact person name"
                  className={errors.contact_person ? 'border-red-500' : ''}
                />
                {errors.contact_person && <p className="text-sm text-red-500">{errors.contact_person}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
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
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="Enter state or province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    type="text"
                    value={formData.address.postal_code}
                    onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
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
                <Tag className="w-5 h-5" />
                Brands (Optional)
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddBrand}>
                <Plus className="w-4 h-4 mr-2" />
                Add Brand
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.brands.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No brands added yet</p>
                <p className="text-sm">Click "Add Brand" to create brands for this client</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.brands.map((brand, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Brand #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBrand(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
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
                        onChange={(e) => handleBrandChange(index, 'name', e.target.value)}
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
                        onChange={(e) => handleBrandChange(index, 'logo_url', e.target.value)}
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
                        onChange={(e) => handleBrandChange(index, 'settings.notes', e.target.value)}
                        placeholder="Additional notes about this brand"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/clients">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Client
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}