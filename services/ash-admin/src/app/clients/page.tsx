'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Eye, Edit, Building2, Users, Phone, Mail, MapPin, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/dashboard-layout'
import { SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorAlert } from '@/components/ui/error-alert'
import { useDebounce } from '@/hooks/useDebounce'

interface Client {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  tax_id?: string
  payment_terms?: number
  credit_limit?: number
  is_active: boolean
  created_at: string
  updated_at: string
  _count: {
    brands: number
    orders: number
  }
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 500)

  // React Query for data fetching with auto-refresh
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['clients', debouncedSearch, statusFilter, currentPage],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: 20,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== 'all' && { is_active: statusFilter === 'active' })
      }
      const response = await api.getClients(params)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch clients')
      }
      return response.data
    },
    staleTime: 30000, // Data considered fresh for 30 seconds
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  })

  const clients = data?.clients || []
  const totalPages = data?.pagination?.pages || 1
  const totalCount = data?.pagination?.total || 0

  const formatAddress = (address: string | null) => {
    if (!address) return 'No address'
    try {
      const parsed = JSON.parse(address)
      return `${parsed.street || ''} ${parsed.city || ''} ${parsed.state || ''}`.trim() || 'Address incomplete'
    } catch {
      return address
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'No limit'
    return `₱${amount.toLocaleString()}`
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
      {/* Page Header - Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Clients</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Manage your clients and their information</p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <Link href="/clients/new" className="flex-1 sm:flex-none">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Client
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
                  placeholder="Search clients..."
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
                <option value="all">All Clients</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {totalCount > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {clients.length} of {totalCount} clients
              {search && ` • Searching for "${search}"`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {isError && (
        <ErrorAlert
          message={error?.message || 'Failed to load clients. Please try again.'}
          retry={() => refetch()}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <SkeletonTable />
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <h3 className="font-semibold text-lg truncate">{client.name}</h3>
                      </div>
                      <Badge className={client.is_active ? 'bg-green-100 text-green-800 w-fit' : 'bg-red-100 text-red-800 w-fit'}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Contact Info Grid - Optimized for mobile */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                      {client.contact_person && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{client.contact_person}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{formatAddress(client.address)}</span>
                      </div>
                    </div>

                    {/* Stats - Compact for mobile */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Orders: </span>
                        <span className="font-semibold">{client._count.orders}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Brands: </span>
                        <span className="font-semibold">{client._count.brands}</span>
                      </div>
                    </div>

                    {/* Timestamps - Hidden on mobile */}
                    <div className="hidden sm:flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Created {new Date(client.created_at).toLocaleDateString()}</span>
                      <span>Updated {new Date(client.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <Link href={`/clients/${client.id}`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" className="h-9 px-3 w-full">
                        <Eye className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </Link>
                    <Link href={`/clients/${client.id}/edit`} className="flex-1 sm:flex-none">
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

          {clients.length === 0 && !isLoading && !isError && (
            <EmptyState
              icon={Building2}
              title="No clients found"
              description={search ? `No clients match "${search}"` : "Get started by creating your first client"}
              action={{
                label: "Create Client",
                href: "/clients/new"
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
            disabled={currentPage === 1}
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
            disabled={currentPage === totalPages}
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