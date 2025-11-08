"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, X, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";

interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  brands: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface ClientBrandSectionProps {
  clients: Client[];
  selectedClientId: string;
  selectedBrandId: string;
  channel: string;
  onClientChange: (clientId: string) => void;
  onBrandChange: (brandId: string) => void;
  onChannelChange: (channel: string) => void;
  onClientCreated: (client: Client) => void;
}

export function ClientBrandSection({
  clients,
  selectedClientId,
  selectedBrandId,
  channel,
  onClientChange,
  onBrandChange,
  onChannelChange,
  onClientCreated,
}: ClientBrandSectionProps) {
  const { token } = useAuth();

  // Ensure clients is an array
  const clientsArray = Array.isArray(clients) ? clients : [];
  const selectedClient = clientsArray.find(c => c.id === selectedClientId);

  // Client creation state
  const [showClientForm, setShowClientForm] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
  });

  // Brand creation state
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: "",
    code: "",
  });

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast.error("Client name and email are required");
      return;
    }

    setCreatingClient(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newClient),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const createdClient = result.data;
        toast.success("Client created successfully!");
        onClientCreated(createdClient);
        onClientChange(createdClient.id);
        setShowClientForm(false);
        setNewClient({
          name: "",
          company: "",
          email: "",
          phone: "",
          address: "",
        });
      } else {
        toast.error(result.error || "Failed to create client");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Failed to create client");
    } finally {
      setCreatingClient(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrand.name || !newBrand.code) {
      toast.error("Brand name and code are required");
      return;
    }

    if (!selectedClientId) {
      toast.error("Please select a client first");
      return;
    }

    setCreatingBrand(true);
    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newBrand.name,
          code: newBrand.code,
          client_id: selectedClientId, // Use snake_case to match API
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const createdBrand = result.data;
        toast.success("Brand created successfully!");

        // Update the client in the list with the new brand
        const updatedClient = {
          ...selectedClient!,
          brands: [...(selectedClient?.brands || []), createdBrand],
        };
        onClientCreated(updatedClient);
        onBrandChange(createdBrand.id);
        setShowBrandForm(false);
        setNewBrand({ name: "", code: "" });
      } else {
        toast.error(result.error || "Failed to create brand");
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error("Failed to create brand");
    } finally {
      setCreatingBrand(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="border-b-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-gray-700 dark:from-purple-950 dark:to-blue-950">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
            A
          </span>
          <span className="font-bold">Client & Brand</span>
          <Badge variant="destructive" className="ml-auto">
            Required
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="client" className="text-sm font-semibold">
                Client *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowClientForm(!showClientForm)}
                className="h-7 text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                New Client
              </Button>
            </div>
            <Select value={selectedClientId} onValueChange={onClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clientsArray.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                    {client.company ? ` (${client.company})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="brand" className="text-sm font-semibold">
                Brand *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBrandForm(!showBrandForm)}
                disabled={!selectedClientId}
                className="h-7 text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                New Brand
              </Button>
            </div>
            <Select
              value={selectedBrandId}
              onValueChange={onBrandChange}
              disabled={!selectedClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {(selectedClient?.brands || []).map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name} ({brand.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* New Client Form */}
        {showClientForm && (
          <div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Create New Client
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowClientForm(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newClientName" className="text-sm">
                  Name *
                </Label>
                <Input
                  id="newClientName"
                  value={newClient.name}
                  onChange={e =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientCompany" className="text-sm">
                  Company
                </Label>
                <Input
                  id="newClientCompany"
                  value={newClient.company}
                  onChange={e =>
                    setNewClient({ ...newClient, company: e.target.value })
                  }
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientEmail" className="text-sm">
                  Email *
                </Label>
                <Input
                  id="newClientEmail"
                  type="email"
                  value={newClient.email}
                  onChange={e =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientPhone" className="text-sm">
                  Phone
                </Label>
                <Input
                  id="newClientPhone"
                  value={newClient.phone}
                  onChange={e =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  placeholder="+63 912 345 6789"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newClientAddress" className="text-sm">
                Address
              </Label>
              <Input
                id="newClientAddress"
                value={newClient.address}
                onChange={e =>
                  setNewClient({ ...newClient, address: e.target.value })
                }
                placeholder="Full address"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClientForm(false)}
                disabled={creatingClient}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateClient}
                disabled={creatingClient}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="mr-1 h-4 w-4" />
                {creatingClient ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </div>
        )}

        {/* New Brand Form */}
        {showBrandForm && (
          <div className="space-y-4 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Create New Brand
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowBrandForm(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newBrandName" className="text-sm">
                  Brand Name *
                </Label>
                <Input
                  id="newBrandName"
                  value={newBrand.name}
                  onChange={e => {
                    const name = e.target.value;
                    // Auto-generate code from name (first 4-5 chars, uppercase, no spaces)
                    const autoCode = name
                      .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
                      .slice(0, 5) // Take first 5 chars
                      .toUpperCase();

                    setNewBrand({
                      name: name,
                      code: autoCode
                    });
                  }}
                  placeholder="e.g., Nike, Adidas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newBrandCode" className="text-sm">
                  Brand Code * (Auto-generated, editable)
                </Label>
                <Input
                  id="newBrandCode"
                  value={newBrand.code}
                  onChange={e =>
                    setNewBrand({
                      ...newBrand,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., NIKE, ADID"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBrandForm(false)}
                disabled={creatingBrand}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateBrand}
                disabled={creatingBrand}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-1 h-4 w-4" />
                {creatingBrand ? "Creating..." : "Create Brand"}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="channel" className="text-sm font-semibold">
            Channel (Optional)
          </Label>
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
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
              <Building className="h-4 w-4 text-blue-600" />
              Selected Client Details
            </h4>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="font-semibold text-gray-700">Name:</span>{" "}
                <span className="text-gray-900">{selectedClient.name}</span>
              </p>
              {selectedClient.company && (
                <p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Company:</span>{" "}
                  <span className="text-gray-900">
                    {selectedClient.company}
                  </span>
                </p>
              )}
              {selectedClient.email && (
                <p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Email:</span>{" "}
                  <span className="text-gray-900">{selectedClient.email}</span>
                </p>
              )}
              {selectedClient.phone && (
                <p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Phone:</span>{" "}
                  <span className="text-gray-900">{selectedClient.phone}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
