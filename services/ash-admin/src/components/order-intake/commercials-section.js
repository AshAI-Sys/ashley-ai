'use client';
"use strict";
const __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    let desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
const __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
const __importStar = (this && this.__importStar) || (function () {
    let ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            const ar = [];
            for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        const result = {};
        if (mod != null) for (let k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercialsSection = CommercialsSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const separator_1 = require("@/components/ui/separator");
const switch_1 = require("@/components/ui/switch");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const PRICING_MATRIX = {
    'silkscreen': {
        't-shirt': [
            { minQuantity: 1, maxQuantity: 50, basePrice: 180, discount: 0 },
            { minQuantity: 51, maxQuantity: 100, basePrice: 160, discount: 5 },
            { minQuantity: 101, maxQuantity: 250, basePrice: 140, discount: 10 },
            { minQuantity: 251, maxQuantity: 500, basePrice: 120, discount: 15 },
            { minQuantity: 501, maxQuantity: 1000, basePrice: 100, discount: 20 },
            { minQuantity: 1001, maxQuantity: 999999, basePrice: 85, discount: 25 }
        ],
        'hoodie': [
            { minQuantity: 1, maxQuantity: 50, basePrice: 420, discount: 0 },
            { minQuantity: 51, maxQuantity: 100, basePrice: 380, discount: 5 },
            { minQuantity: 101, maxQuantity: 250, basePrice: 340, discount: 10 },
            { minQuantity: 251, maxQuantity: 500, basePrice: 300, discount: 15 },
            { minQuantity: 501, maxQuantity: 1000, basePrice: 260, discount: 20 },
            { minQuantity: 1001, maxQuantity: 999999, basePrice: 220, discount: 25 }
        ]
    },
    'sublimation': {
        't-shirt': [
            { minQuantity: 1, maxQuantity: 25, basePrice: 220, discount: 0 },
            { minQuantity: 26, maxQuantity: 50, basePrice: 200, discount: 5 },
            { minQuantity: 51, maxQuantity: 100, basePrice: 180, discount: 10 },
            { minQuantity: 101, maxQuantity: 250, basePrice: 160, discount: 15 },
            { minQuantity: 251, maxQuantity: 500, basePrice: 140, discount: 20 },
            { minQuantity: 501, maxQuantity: 999999, basePrice: 120, discount: 25 }
        ]
    },
    'dtf': {
        't-shirt': [
            { minQuantity: 1, maxQuantity: 12, basePrice: 250, discount: 0 },
            { minQuantity: 13, maxQuantity: 25, basePrice: 230, discount: 5 },
            { minQuantity: 26, maxQuantity: 50, basePrice: 210, discount: 10 },
            { minQuantity: 51, maxQuantity: 100, basePrice: 190, discount: 15 },
            { minQuantity: 101, maxQuantity: 250, basePrice: 170, discount: 20 },
            { minQuantity: 251, maxQuantity: 999999, basePrice: 150, discount: 25 }
        ]
    },
    'embroidery': {
        't-shirt': [
            { minQuantity: 1, maxQuantity: 25, basePrice: 280, discount: 0 },
            { minQuantity: 26, maxQuantity: 50, basePrice: 260, discount: 5 },
            { minQuantity: 51, maxQuantity: 100, basePrice: 240, discount: 10 },
            { minQuantity: 101, maxQuantity: 250, basePrice: 220, discount: 15 },
            { minQuantity: 251, maxQuantity: 500, basePrice: 200, discount: 20 },
            { minQuantity: 501, maxQuantity: 999999, basePrice: 180, discount: 25 }
        ]
    }
};
const PAYMENT_TERMS = [
    { value: 'net_15', label: 'Net 15 Days', description: 'Payment due within 15 days' },
    { value: 'net_30', label: 'Net 30 Days', description: 'Payment due within 30 days' },
    { value: 'cod', label: 'Cash on Delivery', description: 'Payment upon delivery' },
    { value: '50_50', label: '50/50 Split', description: '50% deposit, 50% on delivery' },
    { value: 'prepaid', label: 'Full Prepayment', description: '100% payment upfront' }
];
function CommercialsSection({ totalQuantity, printingMethod, garmentType, addOnsCost, colorVariantsCost, rushSurchargePercent, commercials, onCommercialsChange }) {
    const [optimizingPrice, setOptimizingPrice] = (0, react_1.useState)(false);
    const [priceRecommendation, setPriceRecommendation] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        calculatePricing();
    }, [totalQuantity, printingMethod, garmentType, addOnsCost, colorVariantsCost, rushSurchargePercent, commercials.unitPrice, commercials.depositPercentage, commercials.taxInclusive]);
    const getPricingBreak = () => {
        const methodPricing = PRICING_MATRIX[printingMethod];
        if (!methodPricing)
            return null;
        const garmentPricing = methodPricing[garmentType] || methodPricing['t-shirt'];
        if (!garmentPricing)
            return null;
        return garmentPricing.find(break_ => totalQuantity >= break_.minQuantity && totalQuantity <= break_.maxQuantity) || null;
    };
    const calculatePricing = () => {
        const pricingBreak = getPricingBreak();
        const unitPrice = commercials.unitPrice || (pricingBreak?.basePrice || 200);
        const subtotal = unitPrice * totalQuantity;
        const rushSurchargeAmount = (subtotal * rushSurchargePercent) / 100;
        const totalBeforeDiscount = subtotal + addOnsCost + colorVariantsCost + rushSurchargeAmount;
        const quantityDiscount = pricingBreak?.discount || 0;
        const discountAmount = (subtotal * quantityDiscount) / 100;
        const finalTotal = totalBeforeDiscount - discountAmount;
        const depositAmount = (finalTotal * commercials.depositPercentage) / 100;
        const balanceAmount = finalTotal - depositAmount;
        const updatedCommercials = {
            ...commercials,
            unitPrice,
            subtotal,
            addOnsCost,
            colorVariantsCost,
            rushSurcharge: rushSurchargeAmount,
            quantityDiscount: discountAmount,
            finalTotal: commercials.taxInclusive ? finalTotal : finalTotal * 1.12, // Add 12% VAT if not inclusive
            depositAmount: commercials.taxInclusive ? depositAmount : depositAmount * 1.12,
            balanceAmount: commercials.taxInclusive ? balanceAmount : balanceAmount * 1.12
        };
        onCommercialsChange(updatedCommercials);
    };
    const optimizeWithAshley = async () => {
        setOptimizingPrice(true);
        try {
            // Simulate Ashley AI price optimization
            await new Promise(resolve => setTimeout(resolve, 3000));
            const pricingBreak = getPricingBreak();
            if (!pricingBreak)
                return;
            const suggestions = [];
            // Volume discount opportunities
            const nextBreak = PRICING_MATRIX[printingMethod][garmentType]?.find(break_ => break_.minQuantity > totalQuantity);
            if (nextBreak) {
                const additionalQty = nextBreak.minQuantity - totalQuantity;
                const savings = (commercials.unitPrice - nextBreak.basePrice) * nextBreak.minQuantity;
                suggestions.push(`Add ${additionalQty} pieces to reach next price break (₱${nextBreak.basePrice}/pc) for total savings of ₱${savings.toLocaleString()}`);
            }
            // Competitive pricing analysis
            const currentMargin = ((commercials.unitPrice - 80) / commercials.unitPrice) * 100; // Assuming ₱80 base cost
            if (currentMargin > 60) {
                suggestions.push('Price is competitive with good margin. Consider slight reduction for bulk orders.');
            }
            else if (currentMargin < 30) {
                suggestions.push('Margin is tight. Consider increasing price or optimizing production costs.');
            }
            // Market timing
            suggestions.push('Current market conditions favor standard pricing. No seasonal adjustments needed.');
            setPriceRecommendation(suggestions.join(' | '));
            react_hot_toast_1.toast.success('Ashley AI pricing optimization completed');
        }
        catch (error) {
            console.error('Price optimization error:', error);
            react_hot_toast_1.toast.error('Ashley AI optimization failed');
        }
        finally {
            setOptimizingPrice(false);
        }
    };
    const applySuggestedPrice = () => {
        const pricingBreak = getPricingBreak();
        if (pricingBreak) {
            onCommercialsChange({
                ...commercials,
                unitPrice: pricingBreak.basePrice
            });
            react_hot_toast_1.toast.success('Applied suggested pricing');
        }
    };
    const pricingBreak = getPricingBreak();
    const nextBreak = PRICING_MATRIX[printingMethod]?.[garmentType]?.find(break_ => break_.minQuantity > totalQuantity);
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          F. Commercials
          <badge_1.Badge variant="secondary">Required</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Pricing Break Information */}
        {pricingBreak && (<div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <lucide_react_1.TrendingDown className="w-5 h-5 text-green-600"/>
                <h4 className="font-medium text-green-900">
                  Volume Pricing Applied
                </h4>
              </div>
              <badge_1.Badge variant="outline" className="text-green-700 border-green-300">
                {pricingBreak.discount}% discount
              </badge_1.Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700 font-medium">Current Break:</span>
                <div className="text-green-800">
                  {pricingBreak.minQuantity} - {pricingBreak.maxQuantity} pieces
                </div>
              </div>
              <div>
                <span className="text-green-700 font-medium">Base Price:</span>
                <div className="text-green-800">₱{pricingBreak.basePrice}/piece</div>
              </div>
            </div>

            {nextBreak && (<div className="mt-3 p-3 bg-blue-50 rounded border">
                <p className="text-sm text-blue-800">
                  <strong>Next break:</strong> Order {nextBreak.minQuantity} pieces for ₱{nextBreak.basePrice}/piece 
                  ({nextBreak.discount}% discount)
                </p>
              </div>)}
          </div>)}

        {/* Pricing Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label_1.Label>Unit Price (₱) *</label_1.Label>
            <div className="flex gap-2">
              <input_1.Input type="number" step="0.01" value={commercials.unitPrice || ''} onChange={(e) => onCommercialsChange({
            ...commercials,
            unitPrice: parseFloat(e.target.value) || 0
        })} placeholder="0.00"/>
              {pricingBreak && (<button_1.Button variant="outline" onClick={applySuggestedPrice} disabled={commercials.unitPrice === pricingBreak.basePrice}>
                  Use Suggested
                </button_1.Button>)}
            </div>
          </div>

          <div>
            <label_1.Label>Deposit Percentage (%)</label_1.Label>
            <input_1.Input type="number" min="0" max="100" value={commercials.depositPercentage || ''} onChange={(e) => onCommercialsChange({
            ...commercials,
            depositPercentage: parseInt(e.target.value) || 50
        })}/>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label_1.Label>Payment Terms</label_1.Label>
            <select_1.Select value={commercials.paymentTerms} onValueChange={(value) => onCommercialsChange({
            ...commercials,
            paymentTerms: value
        })}>
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {PAYMENT_TERMS.map(term => (<select_1.SelectItem key={term.value} value={term.value}>
                    <div>
                      <div className="font-medium">{term.label}</div>
                      <div className="text-sm text-muted-foreground">{term.description}</div>
                    </div>
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div>
            <label_1.Label>Currency</label_1.Label>
            <select_1.Select value={commercials.currency} onValueChange={(value) => onCommercialsChange({
            ...commercials,
            currency: value
        })}>
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="PHP">Philippine Peso (₱)</select_1.SelectItem>
                <select_1.SelectItem value="USD">US Dollar ($)</select_1.SelectItem>
                <select_1.SelectItem value="EUR">Euro (€)</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <switch_1.Switch checked={commercials.taxInclusive} onCheckedChange={(checked) => onCommercialsChange({
            ...commercials,
            taxInclusive: checked
        })}/>
            <label_1.Label>Tax Inclusive (12% VAT)</label_1.Label>
          </div>
        </div>

        {/* Ashley AI Price Optimization */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <lucide_react_1.Sparkles className="w-5 h-5 text-purple-600"/>
              <h4 className="font-medium text-purple-900">Ashley AI Price Optimization</h4>
            </div>
            <button_1.Button variant="outline" size="sm" onClick={optimizeWithAshley} disabled={optimizingPrice || totalQuantity === 0}>
              {optimizingPrice ? (<>
                  <lucide_react_1.Sparkles className="w-4 h-4 mr-2 animate-pulse"/>
                  Optimizing...
                </>) : (<>
                  <lucide_react_1.Calculator className="w-4 h-4 mr-2"/>
                  Optimize Pricing
                </>)}
            </button_1.Button>
          </div>
          
          {priceRecommendation && (<div className="text-sm text-purple-800 bg-purple-100 rounded p-3">
              <strong>Recommendations:</strong> {priceRecommendation}
            </div>)}
        </div>

        <separator_1.Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <lucide_react_1.DollarSign className="w-4 h-4"/>
            Pricing Breakdown
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Subtotal ({totalQuantity} × ₱{commercials.unitPrice})</span>
              <span>₱{commercials.subtotal.toLocaleString()}</span>
            </div>
            
            {addOnsCost > 0 && (<div className="flex justify-between items-center text-blue-600">
                <span>Add-ons Cost</span>
                <span>₱{addOnsCost.toLocaleString()}</span>
              </div>)}
            
            {colorVariantsCost > 0 && (<div className="flex justify-between items-center text-purple-600">
                <span>Color Variants Cost</span>
                <span>₱{colorVariantsCost.toLocaleString()}</span>
              </div>)}
            
            {commercials.rushSurcharge > 0 && (<div className="flex justify-between items-center text-amber-600">
                <span>Rush Surcharge ({rushSurchargePercent}%)</span>
                <span>₱{commercials.rushSurcharge.toLocaleString()}</span>
              </div>)}
            
            {commercials.quantityDiscount > 0 && (<div className="flex justify-between items-center text-green-600">
                <span>Quantity Discount ({pricingBreak?.discount}%)</span>
                <span>-₱{commercials.quantityDiscount.toLocaleString()}</span>
              </div>)}
            
            {!commercials.taxInclusive && (<div className="flex justify-between items-center text-gray-600">
                <span>VAT (12%)</span>
                <span>₱{((commercials.finalTotal / 1.12) * 0.12).toLocaleString()}</span>
              </div>)}
            
            <separator_1.Separator />
            
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span>₱{commercials.finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <separator_1.Separator />

        {/* Payment Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <lucide_react_1.Percent className="w-4 h-4"/>
            Payment Breakdown
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-900 font-medium mb-1">Deposit ({commercials.depositPercentage}%)</div>
              <div className="text-2xl font-bold text-blue-700">
                ₱{commercials.depositAmount.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600 mt-1">Due upon order confirmation</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-900 font-medium mb-1">Balance ({100 - commercials.depositPercentage}%)</div>
              <div className="text-2xl font-bold text-green-700">
                ₱{commercials.balanceAmount.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Due {PAYMENT_TERMS.find(t => t.value === commercials.paymentTerms)?.label.toLowerCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Profitability Indicator */}
        {commercials.unitPrice > 0 && (<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <lucide_react_1.AlertCircle className="w-4 h-4 text-gray-600"/>
              <span className="font-medium text-gray-900">Estimated Margin</span>
            </div>
            <div className="text-sm text-gray-700">
              Based on estimated production cost of ₱80/piece:
              <span className="font-medium ml-2">
                {Math.round(((commercials.unitPrice - 80) / commercials.unitPrice) * 100)}% margin
              </span>
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
