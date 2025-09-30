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
exports.default = EmbroideryWorkflow;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
function EmbroideryWorkflow({ runId, onUpdate, readOnly = false }) {
    const [activeStep, setActiveStep] = (0, react_1.useState)('design');
    const [data, setData] = (0, react_1.useState)({
        design_setup: {
            design_file: 'logo_design_v1.dst',
            dst_file_path: '/designs/logo_v1.dst',
            stitch_count: 5420,
            design_dimensions: {
                width_mm: 80,
                height_mm: 60
            },
            thread_colors: [
                { sequence: 1, color_name: 'Navy Blue', color_code: '#1E3A8A', thread_weight: '40wt', estimated_consumption_m: 12 },
                { sequence: 2, color_name: 'Gold', color_code: '#FCD34D', thread_weight: '40wt', estimated_consumption_m: 8 }
            ],
            status: 'pending'
        },
        machine_setup: {
            machine_id: 'EMB001',
            hoop_size: '100x100mm',
            stabilizer_type: 'CUTAWAY',
            stabilizer_weight: '75gsm',
            needle_type: 'Universal 75/11',
            thread_tension: 3,
            machine_speed_spm: 800
        },
        production: {
            pieces_completed: 0,
            thread_breaks: 0,
            needle_breaks: 0,
            registration_checks: 0,
            actual_runtime_minutes: 0,
            machine_stops: []
        },
        quality_control: {
            stitch_quality_check: false,
            thread_tension_ok: false,
            registration_accuracy: false,
            fabric_puckering_check: false,
            color_match_approved: false,
            final_approval: false,
            notes: ''
        },
        ashley_recommendations: {
            optimal_speed_spm: 750,
            thread_consumption_estimate: 25,
            runtime_prediction_minutes: 45,
            quality_score: 94
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
    const addThreadColor = () => {
        const newColor = {
            sequence: data.design_setup.thread_colors.length + 1,
            color_name: '',
            color_code: '#000000',
            thread_weight: '40wt',
            estimated_consumption_m: 5
        };
        updateData('design_setup', {
            thread_colors: [...data.design_setup.thread_colors, newColor]
        });
    };
    const updateThreadColor = (index, field, value) => {
        const updatedColors = [...data.design_setup.thread_colors];
        updatedColors[index] = { ...updatedColors[index], [field]: value };
        updateData('design_setup', { thread_colors: updatedColors });
    };
    const removeThreadColor = (index) => {
        const updatedColors = data.design_setup.thread_colors.filter((_, i) => i !== index);
        // Resequence the remaining colors
        const resequencedColors = updatedColors.map((color, i) => ({ ...color, sequence: i + 1 }));
        updateData('design_setup', { thread_colors: resequencedColors });
    };
    const addMachineStop = () => {
        const newStop = {
            reason: '',
            duration_minutes: 0,
            resolved: false
        };
        updateData('production', {
            machine_stops: [...data.production.machine_stops, newStop]
        });
    };
    const updateMachineStop = (index, field, value) => {
        const updatedStops = [...data.production.machine_stops];
        updatedStops[index] = { ...updatedStops[index], [field]: value };
        updateData('production', { machine_stops: updatedStops });
    };
    const getStepStatus = (step) => {
        switch (step) {
            case 'design_setup':
                return data.design_setup.status;
            case 'machine_setup':
                return data.machine_setup.machine_id && data.machine_setup.stabilizer_type ? 'complete' : 'pending';
            case 'production':
                return data.production.pieces_completed > 0 ? 'complete' : 'pending';
            case 'quality_control':
                return data.quality_control.final_approval ? 'complete' : 'pending';
            default:
                return 'pending';
        }
    };
    const steps = [
        { key: 'design', title: 'Design Setup', icon: lucide_react_1.Palette },
        { key: 'setup', title: 'Machine Setup', icon: lucide_react_1.Settings },
        { key: 'production', title: 'Production', icon: lucide_react_1.Shirt },
        { key: 'quality', title: 'Quality Control', icon: lucide_react_1.Eye }
    ];
    const calculateEfficiency = () => {
        if (data.ashley_recommendations.runtime_prediction_minutes === 0)
            return 0;
        return Math.round((data.ashley_recommendations.runtime_prediction_minutes / Math.max(data.production.actual_runtime_minutes, 1)) * 100);
    };
    return (<div className="space-y-6">
      {/* Ashley AI Recommendations */}
      <card_1.Card className="border-l-4 border-l-green-500">
        <card_1.CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-full">
              <lucide_react_1.Shirt className="w-5 h-5 text-green-600"/>
            </div>
            <div>
              <card_1.CardTitle className="text-lg">Ashley AI Embroidery Optimization</card_1.CardTitle>
              <card_1.CardDescription>Smart recommendations for embroidery production</card_1.CardDescription>
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
              <div className="text-2xl font-bold text-blue-600">{data.ashley_recommendations.optimal_speed_spm}</div>
              <p className="text-sm text-muted-foreground">Optimal SPM</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.ashley_recommendations.runtime_prediction_minutes}m</div>
              <p className="text-sm text-muted-foreground">Estimated Runtime</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{data.ashley_recommendations.thread_consumption_estimate}m</div>
              <p className="text-sm text-muted-foreground">Thread Needed</p>
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
      {activeStep === 'design' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Palette className="w-5 h-5"/>
              Design Setup
            </card_1.CardTitle>
            <card_1.CardDescription>Configure embroidery design and thread specifications</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Design File Name</label_1.Label>
                <input_1.Input value={data.design_setup.design_file} onChange={(e) => updateData('design_setup', { design_file: e.target.value })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>DST File Path</label_1.Label>
                <input_1.Input value={data.design_setup.dst_file_path} onChange={(e) => updateData('design_setup', { dst_file_path: e.target.value })} readOnly={readOnly}/>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label>Stitch Count</label_1.Label>
                <input_1.Input type="number" min="0" value={data.design_setup.stitch_count} onChange={(e) => updateData('design_setup', { stitch_count: parseInt(e.target.value) || 0 })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Width (mm)</label_1.Label>
                <input_1.Input type="number" min="0" value={data.design_setup.design_dimensions.width_mm} onChange={(e) => updateData('design_setup', {
                design_dimensions: {
                    ...data.design_setup.design_dimensions,
                    width_mm: parseInt(e.target.value) || 0
                }
            })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Height (mm)</label_1.Label>
                <input_1.Input type="number" min="0" value={data.design_setup.design_dimensions.height_mm} onChange={(e) => updateData('design_setup', {
                design_dimensions: {
                    ...data.design_setup.design_dimensions,
                    height_mm: parseInt(e.target.value) || 0
                }
            })} readOnly={readOnly}/>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label_1.Label className="text-lg">Thread Colors</label_1.Label>
                {!readOnly && (<button_1.Button size="sm" variant="outline" onClick={addThreadColor}>
                    <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                    Add Color
                  </button_1.Button>)}
              </div>

              {data.design_setup.thread_colors.map((color, index) => (<div key={index} className="grid grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <label_1.Label>Sequence</label_1.Label>
                    <input_1.Input type="number" min="1" value={color.sequence} onChange={(e) => updateThreadColor(index, 'sequence', parseInt(e.target.value) || 1)} readOnly={readOnly}/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Color Name</label_1.Label>
                    <input_1.Input value={color.color_name} onChange={(e) => updateThreadColor(index, 'color_name', e.target.value)} placeholder="Navy Blue" readOnly={readOnly}/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Color Code</label_1.Label>
                    <div className="flex items-center gap-2">
                      <input_1.Input type="color" value={color.color_code} onChange={(e) => updateThreadColor(index, 'color_code', e.target.value)} className="w-12 h-8 p-0 border" disabled={readOnly}/>
                      <input_1.Input value={color.color_code} onChange={(e) => updateThreadColor(index, 'color_code', e.target.value)} className="flex-1" readOnly={readOnly}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Weight</label_1.Label>
                    <select_1.Select value={color.thread_weight} onValueChange={(value) => updateThreadColor(index, 'thread_weight', value)} disabled={readOnly}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="30wt">30wt</select_1.SelectItem>
                        <select_1.SelectItem value="40wt">40wt</select_1.SelectItem>
                        <select_1.SelectItem value="60wt">60wt</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Est. Consumption (m)</label_1.Label>
                    <input_1.Input type="number" step="0.1" min="0" value={color.estimated_consumption_m} onChange={(e) => updateThreadColor(index, 'estimated_consumption_m', parseFloat(e.target.value) || 0)} readOnly={readOnly}/>
                  </div>
                  <div className="flex items-end">
                    {!readOnly && (<button_1.Button size="sm" variant="destructive" onClick={() => removeThreadColor(index)}>
                        <lucide_react_1.Trash2 className="w-4 h-4"/>
                      </button_1.Button>)}
                  </div>
                </div>))}
            </div>

            <div className="space-y-2">
              <label_1.Label>Design Status</label_1.Label>
              <select_1.Select value={data.design_setup.status} onValueChange={(value) => updateData('design_setup', { status: value })} disabled={readOnly}>
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

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep('setup')}>
                Setup Machine
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === 'setup' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Settings className="w-5 h-5"/>
              Machine Setup
            </card_1.CardTitle>
            <card_1.CardDescription>Configure machine parameters and materials</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Machine ID</label_1.Label>
                <select_1.Select value={data.machine_setup.machine_id} onValueChange={(value) => updateData('machine_setup', { machine_id: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select machine"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="EMB001">Tajima 16-Head (EMB001)</select_1.SelectItem>
                    <select_1.SelectItem value="EMB002">Brother 10-Head (EMB002)</select_1.SelectItem>
                    <select_1.SelectItem value="EMB003">Barudan 15-Head (EMB003)</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label>Hoop Size</label_1.Label>
                <select_1.Select value={data.machine_setup.hoop_size} onValueChange={(value) => updateData('machine_setup', { hoop_size: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="50x50mm">50x50mm</select_1.SelectItem>
                    <select_1.SelectItem value="100x100mm">100x100mm</select_1.SelectItem>
                    <select_1.SelectItem value="150x150mm">150x150mm</select_1.SelectItem>
                    <select_1.SelectItem value="200x200mm">200x200mm</select_1.SelectItem>
                    <select_1.SelectItem value="360x200mm">360x200mm (Cap)</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label_1.Label>Stabilizer Type</label_1.Label>
                <select_1.Select value={data.machine_setup.stabilizer_type} onValueChange={(value) => updateData('machine_setup', { stabilizer_type: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="CUTAWAY">Cut-away</select_1.SelectItem>
                    <select_1.SelectItem value="TEARAWAY">Tear-away</select_1.SelectItem>
                    <select_1.SelectItem value="WASHAWAY">Wash-away</select_1.SelectItem>
                    <select_1.SelectItem value="FUSIBLE">Fusible</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label>Stabilizer Weight</label_1.Label>
                <select_1.Select value={data.machine_setup.stabilizer_weight} onValueChange={(value) => updateData('machine_setup', { stabilizer_weight: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="50gsm">50gsm (Light)</select_1.SelectItem>
                    <select_1.SelectItem value="75gsm">75gsm (Medium)</select_1.SelectItem>
                    <select_1.SelectItem value="100gsm">100gsm (Heavy)</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label>Needle Type</label_1.Label>
                <select_1.Select value={data.machine_setup.needle_type} onValueChange={(value) => updateData('machine_setup', { needle_type: value })} disabled={readOnly}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="Universal 75/11">Universal 75/11</select_1.SelectItem>
                    <select_1.SelectItem value="Universal 90/14">Universal 90/14</select_1.SelectItem>
                    <select_1.SelectItem value="Ballpoint 75/11">Ballpoint 75/11</select_1.SelectItem>
                    <select_1.SelectItem value="Sharp 75/11">Sharp 75/11</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Thread Tension</label_1.Label>
                <div className="flex items-center gap-4">
                  <input_1.Input type="range" min="1" max="5" step="0.1" value={data.machine_setup.thread_tension} onChange={(e) => updateData('machine_setup', { thread_tension: parseFloat(e.target.value) })} className="flex-1" disabled={readOnly}/>
                  <span className="text-sm font-medium w-12">{data.machine_setup.thread_tension}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label_1.Label>Machine Speed (SPM)</label_1.Label>
                <input_1.Input type="number" min="400" max="1200" step="50" value={data.machine_setup.machine_speed_spm} onChange={(e) => updateData('machine_setup', { machine_speed_spm: parseInt(e.target.value) || 800 })} readOnly={readOnly}/>
                <p className="text-xs text-muted-foreground">
                  Recommended: {data.ashley_recommendations.optimal_speed_spm} SPM
                </p>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">Setup Guidelines:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use cut-away stabilizer for knits and stretchy fabrics</li>
                <li>• Adjust thread tension based on thread weight and fabric</li>
                <li>• Start with slower speeds for complex designs</li>
                <li>• Ensure proper hoop tension - firm but not distorting fabric</li>
              </ul>
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep('production')}>
                Start Production
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {activeStep === 'production' && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Shirt className="w-5 h-5"/>
              Production Monitoring
            </card_1.CardTitle>
            <card_1.CardDescription>Track embroidery production progress</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label_1.Label>Pieces Completed</label_1.Label>
                <input_1.Input type="number" min="0" value={data.production.pieces_completed} onChange={(e) => updateData('production', { pieces_completed: parseInt(e.target.value) || 0 })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Thread Breaks</label_1.Label>
                <input_1.Input type="number" min="0" value={data.production.thread_breaks} onChange={(e) => updateData('production', { thread_breaks: parseInt(e.target.value) || 0 })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Needle Breaks</label_1.Label>
                <input_1.Input type="number" min="0" value={data.production.needle_breaks} onChange={(e) => updateData('production', { needle_breaks: parseInt(e.target.value) || 0 })} readOnly={readOnly}/>
              </div>
              <div className="space-y-2">
                <label_1.Label>Runtime (minutes)</label_1.Label>
                <input_1.Input type="number" min="0" value={data.production.actual_runtime_minutes} onChange={(e) => updateData('production', { actual_runtime_minutes: parseInt(e.target.value) || 0 })} readOnly={readOnly}/>
              </div>
            </div>

            {/* Efficiency Indicator */}
            {data.production.actual_runtime_minutes > 0 && (<div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Production Efficiency</span>
                  <span className="text-lg font-bold">{calculateEfficiency()}%</span>
                </div>
                <progress_1.Progress value={calculateEfficiency()}/>
                <p className="text-sm text-muted-foreground mt-1">
                  Predicted: {data.ashley_recommendations.runtime_prediction_minutes}m | Actual: {data.production.actual_runtime_minutes}m
                </p>
              </div>)}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label_1.Label className="text-lg">Machine Stops</label_1.Label>
                {!readOnly && (<button_1.Button size="sm" variant="outline" onClick={addMachineStop}>
                    <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                    Add Stop
                  </button_1.Button>)}
              </div>

              {data.production.machine_stops.map((stop, index) => (<div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <label_1.Label>Reason</label_1.Label>
                    <select_1.Select value={stop.reason} onValueChange={(value) => updateMachineStop(index, 'reason', value)} disabled={readOnly}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Select reason"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="THREAD_BREAK">Thread Break</select_1.SelectItem>
                        <select_1.SelectItem value="NEEDLE_BREAK">Needle Break</select_1.SelectItem>
                        <select_1.SelectItem value="THREAD_CHANGE">Thread Change</select_1.SelectItem>
                        <select_1.SelectItem value="REGISTRATION_CHECK">Registration Check</select_1.SelectItem>
                        <select_1.SelectItem value="MACHINE_JAM">Machine Jam</select_1.SelectItem>
                        <select_1.SelectItem value="QUALITY_ISSUE">Quality Issue</select_1.SelectItem>
                        <select_1.SelectItem value="MAINTENANCE">Maintenance</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Duration (minutes)</label_1.Label>
                    <input_1.Input type="number" min="0" step="0.5" value={stop.duration_minutes} onChange={(e) => updateMachineStop(index, 'duration_minutes', parseFloat(e.target.value) || 0)} readOnly={readOnly}/>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id={`resolved-${index}`} checked={stop.resolved} onChange={(e) => updateMachineStop(index, 'resolved', e.target.checked)} disabled={readOnly}/>
                    <label_1.Label htmlFor={`resolved-${index}`}>Resolved</label_1.Label>
                  </div>
                  <div className="flex items-end">
                    {!readOnly && (<button_1.Button size="sm" variant="destructive" onClick={() => {
                        const updatedStops = data.production.machine_stops.filter((_, i) => i !== index);
                        updateData('production', { machine_stops: updatedStops });
                    }}>
                        <lucide_react_1.Trash2 className="w-4 h-4"/>
                      </button_1.Button>)}
                  </div>
                </div>))}

              {data.production.machine_stops.length === 0 && (<div className="text-center text-muted-foreground py-8">
                  <lucide_react_1.CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500"/>
                  <p>No machine stops recorded</p>
                </div>)}
            </div>

            {!readOnly && (<button_1.Button className="w-full" onClick={() => setActiveStep('quality')}>
                Production Complete
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
                <input type="checkbox" id="stitchQuality" checked={data.quality_control.stitch_quality_check} onChange={(e) => updateData('quality_control', { stitch_quality_check: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="stitchQuality">Stitch quality approved</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="threadTension" checked={data.quality_control.thread_tension_ok} onChange={(e) => updateData('quality_control', { thread_tension_ok: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="threadTension">Thread tension consistent</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="registration" checked={data.quality_control.registration_accuracy} onChange={(e) => updateData('quality_control', { registration_accuracy: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="registration">Registration accuracy approved</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="puckering" checked={data.quality_control.fabric_puckering_check} onChange={(e) => updateData('quality_control', { fabric_puckering_check: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="puckering">No fabric puckering</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="colorMatch" checked={data.quality_control.color_match_approved} onChange={(e) => updateData('quality_control', { color_match_approved: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="colorMatch">Color match approved</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="finalApproval" checked={data.quality_control.final_approval} onChange={(e) => updateData('quality_control', { final_approval: e.target.checked })} disabled={readOnly}/>
                <label_1.Label htmlFor="finalApproval">Final quality approval</label_1.Label>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Quality Control Notes</label_1.Label>
              <textarea_1.Textarea value={data.quality_control.notes} onChange={(e) => updateData('quality_control', { notes: e.target.value })} placeholder="Record quality observations, measurements, any issues..." rows={4} readOnly={readOnly}/>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">Embroidery Quality Standards:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Consistent stitch density and coverage</li>
                <li>✓ Proper thread tension without puckering</li>
                <li>✓ Accurate design placement and registration</li>
                <li>✓ Clean thread cuts and no loose ends</li>
                <li>✓ Colors match approved sample</li>
              </ul>
            </div>

            {!readOnly && data.quality_control.final_approval && (<button_1.Button className="w-full bg-green-600 hover:bg-green-700">
                <lucide_react_1.CheckCircle className="w-4 h-4 mr-2"/>
                Complete Embroidery Run
              </button_1.Button>)}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
