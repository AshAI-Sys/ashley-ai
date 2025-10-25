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
exports.default = QualityControl;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const textarea_1 = require("@/components/ui/textarea");
const badge_1 = require("@/components/ui/badge");
const dialog_1 = require("@/components/ui/dialog");
const tabs_1 = require("@/components/ui/tabs");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const defectCodes = {
    SILKSCREEN: [
        { code: "MISALIGNMENT", name: "Misalignment", severity: "MAJOR" },
        { code: "INK_BLEED", name: "Ink Bleeding", severity: "MINOR" },
        { code: "UNDER_CURE", name: "Under Cured", severity: "CRITICAL" },
        { code: "OVER_CURE", name: "Over Cured", severity: "MAJOR" },
        { code: "PINHOLES", name: "Pin Holes", severity: "MINOR" },
        { code: "GHOSTING", name: "Ghost Image", severity: "MAJOR" },
        { code: "INCOMPLETE", name: "Incomplete Print", severity: "CRITICAL" },
        { code: "COLOR_OFF", name: "Color Off", severity: "MAJOR" },
    ],
    SUBLIMATION: [
        { code: "COLOR_SHIFT", name: "Color Shift", severity: "MAJOR" },
        { code: "GHOSTING", name: "Ghost Lines", severity: "MINOR" },
        { code: "POOR_TRANSFER", name: "Poor Transfer", severity: "CRITICAL" },
        { code: "BLURRY", name: "Blurry Image", severity: "MAJOR" },
        { code: "INCOMPLETE", name: "Incomplete Transfer", severity: "CRITICAL" },
        { code: "FADE_UNEVEN", name: "Uneven Fade", severity: "MINOR" },
        { code: "REGISTRATION", name: "Registration Off", severity: "MAJOR" },
    ],
    DTF: [
        { code: "POOR_ADHESION", name: "Poor Adhesion", severity: "CRITICAL" },
        { code: "POWDER_CLUMPS", name: "Powder Clumps", severity: "MINOR" },
        { code: "FILM_TEAR", name: "Film Tear", severity: "MAJOR" },
        { code: "INK_SMUDGE", name: "Ink Smudge", severity: "MINOR" },
        { code: "INCOMPLETE", name: "Incomplete Print", severity: "CRITICAL" },
        { code: "EDGE_LIFT", name: "Edge Lifting", severity: "MAJOR" },
        { code: "COLOR_OFF", name: "Color Mismatch", severity: "MAJOR" },
    ],
    EMBROIDERY: [
        { code: "THREAD_BREAK", name: "Thread Break", severity: "MINOR" },
        { code: "PUCKERING", name: "Fabric Puckering", severity: "MAJOR" },
        { code: "REGISTRATION", name: "Poor Registration", severity: "MAJOR" },
        { code: "LOOSE_STITCHES", name: "Loose Stitches", severity: "MINOR" },
        { code: "SKIP_STITCHES", name: "Skip Stitches", severity: "MAJOR" },
        { code: "WRONG_COLOR", name: "Wrong Thread Color", severity: "CRITICAL" },
        { code: "INCOMPLETE", name: "Incomplete Design", severity: "CRITICAL" },
        { code: "TENSION_OFF", name: "Thread Tension Off", severity: "MINOR" },
    ],
};
const severityColors = {
    CRITICAL: "bg-red-100 text-red-800 border-red-200",
    MAJOR: "bg-orange-100 text-orange-800 border-orange-200",
    MINOR: "bg-yellow-100 text-yellow-800 border-yellow-200",
};
const attributionOptions = [
    { value: "SUPPLIER", label: "Supplier/Material" },
    { value: "STAFF", label: "Staff/Operator" },
    { value: "COMPANY", label: "Company/Process" },
    { value: "CLIENT", label: "Client/Design" },
];
function QualityControl({ runId, method, onUpdate, readOnly = false, }) {
    const [defects, setDefects] = (0, react_1.useState)([]);
    const [qualityMetrics, setQualityMetrics] = (0, react_1.useState)({
        total_produced: 0,
        total_good: 0,
        total_rejected: 0,
        quality_rate: 100,
        first_pass_yield: 100,
        defect_rate: 0,
    });
    const [showAddDefect, setShowAddDefect] = (0, react_1.useState)(false);
    const [newDefect, setNewDefect] = (0, react_1.useState)({
        reason_code: "",
        quantity: 1,
        cost_attribution: "COMPANY",
        description: "",
        location: "",
    });
    const [inspectionNotes, setInspectionNotes] = (0, react_1.useState)("");
    const [finalApproval, setFinalApproval] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        calculateMetrics();
    }, [defects]);
    const calculateMetrics = () => {
        const totalRejected = defects.reduce((sum, defect) => sum + defect.quantity, 0);
        const totalProduced = qualityMetrics.total_good + totalRejected;
        const qualityRate = totalProduced > 0
            ? (qualityMetrics.total_good / totalProduced) * 100
            : 100;
        const defectRate = totalProduced > 0 ? (totalRejected / totalProduced) * 100 : 0;
        setQualityMetrics(prev => ({
            ...prev,
            total_rejected: totalRejected,
            total_produced: totalProduced,
            quality_rate: Math.round(qualityRate * 100) / 100,
            defect_rate: Math.round(defectRate * 100) / 100,
            first_pass_yield: qualityRate, // Simplified for demo
        }));
    };
    const addDefect = () => {
        if (!newDefect.reason_code || !newDefect.quantity)
            return;
        const _defectCode = getDefectCodes().find(d => d.code === newDefect.reason_code);
        const defect = {
            id: Date.now().toString(),
            reason_code: newDefect.reason_code,
            quantity: newDefect.quantity,
            cost_attribution: newDefect.cost_attribution || "COMPANY",
            description: newDefect.description,
            location: newDefect.location,
        };
        setDefects([...defects, defect]);
        setNewDefect({
            reason_code: "",
            quantity: 1,
            cost_attribution: "COMPANY",
            description: "",
            location: "",
        });
        setShowAddDefect(false);
        onUpdate?.({ defects: [...defects, defect], metrics: qualityMetrics });
    };
    const removeDefect = (defectId) => {
        const updated = defects.filter(d => d.id !== defectId);
        setDefects(updated);
        onUpdate?.({ defects: updated, metrics: qualityMetrics });
    };
    const _updateDefect = (defectId, field, value) => {
        const updated = defects.map(d => d.id === defectId ? { ...d, [field]: value } : d);
        setDefects(updated);
        onUpdate?.({ defects: updated, metrics: qualityMetrics });
    };
    const getDefectCodes = () => {
        return defectCodes[method] || [];
    };
    const getDefectsBySeverity = () => {
        const defectCodeMap = getDefectCodes().reduce((map, code) => {
            map[code.code] = code;
            return map;
        }, {});
        return defects.reduce((acc, defect) => {
            const severity = defectCodeMap[defect.reason_code]?.severity || "MINOR";
            acc[severity] = (acc[severity] || 0) + defect.quantity;
            return acc;
        }, {});
    };
    const capturePhoto = (defectId) => {
        // In a real app, this would open camera or file picker
        console.log("Capture photo for defect:", defectId);
    };
    const getQualityStatus = () => {
        if (qualityMetrics.quality_rate >= 98)
            return {
                status: "excellent",
                color: "text-green-600",
                bg: "bg-green-50",
            };
        if (qualityMetrics.quality_rate >= 95)
            return { status: "good", color: "text-blue-600", bg: "bg-blue-50" };
        if (qualityMetrics.quality_rate >= 90)
            return {
                status: "acceptable",
                color: "text-yellow-600",
                bg: "bg-yellow-50",
            };
        return {
            status: "needs improvement",
            color: "text-red-600",
            bg: "bg-red-50",
        };
    };
    const qualityStatus = getQualityStatus();
    const defectsBySeverity = getDefectsBySeverity();
    return (<div className="space-y-6">
      {/* Quality Metrics Overview */}
      <card_1.Card className="border-l-4 border-l-blue-500">
        <card_1.CardHeader>
          <div className="flex items-center gap-2">
            <lucide_react_1.Target className="h-5 w-5 text-blue-600"/>
            <div>
              <card_1.CardTitle>Quality Metrics Summary</card_1.CardTitle>
              <card_1.CardDescription>
                Real-time quality tracking for {method} run
              </card_1.CardDescription>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {qualityMetrics.total_produced}
              </div>
              <p className="text-sm text-muted-foreground">Total Produced</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {qualityMetrics.total_good}
              </div>
              <p className="text-sm text-muted-foreground">Good Units</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {qualityMetrics.total_rejected}
              </div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${qualityStatus.bg}`}>
              <div className={`text-2xl font-bold ${qualityStatus.color}`}>
                {qualityMetrics.quality_rate}%
              </div>
              <p className="text-sm text-muted-foreground">Quality Rate</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quality Performance</span>
              <span className={`font-medium capitalize ${qualityStatus.color}`}>
                {qualityStatus.status}
              </span>
            </div>
            <progress_1.Progress value={qualityMetrics.quality_rate}/>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <tabs_1.Tabs defaultValue="defects" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="defects">Defect Tracking</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="inspection">Inspection</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="defects" className="space-y-4">
          {/* Defect Classification */}
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle>Defect Classification</card_1.CardTitle>
                {!readOnly && (<dialog_1.Dialog open={showAddDefect} onOpenChange={setShowAddDefect}>
                    <dialog_1.DialogTrigger asChild>
                      <button_1.Button size="sm">
                        <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                        Add Defect
                      </button_1.Button>
                    </dialog_1.DialogTrigger>
                    <dialog_1.DialogContent>
                      <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle>Record Quality Defect</dialog_1.DialogTitle>
                        <dialog_1.DialogDescription>
                          Document defects found during {method} printing
                        </dialog_1.DialogDescription>
                      </dialog_1.DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label_1.Label>Defect Type</label_1.Label>
                            <select_1.Select value={newDefect.reason_code} onValueChange={value => setNewDefect({
                ...newDefect,
                reason_code: value,
            })}>
                              <select_1.SelectTrigger>
                                <select_1.SelectValue placeholder="Select defect"/>
                              </select_1.SelectTrigger>
                              <select_1.SelectContent>
                                {getDefectCodes().map(defect => (<select_1.SelectItem key={defect.code} value={defect.code}>
                                    <div className="flex items-center gap-2">
                                      <badge_1.Badge className={severityColors[defect.severity]} variant="outline">
                                        {defect.severity}
                                      </badge_1.Badge>
                                      {defect.name}
                                    </div>
                                  </select_1.SelectItem>))}
                              </select_1.SelectContent>
                            </select_1.Select>
                          </div>
                          <div className="space-y-2">
                            <label_1.Label>Quantity</label_1.Label>
                            <input_1.Input type="number" min="1" value={newDefect.quantity} onChange={e => setNewDefect({
                ...newDefect,
                quantity: parseInt(e.target.value) || 1,
            })}/>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label_1.Label>Cost Attribution</label_1.Label>
                          <select_1.Select value={newDefect.cost_attribution} onValueChange={value => setNewDefect({
                ...newDefect,
                cost_attribution: value,
            })}>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                              {attributionOptions.map(option => (<select_1.SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </select_1.SelectItem>))}
                            </select_1.SelectContent>
                          </select_1.Select>
                        </div>

                        <div className="space-y-2">
                          <label_1.Label>Location (optional)</label_1.Label>
                          <input_1.Input value={newDefect.location} onChange={e => setNewDefect({
                ...newDefect,
                location: e.target.value,
            })} placeholder="e.g., Front chest, Left sleeve"/>
                        </div>

                        <div className="space-y-2">
                          <label_1.Label>Description</label_1.Label>
                          <textarea_1.Textarea value={newDefect.description} onChange={e => setNewDefect({
                ...newDefect,
                description: e.target.value,
            })} placeholder="Detailed description of the defect..." rows={3}/>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button_1.Button variant="outline" onClick={() => setShowAddDefect(false)}>
                            Cancel
                          </button_1.Button>
                          <button_1.Button onClick={addDefect} disabled={!newDefect.reason_code}>
                            Add Defect
                          </button_1.Button>
                        </div>
                      </div>
                    </dialog_1.DialogContent>
                  </dialog_1.Dialog>)}
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              {defects.length > 0 ? (<div className="space-y-3">
                  {defects.map(defect => {
                const defectInfo = getDefectCodes().find(d => d.code === defect.reason_code);
                return (<div key={defect.id} className="flex items-start justify-between rounded-lg border p-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <badge_1.Badge className={severityColors[defectInfo?.severity ||
                        "MINOR"]}>
                              {defectInfo?.severity || "MINOR"}
                            </badge_1.Badge>
                            <span className="font-medium">
                              {defectInfo?.name || defect.reason_code}
                            </span>
                            <badge_1.Badge variant="outline">
                              Qty: {defect.quantity}
                            </badge_1.Badge>
                          </div>

                          {defect.location && (<p className="mb-1 text-sm text-muted-foreground">
                              Location: {defect.location}
                            </p>)}

                          {defect.description && (<p className="mb-2 text-sm text-muted-foreground">
                              {defect.description}
                            </p>)}

                          <div className="flex items-center gap-2">
                            <badge_1.Badge variant="outline" className="text-xs">
                              {attributionOptions.find(a => a.value === defect.cost_attribution)?.label}
                            </badge_1.Badge>
                            {!readOnly && (<button_1.Button size="sm" variant="outline" onClick={() => capturePhoto(defect.id)}>
                                <lucide_react_1.Camera className="mr-1 h-3 w-3"/>
                                Photo
                              </button_1.Button>)}
                          </div>
                        </div>

                        {!readOnly && (<button_1.Button size="sm" variant="destructive" onClick={() => removeDefect(defect.id)}>
                            <lucide_react_1.Trash2 className="h-4 w-4"/>
                          </button_1.Button>)}
                      </div>);
            })}
                </div>) : (<div className="py-8 text-center">
                  <lucide_react_1.CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500"/>
                  <p className="text-muted-foreground">No defects recorded</p>
                  <p className="text-sm text-green-600">
                    Perfect quality run so far!
                  </p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="inspection" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Eye className="h-5 w-5"/>
                Quality Inspection
              </card_1.CardTitle>
              <card_1.CardDescription>
                Final inspection checklist and approval
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {/* Method-specific inspection checklist */}
              <MethodInspectionChecklist method={method}/>

              <div className="space-y-2">
                <label_1.Label>Inspector Notes</label_1.Label>
                <textarea_1.Textarea value={inspectionNotes} onChange={e => setInspectionNotes(e.target.value)} placeholder="Record inspection observations, measurements, and findings..." rows={4} readOnly={readOnly}/>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="finalApproval" checked={finalApproval} onChange={e => setFinalApproval(e.target.checked)} disabled={readOnly}/>
                <label_1.Label htmlFor="finalApproval" className="text-lg font-medium">
                  Final Quality Approval
                </label_1.Label>
              </div>

              {finalApproval && qualityMetrics.quality_rate >= 95 && (<div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <lucide_react_1.CheckCircle className="h-5 w-5"/>
                    <span className="font-medium">Quality Approved</span>
                  </div>
                  <p className="mt-1 text-sm text-green-700">
                    Run meets quality standards with{" "}
                    {qualityMetrics.quality_rate}% quality rate
                  </p>
                </div>)}

              {finalApproval && qualityMetrics.quality_rate < 95 && (<div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-2 text-orange-800">
                    <lucide_react_1.AlertTriangle className="h-5 w-5"/>
                    <span className="font-medium">Quality Review Required</span>
                  </div>
                  <p className="mt-1 text-sm text-orange-700">
                    Quality rate {qualityMetrics.quality_rate}% is below 95%
                    threshold
                  </p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.TrendingUp className="h-5 w-5"/>
                  Defect Analysis
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                {Object.entries(defectsBySeverity).length > 0 ? (<div className="space-y-3">
                    {Object.entries(defectsBySeverity).map(([severity, count]) => (<div key={severity} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <badge_1.Badge className={severityColors[severity]}>
                              {severity}
                            </badge_1.Badge>
                          </div>
                          <span className="font-bold">{count} units</span>
                        </div>))}
                  </div>) : (<p className="py-4 text-center text-muted-foreground">
                    No defects to analyze
                  </p>)}
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Quality Benchmarks</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Industry Standard</span>
                  <span className="font-bold">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Company Target</span>
                  <span className="font-bold">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current Achievement</span>
                  <span className={`font-bold ${qualityStatus.color}`}>
                    {qualityMetrics.quality_rate}%
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="text-sm text-muted-foreground">
                    First Pass Yield: {qualityMetrics.first_pass_yield}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Defect Rate: {qualityMetrics.defect_rate}%
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
function MethodInspectionChecklist({ method }) {
    const checklists = {
        SILKSCREEN: [
            "Registration accuracy within 1mm tolerance",
            "Ink coverage is uniform and complete",
            "No bleeding or ink contamination",
            "Proper cure - no ink transfer when scratched",
            "Color matches approved sample",
            "No pinholes or screen marks",
        ],
        SUBLIMATION: [
            "Color vibrancy and accuracy",
            "No ghosting or double images",
            "Complete transfer with no fade areas",
            "Sharp edge definition",
            "Proper adhesion to fabric",
            "No paper residue or marks",
        ],
        DTF: [
            "Strong adhesion to fabric",
            "No peeling at edges",
            "Color accuracy and vibrancy",
            "Complete powder coverage",
            "Proper film removal",
            "Soft hand feel after application",
        ],
        EMBROIDERY: [
            "Stitch density and consistency",
            "Proper thread tension",
            "Accurate design placement",
            "No fabric puckering",
            "Clean thread cuts",
            "Color accuracy per specification",
        ],
    };
    const methodChecklist = checklists[method] || [];
    return (<div className="space-y-2">
      <label_1.Label className="text-base font-medium">
        Inspection Checklist - {method}
      </label_1.Label>
      <div className="space-y-2">
        {methodChecklist.map((item, index) => (<div key={index} className="flex items-center space-x-2">
            <input type="checkbox" id={`check-${index}`} className="rounded"/>
            <label_1.Label htmlFor={`check-${index}`} className="text-sm">
              {item}
            </label_1.Label>
          </div>))}
      </div>
    </div>);
}
