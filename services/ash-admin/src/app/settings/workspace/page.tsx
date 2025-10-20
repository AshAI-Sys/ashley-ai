'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Building2, Upload, Trash2, Globe, MapPin, Phone, Mail , ArrowLeft} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

export default function WorkspaceSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    industry: '',
    company_size: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Philippines',
    postal_code: '',
    timezone: 'Asia/Manila',
    currency: 'PHP',
    date_format: 'MM/DD/YYYY',
    tax_id: ''
  })

  useEffect(() => {
    fetchWorkspaceData()
  }, [])

  const fetchWorkspaceData = async () => {
    try {
      const response = await fetch('/api/settings/workspace')
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'Philippines',
          postal_code: data.postal_code || '',
          timezone: data.timezone || 'Asia/Manila',
          currency: data.currency || 'PHP',
          date_format: data.date_format || 'MM/DD/YYYY',
          tax_id: data.tax_id || ''
        })
        if (data.logo_url) {
          setLogoPreview(data.logo_url)
        }
      }
    } catch (error) {
      console.error('Failed to fetch workspace data:', error)
    }
  }

  const handleLogoClick = () => {
    fileInputRef.current?.click()
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('logo', file)

    try {
      const response = await fetch('/api/settings/workspace/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload logo')
      }

      const data = await response.json()
      toast.success('Logo updated successfully!')
      setLogoPreview(data.logo_url)
    } catch (error) {
      toast.error('Failed to upload logo')
      setLogoPreview(null)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove the workspace logo?')) return

    setUploadingLogo(true)
    try {
      const response = await fetch('/api/settings/workspace/logo', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove logo')
      }

      toast.success('Logo removed successfully!')
      setLogoPreview(null)
    } catch (error) {
      toast.error('Failed to remove logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings/workspace', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update workspace')
      }

      toast.success('Workspace settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update workspace settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
            {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/settings')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Settings
      </Button>

<div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workspace Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your workspace information and branding
        </p>
      </div>

      {/* Logo Section */}
      <div className="space-y-4">
        <Label>Company Logo</Label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            {uploadingLogo && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogoClick}
              disabled={uploadingLogo}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
            {logoPreview && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveLogo}
                disabled={uploadingLogo}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t dark:border-gray-700">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ashley AI Manufacturing"
                required
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="slug">Workspace Slug *</Label>
              <Input
                id="slug"
                type="text"
                value={formData.slug}
                disabled
                className="dark:bg-gray-800 dark:text-white bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Workspace slug cannot be changed
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your company..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select industry</option>
                <option value="Apparel Manufacturing">Apparel Manufacturing</option>
                <option value="Textile Production">Textile Production</option>
                <option value="Garment Manufacturing">Garment Manufacturing</option>
                <option value="Fashion & Design">Fashion & Design</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="company_size">Company Size</Label>
              <select
                id="company_size"
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 pt-6 border-t dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+63 912 345 6789"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.yourcompany.com"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4 pt-6 border-t dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Manila"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Metro Manila"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Philippines"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="1000"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="space-y-4 pt-6 border-t dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Business Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                <option value="Asia/Hong_Kong">Asia/Hong Kong (GMT+8)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="PHP">PHP - Philippine Peso</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <Label htmlFor="date_format">Date Format</Label>
              <select
                id="date_format"
                value={formData.date_format}
                onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tax_id">Tax ID / TIN</Label>
              <Input
                id="tax_id"
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                placeholder="000-000-000-000"
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t dark:border-gray-700">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
