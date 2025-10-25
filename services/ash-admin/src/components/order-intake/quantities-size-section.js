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
exports.QuantitiesSizeSection = QuantitiesSizeSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const SIZE_TEMPLATES = [
    {
        name: "Standard Adult",
        description: "Typical adult distribution",
        percentages: { XS: 5, S: 15, M: 30, L: 30, XL: 15, XXL: 5, XXXL: 0 },
    },
    {
        name: "Corporate Events",
        description: "Business/corporate events",
        percentages: { XS: 8, S: 20, M: 35, L: 25, XL: 10, XXL: 2, XXXL: 0 },
    },
    {
        name: "Sports Teams",
        description: "Athletic/sports teams",
        percentages: { XS: 10, S: 20, M: 25, L: 25, XL: 15, XXL: 5, XXXL: 0 },
    },
    {
        name: "Youth/School",
        description: "Schools and youth programs",
        percentages: { XS: 15, S: 25, M: 30, L: 20, XL: 8, XXL: 2, XXXL: 0 },
    },
    {
        name: "Retail/General",
        description: "General retail distribution",
        percentages: { XS: 12, S: 18, M: 28, L: 25, XL: 12, XXL: 4, XXXL: 1 },
    },
    {
        name: "Plus Size Focus",
        description: "Extended sizes emphasis",
        percentages: { XS: 3, S: 10, M: 20, L: 25, XL: 22, XXL: 15, XXXL: 5 },
    },
];
function QuantitiesSizeSection({ totalQuantity, sizeCurve, onTotalQuantityChange, onSizeCurveChange, }) {
    const [calculatedTotal, setCalculatedTotal] = (0, react_1.useState)(0);
    const [validationErrors, setValidationErrors] = (0, react_1.useState)([]);
    const [activeTemplate, setActiveTemplate] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        const total = Object.values(sizeCurve).reduce((sum, qty) => sum + qty, 0);
        setCalculatedTotal(total);
        const errors = [];
        if (totalQuantity > 0 && total !== totalQuantity) {
            errors.push(`Size breakdown (${total}) doesn't match total quantity (${totalQuantity})`);
        }
        if (total === 0) {
            errors.push("Please set quantities for at least one size");
        }
        const negativeValues = Object.entries(sizeCurve).filter(([_, qty]) => qty < 0);
        if (negativeValues.length > 0) {
            errors.push("Quantities cannot be negative");
        }
        setValidationErrors(errors);
    }, [sizeCurve, totalQuantity]);
    const applySizeTemplate = (template) => {
        if (totalQuantity === 0) {
            react_hot_toast_1.toast.error("Please set total quantity first");
            return;
        }
        const newSizeCurve = {};
        let remainingQty = totalQuantity;
        // Calculate quantities based on percentages
        DEFAULT_SIZES.forEach((size, index) => {
            const percentage = template.percentages[size] || 0;
            if (index === DEFAULT_SIZES.length - 1) {
                // Last size gets remaining quantity to ensure exact total
                newSizeCurve[size] = remainingQty;
            }
            else {
                const qty = Math.round((totalQuantity * percentage) / 100);
                newSizeCurve[size] = qty;
                remainingQty -= qty;
            }
        });
        onSizeCurveChange(newSizeCurve);
        setActiveTemplate(template.name);
        react_hot_toast_1.toast.success(`Applied ${template.name} size template`);
    };
    const updateSizeQuantity = (size, quantity) => {
        const newSizeCurve = { ...sizeCurve, [size]: Math.max(0, quantity) };
        onSizeCurveChange(newSizeCurve);
        setActiveTemplate(""); // Clear template when manually editing
    };
    const autoCalculateFromTotal = () => {
        if (totalQuantity === 0) {
            react_hot_toast_1.toast.error("Please set total quantity first");
            return;
        }
        // Apply standard adult template by default
        const standardTemplate = SIZE_TEMPLATES[0];
        applySizeTemplate(standardTemplate);
    };
    const resetSizeCurve = () => {
        const emptyCurve = {};
        DEFAULT_SIZES.forEach(size => {
            emptyCurve[size] = 0;
        });
        onSizeCurveChange(emptyCurve);
        setActiveTemplate("");
    };
    const getSizePercentage = (size) => {
        if (calculatedTotal === 0)
            return 0;
        return Math.round((sizeCurve[size] / calculatedTotal) * 100);
    };
    const isValidQuantityBreakdown = validationErrors.length === 0 && calculatedTotal > 0;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          C. Quantities & Size Curve
          <badge_1.Badge variant="secondary">Required</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Total Quantity Input */}
        <div>
          <label_1.Label htmlFor="total-quantity">Total Quantity *</label_1.Label>
          <div className="flex gap-2">
            <input_1.Input id="total-quantity" type="number" min="1" value={totalQuantity || ""} onChange={e => onTotalQuantityChange(parseInt(e.target.value) || 0)} placeholder="Enter total quantity" className="flex-1"/>
            <button_1.Button variant="outline" onClick={autoCalculateFromTotal} disabled={totalQuantity === 0}>
              <lucide_react_1.Calculator className="mr-2 h-4 w-4"/>
              Auto Calculate
            </button_1.Button>
          </div>
        </div>

        {/* Size Templates */}
        <div>
          <label_1.Label>Size Distribution Templates</label_1.Label>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SIZE_TEMPLATES.map(template => (<button key={template.name} onClick={() => applySizeTemplate(template)} disabled={totalQuantity === 0} className={`rounded-lg border p-3 text-left transition-colors ${activeTemplate === template.name
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"} ${totalQuantity === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                <div className="text-sm font-medium">{template.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {template.description}
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  M: {template.percentages.M}% • L: {template.percentages.L}% •
                  XL: {template.percentages.XL}%
                </div>
              </button>))}
          </div>
        </div>

        {/* Size Breakdown Grid */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label_1.Label>Size Breakdown</label_1.Label>
            <div className="flex gap-2">
              <button_1.Button variant="outline" size="sm" onClick={resetSizeCurve}>
                <lucide_react_1.RotateCcw className="mr-1 h-4 w-4"/>
                Reset
              </button_1.Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {DEFAULT_SIZES.map(size => (<div key={size} className="space-y-2">
                <label_1.Label className="text-sm font-medium">{size}</label_1.Label>
                <input_1.Input type="number" min="0" value={sizeCurve[size] || 0} onChange={e => updateSizeQuantity(size, parseInt(e.target.value) || 0)} className="text-center"/>
                <div className="text-center text-xs text-muted-foreground">
                  {getSizePercentage(size)}%
                </div>
              </div>))}
          </div>
        </div>

        {/* Summary and Validation */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium">Quantity Summary</h4>
            {isValidQuantityBreakdown ? (<div className="flex items-center gap-1 text-green-600">
                <lucide_react_1.CheckCircle className="h-4 w-4"/>
                <span className="text-sm">Valid</span>
              </div>) : (<div className="flex items-center gap-1 text-red-600">
                <lucide_react_1.AlertCircle className="h-4 w-4"/>
                <span className="text-sm">Issues</span>
              </div>)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Target Total:</span>
              <div className="font-medium">
                {totalQuantity.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">
                Size Breakdown Total:
              </span>
              <div className={`font-medium ${calculatedTotal === totalQuantity
            ? "text-green-600"
            : "text-red-600"}`}>
                {calculatedTotal.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Difference:</span>
              <div className={`font-medium ${calculatedTotal === totalQuantity
            ? "text-green-600"
            : "text-red-600"}`}>
                {(calculatedTotal - totalQuantity).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Sizes Used:</span>
              <div className="font-medium">
                {Object.values(sizeCurve).filter(qty => qty > 0).length}/
                {DEFAULT_SIZES.length}
              </div>
            </div>
          </div>

          {validationErrors.length > 0 && (<div className="mt-3 space-y-1">
              {validationErrors.map((error, index) => (<div key={index} className="flex items-start gap-2 text-sm text-red-600">
                  <lucide_react_1.AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0"/>
                  <span>{error}</span>
                </div>))}
            </div>)}
        </div>

        {/* Visual Size Distribution */}
        {calculatedTotal > 0 && (<div>
            <label_1.Label className="mb-3 block">
              Size Distribution Visualization
            </label_1.Label>
            <div className="space-y-2">
              {DEFAULT_SIZES.filter(size => sizeCurve[size] > 0).map(size => {
                const percentage = getSizePercentage(size);
                return (<div key={size} className="flex items-center gap-3">
                    <div className="w-8 text-sm font-medium">{size}</div>
                    <div className="relative h-6 flex-1 rounded-full bg-gray-200">
                      <div className="flex h-6 items-center justify-end rounded-full bg-blue-500 pr-2 transition-all" style={{ width: `${Math.max(percentage, 3)}%` }}>
                        {percentage >= 10 && (<span className="text-xs font-medium text-white">
                            {sizeCurve[size]}
                          </span>)}
                      </div>
                      {percentage < 10 && sizeCurve[size] > 0 && (<span className="absolute right-2 top-1/2 -translate-y-1/2 transform text-xs font-medium text-white">
                          {sizeCurve[size]}
                        </span>)}
                    </div>
                    <div className="w-12 text-right text-sm text-muted-foreground">
                      {percentage}%
                    </div>
                  </div>);
            })}
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
