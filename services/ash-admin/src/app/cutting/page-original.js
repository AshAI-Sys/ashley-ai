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
exports.default = CuttingPage;
const react_1 = __importStar(require("react"));
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const select_1 = require("@/components/ui/select");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
function CuttingPage() {
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    const [fabricBatches, setFabricBatches] = (0, react_1.useState)([]);
    const [cutLays, setCutLays] = (0, react_1.useState)([]);
    const [bundles, setBundles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)('');
    const [brandFilter, setBrandFilter] = (0, react_1.useState)('all');
    (0, react_1.useEffect)(() => {
        fetchData();
    }, [search, brandFilter]);
    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch fabric batches
            const batchesResponse = await fetch(`/api/cutting/fabric-batches${brandFilter !== 'all' ? `?brand_id=${brandFilter}` : ''}`);
            if (batchesResponse.ok) {
                const batchesData = await batchesResponse.json();
                setFabricBatches(batchesData.data || []);
            }
            // For demo, we'll use mock data for lays and bundles
            // In real implementation, these would come from API
            setCutLays([
                {
                    id: '1',
                    marker_name: 'Hoodie Marker V2',
                    marker_width_cm: 160,
                    lay_length_m: 25.5,
                    plies: 12,
                    gross_used: 18.2,
                    offcuts: 0.8,
                    defects: 0.2,
                    uom: 'KG',
                    created_at: new Date().toISOString(),
                    outputs: [
                        { size_code: 'M', qty: 48 },
                        { size_code: 'L', qty: 48 },
                        { size_code: 'XL', qty: 24 }
                    ]
                }
            ]);
            setBundles([
                {
                    id: '1',
                    size_code: 'M',
                    qty: 20,
                    qr_code: 'ash://bundle/demo-1',
                    status: 'CREATED',
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    size_code: 'L',
                    qty: 20,
                    qr_code: 'ash://bundle/demo-2',
                    status: 'IN_SEWING',
                    created_at: new Date().toISOString()
                }
            ]);
        }
        catch (error) {
            console.error('Failed to fetch cutting data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        switch (status.toUpperCase()) {
            case 'CREATED': return 'bg-blue-100 text-blue-800';
            case 'IN_SEWING': return 'bg-yellow-100 text-yellow-800';
            case 'DONE': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    if (loading) {
        return <div>Loading...</div>;
    }
    return (<dashboard_layout_1.default>
      <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cutting Operations</h1>
          <p className="text-muted-foreground">Manage fabric cutting, lays, and bundle creation</p>
        </div>
        <div className="flex gap-2">
          <link_1.default href="/cutting/issue-fabric">
            <button_1.Button variant="outline">
              <lucide_react_1.Package className="w-4 h-4 mr-2"/>
              Issue Fabric
            </button_1.Button>
          </link_1.default>
          <link_1.default href="/cutting/create-lay">
            <button_1.Button className="bg-blue-600 hover:bg-blue-700">
              <lucide_react_1.Scissors className="w-4 h-4 mr-2"/>
              Create Lay
            </button_1.Button>
          </link_1.default>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <card_1.Card>
          <card_1.CardContent className="py-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.Package className="h-8 w-8 text-blue-600"/>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Batches</p>
                <p className="text-2xl font-bold">{fabricBatches.length}</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="py-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.Scissors className="h-8 w-8 text-green-600"/>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cut Lays</p>
                <p className="text-2xl font-bold">{cutLays.length}</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="py-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.QrCode className="h-8 w-8 text-purple-600"/>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bundles</p>
                <p className="text-2xl font-bold">{bundles.length}</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="py-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-8 w-8 text-orange-600"/>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">
                  {cutLays.length > 0 ?
            Math.round(cutLays.reduce((sum, lay) => {
                const efficiency = ((lay.gross_used - (lay.offcuts || 0) - (lay.defects || 0)) / lay.gross_used) * 100;
                return sum + efficiency;
            }, 0) / cutLays.length) : 0}%
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filters */}
      <card_1.Card className="mb-6">
        <card_1.CardContent className="py-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <lucide_react_1.Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground"/>
                <input_1.Input placeholder="Search batches, lays, bundles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9"/>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <lucide_react_1.Filter className="w-4 h-4 text-muted-foreground"/>
              <select_1.Select value={brandFilter} onValueChange={setBrandFilter}>
                <select_1.SelectTrigger className="w-48">
                  <select_1.SelectValue placeholder="Filter by brand"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Brands</select_1.SelectItem>
                  <select_1.SelectItem value="brand1">Trendy Casual</select_1.SelectItem>
                  <select_1.SelectItem value="brand2">Urban Streetwear</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="batches">Fabric Batches</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="lays">Cut Lays</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="bundles">Bundles</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Recent Activity</card_1.CardTitle>
                <card_1.CardDescription>Latest cutting operations and notifications</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <lucide_react_1.Scissors className="w-5 h-5 text-blue-600"/>
                    <div className="flex-1">
                      <p className="font-medium">New lay created for TCAS-2025-000001</p>
                      <p className="text-sm text-muted-foreground">120 pieces cut across 3 sizes</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <lucide_react_1.QrCode className="w-5 h-5 text-green-600"/>
                    <div className="flex-1">
                      <p className="font-medium">6 bundles created and ready for sewing</p>
                      <p className="text-sm text-muted-foreground">Bundle sizes: 20 pcs each</p>
                    </div>
                    <span className="text-sm text-muted-foreground">4 hours ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <lucide_react_1.AlertCircle className="w-5 h-5 text-orange-600"/>
                    <div className="flex-1">
                      <p className="font-medium">Low fabric efficiency detected</p>
                      <p className="text-sm text-muted-foreground">Lay #12 efficiency: 72% (< /> 78% threshold)</p>
                    </div>
                    <span className="text-sm text-muted-foreground">6 hours ago</span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="batches" className="mt-6">
          <div className="grid gap-4">
            {fabricBatches.map((batch) => (<card_1.Card key={batch.id}>
                <card_1.CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{batch.lot_no}</h3>
                        <badge_1.Badge variant="secondary">{batch.brand.name}</badge_1.Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Available:</span><br />
                          {batch.qty_on_hand} {batch.uom}
                        </div>
                        <div>
                          <span className="font-medium">GSM:</span><br />
                          {batch.gsm || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Width:</span><br />
                          {batch.width_cm ? `${batch.width_cm} cm` : 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Received:</span><br />
                          {new Date(batch.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button_1.Button variant="outline" size="sm">
                        Issue to Order
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}
            
            {fabricBatches.length === 0 && (<card_1.Card>
                <card_1.CardContent className="py-12 text-center">
                  <lucide_react_1.Package className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                  <p className="text-muted-foreground mb-4">No fabric batches available</p>
                  <button_1.Button>Add Fabric Batch</button_1.Button>
                </card_1.CardContent>
              </card_1.Card>)}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="lays" className="mt-6">
          <div className="grid gap-4">
            {cutLays.map((lay) => (<card_1.Card key={lay.id}>
                <card_1.CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{lay.marker_name || `Lay #${lay.id}`}</h3>
                        <badge_1.Badge className="bg-blue-100 text-blue-800">
                          {lay.outputs.reduce((sum, output) => sum + output.qty, 0)} pieces
                        </badge_1.Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span className="font-medium">Dimensions:</span><br />
                          {lay.marker_width_cm ? `${lay.marker_width_cm}cm × ` : ''}{lay.lay_length_m}m × {lay.plies} plies
                        </div>
                        <div>
                          <span className="font-medium">Used:</span><br />
                          {lay.gross_used} {lay.uom}
                        </div>
                        <div>
                          <span className="font-medium">Waste:</span><br />
                          {(lay.offcuts || 0) + (lay.defects || 0)} {lay.uom}
                        </div>
                        <div>
                          <span className="font-medium">Efficiency:</span><br />
                          {Math.round(((lay.gross_used - (lay.offcuts || 0) - (lay.defects || 0)) / lay.gross_used) * 100)}%
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {lay.outputs.map((output) => (<badge_1.Badge key={output.size_code} variant="outline">
                            {output.size_code}: {output.qty}
                          </badge_1.Badge>))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.QrCode className="w-4 h-4 mr-1"/>
                        Create Bundles
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}
            
            {cutLays.length === 0 && (<card_1.Card>
                <card_1.CardContent className="py-12 text-center">
                  <lucide_react_1.Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                  <p className="text-muted-foreground mb-4">No cut lays recorded</p>
                  <link_1.default href="/cutting/create-lay">
                    <button_1.Button>Create First Lay</button_1.Button>
                  </link_1.default>
                </card_1.CardContent>
              </card_1.Card>)}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="bundles" className="mt-6">
          <div className="grid gap-4">
            {bundles.map((bundle) => (<card_1.Card key={bundle.id}>
                <card_1.CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">Bundle #{bundle.id}</h3>
                        <badge_1.Badge className={getStatusColor(bundle.status)}>
                          {bundle.status.replace('_', ' ')}
                        </badge_1.Badge>
                        <badge_1.Badge variant="outline">
                          {bundle.size_code}: {bundle.qty} pcs
                        </badge_1.Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">QR Code:</span> {bundle.qr_code}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(bundle.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.QrCode className="w-4 h-4 mr-1"/>
                        Print Label
                      </button_1.Button>
                      <button_1.Button variant="outline" size="sm">
                        Track Bundle
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}
            
            {bundles.length === 0 && (<card_1.Card>
                <card_1.CardContent className="py-12 text-center">
                  <lucide_react_1.QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                  <p className="text-muted-foreground mb-4">No bundles created</p>
                  <p className="text-sm text-muted-foreground">Bundles are created after cutting lays</p>
                </card_1.CardContent>
              </card_1.Card>)}
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
    </dashboard_layout_1.default>);
}
