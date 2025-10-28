"use client";

import React, { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  Shirt,
  Settings,
  Timer,
  Palette,
  Camera,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";

interface EmbroideryWorkflowProps {
  runId: string;
  onUpdate?: (data: any) => void;
  readOnly?: boolean;
}

interface EmbroideryData {
  design_setup: {
    design_file: string;
    dst_file_path: string;
    stitch_count: number;
    design_dimensions: {
      width_mm: number;
      height_mm: number;
    };
    thread_colors: Array<{
      sequence: number;
      color_name: string;
      color_code: string;
      thread_weight: string;
      estimated_consumption_m: number;
    }>;
    status: "pending" | "complete" | "needs_adjustment";
  };
  machine_setup: {
    machine_id: string;
    hoop_size: string;
    stabilizer_type: "CUTAWAY" | "TEARAWAY" | "WASHAWAY" | "FUSIBLE";
    stabilizer_weight: string;
    needle_type: string;
    thread_tension: number;
    machine_speed_spm: number;
  };
  production: {
    pieces_completed: number;
    thread_breaks: number;
    needle_breaks: number;
    registration_checks: number;
    actual_runtime_minutes: number;
    machine_stops: Array<{
      reason: string;
      duration_minutes: number;
      resolved: boolean;
    }>;
  };
  quality_control: {
    stitch_quality_check: boolean;
    thread_tension_ok: boolean;
    registration_accuracy: boolean;
    fabric_puckering_check: boolean;
    color_match_approved: boolean;
    final_approval: boolean;
    notes: string;
  };
  ashley_recommendations: {
    optimal_speed_spm: number;
    thread_consumption_estimate: number;
    runtime_prediction_minutes: number;
    quality_score: number;
  };
}

export default function EmbroideryWorkflow({
  runId,
  onUpdate,
  readOnly = false,
}: EmbroideryWorkflowProps) {
  const [activeStep, setActiveStep] = useState<
    "design_setup" | "machine_setup" | "production" | "quality_control"
  >("design_setup");
  const [data, setData] = useState<EmbroideryData>({
    design_setup: {
      design_file: "logo_design_v1.dst",
      dst_file_path: "/designs/logo_v1.dst",
      stitch_count: 5420,
      design_dimensions: {
        width_mm: 80,
        height_mm: 60,
      },
      thread_colors: [
        {
          sequence: 1,
          color_name: "Navy Blue",
          color_code: "#1E3A8A",
          thread_weight: "40wt",
          estimated_consumption_m: 12,
        },
        {
          sequence: 2,
          color_name: "Gold",
          color_code: "#FCD34D",
          thread_weight: "40wt",
          estimated_consumption_m: 8,
        },
      ],
      status: "pending",
    },
    machine_setup: {
      machine_id: "EMB001",
      hoop_size: "100x100mm",
      stabilizer_type: "CUTAWAY",
      stabilizer_weight: "75gsm",
      needle_type: "Universal 75/11",
      thread_tension: 3,
      machine_speed_spm: 800,
    },
    production: {
      pieces_completed: 0,
      thread_breaks: 0,
      needle_breaks: 0,
      registration_checks: 0,
      actual_runtime_minutes: 0,
      machine_stops: [],
    },
    quality_control: {
      stitch_quality_check: false,
      thread_tension_ok: false,
      registration_accuracy: false,
      fabric_puckering_check: false,
      color_match_approved: false,
      final_approval: false,
      notes: "",
    },
    ashley_recommendations: {
      optimal_speed_spm: 750,
      thread_consumption_estimate: 25,
      runtime_prediction_minutes: 45,
      quality_score: 94,
    },
  });

  const updateData = (section: keyof EmbroideryData, updates: any) => {
    const newData = {
      ...data,
      [section]: { ...data[section], ...updates },
    };
    setData(newData);
    onUpdate?.(newData);
  };

  const addThreadColor = () => {
    const newColor = {
      sequence: data.design_setup.thread_colors.length + 1,
      color_name: "",
      color_code: "#000000",
      thread_weight: "40wt",
      estimated_consumption_m: 5,
    };
    updateData("design_setup", {
      thread_colors: [...data.design_setup.thread_colors, newColor],
    });
  };

  const updateThreadColor = (index: number, field: string, value: any) => {
    const updatedColors = [...data.design_setup.thread_colors];
    updatedColors[index] = { ...updatedColors[index]!, [field]: value };
    updateData("design_setup", { thread_colors: updatedColors });
  };

  const removeThreadColor = (index: number) => {
    const updatedColors = data.design_setup.thread_colors.filter(
      (_, i) => i !== index
    );
    // Resequence the remaining colors
    const resequencedColors = updatedColors.map((color, i) => ({
      ...color,
      sequence: i + 1,
    }));
    updateData("design_setup", { thread_colors: resequencedColors });
  };

  const addMachineStop = () => {
    const newStop = {
      reason: "",
      duration_minutes: 0,
      resolved: false,
    };
    updateData("production", {
      machine_stops: [...data.production.machine_stops, newStop],
    });
  };

  const updateMachineStop = (index: number, field: string, value: any) => {
    const updatedStops = [...data.production.machine_stops];
    updatedStops[index] = { ...updatedStops[index]!, [field]: value };
    updateData("production", { machine_stops: updatedStops });
  };

  const getStepStatus = (
    step: keyof Omit<EmbroideryData, "ashley_recommendations">
  ) => {
    switch (step) {
      case "design_setup":
        return data.design_setup.status;
      case "machine_setup":
        return data.machine_setup.machine_id &&
          data.machine_setup.stabilizer_type
          ? "complete"
          : "pending";
      case "production":
        return data.production.pieces_completed > 0 ? "complete" : "pending";
      case "quality_control":
        return data.quality_control.final_approval ? "complete" : "pending";
      default:
        return "pending";
    }
  };

  const steps = [
    { key: "design_setup", title: "Design Setup", icon: Palette },
    { key: "machine_setup", title: "Machine Setup", icon: Settings },
    { key: "production", title: "Production", icon: Shirt },
    { key: "quality_control", title: "Quality Control", icon: Eye },
  ] as const;

  const calculateEfficiency = () => {
    if (data.ashley_recommendations.runtime_prediction_minutes === 0) return 0;
    return Math.round(
      (data.ashley_recommendations.runtime_prediction_minutes /
        Math.max(data.production.actual_runtime_minutes, 1)) *
        100
    );
  };

  return (
    <div className="space-y-6">
      {/* Ashley AI Recommendations */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-2">
              <Shirt className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Ashley AI Embroidery Optimization
              </CardTitle>
              <CardDescription>
                Smart recommendations for embroidery production
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.ashley_recommendations.quality_score}%
              </div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.ashley_recommendations.optimal_speed_spm}
              </div>
              <p className="text-sm text-muted-foreground">Optimal SPM</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.ashley_recommendations.runtime_prediction_minutes}m
              </div>
              <p className="text-sm text-muted-foreground">Estimated Runtime</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.ashley_recommendations.thread_consumption_estimate}m
              </div>
              <p className="text-sm text-muted-foreground">Thread Needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map(step => {
          const status = getStepStatus(step.key);
          const StepIcon = step.icon;
          const isActive = activeStep === step.key;

          return (
            <Button
              key={step.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStep(step.key)}
              className={`flex min-w-fit items-center gap-2 ${
                status === "complete" ? "border-green-500 text-green-700" : ""
              }`}
            >
              <StepIcon className="h-4 w-4" />
              {step.title}
              {status === "complete" && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Step Content */}
      {activeStep === "design" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Design Setup
            </CardTitle>
            <CardDescription>
              Configure embroidery design and thread specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Design File Name</Label>
                <Input
                  value={data.design_setup.design_file}
                  onChange={e =>
                    updateData("design_setup", { design_file: e.target.value })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>DST File Path</Label>
                <Input
                  value={data.design_setup.dst_file_path}
                  onChange={e =>
                    updateData("design_setup", {
                      dst_file_path: e.target.value,
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Stitch Count</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.design_setup.stitch_count}
                  onChange={e =>
                    updateData("design_setup", {
                      stitch_count: parseInt(e.target.value) || 0,
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Width (mm)</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.design_setup.design_dimensions.width_mm}
                  onChange={e =>
                    updateData("design_setup", {
                      design_dimensions: {
                        ...data.design_setup.design_dimensions,
                        width_mm: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Height (mm)</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.design_setup.design_dimensions.height_mm}
                  onChange={e =>
                    updateData("design_setup", {
                      design_dimensions: {
                        ...data.design_setup.design_dimensions,
                        height_mm: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Thread Colors</Label>
                {!readOnly && (
                  <Button size="sm" variant="outline" onClick={addThreadColor}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Color
                  </Button>
                )}
              </div>

              {data.design_setup.thread_colors.map((color, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-4 rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <Label>Sequence</Label>
                    <Input
                      type="number"
                      min="1"
                      value={color.sequence}
                      onChange={e =>
                        updateThreadColor(
                          index,
                          "sequence",
                          parseInt(e.target.value) || 1
                        )
                      }
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color Name</Label>
                    <Input
                      value={color.color_name}
                      onChange={e =>
                        updateThreadColor(index, "color_name", e.target.value)
                      }
                      placeholder="Navy Blue"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color Code</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={color.color_code}
                        onChange={e =>
                          updateThreadColor(index, "color_code", e.target.value)
                        }
                        className="h-8 w-12 border p-0"
                        disabled={readOnly}
                      />
                      <Input
                        value={color.color_code}
                        onChange={e =>
                          updateThreadColor(index, "color_code", e.target.value)
                        }
                        className="flex-1"
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <Select
                      value={color.thread_weight}
                      onValueChange={value =>
                        updateThreadColor(index, "thread_weight", value)
                      }
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30wt">30wt</SelectItem>
                        <SelectItem value="40wt">40wt</SelectItem>
                        <SelectItem value="60wt">60wt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Est. Consumption (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={color.estimated_consumption_m}
                      onChange={e =>
                        updateThreadColor(
                          index,
                          "estimated_consumption_m",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="flex items-end">
                    {!readOnly && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeThreadColor(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Design Status</Label>
              <Select
                value={data.design_setup.status}
                onValueChange={value =>
                  updateData("design_setup", { status: value })
                }
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="needs_adjustment">
                    Needs Adjustment
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!readOnly && (
              <Button className="w-full" onClick={() => setActiveStep("machine_setup")}>
                Setup Machine
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Machine Setup
            </CardTitle>
            <CardDescription>
              Configure machine parameters and materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Machine ID</Label>
                <Select
                  value={data.machine_setup.machine_id}
                  onValueChange={value =>
                    updateData("machine_setup", { machine_id: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMB001">
                      Tajima 16-Head (EMB001)
                    </SelectItem>
                    <SelectItem value="EMB002">
                      Brother 10-Head (EMB002)
                    </SelectItem>
                    <SelectItem value="EMB003">
                      Barudan 15-Head (EMB003)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hoop Size</Label>
                <Select
                  value={data.machine_setup.hoop_size}
                  onValueChange={value =>
                    updateData("machine_setup", { hoop_size: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50x50mm">50x50mm</SelectItem>
                    <SelectItem value="100x100mm">100x100mm</SelectItem>
                    <SelectItem value="150x150mm">150x150mm</SelectItem>
                    <SelectItem value="200x200mm">200x200mm</SelectItem>
                    <SelectItem value="360x200mm">360x200mm (Cap)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Stabilizer Type</Label>
                <Select
                  value={data.machine_setup.stabilizer_type}
                  onValueChange={value =>
                    updateData("machine_setup", { stabilizer_type: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUTAWAY">Cut-away</SelectItem>
                    <SelectItem value="TEARAWAY">Tear-away</SelectItem>
                    <SelectItem value="WASHAWAY">Wash-away</SelectItem>
                    <SelectItem value="FUSIBLE">Fusible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stabilizer Weight</Label>
                <Select
                  value={data.machine_setup.stabilizer_weight}
                  onValueChange={value =>
                    updateData("machine_setup", { stabilizer_weight: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50gsm">50gsm (Light)</SelectItem>
                    <SelectItem value="75gsm">75gsm (Medium)</SelectItem>
                    <SelectItem value="100gsm">100gsm (Heavy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Needle Type</Label>
                <Select
                  value={data.machine_setup.needle_type}
                  onValueChange={value =>
                    updateData("machine_setup", { needle_type: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Universal 75/11">
                      Universal 75/11
                    </SelectItem>
                    <SelectItem value="Universal 90/14">
                      Universal 90/14
                    </SelectItem>
                    <SelectItem value="Ballpoint 75/11">
                      Ballpoint 75/11
                    </SelectItem>
                    <SelectItem value="Sharp 75/11">Sharp 75/11</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thread Tension</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={data.machine_setup.thread_tension}
                    onChange={e =>
                      updateData("machine_setup", {
                        thread_tension: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1"
                    disabled={readOnly}
                  />
                  <span className="w-12 text-sm font-medium">
                    {data.machine_setup.thread_tension}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Machine Speed (SPM)</Label>
                <Input
                  type="number"
                  min="400"
                  max="1200"
                  step="50"
                  value={data.machine_setup.machine_speed_spm}
                  onChange={e =>
                    updateData("machine_setup", {
                      machine_speed_spm: parseInt(e.target.value) || 800,
                    })
                  }
                  readOnly={readOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: {data.ashley_recommendations.optimal_speed_spm}{" "}
                  SPM
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="mb-2 font-medium">Setup Guidelines:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  • Use cut-away stabilizer for knits and stretchy fabrics
                </li>
                <li>
                  • Adjust thread tension based on thread weight and fabric
                </li>
                <li>• Start with slower speeds for complex designs</li>
                <li>
                  • Ensure proper hoop tension - firm but not distorting fabric
                </li>
              </ul>
            </div>

            {!readOnly && (
              <Button
                className="w-full"
                onClick={() => setActiveStep("production")}
              >
                Start Production
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "production" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5" />
              Production Monitoring
            </CardTitle>
            <CardDescription>
              Track embroidery production progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Pieces Completed</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.production.pieces_completed}
                  onChange={e =>
                    updateData("production", {
                      pieces_completed: parseInt(e.target.value) || 0,
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Thread Breaks</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.production.thread_breaks}
                  onChange={e =>
                    updateData("production", {
                      thread_breaks: parseInt(e.target.value) || 0,
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Needle Breaks</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.production.needle_breaks}
                  onChange={e =>
                    updateData("production", {
                      needle_breaks: parseInt(e.target.value) || 0,
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Runtime (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.production.actual_runtime_minutes}
                  onChange={e =>
                    updateData("production", {
                      actual_runtime_minutes: parseInt(e.target.value) || 0,
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>

            {/* Efficiency Indicator */}
            {data.production.actual_runtime_minutes > 0 && (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Production Efficiency</span>
                  <span className="text-lg font-bold">
                    {calculateEfficiency()}%
                  </span>
                </div>
                <Progress value={calculateEfficiency()} />
                <p className="mt-1 text-sm text-muted-foreground">
                  Predicted:{" "}
                  {data.ashley_recommendations.runtime_prediction_minutes}m |
                  Actual: {data.production.actual_runtime_minutes}m
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Machine Stops</Label>
                {!readOnly && (
                  <Button size="sm" variant="outline" onClick={addMachineStop}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stop
                  </Button>
                )}
              </div>

              {data.production.machine_stops.map((stop, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Select
                      value={stop.reason}
                      onValueChange={value =>
                        updateMachineStop(index, "reason", value)
                      }
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="THREAD_BREAK">
                          Thread Break
                        </SelectItem>
                        <SelectItem value="NEEDLE_BREAK">
                          Needle Break
                        </SelectItem>
                        <SelectItem value="THREAD_CHANGE">
                          Thread Change
                        </SelectItem>
                        <SelectItem value="REGISTRATION_CHECK">
                          Registration Check
                        </SelectItem>
                        <SelectItem value="MACHINE_JAM">Machine Jam</SelectItem>
                        <SelectItem value="QUALITY_ISSUE">
                          Quality Issue
                        </SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={stop.duration_minutes}
                      onChange={e =>
                        updateMachineStop(
                          index,
                          "duration_minutes",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`resolved-${index}`}
                      checked={stop.resolved}
                      onChange={e =>
                        updateMachineStop(index, "resolved", e.target.checked)
                      }
                      disabled={readOnly}
                    />
                    <Label htmlFor={`resolved-${index}`}>Resolved</Label>
                  </div>
                  <div className="flex items-end">
                    {!readOnly && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const updatedStops =
                            data.production.machine_stops.filter(
                              (_, i) => i !== index
                            );
                          updateData("production", {
                            machine_stops: updatedStops,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {data.production.machine_stops.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  <p>No machine stops recorded</p>
                </div>
              )}
            </div>

            {!readOnly && (
              <Button
                className="w-full"
                onClick={() => setActiveStep("quality_control")}
              >
                Production Complete
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "quality" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Quality Control
            </CardTitle>
            <CardDescription>Final quality assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="stitchQuality"
                  checked={data.quality_control.stitch_quality_check}
                  onChange={e =>
                    updateData("quality_control", {
                      stitch_quality_check: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="stitchQuality">Stitch quality approved</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="threadTension"
                  checked={data.quality_control.thread_tension_ok}
                  onChange={e =>
                    updateData("quality_control", {
                      thread_tension_ok: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="threadTension">Thread tension consistent</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="registration"
                  checked={data.quality_control.registration_accuracy}
                  onChange={e =>
                    updateData("quality_control", {
                      registration_accuracy: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="registration">
                  Registration accuracy approved
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="puckering"
                  checked={data.quality_control.fabric_puckering_check}
                  onChange={e =>
                    updateData("quality_control", {
                      fabric_puckering_check: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="puckering">No fabric puckering</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="colorMatch"
                  checked={data.quality_control.color_match_approved}
                  onChange={e =>
                    updateData("quality_control", {
                      color_match_approved: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="colorMatch">Color match approved</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="finalApproval"
                  checked={data.quality_control.final_approval}
                  onChange={e =>
                    updateData("quality_control", {
                      final_approval: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="finalApproval">Final quality approval</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quality Control Notes</Label>
              <Textarea
                value={data.quality_control.notes}
                onChange={e =>
                  updateData("quality_control", { notes: e.target.value })
                }
                placeholder="Record quality observations, measurements, any issues..."
                rows={4}
                readOnly={readOnly}
              />
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="mb-2 font-medium">
                Embroidery Quality Standards:
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Consistent stitch density and coverage</li>
                <li>✓ Proper thread tension without puckering</li>
                <li>✓ Accurate design placement and registration</li>
                <li>✓ Clean thread cuts and no loose ends</li>
                <li>✓ Colors match approved sample</li>
              </ul>
            </div>

            {!readOnly && data.quality_control.final_approval && (
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Embroidery Run
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
