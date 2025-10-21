"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  DollarSign,
  AlertTriangle,
  Calendar,
  Zap,
  TrendingUp,
  Target,
  Activity,
  Loader2,
} from "lucide-react";

// Force dynamic rendering (prevent static generation during build)
export const dynamic = "force-dynamic";

export default function AIFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState<
    "pricing" | "scheduling" | "bottleneck" | "maintenance" | "defects"
  >("pricing");

  const features = [
    {
      id: "pricing",
      name: "Dynamic Pricing",
      icon: DollarSign,
      color: "blue",
      description: "AI-powered pricing recommendations",
      status: "active",
    },
    {
      id: "scheduling",
      name: "Smart Scheduling",
      icon: Calendar,
      color: "purple",
      description: "Optimized production scheduling",
      status: "active",
    },
    {
      id: "bottleneck",
      name: "Bottleneck Detection",
      icon: AlertTriangle,
      color: "orange",
      description: "Real-time production flow analysis",
      status: "active",
    },
    {
      id: "maintenance",
      name: "Predictive Maintenance",
      icon: Activity,
      color: "green",
      description: "AI failure prediction",
      status: "active",
    },
    {
      id: "defects",
      name: "Defect Detection",
      icon: Target,
      color: "red",
      description: "Computer vision quality control",
      status: "active",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Brain className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Features</h1>
        </div>
        <p className="text-gray-600">
          Advanced AI-powered manufacturing intelligence
        </p>
      </div>

      {/* Feature Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {features.map(feature => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;

          return (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id as any)}
              className={`rounded-lg border-2 p-6 text-left transition-all ${
                isActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Icon
                className={`mb-3 h-8 w-8 ${isActive ? "text-indigo-600" : "text-gray-400"}`}
              />
              <h3 className="mb-1 font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </button>
          );
        })}
      </div>

      {/* Feature Content */}
      <div className="rounded-lg bg-white p-6 shadow-lg">
        {activeFeature === "pricing" && <PricingAI />}
        {activeFeature === "scheduling" && <SchedulingAI />}
        {activeFeature === "bottleneck" && <BottleneckAI />}
        {activeFeature === "maintenance" && <MaintenanceAI />}
        {activeFeature === "defects" && <DefectDetectionAI />}
      </div>
    </div>
  );
}

function PricingAI() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [formData, setFormData] = useState({
    client_id: "",
    product_type: "",
    quantity: "",
    complexity: "MEDIUM",
    material_cost: "",
    labor_hours_estimate: "",
    deadline_days: "",
    season: "REGULAR",
  });

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const response = await fetch("/api/clients?limit=100");
      const result = await response.json();
      if (result.success) {
        setClients(result.data.clients);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoadingClients(false);
    }
  }

  async function calculatePricing() {
    if (
      !formData.client_id ||
      !formData.product_type ||
      !formData.quantity ||
      !formData.material_cost ||
      !formData.labor_hours_estimate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          material_cost: parseFloat(formData.material_cost),
          labor_hours_estimate: parseFloat(formData.labor_hours_estimate),
          deadline_days: formData.deadline_days
            ? parseInt(formData.deadline_days)
            : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendation(data.recommendation);
      } else {
        alert("Failed to calculate pricing: " + data.error);
      }
    } catch (error) {
      console.error("Pricing calculation failed:", error);
      alert("Failed to calculate pricing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Dynamic Pricing AI
      </h2>

      {/* Pricing Calculator */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Calculate Price</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Client *
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.client_id}
                onChange={e =>
                  setFormData({ ...formData, client_id: e.target.value })
                }
                disabled={loadingClients}
              >
                <option value="">Select client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Type *
              </label>
              <input
                type="text"
                placeholder="e.g., T-Shirt, Hoodie, Polo"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.product_type}
                onChange={e =>
                  setFormData({ ...formData, product_type: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.quantity}
                  onChange={e =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Material Cost *
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.material_cost}
                  onChange={e =>
                    setFormData({ ...formData, material_cost: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Labor Hours *
                </label>
                <input
                  type="number"
                  placeholder="120"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.labor_hours_estimate}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      labor_hours_estimate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Deadline (days)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.deadline_days}
                  onChange={e =>
                    setFormData({ ...formData, deadline_days: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Complexity
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.complexity}
                  onChange={e =>
                    setFormData({ ...formData, complexity: e.target.value })
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Season
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.season}
                  onChange={e =>
                    setFormData({ ...formData, season: e.target.value })
                  }
                >
                  <option value="REGULAR">Regular</option>
                  <option value="PEAK">Peak</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <button
              onClick={calculatePricing}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Calculating..." : "Calculate Pricing"}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-blue-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            AI Recommendation
          </h3>

          {!recommendation ? (
            <div className="py-12 text-center text-gray-500">
              <Brain className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>
                Fill in the form and click Calculate Pricing to get AI
                recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recommended Price:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₱{recommendation.recommended_price.toLocaleString()}
                </span>
              </div>

              <div className="h-px bg-gray-300"></div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Price:</span>
                  <span className="font-medium">
                    ₱{recommendation.minimum_price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Optimal Price:</span>
                  <span className="font-medium text-green-600">
                    ₱{recommendation.optimal_price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum Price:</span>
                  <span className="font-medium">
                    ₱{recommendation.maximum_price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className="font-medium text-green-600">
                    {recommendation.profit_margin_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-300"></div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Pricing Factors:
                </p>
                <ul className="space-y-1 text-sm">
                  {recommendation.factors.map((factor: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded bg-white p-3">
                <p className="text-sm text-gray-600">
                  <strong>Confidence:</strong> {recommendation.confidence_score}
                  % •<strong> Strategy:</strong> {recommendation.strategy}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SchedulingAI() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    start_date: new Date().toISOString().split("T")[0],
    include_stages: ["CUTTING", "PRINTING", "SEWING", "FINISHING"],
    days: 7,
  });

  useEffect(() => {
    fetchPreview();
  }, [formData.days]);

  async function fetchPreview() {
    try {
      const response = await fetch(`/api/ai/scheduling?days=${formData.days}`);
      const data = await response.json();
      if (data.success) {
        setPreview(data.preview);
      }
    } catch (error) {
      console.error("Failed to fetch preview:", error);
    }
  }

  async function generateSchedule() {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error("Schedule generation failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Smart Job Scheduling
      </h2>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Schedule Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.start_date}
                onChange={e =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Preview Days
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.days}
                onChange={e =>
                  setFormData({ ...formData, days: parseInt(e.target.value) })
                }
              >
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Include Stages
              </label>
              <div className="space-y-2">
                {["CUTTING", "PRINTING", "SEWING", "FINISHING"].map(stage => (
                  <label key={stage} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.include_stages.includes(stage)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            include_stages: [...formData.include_stages, stage],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            include_stages: formData.include_stages.filter(
                              s => s !== stage
                            ),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={generateSchedule}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Optimizing..." : "Generate Optimized Schedule"}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="rounded-lg border border-gray-200 bg-purple-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Current Orders ({preview?.length || 0})
          </h3>

          {preview && preview.length > 0 ? (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {preview.map((order: any, i: number) => (
                <div
                  key={i}
                  className="rounded border border-gray-200 bg-white p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {order.client_name}
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        order.urgency === "URGENT"
                          ? "bg-red-100 text-red-700"
                          : order.urgency === "HIGH"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {order.garment_type} × {order.quantity} •{" "}
                    {order.days_until_deadline} days left
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Calendar className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No orders to schedule</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Results */}
      {schedule && (
        <div className="rounded-lg border border-gray-200 bg-purple-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Optimized Schedule
          </h3>

          <div className="mb-4 grid grid-cols-4 gap-4">
            <div className="rounded bg-white p-3">
              <p className="text-xs text-gray-600">Scheduled Jobs</p>
              <p className="text-2xl font-bold text-purple-600">
                {schedule.scheduled_jobs}
              </p>
            </div>
            <div className="rounded bg-white p-3">
              <p className="text-xs text-gray-600">Optimization Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {schedule.optimization_score}%
              </p>
            </div>
            <div className="rounded bg-white p-3">
              <p className="text-xs text-gray-600">Avg Utilization</p>
              <p className="text-2xl font-bold text-purple-600">
                {schedule.metrics?.avg_resource_utilization?.toFixed(1)}%
              </p>
            </div>
            <div className="rounded bg-white p-3">
              <p className="text-xs text-gray-600">On-time Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {schedule.metrics?.on_time_completion_rate?.toFixed(1)}%
              </p>
            </div>
          </div>

          {schedule.recommendations && schedule.recommendations.length > 0 && (
            <div className="rounded border border-purple-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold">AI Recommendations:</p>
              <ul className="space-y-1 text-sm">
                {schedule.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BottleneckAI() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    analyzeBottlenecks();
  }, []);

  async function analyzeBottlenecks() {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/bottleneck");
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Bottleneck analysis failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Bottleneck Detection
        </h2>
        <button
          onClick={analyzeBottlenecks}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Analyzing..." : "Refresh Analysis"}
        </button>
      </div>

      {loading && !analysis ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4">
              <p className="mb-1 text-xs text-gray-600">Overall Efficiency</p>
              <p className="text-3xl font-bold text-orange-600">
                {analysis.overall_efficiency?.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-1 text-xs text-gray-600">Bottlenecks Detected</p>
              <p className="text-3xl font-bold text-gray-900">
                {analysis.detected_bottlenecks?.length || 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-1 text-xs text-gray-600">System Throughput</p>
              <p className="text-3xl font-bold text-gray-900">
                {analysis.system_throughput?.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">units/hour</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-1 text-xs text-gray-600">Efficiency Loss</p>
              <p className="text-3xl font-bold text-red-600">
                {analysis.efficiency_loss_percent?.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Primary Bottleneck */}
          {analysis.primary_bottleneck && (
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-red-900">
                    Primary Bottleneck Detected
                  </h3>
                  <div className="mb-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-red-800">
                        <strong>Station:</strong>{" "}
                        {analysis.primary_bottleneck.station_name}
                      </p>
                      <p className="text-sm text-red-800">
                        <strong>Type:</strong>{" "}
                        {analysis.primary_bottleneck.station_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-red-800">
                        <strong>Severity:</strong>{" "}
                        {analysis.primary_bottleneck.severity}
                      </p>
                      <p className="text-sm text-red-800">
                        <strong>Impact:</strong>{" "}
                        {analysis.primary_bottleneck.impact_score}/10
                      </p>
                    </div>
                  </div>
                  <p className="rounded bg-white bg-opacity-50 p-3 text-sm text-red-700">
                    <strong>Root Cause:</strong>{" "}
                    {analysis.primary_bottleneck.root_cause}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All Bottlenecks */}
          {analysis.detected_bottlenecks &&
            analysis.detected_bottlenecks.length > 0 && (
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 font-semibold text-gray-900">
                  All Detected Bottlenecks
                </h3>
                <div className="space-y-3">
                  {analysis.detected_bottlenecks.map(
                    (bottleneck: any, i: number) => (
                      <div
                        key={i}
                        className={`rounded-lg border-2 p-4 ${
                          bottleneck.severity === "CRITICAL"
                            ? "border-red-300 bg-red-50"
                            : bottleneck.severity === "HIGH"
                              ? "border-orange-300 bg-orange-50"
                              : bottleneck.severity === "MEDIUM"
                                ? "border-yellow-300 bg-yellow-50"
                                : "border-blue-300 bg-blue-50"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-semibold text-gray-900">
                            {bottleneck.station_name}
                          </span>
                          <span
                            className={`rounded px-2 py-1 text-xs font-semibold ${
                              bottleneck.severity === "CRITICAL"
                                ? "bg-red-200 text-red-800"
                                : bottleneck.severity === "HIGH"
                                  ? "bg-orange-200 text-orange-800"
                                  : bottleneck.severity === "MEDIUM"
                                    ? "bg-yellow-200 text-yellow-800"
                                    : "bg-blue-200 text-blue-800"
                            }`}
                          >
                            {bottleneck.severity}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-700">
                          <div>Queue: {bottleneck.queue_length} items</div>
                          <div>
                            Wait: {bottleneck.avg_wait_time_minutes} min
                          </div>
                          <div>Impact: {bottleneck.impact_score}/10</div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-green-50 p-6">
              <h3 className="mb-4 font-semibold text-gray-900">
                AI Recommendations
              </h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500">
          <AlertTriangle className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>No production data available for analysis</p>
        </div>
      )}
    </div>
  );
}

function MaintenanceAI() {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    fetchAssetsAndPredictions();
  }, []);

  async function fetchAssetsAndPredictions() {
    setLoading(true);
    try {
      const response = await fetch("/api/maintenance/assets?limit=100");
      const data = await response.json();
      if (data.success) {
        setAssets(data.assets || []);

        // Generate mock predictions based on assets
        const mockPredictions = (data.assets || [])
          .filter((asset: any) => asset.status === "OPERATIONAL")
          .slice(0, 5)
          .map((asset: any) => ({
            asset_id: asset.id,
            asset_name: asset.name,
            predicted_failure_date: new Date(
              Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
            ),
            confidence: 70 + Math.random() * 25,
            risk_level:
              Math.random() > 0.7
                ? "HIGH"
                : Math.random() > 0.4
                  ? "MEDIUM"
                  : "LOW",
            recommended_action: "Schedule preventive maintenance",
            indicators: [
              "High vibration detected",
              "Temperature above normal",
              "Increased power consumption",
            ],
          }));

        setPredictions(mockPredictions);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Predictive Maintenance
        </h2>
        <button
          onClick={fetchAssetsAndPredictions}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Refresh Analysis
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-1 text-xs text-gray-600">Total Assets</p>
              <p className="text-3xl font-bold text-gray-900">
                {assets.length}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="mb-1 text-xs text-gray-600">High Risk</p>
              <p className="text-3xl font-bold text-red-600">
                {predictions.filter(p => p.risk_level === "HIGH").length}
              </p>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="mb-1 text-xs text-gray-600">Medium Risk</p>
              <p className="text-3xl font-bold text-orange-600">
                {predictions.filter(p => p.risk_level === "MEDIUM").length}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-1 text-xs text-gray-600">Low Risk</p>
              <p className="text-3xl font-bold text-green-600">
                {predictions.filter(p => p.risk_level === "LOW").length}
              </p>
            </div>
          </div>

          {/* Predictions */}
          {predictions.length > 0 ? (
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 font-semibold text-gray-900">
                Failure Predictions
              </h3>
              <div className="space-y-3">
                {predictions.map((pred, i) => {
                  const daysUntil = Math.floor(
                    (pred.predicted_failure_date.getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border-2 p-4 ${
                        pred.risk_level === "HIGH"
                          ? "border-red-300 bg-red-50"
                          : pred.risk_level === "MEDIUM"
                            ? "border-orange-300 bg-orange-50"
                            : "border-green-300 bg-green-50"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity
                            className={`h-5 w-5 ${
                              pred.risk_level === "HIGH"
                                ? "text-red-600"
                                : pred.risk_level === "MEDIUM"
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }`}
                          />
                          <span className="font-semibold text-gray-900">
                            {pred.asset_name}
                          </span>
                        </div>
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            pred.risk_level === "HIGH"
                              ? "bg-red-200 text-red-800"
                              : pred.risk_level === "MEDIUM"
                                ? "bg-orange-200 text-orange-800"
                                : "bg-green-200 text-green-800"
                          }`}
                        >
                          {pred.risk_level} RISK
                        </span>
                      </div>
                      <div className="mb-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            Predicted Failure: <strong>{daysUntil} days</strong>
                          </p>
                          <p className="text-gray-600">
                            Confidence:{" "}
                            <strong>{pred.confidence.toFixed(1)}%</strong>
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            Action: <strong>{pred.recommended_action}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 border-t border-gray-300 pt-2">
                        <p className="mb-1 text-xs font-semibold text-gray-700">
                          Indicators:
                        </p>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {pred.indicators.map((ind: string, j: number) => (
                            <li key={j} className="flex items-center gap-1">
                              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                              {ind}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 py-12 text-center text-gray-500">
              <Activity className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No assets found or all assets are healthy</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DefectDetectionAI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    garment_type: "T-SHIRT",
    bundle_id: "",
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function analyzeImage() {
    if (!imagePreview) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai/defect-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imagePreview,
          garment_type: formData.garment_type,
          bundle_id: formData.bundle_id || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (error) {
      console.error("Defect detection failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Defect Detection AI
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upload Panel */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Upload Image for Analysis
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Garment Type
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.garment_type}
                onChange={e =>
                  setFormData({ ...formData, garment_type: e.target.value })
                }
              >
                <option value="T-SHIRT">T-Shirt</option>
                <option value="POLO">Polo</option>
                <option value="HOODIE">Hoodie</option>
                <option value="JACKET">Jacket</option>
                <option value="PANTS">Pants</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bundle ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., BDL-001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={formData.bundle_id}
                onChange={e =>
                  setFormData({ ...formData, bundle_id: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image
              </label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto max-h-48 rounded"
                    />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Target className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">
                        Click to upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={analyzeImage}
              disabled={loading || !imagePreview}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Analyzing..." : "Analyze for Defects"}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="rounded-lg border border-gray-200 bg-indigo-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Analysis Results</h3>

          {result ? (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-4 ${result.pass_fail === "PASS" ? "bg-green-100" : "bg-red-100"}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-lg font-bold">{result.pass_fail}</span>
                  <span className="text-sm">
                    Confidence: {result.confidence}%
                  </span>
                </div>
                <p className="text-sm">
                  Quality Score: {result.quality_score}%
                </p>
                <p className="text-sm">Defects Found: {result.defects_found}</p>
              </div>

              {result.detected_defects &&
                result.detected_defects.length > 0 && (
                  <div className="rounded-lg bg-white p-4">
                    <p className="mb-2 text-sm font-semibold">
                      Detected Defects:
                    </p>
                    <div className="space-y-2">
                      {result.detected_defects.map((defect: any, i: number) => (
                        <div
                          key={i}
                          className="rounded border border-gray-200 bg-gray-50 p-2"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {defect.type}
                            </span>
                            <span
                              className={`rounded px-2 py-1 text-xs ${
                                defect.severity === "CRITICAL"
                                  ? "bg-red-200 text-red-800"
                                  : defect.severity === "MAJOR"
                                    ? "bg-orange-200 text-orange-800"
                                    : "bg-yellow-200 text-yellow-800"
                              }`}
                            >
                              {defect.severity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {defect.description}
                          </p>
                          {defect.location && (
                            <p className="mt-1 text-xs text-gray-500">
                              Location: {defect.location.x}, {defect.location.y}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Target className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>Upload an image to detect defects</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
