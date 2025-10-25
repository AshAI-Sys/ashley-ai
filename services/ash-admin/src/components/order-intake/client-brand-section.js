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
exports.ClientBrandSection = ClientBrandSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const label_1 = require("@/components/ui/label");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
function ClientBrandSection({ clients, selectedClientId, selectedBrandId, channel, onClientChange, onBrandChange, onChannelChange, onClientCreated, }) {
    // Ensure clients is an array
    const clientsArray = Array.isArray(clients) ? clients : [];
    const selectedClient = clientsArray.find(c => c.id === selectedClientId);
    // Client creation state
    const [showClientForm, setShowClientForm] = (0, react_1.useState)(false);
    const [creatingClient, setCreatingClient] = (0, react_1.useState)(false);
    const [newClient, setNewClient] = (0, react_1.useState)({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
    });
    // Brand creation state
    const [showBrandForm, setShowBrandForm] = (0, react_1.useState)(false);
    const [creatingBrand, setCreatingBrand] = (0, react_1.useState)(false);
    const [newBrand, setNewBrand] = (0, react_1.useState)({
        name: "",
        code: "",
    });
    const handleCreateClient = async () => {
        if (!newClient.name || !newClient.email) {
            react_hot_toast_1.toast.error("Client name and email are required");
            return;
        }
        setCreatingClient(true);
        try {
            const response = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newClient),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                const createdClient = result.data;
                react_hot_toast_1.toast.success("Client created successfully!");
                onClientCreated(createdClient);
                onClientChange(createdClient.id);
                setShowClientForm(false);
                setNewClient({
                    name: "",
                    company: "",
                    email: "",
                    phone: "",
                    address: "",
                });
            }
            else {
                react_hot_toast_1.toast.error(result.error || "Failed to create client");
            }
        }
        catch (error) {
            console.error("Error creating client:", error);
            react_hot_toast_1.toast.error("Failed to create client");
        }
        finally {
            setCreatingClient(false);
        }
    };
    const handleCreateBrand = async () => {
        if (!newBrand.name || !newBrand.code) {
            react_hot_toast_1.toast.error("Brand name and code are required");
            return;
        }
        if (!selectedClientId) {
            react_hot_toast_1.toast.error("Please select a client first");
            return;
        }
        setCreatingBrand(true);
        try {
            const response = await fetch("/api/brands", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newBrand.name,
                    code: newBrand.code,
                    client_id: selectedClientId, // Use snake_case to match API
                }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                const createdBrand = result.data;
                react_hot_toast_1.toast.success("Brand created successfully!");
                // Update the client in the list with the new brand
                const updatedClient = {
                    ...selectedClient,
                    brands: [...(selectedClient?.brands || []), createdBrand],
                };
                onClientCreated(updatedClient);
                onBrandChange(createdBrand.id);
                setShowBrandForm(false);
                setNewBrand({ name: "", code: "" });
            }
            else {
                react_hot_toast_1.toast.error(result.error || "Failed to create brand");
            }
        }
        catch (error) {
            console.error("Error creating brand:", error);
            react_hot_toast_1.toast.error("Failed to create brand");
        }
        finally {
            setCreatingBrand(false);
        }
    };
    return (<card_1.Card className="border-2">
      <card_1.CardHeader className="border-b-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-gray-700 dark:from-purple-950 dark:to-blue-950">
        <card_1.CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
            A
          </span>
          <span className="font-bold">Client & Brand</span>
          <badge_1.Badge variant="destructive" className="ml-auto">
            Required
          </badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label_1.Label htmlFor="client" className="text-sm font-semibold">
                Client *
              </label_1.Label>
              <button_1.Button type="button" variant="outline" size="sm" onClick={() => setShowClientForm(!showClientForm)} className="h-7 text-xs">
                <lucide_react_1.Plus className="mr-1 h-3 w-3"/>
                New Client
              </button_1.Button>
            </div>
            <select_1.Select value={selectedClientId} onValueChange={onClientChange}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select client"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {clientsArray.map(client => (<select_1.SelectItem key={client.id} value={client.id}>
                    {client.name}
                    {client.company ? ` (${client.company})` : ""}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label_1.Label htmlFor="brand" className="text-sm font-semibold">
                Brand *
              </label_1.Label>
              <button_1.Button type="button" variant="outline" size="sm" onClick={() => setShowBrandForm(!showBrandForm)} disabled={!selectedClientId} className="h-7 text-xs">
                <lucide_react_1.Plus className="mr-1 h-3 w-3"/>
                New Brand
              </button_1.Button>
            </div>
            <select_1.Select value={selectedBrandId} onValueChange={onBrandChange} disabled={!selectedClientId}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select brand"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {(selectedClient?.brands || []).map(brand => (<select_1.SelectItem key={brand.id} value={brand.id}>
                    {brand.name} ({brand.code})
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>

        {/* New Client Form */}
        {showClientForm && (<div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Create New Client
              </h4>
              <button_1.Button type="button" variant="ghost" size="sm" onClick={() => setShowClientForm(false)} className="h-6 w-6 p-0">
                <lucide_react_1.X className="h-4 w-4"/>
              </button_1.Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label_1.Label htmlFor="newClientName" className="text-sm">
                  Name *
                </label_1.Label>
                <input_1.Input id="newClientName" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="Client name"/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="newClientCompany" className="text-sm">
                  Company
                </label_1.Label>
                <input_1.Input id="newClientCompany" value={newClient.company} onChange={e => setNewClient({ ...newClient, company: e.target.value })} placeholder="Company name"/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="newClientEmail" className="text-sm">
                  Email *
                </label_1.Label>
                <input_1.Input id="newClientEmail" type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} placeholder="email@example.com"/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="newClientPhone" className="text-sm">
                  Phone
                </label_1.Label>
                <input_1.Input id="newClientPhone" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} placeholder="+63 912 345 6789"/>
              </div>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="newClientAddress" className="text-sm">
                Address
              </label_1.Label>
              <input_1.Input id="newClientAddress" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} placeholder="Full address"/>
            </div>

            <div className="flex justify-end gap-2">
              <button_1.Button type="button" variant="outline" onClick={() => setShowClientForm(false)} disabled={creatingClient}>
                Cancel
              </button_1.Button>
              <button_1.Button type="button" onClick={handleCreateClient} disabled={creatingClient} className="bg-blue-600 hover:bg-blue-700">
                <lucide_react_1.Check className="mr-1 h-4 w-4"/>
                {creatingClient ? "Creating..." : "Create Client"}
              </button_1.Button>
            </div>
          </div>)}

        {/* New Brand Form */}
        {showBrandForm && (<div className="space-y-4 rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Create New Brand
              </h4>
              <button_1.Button type="button" variant="ghost" size="sm" onClick={() => setShowBrandForm(false)} className="h-6 w-6 p-0">
                <lucide_react_1.X className="h-4 w-4"/>
              </button_1.Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label_1.Label htmlFor="newBrandName" className="text-sm">
                  Brand Name *
                </label_1.Label>
                <input_1.Input id="newBrandName" value={newBrand.name} onChange={e => {
                const name = e.target.value;
                // Auto-generate code from name (first 4-5 chars, uppercase, no spaces)
                const autoCode = name
                    .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
                    .slice(0, 5) // Take first 5 chars
                    .toUpperCase();
                setNewBrand({
                    name: name,
                    code: autoCode
                });
            }} placeholder="e.g., Nike, Adidas"/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="newBrandCode" className="text-sm">
                  Brand Code * (Auto-generated, editable)
                </label_1.Label>
                <input_1.Input id="newBrandCode" value={newBrand.code} onChange={e => setNewBrand({
                ...newBrand,
                code: e.target.value.toUpperCase(),
            })} placeholder="e.g., NIKE, ADID" maxLength={10}/>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button_1.Button type="button" variant="outline" onClick={() => setShowBrandForm(false)} disabled={creatingBrand}>
                Cancel
              </button_1.Button>
              <button_1.Button type="button" onClick={handleCreateBrand} disabled={creatingBrand} className="bg-green-600 hover:bg-green-700">
                <lucide_react_1.Check className="mr-1 h-4 w-4"/>
                {creatingBrand ? "Creating..." : "Create Brand"}
              </button_1.Button>
            </div>
          </div>)}

        <div className="space-y-2">
          <label_1.Label htmlFor="channel" className="text-sm font-semibold">
            Channel (Optional)
          </label_1.Label>
          <select_1.Select value={channel} onValueChange={onChannelChange}>
            <select_1.SelectTrigger>
              <select_1.SelectValue placeholder="Select channel"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="direct">Direct</select_1.SelectItem>
              <select_1.SelectItem value="csr">CSR</select_1.SelectItem>
              <select_1.SelectItem value="shopee">Shopee</select_1.SelectItem>
              <select_1.SelectItem value="tiktok">TikTok</select_1.SelectItem>
              <select_1.SelectItem value="lazada">Lazada</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {selectedClient && (<div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
              <lucide_react_1.Building className="h-4 w-4 text-blue-600"/>
              Selected Client Details
            </h4>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="font-semibold text-gray-700">Name:</span>{" "}
                <span className="text-gray-900">{selectedClient.name}</span>
              </p>
              {selectedClient.company && (<p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Company:</span>{" "}
                  <span className="text-gray-900">
                    {selectedClient.company}
                  </span>
                </p>)}
              {selectedClient.email && (<p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Email:</span>{" "}
                  <span className="text-gray-900">{selectedClient.email}</span>
                </p>)}
              {selectedClient.phone && (<p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Phone:</span>{" "}
                  <span className="text-gray-900">{selectedClient.phone}</span>
                </p>)}
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
