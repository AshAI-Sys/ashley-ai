'use client';

import { useState, useEffect } from 'react';
import { Download, QrCode, Search, Printer, CheckSquare, Square } from 'lucide-react';

interface Variant {
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  has_qr_code: boolean;
  category?: string;
}

interface GeneratedQRCode {
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  qr_code: string;
  qr_data: string;
  format: string;
  size?: string;
  color?: string;
  price: number;
}

export default function QRGeneratorPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [generatedQRCodes, setGeneratedQRCodes] = useState<GeneratedQRCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [format, setFormat] = useState<'png' | 'svg' | 'dataurl'>('dataurl');
  const [size, setSize] = useState(300);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch variants on component mount
  useEffect(() => {
    fetchVariants();
  }, [searchTerm, category]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);

      const response = await fetch(`/api/inventory/qr-generate?${params}`);
      const data = await response.json();

      if (data.success) {
        setVariants(data.variants);
      } else {
        setError(data.error || 'Failed to fetch variants');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  };

  const toggleVariantSelection = (variantId: string) => {
    const newSelection = new Set(selectedVariants);
    if (newSelection.has(variantId)) {
      newSelection.delete(variantId);
    } else {
      newSelection.add(variantId);
    }
    setSelectedVariants(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedVariants.size === variants.length) {
      setSelectedVariants(new Set());
    } else {
      setSelectedVariants(new Set(variants.map(v => v.variant_id)));
    }
  };

  const generateQRCodes = async () => {
    if (selectedVariants.size === 0) {
      setError('Please select at least one variant');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/inventory/qr-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_ids: Array.from(selectedVariants),
          format,
          size,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedQRCodes(data.qr_codes);
        setSuccess(`Successfully generated ${data.count} QR codes`);
      } else {
        setError(data.error || 'Failed to generate QR codes');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrCode: GeneratedQRCode) => {
    const link = document.createElement('a');

    if (format === 'svg') {
      const blob = new Blob([qrCode.qr_code], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
      link.download = `${qrCode.sku}_qr.svg`;
    } else if (format === 'png') {
      link.href = `data:image/png;base64,${qrCode.qr_code}`;
      link.download = `${qrCode.sku}_qr.png`;
    } else {
      link.href = qrCode.qr_code;
      link.download = `${qrCode.sku}_qr.png`;
    }

    link.click();
  };

  const downloadAllQRCodes = () => {
    generatedQRCodes.forEach((qrCode) => {
      setTimeout(() => downloadQRCode(qrCode), 100);
    });
  };

  const printQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
              border: 1px solid #ddd;
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
            }
            .price {
              font-size: 13px;
              font-weight: bold;
              color: #059669;
              margin: 4px 0;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print Labels
            </button>
          </div>
          <div class="qr-grid">
            ${generatedQRCodes.map(qr => `
              <div class="qr-label">
                <img src="${qr.qr_code}" alt="QR Code for ${qr.sku}" />
                <div class="product-name">${qr.product_name}</div>
                <div class="variant-name">${qr.variant_name}</div>
                ${qr.size || qr.color ? `<div class="variant-name">${qr.size || ''} ${qr.color || ''}</div>` : ''}
                <div class="sku">SKU: ${qr.sku}</div>
                <div class="price">₱${qr.price.toFixed(2)}</div>
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
        <p className="text-gray-600">Generate QR codes for product variants to enable mobile scanning</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Variant Selection */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Products</h2>

          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name, SKU, or variant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 text-gray-900"
              />
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Category (optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 flex-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 text-gray-900"
              />
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium flex items-center gap-2"
              >
                {selectedVariants.size === variants.length ? (
                  <>
                    <CheckSquare className="w-5 h-5" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-5 h-5" />
                    Select All
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Variants List */}
          <div className="border border-gray-200 rounded-md max-h-96 overflow-y-auto">
            {loading && variants.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Loading variants...</div>
            ) : variants.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No variants found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {variants.map((variant) => (
                  <div
                    key={variant.variant_id}
                    onClick={() => toggleVariantSelection(variant.variant_id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedVariants.has(variant.variant_id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {selectedVariants.has(variant.variant_id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{variant.product_name}</div>
                        <div className="text-sm text-gray-600">{variant.variant_name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {variant.sku}
                          </span>
                          {variant.size && (
                            <span className="text-xs text-gray-600">Size: {variant.size}</span>
                          )}
                          {variant.color && (
                            <span className="text-xs text-gray-600">Color: {variant.color}</span>
                          )}
                          <span className="text-xs font-semibold text-green-600">
                            ₱{variant.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {variant.has_qr_code && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Has QR
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Selected: {selectedVariants.size} / {variants.length} variants
          </div>
        </div>

        {/* Right Panel - Configuration & Generation */}
        <div className="space-y-6">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size: {size}px
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

              <button
                onClick={generateQRCodes}
                disabled={loading || selectedVariants.size === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <QrCode className="w-5 h-5" />
                {loading ? 'Generating...' : `Generate ${selectedVariants.size} QR Codes`}
              </button>
            </div>
          </div>

          {/* Actions (shown when QR codes are generated) */}
          {generatedQRCodes.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={downloadAllQRCodes}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download All
                </button>
                <button
                  onClick={printQRCodes}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print Labels
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated QR Codes Preview */}
      {generatedQRCodes.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Generated QR Codes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {generatedQRCodes.map((qr) => (
              <div key={qr.variant_id} className="border border-gray-200 rounded-md p-4 text-center">
                <img
                  src={qr.qr_code}
                  alt={`QR Code for ${qr.sku}`}
                  className="w-full h-auto mb-2"
                />
                <div className="text-sm font-medium text-gray-900 truncate">{qr.product_name}</div>
                <div className="text-xs text-gray-600 truncate">{qr.variant_name}</div>
                <div className="text-xs font-mono text-gray-500 mt-1">{qr.sku}</div>
                <button
                  onClick={() => downloadQRCode(qr)}
                  className="mt-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-md w-full"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
