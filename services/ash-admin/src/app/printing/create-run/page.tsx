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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Printer,
  Palette,
  Zap,
  Package2,
  Shirt,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  order_number: string;
  brand: { name: string; code: string };
  line_items: Array<{
    id: string;
    description: string;
    garment_type: string;
    qty: number;
  }>;
  routing_steps: Array<{
    id: string;
    operation_type: string;
    status: string;
    sequence: number;
  }>;
}

interface Machine {
  id: string;
  name: string;
  workcenter: "PRINTING" | "HEAT_PRESS" | "EMB" | "DRYER";
  is_active: boolean;
}

const methodIcons = {
  SILKSCREEN: Palette,
  SUBLIMATION: Zap,
  DTF: Package2,
  EMBROIDERY: Shirt,
};

const methodDescriptions = {
  SILKSCREEN: "Screen printing with plastisol or water-based inks",
  SUBLIMATION: "Heat transfer with sublimation paper and polyester fabrics",
  DTF: "Direct-to-Film printing with powder adhesive",
  EMBROIDERY: "Machine embroidery with thread designs",
};

export default function CreatePrintRunPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStep, setSelectedStep] = useState<string>("");

  const [formData, setFormData] = useState({
    routing_step_id: "",
    machine_id: "",
    method: "",
    target_qty: "",
    priority: "NORMAL" as "LOW" | "NORMAL" | "HIGH" | "URGENT",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
    fetchMachines();
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
              id: "1",
              description: "Premium Hoodie - Navy",
              garment_type: "Hoodie",
              qty: 100,
            },
          ],
          routing_steps: [
            {
              id: "step1",
              operation_type: "SILKSCREEN",
              status: "ready",
              sequence: 1,
            },
            {
              id: "step2",
              operation_type: "HEAT_CURE",
              status: "pending",
              sequence: 2,
            },
          ],
        },
        {
          id: "2",
          order_number: "URBN-2025-000001",
          brand: { name: "Urban Streetwear", code: "URBN" },
          line_items: [
            {
              id: "2",
              description: "Logo T-Shirt - White",
              garment_type: "T-Shirt",
              qty: 50,
            },
          ],
          routing_steps: [
            {
              id: "step3",
              operation_type: "EMBROIDERY",
              status: "ready",
              sequence: 1,
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await fetch("/api/printing/machines");
      if (response.ok) {
        const data = await response.json();
        const fetchedMachines = data.data || [];

        // Use mock data if API returns empty array (no machines in database yet)
        if (fetchedMachines.length === 0) {
          setMachines([
            {
              id: "1",
              name: "M&R Sportsman EX",
              workcenter: "PRINTING",
              is_active: true,
            },
            {
              id: "2",
              name: "Epson SureColor F570",
              workcenter: "PRINTING",
              is_active: true,
            },
            {
              id: "3",
              name: "Heat Press Pro 15x15",
              workcenter: "HEAT_PRESS",
              is_active: true,
            },
            {
              id: "4",
              name: "Tajima 16-Head",
              workcenter: "EMB",
              is_active: true,
            },
            {
              id: "5",
              name: 'Conveyor Dryer 24"',
              workcenter: "DRYER",
              is_active: true,
            },
          ]);
        } else {
          setMachines(fetchedMachines);
        }
      } else {
        // Mock data
        setMachines([
          {
            id: "1",
            name: "M&R Sportsman EX",
            workcenter: "PRINTING",
            is_active: true,
          },
          {
            id: "2",
            name: "Epson SureColor F570",
            workcenter: "PRINTING",
            is_active: true,
          },
          {
            id: "3",
            name: "Heat Press Pro 15x15",
            workcenter: "HEAT_PRESS",
            is_active: true,
          },
          {
            id: "4",
            name: "Tajima 16-Head",
            workcenter: "EMB",
            is_active: true,
          },
          {
            id: "5",
            name: 'Conveyor Dryer 24"',
            workcenter: "DRYER",
            is_active: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch machines:", error);
      // Use mock data on error
      setMachines([
        {
          id: "1",
          name: "M&R Sportsman EX",
          workcenter: "PRINTING",
          is_active: true,
        },
        {
          id: "2",
          name: "Epson SureColor F570",
          workcenter: "PRINTING",
          is_active: true,
        },
        {
          id: "3",
          name: "Heat Press Pro 15x15",
          workcenter: "HEAT_PRESS",
          is_active: true,
        },
        {
          id: "4",
          name: "Tajima 16-Head",
          workcenter: "EMB",
          is_active: true,
        },
        {
          id: "5",
          name: 'Conveyor Dryer 24"',
          workcenter: "DRYER",
          is_active: true,
        },
      ]);
    }
  };

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setSelectedOrder(order || null);
    setSelectedStep("");
    setFormData({
      ...formData,
      routing_step_id: "",
      method: "",
      target_qty: order?.line_items[0]?.qty.toString() || "",
    });
  };

  const handleStepChange = (stepId: string) => {
    setSelectedStep(stepId);
    const step = selectedOrder?.routing_steps.find(s => s.id === stepId);
    const method =
      step?.operation_type === "HEAT_CURE"
        ? "SILKSCREEN"
        : step?.operation_type || "";

    setFormData({
      ...formData,
      routing_step_id: stepId,
      method: method,
    });
  };

  const getAvailableMachines = () => {
    if (!formData.method) return machines.filter(m => m.is_active);

    const workcenters = {
      SILKSCREEN: ["PRINTING", "DRYER"],
      SUBLIMATION: ["PRINTING", "HEAT_PRESS"],
      DTF: ["PRINTING", "HEAT_PRESS"],
      EMBROIDERY: ["EMB"],
    };

    const requiredWorkcenters =
      workcenters[formData.method as keyof typeof workcenters] || [];
    return machines.filter(
      m => m.is_active && requiredWorkcenters.includes(m.workcenter)
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.routing_step_id)
      newErrors.routing_step_id = "Please select a routing step";
    if (!formData.machine_id) newErrors.machine_id = "Please select a machine";
    if (!formData.method) newErrors.method = "Please select a printing method";
    if (!formData.target_qty)
      newErrors.target_qty = "Target quantity is required";

    const targetQty = parseInt(formData.target_qty);
    if (targetQty <= 0)
      newErrors.target_qty = "Target quantity must be greater than 0";

    if (selectedOrder && targetQty > (selectedOrder.line_items[0]?.qty || 0)) {
      newErrors.target_qty = `Cannot exceed order quantity (${selectedOrder.line_items[0]?.qty})`;
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
        routing_step_id: formData.routing_step_id,
        machine_id: formData.machine_id,
        method: formData.method,
        target_qty: parseInt(formData.target_qty),
        priority: formData.priority,
        notes: formData.notes || undefined,
      };

      const response = await fetch("/api/printing/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push("/printing");
      } else {
        const error = await response.json();
        console.error("Failed to create print run:", error);
        setErrors({ submit: error.error || "Failed to create print run" });
      }
    } catch (error) {
      console.error("Error creating print run:", error);
      setErrors({ submit: "Network error - please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/printing">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Printing
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Print Run</h1>
          <p className="text-muted-foreground">
            Set up a new printing operation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Production Order</CardTitle>
            <CardDescription>
              Select the order and routing step for this print run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Select
                value={selectedOrder?.id || ""}
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
                  {selectedOrder.line_items[0]?.description} - Qty:{" "}
                  {selectedOrder.line_items[0]?.qty}
                </p>
              </div>
            )}

            {selectedOrder && (
              <div className="space-y-2">
                <Label htmlFor="step">Routing Step</Label>
                <Select value={selectedStep} onValueChange={handleStepChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select routing step" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedOrder.routing_steps
                      .filter(step => step.status === "ready")
                      .map(step => (
                        <SelectItem key={step.id} value={step.id}>
                          Step {step.sequence}:{" "}
                          {step.operation_type.replace("_", " ")}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.routing_step_id && (
                  <p className="text-sm text-red-600">
                    {errors.routing_step_id}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Method Selection */}
        {formData.routing_step_id && (
          <Card>
            <CardHeader>
              <CardTitle>Printing Method</CardTitle>
              <CardDescription>
                Choose the printing method for this run
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.method ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border bg-green-50 p-4">
                    {React.createElement(
                      methodIcons[formData.method as keyof typeof methodIcons],
                      {
                        className: "w-6 h-6 text-green-600",
                      }
                    )}
                    <div>
                      <h3 className="font-medium">{formData.method}</h3>
                      <p className="text-sm text-muted-foreground">
                        {
                          methodDescriptions[
                            formData.method as keyof typeof methodDescriptions
                          ]
                        }
                      </p>
                    </div>
                  </div>

                  {formData.method !==
                    selectedOrder?.routing_steps.find(
                      s => s.id === selectedStep
                    )?.operation_type && (
                    <div className="text-sm text-blue-600">
                      ℹ️ Method automatically selected based on routing step
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(methodIcons).map(([method, Icon]) => (
                    <button
                      key={method}
                      type="button"
                      className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50"
                      onClick={() => setFormData({ ...formData, method })}
                    >
                      <Icon className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{method}</h3>
                        <p className="text-sm text-muted-foreground">
                          {
                            methodDescriptions[
                              method as keyof typeof methodDescriptions
                            ]
                          }
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.method && (
                <p className="text-sm text-red-600">{errors.method}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Machine & Quantity */}
        {formData.method && (
          <Card>
            <CardHeader>
              <CardTitle>Machine & Quantity</CardTitle>
              <CardDescription>
                Select machine and set target quantity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="machine">Machine</Label>
                  <Select
                    value={formData.machine_id}
                    onValueChange={value =>
                      setFormData({ ...formData, machine_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMachines().map(machine => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name} (
                          {machine.workcenter?.replace("_", " ") ||
                            "No workcenter"}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.machine_id && (
                    <p className="text-sm text-red-600">{errors.machine_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_qty">Target Quantity</Label>
                  <Input
                    id="target_qty"
                    type="number"
                    min="1"
                    value={formData.target_qty}
                    onChange={e =>
                      setFormData({ ...formData, target_qty: e.target.value })
                    }
                    placeholder="100"
                  />
                  {errors.target_qty && (
                    <p className="text-sm text-red-600">{errors.target_qty}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={value =>
                    setFormData({ ...formData, priority: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Special instructions or notes for this print run..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/printing">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || !formData.method || !formData.machine_id}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Create Print Run
              </>
            )}
          </Button>
        </div>

        {errors.submit && (
          <p className="text-center text-sm text-red-600">{errors.submit}</p>
        )}
      </form>
    </div>
  );
}
