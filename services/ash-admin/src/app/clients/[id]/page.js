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
exports.default = ClientDetailPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
const react_hot_toast_1 = require("react-hot-toast");
function ClientDetailPage() {
    const router = (0, navigation_1.useRouter)();
    const params = (0, navigation_1.useParams)();
    const clientId = params.id;
    const [client, setClient] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [deleting, setDeleting] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (clientId) {
            fetchClient();
        }
    }, [clientId]);
    const fetchClient = async () => {
        try {
            setLoading(true);
            const response = await api_1.api.getClient(clientId);
            if (response.success) {
                setClient(response.data);
            }
            else {
                react_hot_toast_1.toast.error("Client not found");
                router.push("/clients");
            }
        }
        catch (error) {
            console.error("Failed to fetch client:", error);
            react_hot_toast_1.toast.error("Failed to load client details");
            router.push("/clients");
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!client)
            return;
        const confirmed = confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`);
        if (!confirmed)
            return;
        setDeleting(true);
        try {
            await api_1.api.deleteClient(client.id);
            react_hot_toast_1.toast.success("Client deleted successfully");
            router.push("/clients");
        }
        catch (error) {
            console.error("Failed to delete client:", error);
            react_hot_toast_1.toast.error("Failed to delete client");
        }
        finally {
            setDeleting(false);
        }
    };
    const formatAddress = (address) => {
        if (!address)
            return null;
        try {
            const parsed = JSON.parse(address);
            const parts = [
                parsed.street,
                parsed.city,
                parsed.state,
                parsed.postal_code,
                parsed.country,
            ].filter(Boolean);
            return parts.length > 0 ? parts.join(", ") : null;
        }
        catch {
            return address;
        }
    };
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined)
            return "No limit set";
        return `₱${amount.toLocaleString()}`;
    };
    if (loading) {
        return (<div className="container mx-auto py-6">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>);
    }
    if (!client) {
        return (<div className="container mx-auto py-6">
        <card_1.Card>
          <card_1.CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Client not found</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <link_1.default href="/clients">
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Clients
            </button_1.Button>
          </link_1.default>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <badge_1.Badge className={client.is_active
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"}>
                {client.is_active ? "Active" : "Inactive"}
              </badge_1.Badge>
            </div>
            <p className="text-muted-foreground">
              Client details and information
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <link_1.default href={`/clients/${client.id}/edit`}>
            <button_1.Button variant="outline">
              <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
              Edit
            </button_1.Button>
          </link_1.default>
          <button_1.Button variant="outline" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
            {deleting ? "Deleting..." : "Delete"}
          </button_1.Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Building2 className="h-5 w-5"/>
              Client Information
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Client Name
                  </label>
                  <p className="text-sm font-semibold">{client.name}</p>
                </div>

                {client.contact_person && (<div className="flex items-center gap-2">
                    <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Contact Person
                      </label>
                      <p className="text-sm">{client.contact_person}</p>
                    </div>
                  </div>)}

                {client.tax_id && (<div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tax ID
                    </label>
                    <p className="text-sm">{client.tax_id}</p>
                  </div>)}
              </div>

              <div className="space-y-4">
                {client.email && (<div className="flex items-center gap-2">
                    <lucide_react_1.Mail className="h-4 w-4 text-muted-foreground"/>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="text-sm">{client.email}</p>
                    </div>
                  </div>)}

                {client.phone && (<div className="flex items-center gap-2">
                    <lucide_react_1.Phone className="h-4 w-4 text-muted-foreground"/>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-sm">{client.phone}</p>
                    </div>
                  </div>)}

                <div className="flex items-center gap-2">
                  <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created
                    </label>
                    <p className="text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <lucide_react_1.CreditCard className="h-4 w-4 text-muted-foreground"/>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Payment Terms
                    </label>
                    <p className="text-sm">
                      {client.payment_terms
            ? `${client.payment_terms} days`
            : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <lucide_react_1.CreditCard className="h-4 w-4 text-muted-foreground"/>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Credit Limit
                    </label>
                    <p className="text-sm">
                      {formatCurrency(client.credit_limit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </label>
                    <p className="text-sm">
                      {new Date(client.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {formatAddress(client.address) && (<div className="mt-6 border-t pt-6">
                <div className="flex items-start gap-2">
                  <lucide_react_1.MapPin className="mt-0.5 h-4 w-4 text-muted-foreground"/>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Address
                    </label>
                    <p className="text-sm">{formatAddress(client.address)}</p>
                  </div>
                </div>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Brands</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="mb-2 text-3xl font-bold">
                {client._count.brands}
              </div>
              <p className="text-sm text-muted-foreground">
                Total brands registered
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Orders</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="mb-2 text-3xl font-bold">
                {client._count.orders}
              </div>
              <p className="text-sm text-muted-foreground">
                Total orders placed
              </p>
              <link_1.default href={`/orders?client_id=${client.id}`}>
                <button_1.Button variant="outline" size="sm" className="mt-4">
                  View Orders
                </button_1.Button>
              </link_1.default>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Recent Brands */}
        {client.brands && client.brands.length > 0 && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Recent Brands</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {client.brands.slice(0, 5).map(brand => (<div key={brand.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <lucide_react_1.Building2 className="h-4 w-4 text-muted-foreground"/>
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        {brand.code && (<p className="text-sm text-muted-foreground">
                            Code: {brand.code}
                          </p>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <badge_1.Badge className={brand.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"}>
                        {brand.is_active ? "Active" : "Inactive"}
                      </badge_1.Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(brand.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>))}
              </div>

              {client.brands.length > 5 && (<link_1.default href={`/clients/${client.id}/brands`}>
                  <button_1.Button variant="outline" size="sm" className="mt-4">
                    View All Brands ({client.brands.length})
                  </button_1.Button>
                </link_1.default>)}
            </card_1.CardContent>
          </card_1.Card>)}
      </div>
    </div>);
}
