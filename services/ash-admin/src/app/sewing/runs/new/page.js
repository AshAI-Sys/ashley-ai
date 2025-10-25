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
exports.default = NewSewingRunPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const alert_1 = require("@/components/ui/alert");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
function NewSewingRunPage() {
    const router = (0, navigation_1.useRouter)();
    const [step, setStep] = (0, react_1.useState)("scan");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [qrInput, setQrInput] = (0, react_1.useState)("");
    const [scannedBundle, setScannedBundle] = (0, react_1.useState)(null);
    const [bundleProgress, setBundleProgress] = (0, react_1.useState)([]);
    const [availableOperations, setAvailableOperations] = (0, react_1.useState)([]);
    const [selectedOperation, setSelectedOperation] = (0, react_1.useState)(null);
    const [selectedOperator, setSelectedOperator] = (0, react_1.useState)(null);
    const [operators, setOperators] = (0, react_1.useState)([]);
    const [isScanning, setIsScanning] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchOperators();
    }, []);
    const fetchOperators = async () => {
        try {
            const response = await fetch("/api/employees?department=SEWING");
            if (response.ok) {
                const data = await response.json();
                setOperators(data.data || []);
            }
            else {
                // Mock data
                setOperators([
                    {
                        id: "1",
                        employee_number: "EMP001",
                        first_name: "Maria",
                        last_name: "Santos",
                        position: "Sewing Operator",
                        department: "SEWING",
                    },
                    {
                        id: "2",
                        employee_number: "EMP002",
                        first_name: "Carlos",
                        last_name: "Rodriguez",
                        position: "Senior Operator",
                        department: "SEWING",
                    },
                    {
                        id: "3",
                        employee_number: "EMP003",
                        first_name: "Ana",
                        last_name: "Cruz",
                        position: "Sewing Operator",
                        department: "SEWING",
                    },
                    {
                        id: "4",
                        employee_number: "EMP004",
                        first_name: "Juan",
                        last_name: "Dela Cruz",
                        position: "Team Leader",
                        department: "SEWING",
                    },
                ]);
            }
        }
        catch (error) {
            console.error("Failed to fetch operators:", error);
        }
    };
    const handleQRScan = async () => {
        if (!qrInput.trim())
            return;
        setLoading(true);
        try {
            // Fetch bundle data by QR code
            const response = await fetch(`/api/bundles/by-qr?qr_code=${encodeURIComponent(qrInput)}`);
            if (response.ok) {
                const data = await response.json();
                setScannedBundle(data.bundle);
                setBundleProgress(data.progress || []);
                await fetchAvailableOperations(data.bundle);
                setStep("operation");
            }
            else {
                // Mock data for demo
                const mockBundle = {
                    id: "bundle-001",
                    order_id: "order-001",
                    size_code: "M",
                    qty: 20,
                    qr_code: qrInput,
                    status: "CREATED",
                    order: {
                        order_number: "TCAS-2025-000001",
                        brand: { name: "Trendy Casual", code: "TCAS" },
                        line_items: [
                            { description: "Premium Hoodie", garment_type: "Hoodie" },
                        ],
                    },
                    lay: {
                        id: "lay-001",
                        marker_name: "Hoodie Marker V2",
                    },
                    created_at: new Date().toISOString(),
                };
                const mockProgress = [
                    {
                        operation_name: "Join shoulders",
                        status: "COMPLETED",
                        completed_at: new Date(Date.now() - 3600000).toISOString(),
                    },
                ];
                setScannedBundle(mockBundle);
                setBundleProgress(mockProgress);
                await fetchAvailableOperations(mockBundle);
                setStep("operation");
            }
        }
        catch (error) {
            console.error("Failed to scan QR code:", error);
            alert("Invalid QR code or bundle not found");
        }
        finally {
            setLoading(false);
        }
    };
    const fetchAvailableOperations = async (bundle) => {
        try {
            const garmentType = bundle.order.line_items[0]?.garment_type || "Hoodie";
            const response = await fetch(`/api/sewing/operations?product_type=${garmentType}`);
            if (response.ok) {
                const data = await response.json();
                setAvailableOperations(data.data || []);
            }
            else {
                // Mock operations
                const mockOperations = [
                    {
                        id: "1",
                        product_type: "Hoodie",
                        name: "Join shoulders",
                        standard_minutes: 1.5,
                        piece_rate: 2.25,
                        depends_on: [],
                    },
                    {
                        id: "2",
                        product_type: "Hoodie",
                        name: "Attach collar",
                        standard_minutes: 2.0,
                        piece_rate: 3.0,
                        depends_on: ["Join shoulders"],
                    },
                    {
                        id: "3",
                        product_type: "Hoodie",
                        name: "Set sleeves",
                        standard_minutes: 3.5,
                        piece_rate: 5.25,
                        depends_on: ["Join shoulders"],
                    },
                    {
                        id: "4",
                        product_type: "Hoodie",
                        name: "Side seams",
                        standard_minutes: 2.8,
                        piece_rate: 4.2,
                        depends_on: ["Set sleeves"],
                    },
                    {
                        id: "5",
                        product_type: "Hoodie",
                        name: "Hood assembly",
                        standard_minutes: 4.0,
                        piece_rate: 6.0,
                        depends_on: ["Attach collar"],
                    },
                    {
                        id: "6",
                        product_type: "Hoodie",
                        name: "Pocket attachment",
                        standard_minutes: 1.8,
                        piece_rate: 2.7,
                        depends_on: ["Side seams"],
                    },
                    {
                        id: "7",
                        product_type: "Hoodie",
                        name: "Hem bottom",
                        standard_minutes: 1.2,
                        piece_rate: 1.8,
                        depends_on: ["Side seams"],
                    },
                ];
                setAvailableOperations(mockOperations);
            }
        }
        catch (error) {
            console.error("Failed to fetch operations:", error);
        }
    };
    const isOperationAvailable = (operation) => {
        if (!operation.depends_on || operation.depends_on.length === 0)
            return true;
        return operation.depends_on.every(dep => bundleProgress.some(progress => progress.operation_name === dep && progress.status === "COMPLETED"));
    };
    const handleCreateRun = async () => {
        if (!scannedBundle || !selectedOperation || !selectedOperator)
            return;
        setLoading(true);
        try {
            const runData = {
                order_id: scannedBundle.order_id,
                operation_name: selectedOperation.name,
                operator_id: selectedOperator.id,
                bundle_id: scannedBundle.id,
                routing_step_id: "temp-routing-step", // In real implementation, this would be dynamic
            };
            const response = await fetch("/api/sewing/runs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(runData),
            });
            if (response.ok) {
                const data = await response.json();
                router.push(`/sewing/runs/${data.id}`);
            }
            else {
                // For demo, just redirect to sewing page
                router.push("/sewing");
            }
        }
        catch (error) {
            console.error("Failed to create sewing run:", error);
            alert("Failed to create sewing run");
        }
        finally {
            setLoading(false);
        }
    };
    const startCameraCapture = async () => {
        setIsScanning(true);
        // In a real implementation, this would start camera capture
        // For demo, we'll simulate after 2 seconds
        setTimeout(() => {
            setQrInput("ash://bundle/demo-001");
            setIsScanning(false);
            handleQRScan();
        }, 2000);
    };
    return (<div className="container mx-auto max-w-4xl space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <link_1.default href="/sewing">
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Sewing
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-3xl font-bold">Create Sewing Run</h1>
            <p className="text-muted-foreground">
              Scan bundle QR and assign operation
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <card_1.Card>
        <card_1.CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === "scan" ? "text-blue-600" : "text-green-600"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "scan"
            ? "border-2 border-blue-600 bg-blue-100"
            : "border-2 border-green-600 bg-green-100"}`}>
                {step === "scan" ? (<lucide_react_1.QrCode className="h-4 w-4"/>) : (<lucide_react_1.CheckCircle className="h-4 w-4"/>)}
              </div>
              <span className="font-medium">Scan Bundle</span>
            </div>

            <div className={`h-0.5 flex-1 ${step === "operation" || step === "operator" || step === "confirm" ? "bg-green-600" : "bg-gray-300"}`}/>

            <div className={`flex items-center gap-2 ${step === "operation"
            ? "text-blue-600"
            : step === "operator" || step === "confirm"
                ? "text-green-600"
                : "text-muted-foreground"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "operation"
            ? "border-2 border-blue-600 bg-blue-100"
            : step === "operator" || step === "confirm"
                ? "border-2 border-green-600 bg-green-100"
                : "border-2 border-gray-300 bg-gray-100"}`}>
                {step === "operator" || step === "confirm" ? (<lucide_react_1.CheckCircle className="h-4 w-4"/>) : (<lucide_react_1.Settings className="h-4 w-4"/>)}
              </div>
              <span className="font-medium">Select Operation</span>
            </div>

            <div className={`h-0.5 flex-1 ${step === "operator" || step === "confirm" ? "bg-green-600" : "bg-gray-300"}`}/>

            <div className={`flex items-center gap-2 ${step === "operator"
            ? "text-blue-600"
            : step === "confirm"
                ? "text-green-600"
                : "text-muted-foreground"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "operator"
            ? "border-2 border-blue-600 bg-blue-100"
            : step === "confirm"
                ? "border-2 border-green-600 bg-green-100"
                : "border-2 border-gray-300 bg-gray-100"}`}>
                {step === "confirm" ? (<lucide_react_1.CheckCircle className="h-4 w-4"/>) : (<lucide_react_1.User className="h-4 w-4"/>)}
              </div>
              <span className="font-medium">Assign Operator</span>
            </div>

            <div className={`h-0.5 flex-1 ${step === "confirm" ? "bg-green-600" : "bg-gray-300"}`}/>

            <div className={`flex items-center gap-2 ${step === "confirm" ? "text-blue-600" : "text-muted-foreground"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "confirm"
            ? "border-2 border-blue-600 bg-blue-100"
            : "border-2 border-gray-300 bg-gray-100"}`}>
                <lucide_react_1.Play className="h-4 w-4"/>
              </div>
              <span className="font-medium">Confirm & Start</span>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Step Content */}
      {step === "scan" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.QrCode className="h-5 w-5"/>
              Scan Bundle QR Code
            </card_1.CardTitle>
            <card_1.CardDescription>
              Scan or enter the QR code from the printed bundle label
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="qr_input">Bundle QR Code</label_1.Label>
                  <div className="flex gap-2">
                    <input_1.Input id="qr_input" value={qrInput} onChange={e => setQrInput(e.target.value)} placeholder="ash://bundle/..." className="font-mono"/>
                    <button_1.Button variant="outline" onClick={handleQRScan} disabled={loading || !qrInput.trim()}>
                      <lucide_react_1.Search className="mr-2 h-4 w-4"/>
                      Lookup
                    </button_1.Button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="my-4">
                    <span className="text-sm text-muted-foreground">OR</span>
                  </div>

                  <button_1.Button variant="outline" className="w-full" onClick={startCameraCapture} disabled={isScanning}>
                    <lucide_react_1.Camera className="mr-2 h-4 w-4"/>
                    {isScanning ? "Scanning..." : "Use Camera Scanner"}
                  </button_1.Button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  {isScanning ? (<div className="space-y-4">
                      <lucide_react_1.Scan className="mx-auto h-12 w-12 animate-pulse text-blue-600"/>
                      <p className="text-sm text-muted-foreground">
                        Scanning for QR code...
                      </p>
                    </div>) : (<div className="space-y-4">
                      <lucide_react_1.QrCode className="mx-auto h-12 w-12 text-muted-foreground"/>
                      <p className="text-sm text-muted-foreground">
                        QR scanner will appear here
                      </p>
                    </div>)}
                </div>
              </div>
            </div>

            <alert_1.Alert>
              <lucide_react_1.AlertCircle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                Make sure the bundle QR code is clearly visible and not damaged.
                If scanning fails, you can manually enter the code.
              </alert_1.AlertDescription>
            </alert_1.Alert>
          </card_1.CardContent>
        </card_1.Card>)}

      {step === "operation" && scannedBundle && (<div className="space-y-6">
          {/* Bundle Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Package className="h-5 w-5"/>
                Bundle Information
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order
                  </p>
                  <p className="font-medium">
                    {scannedBundle.order.order_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {scannedBundle.order.brand.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Product
                  </p>
                  <p className="font-medium">
                    {scannedBundle.order.line_items[0]?.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Size: {scannedBundle.size_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Quantity
                  </p>
                  <p className="font-medium">{scannedBundle.qty} pieces</p>
                  <badge_1.Badge className={`${scannedBundle.status === "CREATED" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"} mt-1`}>
                    {scannedBundle.status.replace("_", " ")}
                  </badge_1.Badge>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Progress Status */}
          {bundleProgress.length > 0 && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Bundle Progress</card_1.CardTitle>
                <card_1.CardDescription>
                  Operations completed on this bundle
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {bundleProgress.map((progress, index) => (<div key={index} className="flex items-center gap-3 rounded-lg bg-green-50 p-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>
                      <span className="font-medium">
                        {progress.operation_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {progress.completed_at
                        ? new Date(progress.completed_at).toLocaleString()
                        : "Recently completed"}
                      </span>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Operation Selection */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Settings className="h-5 w-5"/>
                Select Next Operation
              </card_1.CardTitle>
              <card_1.CardDescription>
                Choose the sewing operation to perform on this bundle
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {availableOperations.map(operation => {
                const isAvailable = isOperationAvailable(operation);
                return (<div key={operation.id} className={`cursor-pointer rounded-lg border p-4 transition-all ${selectedOperation?.id === operation.id
                        ? "border-blue-600 bg-blue-50"
                        : isAvailable
                            ? "border-gray-200 hover:border-gray-300"
                            : "cursor-not-allowed border-gray-100 bg-gray-50"}`} onClick={() => isAvailable && setSelectedOperation(operation)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className={`font-medium ${!isAvailable ? "text-muted-foreground" : ""}`}>
                              {operation.name}
                            </h3>
                            {!isAvailable && (<badge_1.Badge variant="outline" className="border-orange-600 text-orange-600">
                                Blocked
                              </badge_1.Badge>)}
                            {selectedOperation?.id === operation.id && (<badge_1.Badge className="bg-blue-100 text-blue-800">
                                Selected
                              </badge_1.Badge>)}
                          </div>

                          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
                              <span>{operation.standard_minutes} min SMV</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
                              <span>
                                ₱{operation.piece_rate?.toFixed(2) || "N/A"} per
                                piece
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <lucide_react_1.GitBranch className="h-4 w-4 text-muted-foreground"/>
                              <span>
                                {operation.depends_on &&
                        operation.depends_on.length > 0
                        ? `After: ${operation.depends_on.join(", ")}`
                        : "Starting operation"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>);
            })}
              </div>

              <div className="mt-6 flex justify-end">
                <button_1.Button onClick={() => setStep("operator")} disabled={!selectedOperation}>
                  Continue to Operator Selection
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      {step === "operator" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.User className="h-5 w-5"/>
              Assign Operator
            </card_1.CardTitle>
            <card_1.CardDescription>
              Select the operator who will perform this operation
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {operators.map(operator => (<div key={operator.id} className={`cursor-pointer rounded-lg border p-4 transition-all ${selectedOperator?.id === operator.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"}`} onClick={() => setSelectedOperator(operator)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {operator.first_name} {operator.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {operator.employee_number} • {operator.position}
                      </p>
                    </div>
                    {selectedOperator?.id === operator.id && (<badge_1.Badge className="bg-blue-100 text-blue-800">
                        Selected
                      </badge_1.Badge>)}
                  </div>
                </div>))}
            </div>

            <div className="flex justify-between">
              <button_1.Button variant="outline" onClick={() => setStep("operation")}>
                Back to Operation
              </button_1.Button>
              <button_1.Button onClick={() => setStep("confirm")} disabled={!selectedOperator}>
                Continue to Confirmation
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {step === "confirm" &&
            scannedBundle &&
            selectedOperation &&
            selectedOperator && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Play className="h-5 w-5"/>
                Confirm & Start Run
              </card_1.CardTitle>
              <card_1.CardDescription>
                Review the details and start the sewing run
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-medium">Bundle Details</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Order:</span>{" "}
                        {scannedBundle.order.order_number}
                      </p>
                      <p>
                        <span className="font-medium">Product:</span>{" "}
                        {scannedBundle.order.line_items[0]?.description}
                      </p>
                      <p>
                        <span className="font-medium">Size:</span>{" "}
                        {scannedBundle.size_code}
                      </p>
                      <p>
                        <span className="font-medium">Quantity:</span>{" "}
                        {scannedBundle.qty} pieces
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-medium">Operation</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedOperation.name}
                      </p>
                      <p>
                        <span className="font-medium">SMV:</span>{" "}
                        {selectedOperation.standard_minutes} minutes
                      </p>
                      <p>
                        <span className="font-medium">Rate:</span> ₱
                        {selectedOperation.piece_rate?.toFixed(2) || "N/A"} per
                        piece
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-medium">Operator</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedOperator.first_name}{" "}
                        {selectedOperator.last_name}
                      </p>
                      <p>
                        <span className="font-medium">Employee #:</span>{" "}
                        {selectedOperator.employee_number}
                      </p>
                      <p>
                        <span className="font-medium">Position:</span>{" "}
                        {selectedOperator.position}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-medium">Expected Earnings</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Total SMV:</span>{" "}
                        {(selectedOperation.standard_minutes * scannedBundle.qty).toFixed(1)}{" "}
                        minutes
                      </p>
                      <p>
                        <span className="font-medium">Total Pay:</span> ₱
                        {((selectedOperation.piece_rate || 0) *
                scannedBundle.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <alert_1.Alert>
                <lucide_react_1.CheckCircle className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  Once started, the operator can track progress and mark pieces
                  as completed or rejected. Time tracking will begin
                  automatically.
                </alert_1.AlertDescription>
              </alert_1.Alert>

              <div className="flex justify-between">
                <button_1.Button variant="outline" onClick={() => setStep("operator")}>
                  Back to Operator
                </button_1.Button>
                <button_1.Button onClick={handleCreateRun} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  <lucide_react_1.Play className="mr-2 h-4 w-4"/>
                  {loading ? "Creating Run..." : "Start Sewing Run"}
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>)}
    </div>);
}
