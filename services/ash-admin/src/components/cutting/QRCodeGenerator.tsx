"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy, Check, Download, Printer } from "lucide-react";

interface QRCodeGeneratorProps {
  bundleData: {
    orderId: string;
    layId: string;
    sizeCode: string;
    bundleNumber: number;
    qty: number;
  };
  showActions?: boolean;
}

export default function QRCodeGenerator({
  bundleData,
  showActions = true,
}: QRCodeGeneratorProps) {
  const [qrCode, setQrCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [bundleData]);

  const generateQRCode = () => {
    const timestamp = new Date().getTime();
    const code = `ASH-${bundleData.orderId}-${bundleData.layId}-${bundleData.sizeCode}-${bundleData.bundleNumber}-${timestamp}`;
    setQrCode(code);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy QR code:", error);
    }
  };

  const downloadQR = () => {
    // In a real implementation, this would generate and download a QR code image
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Simple placeholder - in production, use a proper QR code library
      ctx.fillStyle = "#000";
      ctx.font = "12px monospace";
      ctx.fillText("QR Code:", 10, 20);
      ctx.fillText(qrCode.substring(0, 20), 10, 40);
      ctx.fillText(qrCode.substring(20, 40), 10, 60);
      ctx.fillText(qrCode.substring(40), 10, 80);

      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `bundle-${bundleData.sizeCode}-${bundleData.bundleNumber}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const printLabel = () => {
    // Mock print functionality
    const printContent = `
      <div style="font-family: monospace; padding: 20px; text-align: center;">
        <h2>ASH AI Bundle Label</h2>
        <div style="border: 2px solid #000; padding: 20px; margin: 20px 0;">
          <div style="font-size: 24px; margin: 10px 0;">${bundleData.sizeCode}</div>
          <div style="font-size: 18px; margin: 10px 0;">${bundleData.qty} pieces</div>
          <div style="font-size: 10px; margin: 10px 0; word-break: break-all;">${qrCode}</div>
          <div style="font-size: 12px; margin: 10px 0;">Bundle #${bundleData.bundleNumber}</div>
        </div>
      </div>
    `;

    const printWindow = window.open("", "", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5" />
          Bundle #{bundleData.bundleNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="px-3 py-1 text-lg">
            {bundleData.sizeCode}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            {bundleData.qty} pieces
          </Badge>
        </div>

        {/* QR Code Display - In production, render actual QR code */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded border bg-gray-100">
            <QrCode className="h-16 w-16 text-gray-500" />
          </div>
          <div className="mt-2 break-all font-mono text-xs text-muted-foreground">
            {qrCode}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={downloadQR}>
              <Download className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={printLabel}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
