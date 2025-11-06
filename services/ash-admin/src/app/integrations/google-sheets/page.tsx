"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  Users,
  Package,
  Factory,
  DollarSign,
  UserSquare,
} from "lucide-react";

interface SyncStatus {
  configured: boolean;
  url: string | null;
  error?: string;
}

interface SyncResult {
  success: boolean;
  count?: number;
  message?: string;
}

export default function GoogleSheetsIntegrationPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Record<string, Date>>({});

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      setLoading(true);
      const response = await fetch("/api/google-sheets/sync");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(type: string) {
    try {
      setSyncing(type);
      const response = await fetch("/api/google-sheets/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (data.success) {
        setLastSync((prev) => ({ ...prev, [type]: new Date() }));
        alert(`✅ Successfully synced ${type} to Google Sheets!`);
      } else {
        alert(`❌ Sync failed: ${data.message || data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Sync failed: ${error.message}`);
    } finally {
      setSyncing(null);
    }
  }

  const syncOptions = [
    {
      type: "all",
      label: "Sync All Data",
      icon: Database,
      description: "Sync all data types to Google Sheets",
      color: "bg-purple-500",
    },
    {
      type: "orders",
      label: "Orders",
      icon: FileSpreadsheet,
      description: "Sync orders and production data",
      color: "bg-blue-500",
    },
    {
      type: "clients",
      label: "Clients",
      icon: Users,
      description: "Sync client information",
      color: "bg-green-500",
    },
    {
      type: "inventory",
      label: "Inventory",
      icon: Package,
      description: "Sync inventory items",
      color: "bg-orange-500",
    },
    {
      type: "production",
      label: "Production",
      icon: Factory,
      description: "Sync production runs",
      color: "bg-indigo-500",
    },
    {
      type: "finance",
      label: "Finance",
      icon: DollarSign,
      description: "Sync invoices and payments",
      color: "bg-emerald-500",
    },
    {
      type: "hr",
      label: "HR & Payroll",
      icon: UserSquare,
      description: "Sync employee data",
      color: "bg-cyan-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-3 shadow">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Google Sheets Integration
              </h1>
              <p className="text-gray-600">
                Sync Ashley AI data to Google Sheets for reporting and analysis
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Status */}
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status?.configured ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Google Sheets Configured
                    </p>
                    <p className="text-sm text-gray-600">
                      Account: ashai.system@gmail.com
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Google Sheets Not Configured
                    </p>
                    <p className="text-sm text-gray-600">
                      Please configure Google Service Account credentials
                    </p>
                  </div>
                </>
              )}
            </div>

            {status?.url && (
              <Button
                onClick={() => window.open(status.url!, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Spreadsheet
              </Button>
            )}
          </div>
        </Card>

        {/* Setup Instructions (if not configured) */}
        {!status?.configured && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 p-6">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-yellow-900">
              <FileSpreadsheet className="h-5 w-5" />
              Setup Instructions
            </h3>
            <ol className="space-y-2 text-sm text-yellow-800">
              <li>
                1. Go to{" "}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  Google Cloud Console
                </a>
              </li>
              <li>2. Create a new project or select existing project</li>
              <li>3. Enable Google Sheets API and Google Drive API</li>
              <li>
                4. Create Service Account credentials (JSON key file)
              </li>
              <li>
                5. Add service account email (ends with
                @your-project.iam.gserviceaccount.com)
              </li>
              <li>6. Share your Google Sheet with the service account email</li>
              <li>
                7. Add the JSON credentials to environment variable:
                <code className="ml-2 rounded bg-yellow-100 px-2 py-1">
                  GOOGLE_SERVICE_ACCOUNT_JSON
                </code>
              </li>
            </ol>
          </Card>
        )}

        {/* Sync Options Grid */}
        {status?.configured && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {syncOptions.map((option) => {
              const Icon = option.icon;
              const isSyncing = syncing === option.type;
              const lastSyncTime = lastSync[option.type];

              return (
                <Card
                  key={option.type}
                  className="p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`rounded-lg ${option.color} p-3 text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {option.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {lastSyncTime && (
                    <p className="mb-3 text-xs text-gray-500">
                      Last synced: {lastSyncTime.toLocaleString()}
                    </p>
                  )}

                  <Button
                    onClick={() => handleSync(option.type)}
                    disabled={!!syncing}
                    className="w-full gap-2"
                    variant={option.type === "all" ? "default" : "outline"}
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Features Section */}
        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Features</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Real-Time Sync</p>
                <p className="text-sm text-gray-600">
                  Sync data instantly with one click
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Multiple Sheets</p>
                <p className="text-sm text-gray-600">
                  Organized tabs for each data type
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">
                  Automatic Formatting
                </p>
                <p className="text-sm text-gray-600">
                  Headers and frozen rows included
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Selective Sync</p>
                <p className="text-sm text-gray-600">
                  Sync only the data you need
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Sheets Info */}
        {status?.configured && (
          <Card className="mt-6 p-6">
            <h3 className="mb-4 font-semibold text-gray-900">
              Spreadsheet Structure
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Orders Sheet:</strong> Order Number, Client, Brand,
                Status, Amount, Delivery Date
              </p>
              <p>
                <strong>Clients Sheet:</strong> Name, Contact, Email, Phone,
                Payment Terms, Credit Limit
              </p>
              <p>
                <strong>Inventory Sheet:</strong> Item Name, SKU, Category,
                Quantity, Reorder Point, Location
              </p>
              <p>
                <strong>Production Sheet:</strong> Run Number, Order, Status,
                Bundles, Pieces, Efficiency
              </p>
              <p>
                <strong>Finance Sheet:</strong> Invoice Number, Client, Amount,
                Status, Due Date
              </p>
              <p>
                <strong>HR Sheet:</strong> Employee Name, Position, Department,
                Salary, Status
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
