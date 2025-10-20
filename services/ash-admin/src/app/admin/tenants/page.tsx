'use client';

import { useState } from 'react';
import {
  Building2,
  Users,
  Settings,
  Palette,
  Crown,
  TrendingUp,
  Shield,
  Globe
} from 'lucide-react';

export default function TenantsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'permissions' | 'i18n'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Management</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Multi-tenant configuration and white-label settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'branding', label: 'White-Label Branding', icon: Palette },
              { id: 'permissions', label: 'RBAC Permissions', icon: Shield },
              { id: 'i18n', label: 'i18n & Currency', icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 inline-block mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'branding' && <BrandingTab />}
          {activeTab === 'permissions' && <PermissionsTab />}
          {activeTab === 'i18n' && <I18nTab />}
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
    tier: 'PROFESSIONAL',
    max_users: 50,
    max_orders_per_month: 500,
    storage_quota_gb: 50,
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tenant Info */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Workspace Information</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Workspace ID:</span>
              <span className="font-mono text-gray-900 dark:text-white">cl9x8y7z6...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium text-gray-900 dark:text-white">Ashley AI Manufacturing</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Slug:</span>
              <span className="font-mono text-gray-900 dark:text-white">ashley-ai</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created:</span>
              <span className="text-gray-900 dark:text-white">127 days ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs font-medium">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Subscription Plan</h3>
          </div>

          <div className="mb-4">
            <div className="inline-block px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold">
              {subscription.tier}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-gray-700 dark:text-gray-300">• Up to {subscription.max_users} users</p>
            <p className="text-gray-700 dark:text-gray-300">• {subscription.max_orders_per_month} orders/month</p>
            <p className="text-gray-700 dark:text-gray-300">• {subscription.storage_quota_gb}GB storage</p>
            <p className="text-gray-700 dark:text-gray-300">• All AI features included</p>
            <p className="text-gray-700 dark:text-gray-300">• Priority support</p>
          </div>

          <button className="mt-4 w-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">User Usage</p>
            <Users className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tenantStats.active_users}/{subscription.max_users}
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
              style={{ width: `${(tenantStats.active_users / subscription.max_users) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subscription.max_users - tenantStats.active_users} users available
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Order Capacity</p>
            <TrendingUp className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tenantStats.total_orders}/{subscription.max_orders_per_month}
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
              style={{ width: `${(tenantStats.total_orders / subscription.max_orders_per_month) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
            <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tenantStats.storage_used_gb}GB/{subscription.storage_quota_gb}GB
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full"
              style={{ width: `${(tenantStats.storage_used_gb / subscription.storage_quota_gb) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subscription.storage_quota_gb - tenantStats.storage_used_gb}GB available
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandingTab() {
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#7C3AED');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">White-Label Branding</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branding Config */}
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  defaultValue="Ashley AI Manufacturing"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline</label>
                <input
                  type="text"
                  defaultValue="Smart Manufacturing ERP"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  defaultValue="https://ashley-ai.com"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Color Scheme</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Logo Upload</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <Palette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Drop logo here or click to upload</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Supports: PNG, SVG (max 2MB)</p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>

          <div
            className="border border-gray-300 rounded-lg p-6 mb-4"
            style={{ backgroundColor: primaryColor + '10' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                AI
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Ashley AI Manufacturing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Smart Manufacturing ERP</p>
              </div>
            </div>

            <button
              className="w-full py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Primary Button
            </button>

            <button
              className="w-full py-2 rounded-lg text-white font-medium mt-2"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary Button
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2"><strong>CSS Variables Generated:</strong></p>
            <pre className="text-xs font-mono bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`:root {
  --color-primary: ${primaryColor};
  --color-secondary: ${secondaryColor};
  --font-heading: 'Inter', sans-serif;
  --border-radius: 8px;
}`}
            </pre>
          </div>

          <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
            Save Branding Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function PermissionsTab() {
  const roles = [
    { name: 'Super Administrator', users: 2, permissions: 'All (50+)' },
    { name: 'Manager', users: 5, permissions: '38 permissions' },
    { name: 'Supervisor', users: 8, permissions: '15 permissions' },
    { name: 'Operator', users: 25, permissions: '8 permissions' },
    { name: 'Viewer', users: 5, permissions: '12 permissions' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">RBAC Permissions</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Role-based access control configuration</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600">
          + Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {roles.map((role, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>{role.users}</strong> users assigned
              </p>
              <p className="text-gray-600 dark:text-gray-400">{role.permissions}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Permission Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Orders</p>
            <p className="text-blue-700 dark:text-blue-300">5 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Production</p>
            <p className="text-blue-700 dark:text-blue-300">8 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Finance</p>
            <p className="text-blue-700 dark:text-blue-300">7 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">HR & Payroll</p>
            <p className="text-blue-700 dark:text-blue-300">6 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Quality</p>
            <p className="text-blue-700 dark:text-blue-300">5 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Inventory</p>
            <p className="text-blue-700 dark:text-blue-300">6 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">AI Features</p>
            <p className="text-blue-700 dark:text-blue-300">4 permissions</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Settings</p>
            <p className="text-blue-700 dark:text-blue-300">4 permissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function I18nTab() {
  const supportedLanguages = [
    { code: 'en', name: 'English', native: 'English', active: true },
    { code: 'tl', name: 'Tagalog', native: 'Tagalog', active: true },
    { code: 'zh', name: 'Chinese', native: '中文', active: false },
    { code: 'es', name: 'Spanish', native: 'Español', active: false },
    { code: 'ja', name: 'Japanese', native: '日本語', active: false },
  ];

  const supportedCurrencies = [
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', active: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', active: true },
    { code: 'EUR', name: 'Euro', symbol: '€', active: false },
    { code: 'GBP', name: 'British Pound', symbol: '£', active: false },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Internationalization & Currency</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Languages */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Supported Languages</h3>

          <div className="space-y-3">
            {supportedLanguages.map((lang) => (
              <div key={lang.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{lang.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{lang.native}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={lang.active} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Currencies */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Supported Currencies</h3>

          <div className="space-y-3">
            {supportedCurrencies.map((curr) => (
              <div key={curr.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {curr.symbol} {curr.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{curr.code}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={curr.active} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Exchange Rate:</strong> 1 USD = 56.00 PHP (auto-updated daily)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
          Save i18n Settings
        </button>
      </div>
    </div>
  );
}
