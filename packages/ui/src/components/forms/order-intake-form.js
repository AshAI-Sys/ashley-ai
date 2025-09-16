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
exports.OrderIntakeForm = void 0;
const React = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const date_fns_1 = require("date-fns");
const button_1 = require("../button");
const input_1 = require("../input");
const select_1 = require("../select");
const card_1 = require("../card");
const form_1 = require("../form");
const size_curve_input_1 = require("../manufacturing/size-curve-input");
const ashley_alert_1 = require("../manufacturing/ashley-alert");
const badge_1 = require("../badge");
const calendar_1 = require("../calendar");
const popover_1 = require("../popover");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
const materialSchema = zod_2.z.object({
    type: zod_2.z.string().min(1, "Material type is required"),
    description: zod_2.z.string().optional(),
    quantity: zod_2.z.number().positive("Quantity must be positive"),
    unit: zod_2.z.enum(["YARDS", "METERS", "PIECES", "KG", "GRAMS"], {
        required_error: "Please select a unit",
    }),
    color: zod_2.z.string().optional(),
    supplier: zod_2.z.string().optional(),
});
const orderIntakeFormSchema = zod_2.z.object({
    clientId: zod_2.z.string().min(1, "Please select a client"),
    orderNumber: zod_2.z.string().optional(),
    garmentType: zod_2.z.enum([
        "T_SHIRT", "POLO_SHIRT", "DRESS_SHIRT", "BLOUSE", "DRESS",
        "PANTS", "SHORTS", "SKIRT", "JACKET", "HOODIE", "UNIFORM", "OTHER"
    ], {
        required_error: "Please select a garment type",
    }),
    customGarmentType: zod_2.z.string().optional(),
    description: zod_2.z.string().min(5, "Please provide a detailed description"),
    quantity: zod_2.z.number().positive("Quantity must be greater than 0"),
    sizeCurve: zod_2.z.record(zod_2.z.number().nonnegative()).refine((curve) => Object.values(curve).reduce((sum, qty) => sum + qty, 0) > 0, "Size curve must have at least one size with quantity > 0"),
    targetPrice: zod_2.z.number().positive("Target price must be positive").optional(),
    maxPrice: zod_2.z.number().positive("Maximum price must be positive").optional(),
    deadline: zod_2.z.date({
        required_error: "Please select a deadline",
    }),
    priority: zod_2.z.enum(["LOW", "NORMAL", "HIGH", "URGENT"], {
        required_error: "Please select priority level",
    }),
    materials: zod_2.z.array(materialSchema).min(1, "At least one material is required"),
    colorways: zod_2.z.array(zod_2.z.string()).min(1, "At least one colorway is required"),
    specifications: zod_2.z.object({
        printingMethod: zod_2.z.enum(["SCREEN", "DIGITAL", "HEAT_TRANSFER", "EMBROIDERY", "NONE"]).optional(),
        fabricWeight: zod_2.z.string().optional(),
        fitType: zod_2.z.enum(["SLIM", "REGULAR", "LOOSE", "OVERSIZED"]).optional(),
        neckType: zod_2.z.string().optional(),
        sleeveLength: zod_2.z.string().optional(),
        hemType: zod_2.z.string().optional(),
        pocketType: zod_2.z.string().optional(),
    }).optional(),
    designFiles: zod_2.z.array(zod_2.z.string()).optional(),
    referenceImages: zod_2.z.array(zod_2.z.string()).optional(),
    specialRequirements: zod_2.z.string().optional(),
    packagingRequirements: zod_2.z.string().optional(),
});
const garmentTypeLabels = {
    T_SHIRT: "T-Shirt",
    POLO_SHIRT: "Polo Shirt",
    DRESS_SHIRT: "Dress Shirt",
    BLOUSE: "Blouse",
    DRESS: "Dress",
    PANTS: "Pants/Trousers",
    SHORTS: "Shorts",
    SKIRT: "Skirt",
    JACKET: "Jacket",
    HOODIE: "Hoodie/Sweatshirt",
    UNIFORM: "Uniform",
    OTHER: "Other (Custom)",
};
const materialUnits = {
    YARDS: "Yards",
    METERS: "Meters",
    PIECES: "Pieces",
    KG: "Kilograms",
    GRAMS: "Grams",
};
const printingMethods = {
    SCREEN: "Screen Printing",
    DIGITAL: "Digital Printing",
    HEAT_TRANSFER: "Heat Transfer",
    EMBROIDERY: "Embroidery",
    NONE: "No Printing",
};
const fitTypes = {
    SLIM: "Slim Fit",
    REGULAR: "Regular Fit",
    LOOSE: "Loose Fit",
    OVERSIZED: "Oversized",
};
exports.OrderIntakeForm = React.forwardRef(({ initialData, clients, onSubmit, onCancel, onValidate, isLoading = false, ashleyAnalysis, className }, ref) => {
    const [isValidating, setIsValidating] = React.useState(false);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(orderIntakeFormSchema),
        defaultValues: {
            clientId: "",
            garmentType: "T_SHIRT",
            description: "",
            quantity: 100,
            sizeCurve: { M: 40, L: 35, XL: 25 },
            priority: "NORMAL",
            materials: [
                {
                    type: "Cotton Fabric",
                    quantity: 50,
                    unit: "YARDS",
                    color: "",
                    supplier: "",
                },
            ],
            colorways: ["White"],
            specifications: {
                fitType: "REGULAR",
                printingMethod: "SCREEN",
            },
            ...initialData,
        },
    });
    const { fields: materialFields, append: addMaterial, remove: removeMaterial } = (0, react_hook_form_1.useFieldArray)({
        control: form.control,
        name: "materials",
    });
    const { fields: colorwayFields, append: addColorway, remove: removeColorway } = (0, react_hook_form_1.useFieldArray)({
        control: form.control,
        name: "colorways",
    });
    const watchedGarmentType = form.watch("garmentType");
    const watchedQuantity = form.watch("quantity");
    const watchedSizeCurve = form.watch("sizeCurve");
    // Auto-validate total quantity matches size curve
    React.useEffect(() => {
        const sizeCurveTotal = Object.values(watchedSizeCurve || {}).reduce((sum, qty) => sum + qty, 0);
        if (sizeCurveTotal > 0 && sizeCurveTotal !== watchedQuantity) {
            form.setValue("quantity", sizeCurveTotal);
        }
    }, [watchedSizeCurve, form]);
    const handleValidate = async () => {
        if (!onValidate)
            return;
        setIsValidating(true);
        try {
            const currentData = form.getValues();
            await onValidate(currentData);
        }
        catch (error) {
            console.error("Validation error:", error);
        }
        finally {
            setIsValidating(false);
        }
    };
    const handleSubmit = async (data) => {
        try {
            await onSubmit(data);
        }
        catch (error) {
            console.error("Order form submission error:", error);
        }
    };
    return (<div className={(0, utils_1.cn)("space-y-6", className)}>
        {ashleyAnalysis && (<ashley_alert_1.AshleyAlert risk={ashleyAnalysis.risk} issues={ashleyAnalysis.issues} recommendations={ashleyAnalysis.recommendations} confidence={ashleyAnalysis.confidence}/>)}

        <form_1.Form {...form}>
          <form ref={ref} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Basic Order Information */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Package className="h-5 w-5"/>
                  Order Details
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Basic information about the production order
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form_1.FormField control={form.control} name="clientId" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Client *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Select client"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {clients.map((client) => (<select_1.SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{client.name}</span>
                                  <badge_1.Badge variant="outline" className="ml-2">
                                    {client.businessType}
                                  </badge_1.Badge>
                                </div>
                              </select_1.SelectItem>))}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="priority" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Priority Level *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            <select_1.SelectItem value="LOW">
                              <span className="text-green-600">Low Priority</span>
                            </select_1.SelectItem>
                            <select_1.SelectItem value="NORMAL">Normal Priority</select_1.SelectItem>
                            <select_1.SelectItem value="HIGH">
                              <span className="text-orange-600">High Priority</span>
                            </select_1.SelectItem>
                            <select_1.SelectItem value="URGENT">
                              <span className="text-red-600">Urgent</span>
                            </select_1.SelectItem>
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>

                <form_1.FormField control={form.control} name="description" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Order Description *</form_1.FormLabel>
                      <form_1.FormControl>
                        <textarea {...field} className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Detailed description of the garment requirements..."/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form_1.FormField control={form.control} name="deadline" render={({ field }) => (<form_1.FormItem className="flex flex-col">
                        <form_1.FormLabel className="flex items-center gap-2">
                          <lucide_react_1.Calendar className="h-4 w-4"/>
                          Deadline *
                        </form_1.FormLabel>
                        <popover_1.Popover>
                          <popover_1.PopoverTrigger asChild>
                            <form_1.FormControl>
                              <button_1.Button variant="outline" className={(0, utils_1.cn)("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? ((0, date_fns_1.format)(field.value, "PPP")) : (<span>Pick a date</span>)}
                                <lucide_react_1.Calendar className="ml-auto h-4 w-4 opacity-50"/>
                              </button_1.Button>
                            </form_1.FormControl>
                          </popover_1.PopoverTrigger>
                          <popover_1.PopoverContent className="w-auto p-0" align="start">
                            <calendar_1.Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus/>
                          </popover_1.PopoverContent>
                        </popover_1.Popover>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <div className="flex items-end gap-2">
                    <button_1.Button type="button" variant="outline" onClick={handleValidate} disabled={isValidating} className="flex-1">
                      {isValidating && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                      Validate with Ashley AI
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Garment Specifications */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Palette className="h-5 w-5"/>
                  Garment Specifications
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form_1.FormField control={form.control} name="garmentType" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Garment Type *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {Object.entries(garmentTypeLabels).map(([value, label]) => (<select_1.SelectItem key={value} value={value}>
                                {label}
                              </select_1.SelectItem>))}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  {watchedGarmentType === "OTHER" && (<form_1.FormField control={form.control} name="customGarmentType" render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel>Custom Garment Type *</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} placeholder="Specify garment type"/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <form_1.FormField control={form.control} name="specifications.fitType" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Fit Type</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {Object.entries(fitTypes).map(([value, label]) => (<select_1.SelectItem key={value} value={value}>
                                {label}
                              </select_1.SelectItem>))}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="specifications.printingMethod" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Printing Method</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {Object.entries(printingMethods).map(([value, label]) => (<select_1.SelectItem key={value} value={value}>
                                {label}
                              </select_1.SelectItem>))}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="specifications.fabricWeight" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Fabric Weight</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} placeholder="e.g., 180gsm"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Quantity & Sizing */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Ruler className="h-5 w-5"/>
                  Quantity & Size Distribution
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total quantity will be calculated from size distribution
                  </div>
                  <badge_1.Badge variant="outline" className="text-lg px-3 py-1">
                    {Object.values(watchedSizeCurve || {}).reduce((sum, qty) => sum + qty, 0)} pieces
                  </badge_1.Badge>
                </div>

                <form_1.FormField control={form.control} name="sizeCurve" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Size Distribution *</form_1.FormLabel>
                      <form_1.FormControl>
                        <size_curve_input_1.SizeCurveInput value={field.value} onChange={field.onChange} totalQuantity={watchedQuantity}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
              </card_1.CardContent>
            </card_1.Card>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              {onCancel && (<button_1.Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </button_1.Button>)}
              <button_1.Button type="submit" disabled={isLoading}>
                {isLoading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Create Order
              </button_1.Button>
            </div>
          </form>
        </form_1.Form>
      </div>);
});
exports.OrderIntakeForm.displayName = "OrderIntakeForm";
