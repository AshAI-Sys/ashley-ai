"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AddSupplierPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
function AddSupplierPage() {
    const router = (0, navigation_1.useRouter)();
    const [formData, setFormData] = (0, react_1.useState)({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        payment_terms: "",
        lead_time_days: "",
        notes: "",
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        window.alert("Supplier added successfully!");
        router.push("/inventory");
    };
    return (<div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push("/inventory")} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <lucide_react_1.ArrowLeft className="h-5 w-5"/>
            Back to Inventory
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Supplier</h1>
          <p className="mt-2 text-gray-600">
            Add supplier information for purchasing
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Supplier Name */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="e.g., Fabric Suppliers Inc."/>
            </div>

            {/* Contact Person */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="e.g., John Doe"/>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="e.g., john@supplier.com"/>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="e.g., +63 917 123 4567"/>
            </div>

            {/* Payment Terms */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Terms
              </label>
              <select value={formData.payment_terms} onChange={e => setFormData({ ...formData, payment_terms: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500">
                <option value="">Select payment terms...</option>
                <option value="NET30">Net 30</option>
                <option value="NET60">Net 60</option>
                <option value="COD">Cash on Delivery</option>
                <option value="ADVANCE">Advance Payment</option>
                <option value="50_50">50/50 Payment</option>
              </select>
            </div>

            {/* Lead Time */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Lead Time (Days)
              </label>
              <input type="number" value={formData.lead_time_days} onChange={e => setFormData({ ...formData, lead_time_days: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="e.g., 7"/>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="Complete address..."/>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="Additional notes about the supplier..."/>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={() => router.push("/inventory")} className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              <lucide_react_1.Save className="h-4 w-4"/>
              Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>);
}
