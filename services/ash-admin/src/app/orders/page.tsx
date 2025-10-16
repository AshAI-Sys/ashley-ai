'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Eye, Edit, Package, RefreshCw, Download } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { DataTableSkeleton } from '@/components/ui/loading-skeletons'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorAlert } from '@/components/ui/error-alert'
import { useDebounce } from '@/hooks/useDebounce'
import { exportOrders } from '@/lib/export'

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
      {/* Page Header - Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Production Orders</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Manage your production orders and track their progress</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => exportOrders(orders, 'excel')}
            disabled={orders.length === 0}
            className="gap-2 flex-1 sm:flex-none"
            size="sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 flex-1 sm:flex-none"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Link href="/orders/new" className="flex-1 sm:flex-none">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters - Responsive */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1) // Reset to first page on filter change
                }}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm h-10 flex-1 sm:flex-none min-w-0"
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
        <DataTableSkeleton rows={10} />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="font-semibold text-lg truncate">{order?.order_number || 'Unknown Order'}</h3>
                      <Badge className={getStatusColor(order?.status)}>
                        {order?.status ? order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                      </Badge>
                    </div>

                    {/* Details Grid - Optimized for mobile */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Client</span>
                        <span className="font-medium mt-0.5 truncate">{order?.client?.name || 'No Client'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Brand</span>
                        <span className="font-medium mt-0.5 truncate">{order?.brand?.name || 'No Brand'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Amount</span>
                        <span className="font-medium mt-0.5">₱{(order?.total_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">Delivery</span>
                        <span className="font-medium mt-0.5">{order?.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {order?._count?.line_items || 0} items
                      </span>
                      <span>{order?._count?.design_assets || 0} designs</span>
                      <span>{order?._count?.bundles || 0} bundles</span>
                      <span className="hidden sm:inline">Created {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <Link href={`/orders/${order?.id || ''}`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" className="h-9 px-3 w-full">
                        <Eye className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </Link>
                    <Link href={`/orders/${order?.id || ''}/edit`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" className="h-9 px-3 w-full">
                        <Edit className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
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