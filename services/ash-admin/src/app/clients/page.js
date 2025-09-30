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
exports.default = ClientsPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
function ClientsPage() {
    const [clients, setClients] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const [totalPages, setTotalPages] = (0, react_1.useState)(1);
    const [totalCount, setTotalCount] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        fetchClients();
    }, [search, statusFilter, currentPage]);
    const fetchClients = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                ...(search && { search }),
                ...(statusFilter !== 'all' && { is_active: statusFilter === 'active' })
            };
            const response = await api_1.api.getClients(params);
            if (response.success) {
                setClients(response.data?.clients || []);
                setTotalPages(response.data?.pagination?.pages || 1);
                setTotalCount(response.data?.pagination?.total || 0);
            }
            else {
                setClients([]);
                setTotalPages(1);
                setTotalCount(0);
            }
        }
        catch (error) {
            console.error('Failed to fetch clients:', error);
            setClients([]);
            setTotalPages(1);
            setTotalCount(0);
        }
        finally {
            setLoading(false);
        }
    };
    const formatAddress = (address) => {
        if (!address)
            return 'No address';
        try {
            const parsed = JSON.parse(address);
            return `${parsed.street || ''} ${parsed.city || ''} ${parsed.state || ''}`.trim() || 'Address incomplete';
        }
        catch {
            return address;
        }
    };
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined)
            return 'No limit';
        return `₱${amount.toLocaleString()}`;
    };
    return (<dashboard_layout_1.default>
      <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your clients and their information</p>
        </div>
        <link_1.default href="/clients/new">
          <button_1.Button className="bg-blue-600 hover:bg-blue-700">
            <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
            New Client
          </button_1.Button>
        </link_1.default>
      </div>

      {/* Filters */}
      <card_1.Card className="mb-6">
        <card_1.CardContent className="py-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <lucide_react_1.Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground"/>
                <input_1.Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9"/>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <lucide_react_1.Filter className="w-4 h-4 text-muted-foreground"/>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm">
                <option value="all">All Clients</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
          
          {totalCount > 0 && (<div className="mt-2 text-sm text-muted-foreground">
              Showing {clients.length} of {totalCount} clients
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Clients List */}
      {loading ? (<div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>) : (<div className="grid gap-4">
          {(clients || []).map((client) => (<card_1.Card key={client.id} className="hover:shadow-md transition-shadow">
              <card_1.CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <lucide_react_1.Building2 className="w-5 h-5 text-blue-600"/>
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <badge_1.Badge className={client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </badge_1.Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                      {client.contact_person && (<div className="flex items-center gap-2">
                          <lucide_react_1.Users className="w-4 h-4"/>
                          <span>{client.contact_person}</span>
                        </div>)}
                      {client.email && (<div className="flex items-center gap-2">
                          <lucide_react_1.Mail className="w-4 h-4"/>
                          <span>{client.email}</span>
                        </div>)}
                      {client.phone && (<div className="flex items-center gap-2">
                          <lucide_react_1.Phone className="w-4 h-4"/>
                          <span>{client.phone}</span>
                        </div>)}
                      <div className="flex items-center gap-2">
                        <lucide_react_1.MapPin className="w-4 h-4"/>
                        <span>{formatAddress(client.address)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Brands:</span><br />
                        <span className="font-semibold">{client._count.brands}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Orders:</span><br />
                        <span className="font-semibold">{client._count.orders}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Payment Terms:</span><br />
                        <span className="font-semibold">{client.payment_terms ? `${client.payment_terms} days` : 'Not set'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Credit Limit:</span><br />
                        <span className="font-semibold">{formatCurrency(client.credit_limit)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      {client.tax_id && <span>Tax ID: {client.tax_id}</span>}
                      <span>Created {new Date(client.created_at).toLocaleDateString()}</span>
                      <span>Updated {new Date(client.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <link_1.default href={`/clients/${client.id}`}>
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                        View
                      </button_1.Button>
                    </link_1.default>
                    <link_1.default href={`/clients/${client.id}/edit`}>
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Edit className="w-4 h-4 mr-1"/>
                        Edit
                      </button_1.Button>
                    </link_1.default>
                    <link_1.default href={`/clients/${client.id}/brands`}>
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Building2 className="w-4 h-4 mr-1"/>
                        Brands
                      </button_1.Button>
                    </link_1.default>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>))}
          
          {clients.length === 0 && (<card_1.Card>
              <card_1.CardContent className="py-12 text-center">
                <lucide_react_1.Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                <p className="text-muted-foreground mb-4">No clients found</p>
                <link_1.default href="/clients/new">
                  <button_1.Button>Create your first client</button_1.Button>
                </link_1.default>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>)}

      {/* Pagination */}
      {totalPages > 1 && (<div className="flex justify-center items-center gap-2 mt-6">
          <button_1.Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
            Previous
          </button_1.Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <button_1.Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
            Next
          </button_1.Button>
        </div>)}
      </div>
    </dashboard_layout_1.default>);
}
