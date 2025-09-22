'use client';
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
exports.default = DTFWorkflow;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const lucide_react_1 = require("lucide-react");
function DTFWorkflow({ runId, onUpdate, readOnly = false }) {
    const [activeStep, setActiveStep] = (0, react_1.useState)('setup');
    const [data, setData] = (0, react_1.useState)({
        film_setup: {
            design_file: 'dtf_design_v1.pdf',
            film_type: 'PET_Film_75mic',
            print_resolution: 1440,
            color_profile: 'DTF_Standard',
            rip_software: 'AcroRIP',
            status: 'pending'
        },
        printing: {
            film_consumed_m2: 0,
            ink_usage_ml: [
                { color: 'White', amount: 0 },
                { color: 'Cyan', amount: 0 },
                { color: 'Magenta', amount: 0 },
                { color: 'Yellow', amount: 0 },
                { color: 'Black', amount: 0 }
            ],
            print_quality_check: false,
            color_density: 0,
            edge_definition: false
        },
        powder_application: {
            powder_type: 'Hot_Melt_TPU',
            application_method: 'AUTOMATIC',
            powder_consumed_g: 0,
            coverage_uniformity: false,
            excess_powder_recycled: false
        },
        curing: {
            temperature_c: 160,
            time_seconds: 60,
            conveyor_speed: 'MEDIUM',
            powder_adhesion_test: false,
            film_flexibility_test: false
        },
        transfer: {
            press_temperature_c: 160,
            press_time_seconds: 15,
            pressure: 'MEDIUM',
            peeling_method: 'COLD',
            transfer_quality: false
        },
        quality_control: {
            adhesion_test: false,
            stretch_test: false,
            wash_durability: false,
            final_approval: false,
            notes: ''
        },
        ashley_recommendations: {
            optimal_cure_temp: 165,
            powder_efficiency: 85,
            transfer_success_rate: 92,
            quality_score: 88
        }
    });
    const updateData = (section, updates) => {
        const newData = {
            ...data,
            [section]: { ...data[section], ...updates }
        };
        setData(newData);
        onUpdate?.(newData);
    };
    const updateInkUsage = (index, amount) => {
        const updatedInk = [...data.printing.ink_usage_ml];
        updatedInk[index].amount = amount;
        updateData('printing', { ink_usage_ml: updatedInk });
    };
    const getStepStatus = (step) => {
        switch (step) {
            case 'film_setup':
                return data.film_setup.status;
            case 'printing':
                return data.printing.print_quality_check ? 'complete' : 'pending';
            case 'powder_application':
                return data.powder_application.coverage_uniformity ? 'complete' : 'pending';
            case 'curing':
                return data.curing.powder_adhesion_test ? 'complete' : 'pending';
            case 'transfer':
                return data.transfer.transfer_quality ? 'complete' : 'pending';
            case 'quality_control':
                return data.quality_control.final_approval ? 'complete' : 'pending';
            default:
                return 'pending';
        }
    };
    const steps = [
        { key: 'setup', title: 'Film Setup', icon: lucide_react_1.Package2 },
        { key: 'print', title: 'Printing', icon: lucide_react_1.Printer },
        { key: 'powder', title: 'Powder', icon: lucide_react_1.Zap },
        { key: 'cure', title: 'Curing', icon: lucide_react_1.Thermometer },
        { key: 'transfer', title: 'Transfer', icon: lucide_react_1.Timer },
        { key: 'quality', title: 'Quality', icon: lucide_react_1.Eye }
    ];
    return (<div className="space-y-6">
      {/* Ashley AI Recommendations */}
      <card_1.Card className="border-l-4 border-l-blue-500">
        <card_1.CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <lucide_react_1.Package2 className="w-5 h-5 text-blue-600"/>
            </div>
            <div>
              <card_1.CardTitle className="text-lg">Ashley AI DTF Optimization</card_1.CardTitle>
              <card_1.CardDescription>Smart recommendations for Direct-to-Film printing</card_1.CardDescription>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.ashley_recommendations.quality_score}%</div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.ashley_recommendations.transfer_success_rate}%</div>
              <p className="text-sm text-muted-foreground">Transfer Success</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.ashley_recommendations.optimal_cure_temp}°C</div>
              <p className="text-sm text-muted-foreground">Optimal Cure</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{data.ashley_recommendations.powder_efficiency}%</div>
              <p className="text-sm text-muted-foreground">Powder Efficiency</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step) => {
            const status = getStepStatus(step.key);
            const StepIcon = step.icon;
            const isActive = activeStep === step.key;
            return (<button_1.Button key={step.key} variant={isActive ? 'default' : 'outline'} size="sm" onClick={() => setActiveStep(step.key)} className={`flex items-center gap-2 min-w-fit ${status === 'complete' ? 'border-green-500 text-green-700' : ''}`}>
              <StepIcon className="w-4 h-4"/>
              {step.title}
              {status === 'complete' && <lucide_react_1.CheckCircle className="w-4 h-4 text-green-600"/>}
            </button_1.Button>);
        })}
      </div>

      {/* Step Content */}
      {activeStep === 'setup' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Package2 className="w-5 h-5"/>
              DTF Film Setup
            </card_1.CardTitle>
            <card_1.CardDescription>Configure film type and print settings</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Design File</label_1.Label>
                <input_1.Input value={data.film_setup.design_file} onChange={(e) => updateData('film_setup', { design_file: e.target.value })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Film Type</label_1.Label>
                <select_1.Select value={data.film_setup.film_type} onValueChange={(value) => updateData('film_setup', { film_type: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="PET_Film_75mic">PET Film 75μm</select_1.SelectItem>
                    <select_1.SelectItem value="PET_Film_100mic">PET Film 100μm</select_1.SelectItem>
                    <select_1.SelectItem value="Cold_Peel_Film">Cold Peel Film</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Print Resolution (DPI)</label_1.Label>
                <select_1.Select value={data.film_setup.print_resolution.toString()} onValueChange={(value) => updateData('film_setup', { print_resolution: parseInt(value) })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="720">720 DPI</select_1.SelectItem>
                    <select_1.SelectItem value="1440">1440 DPI</select_1.SelectItem>
                    <select_1.SelectItem value="2880">2880 DPI</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label>Color Profile</label_1.Label>
                <select_1.Select value={data.film_setup.color_profile} onValueChange={(value) => updateData('film_setup', { color_profile: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="DTF_Standard">DTF Standard</select_1.SelectItem>
                    <select_1.SelectItem value="Epson_DTF">Epson DTF</select_1.SelectItem>
                    <select_1.SelectItem value="Custom_Profile">Custom Profile</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>RIP Software</label_1.Label>
              <select_1.Select value={data.film_setup.rip_software} onValueChange={(value) => updateData('film_setup', { rip_software: value })} disabled={readOnly}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="AcroRIP">AcroRIP</select_1.SelectItem>
                  <select_1.SelectItem value="PhotoPRINT">PhotoPRINT</select_1.SelectItem>
                  <select_1.SelectItem value="Wasatch">Wasatch</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Setup Status</label_1.Label>
              <select_1.Select value={data.film_setup.status} onValueChange={(value) => updateData('film_setup', { status: value })} disabled={readOnly}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="pending">Pending</select_1.SelectItem>
                  <select_1.SelectItem value="complete">Complete</select_1.SelectItem>
                  <select_1.SelectItem value="needs_adjustment">Needs Adjustment</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep('print')}>
                Start Film Printing
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === 'print' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Printer className="w-5 h-5"/>
              Film Printing
            </card_1.CardTitle>
            <card_1.CardDescription>Print design onto DTF film with white ink underbase</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Film Consumed (m²)</label_1.Label>
                <input_1.Input type="number" step="0.1" min="0" value={data.printing.film_consumed_m2} onChange={(e) => updateData('printing', { film_consumed_m2: parseFloat(e.target.value) || 0 })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Color Density (%)</label_1.Label>
                <input_1.Input type="number" min="0" max="100" value={data.printing.color_density} onChange={(e) => updateData('printing', { color_density: parseInt(e.target.value) || 0 })} readOnly={readOnly}/>
              </div>
            </div>

            <div className="space-y-4">
              <label_1.Label className="text-lg">Ink Consumption (ml)</label_1.Label>
              <div className="grid grid-cols-2 gap-4">
                {data.printing.ink_usage_ml.map((ink, index) => (<div key={index} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${ink.color === 'White' ? 'bg-white border-gray-300' :
                    ink.color === 'Cyan' ? 'bg-cyan-500' :
                        ink.color === 'Magenta' ? 'bg-pink-500' :
                            ink.color === 'Yellow' ? 'bg-yellow-500' : 'bg-gray-800'}`}/>
                    <label_1.Label className="w-16">{ink.color}</label_1.Label>
                    <input_1.Input type="number" step="0.1" min="0" value={ink.amount} onChange={(e) => updateInkUsage(index, parseFloat(e.target.value) || 0)} className="flex-1" readOnly={readOnly}/>
                    <span className="text-sm text-muted-foreground">ml</span>
                  </div>))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="printQuality" checked={data.printing.print_quality_check} onChange={(e) => updateData('printing', { print_quality_check: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="printQuality">Print quality approved</label_1.Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="edgeDefinition" checked={data.printing.edge_definition} onChange={(e) => updateData('printing', { edge_definition: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="edgeDefinition">Sharp edge definition</label_1.Label>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">DTF Print Checklist:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ White underbase complete and opaque</li>
                <li>✓ CMYK colors printed in correct order</li>
                <li>✓ No ink bleeding or smudging</li>
                <li>✓ Clean, sharp edges</li>
              </ul>
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep('powder')}>
                Ready for Powder Application
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === 'powder' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Zap className="w-5 h-5"/>
              Powder Application
            </card_1.CardTitle>
            <card_1.CardDescription>Apply hot melt adhesive powder</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Powder Type</label_1.Label>
                <select_1.Select value={data.powder_application.powder_type} onValueChange={(value) => updateData('powder_application', { powder_type: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="Hot_Melt_TPU">Hot Melt TPU</select_1.SelectItem>
                    <select_1.SelectItem value="Low_Temp_Powder">Low Temp Powder</select_1.SelectItem>
                    <select_1.SelectItem value="High_Opacity">High Opacity</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label>Application Method</label_1.Label>
                <select_1.Select value={data.powder_application.application_method} onValueChange={(value) => updateData('powder_application', { application_method: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="MANUAL">Manual Shaker</select_1.SelectItem>
                    <select_1.SelectItem value="AUTOMATIC">Automatic Applicator</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Powder Consumed (g)</label_1.Label>
              <input_1.Input type="number" step="1" min="0" value={data.powder_application.powder_consumed_g} onChange={(e) => updateData('powder_application', { powder_consumed_g: parseFloat(e.target.value) || 0 })} readOnly={readOnly}/>
              <p className="text-xs text-muted-foreground">
                Estimated: {data.ashley_recommendations.powder_efficiency}% efficiency
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="uniformCoverage" checked={data.powder_application.coverage_uniformity} onChange={(e) => updateData('powder_application', { coverage_uniformity: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="uniformCoverage">Uniform powder coverage</label_1.Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="recycledPowder" checked={data.powder_application.excess_powder_recycled} onChange={(e) => updateData('powder_application', { excess_powder_recycled: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="recycledPowder">Excess powder recycled</label_1.Label>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium mb-2">Powder Application Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Apply powder while ink is still tacky</li>
                <li>• Ensure even coverage across all print areas</li>
                <li>• Remove excess powder for recycling</li>
                <li>• Check for powder-free areas that may cause adhesion issues</li>
              </ul>
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep('cure')}>
                Ready for Curing
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === 'cure' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Thermometer className="w-5 h-5"/>
              Powder Curing
            </card_1.CardTitle>
            <card_1.CardDescription>Cure powder to create adhesive layer</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label>Temperature (°C)</label_1.Label>
                <input_1.Input type="number" min="140" max="180" value={data.curing.temperature_c} onChange={(e) => updateData('curing', { temperature_c: parseInt(e.target.value) })} readOnly={readOnly}/>
                <p className="text-xs text-muted-foreground">
                  Recommended: {data.ashley_recommendations.optimal_cure_temp}°C
                </p>
              </div>
              <div className="space-y-2">
                <label_1.Label>Time (seconds)</label_1.Label>
                <input_1.Input type="number" min="30" max="120" value={data.curing.time_seconds} onChange={(e) => updateData('curing', { time_seconds: parseInt(e.target.value) })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Conveyor Speed</label_1.Label>
                <select_1.Select value={data.curing.conveyor_speed} onValueChange={(value) => updateData('curing', { conveyor_speed: value })} disabled={readOnly}>
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

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="adhesionTest" checked={data.curing.powder_adhesion_test} onChange={(e) => updateData('curing', { powder_adhesion_test: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="adhesionTest">Powder adhesion test passed</label_1.Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="flexibilityTest" checked={data.curing.film_flexibility_test} onChange={(e) => updateData('curing', { film_flexibility_test: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="flexibilityTest">Film flexibility maintained</label_1.Label>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium mb-2">Curing Guidelines:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• TPU powder: 160-170°C for 60 seconds</li>
                <li>• Low-temp powder: 140-150°C for 45 seconds</li>
                <li>• Film should remain flexible after curing</li>
                <li>• Powder should be fully melted and adhesive</li>
              </ul>
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep('transfer')}>
                Ready for Transfer
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === 'transfer' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Timer className="w-5 h-5"/>
              Heat Press Transfer
            </card_1.CardTitle>
            <card_1.CardDescription>Transfer DTF print to garment</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Press Temperature (°C)</label_1.Label>
                <input_1.Input type="number" min="140" max="180" value={data.transfer.press_temperature_c} onChange={(e) => updateData('transfer', { press_temperature_c: parseInt(e.target.value) })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Press Time (seconds)</label_1.Label>
                <input_1.Input type="number" min="10" max="30" value={data.transfer.press_time_seconds} onChange={(e) => updateData('transfer', { press_time_seconds: parseInt(e.target.value) })} readOnly={readOnly}/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Pressure</label_1.Label>
                <select_1.Select value={data.transfer.pressure} onValueChange={(value) => updateData('transfer', { pressure: value })} disabled={readOnly}>
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
              <div className="space-y-2">
                <label_1.Label>Peeling Method</label_1.Label>
                <select_1.Select value={data.transfer.peeling_method} onValueChange={(value) => updateData('transfer', { peeling_method: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="HOT">Hot Peel</select_1.SelectItem>
                    <select_1.SelectItem value="COLD">Cold Peel</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="transferQuality" checked={data.transfer.transfer_quality} onChange={(e) => updateData('transfer', { transfer_quality: e.target.checked })} disabled={readOnly}/>
              <label_1.Label htmlFor="transferQuality">Transfer quality approved</label_1.Label>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">Transfer Guidelines:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cotton: 160°C, 15 seconds, Medium pressure</li>
                <li>• Polyester: 150°C, 12 seconds, Light pressure</li>
                <li>• Cold peel recommended for most DTF transfers</li>
                <li>• Apply even pressure across entire design</li>
              </ul>
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep('quality')}>
                Transfer Complete
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === 'quality' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Eye className="w-5 h-5"/>
              Quality Control
            </card_1.CardTitle>
            <card_1.CardDescription>Final quality assessment</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="adhesionTest" checked={data.quality_control.adhesion_test} onChange={(e) => updateData('quality_control', { adhesion_test: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="adhesionTest">Adhesion test passed</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="stretchTest" checked={data.quality_control.stretch_test} onChange={(e) => updateData('quality_control', { stretch_test: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="stretchTest">Stretch test passed</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="washDurability" checked={data.quality_control.wash_durability} onChange={(e) => updateData('quality_control', { wash_durability: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="washDurability">Wash durability test passed</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="finalApproval" checked={data.quality_control.final_approval} onChange={(e) => updateData('quality_control', { final_approval: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="finalApproval">Final quality approval</label_1.Label>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Quality Control Notes</label_1.Label>
              <textarea_1.Textarea value={data.quality_control.notes} onChange={(e) => updateData('quality_control', { notes: e.target.value })} placeholder="Record quality observations, tests performed, any issues..." rows={4} readOnly={readOnly}/>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">DTF Quality Standards:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Strong adhesion to fabric</li>
                <li>✓ Good stretch and recovery</li>
                <li>✓ Vibrant, accurate colors</li>
                <li>✓ No cracking or peeling</li>
                <li>✓ Soft hand feel</li>
              </ul>
            </div>

            {!readOnly && data.quality_control.final_approval && (<button_1.Button className="w-full bg-green-600 hover:bg-green-700">
                <lucide_react_1.CheckCircle className="w-4 h-4 mr-2"/>
                Complete DTF Run
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
