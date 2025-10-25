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
exports.SizeCurveInput = void 0;
const React = __importStar(require("react"));
const input_1 = require("../input");
const button_1 = require("../button");
const badge_1 = require("../badge");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const SizeCurveInput = React.forwardRef(({ value = {}, onChange, totalQuantity = 0, availableSizes = DEFAULT_SIZES, className, error, disabled, ...props }, ref) => {
    const [customSize, setCustomSize] = React.useState("");
    const currentTotal = Object.values(value).reduce((sum, qty) => sum + qty, 0);
    const isValidTotal = totalQuantity === 0 || currentTotal === totalQuantity;
    const updateSize = (size, quantity) => {
        const newValue = { ...value };
        if (quantity <= 0) {
            delete newValue[size];
        }
        else {
            newValue[size] = quantity;
        }
        onChange(newValue);
    };
    const addCustomSize = () => {
        if (customSize && !value[customSize]) {
            updateSize(customSize, 1);
            setCustomSize("");
        }
    };
    const removeSize = (size) => {
        const newValue = { ...value };
        delete newValue[size];
        onChange(newValue);
    };
    // Quick fill buttons for common distributions
    const quickFillOptions = [
        {
            label: "Equal Distribution",
            action: () => {
                const activeSizes = Object.keys(value).filter(size => value[size] > 0);
                if (activeSizes.length === 0 || totalQuantity === 0)
                    return;
                const perSize = Math.floor(totalQuantity / activeSizes.length);
                const remainder = totalQuantity % activeSizes.length;
                const newValue = {};
                activeSizes.forEach((size, index) => {
                    newValue[size] = perSize + (index < remainder ? 1 : 0);
                });
                onChange(newValue);
            },
        },
        {
            label: "Bell Curve (M/L Heavy)",
            action: () => {
                if (totalQuantity === 0)
                    return;
                const distribution = {
                    XS: 0.05,
                    S: 0.15,
                    M: 0.25,
                    L: 0.25,
                    XL: 0.2,
                    "2XL": 0.1,
                };
                const newValue = {};
                Object.entries(distribution).forEach(([size, percentage]) => {
                    newValue[size] = Math.round(totalQuantity * percentage);
                });
                // Adjust for rounding differences
                const actualTotal = Object.values(newValue).reduce((sum, qty) => sum + qty, 0);
                if (actualTotal !== totalQuantity) {
                    newValue.M += totalQuantity - actualTotal;
                }
                onChange(newValue);
            },
        },
    ];
    return (<div ref={ref} className={(0, utils_1.cn)("space-y-4", className)} {...props}>
        {/* Size Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {availableSizes.map(size => (<div key={size} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {size}
              </label>
              <input_1.Input type="number" min="0" value={value[size] || ""} onChange={e => updateSize(size, parseInt(e.target.value) || 0)} placeholder="0" className="text-center" disabled={disabled} error={error && !isValidTotal}/>
            </div>))}
        </div>

        {/* Custom Size Input */}
        {!disabled && (<div className="flex gap-2">
            <input_1.Input placeholder="Custom size (e.g., 4XL)" value={customSize} onChange={e => setCustomSize(e.target.value.toUpperCase())} onKeyPress={e => e.key === "Enter" && addCustomSize()} className="flex-1"/>
            <button_1.Button type="button" variant="outline" size="icon" onClick={addCustomSize} disabled={!customSize || !!value[customSize]}>
              <lucide_react_1.Plus className="h-4 w-4"/>
            </button_1.Button>
          </div>)}

        {/* Custom Sizes */}
        {Object.keys(value).filter(size => !availableSizes.includes(size))
            .length > 0 && (<div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Custom Sizes
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.keys(value)
                .filter(size => !availableSizes.includes(size))
                .map(size => (<div key={size} className="relative">
                    <div className="mb-1 flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        {size}
                      </span>
                      {!disabled && (<button_1.Button type="button" variant="ghost" size="icon" className="h-4 w-4 p-0 text-red-500 hover:text-red-700" onClick={() => removeSize(size)}>
                          <lucide_react_1.Trash2 className="h-3 w-3"/>
                        </button_1.Button>)}
                    </div>
                    <input_1.Input type="number" min="0" value={value[size] || ""} onChange={e => updateSize(size, parseInt(e.target.value) || 0)} placeholder="0" className="text-center" disabled={disabled} error={error && !isValidTotal}/>
                  </div>))}
            </div>
          </div>)}

        {/* Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">Total: </span>
              <badge_1.Badge variant={isValidTotal ? "success" : "destructive"}>
                {currentTotal}
                {totalQuantity > 0 && ` / ${totalQuantity}`}
              </badge_1.Badge>
            </div>

            {!isValidTotal && totalQuantity > 0 && (<div className="text-sm text-red-600">
                Difference: {currentTotal - totalQuantity}
              </div>)}
          </div>

          {/* Quick Fill Buttons */}
          {!disabled && totalQuantity > 0 && (<div className="flex gap-2">
              {quickFillOptions.map((option, index) => (<button_1.Button key={index} type="button" variant="outline" size="sm" onClick={option.action} className="text-xs">
                  {option.label}
                </button_1.Button>))}
            </div>)}
        </div>
      </div>);
});
exports.SizeCurveInput = SizeCurveInput;
SizeCurveInput.displayName = "SizeCurveInput";
