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
exports.ClientForm = void 0;
const React = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const button_1 = require("../button");
const input_1 = require("../input");
const select_1 = require("../select");
const card_1 = require("../card");
const form_1 = require("../form");
const ashley_alert_1 = require("../manufacturing/ashley-alert");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../../lib/utils");
const clientFormSchema = zod_2.z.object({
    name: zod_2.z.string().min(2, "Company/Client name must be at least 2 characters"),
    email: zod_2.z.string().email("Please enter a valid email address"),
    phone: zod_2.z.string().min(10, "Please enter a valid phone number"),
    contactPerson: zod_2.z.string().min(2, "Contact person name is required"),
    businessType: zod_2.z.enum(["RETAILER", "BRAND", "DISTRIBUTOR", "INDIVIDUAL"], {
        required_error: "Please select a business type",
    }),
    address: zod_2.z.object({
        street: zod_2.z.string().min(5, "Street address is required"),
        city: zod_2.z.string().min(2, "City is required"),
        province: zod_2.z.string().min(2, "Province is required"),
        postalCode: zod_2.z.string().min(4, "Postal code is required"),
        country: zod_2.z.string().default("Philippines"),
    }),
    paymentTerms: zod_2.z
        .number()
        .min(0)
        .max(90, "Payment terms must be between 0-90 days"),
    creditLimit: zod_2.z.number().min(0, "Credit limit must be positive"),
    taxId: zod_2.z.string().optional(),
    notes: zod_2.z.string().optional(),
});
const businessTypeLabels = {
    RETAILER: "Retail Store",
    BRAND: "Fashion Brand",
    DISTRIBUTOR: "Distributor/Wholesaler",
    INDIVIDUAL: "Individual Client",
};
const philippineProvinces = [
    "Metro Manila",
    "Cebu",
    "Davao",
    "Iloilo",
    "Pampanga",
    "Bulacan",
    "Cavite",
    "Laguna",
    "Bataan",
    "Rizal",
    "Quezon",
    "Pangasinan",
    "Nueva Ecija",
    "Tarlac",
    "Batangas",
    "Zambales",
    "Albay",
    "Camarines Sur",
    "Sorsogon",
    "Masbate",
];
exports.ClientForm = React.forwardRef(({ initialData, onSubmit, onCancel, isLoading = false, ashleyAnalysis, className, }, ref) => {
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(clientFormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            contactPerson: "",
            businessType: "RETAILER",
            address: {
                street: "",
                city: "",
                province: "Metro Manila",
                postalCode: "",
                country: "Philippines",
            },
            paymentTerms: 30,
            creditLimit: 0,
            taxId: "",
            notes: "",
            ...initialData,
        },
    });
    const handleSubmit = async (data) => {
        try {
            await onSubmit(data);
        }
        catch (error) {
            console.error("Client form submission error:", error);
        }
    };
    return (<div className={(0, utils_1.cn)("space-y-6", className)}>
        {ashleyAnalysis && (<ashley_alert_1.AshleyAlert risk={ashleyAnalysis.risk} issues={ashleyAnalysis.issues} recommendations={ashleyAnalysis.recommendations} confidence={ashleyAnalysis.confidence}/>)}

        <form_1.Form {...form}>
          <form ref={ref} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Basic Information */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Building2 className="h-5 w-5"/>
                  Basic Information
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Enter the client&apos;s basic company and contact information
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <form_1.FormField control={form.control} name="name" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Company/Client Name *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} placeholder="ABC Fashion Corp"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="businessType" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Business Type *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Select business type"/>
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {Object.entries(businessTypeLabels).map(([value, label]) => (<select_1.SelectItem key={value} value={value}>
                                  {label}
                                </select_1.SelectItem>))}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <form_1.FormField control={form.control} name="contactPerson" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="flex items-center gap-2">
                          <lucide_react_1.User className="h-4 w-4"/>
                          Contact Person *
                        </form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} placeholder="Juan Dela Cruz"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="taxId" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>TIN/Business Registration</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} placeholder="000-000-000-000"/>
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Tax Identification Number or Business Registration
                          Number
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <form_1.FormField control={form.control} name="email" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="flex items-center gap-2">
                          <lucide_react_1.Mail className="h-4 w-4"/>
                          Email Address *
                        </form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} type="email" placeholder="contact@company.com"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="phone" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="flex items-center gap-2">
                          <lucide_react_1.Phone className="h-4 w-4"/>
                          Phone Number *
                        </form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} placeholder="+63 912 345 6789"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Address Information */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.MapPin className="h-5 w-5"/>
                  Address Information
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Complete address details for shipping and billing
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                <form_1.FormField control={form.control} name="address.street" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Street Address *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input {...field} placeholder="123 Main Street, Barangay San Jose"/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <form_1.FormField control={form.control} name="address.city" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>City/Municipality *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} placeholder="Quezon City"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="address.province" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Province *</form_1.FormLabel>
                        <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                          <form_1.FormControl>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                          </form_1.FormControl>
                          <select_1.SelectContent>
                            {philippineProvinces.map(province => (<select_1.SelectItem key={province} value={province}>
                                {province}
                              </select_1.SelectItem>))}
                          </select_1.SelectContent>
                        </select_1.Select>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="address.postalCode" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Postal Code *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} placeholder="1100"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Financial Information */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.CreditCard className="h-5 w-5"/>
                  Financial Terms
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Payment terms and credit arrangements
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <form_1.FormField control={form.control} name="paymentTerms" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Payment Terms (Days)</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} type="number" min="0" max="90" onChange={e => field.onChange(parseInt(e.target.value) || 0)}/>
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Number of days client has to pay invoices (0-90 days)
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>

                  <form_1.FormField control={form.control} name="creditLimit" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Credit Limit (PHP)</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input {...field} type="number" min="0" placeholder="0" onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/>
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Maximum outstanding amount allowed
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>

                <form_1.FormField control={form.control} name="notes" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel>Additional Notes</form_1.FormLabel>
                      <form_1.FormControl>
                        <textarea {...field} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" placeholder="Any special requirements, preferences, or important information about this client..."/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
              </card_1.CardContent>
            </card_1.Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              {onCancel && (<button_1.Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </button_1.Button>)}
              <button_1.Button type="submit" disabled={isLoading}>
                {isLoading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {initialData ? "Update Client" : "Create Client"}
              </button_1.Button>
            </div>
          </form>
        </form_1.Form>
      </div>);
});
exports.ClientForm.displayName = "ClientForm";
