"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkspaceSettingsPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function WorkspaceSettingsPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [uploadingLogo, setUploadingLogo] = (0, react_1.useState)(false);
    const [logoPreview, setLogoPreview] = (0, react_1.useState)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const [formData, setFormData] = (0, react_1.useState)({ name: "", slug: "", description: "", industry: "", company_size: "", website: "", email: "", phone: "", address: "", city: "", state: "", country: "Philippines", postal_code: "", timezone: "Asia/Manila", currency: "PHP", date_format: "MM/DD/YYYY", tax_id: "", });
    (0, react_1.useEffect)(() => { fetchWorkspaceData(); }, []);
    const fetchWorkspaceData = async () => { try {
        const response = await fetch("/api/settings/workspace");
        if (response.ok) {
            const data = await response.json();
            setFormData({ name: data.name || "", slug: data.slug || "", description: data.description || "", industry: data.industry || "", company_size: data.company_size || "", website: data.website || "", email: data.email || "", phone: data.phone || "", address: data.address || "", city: data.city || "", state: data.state || "", country: data.country || "Philippines", postal_code: data.postal_code || "", timezone: data.timezone || "Asia/Manila", currency: data.currency || "PHP", date_format: data.date_format || "MM/DD/YYYY", tax_id: data.tax_id || "", });
            if (data.logo_url) {
                setLogoPreview(data.logo_url);
            }
        }
    }
    catch (error) {
        console.error("Failed to fetch workspace data:", error);
    } };
    const handleLogoClick = () => { fileInputRef.current?.click(); };
    const handleLogoChange = async (e) => { const file = e.target.files?.[0]; if (!file)
        return; if (!file.type.startsWith("image/")) {
        react_hot_toast_1.default.error("Please select an image file");
        return;
    } if (file.size > 5 * 1024 * 1024) {
        react_hot_toast_1.default.error("Image size must be less than 5MB");
        return;
    } const reader = new FileReader(); reader.onloadend = () => { setLogoPreview(reader.result); }; reader.readAsDataURL(file); setUploadingLogo(true); const formData = new FormData(); formData.append("logo", file); try {
        const response = await fetch("/api/settings/workspace/logo", { method: "POST", body: formData, });
        if (!response.ok) {
            throw new Error("Failed to upload logo");
        }
        const data = await response.json();
        react_hot_toast_1.default.success("Logo updated successfully!");
        setLogoPreview(data.logo_url);
    }
    catch (error) {
        react_hot_toast_1.default.error("Failed to upload logo");
        setLogoPreview(null);
    }
    finally {
        setUploadingLogo(false);
    } };
    const handleRemoveLogo = async () => { if (!confirm("Are you sure you want to remove the workspace logo?"))
        return; setUploadingLogo(true); try {
        const response = await fetch("/api/settings/workspace/logo", { method: "DELETE", });
        if (!response.ok) {
            throw new Error("Failed to remove logo");
        }
        react_hot_toast_1.default.success("Logo removed successfully!");
        setLogoPreview(null);
    }
    catch (error) {
        react_hot_toast_1.default.error("Failed to remove logo");
    }
    finally {
        setUploadingLogo(false);
    } };
    const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try {
        const response = await fetch("/api/settings/workspace", { method: "PUT", headers: { "Content-Type": "application/json", }, body: JSON.stringify(formData), });
        if (!response.ok) {
            throw new Error("Failed to update workspace");
        }
        react_hot_toast_1.default.success("Workspace settings updated successfully!");
    }
    catch (error) {
        react_hot_toast_1.default.error("Failed to update workspace settings");
    }
    finally {
        setLoading(false);
    } };
    return (<div className="space-y-6 p-6"> {/* Back Button */} <button_1.Button variant="ghost" onClick={() => router.push("/settings")} className="mb-4"> <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/> Back to Settings </button_1.Button> <div> <h2 className="text-2xl font-bold text-gray-900"> Workspace Settings </h2> <p className="mt-1 text-gray-500"> Manage your workspace information and branding </p> </div> {/* Logo Section */} <div className="space-y-4"> <label_1.Label>Company Logo</label_1.Label> <div className="flex items-center gap-6"> <div className="relative"> <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-200"> {logoPreview ? (<img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-2"/>) : (<lucide_react_1.Building2 className="h-12 w-12 text-gray-500"/>)} </div> {uploadingLogo && (<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50"> <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div> </div>)} </div> <div className="flex flex-col gap-2 sm:flex-row"> <button_1.Button type="button" variant="outline" onClick={handleLogoClick} disabled={uploadingLogo}> <lucide_react_1.Upload className="mr-2 h-4 w-4"/> Upload Logo </button_1.Button> {logoPreview && (<button_1.Button type="button" variant="outline" onClick={handleRemoveLogo} disabled={uploadingLogo} className="text-red-600 hover:text-red-700"> <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/> Remove </button_1.Button>)} <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden"/> </div> </div> </div> <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6"> {/* Basic Information */} <div className="space-y-4"> <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900"> <lucide_react_1.Building2 className="h-5 w-5"/> Basic Information </h3> <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> <div> <label_1.Label htmlFor="name">Company Name *</label_1.Label> <input_1.Input id="name" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ashley AI Manufacturing" required className=""/> </div> <div> <label_1.Label htmlFor="slug">Workspace Slug *</label_1.Label> <input_1.Input id="slug" type="text" value={formData.slug} disabled className="cursor-not-allowed bg-gray-50"/> <p className="mt-1 text-xs text-gray-500"> Workspace slug cannot be changed </p> </div> <div className="md:col-span-2"> <label_1.Label htmlFor="description">Description</label_1.Label> <textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of your company..." rows={3} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500"/> </div> <div> <label_1.Label htmlFor="industry">Industry</label_1.Label> <select id="industry" value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"> <option value="">Select industry</option> <option value="Apparel Manufacturing"> Apparel Manufacturing </option> <option value="Textile Production">Textile Production</option> <option value="Garment Manufacturing"> Garment Manufacturing </option> <option value="Fashion & Design">Fashion & Design</option> <option value="Other">Other</option> </select> </div> <div> <label_1.Label htmlFor="company_size">Company Size</label_1.Label> <select id="company_size" value={formData.company_size} onChange={e => setFormData({ ...formData, company_size: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"> <option value="">Select size</option> <option value="1-10">1-10 employees</option> <option value="11-50">11-50 employees</option> <option value="51-200">51-200 employees</option> <option value="201-500">201-500 employees</option> <option value="500+">500+ employees</option> </select> </div> </div> </div> {/* Contact Information */} <div className="space-y-4 border-t pt-6"> <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900"> <lucide_react_1.Phone className="h-5 w-5"/> Contact Information </h3> <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> <div> <label_1.Label htmlFor="email">Email</label_1.Label> <input_1.Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="contact@company.com" className=""/> </div> <div> <label_1.Label htmlFor="phone">Phone</label_1.Label> <input_1.Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+63 912 345 6789" className=""/> </div> <div className="md:col-span-2"> <label_1.Label htmlFor="website">Website</label_1.Label> <input_1.Input id="website" type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://www.yourcompany.com" className=""/> </div> </div> </div> {/* Address */} <div className="space-y-4 border-t pt-6"> <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900"> <lucide_react_1.MapPin className="h-5 w-5"/> Address </h3> <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> <div className="md:col-span-2"> <label_1.Label htmlFor="address">Street Address</label_1.Label> <input_1.Input id="address" type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main Street" className=""/> </div> <div> <label_1.Label htmlFor="city">City</label_1.Label> <input_1.Input id="city" type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Manila" className=""/> </div> <div> <label_1.Label htmlFor="state">State/Province</label_1.Label> <input_1.Input id="state" type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="Metro Manila" className=""/> </div> <div> <label_1.Label htmlFor="country">Country</label_1.Label> <input_1.Input id="country" type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="Philippines" className=""/> </div> <div> <label_1.Label htmlFor="postal_code">Postal Code</label_1.Label> <input_1.Input id="postal_code" type="text" value={formData.postal_code} onChange={e => setFormData({ ...formData, postal_code: e.target.value })} placeholder="1000" className=""/> </div> </div> </div> {/* Business Settings */} <div className="space-y-4 border-t pt-6"> <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900"> <lucide_react_1.Globe className="h-5 w-5"/> Business Settings </h3> <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> <div> <label_1.Label htmlFor="timezone">Timezone</label_1.Label> <select id="timezone" value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"> <option value="Asia/Manila">Asia/Manila (GMT+8)</option> <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option> <option value="Asia/Hong_Kong">Asia/Hong Kong (GMT+8)</option> </select> </div> <div> <label_1.Label htmlFor="currency">Currency</label_1.Label> <select id="currency" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"> <option value="PHP">PHP - Philippine Peso</option> <option value="USD">USD - US Dollar</option> <option value="EUR">EUR - Euro</option> <option value="GBP">GBP - British Pound</option> </select> </div> <div> <label_1.Label htmlFor="date_format">Date Format</label_1.Label> <select id="date_format" value={formData.date_format} onChange={e => setFormData({ ...formData, date_format: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"> <option value="MM/DD/YYYY">MM/DD/YYYY</option> <option value="DD/MM/YYYY">DD/MM/YYYY</option> <option value="YYYY-MM-DD">YYYY-MM-DD</option> </select> </div> <div> <label_1.Label htmlFor="tax_id">Tax ID / TIN</label_1.Label> <input_1.Input id="tax_id" type="text" value={formData.tax_id} onChange={e => setFormData({ ...formData, tax_id: e.target.value })} placeholder="000-000-000-000" className=""/> </div> </div> </div> {/* Save Button */} <div className="border-t pt-6"> <button_1.Button type="submit" disabled={loading} className="w-full md:w-auto"> <lucide_react_1.Save className="mr-2 h-4 w-4"/> {loading ? "Saving..." : "Save Changes"} </button_1.Button> </div> </form> </div>);
}
