"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import QRCode from "qrcode";

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
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [productId, variantId]);

  const generateQRCode = async () => {
    setGenerating(true);
    try {
      // Construct the QR code URL
      const baseUrl = "https://inventory.yourdomain.com";
      const url = variantId
        ? `${baseUrl}/i/${productId}?v=${variantId}`
        : `${baseUrl}/i/${productId}`;

      setQrCodeUrl(url);

      // Generate QR code using qrcode library
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setGenerating(false);
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
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Download className="h-4 w-4" />
          {generating ? "Generating..." : "Download"}
        </button>
        <button
          onClick={handlePrint}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:bg-gray-100"
        >
          <Printer className="h-4 w-4" />
          Print Label
        </button>
      </div>

      {/* Success Message */}
      {!generating && (
        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
          <p className="font-semibold">✓ QR Code Generated Successfully</p>
          <p>Scan this code with your mobile device to access product details</p>
        </div>
      )}
    </div>
  );
}
