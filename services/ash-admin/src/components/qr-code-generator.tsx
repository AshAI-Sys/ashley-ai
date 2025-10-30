"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";

interface QRCodeGeneratorProps {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku: string;
  size?: number;
}

export default function QRCodeGenerator({
  productId,
  variantId,
  productName,
  variantName,
  sku,
  size = 200,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    generateQRCode();
  }, [productId, variantId]);

  const generateQRCode = async () => {
    try {
      // Construct the QR code URL
      const baseUrl = "https://inventory.yourdomain.com";
      const url = variantId
        ? `${baseUrl}/i/${productId}?v=${variantId}`
        : `${baseUrl}/i/${productId}`;

      setQrCodeUrl(url);

      // Generate QR code using HTML5 Canvas
      // This is a simple implementation - for production, use a library like 'qrcode' or 'react-qr-code'
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Clear canvas
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, size, size);

          // Draw placeholder text (in production, use a proper QR code library)
          ctx.fillStyle = "#000";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText("QR CODE", size / 2, size / 2 - 10);
          ctx.fillText("PLACEHOLDER", size / 2, size / 2 + 10);
          ctx.font = "10px Arial";
          ctx.fillText(sku, size / 2, size / 2 + 30);
        }
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-${sku}.png`;
      link.href = url;
      link.click();
    }
  };

  const handlePrint = () => {
    if (canvasRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const imgUrl = canvasRef.current.toDataURL("image/png");
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code - ${sku}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  font-family: Arial, sans-serif;
                }
                .qr-label {
                  border: 2px solid #000;
                  padding: 20px;
                  text-align: center;
                  max-width: 400px;
                }
                img {
                  max-width: 300px;
                  height: auto;
                }
                h2 {
                  margin: 10px 0;
                  font-size: 18px;
                }
                p {
                  margin: 5px 0;
                  font-size: 14px;
                }
                .sku {
                  font-weight: bold;
                  font-size: 16px;
                }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              <div class="qr-label">
                <img src="${imgUrl}" alt="QR Code" />
                <h2>${productName}</h2>
                ${variantName ? `<p>${variantName}</p>` : ""}
                <p class="sku">SKU: ${sku}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6">
      {/* QR Code Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded border-2 border-gray-300"
      />

      {/* Product Info */}
      <div className="text-center">
        <p className="font-semibold text-gray-900">{productName}</p>
        {variantName && <p className="text-sm text-gray-600">{variantName}</p>}
        <p className="text-xs text-gray-500">SKU: {sku}</p>
        <p className="mt-2 text-xs text-gray-400 break-all max-w-xs">{qrCodeUrl}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" />
          Print Label
        </button>
      </div>

      {/* Installation Note */}
      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
        <p className="font-semibold">Development Note:</p>
        <p>
          This is a placeholder. Install 'qrcode' or 'react-qr-code' package for production QR generation.
        </p>
        <p className="mt-1">Run: pnpm add qrcode @types/qrcode</p>
      </div>
    </div>
  );
}
