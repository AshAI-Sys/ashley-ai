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
  Zap,
  Printer,
  Timer,
  Thermometer,
  Camera,
  Eye,
} from "lucide-react";

interface SublimationWorkflowProps {
  runId: string;
  onUpdate?: (data: any) => void;
  readOnly?: boolean;
}

interface SublimationData {
  digital_setup: {
    design_file: string;
    print_resolution: number;
    color_profile: string;
    paper_type: string;
    ink_density: number;
    status: "pending" | "complete" | "needs_adjustment";
  };
  printing: {
    paper_consumed_m2: number;
    ink_usage_ml: Array<{
      color: string;
      amount: number;
    }>;
    print_quality_check: boolean;
    color_accuracy: number;
    registration_marks: boolean;
  };
  heat_press: {
    temperature_c: number;
    time_seconds: number;
    pressure: "LIGHT" | "MEDIUM" | "FIRM";
    cycles: number;
    cooling_time: number;
    transfer_quality: boolean;
  };
  quality_control: {
    color_fastness_test: boolean;
    wash_durability_test: boolean;
    hand_feel_assessment: boolean;
    final_approval: boolean;
    notes: string;
  };
  ashley_recommendations: {
    optimal_temperature: number;
    color_accuracy_prediction: number;
    transfer_efficiency: number;
    quality_score: number;
  };
}

export default function SublimationWorkflow({
  runId,
  onUpdate,
  readOnly = false,
}: SublimationWorkflowProps) {
  const [activeStep, setActiveStep] = useState<
    "setup" | "print" | "press" | "quality"
  >("setup");
  const [data, setData] = useState<SublimationData>({
    digital_setup: {
      design_file: "design_v1.pdf",
      print_resolution: 1440,
      color_profile: "ICC_SubliJet",
      paper_type: "TexPrint",
      ink_density: 100,
      status: "pending",
    },
    printing: {
      paper_consumed_m2: 0,
      ink_usage_ml: [
        { color: "Cyan", amount: 0 },
        { color: "Magenta", amount: 0 },
        { color: "Yellow", amount: 0 },
        { color: "Black", amount: 0 },
      ],
      print_quality_check: false,
      color_accuracy: 0,
      registration_marks: false,
    },
    heat_press: {
      temperature_c: 200,
      time_seconds: 45,
      pressure: "MEDIUM",
      cycles: 1,
      cooling_time: 30,
      transfer_quality: false,
    },
    quality_control: {
      color_fastness_test: false,
      wash_durability_test: false,
      hand_feel_assessment: false,
      final_approval: false,
      notes: "",
    },
    ashley_recommendations: {
      optimal_temperature: 200,
      color_accuracy_prediction: 95,
      transfer_efficiency: 88,
      quality_score: 92,
    },
  });

  const updateData = (section: keyof SublimationData, updates: any) => {
    const newData = {
      ...data,
      [section]: { ...data[section], ...updates },
    };
    setData(newData);
    onUpdate?.(newData);
  };

  const updateInkUsage = (index: number, amount: number) => {
    const updatedInk = [...data.printing.ink_usage_ml];
    updatedInk[index].amount = amount;
    updateData("printing", { ink_usage_ml: updatedInk });
  };

  const getStepStatus = (
    step: keyof Omit<SublimationData, "ashley_recommendations">
  ) => {
    switch (step) {
      case "digital_setup":
        return data.digital_setup.status;
      case "printing":
        return data.printing.print_quality_check ? "complete" : "pending";
      case "heat_press":
        return data.heat_press.transfer_quality ? "complete" : "pending";
      case "quality_control":
        return data.quality_control.final_approval ? "complete" : "pending";
      default:
        return "pending";
    }
  };

  const steps = [
    { key: "setup", title: "Digital Setup", icon: Printer },
    { key: "print", title: "Printing", icon: Zap },
    { key: "press", title: "Heat Press", icon: Thermometer },
    { key: "quality", title: "Quality Control", icon: Eye },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Ashley AI Recommendations */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-yellow-100 p-2">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Ashley AI Sublimation Optimization
              </CardTitle>
              <CardDescription>
                Smart recommendations for optimal sublimation results
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
                {data.ashley_recommendations.color_accuracy_prediction}%
              </div>
              <p className="text-sm text-muted-foreground">Color Accuracy</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.ashley_recommendations.optimal_temperature}°C
              </div>
              <p className="text-sm text-muted-foreground">Optimal Temp</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.ashley_recommendations.transfer_efficiency}%
              </div>
              <p className="text-sm text-muted-foreground">
                Transfer Efficiency
              </p>
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
      {activeStep === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Digital Setup
            </CardTitle>
            <CardDescription>
              Configure design file and print settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Design File</Label>
                <Input
                  value={data.digital_setup.design_file}
                  onChange={e =>
                    updateData("digital_setup", { design_file: e.target.value })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Print Resolution (DPI)</Label>
                <Select
                  value={data.digital_setup.print_resolution.toString()}
                  onValueChange={value =>
                    updateData("digital_setup", {
                      print_resolution: parseInt(value),
                    })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720">720 DPI (Draft)</SelectItem>
                    <SelectItem value="1440">1440 DPI (Standard)</SelectItem>
                    <SelectItem value="2880">
                      2880 DPI (High Quality)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color Profile</Label>
                <Select
                  value={data.digital_setup.color_profile}
                  onValueChange={value =>
                    updateData("digital_setup", { color_profile: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICC_SubliJet">ICC SubliJet</SelectItem>
                    <SelectItem value="Epson_Standard">
                      Epson Standard
                    </SelectItem>
                    <SelectItem value="Custom_Profile">
                      Custom Profile
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paper Type</Label>
                <Select
                  value={data.digital_setup.paper_type}
                  onValueChange={value =>
                    updateData("digital_setup", { paper_type: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TexPrint">TexPrint</SelectItem>
                    <SelectItem value="JetCol">JetCol</SelectItem>
                    <SelectItem value="StickyBack">Sticky Back</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ink Density (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="80"
                  max="120"
                  value={data.digital_setup.ink_density}
                  onChange={e =>
                    updateData("digital_setup", {
                      ink_density: parseInt(e.target.value),
                    })
                  }
                  className="flex-1"
                  disabled={readOnly}
                />
                <span className="w-12 text-sm font-medium">
                  {data.digital_setup.ink_density}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Setup Status</Label>
              <Select
                value={data.digital_setup.status}
                onValueChange={value =>
                  updateData("digital_setup", { status: value })
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
              <Button className="w-full" onClick={() => setActiveStep("print")}>
                Start Printing
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "print" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Digital Printing
            </CardTitle>
            <CardDescription>Monitor paper and ink consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paper Consumed (m²)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={data.printing.paper_consumed_m2}
                  onChange={e =>
                    updateData("printing", {
                      paper_consumed_m2: parseFloat(e.target.value) || 0,
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Color Accuracy (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={data.printing.color_accuracy}
                  onChange={e =>
                    updateData("printing", {
                      color_accuracy: parseInt(e.target.value) || 0,
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg">Ink Consumption (ml)</Label>
              <div className="grid grid-cols-2 gap-4">
                {data.printing.ink_usage_ml.map((ink, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded ${
                        ink.color === "Cyan"
                          ? "bg-cyan-500"
                          : ink.color === "Magenta"
                            ? "bg-pink-500"
                            : ink.color === "Yellow"
                              ? "bg-yellow-500"
                              : "bg-gray-800"
                      }`}
                    />
                    <Label className="w-16">{ink.color}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={ink.amount}
                      onChange={e =>
                        updateInkUsage(index, parseFloat(e.target.value) || 0)
                      }
                      className="flex-1"
                      readOnly={readOnly}
                    />
                    <span className="text-sm text-muted-foreground">ml</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="printQuality"
                  checked={data.printing.print_quality_check}
                  onChange={e =>
                    updateData("printing", {
                      print_quality_check: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="printQuality">Print quality approved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="registrationMarks"
                  checked={data.printing.registration_marks}
                  onChange={e =>
                    updateData("printing", {
                      registration_marks: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="registrationMarks">
                  Registration marks visible
                </Label>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-medium">Print Quality Checklist:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ No banding or streaking</li>
                <li>✓ Colors are vibrant and accurate</li>
                <li>✓ No smudging or bleeding</li>
                <li>✓ Clean registration marks</li>
              </ul>
            </div>

            {!readOnly && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Photo Print
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setActiveStep("press")}
                >
                  Ready for Heat Press
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === "press" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Heat Press Transfer
            </CardTitle>
            <CardDescription>
              Apply heat and pressure for sublimation transfer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  min="180"
                  max="220"
                  value={data.heat_press.temperature_c}
                  onChange={e =>
                    updateData("heat_press", {
                      temperature_c: parseInt(e.target.value),
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
                <Label>Time (seconds)</Label>
                <Input
                  type="number"
                  min="30"
                  max="120"
                  value={data.heat_press.time_seconds}
                  onChange={e =>
                    updateData("heat_press", {
                      time_seconds: parseInt(e.target.value),
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Pressure</Label>
                <Select
                  value={data.heat_press.pressure}
                  onValueChange={value =>
                    updateData("heat_press", { pressure: value })
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIGHT">Light</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="FIRM">Firm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Press Cycles</Label>
                <Input
                  type="number"
                  min="1"
                  max="3"
                  value={data.heat_press.cycles}
                  onChange={e =>
                    updateData("heat_press", {
                      cycles: parseInt(e.target.value),
                    })
                  }
                  readOnly={readOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Multiple cycles for thick fabrics
                </p>
              </div>
              <div className="space-y-2">
                <Label>Cooling Time (seconds)</Label>
                <Input
                  type="number"
                  min="15"
                  max="60"
                  value={data.heat_press.cooling_time}
                  onChange={e =>
                    updateData("heat_press", {
                      cooling_time: parseInt(e.target.value),
                    })
                  }
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="transferQuality"
                checked={data.heat_press.transfer_quality}
                onChange={e =>
                  updateData("heat_press", {
                    transfer_quality: e.target.checked,
                  })
                }
                disabled={readOnly}
              />
              <Label htmlFor="transferQuality">Transfer quality approved</Label>
            </div>

            <div className="rounded-lg bg-orange-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Heat Press Guidelines
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Polyester: 200°C, 45 seconds, Medium pressure</li>
                <li>• Poly-blends: 190°C, 50 seconds, Medium pressure</li>
                <li>• Always use protective paper</li>
                <li>• Remove transfer paper while hot</li>
              </ul>
            </div>

            {!readOnly && (
              <Button
                className="w-full"
                onClick={() => setActiveStep("quality")}
              >
                Transfer Complete
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
            <CardDescription>
              Final quality assessment and approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="colorFastness"
                  checked={data.quality_control.color_fastness_test}
                  onChange={e =>
                    updateData("quality_control", {
                      color_fastness_test: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="colorFastness">
                  Color fastness test completed
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="washDurability"
                  checked={data.quality_control.wash_durability_test}
                  onChange={e =>
                    updateData("quality_control", {
                      wash_durability_test: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="washDurability">
                  Wash durability test completed
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="handFeel"
                  checked={data.quality_control.hand_feel_assessment}
                  onChange={e =>
                    updateData("quality_control", {
                      hand_feel_assessment: e.target.checked,
                    })
                  }
                  disabled={readOnly}
                />
                <Label htmlFor="handFeel">Hand feel assessment completed</Label>
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
                placeholder="Record any quality observations, issues, or special notes..."
                rows={4}
                readOnly={readOnly}
              />
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="mb-2 font-medium">Quality Standards:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Colors match approved sample within tolerance</li>
                <li>✓ No ghosting or double images</li>
                <li>✓ Smooth, soft hand feel</li>
                <li>✓ Proper adhesion to fabric</li>
                <li>✓ No cracking or peeling after wash test</li>
              </ul>
            </div>

            {!readOnly && data.quality_control.final_approval && (
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Sublimation Run
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
