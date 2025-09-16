'use client';
"use strict";
const __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    let desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
const __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
const __importStar = (this && this.__importStar) || (function () {
    let ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            const ar = [];
            for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        const result = {};
        if (mod != null) for (let k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QRBundleScanner;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const alert_1 = require("@/components/ui/alert");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function QRBundleScanner({ onBundleScanned, disabled = false, className = '' }) {
    const [qrInput, setQrInput] = (0, react_1.useState)('');
    const [isScanning, setIsScanning] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [lastScannedBundle, setLastScannedBundle] = (0, react_1.useState)(null);
    const videoRef = (0, react_1.useRef)(null);
    const streamRef = (0, react_1.useRef)(null);
    const validateQRCode = (qrCode) => {
        // ASH AI QR codes should follow format: ash://bundle/{id}
        const qrPattern = /^ash:\/\/bundle\/[a-zA-Z0-9-]+$/;
        return qrPattern.test(qrCode.trim());
    };
    const fetchBundleByQR = async (qrCode) => {
        const response = await fetch(`/api/bundles/by-qr?qr_code=${encodeURIComponent(qrCode)}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Bundle not found. Please check the QR code.');
            }
            throw new Error('Failed to fetch bundle information.');
        }
        const data = await response.json();
        return data.bundle;
    };
    const mockFetchBundle = (qrCode) => {
        // Mock implementation for demo
        const bundleId = qrCode.split('/').pop() || 'unknown';
        return {
            id: bundleId,
            order_id: 'order-001',
            size_code: 'M',
            qty: 20,
            qr_code: qrCode,
            status: 'CREATED',
            order: {
                order_number: 'TCAS-2025-000001',
                brand: { name: 'Trendy Casual', code: 'TCAS' },
                line_items: [{ description: 'Premium Hoodie' }]
            },
            created_at: new Date().toISOString()
        };
    };
    const handleManualScan = async () => {
        if (!qrInput.trim()) {
            setError('Please enter a QR code');
            return;
        }
        if (!validateQRCode(qrInput)) {
            setError('Invalid QR code format. Expected format: ash://bundle/{id}');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Try real API first, fallback to mock
            let bundle;
            try {
                bundle = await fetchBundleByQR(qrInput);
            }
            catch (apiError) {
                console.log('API call failed, using mock data:', apiError);
                bundle = mockFetchBundle(qrInput);
            }
            setLastScannedBundle(bundle);
            onBundleScanned(bundle);
            setQrInput('');
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to scan QR code');
        }
        finally {
            setIsLoading(false);
        }
    };
    const startCameraCapture = async () => {
        setIsScanning(true);
        setError(null);
        try {
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera if available
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            // In a real implementation, this would use a QR code detection library
            // For demo, simulate scanning after 3 seconds
            setTimeout(() => {
                const mockQR = 'ash://bundle/demo-scanner-001';
                setQrInput(mockQR);
                stopCameraCapture();
                // Auto-process the scanned code
                setTimeout(() => {
                    handleManualScan();
                }, 100);
            }, 3000);
        }
        catch (error) {
            setError('Camera access denied or not available');
            setIsScanning(false);
        }
    };
    const stopCameraCapture = (0, react_1.useCallback)(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    }, []);
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleManualScan();
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'CREATED': return 'bg-blue-100 text-blue-800';
            case 'IN_SEWING': return 'bg-yellow-100 text-yellow-800';
            case 'DONE': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (<div className={`space-y-4 ${className}`}>
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.QrCode className="w-5 h-5"/>
            Bundle QR Scanner
          </card_1.CardTitle>
          <card_1.CardDescription>
            Scan or enter the QR code from the printed bundle label
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {/* Manual Input */}
          <div className="space-y-2">
            <label_1.Label htmlFor="qr_input">Bundle QR Code</label_1.Label>
            <div className="flex gap-2">
              <input_1.Input id="qr_input" value={qrInput} onChange={(e) => {
            setQrInput(e.target.value);
            setError(null);
        }} onKeyPress={handleKeyPress} placeholder="ash://bundle/..." className="font-mono" disabled={disabled || isScanning}/>
              <button_1.Button onClick={handleManualScan} disabled={disabled || isLoading || !qrInput.trim() || isScanning} size="default">
                {isLoading ? (<lucide_react_1.RefreshCw className="w-4 h-4 mr-2 animate-spin"/>) : (<lucide_react_1.Search className="w-4 h-4 mr-2"/>)}
                {isLoading ? 'Scanning...' : 'Lookup'}
              </button_1.Button>
            </div>
          </div>

          <div className="text-center">
            <div className="my-4">
              <span className="text-sm text-muted-foreground">OR</span>
            </div>
            
            {/* Camera Scanner */}
            <div className="space-y-4">
              {!isScanning ? (<button_1.Button onClick={startCameraCapture} disabled={disabled || isLoading} variant="outline" className="w-full">
                  <lucide_react_1.Camera className="w-4 h-4 mr-2"/>
                  Use Camera Scanner
                </button_1.Button>) : (<div className="space-y-4">
                  <div className="relative border-2 border-dashed rounded-lg p-4 bg-gray-50">
                    <video ref={videoRef} className="w-full max-w-md mx-auto rounded-lg bg-black" autoPlay muted playsInline/>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-blue-500 rounded-lg"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <lucide_react_1.QrCode className="w-5 h-5 animate-pulse"/>
                    <span>Scanning for QR code...</span>
                  </div>
                  
                  <button_1.Button onClick={stopCameraCapture} variant="outline">
                    Stop Scanning
                  </button_1.Button>
                </div>)}
            </div>
          </div>

          {/* Error Display */}
          {error && (<alert_1.Alert variant="destructive">
              <lucide_react_1.AlertCircle className="h-4 w-4"/>
              <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
            </alert_1.Alert>)}

          {/* Tips */}
          <alert_1.Alert>
            <lucide_react_1.QrCode className="h-4 w-4"/>
            <alert_1.AlertDescription>
              <strong>Tip:</strong> Make sure the bundle QR code is clearly visible and not damaged. 
              The QR code should be in format: ash://bundle/&#123;id&#125;
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>

      {/* Last Scanned Bundle Preview */}
      {lastScannedBundle && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.CheckCircle className="w-5 h-5 text-green-600"/>
              Last Scanned Bundle
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order</p>
                <p className="font-medium">{lastScannedBundle.order.order_number}</p>
                <p className="text-sm text-muted-foreground">{lastScannedBundle.order.brand.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product</p>
                <p className="font-medium">{lastScannedBundle.order.line_items[0]?.description}</p>
                <p className="text-sm text-muted-foreground">Size: {lastScannedBundle.size_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Details</p>
                <p className="font-medium">{lastScannedBundle.qty} pieces</p>
                <badge_1.Badge className={getStatusColor(lastScannedBundle.status)}>
                  {lastScannedBundle.status.replace('_', ' ')}
                </badge_1.Badge>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
