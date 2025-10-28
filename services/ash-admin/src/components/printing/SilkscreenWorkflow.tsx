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
  Palette,
  Thermometer, Timer,
  Droplet,
  Eye,
  Camera,
} from "lucide-react";

interface SilkscreenWorkflowProps {
  runId: string;
  onUpdate?: (data: any) => void;
  readOnly?: boolean;
}

interface SilkscreenData {
  screen_prep: {
    screen_id: string;
    mesh_count: number;
    emulsion_batch: string;
    exposure_seconds: number;
    registration_notes: string;
    status: "pending" | "complete" | "needs_adjustment";
  };
  ink_setup: {
    ink_type: "PLASTISOL" | "WATER" | "PUFF" | "ANTI_MIGRATION";
    colors: Array<{
      name: string;
      pantone: string;
      location: string;
      estimated_grams: number;
    }>;
    coats: number;
    squeegee_durometer: number;
    floodbar: "SOFT" | "MEDIUM" | "FIRM";
  };
  printing: {
    test_prints: number;
    approved_print: boolean;
    registration_check_interval: number;
    stroke_speed: "SLOW" | "MEDIUM" | "FAST";
  };
  curing: {
    dryer_temp: number;
    belt_speed: "SLOW" | "MEDIUM" | "FAST";
    cure_time: number;
    wash_test_completed: boolean;
  };
  ashley_recommendations: {
    ink_calculation: number;
    registration_drift_prediction: number;
    optimal_temperature: number;
    quality_score: number;
  };
}

export default function SilkscreenWorkflow({ runId,
  onUpdate,
  readOnly = false,
}: SilkscreenWorkflowProps) {
  const [activeStep, setActiveStep] = useState<
    "screen_prep" | "ink_setup" | "printing" | "curing"
  >("screen_prep");
  const [data, setData] = useState<SilkscreenData>({
    screen_prep: {
      screen_id: `SCR-${Date.now()}`,
      mesh_count: 160,
      emulsion_batch: "",
      exposure_seconds: 120,
      registration_notes: "",
      status: "pending",
    },
    ink_setup: {
      ink_type: "PLASTISOL",
      colors: [
        {
          name: "Black",
          pantone: "19-0303",
          location: "Station 1",
          estimated_grams: 15,
        },
      ],
      coats: 1,
      squeegee_durometer: 70,
      floodbar: "MEDIUM",
    },
    printing: {
      test_prints: 0,
      approved_print: false,
      registration_check_interval: 25,
      stroke_speed: "MEDIUM",
    },
    curing: {
      dryer_temp: 160,
      belt_speed: "MEDIUM",
      cure_time: 45,
      wash_test_completed: false,
    },
    ashley_recommendations: {
      ink_calculation: 12.5,
      registration_drift_prediction: 0.2,
      optimal_temperature: 165,
      quality_score: 92,
    },
  });

  const updateData = (section: keyof SilkscreenData, updates: any) => {
    const newData = {
      ...data,
      [section]: { ...data[section], ...updates },
    };
    setData(newData);
    onUpdate?.(newData);
  };

  const addColor = () => {
    const newColor = {
      name: "",
      pantone: "",
      location: "",
      estimated_grams: 10,
    };
    updateData("ink_setup", {
      colors: [...data.ink_setup.colors, newColor],
    });
  };

  const updateColor = (index: number, field: string, value: any) => {
    const updatedColors = [...data.ink_setup.colors];
    updatedColors[index] = { ...updatedColors[index]!, [field]: value };
    updateData("ink_setup", { colors: updatedColors });
  };

  const getStepStatus = (
    step: keyof Omit<SilkscreenData, "ashley_recommendations">
  ) => {
    switch (step) {
      case "screen_prep":
        return data.screen_prep.status;
      case "ink_setup":
        return data.ink_setup.colors.every(c => c.name && c.pantone)
          ? "complete"
          : "pending";
      case "printing":
        return data.printing.approved_print ? "complete" : "pending";
      case "curing":
        return data.curing.wash_test_completed ? "complete" : "pending";
      default:
        return "pending";
    }
  };

  const steps = [
    { key: "screen_prep", title: "Screen Prep", icon: Palette },
    { key: "ink_setup", title: "Ink Setup", icon: Droplet },
    { key: "printing", title: "Printing", icon: Eye },
    { key: "curing", title: "Curing", icon: Thermometer },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Ashley AI Recommendations */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Ashley AI Optimization</CardTitle>
              <CardDescription>
                Smart recommendations for this silkscreen run
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
                {data.ashley_recommendations.ink_calculation}g
              </div>
              <p className="text-sm text-muted-foreground">Ink Needed</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.ashley_recommendations.optimal_temperature}°C
              </div>
              <p className="text-sm text-muted-foreground">Optimal Temp</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.ashley_recommendations.registration_drift_prediction}mm
              </div>
              <p className="text-sm text-muted-foreground">Drift Risk</p>
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
      {activeStep === "prep" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Screen Preparation
            </CardTitle>
            <CardDescription>
              Prepare screens with proper mesh and emulsion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Screen ID</Label>
                <Input
                  value={data.screen_prep.screen_id}
                  onChange={e =>
                    updateData("screen_prep", { screen_id: e.target.value })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Mesh Count</Label>
                <Select
                  value={data.screen_prep.mesh_count.toString()}
                  onValueChange={value =>
                    updateData("screen_prep", { mesh_count: parseInt(value) })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="110">110 (Coarse)</SelectItem>
                    <SelectItem value="160">160 (Standard)</SelectItem>
                    <SelectItem value="200">200 (Fine)</SelectItem>
                    <SelectItem value="305">305 (Ultra Fine)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emulsion Batch</Label>
                <Input
                  value={data.screen_prep.emulsion_batch}
                  onChange={e =>
                    updateData("screen_prep", {
                      emulsion_batch: e.target.value,
                    })
                  }
                  placeholder="EMB-20250101-001"
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Exposure Time (seconds)</Label>
                <Input
                  type="number"
                  value={data.screen_prep.exposure_seconds}
                  onChange={e =>
                    updateData("screen_prep", {
                      exposure_seconds: parseInt(e.target.value),
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Registration Notes</Label>
              <Textarea
                value={data.screen_prep.registration_notes}
                onChange={e =>
                  updateData("screen_prep", {
                    registration_notes: e.target.value,
                  })
                }
                placeholder="Record registration marks, alignment notes..."
                readOnly={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label>Screen Status</Label>
              <Select
                value={data.screen_prep.status}
                onValueChange={value =>
                  updateData("screen_prep", { status: value })
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
              <Button className="w-full" onClick={() => setActiveStep("ink_setup")}>
                Complete Screen Prep
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Ink Setup
            </CardTitle>
            <CardDescription>
              Configure inks, colors, and printing parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ink Type</Label>
                <Select
                  value={data.ink_setup.ink_type}
                  onValueChange={value =>
                    updateData("ink_setup", { ink_type: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLASTISOL">Plastisol</SelectItem>
                    <SelectItem value="WATER">Water-based</SelectItem>
                    <SelectItem value="PUFF">Puff/Foam</SelectItem>
                    <SelectItem value="ANTI_MIGRATION">
                      Anti-migration
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Coats</Label>
                <Input
                  type="number"
                  min="1"
                  max="3"
                  value={data.ink_setup.coats}
                  onChange={e =>
                    updateData("ink_setup", { coats: parseInt(e.target.value) })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Squeegee Durometer</Label>
                <Select
                  value={data.ink_setup.squeegee_durometer.toString()}
                  onValueChange={value =>
                    updateData("ink_setup", {
                      squeegee_durometer: parseInt(value),
                    })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 Shore (Soft)</SelectItem>
                    <SelectItem value="70">70 Shore (Medium)</SelectItem>
                    <SelectItem value="80">80 Shore (Hard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Colors</Label>
                {!readOnly && (
                  <Button size="sm" variant="outline" onClick={addColor}>
                    Add Color
                  </Button>
                )}
              </div>

              {data.ink_setup.colors.map((color, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <Label>Color Name</Label>
                    <Input
                      value={color.name}
                      onChange={e => updateColor(index, "name", e.target.value)}
                      placeholder="Black"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pantone</Label>
                    <Input
                      value={color.pantone}
                      onChange={e =>
                        updateColor(index, "pantone", e.target.value)
                      }
                      placeholder="19-0303"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Station Location</Label>
                    <Input
                      value={color.location}
                      onChange={e =>
                        updateColor(index, "location", e.target.value)
                      }
                      placeholder="Station 1"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Est. Grams</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={color.estimated_grams}
                      onChange={e =>
                        updateColor(
                          index,
                          "estimated_grams",
                          parseFloat(e.target.value)
                        )
                      }
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              ))}
            </div>

            {!readOnly && (
              <Button className="w-full" onClick={() => setActiveStep("printing")}>
                Complete Ink Setup
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "print" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Printing Process
            </CardTitle>
            <CardDescription>
              Monitor printing quality and registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Test Prints</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.printing.test_prints}
                  onChange={e =>
                    updateData("printing", {
                      test_prints: parseInt(e.target.value),
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Check Interval</Label>
                <Input
                  type="number"
                  value={data.printing.registration_check_interval}
                  onChange={e =>
                    updateData("printing", {
                      registration_check_interval: parseInt(e.target.value),
                    })
                  }
                  readOnly={readOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Check every X pieces
                </p>
              </div>
              <div className="space-y-2">
                <Label>Stroke Speed</Label>
                <Select
                  value={data.printing.stroke_speed}
                  onValueChange={value =>
                    updateData("printing", { stroke_speed: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SLOW">Slow</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="FAST">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="approved"
                checked={data.printing.approved_print}
                onChange={e =>
                  updateData("printing", { approved_print: e.target.checked })
                }
                disabled={readOnly}
              />
              <Label htmlFor="approved">Approved test print</Label>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-medium">Quality Checkpoints:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Registration alignment within 1mm</li>
                <li>✓ Ink coverage is consistent</li>
                <li>✓ No bleeding or contamination</li>
                <li>✓ Color matches approved sample</li>
              </ul>
            </div>

            {!readOnly && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Photo Test Print
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setActiveStep("curing")}
                >
                  Start Curing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "cure" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Curing Process
            </CardTitle>
            <CardDescription>
              Set proper curing temperature and time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Dryer Temperature (°C)</Label>
                <Input
                  type="number"
                  min="120"
                  max="200"
                  value={data.curing.dryer_temp}
                  onChange={e =>
                    updateData("curing", {
                      dryer_temp: parseInt(e.target.value),
                    })
                  }
                  readOnly={readOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: {data.ashley_recommendations.optimal_temperature}
                  °C
                </p>
              </div>
              <div className="space-y-2">
                <Label>Belt Speed</Label>
                <Select
                  value={data.curing.belt_speed}
                  onValueChange={value =>
                    updateData("curing", { belt_speed: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SLOW">Slow (2-3 m/min)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (4-5 m/min)</SelectItem>
                    <SelectItem value="FAST">Fast (6+ m/min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cure Time (seconds)</Label>
                <Input
                  type="number"
                  min="30"
                  max="120"
                  value={data.curing.cure_time}
                  onChange={e =>
                    updateData("curing", {
                      cure_time: parseInt(e.target.value),
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="washTest"
                checked={data.curing.wash_test_completed}
                onChange={e =>
                  updateData("curing", {
                    wash_test_completed: e.target.checked,
                  })
                }
                disabled={readOnly}
              />
              <Label htmlFor="washTest">Wash test completed</Label>
            </div>

            <div className="rounded-lg bg-orange-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Curing Guidelines
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Plastisol: 160°C for 45+ seconds</li>
                <li>• Water-based: 140°C for 60+ seconds</li>
                <li>• Always perform wash test on sample</li>
                <li>• Monitor for proper adhesion and no cracking</li>
              </ul>
            </div>

            {!readOnly && data.curing.wash_test_completed && (
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Silkscreen Run
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
