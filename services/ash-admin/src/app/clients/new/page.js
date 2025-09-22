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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewClientPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
const react_hot_toast_1 = require("react-hot-toast");
function NewClientPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'Philippines'
        },
        tax_id: '',
        payment_terms: null,
        credit_limit: null
    });
    const validateForm = () => {
        const newErrors = {};
        // Required fields
        if (!formData.name.trim()) {
            newErrors.name = 'Client name is required';
        }
        if (!formData.contact_person.trim()) {
            newErrors.contact_person = 'Contact person is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        // Optional fields validation
        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        if (formData.payment_terms !== null && (formData.payment_terms < 0 || formData.payment_terms > 365)) {
            newErrors.payment_terms = 'Payment terms must be between 0 and 365 days';
        }
        if (formData.credit_limit !== null && formData.credit_limit < 0) {
            newErrors.credit_limit = 'Credit limit cannot be negative';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            react_hot_toast_1.toast.error('Please fix the validation errors');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...formData,
                address: JSON.stringify(formData.address),
                payment_terms: formData.payment_terms || undefined,
                credit_limit: formData.credit_limit || undefined
            };
            const response = await api_1.api.createClient(payload);
            if (response.success) {
                react_hot_toast_1.toast.success('Client created successfully');
                router.push('/clients');
            }
            else {
                throw new Error(response.error || 'Failed to create client');
            }
        }
        catch (error) {
            console.error('Failed to create client:', error);
            react_hot_toast_1.toast.error(error instanceof Error ? error.message : 'Failed to create client');
        }
        finally {
            setLoading(false);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };
    const handleAddressChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
        // Clear address errors
        if (errors.address?.[field]) {
            setErrors(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [field]: undefined
                }
            }));
        }
    };
    return (<div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <link_1.default href="/clients">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
            Back to Clients
          </button_1.Button>
        </link_1.default>
        <div>
          <h1 className="text-3xl font-bold">New Client</h1>
          <p className="text-muted-foreground">Create a new client record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Building2 className="w-5 h-5"/>
              Client Information
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="name">
                  Client Name <span className="text-red-500">*</span>
                </label_1.Label>
                <input_1.Input id="name" type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter client name" className={errors.name ? 'border-red-500' : ''}/>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="contact_person">
                  Contact Person <span className="text-red-500">*</span>
                </label_1.Label>
                <input_1.Input id="contact_person" type="text" value={formData.contact_person} onChange={(e) => handleInputChange('contact_person', e.target.value)} placeholder="Enter contact person name" className={errors.contact_person ? 'border-red-500' : ''}/>
                {errors.contact_person && <p className="text-sm text-red-500">{errors.contact_person}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label_1.Label>
                <input_1.Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Enter email address" className={errors.email ? 'border-red-500' : ''}/>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="phone">Phone</label_1.Label>
                <input_1.Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="Enter phone number" className={errors.phone ? 'border-red-500' : ''}/>
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <label_1.Label className="text-base font-semibold">Address</label_1.Label>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="street">Street Address</label_1.Label>
                <input_1.Input id="street" type="text" value={formData.address.street} onChange={(e) => handleAddressChange('street', e.target.value)} placeholder="Enter street address"/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="city">City</label_1.Label>
                  <input_1.Input id="city" type="text" value={formData.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} placeholder="Enter city"/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="state">State/Province</label_1.Label>
                  <input_1.Input id="state" type="text" value={formData.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} placeholder="Enter state or province"/>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="postal_code">Postal Code</label_1.Label>
                  <input_1.Input id="postal_code" type="text" value={formData.address.postal_code} onChange={(e) => handleAddressChange('postal_code', e.target.value)} placeholder="Enter postal code"/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="country">Country</label_1.Label>
                  <input_1.Input id="country" type="text" value={formData.address.country} onChange={(e) => handleAddressChange('country', e.target.value)} placeholder="Enter country"/>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="tax_id">Tax ID</label_1.Label>
                <input_1.Input id="tax_id" type="text" value={formData.tax_id} onChange={(e) => handleInputChange('tax_id', e.target.value)} placeholder="Enter tax ID"/>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="payment_terms">Payment Terms (Days)</label_1.Label>
                <input_1.Input id="payment_terms" type="number" min="0" max="365" value={formData.payment_terms || ''} onChange={(e) => handleInputChange('payment_terms', e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g. 30" className={errors.payment_terms ? 'border-red-500' : ''}/>
                {errors.payment_terms && <p className="text-sm text-red-500">{errors.payment_terms}</p>}
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="credit_limit">Credit Limit (₱)</label_1.Label>
                <input_1.Input id="credit_limit" type="number" min="0" step="0.01" value={formData.credit_limit || ''} onChange={(e) => handleInputChange('credit_limit', e.target.value ? parseFloat(e.target.value) : null)} placeholder="e.g. 100000" className={errors.credit_limit ? 'border-red-500' : ''}/>
                {errors.credit_limit && <p className="text-sm text-red-500">{errors.credit_limit}</p>}
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <div className="flex justify-end gap-4 mt-6">
          <link_1.default href="/clients">
            <button_1.Button type="button" variant="outline" disabled={loading}>
              Cancel
            </button_1.Button>
          </link_1.default>
          <button_1.Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (<>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>) : (<>
                <lucide_react_1.Save className="w-4 h-4 mr-2"/>
                Create Client
              </>)}
          </button_1.Button>
        </div>
      </form>
    </div>);
}
