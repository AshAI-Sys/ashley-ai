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
exports.default = CreatePrintRunPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const methodIcons = {
    SILKSCREEN: lucide_react_1.Palette,
    SUBLIMATION: lucide_react_1.Zap,
    DTF: lucide_react_1.Package2,
    EMBROIDERY: lucide_react_1.Shirt,
};
const methodDescriptions = {
    SILKSCREEN: "Screen printing with plastisol or water-based inks",
    SUBLIMATION: "Heat transfer with sublimation paper and polyester fabrics",
    DTF: "Direct-to-Film printing with powder adhesive",
    EMBROIDERY: "Machine embroidery with thread designs",
};
function CreatePrintRunPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [machines, setMachines] = (0, react_1.useState)([]);
    const [selectedOrder, setSelectedOrder] = (0, react_1.useState)(null);
    const [selectedStep, setSelectedStep] = (0, react_1.useState)("");
    const [formData, setFormData] = (0, react_1.useState)({
        routing_step_id: "",
        machine_id: "",
        method: "",
        target_qty: "",
        priority: "NORMAL",
        notes: "",
    });
    const [errors, setErrors] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        fetchOrders();
        fetchMachines();
    }, []);
    const fetchOrders = async () => {
        try {
            // Mock data for demo - in real app, fetch from API
            setOrders([
                {
                    id: "1",
                    order_number: "TCAS-2025-000001",
                    brand: { name: "Trendy Casual", code: "TCAS" },
                    line_items: [
                        {
                            id: "1",
                            description: "Premium Hoodie - Navy",
                            garment_type: "Hoodie",
                            qty: 100,
                        },
                    ],
                    routing_steps: [
                        {
                            id: "step1",
                            operation_type: "SILKSCREEN",
                            status: "ready",
                            sequence: 1,
                        },
                        {
                            id: "step2",
                            operation_type: "HEAT_CURE",
                            status: "pending",
                            sequence: 2,
                        },
                    ],
                },
                {
                    id: "2",
                    order_number: "URBN-2025-000001",
                    brand: { name: "Urban Streetwear", code: "URBN" },
                    line_items: [
                        {
                            id: "2",
                            description: "Logo T-Shirt - White",
                            garment_type: "T-Shirt",
                            qty: 50,
                        },
                    ],
                    routing_steps: [
                        {
                            id: "step3",
                            operation_type: "EMBROIDERY",
                            status: "ready",
                            sequence: 1,
                        },
                    ],
                },
            ]);
        }
        catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };
    const fetchMachines = async () => {
        try {
            const response = await fetch("/api/printing/machines");
            if (response.ok) {
                const data = await response.json();
                setMachines(data.data || []);
            }
            else {
                // Mock data
                setMachines([
                    {
                        id: "1",
                        name: "M&R Sportsman EX",
                        workcenter: "PRINTING",
                        is_active: true,
                    },
                    {
                        id: "2",
                        name: "Epson SureColor F570",
                        workcenter: "PRINTING",
                        is_active: true,
                    },
                    {
                        id: "3",
                        name: "Heat Press Pro 15x15",
                        workcenter: "HEAT_PRESS",
                        is_active: true,
                    },
                    {
                        id: "4",
                        name: "Tajima 16-Head",
                        workcenter: "EMB",
                        is_active: true,
                    },
                    {
                        id: "5",
                        name: 'Conveyor Dryer 24"',
                        workcenter: "DRYER",
                        is_active: true,
                    },
                ]);
            }
        }
        catch (error) {
            console.error("Failed to fetch machines:", error);
            setMachines([]);
        }
    };
    const handleOrderChange = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        setSelectedOrder(order || null);
        setSelectedStep("");
        setFormData({
            ...formData,
            routing_step_id: "",
            method: "",
            target_qty: order?.line_items[0]?.qty.toString() || "",
        });
    };
    const handleStepChange = (stepId) => {
        setSelectedStep(stepId);
        const step = selectedOrder?.routing_steps.find(s => s.id === stepId);
        const method = step?.operation_type === "HEAT_CURE"
            ? "SILKSCREEN"
            : step?.operation_type || "";
        setFormData({
            ...formData,
            routing_step_id: stepId,
            method: method,
        });
    };
    const getAvailableMachines = () => {
        if (!formData.method)
            return machines.filter(m => m.is_active);
        const workcenters = {
            SILKSCREEN: ["PRINTING", "DRYER"],
            SUBLIMATION: ["PRINTING", "HEAT_PRESS"],
            DTF: ["PRINTING", "HEAT_PRESS"],
            EMBROIDERY: ["EMB"],
        };
        const requiredWorkcenters = workcenters[formData.method] || [];
        return machines.filter(m => m.is_active && requiredWorkcenters.includes(m.workcenter));
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.routing_step_id)
            newErrors.routing_step_id = "Please select a routing step";
        if (!formData.machine_id)
            newErrors.machine_id = "Please select a machine";
        if (!formData.method)
            newErrors.method = "Please select a printing method";
        if (!formData.target_qty)
            newErrors.target_qty = "Target quantity is required";
        const targetQty = parseInt(formData.target_qty);
        if (targetQty <= 0)
            newErrors.target_qty = "Target quantity must be greater than 0";
        if (selectedOrder && targetQty > (selectedOrder.line_items[0]?.qty || 0)) {
            newErrors.target_qty = `Cannot exceed order quantity (${selectedOrder.line_items[0]?.qty})`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setLoading(true);
        try {
            const submitData = {
                routing_step_id: formData.routing_step_id,
                machine_id: formData.machine_id,
                method: formData.method,
                target_qty: parseInt(formData.target_qty),
                priority: formData.priority,
                notes: formData.notes || undefined,
            };
            const response = await fetch("/api/printing/runs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            });
            if (response.ok) {
                router.push("/printing");
            }
            else {
                const error = await response.json();
                console.error("Failed to create print run:", error);
                setErrors({ submit: error.error || "Failed to create print run" });
            }
        }
        catch (error) {
            console.error("Error creating print run:", error);
            setErrors({ submit: "Network error - please try again" });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="container mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <link_1.default href="/printing">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
            Back to Printing
          </button_1.Button>
        </link_1.default>
        <div>
          <h1 className="text-3xl font-bold">Create Print Run</h1>
          <p className="text-muted-foreground">
            Set up a new printing operation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Selection */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Production Order</card_1.CardTitle>
            <card_1.CardDescription>
              Select the order and routing step for this print run
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="order">Order</label_1.Label>
              <select_1.Select value={selectedOrder?.id || ""} onValueChange={handleOrderChange}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select production order"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {orders.map(order => (<select_1.SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.brand.name} (
                      {order.line_items[0]?.garment_type})
                    </select_1.SelectItem>))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            {selectedOrder && (<div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <badge_1.Badge>{selectedOrder.brand.code}</badge_1.Badge>
                  <span className="font-medium">
                    {selectedOrder.order_number}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.line_items[0]?.description} - Qty:{" "}
                  {selectedOrder.line_items[0]?.qty}
                </p>
              </div>)}

            {selectedOrder && (<div className="space-y-2">
                <label_1.Label htmlFor="step">Routing Step</label_1.Label>
                <select_1.Select value={selectedStep} onValueChange={handleStepChange}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select routing step"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {selectedOrder.routing_steps
                .filter(step => step.status === "ready")
                .map(step => (<select_1.SelectItem key={step.id} value={step.id}>
                          Step {step.sequence}:{" "}
                          {step.operation_type.replace("_", " ")}
                        </select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
                {errors.routing_step_id && (<p className="text-sm text-red-600">
                    {errors.routing_step_id}
                  </p>)}
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Method Selection */}
        {formData.routing_step_id && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Printing Method</card_1.CardTitle>
              <card_1.CardDescription>
                Choose the printing method for this run
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {formData.method ? (<div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border bg-green-50 p-4">
                    {react_1.default.createElement(methodIcons[formData.method], {
                    className: "w-6 h-6 text-green-600",
                })}
                    <div>
                      <h3 className="font-medium">{formData.method}</h3>
                      <p className="text-sm text-muted-foreground">
                        {methodDescriptions[formData.method]}
                      </p>
                    </div>
                  </div>

                  {formData.method !==
                    selectedOrder?.routing_steps.find(s => s.id === selectedStep)?.operation_type && (<div className="text-sm text-blue-600">
                      ℹ️ Method automatically selected based on routing step
                    </div>)}
                </div>) : (<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(methodIcons).map(([method, Icon]) => (<button key={method} type="button" className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50" onClick={() => setFormData({ ...formData, method })}>
                      <Icon className="h-6 w-6 text-blue-600"/>
                      <div>
                        <h3 className="font-medium">{method}</h3>
                        <p className="text-sm text-muted-foreground">
                          {methodDescriptions[method]}
                        </p>
                      </div>
                    </button>))}
                </div>)}
              {errors.method && (<p className="text-sm text-red-600">{errors.method}</p>)}
            </card_1.CardContent>
          </card_1.Card>)}

        {/* Machine & Quantity */}
        {formData.method && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Machine & Quantity</card_1.CardTitle>
              <card_1.CardDescription>
                Select machine and set target quantity
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label_1.Label htmlFor="machine">Machine</label_1.Label>
                  <select_1.Select value={formData.machine_id} onValueChange={value => setFormData({ ...formData, machine_id: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select machine"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {getAvailableMachines().map(machine => (<select_1.SelectItem key={machine.id} value={machine.id}>
                          {machine.name} (
                          {machine.workcenter?.replace("_", " ") ||
                    "No workcenter"}
                          )
                        </select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                  {errors.machine_id && (<p className="text-sm text-red-600">{errors.machine_id}</p>)}
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="target_qty">Target Quantity</label_1.Label>
                  <input_1.Input id="target_qty" type="number" min="1" value={formData.target_qty} onChange={e => setFormData({ ...formData, target_qty: e.target.value })} placeholder="100"/>
                  {errors.target_qty && (<p className="text-sm text-red-600">{errors.target_qty}</p>)}
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="priority">Priority</label_1.Label>
                <select_1.Select value={formData.priority} onValueChange={value => setFormData({ ...formData, priority: value })}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="LOW">Low</select_1.SelectItem>
                    <select_1.SelectItem value="NORMAL">Normal</select_1.SelectItem>
                    <select_1.SelectItem value="HIGH">High</select_1.SelectItem>
                    <select_1.SelectItem value="URGENT">Urgent</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="notes">Notes (optional)</label_1.Label>
                <textarea_1.Textarea id="notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Special instructions or notes for this print run..." rows={3}/>
              </div>
            </card_1.CardContent>
          </card_1.Card>)}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <link_1.default href="/printing">
            <button_1.Button type="button" variant="outline">
              Cancel
            </button_1.Button>
          </link_1.default>
          <button_1.Button type="submit" disabled={loading || !formData.method || !formData.machine_id} className="bg-blue-600 hover:bg-blue-700">
            {loading ? ("Creating...") : (<>
                <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
                Create Print Run
              </>)}
          </button_1.Button>
        </div>

        {errors.submit && (<p className="text-center text-sm text-red-600">{errors.submit}</p>)}
      </form>
    </div>);
}
