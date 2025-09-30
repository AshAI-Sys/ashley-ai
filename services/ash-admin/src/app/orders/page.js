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
exports.default = OrdersPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
function OrdersPage() {
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    (0, react_1.useEffect)(() => {
        fetchOrders();
    }, [search, statusFilter]);
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search)
                params.append('search', search);
            if (statusFilter !== 'all')
                params.append('status', statusFilter);
            const response = await fetch(`/api/orders?${params}`);
            const data = await response.json();
            if (data.success) {
                setOrders(data.data?.orders || data.data || []);
            }
        }
        catch (error) {
            console.error('Failed to fetch orders:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        if (!status)
            return 'bg-gray-100 text-gray-800';
        switch (status.toLowerCase()) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'intake': return 'bg-blue-100 text-blue-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-emerald-100 text-emerald-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (<dashboard_layout_1.default>
      <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Production Orders</h1>
          <p className="text-muted-foreground">Manage your production orders and track their progress</p>
        </div>
        <link_1.default href="/orders/new">
          <button_1.Button className="bg-blue-600 hover:bg-blue-700">
            <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
            New Production Order
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
                <input_1.Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9"/>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <lucide_react_1.Filter className="w-4 h-4 text-muted-foreground"/>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md text-sm">
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="intake">Intake</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Orders List */}
      {loading ? (<div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>) : (<div className="grid gap-4">
          {(orders || []).map((order) => (<card_1.Card key={order.id} className="hover:shadow-md transition-shadow">
              <card_1.CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{order?.order_number || 'Unknown Order'}</h3>
                      <badge_1.Badge className={getStatusColor(order?.status)}>
                        {order?.status ? order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                      </badge_1.Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Client:</span><br />
                        {order?.client?.name || 'No Client'}
                      </div>
                      <div>
                        <span className="font-medium">Brand:</span><br />
                        {order?.brand?.name || 'No Brand'}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span><br />
                        ₱{(order?.total_amount || 0).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Delivery:</span><br />
                        {order?.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{order?._count?.line_items || 0} items</span>
                      <span>{order?._count?.design_assets || 0} designs</span>
                      <span>{order?._count?.bundles || 0} bundles</span>
                      <span>Created {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <link_1.default href={`/orders/${order?.id || ''}`}>
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                        View
                      </button_1.Button>
                    </link_1.default>
                    <link_1.default href={`/orders/${order?.id || ''}/edit`}>
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Edit className="w-4 h-4 mr-1"/>
                        Edit
                      </button_1.Button>
                    </link_1.default>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>))}
          
          {orders.length === 0 && (<card_1.Card>
              <card_1.CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No orders found</p>
                <link_1.default href="/orders/new">
                  <button_1.Button>Create your first production order</button_1.Button>
                </link_1.default>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>)}
      </div>
    </dashboard_layout_1.default>);
}
