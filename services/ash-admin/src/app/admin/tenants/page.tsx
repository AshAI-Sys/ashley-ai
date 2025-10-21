"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Settings,
  Palette,
  Crown,
  TrendingUp,
  Shield,
  Globe,
} from "lucide-react";

export default function TenantsPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "branding" | "permissions" | "i18n"
  >("overview");

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tenant Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Multi-tenant configuration and white-label settings
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            {[
              { id: "overview", label: "Overview", icon: Building2 },
              { id: "branding", label: "White-Label Branding", icon: Palette },
              { id: "permissions", label: "RBAC Permissions", icon: Shield },
              { id: "i18n", label: "i18n & Currency", icon: Globe },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="mr-2 inline-block h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "branding" && <BrandingTab />}
          {activeTab === "permissions" && <PermissionsTab />}
          {activeTab === "i18n" && <I18nTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const tenantStats = {
    total_users: 45,
    active_users: 38,
    total_orders: 234,
    active_orders: 12,
    total_clients: 28,
    storage_used_gb: 8.5,
    days_active: 127,
  };

  const subscription = {
    tier: "PROFESSIONAL",
    max_users: 50,
    max_orders_per_month: 500,
    storage_quota_gb: 50,
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tenant Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Workspace Information
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Workspace ID:
              </span>
              <span className="font-mono text-gray-900 dark:text-white">
                cl9x8y7z6...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                Ashley AI Manufacturing
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Slug:</span>
              <span className="font-mono text-gray-900 dark:text-white">
                ashley-ai
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created:</span>
              <span className="text-gray-900 dark:text-white">
                127 days ago
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-gray-700 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Subscription Plan
            </h3>
          </div>

          <div className="mb-4">
            <div className="inline-block rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white dark:bg-indigo-500">
              {subscription.tier}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              • Up to {subscription.max_users} users
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              • {subscription.max_orders_per_month} orders/month
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              • {subscription.storage_quota_gb}GB storage
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              • All AI features included
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              • Priority support
            </p>
          </div>

          <button className="mt-4 w-full rounded-lg border border-indigo-600 bg-white py-2 font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              User Usage
            </p>
            <Users className="h-5 w-5 text-gray-400 dark:text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tenantStats.active_users}/{subscription.max_users}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-indigo-600 dark:bg-indigo-500"
              style={{
                width: `${(tenantStats.active_users / subscription.max_users) * 100}%`,
              }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subscription.max_users - tenantStats.active_users} users available
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Order Capacity
            </p>
            <TrendingUp className="h-5 w-5 text-gray-400 dark:text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tenantStats.total_orders}/{subscription.max_orders_per_month}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-green-600 dark:bg-green-500"
              style={{
                width: `${(tenantStats.total_orders / subscription.max_orders_per_month) * 100}%`,
              }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This month
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Storage Used
            </p>
            <Settings className="h-5 w-5 text-gray-400 dark:text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tenantStats.storage_used_gb}GB/{subscription.storage_quota_gb}GB
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-purple-600 dark:bg-purple-500"
              style={{
                width: `${(tenantStats.storage_used_gb / subscription.storage_quota_gb) * 100}%`,
              }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subscription.storage_quota_gb - tenantStats.storage_used_gb}GB
            available
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandingTab() {
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#7C3AED");

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        White-Label Branding
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Branding Config */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Company Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue="Ashley AI Manufacturing"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tagline
                </label>
                <input
                  type="text"
                  defaultValue="Smart Manufacturing ERP"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <input
                  type="url"
                  defaultValue="https://ashley-ai.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Color Scheme</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Logo Upload</h3>

            <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-indigo-400">
              <Palette className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-gray-600">
                Drop logo here or click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports: PNG, SVG (max 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Live Preview</h3>

          <div
            className="mb-4 rounded-lg border border-gray-300 p-6"
            style={{ backgroundColor: primaryColor + "10" }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                AI
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Ashley AI Manufacturing
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smart Manufacturing ERP
                </p>
              </div>
            </div>

            <button
              className="w-full rounded-lg py-2 font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Primary Button
            </button>

            <button
              className="mt-2 w-full rounded-lg py-2 font-medium text-white"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary Button
            </button>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-600">
              <strong>CSS Variables Generated:</strong>
            </p>
            <pre className="overflow-x-auto rounded border border-gray-200 bg-white p-3 font-mono text-xs">
              {`:root {
  --color-primary: ${primaryColor};
  --color-secondary: ${secondaryColor};
  --font-heading: 'Inter', sans-serif;
  --border-radius: 8px;
}`}
            </pre>
          </div>

          <button className="mt-4 w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700">
            Save Branding Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function PermissionsTab() {
  const roles = [
    { name: "Super Administrator", users: 2, permissions: "All (50+)" },
    { name: "Manager", users: 5, permissions: "38 permissions" },
    { name: "Supervisor", users: 8, permissions: "15 permissions" },
    { name: "Operator", users: 25, permissions: "8 permissions" },
    { name: "Viewer", users: 5, permissions: "12 permissions" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            RBAC Permissions
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Role-based access control configuration
          </p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
          + Create Custom Role
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {role.name}
              </h3>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>{role.users}</strong> users assigned
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {role.permissions}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                Edit
              </button>
              <button className="flex-1 rounded border border-indigo-600 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">
          Permission Categories
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Orders
            </p>
            <p className="text-blue-700 dark:text-blue-300">5 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Production
            </p>
            <p className="text-blue-700 dark:text-blue-300">8 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Finance
            </p>
            <p className="text-blue-700 dark:text-blue-300">7 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              HR & Payroll
            </p>
            <p className="text-blue-700 dark:text-blue-300">6 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Quality
            </p>
            <p className="text-blue-700 dark:text-blue-300">5 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Inventory
            </p>
            <p className="text-blue-700 dark:text-blue-300">6 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              AI Features
            </p>
            <p className="text-blue-700 dark:text-blue-300">4 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Settings
            </p>
            <p className="text-blue-700 dark:text-blue-300">4 permissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function I18nTab() {
  const supportedLanguages = [
    { code: "en", name: "English", native: "English", active: true },
    { code: "tl", name: "Tagalog", native: "Tagalog", active: true },
    { code: "zh", name: "Chinese", native: "中文", active: false },
    { code: "es", name: "Spanish", native: "Español", active: false },
    { code: "ja", name: "Japanese", native: "日本語", active: false },
  ];

  const supportedCurrencies = [
    { code: "PHP", name: "Philippine Peso", symbol: "₱", active: true },
    { code: "USD", name: "US Dollar", symbol: "$", active: true },
    { code: "EUR", name: "Euro", symbol: "€", active: false },
    { code: "GBP", name: "British Pound", symbol: "£", active: false },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Internationalization & Currency
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Languages */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Supported Languages
          </h3>

          <div className="space-y-3">
            {supportedLanguages.map(lang => (
              <div
                key={lang.code}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {lang.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lang.native}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked={lang.active}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Currencies */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Supported Currencies
          </h3>

          <div className="space-y-3">
            {supportedCurrencies.map(curr => (
              <div
                key={curr.code}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {curr.symbol} {curr.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {curr.code}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked={curr.active}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Exchange Rate:</strong> 1 USD = 56.00 PHP (auto-updated
              daily)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700">
          Save i18n Settings
        </button>
      </div>
    </div>
  );
}
