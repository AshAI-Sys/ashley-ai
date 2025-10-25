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
exports.default = DesignUploadPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const select_1 = require("@/components/ui/select");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = require("react-hot-toast");
function DesignUploadPage() {
    const router = (0, navigation_1.useRouter)();
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    // Form state
    const [formData, setFormData] = (0, react_1.useState)({
        order_id: "",
        name: "",
        method: "",
        files: {
            mockup_url: "",
            prod_url: "",
            separations: [],
            dst_url: "",
        },
        palette: [],
        meta: {
            dpi: 300,
            notes: "",
        },
    });
    const [placements, setPlacements] = (0, react_1.useState)([
        {
            id: "1",
            area: "front",
            width_cm: 20,
            height_cm: 25,
            offset_x: 0,
            offset_y: 5,
        },
    ]);
    (0, react_1.useEffect)(() => {
        fetchOrders();
    }, []);
    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders?include=brand,client&status=INTAKE,DESIGN_PENDING");
            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
            }
        }
        catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };
    const selectedOrder = orders.find(o => o.id === formData.order_id);
    const addPlacement = () => {
        const newId = (placements.length + 1).toString();
        setPlacements([
            ...placements,
            {
                id: newId,
                area: "front",
                width_cm: 20,
                height_cm: 25,
                offset_x: 0,
                offset_y: 5,
            },
        ]);
    };
    const removePlacement = (id) => {
        if (placements.length > 1) {
            setPlacements(placements.filter(p => p.id !== id));
        }
    };
    const updatePlacement = (id, field, value) => {
        setPlacements(placements.map(placement => placement.id === id ? { ...placement, [field]: value } : placement));
    };
    const addSeparation = () => {
        setFormData({
            ...formData,
            files: {
                ...formData.files,
                separations: [...formData.files.separations, ""],
            },
        });
    };
    const updateSeparation = (index, value) => {
        const newSeparations = [...formData.files.separations];
        newSeparations[index] = value;
        setFormData({
            ...formData,
            files: {
                ...formData.files,
                separations: newSeparations,
            },
        });
    };
    const removeSeparation = (index) => {
        setFormData({
            ...formData,
            files: {
                ...formData.files,
                separations: formData.files.separations.filter((_, i) => i !== index),
            },
        });
    };
    const addColor = () => {
        setFormData({
            ...formData,
            palette: [...formData.palette, "#000000"],
        });
    };
    const updateColor = (index, color) => {
        const newPalette = [...formData.palette];
        newPalette[index] = color;
        setFormData({
            ...formData,
            palette: newPalette,
        });
    };
    const removeColor = (index) => {
        setFormData({
            ...formData,
            palette: formData.palette.filter((_, i) => i !== index),
        });
    };
    const validateForm = () => {
        if (!formData.order_id) {
            react_hot_toast_1.toast.error("Please select an order");
            return false;
        }
        if (!formData.name.trim()) {
            react_hot_toast_1.toast.error("Please enter a design name");
            return false;
        }
        if (!formData.method) {
            react_hot_toast_1.toast.error("Please select a printing method");
            return false;
        }
        if (!formData.files.mockup_url && !formData.files.prod_url) {
            react_hot_toast_1.toast.error("Please provide at least a mockup or production file");
            return false;
        }
        return true;
    };
    const handleSubmit = async (isDraft = false) => {
        if (!validateForm())
            return;
        setSubmitting(true);
        try {
            const designData = {
                ...formData,
                placements: placements.map(({ id, ...placement }) => placement),
                palette: formData.palette.length > 0 ? formData.palette : undefined,
            };
            const response = await fetch("/api/designs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(designData),
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success(`Design ${isDraft ? "saved as draft" : "uploaded successfully"}`);
                router.push(`/designs/${result.asset_id}`);
            }
            else {
                react_hot_toast_1.toast.error(result.message || "Failed to upload design");
            }
        }
        catch (error) {
            console.error("Submit error:", error);
            react_hot_toast_1.toast.error("Failed to upload design");
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload Design</h1>
        <p className="text-muted-foreground">
          Create a new design asset with files and specifications
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Basic Information</card_1.CardTitle>
              <card_1.CardDescription>
                Link this design to an order and provide basic details
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <label_1.Label htmlFor="order">Order *</label_1.Label>
                <select_1.Select value={formData.order_id} onValueChange={value => setFormData({ ...formData, order_id: value })}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select order"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {orders.map(order => (<select_1.SelectItem key={order.id} value={order.id}>
                        {order.order_number} - {order.client.name} (
                        {order.brand.name})
                      </select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
                {selectedOrder && (<div className="mt-2 text-sm text-muted-foreground">
                    Brand: {selectedOrder.brand.name} (
                    {selectedOrder.brand.code})
                  </div>)}
              </div>

              <div>
                <label_1.Label htmlFor="name">Design Name *</label_1.Label>
                <input_1.Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Summer Collection Logo"/>
              </div>

              <div>
                <label_1.Label htmlFor="method">Printing Method *</label_1.Label>
                <select_1.Select value={formData.method} onValueChange={value => setFormData({ ...formData, method: value })}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select method"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="SILKSCREEN">Silkscreen</select_1.SelectItem>
                    <select_1.SelectItem value="SUBLIMATION">Sublimation</select_1.SelectItem>
                    <select_1.SelectItem value="DTF">DTF (Direct to Film)</select_1.SelectItem>
                    <select_1.SelectItem value="EMBROIDERY">Embroidery</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Design Files */}
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle>Design Files</card_1.CardTitle>
                  <card_1.CardDescription>
                    Upload or link to your design files
                  </card_1.CardDescription>
                </div>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <label_1.Label>Mockup File (Preview)</label_1.Label>
                <input_1.Input type="url" value={formData.files.mockup_url} onChange={e => setFormData({
            ...formData,
            files: { ...formData.files, mockup_url: e.target.value },
        })} placeholder="https://example.com/mockup.jpg"/>
              </div>

              <div>
                <label_1.Label>Production File</label_1.Label>
                <input_1.Input type="url" value={formData.files.prod_url} onChange={e => setFormData({
            ...formData,
            files: { ...formData.files, prod_url: e.target.value },
        })} placeholder="https://example.com/design.ai"/>
              </div>

              {formData.method === "SILKSCREEN" && (<div>
                  <div className="mb-2 flex items-center justify-between">
                    <label_1.Label>Color Separations</label_1.Label>
                    <button_1.Button type="button" onClick={addSeparation} size="sm" variant="outline">
                      <lucide_react_1.Plus className="h-4 w-4"/>
                    </button_1.Button>
                  </div>
                  {formData.files.separations.map((separation, index) => (<div key={index} className="mb-2 flex gap-2">
                      <input_1.Input type="url" value={separation} onChange={e => updateSeparation(index, e.target.value)} placeholder={`Color ${index + 1} separation URL`}/>
                      <button_1.Button type="button" onClick={() => removeSeparation(index)} size="sm" variant="outline">
                        <lucide_react_1.Minus className="h-4 w-4"/>
                      </button_1.Button>
                    </div>))}
                </div>)}

              {formData.method === "EMBROIDERY" && (<div>
                  <label_1.Label>Embroidery File (.dst, .emb)</label_1.Label>
                  <input_1.Input type="url" value={formData.files.dst_url} onChange={e => setFormData({
                ...formData,
                files: { ...formData.files, dst_url: e.target.value },
            })} placeholder="https://example.com/design.dst"/>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>

          {/* Placements */}
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle>Design Placements</card_1.CardTitle>
                  <card_1.CardDescription>
                    Specify where and how the design will be placed
                  </card_1.CardDescription>
                </div>
                <button_1.Button onClick={addPlacement} size="sm" variant="outline">
                  <lucide_react_1.Plus className="mr-1 h-4 w-4"/>
                  Add Placement
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {placements.map((placement, index) => (<div key={placement.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Placement {index + 1}</h4>
                    {placements.length > 1 && (<button_1.Button variant="outline" size="sm" onClick={() => removePlacement(placement.id)}>
                        <lucide_react_1.Minus className="h-4 w-4"/>
                      </button_1.Button>)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div>
                      <label_1.Label>Area</label_1.Label>
                      <select_1.Select value={placement.area} onValueChange={value => updatePlacement(placement.id, "area", value)}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="front">Front</select_1.SelectItem>
                          <select_1.SelectItem value="back">Back</select_1.SelectItem>
                          <select_1.SelectItem value="left_chest">Left Chest</select_1.SelectItem>
                          <select_1.SelectItem value="sleeve">Sleeve</select_1.SelectItem>
                          <select_1.SelectItem value="all_over">All Over</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>

                    <div>
                      <label_1.Label>Width (cm)</label_1.Label>
                      <input_1.Input type="number" value={placement.width_cm} onChange={e => updatePlacement(placement.id, "width_cm", parseFloat(e.target.value) || 0)} min="0" step="0.1"/>
                    </div>

                    <div>
                      <label_1.Label>Height (cm)</label_1.Label>
                      <input_1.Input type="number" value={placement.height_cm} onChange={e => updatePlacement(placement.id, "height_cm", parseFloat(e.target.value) || 0)} min="0" step="0.1"/>
                    </div>

                    <div>
                      <label_1.Label>Offset X (cm)</label_1.Label>
                      <input_1.Input type="number" value={placement.offset_x} onChange={e => updatePlacement(placement.id, "offset_x", parseFloat(e.target.value) || 0)} step="0.1"/>
                    </div>

                    <div>
                      <label_1.Label>Offset Y (cm)</label_1.Label>
                      <input_1.Input type="number" value={placement.offset_y} onChange={e => updatePlacement(placement.id, "offset_y", parseFloat(e.target.value) || 0)} step="0.1"/>
                    </div>
                  </div>
                </div>))}
            </card_1.CardContent>
          </card_1.Card>

          {/* Additional Details */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Additional Details</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label_1.Label>Color Palette</label_1.Label>
                  <button_1.Button type="button" onClick={addColor} size="sm" variant="outline">
                    <lucide_react_1.Plus className="h-4 w-4"/>
                  </button_1.Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.palette.map((color, index) => (<div key={index} className="flex items-center gap-2">
                      <input type="color" value={color} onChange={e => updateColor(index, e.target.value)} className="h-8 w-8 rounded border border-gray-300"/>
                      <input_1.Input type="text" value={color} onChange={e => updateColor(index, e.target.value)} className="w-20 text-xs"/>
                      <button_1.Button type="button" onClick={() => removeColor(index)} size="sm" variant="outline">
                        <lucide_react_1.Minus className="h-4 w-4"/>
                      </button_1.Button>
                    </div>))}
                </div>
              </div>

              <div>
                <label_1.Label>DPI/Resolution</label_1.Label>
                <input_1.Input type="number" value={formData.meta.dpi} onChange={e => setFormData({
            ...formData,
            meta: {
                ...formData.meta,
                dpi: parseInt(e.target.value) || 300,
            },
        })} min="72"/>
              </div>

              <div>
                <label_1.Label>Notes</label_1.Label>
                <textarea_1.Textarea value={formData.meta.notes} onChange={e => setFormData({
            ...formData,
            meta: { ...formData.meta, notes: e.target.value },
        })} placeholder="Any special instructions or notes about this design..." rows={3}/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Preview */}
          {formData.files.mockup_url && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Preview</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <img src={formData.files.mockup_url} alt="Design preview" className="w-full rounded-lg" onError={e => {
                e.target.style.display = "none";
            }}/>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Actions */}
          <card_1.Card>
            <card_1.CardContent className="space-y-3 pt-6">
              <button_1.Button onClick={() => handleSubmit(true)} variant="outline" className="w-full" disabled={submitting}>
                <lucide_react_1.Save className="mr-2 h-4 w-4"/>
                Save as Draft
              </button_1.Button>

              <button_1.Button onClick={() => handleSubmit(false)} className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                <lucide_react_1.Upload className="mr-2 h-4 w-4"/>
                Upload Design
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Method Information */}
          {formData.method && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Method Guidelines</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="text-sm">
                {formData.method === "SILKSCREEN" && (<div>
                    <p className="mb-2">For silkscreen printing:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Provide color separations for each ink color</li>
                      <li>Maximum 6 colors recommended</li>
                      <li>Use vector files when possible</li>
                      <li>Consider ink opacity and blending</li>
                    </ul>
                  </div>)}

                {formData.method === "SUBLIMATION" && (<div>
                    <p className="mb-2">For sublimation printing:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Works best on polyester fabrics</li>
                      <li>Full color designs are supported</li>
                      <li>High resolution required (300+ DPI)</li>
                      <li>Colors may appear lighter on final product</li>
                    </ul>
                  </div>)}

                {formData.method === "DTF" && (<div>
                    <p className="mb-2">For DTF printing:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Works on most fabric types</li>
                      <li>Full color support with white ink</li>
                      <li>PNG with transparent background preferred</li>
                      <li>Consider stretch and durability</li>
                    </ul>
                  </div>)}

                {formData.method === "EMBROIDERY" && (<div>
                    <p className="mb-2">For embroidery:</p>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Provide digitized embroidery file (.dst)</li>
                      <li>Consider stitch count for cost</li>
                      <li>Limited fine detail capability</li>
                      <li>Thread color chart reference needed</li>
                    </ul>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>)}
        </div>
      </div>
    </div>);
}
