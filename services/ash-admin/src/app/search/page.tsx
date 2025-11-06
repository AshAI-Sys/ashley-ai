"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Search, FileText, Users, Package, ChevronRight } from "lucide-react";
import HydrationSafeIcon from "@/components/hydration-safe-icon";

interface SearchResult {
  id: string;
  type: "order" | "client" | "product";
  title: string;
  subtitle: string;
  description: string;
  status?: string;
  url: string;
}

interface SearchData {
  orders: SearchResult[];
  clients: SearchResult[];
  products: SearchResult[];
  total: number;
  query: string;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.trim().length === 0) {
      setSearchData(null);
      return;
    }

    performSearch(query);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("ash_token");
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const result = await response.json();
      setSearchData(result.data);
    } catch (err: any) {
      console.error("Search error:", err);
      setError("Failed to perform search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "order":
        return FileText;
      case "client":
        return Users;
      case "product":
        return Package;
      default:
        return FileText;
    }
  };

  const getResultBadgeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "client":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "product":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
            {query && (
              <p className="mt-2 text-gray-600">
                Showing results for: <span className="font-semibold">"{query}"</span>
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-corporate-blue border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* No Query State */}
          {!query && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HydrationSafeIcon Icon={Search} className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Start searching
              </h2>
              <p className="text-gray-600">
                Enter a search term in the search bar above to find orders, clients, and products
              </p>
            </div>
          )}

          {/* Results */}
          {!isLoading && searchData && query && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold text-gray-900">{searchData.total}</span>{" "}
                  result{searchData.total !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Orders */}
              {searchData.orders.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">
                    Orders ({searchData.orders.length})
                  </h2>
                  <div className="space-y-2">
                    {searchData.orders.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => router.push(result.url)}
                        className="w-full rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:border-corporate-blue hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="rounded-lg bg-blue-100 p-3">
                              <HydrationSafeIcon
                                Icon={getResultIcon(result.type)}
                                className="h-5 w-5 text-blue-600"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{result.title}</h3>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getResultBadgeColor(
                                  result.type
                                )}`}
                              >
                                {result.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{result.subtitle}</p>
                            <p className="text-xs text-gray-500 mt-1">{result.description}</p>
                          </div>
                          <HydrationSafeIcon
                            Icon={ChevronRight}
                            className="h-5 w-5 text-gray-400 flex-shrink-0"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {searchData.clients.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">
                    Clients ({searchData.clients.length})
                  </h2>
                  <div className="space-y-2">
                    {searchData.clients.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => router.push(result.url)}
                        className="w-full rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:border-corporate-blue hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="rounded-lg bg-green-100 p-3">
                              <HydrationSafeIcon
                                Icon={getResultIcon(result.type)}
                                className="h-5 w-5 text-green-600"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{result.title}</h3>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getResultBadgeColor(
                                  result.type
                                )}`}
                              >
                                {result.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{result.subtitle}</p>
                            <p className="text-xs text-gray-500 mt-1">{result.description}</p>
                          </div>
                          <HydrationSafeIcon
                            Icon={ChevronRight}
                            className="h-5 w-5 text-gray-400 flex-shrink-0"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {searchData.products.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">
                    Products ({searchData.products.length})
                  </h2>
                  <div className="space-y-2">
                    {searchData.products.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => router.push(result.url)}
                        className="w-full rounded-lg bg-white p-4 shadow-sm border border-gray-200 hover:border-corporate-blue hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="rounded-lg bg-purple-100 p-3">
                              <HydrationSafeIcon
                                Icon={getResultIcon(result.type)}
                                className="h-5 w-5 text-purple-600"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{result.title}</h3>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getResultBadgeColor(
                                  result.type
                                )}`}
                              >
                                {result.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{result.subtitle}</p>
                            <p className="text-xs text-gray-500 mt-1">{result.description}</p>
                          </div>
                          <HydrationSafeIcon
                            Icon={ChevronRight}
                            className="h-5 w-5 text-gray-400 flex-shrink-0"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchData.total === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <HydrationSafeIcon Icon={Search} className="h-16 w-16 text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    No results found
                  </h2>
                  <p className="text-gray-600">
                    Try searching with different keywords or check your spelling
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
