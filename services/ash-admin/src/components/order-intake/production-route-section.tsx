"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Plus,
  Minus,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ProductionStep {
  id: string;
  name: string;
  department: string;
  estimatedHours: number;
  dependencies: string[];
  resources: string[];
  customNotes?: string;
  customDuration?: number;
}

interface ProductionRoute {
  id: string;
  name: string;
  description: string;
  printingMethod: string;
  efficiency: number;
  estimatedDays: number;
  steps: ProductionStep[];
  isRecommended?: boolean;
  isCustom?: boolean;
}

interface AshleyOptimization {
  recommendedRoute: string;
  efficiencyGain: number;
  timeSaving: number;
  costSaving: number;
  confidence: number;
  reasoning: string[];
  warnings: string[];
}

interface ProductionRouteSectionProps {
  printingMethod: string;
  totalQuantity: number;
  deliveryDate: string;
  selectedRoute: string;
  onRouteChange: (routeId: string) => void;
  onRouteOptimized: (optimization: AshleyOptimization) => void;
}

const PRODUCTION_ROUTES: ProductionRoute[] = [
  {
    id: "silkscreen_standard",
    name: "Standard Silkscreen Route",
    description: "Traditional silkscreen production flow",
    printingMethod: "silkscreen",
    efficiency: 75,
    estimatedDays: 7,
    steps: [
      {
        id: "design_prep",
        name: "Design Preparation",
        department: "Pre-Production",
        estimatedHours: 2,
        dependencies: [],
        resources: ["Design Software", "Designer"],
      },
      {
        id: "screen_making",
        name: "Screen Making",
        department: "Pre-Production",
        estimatedHours: 4,
        dependencies: ["design_prep"],
        resources: ["Screen Room", "Screen Maker"],
      },
      {
        id: "ink_mixing",
        name: "Ink Mixing",
        department: "Production",
        estimatedHours: 1,
        dependencies: ["design_prep"],
        resources: ["Ink Station", "Color Matcher"],
      },
      {
        id: "printing",
        name: "Screen Printing",
        department: "Production",
        estimatedHours: 8,
        dependencies: ["screen_making", "ink_mixing"],
        resources: ["Print Station", "Printer Operator"],
      },
      {
        id: "curing",
        name: "Curing/Drying",
        department: "Production",
        estimatedHours: 2,
        dependencies: ["printing"],
        resources: ["Conveyor Dryer", "Machine Operator"],
      },
      {
        id: "qc_folding",
        name: "Quality Check & Folding",
        department: "Quality Control",
        estimatedHours: 4,
        dependencies: ["curing"],
        resources: ["QC Station", "QC Inspector"],
      },
      {
        id: "packaging",
        name: "Packaging",
        department: "Finishing",
        estimatedHours: 2,
        dependencies: ["qc_folding"],
        resources: ["Pack Station", "Packer"],
      },
    ],
  },
  {
    id: "silkscreen_express",
    name: "Express Silkscreen Route",
    description: "Optimized for faster turnaround",
    printingMethod: "silkscreen",
    efficiency: 85,
    estimatedDays: 5,
    isRecommended: true,
    steps: [
      {
        id: "design_prep_express",
        name: "Express Design Prep",
        department: "Pre-Production",
        estimatedHours: 1.5,
        dependencies: [],
        resources: ["Design Software", "Senior Designer"],
      },
      {
        id: "parallel_screen_ink",
        name: "Parallel Screen & Ink Prep",
        department: "Pre-Production",
        estimatedHours: 3,
        dependencies: ["design_prep_express"],
        resources: ["Screen Room", "Ink Station", "Multi-tasker"],
      },
      {
        id: "express_printing",
        name: "Express Printing",
        department: "Production",
        estimatedHours: 6,
        dependencies: ["parallel_screen_ink"],
        resources: ["Express Print Station", "Lead Printer"],
      },
      {
        id: "flash_cure",
        name: "Flash Curing",
        department: "Production",
        estimatedHours: 1,
        dependencies: ["express_printing"],
        resources: ["Flash Dryer", "Machine Operator"],
      },
      {
        id: "inline_qc_pack",
        name: "Inline QC & Pack",
        department: "Quality Control",
        estimatedHours: 3,
        dependencies: ["flash_cure"],
        resources: ["QC Station", "Pack Station", "QC Inspector"],
      },
    ],
  },
  {
    id: "dtf_standard",
    name: "Standard DTF Route",
    description: "Direct to Film production flow",
    printingMethod: "dtf",
    efficiency: 90,
    estimatedDays: 4,
    steps: [
      {
        id: "design_rip",
        name: "Design RIP Processing",
        department: "Pre-Production",
        estimatedHours: 1,
        dependencies: [],
        resources: ["RIP Software", "Designer"],
      },
      {
        id: "film_printing",
        name: "Film Printing",
        department: "Production",
        estimatedHours: 2,
        dependencies: ["design_rip"],
        resources: ["DTF Printer", "Printer Operator"],
      },
      {
        id: "powder_application",
        name: "Powder Application",
        department: "Production",
        estimatedHours: 1,
        dependencies: ["film_printing"],
        resources: ["Powder Station", "Operator"],
      },
      {
        id: "curing_film",
        name: "Film Curing",
        department: "Production",
        estimatedHours: 0.5,
        dependencies: ["powder_application"],
        resources: ["Curing Oven", "Machine Operator"],
      },
      {
        id: "heat_pressing",
        name: "Heat Pressing",
        department: "Production",
        estimatedHours: 4,
        dependencies: ["curing_film"],
        resources: ["Heat Press", "Press Operator"],
      },
      {
        id: "finishing_dtf",
        name: "Finishing & QC",
        department: "Quality Control",
        estimatedHours: 2,
        dependencies: ["heat_pressing"],
        resources: ["QC Station", "QC Inspector"],
      },
    ],
  },
  {
    id: "embroidery_standard",
    name: "Standard Embroidery Route",
    description: "Traditional embroidery production flow",
    printingMethod: "embroidery",
    efficiency: 80,
    estimatedDays: 6,
    isRecommended: true,
    steps: [
      {
        id: "design_digitizing",
        name: "Design Digitizing",
        department: "Pre-Production",
        estimatedHours: 3,
        dependencies: [],
        resources: ["Digitizing Software", "Digitizer"],
      },
      {
        id: "sample_embroidery",
        name: "Sample Embroidery",
        department: "Pre-Production",
        estimatedHours: 1,
        dependencies: ["design_digitizing"],
        resources: ["Embroidery Machine", "Sample Operator"],
      },
      {
        id: "thread_preparation",
        name: "Thread Preparation",
        department: "Production",
        estimatedHours: 0.5,
        dependencies: ["sample_embroidery"],
        resources: ["Thread Stock", "Operator"],
      },
      {
        id: "embroidery_production",
        name: "Embroidery Production",
        department: "Production",
        estimatedHours: 12,
        dependencies: ["thread_preparation"],
        resources: ["Embroidery Machine", "Machine Operator"],
      },
      {
        id: "trimming",
        name: "Thread Trimming",
        department: "Production",
        estimatedHours: 4,
        dependencies: ["embroidery_production"],
        resources: ["Trimming Station", "Trimmer"],
      },
      {
        id: "qc_finishing_embroidery",
        name: "Quality Check & Finishing",
        department: "Quality Control",
        estimatedHours: 3,
        dependencies: ["trimming"],
        resources: ["QC Station", "QC Inspector"],
      },
      {
        id: "packaging_embroidery",
        name: "Packaging",
        department: "Finishing",
        estimatedHours: 2,
        dependencies: ["qc_finishing_embroidery"],
        resources: ["Pack Station", "Packer"],
      },
    ],
  },
  {
    id: "sublimation_standard",
    name: "Standard Sublimation Route",
    description: "Dye sublimation printing flow",
    printingMethod: "sublimation",
    efficiency: 88,
    estimatedDays: 5,
    isRecommended: true,
    steps: [
      {
        id: "design_prep_sub",
        name: "Design Preparation",
        department: "Pre-Production",
        estimatedHours: 1.5,
        dependencies: [],
        resources: ["Design Software", "Designer"],
      },
      {
        id: "sublimation_printing",
        name: "Sublimation Printing",
        department: "Production",
        estimatedHours: 3,
        dependencies: ["design_prep_sub"],
        resources: ["Sublimation Printer", "Printer Operator"],
      },
      {
        id: "heat_transfer",
        name: "Heat Transfer",
        department: "Production",
        estimatedHours: 6,
        dependencies: ["sublimation_printing"],
        resources: ["Heat Press", "Press Operator"],
      },
      {
        id: "cooling",
        name: "Cooling & Inspection",
        department: "Production",
        estimatedHours: 2,
        dependencies: ["heat_transfer"],
        resources: ["Cooling Station", "Operator"],
      },
      {
        id: "qc_finishing_sub",
        name: "Quality Check & Finishing",
        department: "Quality Control",
        estimatedHours: 3,
        dependencies: ["cooling"],
        resources: ["QC Station", "QC Inspector"],
      },
      {
        id: "packaging_sub",
        name: "Packaging",
        department: "Finishing",
        estimatedHours: 2,
        dependencies: ["qc_finishing_sub"],
        resources: ["Pack Station", "Packer"],
      },
    ],
  },
  {
    id: "rubberized_standard",
    name: "Standard Rubberized Route",
    description: "Rubberized print production flow",
    printingMethod: "rubberized",
    efficiency: 82,
    estimatedDays: 6,
    isRecommended: true,
    steps: [
      {
        id: "design_prep_rubber",
        name: "Design Preparation",
        department: "Pre-Production",
        estimatedHours: 2,
        dependencies: [],
        resources: ["Design Software", "Designer"],
      },
      {
        id: "rubber_mixing",
        name: "Rubber Ink Mixing",
        department: "Production",
        estimatedHours: 1,
        dependencies: ["design_prep_rubber"],
        resources: ["Mixing Station", "Color Matcher"],
      },
      {
        id: "rubber_printing",
        name: "Rubberized Printing",
        department: "Production",
        estimatedHours: 8,
        dependencies: ["rubber_mixing"],
        resources: ["Print Station", "Printer Operator"],
      },
      {
        id: "curing_rubber",
        name: "Curing",
        department: "Production",
        estimatedHours: 3,
        dependencies: ["rubber_printing"],
        resources: ["Curing Oven", "Machine Operator"],
      },
      {
        id: "qc_finishing_rubber",
        name: "Quality Check & Finishing",
        department: "Quality Control",
        estimatedHours: 3,
        dependencies: ["curing_rubber"],
        resources: ["QC Station", "QC Inspector"],
      },
      {
        id: "packaging_rubber",
        name: "Packaging",
        department: "Finishing",
        estimatedHours: 2,
        dependencies: ["qc_finishing_rubber"],
        resources: ["Pack Station", "Packer"],
      },
    ],
  },
];

export function ProductionRouteSection({
  printingMethod,
  totalQuantity,
  deliveryDate,
  selectedRoute,
  onRouteChange,
  onRouteOptimized,
}: ProductionRouteSectionProps) {
  const [optimizing, setOptimizing] = useState(false);
  const [ashleyOptimization, setAshleyOptimization] =
    useState<AshleyOptimization | null>(null);
  const [customSteps, setCustomSteps] = useState<ProductionStep[]>([]);
  const [routeVisualization, setRouteVisualization] = useState<boolean>(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    if (printingMethod && totalQuantity > 0) {
      // Auto-select recommended route when printing method changes
      const recommendedRoute = getAvailableRoutes().find(r => r.isRecommended);
      if (recommendedRoute && !selectedRoute) {
        onRouteChange(recommendedRoute.id);
      }
    }
  }, [printingMethod]);

  const getAvailableRoutes = (): ProductionRoute[] => {
    return PRODUCTION_ROUTES.filter(
      route =>
        route.printingMethod === printingMethod ||
        route.printingMethod === "any"
    );
  };

  const getCurrentRoute = (): ProductionRoute | null => {
    return PRODUCTION_ROUTES.find(route => route.id === selectedRoute) || null;
  };

  const optimizeWithAshley = async () => {
    if (!printingMethod || totalQuantity === 0) {
      toast.error("Please select printing method and quantity first");
      return;
    }

    setOptimizing(true);
    try {
      // Simulate Ashley AI route optimization
      await new Promise(resolve => setTimeout(resolve, 4000));

      const availableRoutes = getAvailableRoutes();
      const currentRoute = getCurrentRoute();

      const optimization: AshleyOptimization = {
        recommendedRoute:
          availableRoutes.find(r => r.isRecommended)?.id ||
          availableRoutes[0]?.id ||
          "",
        efficiencyGain: Math.floor(Math.random() * 15) + 5, // 5-20%
        timeSaving: Math.floor(Math.random() * 2) + 1, // 1-3 days
        costSaving: Math.floor(Math.random() * 8000) + 2000, // ₱2000-10000
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
        reasoning: [
          "Current route has optimal efficiency for quantity and timeline",
          "Parallel processing can reduce lead time by 1-2 days",
          "Express route recommended for rush delivery requirements",
          "Resource allocation optimized for peak efficiency",
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        warnings:
          Math.random() > 0.7
            ? [
                "Express route requires premium resource allocation",
                "Quality checks may need additional attention in fast route",
              ]
            : [],
      };

      setAshleyOptimization(optimization);
      onRouteOptimized(optimization);

      toast.success("Ashley AI route optimization completed");
    } catch (error) {
      console.error("Route optimization error:", error);
      toast.error("Ashley AI optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  const applyOptimizedRoute = () => {
    if (ashleyOptimization?.recommendedRoute) {
      onRouteChange(ashleyOptimization.recommendedRoute);
      toast.success("Applied optimized production route");
    }
  };

  const calculateTotalEstimatedHours = (route: ProductionRoute): number => {
    return route.steps.reduce((total, step) => total + step.estimatedHours, 0);
  };

  const getRouteEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 85) return "text-green-600";
    if (efficiency >= 75) return "text-blue-600";
    return "text-amber-600";
  };

  const addCustomStep = () => {
    const newStep: ProductionStep = {
      id: `custom_${Date.now()}`,
      name: "New Custom Step",
      department: "Custom",
      estimatedHours: 1,
      dependencies: [],
      resources: [],
      customNotes: "",
      customDuration: undefined,
    };
    setCustomSteps([...customSteps, newStep]);
    toast.success("Custom step added");
  };

  const removeCustomStep = (stepId: string) => {
    setCustomSteps(customSteps.filter(s => s.id !== stepId));
    toast.success("Custom step removed");
  };

  const toggleStepCustomization = (
    stepId: string,
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.stopPropagation();
    }
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const updateCustomStep = (
    stepId: string,
    field: keyof ProductionStep,
    value: any
  ) => {
    setCustomSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

  const availableRoutes = getAvailableRoutes();
  const currentRoute = getCurrentRoute();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          G. Production Route
          <Badge variant="secondary">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Route Selection */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">
                Select Production Route *
              </label>
              <p className="text-sm text-muted-foreground">
                Choose the optimal production flow for your order
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRouteVisualization(!routeVisualization)}
            >
              {routeVisualization ? "Hide" : "Show"} Steps
            </Button>
          </div>

          {!printingMethod ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <AlertCircle className="mx-auto mb-2 h-6 w-6 text-amber-600" />
              <p className="font-medium text-amber-900">
                Please select a printing method first
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Production routes will appear once you choose a printing method
                in Section B above.
              </p>
            </div>
          ) : availableRoutes.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <AlertCircle className="mx-auto mb-2 h-6 w-6 text-gray-700" />
              <p className="text-gray-600">
                No production routes available for {printingMethod}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {availableRoutes.map(route => (
                <div
                  key={route.id}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                    selectedRoute === route.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => onRouteChange(route.id)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{route.name}</h4>
                        {route.isRecommended && (
                          <Badge variant="default" className="bg-green-600">
                            Recommended
                          </Badge>
                        )}
                        {route.isCustom && (
                          <Badge variant="outline">Custom</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {route.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-medium ${getRouteEfficiencyColor(route.efficiency)}`}
                      >
                        {route.efficiency}% efficiency
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ~{route.estimatedDays} days
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {calculateTotalEstimatedHours(route)}h total
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {route.steps.length} steps
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {
                        [...new Set(route.steps.map(s => s.department))].length
                      }{" "}
                      departments
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ashley AI Route Optimization */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">
                Ashley AI Route Optimization
              </h4>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={optimizeWithAshley}
              disabled={optimizing || !printingMethod || totalQuantity === 0}
            >
              {optimizing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Optimizing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Optimize Route
                </>
              )}
            </Button>
          </div>

          {ashleyOptimization && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-purple-800">
                  Optimization Results
                </span>
                <Badge
                  variant="outline"
                  className="border-purple-300 text-purple-700"
                >
                  {ashleyOptimization.confidence}% confidence
                </Badge>
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-3">
                <div className="rounded bg-green-100 p-2">
                  <div className="font-medium text-green-700">
                    Efficiency Gain
                  </div>
                  <div className="text-green-800">
                    +{ashleyOptimization.efficiencyGain}%
                  </div>
                </div>
                <div className="rounded bg-blue-100 p-2">
                  <div className="font-medium text-blue-700">Time Saving</div>
                  <div className="text-blue-800">
                    {ashleyOptimization.timeSaving} days
                  </div>
                </div>
                <div className="rounded bg-amber-100 p-2">
                  <div className="font-medium text-amber-700">Cost Saving</div>
                  <div className="text-amber-800">
                    ₱{ashleyOptimization.costSaving.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-purple-900">Reasoning:</h5>
                <ul className="space-y-1">
                  {ashleyOptimization.reasoning.map((reason, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1 text-sm text-purple-800"
                    >
                      <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {ashleyOptimization.warnings.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-amber-900">
                    Considerations:
                  </h5>
                  <ul className="space-y-1">
                    {ashleyOptimization.warnings.map((warning, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1 text-sm text-amber-800"
                      >
                        <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={applyOptimizedRoute}
                size="sm"
                className="w-full"
                disabled={selectedRoute === ashleyOptimization.recommendedRoute}
              >
                <Zap className="mr-2 h-4 w-4" />
                Apply Optimized Route
              </Button>
            </div>
          )}
        </div>

        {/* Route Steps Visualization */}
        {routeVisualization && currentRoute && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4" />
                Production Steps - {currentRoute.name}
              </h4>
              <Button variant="outline" size="sm" onClick={addCustomStep}>
                <Plus className="mr-1 h-4 w-4" />
                Add Custom Step
              </Button>
            </div>

            <div className="space-y-3">
              {currentRoute.steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {index < currentRoute.steps.length - 1 && (
                    <div className="absolute bottom-0 left-4 top-8 w-0.5 bg-gray-300" />
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                      {index + 1}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{step.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {step.department}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {step.estimatedHours}h
                            </div>
                            <div className="text-xs text-muted-foreground">
                              estimated
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={e => toggleStepCustomization(step.id, e)}
                            title="Customize step"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-2 flex flex-wrap gap-1">
                        {step.resources.map((resource, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>

                      {step.dependencies.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Depends on:{" "}
                          {step.dependencies
                            .map(
                              dep =>
                                currentRoute.steps.find(s => s.id === dep)?.name
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}

                      {expandedStep === step.id && (
                        <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <h6 className="flex items-center gap-2 text-sm font-medium">
                              <Settings className="h-4 w-4" />
                              Customize Step
                            </h6>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={e => toggleStepCustomization(step.id, e)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div>
                            <label className="text-xs font-medium">
                              Custom Notes
                            </label>
                            <input
                              type="text"
                              placeholder="Add special instructions for this step"
                              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                              onChange={e => {
                                // Store in temporary state
                                step.customNotes = e.target.value;
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium">
                              Custom Duration (hours)
                            </label>
                            <input
                              type="number"
                              placeholder={`Default: ${step.estimatedHours}h`}
                              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                              onChange={e => {
                                step.customDuration =
                                  parseFloat(e.target.value) || undefined;
                              }}
                            />
                          </div>

                          <div className="rounded bg-white/50 p-2 text-xs text-muted-foreground">
                            💡 Tip: Custom settings will override default values
                            for this production run
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Custom Steps */}
              {customSteps.map((step, index) => {
                const stepIndex = currentRoute.steps.length + index;
                const isExpanded = expandedStep === step.id;

                return (
                  <div key={step.id} className="relative">
                    {index < customSteps.length - 1 && (
                      <div className="absolute bottom-0 left-4 top-8 w-0.5 bg-green-300" />
                    )}

                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-medium text-white">
                        {stepIndex + 1}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="rounded-lg border-2 border-green-200 bg-green-50/50 p-3">
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="default"
                                  className="bg-green-600 text-xs"
                                >
                                  Custom
                                </Badge>
                                <input
                                  type="text"
                                  value={step.name}
                                  onChange={e =>
                                    updateCustomStep(
                                      step.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 border-b border-green-300 bg-transparent px-1 font-medium"
                                  placeholder="Step name"
                                />
                              </div>
                              <input
                                type="text"
                                value={step.department}
                                onChange={e =>
                                  updateCustomStep(
                                    step.id,
                                    "department",
                                    e.target.value
                                  )
                                }
                                className="mt-1 w-full border-b border-green-200 bg-transparent px-1 text-sm text-muted-foreground"
                                placeholder="Department"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <input
                                  type="number"
                                  value={step.estimatedHours}
                                  onChange={e =>
                                    updateCustomStep(
                                      step.id,
                                      "estimatedHours",
                                      parseFloat(e.target.value) || 1
                                    )
                                  }
                                  className="w-12 border-b border-green-300 bg-transparent text-right text-sm font-medium"
                                  min="0.5"
                                  step="0.5"
                                />
                                <span className="text-sm">h</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={e =>
                                  toggleStepCustomization(step.id, e)
                                }
                                title="Edit details"
                              >
                                {isExpanded ? (
                                  <Minus className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={() => removeCustomStep(step.id)}
                                title="Remove step"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 space-y-2 border-t border-green-200 pt-3">
                              <div>
                                <label className="text-xs font-medium">
                                  Resources Required
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Machine, Operator (comma separated)"
                                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                                  onChange={e =>
                                    updateCustomStep(
                                      step.id,
                                      "resources",
                                      e.target.value
                                        .split(",")
                                        .map(r => r.trim())
                                    )
                                  }
                                />
                              </div>

                              <div>
                                <label className="text-xs font-medium">
                                  Custom Notes
                                </label>
                                <input
                                  type="text"
                                  placeholder="Special instructions"
                                  value={step.customNotes || ""}
                                  onChange={e =>
                                    updateCustomStep(
                                      step.id,
                                      "customNotes",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span>Total Production Time:</span>
                <span className="font-medium">
                  {calculateTotalEstimatedHours(currentRoute)} hours
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span>Estimated Duration:</span>
                <span className="font-medium">
                  {currentRoute.estimatedDays} working days
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span>Route Efficiency:</span>
                <span
                  className={`font-medium ${getRouteEfficiencyColor(currentRoute.efficiency)}`}
                >
                  {currentRoute.efficiency}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
