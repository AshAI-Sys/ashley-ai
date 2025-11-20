"use client";

import { useState, useEffect } from "react";
import { Camera, MapPin, DollarSign, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "react-hot-toast";

interface PODCaptureProps {
  deliveryId: string;
  deliveryReference?: string;
  workspaceId: string;
  shipmentId?: string;
  cartonId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function PODCapture({
  deliveryId,
  deliveryReference,
  workspaceId,
  shipmentId,
  cartonId,
  onComplete,
  onCancel,
}: PODCaptureProps) {
  const [formData, setFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    signature_url: "",
    photo_urls: [] as string[],
    notes: "",
    latitude: null as number | null,
    longitude: null as number | null,
    geolocation: "",
    delivery_status: "DELIVERED",
    cod_amount: null as number | null,
    cod_collected: null as number | null,
    cod_reference: "",
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            geolocation: data.display_name,
          }));
        } catch (error) {
          console.error("Error getting address:", error);
        } finally {
          setGettingLocation(false);
        }
      },
      error => {
        console.error("Error getting location:", error);
        toast.error("Failed to get current location");
        setGettingLocation(false);
      }
    );
  };

  const handlePhotoUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: [...prev.photo_urls, url],
    }));
  };

  const handlePhotoRemove = (url: string) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter(u => u !== url),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.recipient_name) {
      toast.error("Recipient name is required");
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

      toast.success("Proof of delivery submitted successfully!");
      if (onComplete) onComplete();
    } catch (error: any) {
      console.error("Error submitting POD:", error);
      toast.error(error.message || "Failed to submit POD");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Proof of Delivery
          {deliveryReference && (
            <span className="ml-2 text-sm text-gray-500">
              ({deliveryReference})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipient Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Recipient Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="recipient_name">Recipient Name *</Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                onChange={e =>
                  setFormData({ ...formData, recipient_name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="recipient_phone">Phone Number</Label>
              <Input
                id="recipient_phone"
                type="tel"
                value={formData.recipient_phone}
                onChange={e =>
                  setFormData({ ...formData, recipient_phone: e.target.value })
                }
                placeholder="+63 912 345 6789"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="h-4 w-4" />
            Location
          </h3>
          <div>
            <Label>Current Location</Label>
            <div className="flex items-center gap-2">
              <Input
                value={formData.geolocation || "Getting location..."}
                disabled
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="mt-1 text-xs text-gray-500">
                Coordinates: {formData.latitude.toFixed(6)},{" "}
                {formData.longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Signature */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Signature</h3>
          <div>
            <Label>Recipient Signature Photo</Label>
            <FileUpload
              onUpload={url => setFormData({ ...formData, signature_url: url })}
              accept="image/*"
              maxSizeMB={5}
              folder="pod-signatures"
              type="image"
              existingUrls={
                formData.signature_url ? [formData.signature_url] : []
              }
              onRemove={() => setFormData({ ...formData, signature_url: "" })}
            />
          </div>
        </div>

        {/* Delivery Photos */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Delivery Photos
          </h3>
          <div>
            <Label>Upload Photos (Package, Location, etc.)</Label>
            <FileUpload
              onUpload={handlePhotoUpload}
              accept="image/*"
              maxSizeMB={5}
              folder="pod-photos"
              type="image"
              multiple={true}
              existingUrls={formData.photo_urls}
              onRemove={handlePhotoRemove}
            />
          </div>
        </div>

        {/* COD (Cash on Delivery) */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <DollarSign className="h-4 w-4" />
            Cash on Delivery (Optional)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="cod_amount">COD Amount</Label>
              <Input
                id="cod_amount"
                type="number"
                step="0.01"
                value={formData.cod_amount || ""}
                onChange={e =>
                  setFormData({
                    ...formData,
                    cod_amount: parseFloat(e.target.value) || null,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="cod_collected">Amount Collected</Label>
              <Input
                id="cod_collected"
                type="number"
                step="0.01"
                value={formData.cod_collected || ""}
                onChange={e =>
                  setFormData({
                    ...formData,
                    cod_collected: parseFloat(e.target.value) || null,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="cod_reference">Payment Reference</Label>
              <Input
                id="cod_reference"
                value={formData.cod_reference}
                onChange={e =>
                  setFormData({ ...formData, cod_reference: e.target.value })
                }
                placeholder="GCash ref, etc."
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Additional Notes
          </h3>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional remarks about the delivery..."
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 border-t pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Submitting..." : "Submit POD"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
