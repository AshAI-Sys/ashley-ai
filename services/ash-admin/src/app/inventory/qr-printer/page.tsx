'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  QrCode,
  Printer,
  CheckSquare,
  Square,
  FolderTree,
  Tag,
  RefreshCw,
  Eye,
  Settings2,
  Package,
} from 'lucide-react';
import HydrationSafeIcon from '@/components/hydration-safe-icon';
import { CategorySelect, BrandSelect } from '@/components/inventory';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  code?: string | null;
}

interface Brand {
  id: string;
  name: string;
  code?: string | null;
  logo_url?: string | null;
}

interface GeneratedQRCode {
  id: string;
  qr_code: string;
  qr_code_image: string;
  qr_type: string;
  status: string;
  product_id?: string | null;
  product_name?: string | null;
  variant_id?: string | null;
  variant_name?: string | null;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  print_count: number;
  scan_count: number;
  created_at: string;
}

export default function QRPrinterPage() {
  const router = useRouter();

  // Generation Mode
  const [generationMode, setGenerationMode] = useState<'category' | 'brand' | 'product' | 'variant'>('category');
  const [workflowType, setWorkflowType] = useState<'INVENTORY_FIRST' | 'ORDER_FIRST'>('INVENTORY_FIRST');

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  // QR Code Settings
  const [format, setFormat] = useState<'png' | 'svg' | 'dataurl'>('dataurl');
  const [size, setSize] = useState(300);

  // Generated QR Codes
  const [generatedQRCodes, setGeneratedQRCodes] = useState<GeneratedQRCode[]>([]);
  const [selectedQRCodes, setSelectedQRCodes] = useState<Set<string>>(new Set());

  // UI State
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const generateQRCodes = async () => {
    if (generationMode === 'category' && !selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }

    if (generationMode === 'brand' && !selectedBrandId) {
      toast.error('Please select a brand');
      return;
    }

    try {
      setLoading(true);

      const requestBody: any = {
        qr_type: 'BATCH',
        workflow_type: workflowType,
        format,
        size,
      };

      if (generationMode === 'category') {
        requestBody.category_id = selectedCategoryId;
      } else if (generationMode === 'brand') {
        requestBody.brand_id = selectedBrandId;
      }

      const response = await fetch('/api/inventory/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedQRCodes(data.qr_codes);
        toast.success(`Generated ${data.count} QR codes successfully`);
        setShowSettings(false);
      } else {
        toast.error(data.error || 'Failed to generate QR codes');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const toggleQRCodeSelection = (qrCodeId: string) => {
    const newSelection = new Set(selectedQRCodes);
    if (newSelection.has(qrCodeId)) {
      newSelection.delete(qrCodeId);
    } else {
      newSelection.add(qrCodeId);
    }
    setSelectedQRCodes(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedQRCodes.size === generatedQRCodes.length) {
      setSelectedQRCodes(new Set());
    } else {
      setSelectedQRCodes(new Set(generatedQRCodes.map((qr) => qr.id)));
    }
  };

  const markAsPrinted = async () => {
    if (selectedQRCodes.size === 0) {
      toast.error('Please select QR codes to mark as printed');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/inventory/qr-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code_ids: Array.from(selectedQRCodes),
          status: 'PRINTED',
          increment_print_count: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Marked ${data.updated_count} QR codes as printed`);
        // Update local state
        setGeneratedQRCodes((prev) =>
          prev.map((qr) =>
            selectedQRCodes.has(qr.id)
              ? { ...qr, status: 'PRINTED', print_count: qr.print_count + 1 }
              : qr
          )
        );
      } else {
        toast.error(data.error || 'Failed to update QR codes');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update QR codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrCode: GeneratedQRCode) => {
    const link = document.createElement('a');
    link.href = qrCode.qr_code_image;
    link.download = `${qrCode.sku || qrCode.id}_qr.png`;
    link.click();
  };

  const downloadSelectedQRCodes = () => {
    const selectedQRs = generatedQRCodes.filter((qr) => selectedQRCodes.has(qr.id));
    selectedQRs.forEach((qr, index) => {
      setTimeout(() => downloadQRCode(qr), index * 100);
    });
    toast.success(`Downloading ${selectedQRs.length} QR codes`);
  };

  const printQRCodes = () => {
    const selectedQRs = generatedQRCodes.filter((qr) => selectedQRCodes.has(qr.id));

    if (selectedQRs.length === 0) {
      toast.error('Please select QR codes to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Failed to open print window. Please allow popups.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Labels - Ashley AI</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .qr-label {
              border: 2px solid #000;
              padding: 15px;
              text-align: center;
              page-break-inside: avoid;
              background: white;
            }
            .qr-label img {
              width: 200px;
              height: 200px;
              margin: 10px auto;
              display: block;
            }
            .product-name {
              font-weight: bold;
              font-size: 14px;
              margin: 8px 0 4px;
            }
            .variant-name {
              font-size: 12px;
              color: #666;
              margin: 4px 0;
            }
            .sku {
              font-family: monospace;
              font-size: 11px;
              color: #333;
              margin: 4px 0;
              font-weight: bold;
            }
            .metadata {
              font-size: 10px;
              color: #888;
              margin: 4px 0;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
              Print ${selectedQRs.length} Labels
            </button>
          </div>
          <div class="qr-grid">
            ${selectedQRs.map((qr) => `
              <div class="qr-label">
                <img src="${qr.qr_code_image}" alt="QR Code for ${qr.sku || qr.id}" />
                <div class="product-name">${qr.product_name || 'Product'}</div>
                ${qr.variant_name ? `<div class="variant-name">${qr.variant_name}</div>` : ''}
                ${qr.sku ? `<div class="sku">SKU: ${qr.sku}</div>` : ''}
                ${qr.category ? `<div class="metadata">Category: ${qr.category}</div>` : ''}
                ${qr.brand ? `<div class="metadata">Brand: ${qr.brand}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/inventory')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <HydrationSafeIcon Icon={ArrowLeft} className="h-5 w-5" />
            Back to Inventory
          </button>
          <h1 className="text-3xl font-bold text-gray-900">QR Code Printer</h1>
          <p className="mt-2 text-gray-600">
            Generate and print QR codes in batch by category or brand
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Settings */}
          <div className={`lg:col-span-1 ${!showSettings && 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Settings</h2>
                <HydrationSafeIcon Icon={Settings2} className="h-5 w-5 text-gray-400" />
              </div>

              {/* Generation Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generation Mode
                </label>
                <select
                  value={generationMode}
                  onChange={(e) => setGenerationMode(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="category">By Category</option>
                  <option value="brand">By Brand</option>
                </select>
              </div>

              {/* Category Filter */}
              {generationMode === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Category
                  </label>
                  <CategorySelect
                    value={selectedCategoryId}
                    onChange={(id) => setSelectedCategoryId(id)}
                    placeholder="Choose a category..."
                    allowNull={false}
                  />
                </div>
              )}

              {/* Brand Filter */}
              {generationMode === 'brand' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Brand
                  </label>
                  <BrandSelect
                    value={selectedBrandId}
                    onChange={(id) => setSelectedBrandId(id)}
                    placeholder="Choose a brand..."
                    allowNull={false}
                  />
                </div>
              )}

              {/* Workflow Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Type
                </label>
                <select
                  value={workflowType}
                  onChange={(e) => setWorkflowType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INVENTORY_FIRST">Inventory First</option>
                  <option value="ORDER_FIRST">Order First</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {workflowType === 'INVENTORY_FIRST'
                    ? 'Create inventory → Scan for orders'
                    : 'Create order → Assign to inventory'}
                </p>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dataurl">Data URL (PNG)</option>
                  <option value="png">PNG (Base64)</option>
                  <option value="svg">SVG</option>
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Size: {size}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="50"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100px</span>
                  <span>500px</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateQRCodes}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <HydrationSafeIcon Icon={QrCode} className="h-5 w-5" />
                {loading ? 'Generating...' : 'Generate QR Codes'}
              </button>

              {generatedQRCodes.length > 0 && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md flex items-center justify-center gap-2 lg:hidden"
                >
                  <HydrationSafeIcon Icon={Eye} className="h-5 w-5" />
                  View Generated QR Codes
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Generated QR Codes */}
          <div className={`lg:col-span-2 ${showSettings && generatedQRCodes.length > 0 && 'hidden lg:block'}`}>
            {generatedQRCodes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <HydrationSafeIcon Icon={Package} className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Codes Generated Yet</h3>
                <p className="text-gray-600 mb-6">
                  Select a category or brand and click "Generate QR Codes" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Actions Bar */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                      >
                        <HydrationSafeIcon
                          Icon={selectedQRCodes.size === generatedQRCodes.length ? CheckSquare : Square}
                          className="h-5 w-5"
                        />
                        {selectedQRCodes.size === generatedQRCodes.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <span className="text-sm text-gray-600">
                        {selectedQRCodes.size} / {generatedQRCodes.length} selected
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={downloadSelectedQRCodes}
                        disabled={selectedQRCodes.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-md font-medium"
                      >
                        <HydrationSafeIcon Icon={Download} className="h-5 w-5" />
                        Download
                      </button>
                      <button
                        onClick={printQRCodes}
                        disabled={selectedQRCodes.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-md font-medium"
                      >
                        <HydrationSafeIcon Icon={Printer} className="h-5 w-5" />
                        Print
                      </button>
                      <button
                        onClick={markAsPrinted}
                        disabled={selectedQRCodes.size === 0 || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md font-medium"
                      >
                        <HydrationSafeIcon Icon={CheckSquare} className="h-5 w-5" />
                        Mark Printed
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Codes Grid */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {generatedQRCodes.map((qr) => (
                      <div
                        key={qr.id}
                        onClick={() => toggleQRCodeSelection(qr.id)}
                        className={`border-2 rounded-md p-4 cursor-pointer transition-all ${
                          selectedQRCodes.has(qr.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={qr.qr_code_image}
                            alt={`QR Code for ${qr.sku || qr.id}`}
                            className="w-full h-auto mb-2"
                          />
                          {selectedQRCodes.has(qr.id) && (
                            <div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl">
                              <HydrationSafeIcon Icon={CheckSquare} className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {qr.product_name || 'Product'}
                        </div>
                        {qr.variant_name && (
                          <div className="text-xs text-gray-600 truncate">{qr.variant_name}</div>
                        )}
                        {qr.sku && (
                          <div className="text-xs font-mono text-gray-500 mt-1">{qr.sku}</div>
                        )}
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded ${
                            qr.status === 'PRINTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {qr.status}
                          </span>
                          <span>Print: {qr.print_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md flex items-center justify-center gap-2 lg:hidden"
                >
                  <HydrationSafeIcon Icon={Settings2} className="h-5 w-5" />
                  Back to Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
