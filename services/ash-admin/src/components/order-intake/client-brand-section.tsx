'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Building, User } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Client {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  brands: Array<{
    id: string
    name: string
    code: string
  }>
}

interface ClientBrandSectionProps {
  clients: Client[]
  selectedClientId: string
  selectedBrandId: string
  channel: string
  onClientChange: (clientId: string) => void
  onBrandChange: (brandId: string) => void
  onChannelChange: (channel: string) => void
  onClientCreated: (client: Client) => void
}

interface NewClientForm {
  name: string
  company: string
  email: string
  phone: string
  address: string
}

export function ClientBrandSection({
  clients,
  selectedClientId,
  selectedBrandId,
  channel,
  onClientChange,
  onBrandChange,
  onChannelChange,
  onClientCreated
}: ClientBrandSectionProps) {
  const [showNewClientDialog, setShowNewClientDialog] = useState(false)
  const [newClientForm, setNewClientForm] = useState<NewClientForm>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: ''
  })
  const [creatingClient, setCreatingClient] = useState(false)

  // Ensure clients is an array
  const clientsArray = Array.isArray(clients) ? clients : []
  const selectedClient = clientsArray.find(c => c.id === selectedClientId)

  const handleCreateClient = async () => {
    if (!newClientForm.name.trim()) {
      toast.error('Client name is required')
      return
    }

    setCreatingClient(true)
    try {
      // Get CSRF token from cookie
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1]

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({
          name: newClientForm.name,
          contact_person: newClientForm.company || null,
          email: newClientForm.email && newClientForm.email.includes('@') ? newClientForm.email : null,
          phone: newClientForm.phone || null,
          address: newClientForm.address || null
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        const newClient: Client = {
          ...result.data,
          brands: []
        }
        
        onClientCreated(newClient)
        onClientChange(newClient.id)
        
        setNewClientForm({ name: '', company: '', email: '', phone: '', address: '' })
        setShowNewClientDialog(false)
        toast.success('Client created successfully')
      } else {
        toast.error(result.message || 'Failed to create client')
      }
    } catch (error) {
      console.error('Create client error:', error)
      toast.error('Failed to create client')
    } finally {
      setCreatingClient(false)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">A</span>
          <span className="font-bold">Client & Brand</span>
          <Badge variant="destructive" className="ml-auto">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-semibold text-gray-700">Client *</Label>
            <div className="flex gap-2">
              <Select value={selectedClientId} onValueChange={onClientChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsArray.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}{client.company ? ` (${client.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                <DialogTrigger suppressHydrationWarning className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <Plus className="w-4 h-4" suppressHydrationWarning />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Create New Client
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="client-name">Client Name *</Label>
                      <Input
                        id="client-name"
                        value={newClientForm.name}
                        onChange={(e) => setNewClientForm({...newClientForm, name: e.target.value})}
                        placeholder="Enter client name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="client-company">Company</Label>
                      <Input
                        id="client-company"
                        value={newClientForm.company}
                        onChange={(e) => setNewClientForm({...newClientForm, company: e.target.value})}
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client-email">Email</Label>
                        <Input
                          id="client-email"
                          type="email"
                          value={newClientForm.email}
                          onChange={(e) => setNewClientForm({...newClientForm, email: e.target.value})}
                          placeholder="client@email.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="client-phone">Phone</Label>
                        <Input
                          id="client-phone"
                          value={newClientForm.phone}
                          onChange={(e) => setNewClientForm({...newClientForm, phone: e.target.value})}
                          placeholder="+63 XXX XXX XXXX"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="client-address">Billing Address</Label>
                      <Input
                        id="client-address"
                        value={newClientForm.address}
                        onChange={(e) => setNewClientForm({...newClientForm, address: e.target.value})}
                        placeholder="Enter billing address"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateClient}
                        disabled={creatingClient || !newClientForm.name.trim()}
                        className="flex-1"
                      >
                        {creatingClient ? 'Creating...' : 'Create Client'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewClientDialog(false)}
                        disabled={creatingClient}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">Brand *</Label>
            <div className="flex gap-2">
              <Select
                value={selectedBrandId}
                onValueChange={onBrandChange}
                disabled={!selectedClientId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClient?.brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name} ({brand.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!selectedClientId}
                onClick={() => {
                  toast.info('Add Brand feature coming soon! For now, please add brands from the Clients page.')
                }}
              >
                <Plus className="w-4 h-4" suppressHydrationWarning />
              </Button>
            </div>
            {selectedClient && !selectedClient.brands.length && (
              <p className="text-sm text-yellow-600 mt-1">
                No brands found for this client. Click + to add a brand.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel" className="text-sm font-semibold text-gray-700">Channel (Optional)</Label>
          <Select value={channel} onValueChange={onChannelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="csr">CSR</SelectItem>
              <SelectItem value="shopee">Shopee</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="lazada">Lazada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedClient && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Selected Client Details
            </h4>
            <div className="text-sm space-y-2">
              <p className="flex justify-between"><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-900">{selectedClient.name}</span></p>
              {selectedClient.company && (
                <p className="flex justify-between"><span className="font-semibold text-gray-700">Company:</span> <span className="text-gray-900">{selectedClient.company}</span></p>
              )}
              {selectedClient.email && (
                <p className="flex justify-between"><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-900">{selectedClient.email}</span></p>
              )}
              {selectedClient.phone && (
                <p className="flex justify-between"><span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-900">{selectedClient.phone}</span></p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}