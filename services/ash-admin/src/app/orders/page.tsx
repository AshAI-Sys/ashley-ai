'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  delivery_date: string
  created_at: string
  client: {
    id: string
    name: string
  }
  brand: {
    id: string
    name: string
  } | null
  _count: {
    design_assets: number
    line_items: number
    bundles: number
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [search, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data?.orders || data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'intake': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Production Orders</h1>
          <p className="text-muted-foreground">Manage your production orders and track their progress</p>
        </div>
        <Link href="/orders/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Production Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="intake">Intake</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {(orders || []).map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Client:</span><br />
                        {order.client.name}
                      </div>
                      <div>
                        <span className="font-medium">Brand:</span><br />
                        {order.brand?.name || 'No Brand'}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span><br />
                        ₱{order.total_amount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Delivery:</span><br />
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{order._count.line_items} items</span>
                      <span>{order._count.design_assets} designs</span>
                      <span>{order._count.bundles} bundles</span>
                      <span>Created {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/orders/${order.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {orders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No orders found</p>
                <Link href="/orders/new">
                  <Button>Create your first production order</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
    </DashboardLayout>
  )
}