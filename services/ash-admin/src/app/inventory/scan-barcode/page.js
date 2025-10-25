"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScanBarcodePage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
function ScanBarcodePage() {
    const router = (0, navigation_1.useRouter)();
    const [scannedCode, setScannedCode] = (0, react_1.useState)("");
    const handleScan = () => {
        window.alert("Barcode scanning feature will be implemented with camera integration");
    };
    const handleManualEntry = (e) => {
        e.preventDefault();
        window.alert(`Looking up material with code: ${scannedCode}`);
    };
    return (<div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push("/inventory")} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <lucide_react_1.ArrowLeft className="h-5 w-5"/>
            Back to Inventory
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Scan Barcode</h1>
          <p className="mt-2 text-gray-600">
            Scan material barcodes for quick lookup
          </p>
        </div>

        {/* Scanner */}
        <div className="rounded-lg bg-white p-8 shadow">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-64 w-64 items-center justify-center rounded-lg bg-gray-100">
              <lucide_react_1.QrCode className="h-32 w-32 text-gray-500"/>
            </div>
            <button onClick={handleScan} className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
              <lucide_react_1.Camera className="h-5 w-5"/>
              Start Camera Scanner
            </button>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Manual Entry
            </h3>
            <form onSubmit={handleManualEntry} className="flex gap-4">
              <input type="text" value={scannedCode} onChange={e => setScannedCode(e.target.value)} placeholder="Enter barcode or SKU..." className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"/>
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                Look Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>);
}
