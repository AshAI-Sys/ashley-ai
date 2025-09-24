'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DeliveryPage;
const react_1 = require("react");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
function DeliveryPage() {
    const [shipments, setShipments] = (0, react_1.useState)([]);
    const [stats, setStats] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [filterMethod, setFilterMethod] = (0, react_1.useState)('all');
    const [selectedView, setSelectedView] = (0, react_1.useState)('list');
    (0, react_1.useEffect)(() => {
        loadData();
    }, [filterStatus, filterMethod]);
    const loadData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '50'
            });
            if (filterStatus !== 'all')
                params.append('status', filterStatus);
            if (filterMethod !== 'all')
                params.append('method', filterMethod);
            const response = await fetch(`/api/delivery/shipments?${params}`);
            const data = await response.json();
            if (data.shipments) {
                setShipments(data.shipments || []);
            }
            const statsResponse = await fetch('/api/delivery/stats');
            const statsData = await statsResponse.json();
            setStats(statsData);
        }
        catch (error) {
            console.error('Error loading delivery data:', error);
            loadMockData();
        }
        finally {
            setLoading(false);
        }
    };
    const loadMockData = () => {
        // Mock data for demonstration
        setShipments([
            {
                id: '1',
                shipment_number: 'SH-2024-001',
                order: { order_number: 'ORD-2024-001' },
                consignee: {
                    name: 'Juan Dela Cruz',
                    address: '123 Main St, Quezon City, Metro Manila',
                    phone: '+63 917 123 4567'
                },
                method: 'DRIVER',
                status: 'IN_TRANSIT',
                cartons_count: 3,
                total_weight: 8.5,
                cod_amount: 2500,
                driver: {
                    first_name: 'Pedro',
                    last_name: 'Santos',
                    phone: '+63 917 987 6543'
                },
                vehicle: {
                    plate_no: 'ABC-123',
                    type: 'Van'
                },
                tracking_events: [
                    {
                        event_type: 'DISPATCHED',
                        location: 'Warehouse - Manila',
                        timestamp: '2024-09-15T08:00:00Z',
                        notes: 'Package picked up by driver'
                    },
                    {
                        event_type: 'IN_TRANSIT',
                        location: 'EDSA - Quezon City',
                        timestamp: '2024-09-15T09:30:00Z'
                    }
                ],
                eta: '2024-09-15T12:00:00Z',
                created_at: '2024-09-15T07:30:00Z'
            },
            {
                id: '2',
                shipment_number: 'SH-2024-002',
                order: { order_number: 'ORD-2024-002' },
                consignee: {
                    name: 'Maria Santos',
                    address: '456 Commerce Ave, Makati City, Metro Manila',
                    phone: '+63 918 234 5678'
                },
                method: 'LALAMOVE',
                status: 'DELIVERED',
                cartons_count: 2,
                total_weight: 4.2,
                tracking_events: [
                    {
                        event_type: 'DELIVERED',
                        location: '456 Commerce Ave, Makati City',
                        timestamp: '2024-09-15T10:45:00Z',
                        notes: 'Package delivered successfully'
                    }
                ],
                eta: '2024-09-15T11:00:00Z',
                created_at: '2024-09-15T08:00:00Z',
                delivered_at: '2024-09-15T10:45:00Z'
            },
            {
                id: '3',
                shipment_number: 'SH-2024-003',
                order: { order_number: 'ORD-2024-003' },
                consignee: {
                    name: 'Robert Chen',
                    address: '789 Business Park, BGC, Taguig City',
                    phone: '+63 919 345 6789'
                },
                method: 'GRAB',
                status: 'FAILED',
                cartons_count: 1,
                total_weight: 2.1,
                cod_amount: 1200,
                tracking_events: [
                    {
                        event_type: 'FAILED_DELIVERY',
                        location: '789 Business Park, BGC',
                        timestamp: '2024-09-15T11:15:00Z',
                        notes: 'Recipient not available'
                    }
                ],
                eta: '2024-09-15T12:30:00Z',
                created_at: '2024-09-15T09:00:00Z'
            }
        ]);
        setStats({
            ready_for_pickup: 8,
            in_transit: 5,
            delivered_today: 12,
            failed_deliveries: 2,
            on_time_rate: 89.5,
            avg_delivery_time: 3.2
        });
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'READY_FOR_PICKUP':
                return <badge_1.Badge className="bg-blue-100 text-blue-800">Ready for Pickup</badge_1.Badge>;
            case 'IN_TRANSIT':
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">In Transit</badge_1.Badge>;
            case 'OUT_FOR_DELIVERY':
                return <badge_1.Badge className="bg-orange-100 text-orange-800">Out for Delivery</badge_1.Badge>;
            case 'DELIVERED':
                return <badge_1.Badge className="bg-green-100 text-green-800">Delivered</badge_1.Badge>;
            case 'FAILED':
                return <badge_1.Badge className="bg-red-100 text-red-800">Failed</badge_1.Badge>;
            case 'CANCELLED':
                return <badge_1.Badge className="bg-gray-100 text-gray-800">Cancelled</badge_1.Badge>;
            default:
                return <badge_1.Badge>{status}</badge_1.Badge>;
        }
    };
    const getMethodBadge = (method) => {
        const colors = {
            'DRIVER': 'bg-purple-100 text-purple-800',
            'LALAMOVE': 'bg-green-100 text-green-800',
            'GRAB': 'bg-blue-100 text-blue-800',
            'JNT': 'bg-red-100 text-red-800',
            'LBC': 'bg-yellow-100 text-yellow-800'
        };
        return (<badge_1.Badge className={colors[method] || 'bg-gray-100 text-gray-800'}>
        {method}
      </badge_1.Badge>);
    };
    const filteredShipments = shipments.filter(shipment => (searchTerm === '' ||
        shipment.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.consignee.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || shipment.status === filterStatus) &&
        (filterMethod === 'all' || shipment.method === filterMethod));
    if (loading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery data...</p>
        </div>
      </div>);
    }
    return (<dashboard_layout_1.default>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Delivery Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Stage 8 - Track shipments and manage deliveries
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button_1.Button variant="outline">
              <lucide_react_1.Printer className="w-4 h-4 mr-2"/>
              Dispatch Reports
            </button_1.Button>
            <button_1.Button>
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              New Shipment
            </button_1.Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Package className="h-6 w-6 text-blue-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Ready for Pickup</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.ready_for_pickup}</dd>
                    </dl>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Truck className="h-6 w-6 text-yellow-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Transit</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.in_transit}</dd>
                    </dl>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.CheckCircle className="h-6 w-6 text-green-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Delivered Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.delivered_today}</dd>
                    </dl>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.XCircle className="h-6 w-6 text-red-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.failed_deliveries}</dd>
                    </dl>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Clock className="h-6 w-6 text-orange-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">On-Time Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.on_time_rate}%</dd>
                    </dl>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Navigation className="h-6 w-6 text-purple-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Time (hrs)</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.avg_delivery_time}</dd>
                    </dl>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>)}

        {/* View Toggle & Filters */}
        <card_1.Card className="mb-6">
          <card_1.CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                  <input_1.Input type="text" placeholder="Search shipments..." className="pl-10 pr-4" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>

                <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
                  <select_1.SelectTrigger className="w-48">
                    <select_1.SelectValue placeholder="Filter by status"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Status</select_1.SelectItem>
                    <select_1.SelectItem value="READY_FOR_PICKUP">Ready for Pickup</select_1.SelectItem>
                    <select_1.SelectItem value="IN_TRANSIT">In Transit</select_1.SelectItem>
                    <select_1.SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</select_1.SelectItem>
                    <select_1.SelectItem value="DELIVERED">Delivered</select_1.SelectItem>
                    <select_1.SelectItem value="FAILED">Failed</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>

                <select_1.Select value={filterMethod} onValueChange={setFilterMethod}>
                  <select_1.SelectTrigger className="w-32">
                    <select_1.SelectValue placeholder="Method"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Methods</select_1.SelectItem>
                    <select_1.SelectItem value="DRIVER">Driver</select_1.SelectItem>
                    <select_1.SelectItem value="LALAMOVE">Lalamove</select_1.SelectItem>
                    <select_1.SelectItem value="GRAB">Grab</select_1.SelectItem>
                    <select_1.SelectItem value="JNT">J&T</select_1.SelectItem>
                    <select_1.SelectItem value="LBC">LBC</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="flex items-center space-x-2">
                <button_1.Button variant={selectedView === 'list' ? 'default' : 'outline'} onClick={() => setSelectedView('list')} size="sm">
                  List
                </button_1.Button>
                <button_1.Button variant={selectedView === 'map' ? 'default' : 'outline'} onClick={() => setSelectedView('map')} size="sm">
                  Map
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Shipments List */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Delivery Shipments</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipment / Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method / Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ETA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filteredShipments || []).map((shipment) => (<tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {shipment.shipment_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order: {shipment.order.order_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <lucide_react_1.User className="w-4 h-4 mr-1"/>
                            {shipment.consignee.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-start mt-1">
                            <lucide_react_1.MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"/>
                            <span className="break-words">{shipment.consignee.address}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <lucide_react_1.Phone className="w-4 h-4 mr-1"/>
                            {shipment.consignee.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          {getMethodBadge(shipment.method)}
                          {shipment.driver && (<div className="text-sm text-gray-600">
                              {shipment.driver.first_name} {shipment.driver.last_name}
                              {shipment.vehicle && (<div className="text-xs text-gray-500">
                                  {shipment.vehicle.plate_no} ({shipment.vehicle.type})
                                </div>)}
                            </div>)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(shipment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shipment.cartons_count} cartons
                        </div>
                        <div className="text-sm text-gray-500">
                          {shipment.total_weight} kg
                        </div>
                        {shipment.cod_amount && (<div className="text-sm text-green-600 font-medium">
                            COD: ₱{shipment.cod_amount.toLocaleString()}
                          </div>)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(shipment.eta).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(shipment.eta).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button_1.Button size="sm" variant="outline">
                            <lucide_react_1.Eye className="w-4 h-4"/>
                          </button_1.Button>
                          {shipment.status !== 'DELIVERED' && shipment.status !== 'CANCELLED' && (<button_1.Button size="sm" variant="outline">
                              <lucide_react_1.Edit className="w-4 h-4"/>
                            </button_1.Button>)}
                          {shipment.method === 'DRIVER' && shipment.status === 'IN_TRANSIT' && (<button_1.Button size="sm" variant="outline">
                              <lucide_react_1.MapPin className="w-4 h-4"/>
                            </button_1.Button>)}
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>

            {filteredShipments.length === 0 && (<div className="text-center py-12">
                <lucide_react_1.Truck className="mx-auto h-12 w-12 text-gray-400"/>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new shipment.
                </p>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </dashboard_layout_1.default>);
}
