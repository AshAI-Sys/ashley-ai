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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantsAddonsSection = VariantsAddonsSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const checkbox_1 = require("@/components/ui/checkbox");
const separator_1 = require("@/components/ui/separator");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const PRESET_COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy Blue', hex: '#001F3F' },
    { name: 'Royal Blue', hex: '#0074D9' },
    { name: 'Red', hex: '#FF4136' },
    { name: 'Maroon', hex: '#85144B' },
    { name: 'Green', hex: '#2ECC40' },
    { name: 'Forest Green', hex: '#3D9970' },
    { name: 'Yellow', hex: '#FFDC00' },
    { name: 'Orange', hex: '#FF851B' },
    { name: 'Gray', hex: '#AAAAAA' },
    { name: 'Purple', hex: '#B10DC9' }
];
const AVAILABLE_ADDONS = [
    {
        id: 'puff-print',
        name: 'Puff Print',
        description: 'Raised 3D print effect',
        type: 'print',
        priceType: 'per_piece',
        price: 15,
        selected: false
    },
    {
        id: 'anti-migration',
        name: 'Anti-Migration Base',
        description: 'Prevents ink bleeding on polyester',
        type: 'print',
        priceType: 'per_piece',
        price: 8,
        selected: false
    },
    {
        id: 'premium-thread',
        name: 'Premium Embroidery Thread',
        description: 'High-quality polyester thread',
        type: 'print',
        priceType: 'percentage',
        price: 20,
        selected: false
    },
    {
        id: 'custom-tags',
        name: 'Custom Neck Tags',
        description: 'Branded neck tags',
        type: 'garment',
        priceType: 'per_piece',
        price: 12,
        selected: false
    },
    {
        id: 'size-labels',
        name: 'Custom Size Labels',
        description: 'Branded size labels',
        type: 'garment',
        priceType: 'per_piece',
        price: 8,
        selected: false
    },
    {
        id: 'care-labels',
        name: 'Custom Care Labels',
        description: 'Branded care instruction labels',
        type: 'garment',
        priceType: 'per_piece',
        price: 6,
        selected: false
    },
    {
        id: 'poly-bags',
        name: 'Individual Poly Bags',
        description: 'Each piece in poly bag',
        type: 'packaging',
        priceType: 'per_piece',
        price: 3,
        selected: false
    },
    {
        id: 'custom-boxes',
        name: 'Custom Packaging Boxes',
        description: 'Branded packaging boxes',
        type: 'packaging',
        priceType: 'fixed',
        price: 500,
        selected: false
    },
    {
        id: 'hang-tags',
        name: 'Custom Hang Tags',
        description: 'Branded hang tags with string',
        type: 'packaging',
        priceType: 'per_piece',
        price: 5,
        selected: false
    },
    {
        id: 'fabric-softener',
        name: 'Fabric Softener Treatment',
        description: 'Pre-wash softener treatment',
        type: 'garment',
        priceType: 'per_piece',
        price: 4,
        selected: false
    }
];
function VariantsAddonsSection({ totalQuantity, colorVariants, selectedAddOns, onColorVariantsChange, onAddOnsChange, onPricingUpdate }) {
    const [addOns, setAddOns] = (0, react_1.useState)(AVAILABLE_ADDONS);
    (0, react_1.useEffect)(() => {
        calculatePricing();
    }, [colorVariants, selectedAddOns, totalQuantity]);
    const calculatePricing = () => {
        // Calculate color variants cost
        const colorVariantsCost = colorVariants.length > 1 ? colorVariants.length * 25 : 0;
        // Calculate add-ons cost
        const addOnsCost = selectedAddOns.reduce((total, addOnId) => {
            const addOn = addOns.find(a => a.id === addOnId);
            if (!addOn)
                return total;
            switch (addOn.priceType) {
                case 'fixed':
                    return total + addOn.price;
                case 'per_piece':
                    return total + (addOn.price * totalQuantity);
                case 'percentage':
                    // Base on a standard unit price of ₱200 for percentage calculations
                    return total + ((200 * totalQuantity * addOn.price) / 100);
                default:
                    return total;
            }
        }, 0);
        onPricingUpdate(addOnsCost, colorVariantsCost);
    };
    const addColorVariant = () => {
        const newVariant = {
            id: Math.random().toString(36).substring(7),
            name: '',
            hexCode: '#000000',
            percentage: 0,
            quantity: 0
        };
        onColorVariantsChange([...colorVariants, newVariant]);
    };
    const removeColorVariant = (id) => {
        if (colorVariants.length > 1) {
            onColorVariantsChange(colorVariants.filter(v => v.id !== id));
        }
    };
    const updateColorVariant = (id, field, value) => {
        const updatedVariants = colorVariants.map(variant => {
            if (variant.id === id) {
                const updated = { ...variant, [field]: value };
                // Auto-calculate quantity when percentage changes
                if (field === 'percentage' && totalQuantity > 0) {
                    updated.quantity = Math.round((totalQuantity * value) / 100);
                }
                // Auto-calculate percentage when quantity changes
                if (field === 'quantity' && totalQuantity > 0) {
                    updated.percentage = Math.round((value / totalQuantity) * 100);
                }
                return updated;
            }
            return variant;
        });
        onColorVariantsChange(updatedVariants);
    };
    const distributeEquallyAcrossColors = () => {
        if (colorVariants.length === 0 || totalQuantity === 0)
            return;
        const basePercentage = Math.floor(100 / colorVariants.length);
        const remainder = 100 % colorVariants.length;
        const updatedVariants = colorVariants.map((variant, index) => {
            const percentage = basePercentage + (index < remainder ? 1 : 0);
            const quantity = Math.round((totalQuantity * percentage) / 100);
            return {
                ...variant,
                percentage,
                quantity
            };
        });
        onColorVariantsChange(updatedVariants);
        react_hot_toast_1.toast.success('Quantities distributed equally across colors');
    };
    const selectPresetColor = (variantId, color) => {
        updateColorVariant(variantId, 'name', color.name);
        updateColorVariant(variantId, 'hexCode', color.hex);
    };
    const toggleAddOn = (addOnId) => {
        const currentSelected = selectedAddOns.includes(addOnId);
        if (currentSelected) {
            onAddOnsChange(selectedAddOns.filter(id => id !== addOnId));
        }
        else {
            onAddOnsChange([...selectedAddOns, addOnId]);
        }
    };
    const getAddOnGroupedByType = () => {
        const grouped = {};
        addOns.forEach(addOn => {
            if (!grouped[addOn.type]) {
                grouped[addOn.type] = [];
            }
            grouped[addOn.type].push(addOn);
        });
        return grouped;
    };
    const formatPrice = (addOn) => {
        switch (addOn.priceType) {
            case 'fixed':
                return `₱${addOn.price.toLocaleString()}`;
            case 'per_piece':
                return `₱${addOn.price}/pc`;
            case 'percentage':
                return `+${addOn.price}%`;
            default:
                return '';
        }
    };
    const getTotalColorQuantity = () => {
        return colorVariants.reduce((sum, variant) => sum + variant.quantity, 0);
    };
    const getTotalColorPercentage = () => {
        return colorVariants.reduce((sum, variant) => sum + variant.percentage, 0);
    };
    const groupedAddOns = getAddOnGroupedByType();
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          D. Variants & Add-ons
          <badge_1.Badge variant="outline">Optional</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Color Variants */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <label_1.Label className="text-base font-medium">Color Variants</label_1.Label>
              <p className="text-sm text-muted-foreground">
                Specify different colors and their quantities
              </p>
            </div>
            <div className="flex gap-2">
              {colorVariants.length > 1 && (<button_1.Button variant="outline" size="sm" onClick={distributeEquallyAcrossColors} disabled={totalQuantity === 0}>
                  <lucide_react_1.Calculator className="w-4 h-4 mr-1"/>
                  Distribute Equally
                </button_1.Button>)}
              <button_1.Button onClick={addColorVariant} size="sm">
                <lucide_react_1.Plus className="w-4 h-4 mr-1"/>
                Add Color
              </button_1.Button>
            </div>
          </div>

          <div className="space-y-4">
            {colorVariants.map((variant, index) => (<div key={variant.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Color {index + 1}</h4>
                  {colorVariants.length > 1 && (<button_1.Button variant="outline" size="sm" onClick={() => removeColorVariant(variant.id)}>
                      <lucide_react_1.Minus className="w-4 h-4"/>
                    </button_1.Button>)}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label_1.Label>Color Name</label_1.Label>
                    <input_1.Input value={variant.name} onChange={(e) => updateColorVariant(variant.id, 'name', e.target.value)} placeholder="e.g., Black, Navy Blue"/>
                  </div>

                  <div>
                    <label_1.Label>Color Code</label_1.Label>
                    <div className="flex gap-2">
                      <input_1.Input type="color" value={variant.hexCode} onChange={(e) => updateColorVariant(variant.id, 'hexCode', e.target.value)} className="w-16 h-10 p-1 border rounded"/>
                      <input_1.Input value={variant.hexCode} onChange={(e) => updateColorVariant(variant.id, 'hexCode', e.target.value)} placeholder="#000000" className="flex-1"/>
                    </div>
                  </div>

                  <div>
                    <label_1.Label>Percentage (%)</label_1.Label>
                    <input_1.Input type="number" min="0" max="100" value={variant.percentage || ''} onChange={(e) => updateColorVariant(variant.id, 'percentage', parseInt(e.target.value) || 0)}/>
                  </div>

                  <div>
                    <label_1.Label>Quantity</label_1.Label>
                    <input_1.Input type="number" min="0" value={variant.quantity || ''} onChange={(e) => updateColorVariant(variant.id, 'quantity', parseInt(e.target.value) || 0)}/>
                  </div>
                </div>

                {/* Preset Colors */}
                <div>
                  <label_1.Label className="text-sm">Quick Select Colors</label_1.Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (<button key={color.hex} onClick={() => selectPresetColor(variant.id, color)} className="flex items-center gap-2 px-3 py-1 border rounded-md hover:bg-gray-50 text-sm" title={color.name}>
                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.hex }}/>
                        <span>{color.name}</span>
                      </button>))}
                  </div>
                </div>
              </div>))}
          </div>

          {/* Color Summary */}
          {colorVariants.length > 0 && (<div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Color Distribution Summary</span>
                <div className="text-sm text-muted-foreground">
                  {getTotalColorQuantity()}/{totalQuantity} pieces ({getTotalColorPercentage()}%)
                </div>
              </div>
              
              <div className="space-y-2">
                {colorVariants.filter(v => v.quantity > 0).map((variant) => (<div key={variant.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: variant.hexCode }}/>
                      <span>{variant.name || 'Unnamed Color'}</span>
                    </div>
                    <span>{variant.quantity} pcs ({variant.percentage}%)</span>
                  </div>))}
              </div>
            </div>)}
        </div>

        <separator_1.Separator />

        {/* Add-ons */}
        <div>
          <div className="mb-4">
            <label_1.Label className="text-base font-medium">Add-ons & Enhancements</label_1.Label>
            <p className="text-sm text-muted-foreground">
              Select additional services and enhancements
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedAddOns).map(([type, typeAddOns]) => (<div key={type}>
                <h4 className="font-medium capitalize mb-3 flex items-center gap-2">
                  {type === 'print' && <lucide_react_1.Palette className="w-4 h-4"/>}
                  {type === 'garment' && <lucide_react_1.Tag className="w-4 h-4"/>}
                  {type === 'packaging' && <lucide_react_1.Package className="w-4 h-4"/>}
                  {type.replace('_', ' ')} Options
                </h4>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {typeAddOns.map((addOn) => (<div key={addOn.id} className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedAddOns.includes(addOn.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'}`} onClick={() => toggleAddOn(addOn.id)}>
                      <div className="flex items-start gap-3">
                        <checkbox_1.Checkbox checked={selectedAddOns.includes(addOn.id)} onChange={() => toggleAddOn(addOn.id)} className="mt-1"/>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium">{addOn.name}</h5>
                            <badge_1.Badge variant="outline" className="text-xs">
                              {formatPrice(addOn)}
                            </badge_1.Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {addOn.description}
                          </p>
                          
                          {selectedAddOns.includes(addOn.id) && addOn.priceType !== 'percentage' && (<div className="text-xs text-blue-600 mt-2">
                              Total: ₱{(addOn.priceType === 'fixed'
                        ? addOn.price
                        : addOn.price * totalQuantity).toLocaleString()}
                            </div>)}
                        </div>
                      </div>
                    </div>))}
                </div>
              </div>))}
          </div>
        </div>

        {/* Add-ons Summary */}
        {selectedAddOns.length > 0 && (<div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Selected Add-ons Summary</h4>
            <div className="space-y-2">
              {selectedAddOns.map(addOnId => {
                const addOn = addOns.find(a => a.id === addOnId);
                if (!addOn)
                    return null;
                let cost = 0;
                switch (addOn.priceType) {
                    case 'fixed':
                        cost = addOn.price;
                        break;
                    case 'per_piece':
                        cost = addOn.price * totalQuantity;
                        break;
                    case 'percentage':
                        cost = (200 * totalQuantity * addOn.price) / 100;
                        break;
                }
                return (<div key={addOnId} className="flex justify-between items-center text-sm">
                    <span>{addOn.name}</span>
                    <span className="font-medium text-green-700">
                      ₱{cost.toLocaleString()}
                    </span>
                  </div>);
            })}
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
