'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Building2, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

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
  is_active: boolean
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

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
    is_active: true
  })

  useEffect(() => {
    if (clientId) {
      fetchClient()
    }
  }, [clientId])

  const fetchClient = async () => {
    try {
      setLoading(true)
      const response = await api.getClient(clientId)
      
      if (response.success) {
        const client = response.data
        let parsedAddress = {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'Philippines'
        }

        if (client.address) {
          try {
            parsedAddress = JSON.parse(client.address)
          } catch {
            // If parsing fails, treat as plain text address
            parsedAddress.street = client.address
          }
        }

        setFormData({
          name: client.name || '',
          contact_person: client.contact_person || '',
          email: client.email || '',
          phone: client.phone || '',
          address: parsedAddress,
          tax_id: client.tax_id || '',
          payment_terms: client.payment_terms,
          credit_limit: client.credit_limit,
          is_active: client.is_active
        })
      } else {
        toast.error('Client not found')
        router.push('/clients')
      }
    } catch (error) {
      console.error('Failed to fetch client:', error)
      toast.error('Failed to load client details')
      router.push('/clients')
    } finally {
      setLoading(false)
    }
  }

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

    setSaving(true)

    try {
      const payload = {
        ...formData,
        address: JSON.stringify(formData.address),
        payment_terms: formData.payment_terms || undefined,
        credit_limit: formData.credit_limit || undefined
      }

      const response = await api.updateClient(clientId, payload)
      
      if (response.success) {
        toast.success('Client updated successfully')
        router.push(`/clients/${clientId}`)
      } else {
        throw new Error(response.error || 'Failed to update client')
      }
    } catch (error) {
      console.error('Failed to update client:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update client')
    } finally {
      setSaving(false)
    }
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

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/clients/${clientId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
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
              <Building2 className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Client Status</Label>
                <p className="text-sm text-muted-foreground">Active clients can place orders</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleInputChange('is_active', !formData.is_active)}
                className="flex items-center gap-2"
              >
                {formData.is_active ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 font-medium">Inactive</span>
                  </>
                )}
              </Button>
            </div>

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

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID</Label>
                <Input
                  id="tax_id"
                  type="text"
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                  placeholder="Enter tax ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms (Days)</Label>
                <Input
                  id="payment_terms"
                  type="number"
                  min="0"
                  max="365"
                  value={formData.payment_terms || ''}
                  onChange={(e) => handleInputChange('payment_terms', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g. 30"
                  className={errors.payment_terms ? 'border-red-500' : ''}
                />
                {errors.payment_terms && <p className="text-sm text-red-500">{errors.payment_terms}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit (₱)</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.credit_limit || ''}
                  onChange={(e) => handleInputChange('credit_limit', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 100000"
                  className={errors.credit_limit ? 'border-red-500' : ''}
                />
                {errors.credit_limit && <p className="text-sm text-red-500">{errors.credit_limit}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href={`/clients/${clientId}`}>
            <Button type="button" variant="outline" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}