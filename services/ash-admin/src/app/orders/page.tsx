'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Eye, Edit, Package, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorAlert } from '@/components/ui/error-alert'
import { useDebounce } from '@/hooks/useDebounce'

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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 500)

  // React Query for data fetching with auto-refresh
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['orders', debouncedSearch, statusFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '10')
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/orders?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders')
      }
      return result.data
    },
    staleTime: 30000, // Data considered fresh for 30 seconds
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  })

  const orders = data?.orders || []
  const totalPages = data?.pagination?.totalPages || 1
  const totalCount = data?.pagination?.total || 0

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'

    switch (status.toUpperCase()) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'PENDING': return 'bg-blue-100 text-blue-800'
      case 'DESIGN': return 'bg-purple-100 text-purple-800'
      case 'PRODUCTION': return 'bg-yellow-100 text-yellow-800'
      case 'QC': return 'bg-orange-100 text-orange-800'
      case 'PACKING': return 'bg-indigo-100 text-indigo-800'
      case 'SHIPPED': return 'bg-cyan-100 text-cyan-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Link href="/orders/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Production Order
            </Button>
          </Link>
        </div>
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
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1) // Reset to first page on filter change
                }}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="DESIGN">Design</option>
                <option value="PRODUCTION">Production</option>
                <option value="QC">Quality Control</option>
                <option value="PACKING">Packing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {totalCount > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {orders.length} of {totalCount} orders
              {search && ` • Searching for "${search}"`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {isError && (
        <ErrorAlert
          message={error?.message || 'Failed to load orders. Please try again.'}
          retry={() => refetch()}
        />
      )}

      {/* Orders List */}
      {isLoading ? (
        <SkeletonTable />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{order?.order_number || 'Unknown Order'}</h3>
                      <Badge className={getStatusColor(order?.status)}>
                        {order?.status ? order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Client:</span><br />
                        {order?.client?.name || 'No Client'}
                      </div>
                      <div>
                        <span className="font-medium">Brand:</span><br />
                        {order?.brand?.name || 'No Brand'}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span><br />
                        ₱{(order?.total_amount || 0).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Delivery:</span><br />
                        {order?.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{order?._count?.line_items || 0} items</span>
                      <span>{order?._count?.design_assets || 0} designs</span>
                      <span>{order?._count?.bundles || 0} bundles</span>
                      <span>Created {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/orders/${order?.id || ''}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/orders/${order?.id || ''}/edit`}>
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

          {orders.length === 0 && !isLoading && !isError && (
            <EmptyState
              icon={Package}
              title="No orders found"
              description={search ? `No orders match "${search}"` : "Get started by creating your first production order"}
              action={{
                label: "Create Order",
                href: "/orders/new"
              }}
            />
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || isFetching}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || isFetching}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      )}
      </div>
    </DashboardLayout>
  )
}