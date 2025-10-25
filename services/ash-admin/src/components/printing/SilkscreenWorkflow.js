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
exports.default = SilkscreenWorkflow;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const lucide_react_1 = require("lucide-react");
function SilkscreenWorkflow({ runId, onUpdate, readOnly = false, }) {
    const [activeStep, setActiveStep] = (0, react_1.useState)("prep");
    const [data, setData] = (0, react_1.useState)({
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
    const updateData = (section, updates) => {
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
    const updateColor = (index, field, value) => {
        const updatedColors = [...data.ink_setup.colors];
        updatedColors[index] = { ...updatedColors[index], [field]: value };
        updateData("ink_setup", { colors: updatedColors });
    };
    const getStepStatus = (step) => {
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
        { key: "prep", title: "Screen Prep", icon: lucide_react_1.Palette },
        { key: "setup", title: "Ink Setup", icon: lucide_react_1.Droplet },
        { key: "print", title: "Printing", icon: lucide_react_1.Eye },
        { key: "cure", title: "Curing", icon: lucide_react_1.Thermometer },
    ];
    return (<div className="space-y-6">
      {/* Ashley AI Recommendations */}
      <card_1.Card className="border-l-4 border-l-blue-500">
        <card_1.CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-2">
              <lucide_react_1.AlertCircle className="h-5 w-5 text-blue-600"/>
            </div>
            <div>
              <card_1.CardTitle className="text-lg">Ashley AI Optimization</card_1.CardTitle>
              <card_1.CardDescription>
                Smart recommendations for this silkscreen run
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
      {activeStep === "prep" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Palette className="h-5 w-5"/>
              Screen Preparation
            </card_1.CardTitle>
            <card_1.CardDescription>
              Prepare screens with proper mesh and emulsion
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Screen ID</label_1.Label>
                <input_1.Input value={data.screen_prep.screen_id} onChange={e => updateData("screen_prep", { screen_id: e.target.value })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Mesh Count</label_1.Label>
                <select_1.Select value={data.screen_prep.mesh_count.toString()} onValueChange={value => updateData("screen_prep", { mesh_count: parseInt(value) })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="110">110 (Coarse)</select_1.SelectItem>
                    <select_1.SelectItem value="160">160 (Standard)</select_1.SelectItem>
                    <select_1.SelectItem value="200">200 (Fine)</select_1.SelectItem>
                    <select_1.SelectItem value="305">305 (Ultra Fine)</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Emulsion Batch</label_1.Label>
                <input_1.Input value={data.screen_prep.emulsion_batch} onChange={e => updateData("screen_prep", {
                emulsion_batch: e.target.value,
            })} placeholder="EMB-20250101-001" readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Exposure Time (seconds)</label_1.Label>
                <input_1.Input type="number" value={data.screen_prep.exposure_seconds} onChange={e => updateData("screen_prep", {
                exposure_seconds: parseInt(e.target.value),
            })} readOnly={readOnly}/>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Registration Notes</label_1.Label>
              <textarea_1.Textarea value={data.screen_prep.registration_notes} onChange={e => updateData("screen_prep", {
                registration_notes: e.target.value,
            })} placeholder="Record registration marks, alignment notes..." readOnly={readOnly}/>
            </div>

            <div className="space-y-2">
              <label_1.Label>Screen Status</label_1.Label>
              <select_1.Select value={data.screen_prep.status} onValueChange={value => updateData("screen_prep", { status: value })} disabled={readOnly}>
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

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep("setup")}>
                Complete Screen Prep
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === "setup" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Droplet className="h-5 w-5"/>
              Ink Setup
            </card_1.CardTitle>
            <card_1.CardDescription>
              Configure inks, colors, and printing parameters
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label>Ink Type</label_1.Label>
                <select_1.Select value={data.ink_setup.ink_type} onValueChange={value => updateData("ink_setup", { ink_type: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="PLASTISOL">Plastisol</select_1.SelectItem>
                    <select_1.SelectItem value="WATER">Water-based</select_1.SelectItem>
                    <select_1.SelectItem value="PUFF">Puff/Foam</select_1.SelectItem>
                    <select_1.SelectItem value="ANTI_MIGRATION">
                      Anti-migration
                    </select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label>Coats</label_1.Label>
                <input_1.Input type="number" min="1" max="3" value={data.ink_setup.coats} onChange={e => updateData("ink_setup", { coats: parseInt(e.target.value) })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Squeegee Durometer</label_1.Label>
                <select_1.Select value={data.ink_setup.squeegee_durometer.toString()} onValueChange={value => updateData("ink_setup", {
                squeegee_durometer: parseInt(value),
            })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="60">60 Shore (Soft)</select_1.SelectItem>
                    <select_1.SelectItem value="70">70 Shore (Medium)</select_1.SelectItem>
                    <select_1.SelectItem value="80">80 Shore (Hard)</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label_1.Label className="text-lg">Colors</label_1.Label>
                {!readOnly && (<button_1.Button size="sm" variant="outline" onClick={addColor}>
                    Add Color
                  </button_1.Button>)}
              </div>

              {data.ink_setup.colors.map((color, index) => (<div key={index} className="grid grid-cols-4 gap-4 rounded-lg border p-4">
                  <div className="space-y-2">
                    <label_1.Label>Color Name</label_1.Label>
                    <input_1.Input value={color.name} onChange={e => updateColor(index, "name", e.target.value)} placeholder="Black" readOnly={readOnly}/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Pantone</label_1.Label>
                    <input_1.Input value={color.pantone} onChange={e => updateColor(index, "pantone", e.target.value)} placeholder="19-0303" readOnly={readOnly}/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Station Location</label_1.Label>
                    <input_1.Input value={color.location} onChange={e => updateColor(index, "location", e.target.value)} placeholder="Station 1" readOnly={readOnly}/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Est. Grams</label_1.Label>
                    <input_1.Input type="number" step="0.1" value={color.estimated_grams} onChange={e => updateColor(index, "estimated_grams", parseFloat(e.target.value))} readOnly={readOnly}/>
                  </div>
                </div>))}
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep("print")}>
                Complete Ink Setup
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === "print" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Eye className="h-5 w-5"/>
              Printing Process
            </card_1.CardTitle>
            <card_1.CardDescription>
              Monitor printing quality and registration
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label>Test Prints</label_1.Label>
                <input_1.Input type="number" min="0" value={data.printing.test_prints} onChange={e => updateData("printing", {
                test_prints: parseInt(e.target.value),
            })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Registration Check Interval</label_1.Label>
                <input_1.Input type="number" value={data.printing.registration_check_interval} onChange={e => updateData("printing", {
                registration_check_interval: parseInt(e.target.value),
            })} readOnly={readOnly}/>
                <p className="text-xs text-muted-foreground">
                  Check every X pieces
                </p>
              </div>
              <div className="space-y-2">
                <label_1.Label>Stroke Speed</label_1.Label>
                <select_1.Select value={data.printing.stroke_speed} onValueChange={value => updateData("printing", { stroke_speed: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="SLOW">Slow</select_1.SelectItem>
                    <select_1.SelectItem value="MEDIUM">Medium</select_1.SelectItem>
                    <select_1.SelectItem value="FAST">Fast</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="approved" checked={data.printing.approved_print} onChange={e => updateData("printing", { approved_print: e.target.checked })} disabled={readOnly}/>
              <label_1.Label htmlFor="approved">Approved test print</label_1.Label>
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

            {!readOnly && (<div className="flex gap-2">
                <button_1.Button variant="outline" className="flex-1">
                  <lucide_react_1.Camera className="mr-2 h-4 w-4"/>
                  Photo Test Print
                </button_1.Button>
                <button_1.Button className="flex-1" onClick={() => setActiveStep("cure")}>
                  Start Curing
                </button_1.Button>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === "cure" && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Thermometer className="h-5 w-5"/>
              Curing Process
            </card_1.CardTitle>
            <card_1.CardDescription>
              Set proper curing temperature and time
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label>Dryer Temperature (°C)</label_1.Label>
                <input_1.Input type="number" min="120" max="200" value={data.curing.dryer_temp} onChange={e => updateData("curing", {
                dryer_temp: parseInt(e.target.value),
            })} readOnly={readOnly}/>
                <p className="text-xs text-muted-foreground">
                  Recommended: {data.ashley_recommendations.optimal_temperature}
                  °C
                </p>
              </div>
              <div className="space-y-2">
                <label_1.Label>Belt Speed</label_1.Label>
                <select_1.Select value={data.curing.belt_speed} onValueChange={value => updateData("curing", { belt_speed: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="SLOW">Slow (2-3 m/min)</select_1.SelectItem>
                    <select_1.SelectItem value="MEDIUM">Medium (4-5 m/min)</select_1.SelectItem>
                    <select_1.SelectItem value="FAST">Fast (6+ m/min)</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label>Cure Time (seconds)</label_1.Label>
                <input_1.Input type="number" min="30" max="120" value={data.curing.cure_time} onChange={e => updateData("curing", {
                cure_time: parseInt(e.target.value),
            })} readOnly={readOnly}/>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="washTest" checked={data.curing.wash_test_completed} onChange={e => updateData("curing", {
                wash_test_completed: e.target.checked,
            })} disabled={readOnly}/>
              <label_1.Label htmlFor="washTest">Wash test completed</label_1.Label>
            </div>

            <div className="rounded-lg bg-orange-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <lucide_react_1.AlertCircle className="h-4 w-4"/>
                Curing Guidelines
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Plastisol: 160°C for 45+ seconds</li>
                <li>• Water-based: 140°C for 60+ seconds</li>
                <li>• Always perform wash test on sample</li>
                <li>• Monitor for proper adhesion and no cracking</li>
              </ul>
            </div>

            {!readOnly && data.curing.wash_test_completed && (<button_1.Button className="w-full bg-green-600 hover:bg-green-700">
                <lucide_react_1.CheckCircle className="mr-2 h-4 w-4"/>
                Complete Silkscreen Run
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
