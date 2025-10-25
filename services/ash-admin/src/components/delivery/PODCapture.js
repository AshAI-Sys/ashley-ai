"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PODCapture = PODCapture;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const card_1 = require("@/components/ui/card");
const FileUpload_1 = require("@/components/FileUpload");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function PODCapture({ deliveryId, deliveryReference, workspaceId, shipmentId, cartonId, onComplete, onCancel, }) {
    const [formData, setFormData] = (0, react_1.useState)({
        recipient_name: "",
        recipient_phone: "",
        signature_url: "",
        photo_urls: [],
        notes: "",
        latitude: null,
        longitude: null,
        geolocation: "",
        delivery_status: "DELIVERED",
        cod_amount: null,
        cod_collected: null,
        cod_reference: "",
    });
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [gettingLocation, setGettingLocation] = (0, react_1.useState)(false);
    // Get current location on mount
    (0, react_1.useEffect)(() => {
        getCurrentLocation();
    }, []);
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            react_hot_toast_1.default.error("Geolocation is not supported by your browser");
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setFormData(prev => ({
                ...prev,
                latitude,
                longitude,
            }));
            // Reverse geocode to get address
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    geolocation: data.display_name,
                }));
            }
            catch (error) {
                console.error("Error getting address:", error);
            }
            finally {
                setGettingLocation(false);
            }
        }, error => {
            console.error("Error getting location:", error);
            react_hot_toast_1.default.error("Failed to get current location");
            setGettingLocation(false);
        });
    };
    const handlePhotoUpload = (url) => {
        setFormData(prev => ({
            ...prev,
            photo_urls: [...prev.photo_urls, url],
        }));
    };
    const handlePhotoRemove = (url) => {
        setFormData(prev => ({
            ...prev,
            photo_urls: prev.photo_urls.filter(u => u !== url),
        }));
    };
    const handleSubmit = async () => {
        if (!formData.recipient_name) {
            react_hot_toast_1.default.error("Recipient name is required");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("/api/pod", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workspace_id: workspaceId,
                    delivery_id: deliveryId,
                    shipment_id: shipmentId,
                    carton_id: cartonId,
                    ...formData,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to submit POD");
            }
            react_hot_toast_1.default.success("Proof of delivery submitted successfully!");
            if (onComplete)
                onComplete();
        }
        catch (error) {
            console.error("Error submitting POD:", error);
            react_hot_toast_1.default.error(error.message || "Failed to submit POD");
        }
        finally {
            setLoading(false);
        }
    };
    return (<card_1.Card className="mx-auto w-full max-w-2xl">
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Camera className="h-5 w-5"/>
          Proof of Delivery
          {deliveryReference && (<span className="ml-2 text-sm text-gray-500">
              ({deliveryReference})
            </span>)}
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Recipient Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Recipient Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label_1.Label htmlFor="recipient_name">Recipient Name *</label_1.Label>
              <input_1.Input id="recipient_name" value={formData.recipient_name} onChange={e => setFormData({ ...formData, recipient_name: e.target.value })} placeholder="John Doe" required/>
            </div>
            <div>
              <label_1.Label htmlFor="recipient_phone">Phone Number</label_1.Label>
              <input_1.Input id="recipient_phone" type="tel" value={formData.recipient_phone} onChange={e => setFormData({ ...formData, recipient_phone: e.target.value })} placeholder="+63 912 345 6789"/>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <lucide_react_1.MapPin className="h-4 w-4"/>
            Location
          </h3>
          <div>
            <label_1.Label>Current Location</label_1.Label>
            <div className="flex items-center gap-2">
              <input_1.Input value={formData.geolocation || "Getting location..."} disabled className="flex-1"/>
              <button_1.Button type="button" variant="outline" onClick={getCurrentLocation} disabled={gettingLocation}>
                <lucide_react_1.MapPin className="h-4 w-4"/>
              </button_1.Button>
            </div>
            {formData.latitude && formData.longitude && (<p className="mt-1 text-xs text-gray-500">
                Coordinates: {formData.latitude.toFixed(6)},{" "}
                {formData.longitude.toFixed(6)}
              </p>)}
          </div>
        </div>

        {/* Signature */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Signature</h3>
          <div>
            <label_1.Label>Recipient Signature Photo</label_1.Label>
            <FileUpload_1.FileUpload onUpload={url => setFormData({ ...formData, signature_url: url })} accept="image/*" maxSizeMB={5} folder="pod-signatures" type="image" existingUrls={formData.signature_url ? [formData.signature_url] : []} onRemove={() => setFormData({ ...formData, signature_url: "" })}/>
          </div>
        </div>

        {/* Delivery Photos */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Delivery Photos
          </h3>
          <div>
            <label_1.Label>Upload Photos (Package, Location, etc.)</label_1.Label>
            <FileUpload_1.FileUpload onUpload={handlePhotoUpload} accept="image/*" maxSizeMB={5} folder="pod-photos" type="image" multiple={true} existingUrls={formData.photo_urls} onRemove={handlePhotoRemove}/>
          </div>
        </div>

        {/* COD (Cash on Delivery) */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <lucide_react_1.DollarSign className="h-4 w-4"/>
            Cash on Delivery (Optional)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label_1.Label htmlFor="cod_amount">COD Amount</label_1.Label>
              <input_1.Input id="cod_amount" type="number" step="0.01" value={formData.cod_amount || ""} onChange={e => setFormData({
            ...formData,
            cod_amount: parseFloat(e.target.value) || null,
        })} placeholder="0.00"/>
            </div>
            <div>
              <label_1.Label htmlFor="cod_collected">Amount Collected</label_1.Label>
              <input_1.Input id="cod_collected" type="number" step="0.01" value={formData.cod_collected || ""} onChange={e => setFormData({
            ...formData,
            cod_collected: parseFloat(e.target.value) || null,
        })} placeholder="0.00"/>
            </div>
            <div>
              <label_1.Label htmlFor="cod_reference">Payment Reference</label_1.Label>
              <input_1.Input id="cod_reference" value={formData.cod_reference} onChange={e => setFormData({ ...formData, cod_reference: e.target.value })} placeholder="GCash ref, etc."/>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Additional Notes
          </h3>
          <div>
            <label_1.Label htmlFor="notes">Notes</label_1.Label>
            <textarea_1.Textarea id="notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional remarks about the delivery..." rows={3}/>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 border-t pt-4">
          {onCancel && (<button_1.Button type="button" variant="outline" onClick={onCancel}>
              <lucide_react_1.X className="mr-2 h-4 w-4"/>
              Cancel
            </button_1.Button>)}
          <button_1.Button onClick={handleSubmit} disabled={loading}>
            <lucide_react_1.Save className="mr-2 h-4 w-4"/>
            {loading ? "Submitting..." : "Submit POD"}
          </button_1.Button>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
