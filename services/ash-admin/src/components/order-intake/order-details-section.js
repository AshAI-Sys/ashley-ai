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
exports.OrderDetailsSection = OrderDetailsSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const dialog_1 = require("@/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
const ORDER_TYPES = [
    { value: "NEW", label: "New Order", description: "First time production" },
    { value: "REORDER", label: "Reorder", description: "Repeat production" },
];
const SIZE_DISTRIBUTION_TYPES = [
    { value: "BOXTYPE", label: "Boxtype", description: "Standard fit sizing" },
    { value: "OVERSIZED", label: "Oversized", description: "Loose/relaxed fit" },
];
const DEFAULT_FABRIC_TYPES = [
    { value: "cotton", label: "Cotton" },
    { value: "polyester", label: "Polyester" },
    { value: "cotton-poly", label: "Cotton/Poly Blend" },
    { value: "dri-fit", label: "Dri-Fit/Performance" },
    { value: "jersey", label: "Jersey" },
    { value: "pique", label: "Pique" },
    { value: "fleece", label: "Fleece" },
    { value: "20tc-direct", label: "20TC Direct" },
    { value: "20tc-reactive", label: "20TC Reactive" },
    { value: "20cvc-direct", label: "20CVC Direct" },
    { value: "20cvc-reactive", label: "20CVC Reactive" },
];
function OrderDetailsSection({ poNumber, orderType, designName, fabricType, sizeDistributionType, onPoNumberChange, onOrderTypeChange, onDesignNameChange, onFabricTypeChange, onSizeDistributionTypeChange, }) {
    // State for fabric type management
    const [fabricTypes, setFabricTypes] = (0, react_1.useState)(DEFAULT_FABRIC_TYPES);
    const [showFabricDialog, setShowFabricDialog] = (0, react_1.useState)(false);
    const [newFabricName, setNewFabricName] = (0, react_1.useState)("");
    const [editingFabricIndex, setEditingFabricIndex] = (0, react_1.useState)(null);
    // State for size distribution management
    const [sizeDistributionTypes, setSizeDistributionTypes] = (0, react_1.useState)(SIZE_DISTRIBUTION_TYPES);
    const [showSizeDialog, setShowSizeDialog] = (0, react_1.useState)(false);
    const [newSizeLabel, setNewSizeLabel] = (0, react_1.useState)("");
    const [newSizeDescription, setNewSizeDescription] = (0, react_1.useState)("");
    const [editingSizeIndex, setEditingSizeIndex] = (0, react_1.useState)(null);
    // Auto-generate PO number on component mount
    react_1.default.useEffect(() => {
        if (!poNumber) {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0");
            const generatedPO = `PO-${year}${month}-${random}`;
            onPoNumberChange(generatedPO);
        }
    }, []);
    const handleAddFabricType = () => {
        if (!newFabricName.trim())
            return;
        const value = newFabricName.toLowerCase().replace(/\s+/g, "-");
        const newFabric = { value, label: newFabricName.trim() };
        if (editingFabricIndex !== null) {
            // Edit existing
            const updated = [...fabricTypes];
            updated[editingFabricIndex] = newFabric;
            setFabricTypes(updated);
            setEditingFabricIndex(null);
        }
        else {
            // Add new
            setFabricTypes([...fabricTypes, newFabric]);
        }
        setNewFabricName("");
        setShowFabricDialog(false);
    };
    const handleEditFabricType = (index) => {
        setEditingFabricIndex(index);
        setNewFabricName(fabricTypes[index].label);
        setShowFabricDialog(true);
    };
    const handleDeleteFabricType = (index) => {
        const updated = fabricTypes.filter((_, i) => i !== index);
        setFabricTypes(updated);
        // If the deleted fabric was selected, clear the selection
        if (fabricTypes[index].value === fabricType) {
            onFabricTypeChange("");
        }
    };
    const handleAddSizeType = () => {
        if (!newSizeLabel.trim())
            return;
        const value = newSizeLabel.toUpperCase().replace(/\s+/g, "_");
        const newSize = {
            value,
            label: newSizeLabel.trim(),
            description: newSizeDescription.trim(),
        };
        if (editingSizeIndex !== null) {
            // Edit existing
            const updated = [...sizeDistributionTypes];
            updated[editingSizeIndex] = newSize;
            setSizeDistributionTypes(updated);
            setEditingSizeIndex(null);
        }
        else {
            // Add new
            setSizeDistributionTypes([...sizeDistributionTypes, newSize]);
        }
        setNewSizeLabel("");
        setNewSizeDescription("");
        setShowSizeDialog(false);
    };
    const handleEditSizeType = (index) => {
        setEditingSizeIndex(index);
        setNewSizeLabel(sizeDistributionTypes[index].label);
        setNewSizeDescription(sizeDistributionTypes[index].description);
        setShowSizeDialog(true);
    };
    const handleDeleteSizeType = (index) => {
        const updated = sizeDistributionTypes.filter((_, i) => i !== index);
        setSizeDistributionTypes(updated);
        // If the deleted size was selected, clear the selection
        if (sizeDistributionTypes[index].value === sizeDistributionType) {
            onSizeDistributionTypeChange("");
        }
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.FileText className="h-5 w-5"/>
          Order Details
          <badge_1.Badge variant="outline">Optional</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* PO Number & Order Type */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label_1.Label htmlFor="po-number">
              P.O. Number{" "}
              <badge_1.Badge variant="secondary" className="ml-2">
                Auto-generated
              </badge_1.Badge>
            </label_1.Label>
            <input_1.Input id="po-number" value={poNumber} readOnly disabled className="cursor-not-allowed bg-gray-50"/>
            <p className="mt-1 text-xs text-muted-foreground">
              Automatically generated purchase order number
            </p>
          </div>

          <div>
            <label_1.Label htmlFor="order-type">
              Order Type <span className="text-red-500">*</span>
            </label_1.Label>
            <select_1.Select value={orderType} onValueChange={onOrderTypeChange}>
              <select_1.SelectTrigger id="order-type">
                <select_1.SelectValue placeholder="Select order type"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {ORDER_TYPES.map(type => (<select_1.SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>

        {/* Design Name & Fabric Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label_1.Label htmlFor="design-name" className="flex items-center gap-2">
                <lucide_react_1.Type className="h-4 w-4"/>
                Design Name
              </label_1.Label>
            </div>
            <input_1.Input id="design-name" value={designName} onChange={e => onDesignNameChange(e.target.value)} placeholder="e.g., Summer Collection 2024"/>
            <p className="mt-1 text-xs text-muted-foreground">
              Name or title of the design
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label_1.Label htmlFor="fabric-type" className="flex items-center gap-2">
                <lucide_react_1.Shirt className="h-4 w-4"/>
                Fabric Type
              </label_1.Label>
              <dialog_1.Dialog open={showFabricDialog} onOpenChange={open => {
            setShowFabricDialog(open);
            if (!open) {
                setNewFabricName("");
                setEditingFabricIndex(null);
            }
        }}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button type="button" variant="outline" size="sm">
                    <lucide_react_1.Plus className="mr-1 h-3 w-3"/>
                    Manage Types
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent>
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Manage Fabric Types</dialog_1.DialogTitle>
                  </dialog_1.DialogHeader>
                  <div className="space-y-4">
                    {/* Add/Edit Form */}
                    <div className="flex gap-2">
                      <input_1.Input value={newFabricName} onChange={e => setNewFabricName(e.target.value)} placeholder="Enter fabric type name" onKeyDown={e => e.key === "Enter" && handleAddFabricType()}/>
                      <button_1.Button onClick={handleAddFabricType}>
                        {editingFabricIndex !== null ? "Update" : "Add"}
                      </button_1.Button>
                    </div>

                    {/* Fabric Types List */}
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {fabricTypes.map((fabric, index) => (<div key={fabric.value} className="flex items-center justify-between rounded border p-2 hover:bg-gray-50">
                          <span>{fabric.label}</span>
                          <div className="flex gap-1">
                            <button_1.Button type="button" variant="ghost" size="sm" onClick={() => handleEditFabricType(index)}>
                              <lucide_react_1.Pencil className="h-3 w-3"/>
                            </button_1.Button>
                            <button_1.Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteFabricType(index)}>
                              <lucide_react_1.Trash2 className="h-3 w-3 text-red-500"/>
                            </button_1.Button>
                          </div>
                        </div>))}
                    </div>
                  </div>
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            </div>
            <select_1.Select value={fabricType} onValueChange={onFabricTypeChange}>
              <select_1.SelectTrigger id="fabric-type">
                <select_1.SelectValue placeholder="Select fabric type"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {fabricTypes.map(fabric => (<select_1.SelectItem key={fabric.value} value={fabric.value}>
                    {fabric.label}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>

        {/* Size Distribution Type */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label_1.Label htmlFor="size-distribution" className="flex items-center gap-2">
              <lucide_react_1.Package className="h-4 w-4"/>
              Size Distribution Type
            </label_1.Label>
            <dialog_1.Dialog open={showSizeDialog} onOpenChange={open => {
            setShowSizeDialog(open);
            if (!open) {
                setNewSizeLabel("");
                setNewSizeDescription("");
                setEditingSizeIndex(null);
            }
        }}>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button type="button" variant="outline" size="sm">
                  <lucide_react_1.Plus className="mr-1 h-3 w-3"/>
                  Manage Types
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Manage Size Distribution Types</dialog_1.DialogTitle>
                </dialog_1.DialogHeader>
                <div className="space-y-4">
                  {/* Add/Edit Form */}
                  <div className="space-y-3">
                    <div>
                      <label_1.Label>Type Name</label_1.Label>
                      <input_1.Input value={newSizeLabel} onChange={e => setNewSizeLabel(e.target.value)} placeholder="e.g., Slim Fit, Regular Fit" onKeyDown={e => e.key === "Enter" && handleAddSizeType()}/>
                    </div>
                    <div>
                      <label_1.Label>Description</label_1.Label>
                      <input_1.Input value={newSizeDescription} onChange={e => setNewSizeDescription(e.target.value)} placeholder="e.g., Fitted through body and sleeves" onKeyDown={e => e.key === "Enter" && handleAddSizeType()}/>
                    </div>
                    <button_1.Button onClick={handleAddSizeType} className="w-full">
                      {editingSizeIndex !== null ? "Update" : "Add"}
                    </button_1.Button>
                  </div>

                  {/* Size Types List */}
                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {sizeDistributionTypes.map((size, index) => (<div key={size.value} className="flex items-start justify-between rounded border p-3 hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium">{size.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {size.description}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button_1.Button type="button" variant="ghost" size="sm" onClick={() => handleEditSizeType(index)}>
                            <lucide_react_1.Pencil className="h-3 w-3"/>
                          </button_1.Button>
                          <button_1.Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteSizeType(index)}>
                            <lucide_react_1.Trash2 className="h-3 w-3 text-red-500"/>
                          </button_1.Button>
                        </div>
                      </div>))}
                  </div>
                </div>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>
          </div>
          <select_1.Select value={sizeDistributionType} onValueChange={onSizeDistributionTypeChange}>
            <select_1.SelectTrigger id="size-distribution">
              <select_1.SelectValue placeholder="Select size distribution type"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              {sizeDistributionTypes.map(type => (<select_1.SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                </select_1.SelectItem>))}
            </select_1.SelectContent>
          </select_1.Select>
          <p className="mt-1 text-xs text-muted-foreground">
            Affects sizing chart and fit recommendations
          </p>
        </div>

        {/* Info Box */}
        {orderType === "REORDER" && (<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <lucide_react_1.FileText className="mt-0.5 h-5 w-5 text-blue-600"/>
              <div>
                <h4 className="font-medium text-blue-900">Reorder Detected</h4>
                <p className="mt-1 text-sm text-blue-700">
                  This order is marked as a reorder. Make sure to reference the
                  previous order for consistency in specifications and quality.
                </p>
              </div>
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
