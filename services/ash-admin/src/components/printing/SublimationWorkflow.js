"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SublimationWorkflow;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const lucide_react_1 = require("lucide-react");
function SublimationWorkflow({ runId, onUpdate, readOnly = false, }) {
    const [activeStep, setActiveStep] = (0, react_1.useState)("setup");
    const [data, setData] = (0, react_1.useState)({
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
    const updateData = (section, updates) => {
        const newData = {
            ...data,
            [section]: { ...data[section], ...updates },
        };
        setData(newData);
        onUpdate?.(newData);
    };
    const updateInkUsage = (index, amount) => {
        const updatedInk = [...data.printing.ink_usage_ml];
        updatedInk[index].amount = amount;
        updateData("printing", { ink_usage_ml: updatedInk });
    };
    const getStepStatus = (step) => {
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
        { key: "setup", title: "Digital Setup", icon: lucide_react_1.Printer },
        { key: "print", title: "Printing", icon: lucide_react_1.Zap },
        { key: "press", title: "Heat Press", icon: lucide_react_1.Thermometer },
        { key: "quality", title: "Quality Control", icon: lucide_react_1.Eye },
    ];
    return (<div className="space-y-6">
      {/* Ashley AI Recommendations */}
      <card_1.Card className="border-l-4 border-l-yellow-500">
        <card_1.CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-yellow-100 p-2">
              <lucide_react_1.Zap className="h-5 w-5 text-yellow-600"/>
            </div>
            <div>
              <card_1.CardTitle className="text-lg">
                Ashley AI Sublimation Optimization
              </card_1.CardTitle>
              <card_1.CardDescription>
                Smart recommendations for optimal sublimation results
              </card_1.CardDescription>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
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
        </card_1.CardContent>
      </card_1.Card>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map(step => {
            const status = getStepStatus(step.key);
            const StepIcon = step.icon;
            const isActive = activeStep === step.key;
            return (<button_1.Button key={step.key} variant={isActive ? "default" : "outline"} size="sm" onClick={() => setActiveStep(step.key)} className={`flex min-w-fit items-center gap-2 ${status === "complete" ? "border-green-500 text-green-700" : ""}`}>
              <StepIcon className="h-4 w-4"/>
              {step.title}
              {status === "complete" && (<lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>)}
            </button_1.Button>);
        })}
      </div>

      {/* Step Content */}
      {activeStep === "setup" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Printer className="h-5 w-5"/>
              Digital Setup
            </card_1.CardTitle>
            <card_1.CardDescription>
              Configure design file and print settings
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Design File</label_1.Label>
                <input_1.Input value={data.digital_setup.design_file} onChange={e => updateData("digital_setup", { design_file: e.target.value })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Print Resolution (DPI)</label_1.Label>
                <select_1.Select value={data.digital_setup.print_resolution.toString()} onValueChange={value => updateData("digital_setup", {
                print_resolution: parseInt(value),
            })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="720">720 DPI (Draft)</select_1.SelectItem>
                    <select_1.SelectItem value="1440">1440 DPI (Standard)</select_1.SelectItem>
                    <select_1.SelectItem value="2880">
                      2880 DPI (High Quality)
                    </select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Color Profile</label_1.Label>
                <select_1.Select value={data.digital_setup.color_profile} onValueChange={value => updateData("digital_setup", { color_profile: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="ICC_SubliJet">ICC SubliJet</select_1.SelectItem>
                    <select_1.SelectItem value="Epson_Standard">
                      Epson Standard
                    </select_1.SelectItem>
                    <select_1.SelectItem value="Custom_Profile">
                      Custom Profile
                    </select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label>Paper Type</label_1.Label>
                <select_1.Select value={data.digital_setup.paper_type} onValueChange={value => updateData("digital_setup", { paper_type: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="TexPrint">TexPrint</select_1.SelectItem>
                    <select_1.SelectItem value="JetCol">JetCol</select_1.SelectItem>
                    <select_1.SelectItem value="StickyBack">Sticky Back</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Ink Density (%)</label_1.Label>
              <div className="flex items-center gap-4">
                <input_1.Input type="range" min="80" max="120" value={data.digital_setup.ink_density} onChange={e => updateData("digital_setup", {
                ink_density: parseInt(e.target.value),
            })} className="flex-1" disabled={readOnly}/>
                <span className="w-12 text-sm font-medium">
                  {data.digital_setup.ink_density}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Setup Status</label_1.Label>
              <select_1.Select value={data.digital_setup.status} onValueChange={value => updateData("digital_setup", { status: value })} disabled={readOnly}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="pending">Pending</select_1.SelectItem>
                  <select_1.SelectItem value="complete">Complete</select_1.SelectItem>
                  <select_1.SelectItem value="needs_adjustment">
                    Needs Adjustment
                  </select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep("print")}>
                Start Printing
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === "print" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Zap className="h-5 w-5"/>
              Digital Printing
            </card_1.CardTitle>
            <card_1.CardDescription>Monitor paper and ink consumption</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Paper Consumed (m²)</label_1.Label>
                <input_1.Input type="number" step="0.1" min="0" value={data.printing.paper_consumed_m2} onChange={e => updateData("printing", {
                paper_consumed_m2: parseFloat(e.target.value) || 0,
            })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Color Accuracy (%)</label_1.Label>
                <input_1.Input type="number" min="0" max="100" value={data.printing.color_accuracy} onChange={e => updateData("printing", {
                color_accuracy: parseInt(e.target.value) || 0,
            })} readOnly={readOnly}/>
              </div>
            </div>

            <div className="space-y-4">
              <label_1.Label className="text-lg">Ink Consumption (ml)</label_1.Label>
              <div className="grid grid-cols-2 gap-4">
                {data.printing.ink_usage_ml.map((ink, index) => (<div key={index} className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded ${ink.color === "Cyan"
                    ? "bg-cyan-500"
                    : ink.color === "Magenta"
                        ? "bg-pink-500"
                        : ink.color === "Yellow"
                            ? "bg-yellow-500"
                            : "bg-gray-800"}`}/>
                    <label_1.Label className="w-16">{ink.color}</label_1.Label>
                    <input_1.Input type="number" step="0.1" min="0" value={ink.amount} onChange={e => updateInkUsage(index, parseFloat(e.target.value) || 0)} className="flex-1" readOnly={readOnly}/>
                    <span className="text-sm text-muted-foreground">ml</span>
                  </div>))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="printQuality" checked={data.printing.print_quality_check} onChange={e => updateData("printing", {
                print_quality_check: e.target.checked,
            })} disabled={readOnly}/>
                <label_1.Label htmlFor="printQuality">Print quality approved</label_1.Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="registrationMarks" checked={data.printing.registration_marks} onChange={e => updateData("printing", {
                registration_marks: e.target.checked,
            })} disabled={readOnly}/>
                <label_1.Label htmlFor="registrationMarks">
                  Registration marks visible
                </label_1.Label>
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

            {!readOnly && (<div className="flex gap-2">
                <button_1.Button variant="outline" className="flex-1">
                  <lucide_react_1.Camera className="mr-2 h-4 w-4"/>
                  Photo Print
                </button_1.Button>
                <button_1.Button className="flex-1" onClick={() => setActiveStep("press")}>
                  Ready for Heat Press
                </button_1.Button>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === "press" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Thermometer className="h-5 w-5"/>
              Heat Press Transfer
            </card_1.CardTitle>
            <card_1.CardDescription>
              Apply heat and pressure for sublimation transfer
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label>Temperature (°C)</label_1.Label>
                <input_1.Input type="number" min="180" max="220" value={data.heat_press.temperature_c} onChange={e => updateData("heat_press", {
                temperature_c: parseInt(e.target.value),
            })} readOnly={readOnly}/>
                <p className="text-xs text-muted-foreground">
                  Recommended: {data.ashley_recommendations.optimal_temperature}
                  °C
                </p>
              </div>
              <div className="space-y-2">
                <label_1.Label>Time (seconds)</label_1.Label>
                <input_1.Input type="number" min="30" max="120" value={data.heat_press.time_seconds} onChange={e => updateData("heat_press", {
                time_seconds: parseInt(e.target.value),
            })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Pressure</label_1.Label>
                <select_1.Select value={data.heat_press.pressure} onValueChange={value => updateData("heat_press", { pressure: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="LIGHT">Light</select_1.SelectItem>
                    <select_1.SelectItem value="MEDIUM">Medium</select_1.SelectItem>
                    <select_1.SelectItem value="FIRM">Firm</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Press Cycles</label_1.Label>
                <input_1.Input type="number" min="1" max="3" value={data.heat_press.cycles} onChange={e => updateData("heat_press", {
                cycles: parseInt(e.target.value),
            })} readOnly={readOnly}/>
                <p className="text-xs text-muted-foreground">
                  Multiple cycles for thick fabrics
                </p>
              </div>
              <div className="space-y-2">
                <label_1.Label>Cooling Time (seconds)</label_1.Label>
                <input_1.Input type="number" min="15" max="60" value={data.heat_press.cooling_time} onChange={e => updateData("heat_press", {
                cooling_time: parseInt(e.target.value),
            })} readOnly={readOnly}/>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="transferQuality" checked={data.heat_press.transfer_quality} onChange={e => updateData("heat_press", {
                transfer_quality: e.target.checked,
            })} disabled={readOnly}/>
              <label_1.Label htmlFor="transferQuality">Transfer quality approved</label_1.Label>
            </div>

            <div className="rounded-lg bg-orange-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <lucide_react_1.AlertCircle className="h-4 w-4"/>
                Heat Press Guidelines
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Polyester: 200°C, 45 seconds, Medium pressure</li>
                <li>• Poly-blends: 190°C, 50 seconds, Medium pressure</li>
                <li>• Always use protective paper</li>
                <li>• Remove transfer paper while hot</li>
              </ul>
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep("quality")}>
                Transfer Complete
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === "quality" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Eye className="h-5 w-5"/>
              Quality Control
            </card_1.CardTitle>
            <card_1.CardDescription>
              Final quality assessment and approval
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="colorFastness" checked={data.quality_control.color_fastness_test} onChange={e => updateData("quality_control", {
                color_fastness_test: e.target.checked,
            })} disabled={readOnly}/>
                <label_1.Label htmlFor="colorFastness">
                  Color fastness test completed
                </label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="washDurability" checked={data.quality_control.wash_durability_test} onChange={e => updateData("quality_control", {
                wash_durability_test: e.target.checked,
            })} disabled={readOnly}/>
                <label_1.Label htmlFor="washDurability">
                  Wash durability test completed
                </label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="handFeel" checked={data.quality_control.hand_feel_assessment} onChange={e => updateData("quality_control", {
                hand_feel_assessment: e.target.checked,
            })} disabled={readOnly}/>
                <label_1.Label htmlFor="handFeel">Hand feel assessment completed</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="finalApproval" checked={data.quality_control.final_approval} onChange={e => updateData("quality_control", {
                final_approval: e.target.checked,
            })} disabled={readOnly}/>
                <label_1.Label htmlFor="finalApproval">Final quality approval</label_1.Label>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Quality Control Notes</label_1.Label>
              <textarea_1.Textarea value={data.quality_control.notes} onChange={e => updateData("quality_control", { notes: e.target.value })} placeholder="Record any quality observations, issues, or special notes..." rows={4} readOnly={readOnly}/>
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

            {!readOnly && data.quality_control.final_approval && (<button_1.Button className="w-full bg-green-600 hover:bg-green-700">
                <lucide_react_1.CheckCircle className="mr-2 h-4 w-4"/>
                Complete Sublimation Run
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
