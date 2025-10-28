"use client";

// Force dynamic rendering (don't pre-render during build)
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/dashboard-layout";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useDebounce } from "@/hooks/useDebounce";
import HydrationSafeIcon from "@/components/hydration-safe-icon";

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
  created_at: string;
  updated_at: string;
  _count: {
    brands: number;
    orders: number;
  };
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 500);

  // React Query for data fetching with auto-refresh
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["clients", debouncedSearch, statusFilter, currentPage],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: 20,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "all" && { is_active: statusFilter === "active" }),
      };
      const response = await api.getClients(params);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch clients");
      }
      return response.data;
    },
    staleTime: 30000, // Data considered fresh for 30 seconds
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  });

  const clients = data?.clients || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalCount = data?.pagination?.total || 0;

  const formatAddress = (address: string | null) => {
    if (!address) return "No address";
    try {
      const parsed = JSON.parse(address);
      return (
        `${parsed.street || ""} ${parsed.city || ""} ${parsed.state || ""}`.trim() ||
        "Address incomplete"
      );
    } catch {
      return address;
    }
  };

  const ____formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "No limit";
    return `â‚±${amount.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 min-h-screen bg-white">
        {/* Page Header - Responsive */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Clients</h1>
            <p className="text-sm text-gray-600 lg:text-base">
              Manage your clients and their information
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex-1 gap-2 sm:flex-none"
              size="sm"
            >
              <HydrationSafeIcon
                Icon={RefreshCw}
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isFetching ? "Refreshing..." : "Refresh"}
              </span>
            </Button>
          </div>
        </div>

        {/* Filters - Responsive */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="h-10 min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm sm:flex-none"
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
                {search && ` â€¢ Searching for "${search}"`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <ErrorAlert
            message={
              error?.message || "Failed to load clients. Please try again."
            }
            retry={() => refetch()}
          />
        )}

        {/* Loading State */}
        {isLoading ? (
          <SkeletonTable />
        ) : (
          <div className="grid gap-4">
            {clients.map((client: any) => (
              <Card
                key={client.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Header */}
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 flex-shrink-0 text-blue-600" />
                          <h3 className="truncate text-lg font-semibold">
                            {client.name}
                          </h3>
                        </div>
                        <Badge
                          className={
                            client.is_active
                              ? "w-fit bg-green-100 text-green-800"
                              : "w-fit bg-red-100 text-red-800"
                          }
                        >
                          {client.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Contact Info Grid - Optimized for mobile */}
                      <div className="xs:grid-cols-2 mb-3 grid grid-cols-1 gap-3 text-sm text-muted-foreground lg:grid-cols-3">
                        {client.contact_person && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {client.contact_person}
                            </span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {formatAddress(client.address)}
                          </span>
                        </div>
                      </div>

                      {/* Stats - Compact for mobile */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Orders:{" "}
                          </span>
                          <span className="font-semibold">
                            {client._count.orders}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Brands:{" "}
                          </span>
                          <span className="font-semibold">
                            {client._count.brands}
                          </span>
                        </div>
                      </div>

                      {/* Timestamps - Hidden on mobile */}
                      <div className="mt-3 hidden gap-4 text-xs text-muted-foreground sm:flex">
                        <span>
                          Created{" "}
                          {new Date(client.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Updated{" "}
                          {new Date(client.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 gap-2 sm:flex-col">
                      <Link
                        href={`/clients/${client.id}`}
                        className="flex-1 sm:flex-none"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full px-3"
                        >
                          <Eye className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                      <Link
                        href={`/clients/${client.id}/edit`}
                        className="flex-1 sm:flex-none"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full px-3"
                        >
                          <Edit className="h-4 w-4 sm:mr-1" />
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
                description={
                  search
                    ? `No clients match "${search}"`
                    : "Create clients from the order page"
                }
              />
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
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
              onClick={() =>
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
