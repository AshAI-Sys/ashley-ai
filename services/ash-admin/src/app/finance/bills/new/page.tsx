"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";
import { ArrowLeft, Save } from "lucide-react";

export default function NewBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier: "",
    bill_number: "",
    amount: 0,
    due_date: "",
    category: "MATERIALS",
    description: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense_number: formData.bill_number || `BILL-${Date.now()}`,
          supplier: formData.supplier,
          amount: formData.amount,
          expense_date: new Date().toISOString(),
          category: formData.category,
          description: formData.description,
          notes: formData.notes,
          approved: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/finance");
      } else {
        alert("Error creating bill: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Bill</h1>
              <p className="text-gray-600">
                Record a new supplier bill or expense
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Supplier/Vendor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={e =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Enter supplier name..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Bill Number
                  </label>
                  <input
                    type="text"
                    value={formData.bill_number}
                    onChange={e =>
                      setFormData({ ...formData, bill_number: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="MATERIALS">Materials</option>
                    <option value="LABOR">Labor</option>
                    <option value="UTILITIES">Utilities</option>
                    <option value="RENT">Rent</option>
                    <option value="OFFICE">Office Supplies</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Brief description..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplier:</span>
                  <span className="font-medium">
                    {formData.supplier || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>₱{formData.amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Bill"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
