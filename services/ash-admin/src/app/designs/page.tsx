'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Eye, Edit, Send, Lock, Upload } from 'lucide-react'
import Link from 'next/link'

interface DesignAsset {
  id: string
  name: string
  method: string
  status: string
  current_version: number
  is_best_seller: boolean
  created_at: string
  updated_at: string
  order: {
    id: string
    order_number: string
    status: string
  }
  brand: {
    id: string
    name: string
    code: string
  }
  versions: Array<{
    id: string
    version: number
    files: string
    created_at: string
  }>
  approvals: Array<{
    id: string
    status: string
    created_at: string
    client: {
      name: string
    }
  }>
  _count: {
    versions: number
    approvals: number
    checks: number
  }
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<DesignAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  useEffect(() => {
    fetchDesigns()
  }, [search, statusFilter, methodFilter])

  const fetchDesigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (methodFilter !== 'all') params.append('method', methodFilter)
      
      const response = await fetch(`/api/designs?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setDesigns(data.data || [])
      } else {
        setDesigns([])
      }
    } catch (error) {
      console.error('Failed to fetch designs:', error)
      setDesigns([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status.toUpperCase()) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'LOCKED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodColor = (method: string) => {
    if (!method) return 'bg-gray-100 text-gray-800'
    switch (method.toUpperCase()) {
      case 'SILKSCREEN': return 'bg-purple-100 text-purple-800'
      case 'SUBLIMATION': return 'bg-cyan-100 text-cyan-800'
      case 'DTF': return 'bg-orange-100 text-orange-800'
      case 'EMBROIDERY': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSendApproval = async (designId: string, version: number) => {
    // TODO: Implement send approval modal
    console.log('Send for approval:', designId, version)
  }

  const handleLockDesign = async (designId: string, version: number) => {
    if (!confirm('Are you sure you want to lock this design version? This cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/designs/${designId}/versions/${version}/lock`, {
        method: 'POST'
      })
      
      if (response.ok) {
        fetchDesigns()
      }
    } catch (error) {
      console.error('Failed to lock design:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Design Assets</h1>
          <p className="text-muted-foreground">Manage design files, versions, and client approvals</p>
        </div>
        <Link href="/designs/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Design
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
                  placeholder="Search designs..."
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
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="LOCKED">Locked</option>
              </select>
              
              <select 
                value={methodFilter} 
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="all">All Methods</option>
                <option value="SILKSCREEN">Silkscreen</option>
                <option value="SUBLIMATION">Sublimation</option>
                <option value="DTF">DTF</option>
                <option value="EMBROIDERY">Embroidery</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Assets List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {(designs || []).map((design) => (
            <Card key={design.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{design.name}</h3>
                      <Badge className={getStatusColor(design.status)}>
                        {design.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getMethodColor(design.method)}>
                        {design.method}
                      </Badge>
                      {design.is_best_seller && (
                        <Badge variant="secondary">⭐ Best Seller</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                      <div>
                        <span className="font-medium">Order:</span><br />
                        {design.order.order_number}
                      </div>
                      <div>
                        <span className="font-medium">Brand:</span><br />
                        {design.brand.name} ({design.brand.code})
                      </div>
                      <div>
                        <span className="font-medium">Version:</span><br />
                        v{design.current_version}
                      </div>
                      <div>
                        <span className="font-medium">Latest Approval:</span><br />
                        {(design.approvals || []).length > 0 ? (
                          <>
                            <Badge className={getStatusColor((design.approvals || [])[0]?.status)} variant="outline">
                              {(design.approvals || [])[0]?.status}
                            </Badge>
                            <br />
                            <span className="text-xs">by {(design.approvals || [])[0]?.client?.name}</span>
                          </>
                        ) : (
                          'No approvals yet'
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{design._count.versions} versions</span>
                      <span>{design._count.approvals} approvals</span>
                      <span>{design._count.checks} checks</span>
                      <span>Updated {new Date(design.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/designs/${design.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    
                    {design.status === 'DRAFT' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendApproval(design.id, design.current_version)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send Approval
                      </Button>
                    )}
                    
                    {design.status === 'APPROVED' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleLockDesign(design.id, design.current_version)}
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        Lock
                      </Button>
                    )}
                    
                    <Link href={`/designs/${design.id}/edit`}>
                      <Button variant="outline" size="sm" disabled={design.status === 'LOCKED'}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {designs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No design assets found</p>
                <Link href="/designs/new">
                  <Button>Upload your first design</Button>
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