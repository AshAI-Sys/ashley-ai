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
exports.default = NewOrderPageContent;
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
const order_details_section_1 = require("@/components/order-intake/order-details-section");
const graphic_editing_section_1 = require("@/components/order-intake/graphic-editing-section");
// UI Components
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const separator_1 = require("@/components/ui/separator");
const progress_1 = require("@/components/ui/progress");
function NewOrderPageContent() {
    const router = (0, navigation_1.useRouter)();
    // Prevent hydration mismatch by only rendering on client
    const [mounted, setMounted] = (0, react_1.useState)(false);
    const [hasDraft, setHasDraft] = (0, react_1.useState)(false);
    // Loading and submission states
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    // Client data
    const [clients, setClients] = (0, react_1.useState)([]);
    // Form state - Section A: Client & Brand
    const [selectedClientId, setSelectedClientId] = (0, react_1.useState)("");
    const [selectedBrandId, setSelectedBrandId] = (0, react_1.useState)("");
    const [channel, setChannel] = (0, react_1.useState)("");
    // Form state - Section B: Product & Design
    const [garmentType, setGarmentType] = (0, react_1.useState)("");
    const [printingMethod, setPrintingMethod] = (0, react_1.useState)("");
    const [designFiles, setDesignFiles] = (0, react_1.useState)([]);
    // Form state - Section C: Quantities & Size Curve
    const [totalQuantity, setTotalQuantity] = (0, react_1.useState)(0);
    const [sizeCurve, setSizeCurve] = (0, react_1.useState)({
        XS: 0,
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0,
        XXXL: 0,
    });
    // Form state - Section D: Variants & Add-ons
    const [colorVariants, setColorVariants] = (0, react_1.useState)([
        {
            id: "1",
            name: "",
            hexCode: "#000000",
            percentage: 100,
            quantity: 0,
        },
    ]);
    const [selectedAddOns, setSelectedAddOns] = (0, react_1.useState)([]);
    const [addOnsCost, setAddOnsCost] = (0, react_1.useState)(0);
    const [colorVariantsCost, setColorVariantsCost] = (0, react_1.useState)(0);
    // Form state - Section E: Dates & SLAs
    const [deliveryDate, setDeliveryDate] = (0, react_1.useState)("");
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
        paymentTerms: "net_15",
        taxInclusive: true,
        currency: "PHP",
        finalTotal: 0,
        depositAmount: 0,
        balanceAmount: 0,
    });
    // Form state - Section G: Production Route
    const [selectedRoute, setSelectedRoute] = (0, react_1.useState)("");
    // Form state - Section H: Files & Notes
    const [uploadedFiles, setUploadedFiles] = (0, react_1.useState)([]);
    const [specialInstructions, setSpecialInstructions] = (0, react_1.useState)("");
    // Form state - New Order Details fields
    const [poNumber, setPoNumber] = (0, react_1.useState)("");
    const [orderType, setOrderType] = (0, react_1.useState)("NEW");
    const [designName, setDesignName] = (0, react_1.useState)("");
    const [fabricType, setFabricType] = (0, react_1.useState)("");
    const [sizeDistributionType, setSizeDistributionType] = (0, react_1.useState)("");
    // Form state - Graphic Editing Section
    const [artistFilename, setArtistFilename] = (0, react_1.useState)("");
    const [mockupImageUrl, setMockupImageUrl] = (0, react_1.useState)("");
    const [notesRemarks, setNotesRemarks] = (0, react_1.useState)("");
    const [printLocations, setPrintLocations] = (0, react_1.useState)([]);
    // Set mounted state on client
    (0, react_1.useEffect)(() => {
        setMounted(true);
        // Check for draft only on client
        if (typeof window !== "undefined") {
            setHasDraft(!!localStorage.getItem("orderFormDraft"));
        }
    }, []);
    // Load clients on component mount (only on client)
    (0, react_1.useEffect)(() => {
        if (mounted) {
            fetchClients();
            loadDraft();
        }
    }, [mounted]);
    // Auto-save draft every time form data changes
    (0, react_1.useEffect)(() => {
        const draftData = {
            selectedClientId,
            selectedBrandId,
            channel,
            garmentType,
            printingMethod,
            totalQuantity,
            sizeCurve,
            colorVariants,
            selectedAddOns,
            deliveryDate,
            selectedRoute,
            specialInstructions,
            poNumber,
            orderType,
            designName,
            fabricType,
            sizeDistributionType,
            artistFilename,
            mockupImageUrl,
            notesRemarks,
            commercials,
            timestamp: new Date().toISOString(),
        };
        // Save to localStorage
        if (typeof window !== "undefined") {
            localStorage.setItem("orderFormDraft", JSON.stringify(draftData));
            setHasDraft(true);
        }
    }, [
        selectedClientId,
        selectedBrandId,
        channel,
        garmentType,
        printingMethod,
        totalQuantity,
        sizeCurve,
        colorVariants,
        selectedAddOns,
        deliveryDate,
        selectedRoute,
        specialInstructions,
        poNumber,
        orderType,
        designName,
        fabricType,
        sizeDistributionType,
        artistFilename,
        mockupImageUrl,
        notesRemarks,
        commercials,
    ]);
    const loadDraft = () => {
        if (typeof window === "undefined")
            return;
        try {
            const savedDraft = localStorage.getItem("orderFormDraft");
            if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                // Restore all form fields
                if (draft.selectedClientId)
                    setSelectedClientId(draft.selectedClientId);
                if (draft.selectedBrandId)
                    setSelectedBrandId(draft.selectedBrandId);
                if (draft.channel)
                    setChannel(draft.channel);
                if (draft.garmentType)
                    setGarmentType(draft.garmentType);
                if (draft.printingMethod)
                    setPrintingMethod(draft.printingMethod);
                if (draft.totalQuantity)
                    setTotalQuantity(draft.totalQuantity);
                if (draft.sizeCurve)
                    setSizeCurve(draft.sizeCurve);
                if (draft.colorVariants)
                    setColorVariants(draft.colorVariants);
                if (draft.selectedAddOns)
                    setSelectedAddOns(draft.selectedAddOns);
                if (draft.deliveryDate)
                    setDeliveryDate(draft.deliveryDate);
                if (draft.selectedRoute)
                    setSelectedRoute(draft.selectedRoute);
                if (draft.specialInstructions)
                    setSpecialInstructions(draft.specialInstructions);
                if (draft.poNumber)
                    setPoNumber(draft.poNumber);
                if (draft.orderType)
                    setOrderType(draft.orderType);
                if (draft.designName)
                    setDesignName(draft.designName);
                if (draft.fabricType)
                    setFabricType(draft.fabricType);
                if (draft.sizeDistributionType)
                    setSizeDistributionType(draft.sizeDistributionType);
                if (draft.artistFilename)
                    setArtistFilename(draft.artistFilename);
                if (draft.mockupImageUrl)
                    setMockupImageUrl(draft.mockupImageUrl);
                if (draft.notesRemarks)
                    setNotesRemarks(draft.notesRemarks);
                if (draft.commercials)
                    setCommercials(draft.commercials);
                react_hot_toast_1.toast.success("Draft restored! Continue where you left off.");
            }
        }
        catch (error) {
            console.error("Failed to load draft:", error);
        }
    };
    const clearDraft = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("orderFormDraft");
            setHasDraft(false);
            react_hot_toast_1.toast.success("Draft cleared");
        }
    };
    const fetchClients = async () => {
        setLoading(true);
        try {
            // Get token from localStorage
            const token = localStorage.getItem("ash_token");
            if (!token) {
                console.error("❌ No authentication token found in localStorage");
                react_hot_toast_1.toast.error("Session expired. Please log in again.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
                setLoading(false);
                return;
            }
            console.log("🔍 Fetching clients with token:", token.substring(0, 20) + "...");
            const response = await fetch("/api/clients?include=brands", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("📡 Response status:", response.status, response.statusText);
            if (!response.ok) {
                // Handle 401 Unauthorized - token invalid/expired
                if (response.status === 401) {
                    console.error("❌ 401 Unauthorized - Token invalid or expired");
                    react_hot_toast_1.toast.error("Session expired. Please log in again.");
                    // Clear invalid token
                    localStorage.removeItem("ash_token");
                    localStorage.removeItem("ash_user");
                    // Redirect to login after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1500);
                    setLoading(false);
                    return;
                }
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                console.error("❌ API Error:", errorData);
                throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
            }
            const data = await response.json();
            console.log("✅ Clients data:", data);
            if (data.data && data.data.clients) {
                setClients(data.data.clients);
            }
            else if (Array.isArray(data)) {
                // Handle if API returns array directly
                setClients(data);
            }
        }
        catch (error) {
            console.error("Failed to fetch clients:", error);
            react_hot_toast_1.toast.error("Failed to load clients. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    // Event handlers
    const handleClientCreated = (newClient) => {
        setClients(prev => {
            // Check if client already exists (update scenario when adding brand)
            const existingIndex = prev.findIndex(c => c.id === newClient.id);
            if (existingIndex >= 0) {
                // Update existing client (e.g., when new brand was added)
                const updated = [...prev];
                updated[existingIndex] = newClient;
                return updated;
            }
            else {
                // Add new client
                return [...prev, newClient];
            }
        });
    };
    const handlePricingUpdate = (addOnsTotal, colorVariantsTotal) => {
        setAddOnsCost(addOnsTotal);
        setColorVariantsCost(colorVariantsTotal);
    };
    const handleTimelineValidation = (validation) => {
        // Handle timeline validation results
        console.log("Timeline validation:", validation);
    };
    const handleRushSurcharge = (percent) => {
        setRushSurchargePercent(percent);
    };
    const handleRouteOptimized = (optimization) => {
        // Handle route optimization results
        console.log("Route optimization:", optimization);
    };
    // Form validation
    const validateForm = () => {
        const errors = [];
        // Required field validations
        if (!selectedClientId)
            errors.push("Please select a client");
        if (!selectedBrandId)
            errors.push("Please select a brand");
        if (!garmentType)
            errors.push("Please select garment type");
        if (!printingMethod)
            errors.push("Please select printing method");
        if (totalQuantity === 0)
            errors.push("Please set total quantity");
        if (!deliveryDate)
            errors.push("Please set delivery date");
        if (commercials.unitPrice === 0)
            errors.push("Please set unit price");
        if (!selectedRoute)
            errors.push("Please select production route");
        // Size curve validation
        const sizeCurveTotal = Object.values(sizeCurve).reduce((sum, qty) => sum + qty, 0);
        if (sizeCurveTotal !== totalQuantity) {
            errors.push("Size breakdown must equal total quantity");
        }
        // Design files validation
        if (designFiles.length === 0) {
            errors.push("Please upload at least one design file");
        }
        if (errors.length > 0) {
            errors.forEach(error => react_hot_toast_1.toast.error(error));
            return false;
        }
        return true;
    };
    // Form submission
    const handleSubmit = async (action) => {
        if (action === "submit" && !validateForm()) {
            return;
        }
        setSubmitting(true);
        try {
            const orderData = {
                // Client & Brand
                clientId: selectedClientId,
                brandId: selectedBrandId,
                channel,
                // Order Details (NEW)
                po_number: poNumber,
                order_type: orderType,
                design_name: designName,
                fabric_type: fabricType,
                size_distribution: JSON.stringify({ type: sizeDistributionType }),
                // Product & Design
                garment_type: garmentType,
                printing_method: printingMethod,
                design_files: designFiles.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type,
                })),
                // Graphic Editing (NEW)
                artist_filename: artistFilename,
                mockup_url: mockupImageUrl,
                notes_remarks: notesRemarks,
                print_locations: JSON.stringify(printLocations),
                // Quantities & Sizes
                total_quantity: totalQuantity,
                size_breakdown: JSON.stringify(sizeCurve),
                // Variants & Add-ons
                color_variants: JSON.stringify(colorVariants),
                add_ons: selectedAddOns,
                add_ons_cost: addOnsCost,
                color_variants_cost: colorVariantsCost,
                // Dates & SLAs
                deliveryDate: deliveryDate,
                rush_surcharge_percent: rushSurchargePercent,
                // Commercials
                unitPrice: commercials.unitPrice,
                totalAmount: commercials.finalTotal,
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
                    size: f.size,
                })),
                special_instructions: specialInstructions,
                // Status
                status: action === "draft" ? "DRAFT" : "PENDING_APPROVAL",
            };
            console.log("Order data being sent:", orderData);
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success(`Order ${action === "draft" ? "saved as draft" : "submitted for processing"}`);
                // Clear draft on successful submission
                clearDraft();
                // API returns { success: true, data: { order: { id: ... } } }
                const orderId = result.data?.order?.id || result.id;
                router.push(`/orders/${orderId}`);
            }
            else {
                react_hot_toast_1.toast.error(result.message || "Failed to create order");
            }
        }
        catch (error) {
            console.error("Submit error:", error);
            react_hot_toast_1.toast.error("Failed to create order");
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
        if (totalQuantity > 0 &&
            Object.values(sizeCurve).reduce((sum, qty) => sum + qty, 0) ===
                totalQuantity)
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
    // Prevent hydration mismatch - don't render until mounted on client
    if (!mounted) {
        return (<div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>);
    }
    return (<div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Back Button */}
            <button onClick={() => router.push("/orders")} className="mt-1 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" title="Back to Orders">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>

            <div>
              <h1 className="text-3xl font-bold">New Production Order</h1>
              <p className="text-muted-foreground">
                Create a comprehensive production order with Ashley AI
                assistance
              </p>
            </div>
          </div>

          {hasDraft && (<button onClick={clearDraft} className="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50">
              Clear Draft
            </button>)}
        </div>

        {/* Draft Indicator */}
        {hasDraft && (<div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="break-words text-sm font-medium text-blue-900">
              Draft auto-saved • Your progress is preserved even if you navigate
              away
            </span>
          </div>)}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Completion Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <progress_1.Progress value={progress} className="h-2"/>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* A. Client & Brand */}
          <client_brand_section_1.ClientBrandSection clients={clients} selectedClientId={selectedClientId} selectedBrandId={selectedBrandId} channel={channel} onClientChange={setSelectedClientId} onBrandChange={setSelectedBrandId} onChannelChange={setChannel} onClientCreated={handleClientCreated}/>

          {/* A2. Order Details */}
          <order_details_section_1.OrderDetailsSection poNumber={poNumber} orderType={orderType} designName={designName} fabricType={fabricType} sizeDistributionType={sizeDistributionType} onPoNumberChange={setPoNumber} onOrderTypeChange={setOrderType} onDesignNameChange={setDesignName} onFabricTypeChange={setFabricType} onSizeDistributionTypeChange={setSizeDistributionType}/>

          {/* B. Product & Design */}
          <product_design_section_1.ProductDesignSection garmentType={garmentType} printingMethod={printingMethod} designFiles={designFiles} onGarmentTypeChange={setGarmentType} onPrintingMethodChange={setPrintingMethod} onDesignFilesChange={setDesignFiles}/>

          {/* B2. Graphic Editing Section */}
          <graphic_editing_section_1.GraphicEditingSection artistFilename={artistFilename} mockupImageUrl={mockupImageUrl} notesRemarks={notesRemarks} printLocations={printLocations} onArtistFilenameChange={setArtistFilename} onMockupImageUrlChange={setMockupImageUrl} onNotesRemarksChange={setNotesRemarks} onPrintLocationsChange={setPrintLocations}/>

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
            commercials,
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
                <span className="text-sm font-medium">
                  {totalQuantity.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Design Files:</span>
                <span className="text-sm font-medium">
                  {designFiles.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Color Variants:</span>
                <span className="text-sm font-medium">
                  {colorVariants.filter(v => v.quantity > 0).length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Add-ons:</span>
                <span className="text-sm font-medium">
                  {selectedAddOns.length}
                </span>
              </div>

              <separator_1.Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₱{commercials.finalTotal.toLocaleString()}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                {commercials.taxInclusive ? "Tax inclusive" : "Plus 12% VAT"}
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
                <div className="mb-1 flex justify-between">
                  <span>Form Completion:</span>
                  <span>{progress}%</span>
                </div>
                <progress_1.Progress value={progress} className="h-2"/>
              </div>

              <separator_1.Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={selectedClientId ? "default" : "secondary"} className="h-3 w-3 rounded-full p-0"/>
                  <span>Client & Brand</span>
                </div>
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={garmentType && printingMethod ? "default" : "secondary"} className="h-3 w-3 rounded-full p-0"/>
                  <span>Product & Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={totalQuantity > 0 ? "default" : "secondary"} className="h-3 w-3 rounded-full p-0"/>
                  <span>Quantities & Sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={deliveryDate ? "default" : "secondary"} className="h-3 w-3 rounded-full p-0"/>
                  <span>Delivery Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <badge_1.Badge variant={commercials.unitPrice > 0 ? "default" : "secondary"} className="h-3 w-3 rounded-full p-0"/>
                  <span>Pricing</span>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>);
}
