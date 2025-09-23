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
exports.ClientBrandSection = ClientBrandSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const dialog_1 = require("@/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
function ClientBrandSection({ clients, selectedClientId, selectedBrandId, channel, onClientChange, onBrandChange, onChannelChange, onClientCreated }) {
    const [showNewClientDialog, setShowNewClientDialog] = (0, react_1.useState)(false);
    const [newClientForm, setNewClientForm] = (0, react_1.useState)({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: ''
    });
    const [creatingClient, setCreatingClient] = (0, react_1.useState)(false);
    const selectedClient = Array.isArray(clients) ? clients.find(c => c.id === selectedClientId) : null;
    const handleCreateClient = async () => {
        if (!newClientForm.name.trim()) {
            react_hot_toast_1.toast.error('Client name is required');
            return;
        }
        setCreatingClient(true);
        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newClientForm.name,
                    company: newClientForm.company || null,
                    email: newClientForm.email || null,
                    phone: newClientForm.phone || null,
                    billing_address: newClientForm.address || null
                })
            });
            const result = await response.json();
            if (response.ok) {
                const newClient = {
                    ...result.data,
                    brands: []
                };
                onClientCreated(newClient);
                onClientChange(newClient.id);
                setNewClientForm({ name: '', company: '', email: '', phone: '', address: '' });
                setShowNewClientDialog(false);
                react_hot_toast_1.toast.success('Client created successfully');
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to create client');
            }
        }
        catch (error) {
            console.error('Create client error:', error);
            react_hot_toast_1.toast.error('Failed to create client');
        }
        finally {
            setCreatingClient(false);
        }
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          A. Client & Brand
          <badge_1.Badge variant="secondary">Required</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label_1.Label htmlFor="client">Client *</label_1.Label>
            <div className="flex gap-2">
              <select_1.Select value={selectedClientId} onValueChange={onClientChange}>
                <select_1.SelectTrigger className="flex-1">
                  <select_1.SelectValue placeholder="Select client"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {Array.isArray(clients) ? clients.map(client => (<select_1.SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <lucide_react_1.User className="w-4 h-4"/>
                        <span>{client.name}</span>
                        {client.company && (<span className="text-muted-foreground">({client.company})</span>)}
                      </div>
                    </select_1.SelectItem>)) : null}
                </select_1.SelectContent>
              </select_1.Select>
              
              <dialog_1.Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button variant="outline" size="icon">
                    <lucide_react_1.Plus className="w-4 h-4"/>
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent>
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="flex items-center gap-2">
                      <lucide_react_1.Building className="w-5 h-5"/>
                      Create New Client
                    </dialog_1.DialogTitle>
                  </dialog_1.DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label_1.Label htmlFor="client-name">Client Name *</label_1.Label>
                      <input_1.Input id="client-name" value={newClientForm.name} onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })} placeholder="Enter client name"/>
                    </div>
                    
                    <div>
                      <label_1.Label htmlFor="client-company">Company</label_1.Label>
                      <input_1.Input id="client-company" value={newClientForm.company} onChange={(e) => setNewClientForm({ ...newClientForm, company: e.target.value })} placeholder="Enter company name"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label_1.Label htmlFor="client-email">Email</label_1.Label>
                        <input_1.Input id="client-email" type="email" value={newClientForm.email} onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })} placeholder="client@email.com"/>
                      </div>
                      
                      <div>
                        <label_1.Label htmlFor="client-phone">Phone</label_1.Label>
                        <input_1.Input id="client-phone" value={newClientForm.phone} onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })} placeholder="+63 XXX XXX XXXX"/>
                      </div>
                    </div>
                    
                    <div>
                      <label_1.Label htmlFor="client-address">Billing Address</label_1.Label>
                      <input_1.Input id="client-address" value={newClientForm.address} onChange={(e) => setNewClientForm({ ...newClientForm, address: e.target.value })} placeholder="Enter billing address"/>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <button_1.Button onClick={handleCreateClient} disabled={creatingClient || !newClientForm.name.trim()} className="flex-1">
                        {creatingClient ? 'Creating...' : 'Create Client'}
                      </button_1.Button>
                      <button_1.Button variant="outline" onClick={() => setShowNewClientDialog(false)} disabled={creatingClient}>
                        Cancel
                      </button_1.Button>
                    </div>
                  </div>
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            </div>
          </div>

          <div>
            <label_1.Label htmlFor="brand">Brand *</label_1.Label>
            <select_1.Select value={selectedBrandId} onValueChange={onBrandChange} disabled={!selectedClient?.brands.length}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select brand"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {selectedClient?.brands.map(brand => (<select_1.SelectItem key={brand.id} value={brand.id}>
                    {brand.name} ({brand.code})
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
            {selectedClient && !selectedClient.brands.length && (<p className="text-sm text-yellow-600 mt-1">
                No brands found for this client. Contact admin to add brands.
              </p>)}
          </div>
        </div>

        <div>
          <label_1.Label htmlFor="channel">Channel (Optional)</label_1.Label>
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

        {selectedClient && (<div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium mb-2">Selected Client Details</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {selectedClient.name}</p>
              {selectedClient.company && (<p><span className="font-medium">Company:</span> {selectedClient.company}</p>)}
              {selectedClient.email && (<p><span className="font-medium">Email:</span> {selectedClient.email}</p>)}
              {selectedClient.phone && (<p><span className="font-medium">Phone:</span> {selectedClient.phone}</p>)}
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
