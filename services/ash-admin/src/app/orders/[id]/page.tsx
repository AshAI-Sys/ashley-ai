'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, Calendar, DollarSign, User, Building, FileText, Edit, Trash2 } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  currency: string
  delivery_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  po_number: string | null
  order_type: string | null
  design_name: string | null
  fabric_type: string | null
  size_distribution: string | null
  mockup_url: string | null
  client: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  brand: {
    id: string
    name: string
    code: string
  } | null
  line_items: Array<{
    id: string
    sku: string
    description: string
    quantity: number
    unit_price: number
    total_price: number
    printing_method: string | null
    garment_type: string | null
  }>
  _count: {
    line_items: number
    design_assets: number
    invoices: number
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${id}`)
      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
      } else {
        setError(data.error || 'Failed to load order')
      }
    } catch (err) {
      setError('Failed to load order')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      in_production: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase()
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency || 'PHP',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
              <p className="text-gray-600 mt-1">Order ID: {order.id}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/orders/${order.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {formatStatus(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">PO Number</label>
                  <p className="font-medium text-gray-900">{order.po_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Order Type</label>
                  <p className="font-medium text-gray-900">{order.order_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Design Name</label>
                  <p className="font-medium text-gray-900">{order.design_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Fabric Type</label>
                  <p className="font-medium text-gray-900">{order.fabric_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Size Distribution</label>
                  <p className="font-medium text-gray-900">{order.size_distribution || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Delivery Date</label>
                  <p className="font-medium text-gray-900">{formatDate(order.delivery_date)}</p>
                </div>
              </div>
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="text-sm text-gray-600">Notes</label>
                  <p className="text-gray-900 mt-1">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Line Items */}
            {order.line_items.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Line Items</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.line_items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(item.unit_price, order.currency)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(item.total_price, order.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.total_amount, order.currency)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Line Items</p>
                    <p className="text-lg font-semibold text-gray-900">{order._count.line_items}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Design Assets</p>
                    <p className="text-lg font-semibold text-gray-900">{order._count.design_assets}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(order.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Client Name</p>
                    <p className="font-medium text-gray-900">{order.client.name}</p>
                  </div>
                </div>
                <div className="pl-11">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{order.client.email}</p>
                </div>
                {order.client.phone && (
                  <div className="pl-11">
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{order.client.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Brand Information */}
            {order.brand && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Brand Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Brand Name</p>
                      <p className="font-medium text-gray-900">{order.brand.name}</p>
                    </div>
                  </div>
                  <div className="pl-11">
                    <p className="text-sm text-gray-600">Brand Code</p>
                    <p className="text-gray-900">{order.brand.code}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
