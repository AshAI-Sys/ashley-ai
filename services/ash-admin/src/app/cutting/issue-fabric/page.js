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
exports.default = IssueFabricPage;
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
function IssueFabricPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [fabricBatches, setFabricBatches] = (0, react_1.useState)([]);
    const [selectedOrder, setSelectedOrder] = (0, react_1.useState)(null);
    const [selectedBatch, setSelectedBatch] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        order_id: '',
        batch_id: '',
        qty_issued: '',
        uom: 'KG'
    });
    const [errors, setErrors] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        fetchOrders();
        fetchFabricBatches();
    }, []);
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
                            garment_type: 'Hoodie'
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
                            garment_type: 'T-Shirt'
                        }
                    ]
                }
            ]);
        }
        catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };
    const fetchFabricBatches = async () => {
        try {
            const response = await fetch('/api/cutting/fabric-batches');
            if (response.ok) {
                const data = await response.json();
                setFabricBatches(data.data || []);
            }
            else {
                // Use mock data if API fails
                setFabricBatches([
                    {
                        id: '1',
                        lot_no: 'LOT-2025-001',
                        uom: 'KG',
                        qty_on_hand: 45.5,
                        gsm: 280,
                        width_cm: 160,
                        brand: { name: 'Trendy Casual', code: 'TCAS' },
                        created_at: new Date().toISOString()
                    },
                    {
                        id: '2',
                        lot_no: 'LOT-2025-002',
                        uom: 'M',
                        qty_on_hand: 120.0,
                        gsm: 180,
                        width_cm: 150,
                        brand: { name: 'Urban Streetwear', code: 'URBN' },
                        created_at: new Date().toISOString()
                    }
                ]);
            }
        }
        catch (error) {
            console.error('Failed to fetch fabric batches:', error);
            // Use mock data as fallback
            setFabricBatches([
                {
                    id: '1',
                    lot_no: 'LOT-2025-001',
                    uom: 'KG',
                    qty_on_hand: 45.5,
                    gsm: 280,
                    width_cm: 160,
                    brand: { name: 'Trendy Casual', code: 'TCAS' },
                    created_at: new Date().toISOString()
                }
            ]);
        }
    };
    const handleOrderChange = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        setSelectedOrder(order || null);
        setFormData({ ...formData, order_id: orderId });
        // Filter batches by brand if order selected
        if (order) {
            // In a real app, you might want to filter batches by brand
            // For demo, we'll just keep all batches visible
        }
    };
    const handleBatchChange = (batchId) => {
        const batch = fabricBatches.find(b => b.id === batchId);
        setSelectedBatch(batch || null);
        setFormData({
            ...formData,
            batch_id: batchId,
            uom: batch?.uom || 'KG'
        });
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.order_id)
            newErrors.order_id = 'Please select an order';
        if (!formData.batch_id)
            newErrors.batch_id = 'Please select a fabric batch';
        if (!formData.qty_issued)
            newErrors.qty_issued = 'Quantity to issue is required';
        const qtyIssued = parseFloat(formData.qty_issued);
        if (selectedBatch && qtyIssued > selectedBatch.qty_on_hand) {
            newErrors.qty_issued = `Cannot issue more than available quantity (${selectedBatch.qty_on_hand} ${selectedBatch.uom})`;
        }
        if (qtyIssued <= 0) {
            newErrors.qty_issued = 'Quantity must be greater than 0';
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
                order_id: formData.order_id,
                batch_id: formData.batch_id,
                qty_issued: parseFloat(formData.qty_issued),
                uom: formData.uom
            };
            const response = await fetch('/api/cutting/issues', {
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
                console.error('Failed to issue fabric:', error);
                setErrors({ submit: error.error || 'Failed to issue fabric' });
            }
        }
        catch (error) {
            console.error('Error issuing fabric:', error);
            setErrors({ submit: 'Network error - please try again' });
        }
        finally {
            setLoading(false);
        }
    };
    const availableQuantity = selectedBatch?.qty_on_hand || 0;
    const requestedQuantity = parseFloat(formData.qty_issued) || 0;
    const remainingQuantity = availableQuantity - requestedQuantity;
    return (<div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <link_1.default href="/cutting">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
            Back to Cutting
          </button_1.Button>
        </link_1.default>
        <div>
          <h1 className="text-3xl font-bold">Issue Fabric to Cutting</h1>
          <p className="text-muted-foreground">Transfer fabric from warehouse to cutting floor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Selection */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Production Order</card_1.CardTitle>
            <card_1.CardDescription>Select the order that will use this fabric</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="order">Order</label_1.Label>
              <select_1.Select value={formData.order_id} onValueChange={handleOrderChange}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select production order"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {orders.map((order) => (<select_1.SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.brand.name} ({order.line_items[0]?.garment_type})
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

        {/* Fabric Batch Selection */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Fabric Batch</card_1.CardTitle>
            <card_1.CardDescription>Choose the fabric batch to issue</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="batch">Available Batches</label_1.Label>
              <select_1.Select value={formData.batch_id} onValueChange={handleBatchChange}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select fabric batch"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {fabricBatches.map((batch) => (<select_1.SelectItem key={batch.id} value={batch.id}>
                      {batch.lot_no} - {batch.qty_on_hand} {batch.uom} available
                      {batch.gsm && batch.width_cm && ` (${batch.gsm}GSM, ${batch.width_cm}cm)`}
                    </select_1.SelectItem>))}
                </select_1.SelectContent>
              </select_1.Select>
              {errors.batch_id && <p className="text-red-600 text-sm">{errors.batch_id}</p>}
            </div>

            {selectedBatch && (<div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <lucide_react_1.Package className="w-5 h-5 text-green-600"/>
                  <span className="font-medium">{selectedBatch.lot_no}</span>
                  <badge_1.Badge variant="outline">{selectedBatch.brand.name}</badge_1.Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <span className="font-medium">Available:</span><br />
                    <span className="text-lg font-bold text-green-600">
                      {selectedBatch.qty_on_hand} {selectedBatch.uom}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">GSM:</span><br />
                    {selectedBatch.gsm || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Width:</span><br />
                    {selectedBatch.width_cm ? `${selectedBatch.width_cm} cm` : 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Received:</span><br />
                    {new Date(selectedBatch.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Quantity to Issue */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Issue Quantity</card_1.CardTitle>
            <card_1.CardDescription>Specify how much fabric to transfer to cutting</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="qty_issued">Quantity to Issue *</label_1.Label>
                <input_1.Input id="qty_issued" type="number" step="0.01" value={formData.qty_issued} onChange={(e) => setFormData({ ...formData, qty_issued: e.target.value })} placeholder="15.5" required/>
                {errors.qty_issued && <p className="text-red-600 text-sm">{errors.qty_issued}</p>}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="uom">Unit of Measure</label_1.Label>
                <input_1.Input id="uom" value={formData.uom} disabled className="bg-gray-50"/>
                <p className="text-sm text-muted-foreground">
                  Unit is determined by the selected batch
                </p>
              </div>
            </div>

            {/* Quantity Summary */}
            {selectedBatch && requestedQuantity > 0 && (<div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Issue Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Available:</span><br />
                    <span className="font-medium">{availableQuantity} {formData.uom}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To Issue:</span><br />
                    <span className="font-medium text-blue-600">{requestedQuantity} {formData.uom}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span><br />
                    <span className={`font-medium ${remainingQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {remainingQuantity} {formData.uom}
                    </span>
                  </div>
                </div>

                {remainingQuantity < 0 && (<div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <lucide_react_1.AlertTriangle className="w-5 h-5 text-red-600 mt-0.5"/>
                    <div>
                      <p className="font-medium text-red-800">Insufficient Quantity</p>
                      <p className="text-sm text-red-700">
                        You are trying to issue more fabric than available in this batch.
                      </p>
                    </div>
                  </div>)}

                {remainingQuantity >= 0 && requestedQuantity > 0 && (<div className="flex items-start gap-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <lucide_react_1.CheckCircle className="w-5 h-5 text-green-600 mt-0.5"/>
                    <div>
                      <p className="font-medium text-green-800">Ready to Issue</p>
                      <p className="text-sm text-green-700">
                        This fabric will be transferred from warehouse to cutting floor.
                      </p>
                    </div>
                  </div>)}
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <link_1.default href="/cutting">
            <button_1.Button type="button" variant="outline">Cancel</button_1.Button>
          </link_1.default>
          <button_1.Button type="submit" disabled={loading || remainingQuantity < 0} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Processing...' : 'Issue Fabric'}
          </button_1.Button>
        </div>

        {errors.submit && (<p className="text-red-600 text-sm text-center">{errors.submit}</p>)}
      </form>
    </div>);
}
