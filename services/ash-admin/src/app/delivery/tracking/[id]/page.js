"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ShipmentTrackingPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const separator_1 = require("@/components/ui/separator");
function ShipmentTrackingPage({ params, }) {
    const router = (0, navigation_1.useRouter)();
    const [shipment, setShipment] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        loadShipmentDetails();
        // Set up real-time updates
        const interval = setInterval(() => {
            if (shipment?.status === "IN_TRANSIT" ||
                shipment?.status === "OUT_FOR_DELIVERY") {
                refreshTrackingData();
            }
        }, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [params.id]);
    const loadShipmentDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/delivery/shipments/${params.id}`);
            const data = await response.json();
            if (data) {
                setShipment(data);
            }
        }
        catch (error) {
            console.error("Error loading shipment details:", error);
            // Load mock data for demo
            loadMockData();
        }
        finally {
            setLoading(false);
        }
    };
    const refreshTrackingData = async () => {
        setRefreshing(true);
        try {
            const response = await fetch(`/api/delivery/shipments/${params.id}/tracking`);
            const data = await response.json();
            if (data) {
                setShipment(prev => (prev ? { ...prev, ...data } : null));
            }
        }
        catch (error) {
            console.error("Error refreshing tracking data:", error);
        }
        finally {
            setRefreshing(false);
        }
    };
    const loadMockData = () => {
        // Mock data for demonstration
        setShipment({
            id: params.id,
            shipment_number: "SH-2024-001",
            order: { order_number: "ORD-2024-001" },
            consignee: {
                name: "Juan Dela Cruz",
                address: "123 Main St, Barangay San Antonio, Quezon City, Metro Manila 1105",
                phone: "+63 917 123 4567",
            },
            method: "DRIVER",
            status: "IN_TRANSIT",
            cartons: [
                { id: "1", carton_number: "CTN-001", weight: 2.5 },
                { id: "2", carton_number: "CTN-002", weight: 3.1 },
                { id: "3", carton_number: "CTN-003", weight: 2.9 },
            ],
            total_weight: 8.5,
            cod_amount: 2500,
            driver: {
                first_name: "Pedro",
                last_name: "Santos",
                phone: "+63 917 987 6543",
            },
            vehicle: {
                plate_no: "ABC-123",
                type: "Van",
            },
            tracking_events: [
                {
                    id: "1",
                    event_type: "CREATED",
                    location: "Warehouse - Manila Distribution Center",
                    timestamp: "2024-09-15T07:30:00Z",
                    notes: "Shipment created and cartons prepared",
                },
                {
                    id: "2",
                    event_type: "DISPATCHED",
                    location: "Warehouse - Loading Bay 3",
                    timestamp: "2024-09-15T08:00:00Z",
                    notes: "Package picked up by driver Pedro Santos",
                },
                {
                    id: "3",
                    event_type: "IN_TRANSIT",
                    location: "EDSA Northbound - Ortigas",
                    timestamp: "2024-09-15T09:30:00Z",
                    gps_coordinates: { lat: 14.5862, lng: 121.0558 },
                },
                {
                    id: "4",
                    event_type: "IN_TRANSIT",
                    location: "Commonwealth Avenue - Quezon City",
                    timestamp: "2024-09-15T10:15:00Z",
                    gps_coordinates: { lat: 14.656, lng: 121.0348 },
                },
            ],
            eta: "2024-09-15T12:00:00Z",
            created_at: "2024-09-15T07:30:00Z",
            current_location: {
                lat: 14.656,
                lng: 121.0348,
                address: "Commonwealth Avenue, Quezon City",
            },
        });
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "READY_FOR_PICKUP":
                return (<badge_1.Badge className="bg-blue-100 text-blue-800">Ready for Pickup</badge_1.Badge>);
            case "IN_TRANSIT":
                return (<badge_1.Badge className="bg-yellow-100 text-yellow-800">In Transit</badge_1.Badge>);
            case "OUT_FOR_DELIVERY":
                return (<badge_1.Badge className="bg-orange-100 text-orange-800">
            Out for Delivery
          </badge_1.Badge>);
            case "DELIVERED":
                return <badge_1.Badge className="bg-green-100 text-green-800">Delivered</badge_1.Badge>;
            case "FAILED":
                return <badge_1.Badge className="bg-red-100 text-red-800">Failed</badge_1.Badge>;
            default:
                return <badge_1.Badge>{status}</badge_1.Badge>;
        }
    };
    const getEventIcon = (eventType) => {
        switch (eventType) {
            case "CREATED":
                return <lucide_react_1.Package className="h-4 w-4"/>;
            case "DISPATCHED":
                return <lucide_react_1.Truck className="h-4 w-4"/>;
            case "IN_TRANSIT":
                return <lucide_react_1.Navigation className="h-4 w-4"/>;
            case "OUT_FOR_DELIVERY":
                return <lucide_react_1.MapPin className="h-4 w-4"/>;
            case "DELIVERED":
                return <lucide_react_1.CheckCircle className="h-4 w-4"/>;
            case "FAILED":
                return <lucide_react_1.AlertCircle className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Clock className="h-4 w-4"/>;
        }
    };
    if (loading) {
        return (<div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading shipment tracking...</p>
        </div>
      </div>);
    }
    if (!shipment) {
        return (<div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <lucide_react_1.AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500"/>
          <h2 className="text-xl font-semibold text-gray-900">
            Shipment Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            The requested shipment could not be found.
          </p>
          <button_1.Button onClick={() => router.back()} className="mt-4">
            Go Back
          </button_1.Button>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button_1.Button variant="ghost" onClick={() => router.back()} className="flex items-center">
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
              Back
            </button_1.Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Shipment Tracking - {shipment.shipment_number}
              </h1>
              <p className="text-sm text-gray-500">
                Order: {shipment.order.order_number}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button_1.Button variant="outline" onClick={refreshTrackingData} disabled={refreshing} className="flex items-center">
              <lucide_react_1.RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}/>
              Refresh
            </button_1.Button>
            {getStatusBadge(shipment.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Shipment Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Consignee Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center">
                    <lucide_react_1.User className="mr-2 h-5 w-5"/>
                    Delivery Details
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {shipment.consignee.name}
                    </div>
                    <div className="mt-1 flex items-start text-sm text-gray-600">
                      <lucide_react_1.MapPin className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0"/>
                      <span>{shipment.consignee.address}</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <lucide_react_1.Phone className="mr-2 h-4 w-4"/>
                      <a href={`tel:${shipment.consignee.phone}`} className="text-blue-600 hover:underline">
                        {shipment.consignee.phone}
                      </a>
                    </div>
                  </div>

                  <separator_1.Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Method</div>
                      <div className="font-medium">{shipment.method}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">ETA</div>
                      <div className="font-medium">
                        {new Date(shipment.eta).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}
                      </div>
                    </div>
                  </div>

                  {shipment.cod_amount && (<div className="rounded-lg bg-green-50 p-3">
                      <div className="text-sm font-medium text-green-800">
                        COD Amount: ₱{shipment.cod_amount.toLocaleString()}
                      </div>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>

              {/* Driver Information */}
              {shipment.driver && (<card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center">
                      <lucide_react_1.Truck className="mr-2 h-5 w-5"/>
                      Driver Information
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {shipment.driver.first_name} {shipment.driver.last_name}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <lucide_react_1.Phone className="mr-2 h-4 w-4"/>
                        <a href={`tel:${shipment.driver.phone}`} className="text-blue-600 hover:underline">
                          {shipment.driver.phone}
                        </a>
                      </div>
                    </div>

                    {shipment.vehicle && (<div className="rounded-lg bg-blue-50 p-3">
                        <div className="text-sm text-blue-800">
                          Vehicle: {shipment.vehicle.plate_no} (
                          {shipment.vehicle.type})
                        </div>
                      </div>)}
                  </card_1.CardContent>
                </card_1.Card>)}

              {/* Package Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center">
                    <lucide_react_1.Package className="mr-2 h-5 w-5"/>
                    Package Details
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cartons</span>
                      <span className="font-medium">
                        {shipment.cartons.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Weight</span>
                      <span className="font-medium">
                        {shipment.total_weight} kg
                      </span>
                    </div>
                  </div>

                  <separator_1.Separator className="my-4"/>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Carton List
                    </div>
                    {shipment.cartons.map(carton => (<div key={carton.id} className="flex justify-between text-sm">
                        <span>{carton.carton_number}</span>
                        <span>{carton.weight} kg</span>
                      </div>))}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </div>

          {/* Right Column - Tracking Timeline */}
          <div className="lg:col-span-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <lucide_react_1.Navigation className="mr-2 h-5 w-5"/>
                    Tracking Timeline
                  </span>
                  {shipment.current_location && (<div className="flex items-center text-sm text-gray-600">
                      <lucide_react_1.MapPin className="mr-1 h-4 w-4"/>
                      {shipment.current_location.address}
                    </div>)}
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-6">
                  {shipment.tracking_events.map((event, index) => (<div key={event.id} className="flex items-start space-x-4">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${index === 0
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"}`}>
                        {getEventIcon(event.event_type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
                            {event.event_type?.replace("_", " ") ||
                "Unknown Event"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div className="mt-1 text-sm text-gray-600">
                          <div className="flex items-start">
                            <lucide_react_1.MapPin className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0"/>
                            <span>{event.location}</span>
                          </div>
                        </div>

                        {event.notes && (<div className="mt-2 flex items-start text-sm text-gray-500">
                            <lucide_react_1.MessageSquare className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0"/>
                            <span>{event.notes}</span>
                          </div>)}

                        {event.photo_url && (<div className="mt-2">
                            <img src={event.photo_url} alt="Tracking event" className="h-24 w-24 rounded-lg border object-cover"/>
                          </div>)}

                        {event.gps_coordinates && (<div className="mt-1 text-xs text-gray-500">
                            GPS: {event.gps_coordinates.lat.toFixed(6)},{" "}
                            {event.gps_coordinates.lng.toFixed(6)}
                          </div>)}
                      </div>

                      {index < shipment.tracking_events.length - 1 && (<div className="absolute left-4 top-8 h-16 w-0.5 bg-gray-300"></div>)}
                    </div>))}

                  {shipment.status !== "DELIVERED" &&
            shipment.status !== "FAILED" && (<div className="flex items-center space-x-4 text-gray-500">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
                          <lucide_react_1.Clock className="h-4 w-4"/>
                        </div>
                        <div className="text-sm">
                          Next update expected within 30 minutes
                        </div>
                      </div>)}
                </div>

                {/* Map placeholder */}
                <div className="mt-8">
                  <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                    <div className="text-center text-gray-500">
                      <lucide_react_1.MapPin className="mx-auto mb-2 h-12 w-12"/>
                      <p>Live Map View</p>
                      <p className="text-sm">
                        Real-time GPS tracking visualization
                      </p>
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>
      </div>
    </div>);
}
