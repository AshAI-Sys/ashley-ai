"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  order_number: string;
  brand: {
    name: string;
    code: string;
  };
  line_items: Array<{
    description: string;
    garment_type: string;
  }>;
}

interface FabricBatch {
  id: string;
  lot_no: string;
  uom: string;
  qty_on_hand: number;
  gsm?: number;
  width_cm?: number;
  brand: {
    name: string;
    code: string;
  };
  created_at: string;
}

export default function IssueFabricPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fabricBatches, setFabricBatches] = useState<FabricBatch[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<FabricBatch | null>(null);

  const [formData, setFormData] = useState({
    order_id: "",
    batch_id: "",
    qty_issued: "",
    uom: "KG",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
    fetchFabricBatches();
  }, []);

  const fetchOrders = async () => {
    try {
      // Mock data for demo - in real app, fetch from API
      setOrders([
        {
          id: "1",
          order_number: "TCAS-2025-000001",
          brand: { name: "Trendy Casual", code: "TCAS" },
          line_items: [
            {
              description: "Premium Hoodie",
              garment_type: "Hoodie",
            },
          ],
        },
        {
          id: "2",
          order_number: "URBN-2025-000001",
          brand: { name: "Urban Streetwear", code: "URBN" },
          line_items: [
            {
              description: "Street T-Shirt",
              garment_type: "T-Shirt",
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchFabricBatches = async () => {
    try {
      const response = await fetch("/api/cutting/fabric-batches");
      if (response.ok) {
        const data = await response.json();
        setFabricBatches(data.data || []);
      } else {
        // Use mock data if API fails
        setFabricBatches([
          {
            id: "1",
            lot_no: "LOT-2025-001",
            uom: "KG",
            qty_on_hand: 45.5,
            gsm: 280,
            width_cm: 160,
            brand: { name: "Trendy Casual", code: "TCAS" },
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            lot_no: "LOT-2025-002",
            uom: "M",
            qty_on_hand: 120.0,
            gsm: 180,
            width_cm: 150,
            brand: { name: "Urban Streetwear", code: "URBN" },
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch fabric batches:", error);
      // Use mock data as fallback
      setFabricBatches([
        {
          id: "1",
          lot_no: "LOT-2025-001",
          uom: "KG",
          qty_on_hand: 45.5,
          gsm: 280,
          width_cm: 160,
          brand: { name: "Trendy Casual", code: "TCAS" },
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setSelectedOrder(order || null);
    setFormData({ ...formData, order_id: orderId });

    // Filter batches by brand if order selected
    if (order) {
      // In a real app, you might want to filter batches by brand
      // For demo, we'll just keep all batches visible
    }
  };

  const handleBatchChange = (batchId: string) => {
    const batch = fabricBatches.find(b => b.id === batchId);
    setSelectedBatch(batch || null);
    setFormData({
      ...formData,
      batch_id: batchId,
      uom: batch?.uom || "KG",
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.order_id) newErrors.order_id = "Please select an order";
    if (!formData.batch_id) newErrors.batch_id = "Please select a fabric batch";
    if (!formData.qty_issued)
      newErrors.qty_issued = "Quantity to issue is required";

    const qtyIssued = parseFloat(formData.qty_issued);
    if (selectedBatch && qtyIssued > selectedBatch.qty_on_hand) {
      newErrors.qty_issued = `Cannot issue more than available quantity (${selectedBatch.qty_on_hand} ${selectedBatch.uom})`;
    }

    if (qtyIssued <= 0) {
      newErrors.qty_issued = "Quantity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = {
        order_id: formData.order_id,
        batch_id: formData.batch_id,
        qty_issued: parseFloat(formData.qty_issued),
        uom: formData.uom,
      };

      const response = await fetch("/api/cutting/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const __result = await response.json();
        router.push("/cutting");
      } else {
        const error = await response.json();
        console.error("Failed to issue fabric:", error);
        setErrors({ submit: error.error || "Failed to issue fabric" });
      }
    } catch (error) {
      console.error("Error issuing fabric:", error);
      setErrors({ submit: "Network error - please try again" });
    } finally {
      setLoading(false);
    }
  };

  const availableQuantity = selectedBatch?.qty_on_hand || 0;
  const requestedQuantity = parseFloat(formData.qty_issued) || 0;
  const remainingQuantity = availableQuantity - requestedQuantity;

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/cutting">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cutting
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Issue Fabric to Cutting</h1>
          <p className="text-muted-foreground">
            Transfer fabric from warehouse to cutting floor
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Production Order</CardTitle>
            <CardDescription>
              Select the order that will use this fabric
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Select
                value={formData.order_id}
                onValueChange={handleOrderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select production order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.brand.name} (
                      {order.line_items[0]?.garment_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.order_id && (
                <p className="text-sm text-red-600">{errors.order_id}</p>
              )}
            </div>

            {selectedOrder && (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge>{selectedOrder.brand.code}</Badge>
                  <span className="font-medium">
                    {selectedOrder.order_number}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.line_items[0]?.description} (
                  {selectedOrder.line_items[0]?.garment_type})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fabric Batch Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Fabric Batch</CardTitle>
            <CardDescription>Choose the fabric batch to issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch">Available Batches</Label>
              <Select
                value={formData.batch_id}
                onValueChange={handleBatchChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fabric batch" />
                </SelectTrigger>
                <SelectContent>
                  {fabricBatches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.lot_no} - {batch.qty_on_hand} {batch.uom} available
                      {batch.gsm &&
                        batch.width_cm &&
                        ` (${batch.gsm}GSM, ${batch.width_cm}cm)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.batch_id && (
                <p className="text-sm text-red-600">{errors.batch_id}</p>
              )}
            </div>

            {selectedBatch && (
              <div className="rounded-lg bg-green-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{selectedBatch.lot_no}</span>
                  <Badge variant="outline">{selectedBatch.brand.name}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <span className="font-medium">Available:</span>
                    <br />
                    <span className="text-lg font-bold text-green-600">
                      {selectedBatch.qty_on_hand} {selectedBatch.uom}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">GSM:</span>
                    <br />
                    {selectedBatch.gsm || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Width:</span>
                    <br />
                    {selectedBatch.width_cm
                      ? `${selectedBatch.width_cm} cm`
                      : "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Received:</span>
                    <br />
                    {new Date(selectedBatch.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quantity to Issue */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Quantity</CardTitle>
            <CardDescription>
              Specify how much fabric to transfer to cutting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qty_issued">Quantity to Issue *</Label>
                <Input
                  id="qty_issued"
                  type="number"
                  step="0.01"
                  value={formData.qty_issued}
                  onChange={e =>
                    setFormData({ ...formData, qty_issued: e.target.value })
                  }
                  placeholder="15.5"
                  required
                />
                {errors.qty_issued && (
                  <p className="text-sm text-red-600">{errors.qty_issued}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uom">Unit of Measure</Label>
                <Input
                  id="uom"
                  value={formData.uom}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-muted-foreground">
                  Unit is determined by the selected batch
                </p>
              </div>
            </div>

            {/* Quantity Summary */}
            {selectedBatch && requestedQuantity > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-medium">Issue Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Available:</span>
                    <br />
                    <span className="font-medium">
                      {availableQuantity} {formData.uom}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To Issue:</span>
                    <br />
                    <span className="font-medium text-blue-600">
                      {requestedQuantity} {formData.uom}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span>
                    <br />
                    <span
                      className={`font-medium ${remainingQuantity >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {remainingQuantity} {formData.uom}
                    </span>
                  </div>
                </div>

                {remainingQuantity < 0 && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">
                        Insufficient Quantity
                      </p>
                      <p className="text-sm text-red-700">
                        You are trying to issue more fabric than available in
                        this batch.
                      </p>
                    </div>
                  </div>
                )}

                {remainingQuantity >= 0 && requestedQuantity > 0 && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        Ready to Issue
                      </p>
                      <p className="text-sm text-green-700">
                        This fabric will be transferred from warehouse to
                        cutting floor.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/cutting">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || remainingQuantity < 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Processing..." : "Issue Fabric"}
          </Button>
        </div>

        {errors.submit && (
          <p className="text-center text-sm text-red-600">{errors.submit}</p>
        )}
      </form>
    </div>
  );
}
