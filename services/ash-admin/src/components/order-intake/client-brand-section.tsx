'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Building } from 'lucide-react'
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
  // Ensure clients is an array
  const clientsArray = Array.isArray(clients) ? clients : []
  const selectedClient = clientsArray.find(c => c.id === selectedClientId)

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
            <Label htmlFor="client" className="text-sm font-semibold">Client *</Label>
            <Select value={selectedClientId} onValueChange={onClientChange}>
              <SelectTrigger>
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
            {clientsArray.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                No clients found. Please add clients from the Clients page first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-semibold">Brand *</Label>
            <Select
              value={selectedBrandId}
              onValueChange={onBrandChange}
              disabled={!selectedClientId}
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
                No brands found for this client. Please add brands from the Clients page.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel" className="text-sm font-semibold">Channel (Optional)</Label>
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