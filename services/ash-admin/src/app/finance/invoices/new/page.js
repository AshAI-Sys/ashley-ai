"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewInvoicePage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const lucide_react_1 = require("lucide-react");
function NewInvoicePage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
        client_id: "",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: "",
        payment_terms: 30,
        notes: "",
        terms_conditions: "",
    });
    const [items, setItems] = (0, react_1.useState)([
        { id: "1", description: "", quantity: 1, unit_price: 0, total: 0 },
    ]);
    const [clients, setClients] = (0, react_1.useState)([]);
    // Fetch clients on mount
    (0, react_1.useState)(() => {
        fetch("/api/clients?limit=100")
            .then(res => res.json())
            .then(data => {
            if (data.success) {
                setClients(data.data.clients || []);
            }
        });
    });
    const handleAddItem = () => {
        setItems([
            ...items,
            {
                id: Date.now().toString(),
                description: "",
                quantity: 1,
                unit_price: 0,
                total: 0,
            },
        ]);
    };
    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };
    const handleItemChange = (id, field, value) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === "quantity" || field === "unit_price") {
                    updated.total = updated.quantity * updated.unit_price;
                }
                return updated;
            }
            return item;
        }));
    };
    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.12; // 12% VAT
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { subtotal, tax, total } = calculateTotals();
            const response = await fetch("/api/finance/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    subtotal,
                    tax_amount: tax,
                    total_amount: total,
                    items: items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        line_total: item.total,
                    })),
                }),
            });
            const data = await response.json();
            if (data.success) {
                router.push("/finance");
            }
            else {
                alert("Error creating invoice: " + (data.error || "Unknown error"));
            }
        }
        catch (error) {
            console.error("Error:", error);
            alert("Failed to create invoice");
        }
        finally {
            setLoading(false);
        }
    };
    const { subtotal, tax, total } = calculateTotals();
    return (<dashboard_layout_1.default>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button_1.Button variant="outline" size="sm" onClick={() => router.back()}>
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
              Back
            </button_1.Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Invoice</h1>
              <p className="text-gray-600">
                Fill in the details to create a new invoice
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Invoice Details</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Client *
                  </label>
                  <select required value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2">
                    <option value="">Select client...</option>
                    {clients.map(client => (<option key={client.id} value={client.id}>
                        {client.name}
                      </option>))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Payment Terms (days)
                  </label>
                  <input type="number" value={formData.payment_terms} onChange={e => setFormData({
            ...formData,
            payment_terms: parseInt(e.target.value),
        })} className="w-full rounded-md border border-gray-300 px-3 py-2"/>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Issue Date *
                  </label>
                  <input type="date" required value={formData.issue_date} onChange={e => setFormData({ ...formData, issue_date: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2"/>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Due Date
                  </label>
                  <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2"/>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Add any notes for the client..."/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Line Items */}
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between">
              <card_1.CardTitle>Line Items</card_1.CardTitle>
              <button_1.Button type="button" size="sm" onClick={handleAddItem}>
                <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                Add Item
              </button_1.Button>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (<div key={item.id} className="flex items-start gap-2">
                    <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, "description", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required/>
                      </div>
                      <div>
                        <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" min="0" step="1" required/>
                      </div>
                      <div>
                        <input type="number" placeholder="Price" value={item.unit_price} onChange={e => handleItemChange(item.id, "unit_price", parseFloat(e.target.value) || 0)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" min="0" step="0.01" required/>
                      </div>
                    </div>
                    <div className="w-24 py-2 text-right">
                      ₱{item.total.toLocaleString()}
                    </div>
                    <button_1.Button type="button" variant="outline" size="sm" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1}>
                      <lucide_react_1.Trash2 className="h-4 w-4"/>
                    </button_1.Button>
                  </div>))}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₱{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (12%):</span>
                      <span>₱{tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total:</span>
                      <span>₱{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button_1.Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </button_1.Button>
            <button_1.Button type="submit" disabled={loading}>
              <lucide_react_1.Save className="mr-2 h-4 w-4"/>
              {loading ? "Creating..." : "Create Invoice"}
            </button_1.Button>
          </div>
        </form>
      </div>
    </dashboard_layout_1.default>);
}
