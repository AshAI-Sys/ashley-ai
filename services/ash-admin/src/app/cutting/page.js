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
const tabs_1 = require("@/components/ui/tabs");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function CuttingPage() {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [activeTab, setActiveTab] = (0, react_1.useState)('lays');
    const [cutLays, setCutLays] = (0, react_1.useState)([]);
    const [bundles, setBundles] = (0, react_1.useState)([]);
    // Mock data for demonstration
    (0, react_1.useEffect)(() => {
        const mockCutLays = [
            {
                id: '1',
                layNumber: 'LAY-001',
                orderNumber: 'ORD-2024-001',
                clientName: 'Ashley Fashion Co.',
                markerName: 'MKR-SHIRT-001',
                layLength: 25.5,
                plies: 50,
                status: 'IN_PROGRESS',
                createdAt: '2024-01-15T08:00:00Z',
                totalPieces: 150,
                fabricUsed: 127.5
            },
            {
                id: '2',
                layNumber: 'LAY-002',
                orderNumber: 'ORD-2024-002',
                clientName: 'Urban Styles Ltd.',
                markerName: 'MKR-DRESS-001',
                layLength: 30.0,
                plies: 40,
                status: 'COMPLETED',
                createdAt: '2024-01-14T10:30:00Z',
                totalPieces: 120,
                fabricUsed: 120.0
            }
        ];
        const mockBundles = [
            {
                id: '1',
                bundleNumber: 'BDL-001',
                layId: '1',
                orderNumber: 'ORD-2024-001',
                sizeCode: 'M',
                quantity: 25,
                status: 'CUT',
                qrCode: 'QR001',
                createdAt: '2024-01-15T09:00:00Z'
            },
            {
                id: '2',
                bundleNumber: 'BDL-002',
                layId: '1',
                orderNumber: 'ORD-2024-001',
                sizeCode: 'L',
                quantity: 30,
                status: 'READY',
                qrCode: 'QR002',
                createdAt: '2024-01-15T09:15:00Z'
            }
        ];
        setCutLays(mockCutLays);
        setBundles(mockBundles);
        setLoading(false);
    }, []);
    const getStatusBadge = (status) => {
        const statusConfig = {
            'PLANNED': { color: 'bg-blue-100 text-blue-800', label: 'Planned' },
            'IN_PROGRESS': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
            'COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Completed' },
            'ON_HOLD': { color: 'bg-red-100 text-red-800', label: 'On Hold' },
            'CUT': { color: 'bg-orange-100 text-orange-800', label: 'Cut' },
            'READY': { color: 'bg-green-100 text-green-800', label: 'Ready' },
            'ISSUED': { color: 'bg-blue-100 text-blue-800', label: 'Issued' }
        };
        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
        return <badge_1.Badge className={config.color}>{config.label}</badge_1.Badge>;
    };
    if (loading) {
        return <div>Loading...</div>;
    }
    return (<dashboard_layout_1.default>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cutting Operations</h1>
            <p className="text-gray-600">Manage fabric laying, cutting, and bundle generation</p>
          </div>
          <div className="flex gap-3">
            <button_1.Button onClick={() => { }}>
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              New Lay
            </button_1.Button>
            <button_1.Button variant="outline" onClick={() => { }}>
              <lucide_react_1.QrCode className="w-4 h-4 mr-2"/>
              Scan Bundle
            </button_1.Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center">
                <lucide_react_1.Scissors className="h-8 w-8 text-blue-600"/>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Lays</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center">
                <lucide_react_1.Package className="h-8 w-8 text-green-600"/>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bundles Generated</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center">
                <lucide_react_1.BarChart3 className="h-8 w-8 text-purple-600"/>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cutting Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">94%</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center">
                <lucide_react_1.QrCode className="h-8 w-8 text-orange-600"/>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready Bundles</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Main Content */}
        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="lays">Cut Lays</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="bundles">Bundles</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="efficiency">Efficiency</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="lays" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Cut Lays Management</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <input_1.Input placeholder="Search by order number..." className="max-w-sm"/>
                  <select_1.Select defaultValue="all">
                    <select_1.SelectTrigger className="w-48">
                      <select_1.SelectValue placeholder="Filter by status"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">All statuses</select_1.SelectItem>
                      <select_1.SelectItem value="PLANNED">Planned</select_1.SelectItem>
                      <select_1.SelectItem value="IN_PROGRESS">In Progress</select_1.SelectItem>
                      <select_1.SelectItem value="COMPLETED">Completed</select_1.SelectItem>
                      <select_1.SelectItem value="ON_HOLD">On Hold</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                {/* Cut Lays Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lay Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Measurements
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cutLays.map((lay) => (<tr key={lay.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lay.layNumber}</div>
                              <div className="text-sm text-gray-500">{lay.markerName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lay.orderNumber}</div>
                              <div className="text-sm text-gray-500">{lay.clientName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Length: {lay.layLength}m</div>
                              <div>Plies: {lay.plies}</div>
                              <div>Pieces: {lay.totalPieces}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(lay.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.Eye className="w-4 h-4"/>
                              </button_1.Button>
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.Edit className="w-4 h-4"/>
                              </button_1.Button>
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.QrCode className="w-4 h-4"/>
                              </button_1.Button>
                            </div>
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="bundles" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Bundle Management</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                {/* Bundles Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bundle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size & Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bundles.map((bundle) => (<tr key={bundle.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{bundle.bundleNumber}</div>
                              <div className="text-sm text-gray-500">QR: {bundle.qrCode}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{bundle.orderNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Size: {bundle.sizeCode}</div>
                              <div>Qty: {bundle.quantity} pcs</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(bundle.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.QrCode className="w-4 h-4"/>
                              </button_1.Button>
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.Eye className="w-4 h-4"/>
                              </button_1.Button>
                            </div>
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="efficiency" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Cutting Efficiency Analytics</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-center py-12">
                  <lucide_react_1.BarChart3 className="mx-auto h-12 w-12 text-gray-400"/>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Efficiency Analytics</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cutting efficiency charts and analytics will be displayed here.
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}
