'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Eye, Edit, Building2, Users, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import DashboardLayout from '@/components/dashboard-layout'

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
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchClients()
  }, [search, statusFilter, currentPage])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 20,
        ...(search && { search }),
        ...(statusFilter !== 'all' && { is_active: statusFilter === 'active' })
      }
      
      const response = await api.getClients(params)
      
      if (response.success) {
        setClients(response.data || [])
        setTotalPages(response.pagination?.total_pages || 1)
        setTotalCount(response.pagination?.total_count || 0)
      } else {
        setClients([])
        setTotalPages(1)
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      setClients([])
      setTotalPages(1)
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

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
        <Link href="/clients/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Client
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
                onChange={(e) => setStatusFilter(e.target.value)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clients List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {(clients || []).map((client) => (
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
                        <span className="font-medium text-muted-foreground">Brands:</span><br />
                        <span className="font-semibold">{client._count.brands}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Orders:</span><br />
                        <span className="font-semibold">{client._count.orders}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Payment Terms:</span><br />
                        <span className="font-semibold">{client.payment_terms ? `${client.payment_terms} days` : 'Not set'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Credit Limit:</span><br />
                        <span className="font-semibold">{formatCurrency(client.credit_limit)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      {client.tax_id && <span>Tax ID: {client.tax_id}</span>}
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
                    <Link href={`/clients/${client.id}/brands`}>
                      <Button variant="outline" size="sm">
                        <Building2 className="w-4 h-4 mr-1" />
                        Brands
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {clients.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground mb-4">No clients found</p>
                <Link href="/clients/new">
                  <Button>Create your first client</Button>
                </Link>
              </CardContent>
            </Card>
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