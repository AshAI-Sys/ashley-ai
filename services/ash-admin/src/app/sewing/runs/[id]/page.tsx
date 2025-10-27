"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Package,
  User,
  Camera,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Brain,
  Timer,
  Target,
  Edit,
} from "lucide-react";
import Link from "next/link";

interface SewingRun {
  id: string;
  operation_name: string;
  status: "CREATED" | "IN_PROGRESS" | "DONE";
  order: {
    order_number: string;
    brand: { name: string; code: string };
    line_items: Array<{ description: string }>;
  };
  operator: {
    first_name: string;
    last_name: string;
    employee_number: string;
  };
  bundle: {
    id: string;
    size_code: string;
    qty: number;
    qr_code: string;
  };
  routing_step: {
    id: string;
    step_name: string;
    estimated_hours?: number;
  };
  qty_good: number;
  qty_reject: number;
  earned_minutes?: number;
  actual_minutes?: number;
  efficiency_pct?: number;
  piece_rate_pay?: number;
  reject_reason?: string;
  reject_photo_url?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
}

interface QualityReject {
  id: string;
  qty: number;
  reason: string;
  photo_url?: string;
  created_at: string;
}

interface TimeEntry {
  id: string;
  action: "START" | "PAUSE" | "RESUME" | "COMPLETE";
  timestamp: string;
  notes?: string;
}

export default function SewingRunDetailsPage() {
  const params = useParams();
  const __router = useRouter();
  const runId = params.id as string;

  const [sewingRun, setSewingRun] = useState<SewingRun | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [qualityRejects, setQualityRejects] = useState<QualityReject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Quality control state
  const [rejectQty, setRejectQty] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectPhoto, setRejectPhoto] = useState<File | null>(null);

  // Progress update state
  const [goodQty, setGoodQty] = useState("");
  const [progressNotes, setProgressNotes] = useState("");

  useEffect(() => {
    if (runId) {
      fetchRunDetails();
    }
  }, [runId]);

  const fetchRunDetails = async () => {
    try {
      setLoading(true);

      const [runResponse, timeResponse, rejectsResponse] = await Promise.all([
        fetch(`/api/sewing/runs/${runId}`),
        fetch(`/api/sewing/runs/${runId}/time-entries`),
        fetch(`/api/sewing/runs/${runId}/rejects`),
      ]);

      if (runResponse.ok) {
        const runData = await runResponse.json();
        setSewingRun(runData.data);
        setGoodQty(runData.data.qty_good.toString());
      } else {
        // Mock data for demo
        const mockRun: SewingRun = {
          id: runId,
          operation_name: "Join shoulders",
          status: "IN_PROGRESS",
          order: {
            order_number: "TCAS-2025-000001",
            brand: { name: "Trendy Casual", code: "TCAS" },
            line_items: [{ description: "Premium Hoodie" }],
          },
          operator: {
            first_name: "Maria",
            last_name: "Santos",
            employee_number: "EMP001",
          },
          bundle: {
            id: "bundle-001",
            size_code: "M",
            qty: 20,
            qr_code: "ash://bundle/001",
          },
          routing_step: {
            id: "step-001",
            step_name: "Sewing - Join shoulders",
            estimated_hours: 0.5,
          },
          qty_good: 15,
          qty_reject: 1,
          earned_minutes: 22.5,
          actual_minutes: 25,
          efficiency_pct: 90,
          piece_rate_pay: 33.75,
          started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setSewingRun(mockRun);
        setGoodQty("15");
      }

      if (timeResponse.ok) {
        const timeData = await timeResponse.json();
        setTimeEntries(timeData.data || []);
      } else {
        setTimeEntries([
          {
            id: "1",
            action: "START",
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            action: "PAUSE",
            timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            notes: "Short break",
          },
          {
            id: "3",
            action: "RESUME",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
        ]);
      }

      if (rejectsResponse.ok) {
        const rejectsData = await rejectsResponse.json();
        setQualityRejects(rejectsData.data || []);
      } else {
        setQualityRejects([
          {
            id: "1",
            qty: 1,
            reason: "Uneven stitching",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch run details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAction = async (
    action: "start" | "pause" | "resume" | "complete"
  ) => {
    try {
      setActionLoading(true);

      const response = await fetch(`/api/sewing/runs/${runId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: progressNotes || undefined }),
      });

      if (response.ok) {
        await fetchRunDetails();
        setProgressNotes("");
      } else {
        // For demo, simulate the action
        setSewingRun(prev =>
          prev
            ? {
                ...prev,
                status:
                  action === "complete"
                    ? "DONE"
                    : action === "start" || action === "resume"
                      ? "IN_PROGRESS"
                      : "IN_PROGRESS",
                ended_at:
                  action === "complete"
                    ? new Date().toISOString()
                    : prev.ended_at,
                actual_minutes:
                  action === "complete"
                    ? (prev.actual_minutes || 0) + 5
                    : prev.actual_minutes,
              }
            : null
        );

        const newEntry: TimeEntry = {
          id: Date.now().toString(),
          action: action.toUpperCase() as any,
          timestamp: new Date().toISOString(),
          notes: progressNotes || undefined,
        };
        setTimeEntries(prev => [...prev, newEntry]);
        setProgressNotes("");
      }
    } catch (error) {
      console.error(`Failed to ${action} run:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      const response = await fetch(`/api/sewing/runs/${runId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qty_good: parseInt(goodQty),
          notes: progressNotes,
        }),
      });

      if (response.ok) {
        await fetchRunDetails();
        setProgressNotes("");
      } else {
        // For demo, update locally
        setSewingRun(prev =>
          prev
            ? {
                ...prev,
                qty_good: parseInt(goodQty),
                earned_minutes: parseInt(goodQty) * 1.5, // SMV of 1.5 minutes
                piece_rate_pay: parseInt(goodQty) * 2.25,
                efficiency_pct: Math.round(
                  ((parseInt(goodQty) * 1.5) / (prev.actual_minutes || 25)) *
                    100
                ),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handleRejectSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("qty", rejectQty);
      formData.append("reason", rejectReason);
      if (rejectPhoto) {
        formData.append("photo", rejectPhoto);
      }

      const response = await fetch(`/api/sewing/runs/${runId}/rejects`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchRunDetails();
        setRejectQty("");
        setRejectReason("");
        setRejectPhoto(null);
      } else {
        // For demo, add locally
        const newReject: QualityReject = {
          id: Date.now().toString(),
          qty: parseInt(rejectQty),
          reason: rejectReason,
          created_at: new Date().toISOString(),
        };
        setQualityRejects(prev => [...prev, newReject]);

        setSewingRun(prev =>
          prev
            ? {
                ...prev,
                qty_reject: prev.qty_reject + parseInt(rejectQty),
              }
            : null
        );

        setRejectQty("");
        setRejectReason("");
        setRejectPhoto(null);
      }
    } catch (error) {
      console.error("Failed to submit reject:", error);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toUpperCase()) {
      case "CREATED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800";
      case "DONE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEfficiencyColor = (efficiency?: number) => {
    if (!efficiency) return "text-gray-500";
    if (efficiency >= 95) return "text-green-600";
    if (efficiency >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getTimeWorked = () => {
    if (!sewingRun?.started_at) return 0;
    const startTime = new Date(sewingRun.started_at);
    const endTime = sewingRun.ended_at
      ? new Date(sewingRun.ended_at)
      : new Date();
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  };

  const getCompletionPercentage = () => {
    if (!sewingRun) return 0;
    return Math.round((sewingRun.qty_good / sewingRun.bundle.qty) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p>Loading run details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sewingRun) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <XCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Sewing run not found</p>
              <Link href="/sewing">
                <Button className="mt-2" variant="outline">
                  Back to Sewing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sewing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sewing
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Run #{sewingRun.id}</h1>
            <p className="text-muted-foreground">
              {sewingRun.operation_name} • {sewingRun.order.order_number}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(sewingRun.status)}>
          {sewingRun.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCompletionPercentage()}%
            </div>
            <p className="text-xs text-muted-foreground">
              {sewingRun.qty_good} of {sewingRun.bundle.qty} pieces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getEfficiencyColor(sewingRun.efficiency_pct)}`}
            >
              {sewingRun.efficiency_pct || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Current performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Worked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sewingRun.actual_minutes || getTimeWorked()}m
            </div>
            <p className="text-xs text-muted-foreground">
              Est: {sewingRun.earned_minutes || 0}m
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{sewingRun.piece_rate_pay?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Current earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejects</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {sewingRun.qty_reject}
            </div>
            <p className="text-xs text-muted-foreground">
              {((sewingRun.qty_reject / sewingRun.bundle.qty) * 100).toFixed(1)}
              % rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {sewingRun.status === "CREATED" && (
              <Button
                onClick={() => handleRunAction("start")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Run
              </Button>
            )}

            {sewingRun.status === "IN_PROGRESS" && (
              <>
                <Button
                  onClick={() => handleRunAction("pause")}
                  disabled={actionLoading}
                  variant="outline"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button
                  onClick={() => handleRunAction("complete")}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              </>
            )}

            <Button variant="outline" onClick={fetchRunDetails}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="ashley-ai">Ashley AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Order & Bundle Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order & Bundle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Order Number
                    </p>
                    <p className="font-medium">
                      {sewingRun.order.order_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Brand
                    </p>
                    <p className="font-medium">{sewingRun.order.brand.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Product
                    </p>
                    <p className="font-medium">
                      {sewingRun.order.line_items[0]?.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Bundle Size
                    </p>
                    <p className="font-medium">{sewingRun.bundle.size_code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Quantity
                    </p>
                    <p className="font-medium">{sewingRun.bundle.qty} pieces</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      QR Code
                    </p>
                    <p className="font-mono text-sm">
                      {sewingRun.bundle.qr_code}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operator & Operation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Operation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Operator
                    </p>
                    <p className="font-medium">
                      {sewingRun.operator.first_name}{" "}
                      {sewingRun.operator.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sewingRun.operator.employee_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Operation
                    </p>
                    <p className="font-medium">{sewingRun.operation_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Routing Step
                    </p>
                    <p className="font-medium">
                      {sewingRun.routing_step.step_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Started At
                    </p>
                    <p className="font-medium">
                      {sewingRun.started_at
                        ? new Date(sewingRun.started_at).toLocaleString()
                        : "Not started"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Progress</CardTitle>
              <CardDescription>
                Update the number of completed pieces and add notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="good_qty">Completed Pieces</Label>
                  <Input
                    id="good_qty"
                    type="number"
                    min="0"
                    max={sewingRun.bundle.qty}
                    value={goodQty}
                    onChange={e => setGoodQty(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Current: {sewingRun.qty_good} / {sewingRun.bundle.qty}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={progressNotes}
                    onChange={e => setProgressNotes(e.target.value)}
                    placeholder="Add any notes about progress..."
                    className="h-20 resize-none"
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateProgress}
                disabled={
                  !goodQty ||
                  parseInt(goodQty) < 0 ||
                  parseInt(goodQty) > sewingRun.bundle.qty
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Update Progress
              </Button>
            </CardContent>
          </Card>

          {/* Progress Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Progress</span>
                    <span>{getCompletionPercentage()}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div
                      className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-green-50 p-3">
                    <p className="text-2xl font-bold text-green-600">
                      {sewingRun.qty_good}
                    </p>
                    <p className="text-sm text-green-700">Completed</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-2xl font-bold text-red-600">
                      {sewingRun.qty_reject}
                    </p>
                    <p className="text-sm text-red-700">Rejected</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-2xl font-bold text-gray-600">
                      {sewingRun.bundle.qty -
                        sewingRun.qty_good -
                        sewingRun.qty_reject}
                    </p>
                    <p className="text-sm text-gray-700">Remaining</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Quality Issue</CardTitle>
              <CardDescription>
                Record rejected pieces with reason and optional photo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reject_qty">Quantity to Reject</Label>
                  <Input
                    id="reject_qty"
                    type="number"
                    min="1"
                    max={
                      sewingRun.bundle.qty -
                      sewingRun.qty_good -
                      sewingRun.qty_reject
                    }
                    value={rejectQty}
                    onChange={e => setRejectQty(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reject_reason">Reject Reason</Label>
                  <Input
                    id="reject_reason"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g., Uneven stitching, misaligned seam"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reject_photo">Photo Evidence (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reject_photo"
                    type="file"
                    accept="image/*"
                    onChange={e => setRejectPhoto(e.target.files?.[0] || null)}
                  />
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleRejectSubmit}
                disabled={!rejectQty || !rejectReason}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Submit Reject Report
              </Button>
            </CardContent>
          </Card>

          {/* Quality History */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Issues</CardTitle>
              <CardDescription>
                History of rejected pieces for this run
              </CardDescription>
            </CardHeader>
            <CardContent>
              {qualityRejects.length > 0 ? (
                <div className="space-y-3">
                  {qualityRejects.map(reject => (
                    <div
                      key={reject.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{reject.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reject.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">{reject.qty} pieces</Badge>
                        {reject.photo_url && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Photo attached
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  No quality issues reported for this run
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>
                Complete timeline of this sewing run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        entry.action === "START" || entry.action === "RESUME"
                          ? "bg-green-100"
                          : entry.action === "PAUSE"
                            ? "bg-yellow-100"
                            : entry.action === "COMPLETE"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                      }`}
                    >
                      {entry.action === "START" || entry.action === "RESUME" ? (
                        <Play className="h-4 w-4 text-green-600" />
                      ) : entry.action === "PAUSE" ? (
                        <Pause className="h-4 w-4 text-yellow-600" />
                      ) : entry.action === "COMPLETE" ? (
                        <Square className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {entry.action?.toLowerCase()?.replace("_", " ") ||
                          "Unknown Action"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.notes && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ashley-ai" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <CardTitle>Performance Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-green-50 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">
                        On Track Performance
                      </p>
                      <p className="text-sm text-green-700">
                        Current efficiency of {sewingRun.efficiency_pct}% is
                        above target. Maintain current pace to complete on time.
                      </p>
                    </div>
                  </div>
                </div>

                {sewingRun.qty_reject > 0 && (
                  <div className="rounded-lg border bg-yellow-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">
                          Quality Alert
                        </p>
                        <p className="text-sm text-yellow-700">
                          {sewingRun.qty_reject} rejected pieces detected.
                          Consider reviewing technique for "Join shoulders"
                          operation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border bg-blue-50 p-3">
                  <div className="flex items-start gap-2">
                    <Timer className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Time Optimization
                      </p>
                      <p className="text-sm text-blue-700">
                        Working {getTimeWorked()} minutes so far. Projected
                        completion in{" "}
                        {Math.round(
                          (sewingRun.bundle.qty - sewingRun.qty_good) * 1.5
                        )}{" "}
                        minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Smart Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Quality Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on reject patterns, focus on consistent seam
                    alignment. Consider using guide markers for better accuracy.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Efficiency Tips</h4>
                  <p className="text-sm text-muted-foreground">
                    Current rhythm is good. Take a 5-minute break every 45
                    minutes to maintain this efficiency level.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Next Operation</h4>
                  <p className="text-sm text-muted-foreground">
                    After completing "Join shoulders", the bundle will be ready
                    for "Attach collar" operation. Estimated queue time: 15
                    minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
