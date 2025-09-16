'use client';
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
exports.default = CreateLayPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
function CreateLayPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [selectedOrder, setSelectedOrder] = (0, react_1.useState)(null);
    // Form state
    const [formData, setFormData] = (0, react_1.useState)({
        order_id: '',
        marker_name: '',
        marker_width_cm: '',
        lay_length_m: '',
        plies: '',
        gross_used: '',
        offcuts: '',
        defects: '',
        uom: 'KG'
    });
    const [outputs, setOutputs] = (0, react_1.useState)([
        { size_code: 'S', qty: 0 },
        { size_code: 'M', qty: 0 },
        { size_code: 'L', qty: 0 },
        { size_code: 'XL', qty: 0 }
    ]);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [calculations, setCalculations] = (0, react_1.useState)({
        expectedPieces: 0,
        totalCut: 0,
        efficiency: 0,
        waste: 0
    });
    (0, react_1.useEffect)(() => {
        fetchOrders();
    }, []);
    (0, react_1.useEffect)(() => {
        calculateMetrics();
    }, [formData, outputs]);
    const fetchOrders = async () => {
        try {
            // Mock data for demo - in real app, fetch from API
            setOrders([
                {
                    id: '1',
                    order_number: 'TCAS-2025-000001',
                    brand: { name: 'Trendy Casual', code: 'TCAS' },
                    line_items: [
                        {
                            description: 'Premium Hoodie',
                            garment_type: 'Hoodie',
                            size_breakdown: '{"S":30,"M":60,"L":60,"XL":30}'
                        }
                    ]
                },
                {
                    id: '2',
                    order_number: 'URBN-2025-000001',
                    brand: { name: 'Urban Streetwear', code: 'URBN' },
                    line_items: [
                        {
                            description: 'Street T-Shirt',
                            garment_type: 'T-Shirt',
                            size_breakdown: '{"S":25,"M":50,"L":50,"XL":25}'
                        }
                    ]
                }
            ]);
        }
        catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };
    const calculateMetrics = () => {
        const width = parseFloat(formData.marker_width_cm) || 0;
        const length = parseFloat(formData.lay_length_m) || 0;
        const plies = parseInt(formData.plies) || 0;
        const grossUsed = parseFloat(formData.gross_used) || 0;
        const offcuts = parseFloat(formData.offcuts) || 0;
        const defects = parseFloat(formData.defects) || 0;
        const totalCut = outputs.reduce((sum, output) => sum + output.qty, 0);
        // Rough calculation - in real app, use pattern areas
        const expectedPieces = width && length && plies ? Math.floor((width * length * plies) / 2500) : 0; // 2500 cm² per piece estimate
        const efficiency = grossUsed > 0 ? Math.round(((grossUsed - offcuts - defects) / grossUsed) * 100) : 0;
        const waste = grossUsed > 0 ? Math.round(((offcuts + defects) / grossUsed) * 100) : 0;
        setCalculations({
            expectedPieces,
            totalCut,
            efficiency,
            waste
        });
    };
    const handleOrderChange = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        setSelectedOrder(order || null);
        setFormData({ ...formData, order_id: orderId });
        if (order && order.line_items[0]?.size_breakdown) {
            try {
                const sizeBreakdown = JSON.parse(order.line_items[0].size_breakdown);
                const newOutputs = Object.entries(sizeBreakdown).map(([size, qty]) => ({
                    size_code: size,
                    qty: 0 // Start with 0, user will fill in actual cut quantities
                }));
                setOutputs(newOutputs);
            }
            catch (e) {
                // Fallback to default sizes if parsing fails
            }
        }
    };
    const handleOutputChange = (index, field, value) => {
        const newOutputs = [...outputs];
        newOutputs[index] = { ...newOutputs[index], [field]: value };
        setOutputs(newOutputs);
    };
    const addOutput = () => {
        setOutputs([...outputs, { size_code: '', qty: 0 }]);
    };
    const removeOutput = (index) => {
        if (outputs.length > 1) {
            setOutputs(outputs.filter((_, i) => i !== index));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.order_id)
            newErrors.order_id = 'Please select an order';
        if (!formData.lay_length_m)
            newErrors.lay_length_m = 'Lay length is required';
        if (!formData.plies)
            newErrors.plies = 'Number of plies is required';
        if (!formData.gross_used)
            newErrors.gross_used = 'Gross fabric used is required';
        const totalCut = outputs.reduce((sum, output) => sum + output.qty, 0);
        if (totalCut === 0)
            newErrors.outputs = 'At least one size output is required';
        // Validate each output
        outputs.forEach((output, index) => {
            if (!output.size_code.trim()) {
                newErrors[`output_${index}_size`] = 'Size code is required';
            }
        });
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
                ...formData,
                marker_width_cm: formData.marker_width_cm ? parseInt(formData.marker_width_cm) : null,
                lay_length_m: parseFloat(formData.lay_length_m),
                plies: parseInt(formData.plies),
                gross_used: parseFloat(formData.gross_used),
                offcuts: formData.offcuts ? parseFloat(formData.offcuts) : 0,
                defects: formData.defects ? parseFloat(formData.defects) : 0,
                outputs: outputs.filter(o => o.size_code && o.qty > 0)
            };
            const response = await fetch('/api/cutting/lays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });
            if (response.ok) {
                const result = await response.json();
                router.push('/cutting');
            }
            else {
                const error = await response.json();
                console.error('Failed to create lay:', error);
                setErrors({ submit: error.error || 'Failed to create lay' });
            }
        }
        catch (error) {
            console.error('Error creating lay:', error);
            setErrors({ submit: 'Network error - please try again' });
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <link_1.default href="/cutting">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
            Back to Cutting
          </button_1.Button>
        </link_1.default>
        <div>
          <h1 className="text-3xl font-bold">Create Cut Lay</h1>
          <p className="text-muted-foreground">Record lay dimensions and piece outputs</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Selection */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Order Information</card_1.CardTitle>
            <card_1.CardDescription>Select the production order for this lay</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="order">Production Order</label_1.Label>
              <select_1.Select value={formData.order_id} onValueChange={handleOrderChange}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select order"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {orders.map((order) => (<select_1.SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.brand.name}
                    </select_1.SelectItem>))}
                </select_1.SelectContent>
              </select_1.Select>
              {errors.order_id && <p className="text-red-600 text-sm">{errors.order_id}</p>}
            </div>

            {selectedOrder && (<div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <badge_1.Badge>{selectedOrder.brand.code}</badge_1.Badge>
                  <span className="font-medium">{selectedOrder.order_number}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.line_items[0]?.description} ({selectedOrder.line_items[0]?.garment_type})
                </p>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Lay Setup */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Lay Setup</card_1.CardTitle>
            <card_1.CardDescription>Configure marker and lay parameters</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="marker_name">Marker Name (optional)</label_1.Label>
                <input_1.Input id="marker_name" value={formData.marker_name} onChange={(e) => setFormData({ ...formData, marker_name: e.target.value })} placeholder="e.g., Hoodie Marker V2"/>
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="marker_width_cm">Marker Width (cm, optional)</label_1.Label>
                <input_1.Input id="marker_width_cm" type="number" value={formData.marker_width_cm} onChange={(e) => setFormData({ ...formData, marker_width_cm: e.target.value })} placeholder="160"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="lay_length_m">Lay Length (meters) *</label_1.Label>
                <input_1.Input id="lay_length_m" type="number" step="0.1" value={formData.lay_length_m} onChange={(e) => setFormData({ ...formData, lay_length_m: e.target.value })} placeholder="25.5" required/>
                {errors.lay_length_m && <p className="text-red-600 text-sm">{errors.lay_length_m}</p>}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="plies">Number of Plies *</label_1.Label>
                <input_1.Input id="plies" type="number" value={formData.plies} onChange={(e) => setFormData({ ...formData, plies: e.target.value })} placeholder="12" required/>
                {errors.plies && <p className="text-red-600 text-sm">{errors.plies}</p>}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="uom">Unit of Measure</label_1.Label>
                <select_1.Select value={formData.uom} onValueChange={(value) => setFormData({ ...formData, uom: value })}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="KG">Kilograms (KG)</select_1.SelectItem>
                    <select_1.SelectItem value="M">Meters (M)</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Fabric Usage */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Fabric Usage</card_1.CardTitle>
            <card_1.CardDescription>Record fabric consumption and waste</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="gross_used">Gross Used ({formData.uom}) *</label_1.Label>
                <input_1.Input id="gross_used" type="number" step="0.01" value={formData.gross_used} onChange={(e) => setFormData({ ...formData, gross_used: e.target.value })} placeholder="18.2" required/>
                {errors.gross_used && <p className="text-red-600 text-sm">{errors.gross_used}</p>}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="offcuts">Offcuts ({formData.uom})</label_1.Label>
                <input_1.Input id="offcuts" type="number" step="0.01" value={formData.offcuts} onChange={(e) => setFormData({ ...formData, offcuts: e.target.value })} placeholder="0.8"/>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="defects">Defects ({formData.uom})</label_1.Label>
                <input_1.Input id="defects" type="number" step="0.01" value={formData.defects} onChange={(e) => setFormData({ ...formData, defects: e.target.value })} placeholder="0.2"/>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Size Outputs */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Piece Outputs by Size</card_1.CardTitle>
            <card_1.CardDescription>Record actual pieces cut for each size</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {outputs.map((output, index) => (<div key={index} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label_1.Label htmlFor={`size_${index}`}>Size Code</label_1.Label>
                  <input_1.Input id={`size_${index}`} value={output.size_code} onChange={(e) => handleOutputChange(index, 'size_code', e.target.value)} placeholder="M" required/>
                  {errors[`output_${index}_size`] && (<p className="text-red-600 text-sm">{errors[`output_${index}_size`]}</p>)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <label_1.Label htmlFor={`qty_${index}`}>Quantity</label_1.Label>
                  <input_1.Input id={`qty_${index}`} type="number" value={output.qty} onChange={(e) => handleOutputChange(index, 'qty', parseInt(e.target.value) || 0)} placeholder="48"/>
                </div>
                
                <button_1.Button type="button" variant="outline" size="sm" onClick={() => removeOutput(index)} disabled={outputs.length <= 1}>
                  <lucide_react_1.Trash2 className="w-4 h-4"/>
                </button_1.Button>
              </div>))}
            
            <button_1.Button type="button" variant="outline" onClick={addOutput} className="w-full">
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              Add Size
            </button_1.Button>
            
            {errors.outputs && <p className="text-red-600 text-sm">{errors.outputs}</p>}
          </card_1.CardContent>
        </card_1.Card>

        {/* Calculations */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Calculator className="w-5 h-5"/>
              Lay Calculations
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{calculations.totalCut}</p>
                <p className="text-sm text-muted-foreground">Total Cut</p>
              </div>
              
              <div className={`text-center p-3 rounded-lg ${calculations.efficiency >= 78 ? 'bg-green-50' : 'bg-orange-50'}`}>
                <p className={`text-2xl font-bold ${calculations.efficiency >= 78 ? 'text-green-600' : 'text-orange-600'}`}>
                  {calculations.efficiency}%
                </p>
                <p className="text-sm text-muted-foreground">Efficiency</p>
              </div>
              
              <div className={`text-center p-3 rounded-lg ${calculations.waste <= 8 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-2xl font-bold ${calculations.waste <= 8 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculations.waste}%
                </p>
                <p className="text-sm text-muted-foreground">Waste</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{calculations.expectedPieces}</p>
                <p className="text-sm text-muted-foreground">Est. Pieces</p>
              </div>
            </div>
            
            {calculations.efficiency < 78 && (<div className="flex items-start gap-2 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <lucide_react_1.AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5"/>
                <div>
                  <p className="font-medium text-orange-800">Low Efficiency Warning</p>
                  <p className="text-sm text-orange-700">
                    Efficiency is below 78% threshold. Consider checking marker placement or fabric relaxation.
                  </p>
                </div>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <link_1.default href="/cutting">
            <button_1.Button type="button" variant="outline">Cancel</button_1.Button>
          </link_1.default>
          <button_1.Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Creating...' : 'Create Lay'}
          </button_1.Button>
        </div>

        {errors.submit && (<p className="text-red-600 text-sm text-center">{errors.submit}</p>)}
      </form>
    </div>);
}
