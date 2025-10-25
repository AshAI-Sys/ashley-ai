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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScanBundlePage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function ScanBundlePage() {
    const router = (0, navigation_1.useRouter)();
    const [qrCode, setQrCode] = (0, react_1.useState)("");
    const [scannedBundle, setScannedBundle] = (0, react_1.useState)(null);
    const [isScanning, setIsScanning] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleScan = async () => {
        if (!qrCode.trim()) {
            setError("Please enter a QR code");
            return;
        }
        setIsScanning(true);
        setError(null);
        try {
            const response = await fetch(`/api/cutting/bundles/scan?qrCode=${encodeURIComponent(qrCode)}`);
            if (!response.ok) {
                throw new Error("Bundle not found");
            }
            const data = await response.json();
            setScannedBundle(data.bundle);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to scan bundle");
            setScannedBundle(null);
        }
        finally {
            setIsScanning(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleScan();
        }
    };
    return (<dashboard_layout_1.default>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button_1.Button variant="ghost" size="sm" onClick={() => router.push("/cutting")}>
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Cutting
            </button_1.Button>
            <div>
              <h1 className="text-3xl font-bold">Scan Bundle</h1>
              <p className="text-muted-foreground">
                Scan QR code to view bundle details
              </p>
            </div>
          </div>
        </div>

        {/* Scanner Card */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.QrCode className="h-5 w-5"/>
              QR Code Scanner
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="flex gap-2">
              <input_1.Input placeholder="Enter or scan QR code..." value={qrCode} onChange={e => setQrCode(e.target.value)} onKeyPress={handleKeyPress} className="flex-1 font-mono" autoFocus/>
              <button_1.Button onClick={handleScan} disabled={isScanning}>
                {isScanning ? "Scanning..." : "Scan"}
              </button_1.Button>
            </div>

            {error && (<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Bundle Details */}
        {scannedBundle && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Package className="h-5 w-5"/>
                Bundle Details
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      QR Code
                    </label>
                    <p className="font-mono font-medium">
                      {scannedBundle.qr_code}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Bundle Number
                    </label>
                    <p className="font-medium">
                      {scannedBundle.bundle_number || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Size Code
                    </label>
                    <p className="font-medium">{scannedBundle.size_code}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Quantity
                    </label>
                    <p className="font-medium">{scannedBundle.qty} pieces</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      <badge_1.Badge variant={scannedBundle.status === "DONE"
                ? "default"
                : scannedBundle.status === "IN_SEWING"
                    ? "secondary"
                    : scannedBundle.status === "REJECTED"
                        ? "destructive"
                        : "outline"}>
                        {scannedBundle.status}
                      </badge_1.Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Order Number
                    </label>
                    <p className="font-medium">
                      {scannedBundle.order?.order_number || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Client
                    </label>
                    <p className="font-medium">
                      {scannedBundle.order?.client?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Created
                    </label>
                    <p className="font-medium">
                      {new Date(scannedBundle.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {scannedBundle.lay && (<div className="mt-6 space-y-4 border-t pt-6">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <lucide_react_1.Scissors className="h-4 w-4"/>
                    Cut Lay Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Marker Name
                      </label>
                      <p className="font-medium">
                        {scannedBundle.lay.marker_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Lay Length
                      </label>
                      <p className="font-medium">
                        {scannedBundle.lay.lay_length_m}m
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Plies
                      </label>
                      <p className="font-medium">{scannedBundle.lay.plies}</p>
                    </div>
                  </div>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>)}

        {/* Instructions */}
        {!scannedBundle && !error && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>How to Use</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                1. Use a QR code scanner to scan the bundle QR code, or manually
                enter the code
              </p>
              <p>
                2. The bundle details will appear below once scanned
                successfully
              </p>
              <p>
                3. You can scan multiple bundles by clearing the input and
                scanning again
              </p>
            </card_1.CardContent>
          </card_1.Card>)}
      </div>
    </dashboard_layout_1.default>);
}
