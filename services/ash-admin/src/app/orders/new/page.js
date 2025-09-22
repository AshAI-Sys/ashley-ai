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
exports.default = NewOrderPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = require("react-hot-toast");
// Import all the new order intake components
const client_brand_section_1 = require("@/components/order-intake/client-brand-section");
const product_design_section_1 = require("@/components/order-intake/product-design-section");
const quantities_size_section_1 = require("@/components/order-intake/quantities-size-section");
const variants_addons_section_1 = require("@/components/order-intake/variants-addons-section");
const dates_slas_section_1 = require("@/components/order-intake/dates-slas-section");
const commercials_section_1 = require("@/components/order-intake/commercials-section");
const production_route_section_1 = require("@/components/order-intake/production-route-section");
const files_notes_section_1 = require("@/components/order-intake/files-notes-section");
const submit_section_1 = require("@/components/order-intake/submit-section");
// UI Components
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const separator_1 = require("@/components/ui/separator");
const progress_1 = require("@/components/ui/progress");
function NewOrderPage() {
    const router = (0, navigation_1.useRouter)();
    // Loading and submission states
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    // Client data
    const [clients, setClients] = (0, react_1.useState)([]);
    // Form state - Section A: Client & Brand
    const [selectedClientId, setSelectedClientId] = (0, react_1.useState)('');
    const [selectedBrandId, setSelectedBrandId] = (0, react_1.useState)('');
    const [channel, setChannel] = (0, react_1.useState)('');
    // Form state - Section B: Product & Design
    const [garmentType, setGarmentType] = (0, react_1.useState)('');
    const [printingMethod, setPrintingMethod] = (0, react_1.useState)('');
    const [designFiles, setDesignFiles] = (0, react_1.useState)([]);
    // Form state - Section C: Quantities & Size Curve
    const [totalQuantity, setTotalQuantity] = (0, react_1.useState)(0);
    const [sizeCurve, setSizeCurve] = (0, react_1.useState)({
        XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0
    });
    // Form state - Section D: Variants & Add-ons
    const [colorVariants, setColorVariants] = (0, react_1.useState)([{
            id: '1',
            name: '',
            hexCode: '#000000',
            percentage: 100,
            quantity: 0
        }]);
    const [selectedAddOns, setSelectedAddOns] = (0, react_1.useState)([]);
    const [addOnsCost, setAddOnsCost] = (0, react_1.useState)(0);
    const [colorVariantsCost, setColorVariantsCost] = (0, react_1.useState)(0);
    // Form state - Section E: Dates & SLAs
    const [deliveryDate, setDeliveryDate] = (0, react_1.useState)('');
    const [rushSurchargePercent, setRushSurchargePercent] = (0, react_1.useState)(0);
    // Form state - Section F: Commercials
    const [commercials, setCommercials] = (0, react_1.useState)({
        unitPrice: 0,
        subtotal: 0,
        addOnsCost: 0,
        colorVariantsCost: 0,
        rushSurcharge: 0,
        quantityDiscount: 0,
        depositPercentage: 50,
        paymentTerms: 'net_15',
        taxInclusive: true,
        currency: 'PHP',
        finalTotal: 0,
        depositAmount: 0,
        balanceAmount: 0
    });
    // Form state - Section G: Production Route
    const [selectedRoute, setSelectedRoute] = (0, react_1.useState)('');
    // Form state - Section H: Files & Notes
    const [uploadedFiles, setUploadedFiles] = (0, react_1.useState)([]);
    const [specialInstructions, setSpecialInstructions] = (0, react_1.useState)('');
    // Load clients on component mount
    (0, react_1.useEffect)(() => {
        fetchClients();
    }, []);
    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/clients?include=brands');
            const data = await response.json();
            if (data.data) {
                setClients(data.data);
            }
        }
        catch (error) {
            console.error('Failed to fetch clients:', error);
            react_hot_toast_1.toast.error('Failed to load clients');
        }
        finally {
            setLoading(false);
        }
    };
    // Event handlers
    const handleClientCreated = (newClient) => {
        setClients(prev => [...prev, newClient]);
    };
    const handlePricingUpdate = (addOnsTotal, colorVariantsTotal) => {
        setAddOnsCost(addOnsTotal);
        setColorVariantsCost(colorVariantsTotal);
    };
    const handleTimelineValidation = (validation) => {
        // Handle timeline validation results
        console.log('Timeline validation:', validation);
    };
    const handleRushSurcharge = (percent) => {
        setRushSurchargePercent(percent);
    };
    const handleRouteOptimized = (optimization) => {
        // Handle route optimization results
        console.log('Route optimization:', optimization);
    };
    // Form validation
    const validateForm = () => {
        const errors = [];
        // Required field validations
        if (!selectedClientId)
            errors.push('Please select a client');
        if (!selectedBrandId)
            errors.push('Please select a brand');
        if (!garmentType)
            errors.push('Please select garment type');
        if (!printingMethod)
            errors.push('Please select printing method');
        if (totalQuantity === 0)
            errors.push('Please set total quantity');
        if (!deliveryDate)
            errors.push('Please set delivery date');
        if (commercials.unitPrice === 0)
            errors.push('Please set unit price');
        if (!selectedRoute)
            errors.push('Please select production route');
        // Size curve validation
        const sizeCurveTotal = Object.values(sizeCurve).reduce((sum, qty) => sum + qty, 0);
        if (sizeCurveTotal !== totalQuantity) {
            errors.push('Size breakdown must equal total quantity');
        }
        // Design files validation
        if (designFiles.length === 0) {
            errors.push('Please upload at least one design file');
        }
        if (errors.length > 0) {
            errors.forEach(error => react_hot_toast_1.toast.error(error));
            return false;
        }
        return true;
    };
    // Form submission
    const handleSubmit = async (action) => {
        if (action === 'submit' && !validateForm()) {
            return;
        }
        setSubmitting(true);
        try {
            const orderData = {
                // Client & Brand
                client_id: selectedClientId,
                brand_id: selectedBrandId,
                channel,
                // Product & Design
                garment_type: garmentType,
                printing_method: printingMethod,
                design_files: designFiles.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type
                })),
                // Quantities & Sizes
                total_quantity: totalQuantity,
                size_breakdown: JSON.stringify(sizeCurve),
                // Variants & Add-ons
                color_variants: JSON.stringify(colorVariants),
                add_ons: selectedAddOns,
                add_ons_cost: addOnsCost,
                color_variants_cost: colorVariantsCost,
                // Dates & SLAs
                delivery_date: deliveryDate,
                rush_surcharge_percent: rushSurchargePercent,
                // Commercials
                unit_price: commercials.unitPrice,
                total_amount: commercials.finalTotal,
                deposit_percentage: commercials.depositPercentage,
                payment_terms: commercials.paymentTerms,
                tax_inclusive: commercials.taxInclusive,
                currency: commercials.currency,
                // Production Route
                production_route: selectedRoute,
                // Files & Notes
                additional_files: uploadedFiles.map(f => ({
                    name: f.name,
                    category: f.category,
                    size: f.size
                })),
                special_instructions: specialInstructions,
                // Status
                status: action === 'draft' ? 'draft' : 'intake'
            };
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success(`Order ${action === 'draft' ? 'saved as draft' : 'submitted for processing'}`);
                router.push(`/orders/${result.id}`);
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to create order');
            }
        }
        catch (error) {
            console.error('Submit error:', error);
            react_hot_toast_1.toast.error('Failed to create order');
        }
        finally {
            setSubmitting(false);
        }
    };
    // Calculate completion percentage
    const calculateProgress = () => {
        let completed = 0;
        const total = 9; // Total sections
        if (selectedClientId && selectedBrandId)
            completed++;
        if (garmentType && printingMethod && designFiles.length > 0)
            completed++;
        if (totalQuantity > 0 && Object.values(sizeCurve).reduce((sum, qty) => sum + qty, 0) === totalQuantity)
            completed++;
        if (colorVariants.length > 0)
            completed++;
        if (deliveryDate)
            completed++;
        if (commercials.unitPrice > 0)
            completed++;
        if (selectedRoute)
            completed++;
        completed++; // Files & Notes (optional)
        completed++; // Submit section (always available)
        return Math.round((completed / total) * 100);
    };
    const progress = calculateProgress();
    if (loading) {
        return (<div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>);
    }
    return (<div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Production Order</h1>
        <p className="text-muted-foreground">Create a comprehensive production order with Ashley AI assistance</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Completion Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <progress_1.Progress value={progress} className="h-2"/>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. Client & Brand */}
          <client_brand_section_1.ClientBrandSection clients={clients} selectedClientId={selectedClientId} selectedBrandId={selectedBrandId} channel={channel} onClientChange={setSelectedClientId} onBrandChange={setSelectedBrandId} onChannelChange={setChannel} onClientCreated={handleClientCreated}/>

          {/* B. Product & Design */}
          <product_design_section_1.ProductDesignSection garmentType={garmentType} printingMethod={printingMethod} designFiles={designFiles} onGarmentTypeChange={setGarmentType} onPrintingMethodChange={setPrintingMethod} onDesignFilesChange={setDesignFiles}/>

          {/* C. Quantities & Size Curve */}
          <quantities_size_section_1.QuantitiesSizeSection totalQuantity={totalQuantity} sizeCurve={sizeCurve} onTotalQuantityChange={setTotalQuantity} onSizeCurveChange={setSizeCurve}/>

          {/* D. Variants & Add-ons */}
          <variants_addons_section_1.VariantsAddonsSection totalQuantity={totalQuantity} colorVariants={colorVariants} selectedAddOns={selectedAddOns} onColorVariantsChange={setColorVariants} onAddOnsChange={setSelectedAddOns} onPricingUpdate={handlePricingUpdate}/>

          {/* E. Dates & SLAs */}
          <dates_slas_section_1.DatesSLAsSection deliveryDate={deliveryDate} printingMethod={printingMethod} totalQuantity={totalQuantity} onDeliveryDateChange={setDeliveryDate} onTimelineValidation={handleTimelineValidation} onRushSurcharge={handleRushSurcharge}/>

          {/* G. Production Route */}
          <production_route_section_1.ProductionRouteSection printingMethod={printingMethod} totalQuantity={totalQuantity} deliveryDate={deliveryDate} selectedRoute={selectedRoute} onRouteChange={setSelectedRoute} onRouteOptimized={handleRouteOptimized}/>

          {/* H. Files & Notes */}
          <files_notes_section_1.FilesNotesSection uploadedFiles={uploadedFiles} specialInstructions={specialInstructions} onFilesChange={setUploadedFiles} onInstructionsChange={setSpecialInstructions}/>

          {/* I. Submit */}
          <submit_section_1.SubmitSection formData={{
            selectedClientId,
            selectedBrandId,
            garmentType,
            printingMethod,
            totalQuantity,
            deliveryDate,
            commercials
        }} onSubmit={handleSubmit} isSubmitting={submitting}/>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* F. Commercials */}
          <commercials_section_1.CommercialsSection totalQuantity={totalQuantity} printingMethod={printingMethod} garmentType={garmentType} addOnsCost={addOnsCost} colorVariantsCost={colorVariantsCost} rushSurchargePercent={rushSurchargePercent} commercials={commercials} onCommercialsChange={setCommercials}/>

          {/* Order Summary */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Order Summary</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Quantity:</span>
                <span className="text-sm font-medium">{totalQuantity.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Design Files:</span>
                <span className="text-sm font-medium">{designFiles.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Color Variants:</span>
                <span className="text-sm font-medium">{colorVariants.filter(v => v.quantity > 0).length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Add-ons:</span>
                <span className="text-sm font-medium">{selectedAddOns.length}</span>
              </div>
              
              <separator_1.Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₱{commercials.finalTotal.toLocaleString()}</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {commercials.taxInclusive ? 'Tax inclusive' : 'Plus 12% VAT'}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Quick Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Quick Actions</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Form Completion:</span>
                  <span>{progress}%</span>
                </div>
                <progress_1.Progress value={progress} className="h-2"/>
              </div>
              
              <separator_1.Separator />
              
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={selectedClientId ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0"/>
                  <span>Client & Brand</span>
                </div>
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={garmentType && printingMethod ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0"/>
                  <span>Product & Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={totalQuantity > 0 ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0"/>
                  <span>Quantities & Sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={deliveryDate ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0"/>
                  <span>Delivery Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={commercials.unitPrice > 0 ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0"/>
                  <span>Pricing</span>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>);
}
