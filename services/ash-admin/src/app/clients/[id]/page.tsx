"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Trash2,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { ActivityTab } from "@/components/audit/activity-tab";

interface Client {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: number;
  credit_limit?: number;
  is_active: boolean;
  portal_settings?: string;
  created_at: string;
  updated_at: string;
  _count: {
    brands: number;
    orders: number;
  };
  brands?: Array<{
    id: string;
    name: string;
    code?: string;
    is_active: boolean;
    created_at: string;
  }>;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await api.getClient(clientId);

      if (response.success) {
        setClient(response.data);
      } else {
        toast.error("Client not found");
        router.push("/clients");
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
      toast.error("Failed to load client details");
      router.push("/clients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!client) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${client.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await api.deleteClient(client.id);
      toast.success("Client deleted successfully");
      router.push("/clients");
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Failed to delete client");
    } finally {
      setDeleting(false);
    }
  };

  const formatAddress = (address: string | null | undefined) => {
    if (!address) return null;
    try {
      const parsed = JSON.parse(address);
      const parts = [
        parsed.street,
        parsed.city,
        parsed.state,
        parsed.postal_code,
        parsed.country,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(", ") : null;
    } catch {
      return address;
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "No limit set";
    return `₱${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Client not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <Badge
                className={
                  client.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {client.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Client details and information
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "details"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Building2 size={18} />
              Client Details
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "activity"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Activity size={18} />
              Activity Log
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Client Name
                  </label>
                  <p className="text-sm font-semibold">{client.name}</p>
                </div>

                {client.contact_person && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Contact Person
                      </label>
                      <p className="text-sm">{client.contact_person}</p>
                    </div>
                  </div>
                )}

                {client.tax_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tax ID
                    </label>
                    <p className="text-sm">{client.tax_id}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="text-sm">{client.email}</p>
                    </div>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-sm">{client.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created
                    </label>
                    <p className="text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Payment Terms
                    </label>
                    <p className="text-sm">
                      {client.payment_terms
                        ? `${client.payment_terms} days`
                        : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Credit Limit
                    </label>
                    <p className="text-sm">
                      {formatCurrency(client.credit_limit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </label>
                    <p className="text-sm">
                      {new Date(client.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {formatAddress(client.address) && (
              <div className="mt-6 border-t pt-6">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Address
                    </label>
                    <p className="text-sm">{formatAddress(client.address)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-3xl font-bold">
                {client._count.brands}
              </div>
              <p className="text-sm text-muted-foreground">
                Total brands registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-3xl font-bold">
                {client._count.orders}
              </div>
              <p className="text-sm text-muted-foreground">
                Total orders placed
              </p>
              <Link href={`/orders?client_id=${client.id}`}>
                <Button variant="outline" size="sm" className="mt-4">
                  View Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Brands */}
        {client.brands && client.brands.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.brands.slice(0, 5).map(brand => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        {brand.code && (
                          <p className="text-sm text-muted-foreground">
                            Code: {brand.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          brand.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {brand.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(brand.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {client.brands.length > 5 && (
                <Link href={`/clients/${client.id}/brands`}>
                  <Button variant="outline" size="sm" className="mt-4">
                    View All Brands ({client.brands.length})
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <Card>
          <CardContent className="pt-6">
            <ActivityTab
              resourceType="client"
              resourceId={client.id}
              workspaceId="default"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
