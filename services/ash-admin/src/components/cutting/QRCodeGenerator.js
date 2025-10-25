"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QRCodeGenerator;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function QRCodeGenerator({ bundleData, showActions = true, }) {
    const [qrCode, setQrCode] = (0, react_1.useState)("");
    const [copied, setCopied] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
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
        }
        catch (error) {
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
    return (<card_1.Card className="w-full">
      <card_1.CardHeader className="pb-3">
        <card_1.CardTitle className="flex items-center gap-2 text-lg">
          <lucide_react_1.QrCode className="h-5 w-5"/>
          Bundle #{bundleData.bundleNumber}
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <badge_1.Badge variant="outline" className="px-3 py-1 text-lg">
            {bundleData.sizeCode}
          </badge_1.Badge>
          <badge_1.Badge className="bg-blue-100 text-blue-800">
            {bundleData.qty} pieces
          </badge_1.Badge>
        </div>

        {/* QR Code Display - In production, render actual QR code */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded border bg-gray-100">
            <lucide_react_1.QrCode className="h-16 w-16 text-gray-500"/>
          </div>
          <div className="mt-2 break-all font-mono text-xs text-muted-foreground">
            {qrCode}
          </div>
        </div>

        {showActions && (<div className="flex gap-2">
            <button_1.Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1">
              {copied ? (<>
                  <lucide_react_1.Check className="mr-1 h-4 w-4"/>
                  Copied
                </>) : (<>
                  <lucide_react_1.Copy className="mr-1 h-4 w-4"/>
                  Copy
                </>)}
            </button_1.Button>

            <button_1.Button variant="outline" size="sm" onClick={downloadQR}>
              <lucide_react_1.Download className="h-4 w-4"/>
            </button_1.Button>

            <button_1.Button variant="outline" size="sm" onClick={printLabel}>
              <lucide_react_1.Printer className="h-4 w-4"/>
            </button_1.Button>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
