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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your clients and their information</p>
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
          <Link href="/clients/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Client
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
                  placeholder="Search clients..."
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <Badge className={client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                      {client.contact_person && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{client.contact_person}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{formatAddress(client.address)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Orders:</span><br />
                        <span className="font-semibold">{client._count.orders}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Created {new Date(client.created_at).toLocaleDateString()}</span>
                      <span>Updated {new Date(client.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/clients/${client.id}/edit`}>
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