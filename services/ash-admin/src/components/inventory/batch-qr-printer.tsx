"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, Download, QrCode, Plus, Trash2, Settings } from "lucide-react";
import QRCode from "qrcode";

interface LabelItem {
  id: string;
  type: "product" | "bundle" | "location" | "order";
  code: string;
  title: string;
  subtitle?: string;
  quantity: number;
}

type LabelSize = "small" | "medium" | "large";
type LabelTemplate = "basic" | "detailed" | "minimal";

export default function BatchQRPrinter() {
  const [items, setItems] = useState<LabelItem[]>([]);
  const [labelSize, setLabelSize] = useState<LabelSize>("medium");
  const [labelTemplate, setLabelTemplate] = useState<LabelTemplate>("detailed");
  const [showSettings, setShowSettings] = useState(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const labelSizes = {
    small: { width: 150, height: 150, fontSize: "10px" },
    medium: { width: 200, height: 200, fontSize: "12px" },
    large: { width: 300, height: 300, fontSize: "14px" },
  };

  useEffect(() => {
    // Generate QR codes for all items
    items.forEach((item, index) => {
      if (canvasRefs.current[index]) {
        QRCode.toCanvas(
          canvasRefs.current[index]!,
          item.code,
          {
            width: labelSizes[labelSize].width,
            margin: 1,
            color: { dark: "#000000", light: "#FFFFFF" },
          }
        );
      }
    });
  }, [items, labelSize]);

  const addItem = () => {
    const newItem: LabelItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: "product",
      code: `ITEM-${Date.now()}`,
      title: "Product Name",
      subtitle: "SKU-001",
      quantity: 1,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LabelItem, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handlePrintAll = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const labelsHTML = items
      .map((item, index) => {
        const canvas = canvasRefs.current[index];
        if (!canvas) return "";

        const imgData = canvas.toDataURL("image/png");

        return Array(item.quantity)
          .fill(null)
          .map(() => {
            if (labelTemplate === "minimal") {
              return `
                <div class="label label-${labelSize}">
                  <img src="${imgData}" alt="QR Code" />
                  <div class="code">${item.code}</div>
                </div>
              `;
            } else if (labelTemplate === "detailed") {
              return `
                <div class="label label-${labelSize}">
                  <div class="header">${item.type.toUpperCase()}</div>
                  <img src="${imgData}" alt="QR Code" />
                  <div class="title">${item.title}</div>
                  ${item.subtitle ? `<div class="subtitle">${item.subtitle}</div>` : ""}
                  <div class="code">${item.code}</div>
                </div>
              `;
            } else {
              return `
                <div class="label label-${labelSize}">
                  <img src="${imgData}" alt="QR Code" />
                  <div class="title">${item.title}</div>
                  <div class="code">${item.code}</div>
                </div>
              `;
            }
          })
          .join("");
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Labels</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 10mm;
              background: white;
            }

            .labels-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(${
                labelSize === "small" ? "60mm" : labelSize === "medium" ? "80mm" : "110mm"
              }, 1fr));
              gap: 5mm;
            }

            .label {
              border: 2px solid #000;
              padding: 5mm;
              text-align: center;
              page-break-inside: avoid;
              background: white;
            }

            .label-small { width: 60mm; }
            .label-medium { width: 80mm; }
            .label-large { width: 110mm; }

            .label img {
              width: 100%;
              height: auto;
              margin: 3mm 0;
            }

            .header {
              font-size: ${labelSizes[labelSize].fontSize};
              font-weight: bold;
              color: #666;
              margin-bottom: 2mm;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .title {
              font-size: ${labelSizes[labelSize].fontSize};
              font-weight: bold;
              margin: 2mm 0;
              color: #000;
            }

            .subtitle {
              font-size: calc(${labelSizes[labelSize].fontSize} - 2px);
              color: #555;
              margin: 1mm 0;
            }

            .code {
              font-family: "Courier New", monospace;
              font-size: calc(${labelSizes[labelSize].fontSize} - 1px);
              font-weight: bold;
              margin-top: 2mm;
              padding: 1mm;
              background: #f0f0f0;
              border: 1px solid #ddd;
              word-break: break-all;
            }

            @media print {
              body {
                padding: 0;
                background: white;
              }

              .label {
                page-break-inside: avoid;
              }

              @page {
                margin: 10mm;
                size: A4;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="labels-grid">
            ${labelsHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadAll = () => {
    items.forEach((item, index) => {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `qr-${item.code}.png`;
        link.href = url;
        link.click();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch QR/Barcode Printer</h2>
          <p className="text-sm text-gray-600">Generate and print multiple labels at once</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={addItem}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Label
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Label Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label Size
              </label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as LabelSize)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="small">Small (60mm)</option>
                <option value="medium">Medium (80mm)</option>
                <option value="large">Large (110mm)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label Template
              </label>
              <select
                value={labelTemplate}
                onChange={(e) => setLabelTemplate(e.target.value as LabelTemplate)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="minimal">Minimal (QR + Code)</option>
                <option value="basic">Basic (QR + Title + Code)</option>
                <option value="detailed">Detailed (All Info)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-12 gap-4 items-start">
              {/* QR Code Preview */}
              <div className="col-span-2">
                <canvas
                  ref={(el) => {
                    canvasRefs.current[index] = el;
                  }}
                  className="w-full rounded border border-gray-300"
                />
              </div>

              {/* Form Fields */}
              <div className="col-span-9 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(item.id, "type", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="product">Product</option>
                    <option value="bundle">Bundle</option>
                    <option value="location">Location</option>
                    <option value="order">Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Code/ID
                  </label>
                  <input
                    type="text"
                    value={item.code}
                    onChange={(e) => updateItem(item.id, "code", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="Enter code or ID"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, "title", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="Product name or description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Subtitle (SKU, etc)
                  </label>
                  <input
                    type="text"
                    value={item.subtitle || ""}
                    onChange={(e) => updateItem(item.id, "subtitle", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="Optional subtitle"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Delete Button */}
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <QrCode className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No labels added</h3>
          <p className="mt-2 text-sm text-gray-600">
            Click "Add Label" to start creating QR code labels
          </p>
          <button
            onClick={addItem}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add First Label
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {items.length > 0 && (
        <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <button
            onClick={handlePrintAll}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Printer className="h-5 w-5" />
            Print All Labels ({items.reduce((sum, item) => sum + item.quantity, 0)} total)
          </button>
          <button
            onClick={handleDownloadAll}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            Download All Images
          </button>
        </div>
      )}
    </div>
  );
}
