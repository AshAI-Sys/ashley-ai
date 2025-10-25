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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClientBrandsPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
const react_hot_toast_1 = require("react-hot-toast");
function ClientBrandsPage() {
    const _router = (0, navigation_1.useRouter)();
    const params = (0, navigation_1.useParams)();
    const clientId = params.id;
    const [client, setClient] = (0, react_1.useState)(null);
    const [brands, setBrands] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showForm, setShowForm] = (0, react_1.useState)(false);
    const [editingBrand, setEditingBrand] = (0, react_1.useState)(null);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [formData, setFormData] = (0, react_1.useState)({
        name: "",
        code: "",
        logo_url: "",
        settings: {
            color_primary: "#000000",
            color_secondary: "#ffffff",
            notes: "",
        },
        is_active: true,
    });
    (0, react_1.useEffect)(() => {
        if (clientId) {
            fetchClient();
            fetchBrands();
        }
    }, [clientId]);
    const fetchClient = async () => {
        try {
            const response = await api_1.api.getClient(clientId);
            if (response.success) {
                setClient(response.data);
            }
        }
        catch (error) {
            console.error("Failed to fetch client:", error);
        }
    };
    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await api_1.api.getClientBrands(clientId);
            if (response.success) {
                setBrands(response.data);
            }
        }
        catch (error) {
            console.error("Failed to fetch brands:", error);
            react_hot_toast_1.toast.error("Failed to load brands");
        }
        finally {
            setLoading(false);
        }
    };
    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            logo_url: "",
            settings: {
                color_primary: "#000000",
                color_secondary: "#ffffff",
                notes: "",
            },
            is_active: true,
        });
        setErrors({});
        setEditingBrand(null);
        setShowForm(false);
    };
    const handleEdit = (brand) => {
        let parsedSettings = {
            color_primary: "#000000",
            color_secondary: "#ffffff",
            notes: "",
        };
        if (brand.settings) {
            try {
                parsedSettings = { ...parsedSettings, ...JSON.parse(brand.settings) };
            }
            catch {
                // Keep defaults if parsing fails
            }
        }
        setFormData({
            name: brand.name,
            code: brand.code || "",
            logo_url: brand.logo_url || "",
            settings: parsedSettings,
            is_active: brand.is_active,
        });
        setEditingBrand(brand);
        setShowForm(true);
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Brand name is required";
        }
        if (!formData.code.trim()) {
            newErrors.code = "Brand code is required";
        }
        else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
            newErrors.code =
                "Brand code must contain only uppercase letters, numbers, and underscores";
        }
        if (formData.logo_url && !/^https?:\/\/.+/.test(formData.logo_url)) {
            newErrors.logo_url = "Logo URL must be a valid HTTP/HTTPS URL";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            react_hot_toast_1.toast.error("Please fix the validation errors");
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                settings: JSON.stringify(formData.settings),
                logo_url: formData.logo_url || undefined,
            };
            let response;
            if (editingBrand) {
                // Update existing brand
                response = await api_1.api.updateClientBrand(clientId, editingBrand.id, payload);
            }
            else {
                // Create new brand
                response = await api_1.api.createClientBrand(clientId, payload);
            }
            if (response.success) {
                react_hot_toast_1.toast.success(editingBrand
                    ? "Brand updated successfully"
                    : "Brand created successfully");
                resetForm();
                fetchBrands();
            }
            else {
                throw new Error(response.error || "Failed to save brand");
            }
        }
        catch (error) {
            console.error("Failed to save brand:", error);
            react_hot_toast_1.toast.error(error instanceof Error ? error.message : "Failed to save brand");
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleInputChange = (field, value) => {
        if (field.startsWith("settings.")) {
            const settingField = field.replace("settings.", "");
            setFormData(prev => ({
                ...prev,
                settings: {
                    ...prev.settings,
                    [settingField]: value,
                },
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
        // Clear errors
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };
    const formatSettings = (settings) => {
        if (!settings)
            return null;
        try {
            const parsed = JSON.parse(settings);
            return parsed;
        }
        catch {
            return null;
        }
    };
    if (loading && !client) {
        return (<div className="container mx-auto py-6">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>);
    }
    return (<div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <link_1.default href={`/clients/${clientId}`}>
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Client
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-3xl font-bold">Brands for {client?.name}</h1>
            <p className="text-muted-foreground">
              Manage brands associated with this client
            </p>
          </div>
        </div>

        {!showForm && (<button_1.Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
            Add Brand
          </button_1.Button>)}
      </div>

      {/* Add/Edit Brand Form */}
      {showForm && (<card_1.Card className="mb-6">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <lucide_react_1.Building2 className="h-5 w-5"/>
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </span>
              <button_1.Button variant="ghost" size="sm" onClick={resetForm}>
                <lucide_react_1.X className="h-4 w-4"/>
              </button_1.Button>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label_1.Label htmlFor="name">
                    Brand Name <span className="text-red-500">*</span>
                  </label_1.Label>
                  <input_1.Input id="name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} placeholder="Enter brand name" className={errors.name ? "border-red-500" : ""}/>
                  {errors.name && (<p className="text-sm text-red-500">{errors.name}</p>)}
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="code">
                    Brand Code <span className="text-red-500">*</span>
                  </label_1.Label>
                  <input_1.Input id="code" value={formData.code} onChange={e => handleInputChange("code", e.target.value.toUpperCase())} placeholder="e.g. NIKE, ADIDAS" className={errors.code ? "border-red-500" : ""}/>
                  {errors.code && (<p className="text-sm text-red-500">{errors.code}</p>)}
                  <p className="text-xs text-muted-foreground">
                    Used for order numbering. Only uppercase letters, numbers,
                    and underscores.
                  </p>
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <label_1.Label htmlFor="logo_url">Logo URL</label_1.Label>
                <input_1.Input id="logo_url" type="url" value={formData.logo_url} onChange={e => handleInputChange("logo_url", e.target.value)} placeholder="https://example.com/logo.png" className={errors.logo_url ? "border-red-500" : ""}/>
                {errors.logo_url && (<p className="text-sm text-red-500">{errors.logo_url}</p>)}
              </div>

              {/* Brand Settings */}
              <div className="space-y-4">
                <label_1.Label className="text-base font-semibold">
                  Brand Settings
                </label_1.Label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="color_primary">Primary Color</label_1.Label>
                    <div className="flex gap-2">
                      <input_1.Input id="color_primary" type="color" value={formData.settings.color_primary} onChange={e => handleInputChange("settings.color_primary", e.target.value)} className="h-10 w-16 p-1"/>
                      <input_1.Input type="text" value={formData.settings.color_primary} onChange={e => handleInputChange("settings.color_primary", e.target.value)} placeholder="#000000" className="flex-1"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="color_secondary">Secondary Color</label_1.Label>
                    <div className="flex gap-2">
                      <input_1.Input id="color_secondary" type="color" value={formData.settings.color_secondary} onChange={e => handleInputChange("settings.color_secondary", e.target.value)} className="h-10 w-16 p-1"/>
                      <input_1.Input type="text" value={formData.settings.color_secondary} onChange={e => handleInputChange("settings.color_secondary", e.target.value)} placeholder="#ffffff" className="flex-1"/>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="notes">Notes</label_1.Label>
                  <input_1.Input id="notes" value={formData.settings.notes} onChange={e => handleInputChange("settings.notes", e.target.value)} placeholder="Additional notes about this brand"/>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div>
                  <label_1.Label className="text-base font-semibold">
                    Brand Status
                  </label_1.Label>
                  <p className="text-sm text-muted-foreground">
                    Active brands can be used for orders
                  </p>
                </div>
                <button_1.Button type="button" variant="ghost" size="sm" onClick={() => handleInputChange("is_active", !formData.is_active)} className="flex items-center gap-2">
                  {formData.is_active ? (<>
                      <lucide_react_1.ToggleRight className="h-5 w-5 text-green-600"/>
                      <span className="font-medium text-green-600">Active</span>
                    </>) : (<>
                      <lucide_react_1.ToggleLeft className="h-5 w-5 text-gray-500"/>
                      <span className="font-medium text-gray-600">
                        Inactive
                      </span>
                    </>)}
                </button_1.Button>
              </div>

              <div className="flex justify-end gap-4">
                <button_1.Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancel
                </button_1.Button>
                <button_1.Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting ? (<>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      {editingBrand ? "Updating..." : "Creating..."}
                    </>) : (<>
                      <lucide_react_1.Save className="mr-2 h-4 w-4"/>
                      {editingBrand ? "Update Brand" : "Create Brand"}
                    </>)}
                </button_1.Button>
              </div>
            </form>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Brands List */}
      {loading ? (<div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>) : (<div className="grid gap-4">
          {(brands || []).map(brand => {
                const settings = formatSettings(brand.settings);
                return (<card_1.Card key={brand.id} className="transition-shadow hover:shadow-md">
                <card_1.CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        {brand.logo_url && (<img src={brand.logo_url} alt={`${brand.name} logo`} className="h-8 w-8 rounded object-contain" onError={e => {
                            e.currentTarget.style.display = "none";
                        }}/>)}
                        <h3 className="text-lg font-semibold">{brand.name}</h3>
                        {brand.code && (<badge_1.Badge variant="outline" className="font-mono">
                            {brand.code}
                          </badge_1.Badge>)}
                        <badge_1.Badge className={brand.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"}>
                          {brand.is_active ? "Active" : "Inactive"}
                        </badge_1.Badge>
                      </div>

                      {settings && (<div className="mb-3 flex items-center gap-4">
                          {settings.color_primary && (<div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded border" style={{
                                backgroundColor: settings.color_primary,
                            }}></div>
                              <span className="text-sm text-muted-foreground">
                                {settings.color_primary}
                              </span>
                            </div>)}
                          {settings.color_secondary && (<div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded border" style={{
                                backgroundColor: settings.color_secondary,
                            }}></div>
                              <span className="text-sm text-muted-foreground">
                                {settings.color_secondary}
                              </span>
                            </div>)}
                        </div>)}

                      {settings?.notes && (<p className="mb-3 text-sm text-muted-foreground">
                          {settings.notes}
                        </p>)}

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          Created{" "}
                          {new Date(brand.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Updated{" "}
                          {new Date(brand.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button_1.Button variant="outline" size="sm" onClick={() => handleEdit(brand)}>
                        <lucide_react_1.Edit className="mr-1 h-4 w-4"/>
                        Edit
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>);
            })}

          {brands.length === 0 && (<card_1.Card>
              <card_1.CardContent className="py-12 text-center">
                <lucide_react_1.Building2 className="mx-auto mb-4 h-12 w-12 text-gray-500"/>
                <p className="mb-4 text-muted-foreground">
                  No brands found for this client
                </p>
                <button_1.Button onClick={() => setShowForm(true)}>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Add First Brand
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>)}
    </div>);
}
