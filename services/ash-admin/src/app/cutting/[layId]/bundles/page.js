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
exports.default = CreateBundlesPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
function CreateBundlesPage({ params, }) {
    const _router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [lay, setLay] = (0, react_1.useState)(null);
    const [bundleConfig, setBundleConfig] = (0, react_1.useState)([]);
    const [createdBundles, setCreatedBundles] = (0, react_1.useState)([]);
    const [step, setStep] = (0, react_1.useState)("config");
    const [errors, setErrors] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        fetchLayData();
    }, [params.layId]);
    const fetchLayData = async () => {
        try {
            // In real implementation, fetch from API
            // Mock data for demo
            const mockLay = {
                id: params.layId,
                order_id: "1",
                marker_name: "Hoodie Marker V2",
                marker_width_cm: 160,
                lay_length_m: 25.5,
                plies: 12,
                gross_used: 18.2,
                offcuts: 0.8,
                defects: 0.2,
                uom: "KG",
                order: {
                    order_number: "TCAS-2025-000001",
                    brand: { name: "Trendy Casual", code: "TCAS" },
                },
                outputs: [
                    { size_code: "M", qty: 48 },
                    { size_code: "L", qty: 48 },
                    { size_code: "XL", qty: 24 },
                ],
            };
            setLay(mockLay);
            // Initialize bundle configuration
            const initialConfig = mockLay.outputs.map(output => ({
                size_code: output.size_code,
                total_pieces: output.qty,
                pieces_per_bundle: 20, // Default bundle size
                bundles_count: Math.ceil(output.qty / 20),
                qr_codes: [],
            }));
            setBundleConfig(initialConfig);
        }
        catch (error) {
            console.error("Failed to fetch lay data:", error);
        }
    };
    const generateQRCode = (orderId, layId, sizeCode, bundleNumber) => {
        const timestamp = new Date().getTime();
        return `ASH-${orderId}-${layId}-${sizeCode}-${bundleNumber}-${timestamp}`;
    };
    const updateBundleConfig = (index, field, value) => {
        const newConfig = [...bundleConfig];
        newConfig[index] = { ...newConfig[index], [field]: value };
        if (field === "pieces_per_bundle") {
            const piecesPerBundle = parseInt(value) || 1;
            newConfig[index].bundles_count = Math.ceil(newConfig[index].total_pieces / piecesPerBundle);
        }
        setBundleConfig(newConfig);
    };
    const generateBundlePreviews = () => {
        const previews = bundleConfig.map(config => {
            const qrCodes = [];
            for (let i = 1; i <= config.bundles_count; i++) {
                const remainingPieces = config.total_pieces - (i - 1) * config.pieces_per_bundle;
                const bundlePieces = Math.min(config.pieces_per_bundle, remainingPieces);
                qrCodes.push({
                    bundle_number: i,
                    qr_code: generateQRCode(lay?.order_id || "1", params.layId, config.size_code, i),
                    pieces: bundlePieces,
                });
            }
            return {
                ...config,
                qr_codes: qrCodes,
            };
        });
        setBundleConfig(previews);
        setStep("preview");
    };
    const createBundles = async () => {
        if (!lay)
            return;
        setLoading(true);
        try {
            const bundlesToCreate = bundleConfig.flatMap(config => config.qr_codes.map((qr) => ({
                order_id: lay.order_id,
                lay_id: params.layId,
                size_code: config.size_code,
                qty: qr.pieces,
                qr_code: qr.qr_code,
                status: "CREATED",
            })));
            // Mock API call - in real implementation, call actual API
            console.log("Creating bundles:", bundlesToCreate);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            setCreatedBundles(bundlesToCreate);
            setStep("created");
        }
        catch (error) {
            console.error("Error creating bundles:", error);
            setErrors({ submit: "Failed to create bundles. Please try again." });
        }
        finally {
            setLoading(false);
        }
    };
    const printBundleLabels = (bundleGroup) => {
        // Mock print functionality
        alert(`Printing labels for ${bundleGroup ? `${bundleGroup.size_code} bundles` : "all bundles"}...`);
    };
    if (!lay) {
        return (<div className="container mx-auto py-6">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>);
    }
    return (<div className="container mx-auto max-w-6xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <link_1.default href="/cutting">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
            Back to Cutting
          </button_1.Button>
        </link_1.default>
        <div>
          <h1 className="text-3xl font-bold">Create Bundles</h1>
          <p className="text-muted-foreground">
            Generate QR-coded bundles for {lay.order.order_number} -{" "}
            {lay.marker_name || `Lay #${lay.id}`}
          </p>
        </div>
      </div>

      {/* Lay Information */}
      <card_1.Card className="mb-6">
        <card_1.CardHeader>
          <card_1.CardTitle>Lay Information</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="font-medium">Order:</span>
              <br />
              <badge_1.Badge className="mt-1">{lay.order.brand.code}</badge_1.Badge>{" "}
              {lay.order.order_number}
            </div>
            <div>
              <span className="font-medium">Marker:</span>
              <br />
              {lay.marker_name || `Lay #${lay.id}`}
            </div>
            <div>
              <span className="font-medium">Dimensions:</span>
              <br />
              {lay.marker_width_cm ? `${lay.marker_width_cm}cm × ` : ""}
              {lay.lay_length_m}m × {lay.plies} plies
            </div>
            <div>
              <span className="font-medium">Total Pieces:</span>
              <br />
              <span className="text-lg font-bold text-blue-600">
                {lay.outputs.reduce((sum, output) => sum + output.qty, 0)}
              </span>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {step === "config" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Bundle Configuration</card_1.CardTitle>
            <card_1.CardDescription>
              Set up bundle sizes for each size category
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            {bundleConfig.map((config, index) => (<div key={config.size_code} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <badge_1.Badge variant="outline" className="px-3 py-1 text-lg">
                      {config.size_code}
                    </badge_1.Badge>
                    <span className="text-sm text-muted-foreground">
                      {config.total_pieces} pieces total
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label_1.Label>Pieces per Bundle</label_1.Label>
                    <div className="flex items-center space-x-2">
                      <button_1.Button type="button" variant="outline" size="sm" onClick={() => {
                    const newValue = Math.max(1, config.pieces_per_bundle - 5);
                    updateBundleConfig(index, "pieces_per_bundle", newValue);
                }}>
                        <lucide_react_1.Minus className="h-4 w-4"/>
                      </button_1.Button>
                      <input_1.Input type="number" min="1" max={config.total_pieces} value={config.pieces_per_bundle} onChange={e => updateBundleConfig(index, "pieces_per_bundle", parseInt(e.target.value) || 1)} className="text-center"/>
                      <button_1.Button type="button" variant="outline" size="sm" onClick={() => {
                    const newValue = Math.min(config.total_pieces, config.pieces_per_bundle + 5);
                    updateBundleConfig(index, "pieces_per_bundle", newValue);
                }}>
                        <lucide_react_1.Plus className="h-4 w-4"/>
                      </button_1.Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label>Number of Bundles</label_1.Label>
                    <div className="text-2xl font-bold text-green-600">
                      {config.bundles_count}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label>Bundle Breakdown</label_1.Label>
                    <div className="text-sm text-muted-foreground">
                      {config.bundles_count > 1 && (<>
                          {config.bundles_count - 1} ×{" "}
                          {config.pieces_per_bundle} pieces
                          <br />1 ×{" "}
                          {config.total_pieces -
                        (config.bundles_count - 1) *
                            config.pieces_per_bundle}{" "}
                          pieces
                        </>)}
                      {config.bundles_count === 1 && (<>1 × {config.total_pieces} pieces</>)}
                    </div>
                  </div>
                </div>
              </div>))}

            <div className="flex justify-end">
              <button_1.Button onClick={generateBundlePreviews} className="bg-blue-600 hover:bg-blue-700">
                <lucide_react_1.Eye className="mr-2 h-4 w-4"/>
                Preview Bundles
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {step === "preview" && (<div className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Bundle Preview</card_1.CardTitle>
              <card_1.CardDescription>
                Review generated QR codes before creation
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-6">
                {bundleConfig.map((config, index) => (<div key={config.size_code}>
                    <div className="mb-3 flex items-center gap-3">
                      <badge_1.Badge className="px-3 py-1 text-lg">
                        {config.size_code}
                      </badge_1.Badge>
                      <span className="font-medium">
                        {config.bundles_count} bundles
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {config.qr_codes.map((qr, qrIndex) => (<div key={qrIndex} className="rounded-lg border bg-gray-50 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="font-mono text-sm">
                              Bundle #{qr.bundle_number}
                            </div>
                            <badge_1.Badge variant="outline">{qr.pieces} pcs</badge_1.Badge>
                          </div>
                          <div className="break-all font-mono text-xs text-muted-foreground">
                            {qr.qr_code}
                          </div>
                        </div>))}
                    </div>
                  </div>))}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <div className="flex justify-between">
            <button_1.Button variant="outline" onClick={() => setStep("config")}>
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Configuration
            </button_1.Button>
            <button_1.Button onClick={createBundles} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (<>Creating Bundles...</>) : (<>
                  <lucide_react_1.QrCode className="mr-2 h-4 w-4"/>
                  Create All Bundles
                </>)}
            </button_1.Button>
          </div>
        </div>)}

      {step === "created" && (<div className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2 text-green-600">
                <lucide_react_1.CheckCircle className="h-6 w-6"/>
                Bundles Created Successfully
              </card_1.CardTitle>
              <card_1.CardDescription>
                {createdBundles.length} bundles have been created and are ready
                for sewing
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {bundleConfig.map(config => (<div key={config.size_code} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <badge_1.Badge className="px-3 py-1 text-lg">
                          {config.size_code}
                        </badge_1.Badge>
                        <span>{config.bundles_count} bundles created</span>
                      </div>
                      <button_1.Button variant="outline" size="sm" onClick={() => printBundleLabels(config)}>
                        <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
                        Print Labels
                      </button_1.Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Bundle IDs:{" "}
                      {config.qr_codes
                    .slice(0, 3)
                    .map((qr) => qr.qr_code.split("-").slice(-2).join("-"))
                    .join(", ")}
                      {config.qr_codes.length > 3 &&
                    ` and ${config.qr_codes.length - 3} more...`}
                    </div>
                  </div>))}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Ashley AI Analysis */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <span>🤖</span>
                <span>Ashley AI Bundle Analysis</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-900">
                  Bundle Optimization Insights
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    • Bundle sizes are optimal for {lay.order.order_number} -
                    matches sewing line capacity
                  </li>
                  <li>
                    • QR code generation: {createdBundles.length} unique
                    trackable units created
                  </li>
                  <li>
                    • Estimated sewing time:{" "}
                    {Math.round(createdBundles.reduce((sum, bundle) => sum + bundle.qty, 0) * 0.15)}{" "}
                    minutes
                  </li>
                  <li>
                    • Recommended print: Bundle labels should be printed on 4x2
                    inch thermal labels
                  </li>
                </ul>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <div className="flex justify-between">
            <link_1.default href="/cutting">
              <button_1.Button variant="outline">Back to Cutting Dashboard</button_1.Button>
            </link_1.default>
            <div className="space-x-2">
              <button_1.Button variant="outline" onClick={() => printBundleLabels()}>
                <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
                Print All Labels
              </button_1.Button>
              <link_1.default href={`/sewing?bundles=${createdBundles.map(b => b.qr_code).join(",")}`}>
                <button_1.Button className="bg-purple-600 hover:bg-purple-700">
                  <lucide_react_1.Package className="mr-2 h-4 w-4"/>
                  Send to Sewing
                </button_1.Button>
              </link_1.default>
            </div>
          </div>
        </div>)}

      {errors.submit && (<div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <lucide_react_1.AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>
          <p className="text-red-800">{errors.submit}</p>
        </div>)}
    </div>);
}
