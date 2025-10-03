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
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientForm.name,
          company: newClientForm.company || null,
          email: newClientForm.email || null,
          phone: newClientForm.phone || null,
          billing_address: newClientForm.address || null
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          A. Client & Brand
          <Badge variant="secondary">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client">Client *</Label>
            <div className="flex gap-2">
              <Select value={selectedClientId} onValueChange={onClientChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsArray.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{client.name}</span>
                        {client.company && (
                          <span className="text-muted-foreground">({client.company})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <Plus className="w-4 h-4" />
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

          <div>
            <Label htmlFor="brand">Brand *</Label>
            <Select 
              value={selectedBrandId} 
              onValueChange={onBrandChange}
              disabled={!selectedClient?.brands.length}
            >
              <SelectTrigger>
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
            {selectedClient && !selectedClient.brands.length && (
              <p className="text-sm text-yellow-600 mt-1">
                No brands found for this client. Contact admin to add brands.
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="channel">Channel (Optional)</Label>
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
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium mb-2">Selected Client Details</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {selectedClient.name}</p>
              {selectedClient.company && (
                <p><span className="font-medium">Company:</span> {selectedClient.company}</p>
              )}
              {selectedClient.email && (
                <p><span className="font-medium">Email:</span> {selectedClient.email}</p>
              )}
              {selectedClient.phone && (
                <p><span className="font-medium">Phone:</span> {selectedClient.phone}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}