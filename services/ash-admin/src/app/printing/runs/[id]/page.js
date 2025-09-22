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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PrintRunDetailsPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const tabs_1 = require("@/components/ui/tabs");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const SilkscreenWorkflow_1 = __importDefault(require("@/components/printing/SilkscreenWorkflow"));
const SublimationWorkflow_1 = __importDefault(require("@/components/printing/SublimationWorkflow"));
const DTFWorkflow_1 = __importDefault(require("@/components/printing/DTFWorkflow"));
const EmbroideryWorkflow_1 = __importDefault(require("@/components/printing/EmbroideryWorkflow"));
const MaterialConsumption_1 = __importDefault(require("@/components/printing/MaterialConsumption"));
const AshleyAIOptimization_1 = __importDefault(require("@/components/printing/AshleyAIOptimization"));
const methodIcons = {
    SILKSCREEN: lucide_react_1.Palette,
    SUBLIMATION: lucide_react_1.Zap,
    DTF: lucide_react_1.Package2,
    EMBROIDERY: lucide_react_1.Shirt
};
const methodColors = {
    SILKSCREEN: 'bg-purple-100 text-purple-800 border-purple-200',
    SUBLIMATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    DTF: 'bg-blue-100 text-blue-800 border-blue-200',
    EMBROIDERY: 'bg-green-100 text-green-800 border-green-200'
};
const statusColors = {
    CREATED: 'bg-gray-100 text-gray-800 border-gray-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
    PAUSED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    DONE: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200'
};
function PrintRunDetailsPage() {
    const params = (0, navigation_1.useParams)();
    const runId = params.id;
    const [run, setRun] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [updating, setUpdating] = (0, react_1.useState)(false);
    // Material tracking
    const [materialData, setMaterialData] = (0, react_1.useState)([]);
    const [newMaterial, setNewMaterial] = (0, react_1.useState)({
        item_name: '',
        uom: '',
        qty: '',
        source_batch_id: ''
    });
    // Quality tracking
    const [qualityData, setQualityData] = (0, react_1.useState)({
        qty_good: 0,
        qty_reject: 0,
        reject_reasons: []
    });
    // Method-specific data
    const [methodSpecificData, setMethodSpecificData] = (0, react_1.useState)({});
    const [notes, setNotes] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        if (runId) {
            fetchRunDetails();
        }
    }, [runId]);
    const fetchRunDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/printing/runs/${runId}`);
            if (response.ok) {
                const data = await response.json();
                setRun(data.data);
                setMethodSpecificData(data.data.method_data || {});
            }
            else {
                console.error('Failed to fetch run details');
            }
        }
        catch (error) {
            console.error('Error fetching run details:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRunAction = async (action) => {
        try {
            setUpdating(true);
            const endpoint = action === 'start' ? 'start' :
                action === 'pause' ? 'pause' : 'complete';
            const body = action === 'complete' ? {
                qty_completed: qualityData.qty_good,
                qty_rejected: qualityData.qty_reject,
                reject_reasons: qualityData.reject_reasons,
                material_consumption: materialData,
                quality_notes: notes,
                ...methodSpecificData
            } : {};
            const response = await fetch(`/api/printing/runs/${runId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                await fetchRunDetails();
            }
            else {
                console.error(`Failed to ${action} run`);
            }
        }
        catch (error) {
            console.error(`Error ${action}ing run:`, error);
        }
        finally {
            setUpdating(false);
        }
    };
    const addMaterial = () => {
        if (newMaterial.item_name && newMaterial.uom && newMaterial.qty) {
            setMaterialData([
                ...materialData,
                {
                    item_id: `temp_${Date.now()}`,
                    item_name: newMaterial.item_name,
                    uom: newMaterial.uom,
                    qty: parseFloat(newMaterial.qty),
                    source_batch_id: newMaterial.source_batch_id || undefined
                }
            ]);
            setNewMaterial({ item_name: '', uom: '', qty: '', source_batch_id: '' });
        }
    };
    const addRejectReason = () => {
        setQualityData({
            ...qualityData,
            reject_reasons: [
                ...qualityData.reject_reasons,
                {
                    reason_code: '',
                    qty: 1,
                    cost_attribution: 'COMPANY'
                }
            ]
        });
    };
    const updateRejectReason = (index, field, value) => {
        const updatedReasons = [...qualityData.reject_reasons];
        updatedReasons[index] = { ...updatedReasons[index], [field]: value };
        setQualityData({ ...qualityData, reject_reasons: updatedReasons });
    };
    const getProgressPercentage = () => {
        if (!run || run.target_qty === 0)
            return 0;
        return Math.round(((run.completed_qty + qualityData.qty_good) / run.target_qty) * 100);
    };
    const getRuntimeDisplay = () => {
        if (!run?.started_at)
            return 'Not started';
        const startTime = new Date(run.started_at);
        const endTime = run.ended_at ? new Date(run.ended_at) : new Date();
        const runtimeMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
        const hours = Math.floor(runtimeMinutes / 60);
        const minutes = runtimeMinutes % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };
    if (loading) {
        return (<div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <lucide_react_1.Clock className="w-8 h-8 mx-auto mb-4 animate-pulse"/>
            <p>Loading print run details...</p>
          </div>
        </div>
      </div>);
    }
    if (!run) {
        return (<div className="container mx-auto py-6">
        <card_1.Card>
          <card_1.CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <lucide_react_1.AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500"/>
              <p className="text-red-600">Print run not found</p>
              <link_1.default href="/printing">
                <button_1.Button className="mt-4" variant="outline">Back to Printing</button_1.Button>
              </link_1.default>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    const MethodIcon = methodIcons[run.method];
    const progress = getProgressPercentage();
    return (<div className="container mx-auto py-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <link_1.default href="/printing">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
            Back to Printing
          </button_1.Button>
        </link_1.default>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${methodColors[run.method]}`}>
              <MethodIcon className="w-6 h-6"/>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{run.order.order_number}</h1>
              <p className="text-muted-foreground">
                {run.order.brand.name} - {run.method} Print Run
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <badge_1.Badge className={statusColors[run.status]}>
            {run.status.replace('_', ' ')}
          </badge_1.Badge>
          <badge_1.Badge variant="outline" className={methodColors[run.method]}>
            {run.method}
          </badge_1.Badge>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Progress</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {run.completed_qty + qualityData.qty_good} / {run.target_qty}
            </div>
            <progress_1.Progress value={progress} className="mt-2"/>
            <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Runtime</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getRuntimeDisplay()}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Quality Rate</card_1.CardTitle>
            <lucide_react_1.AlertCircle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {run.completed_qty + qualityData.qty_good > 0 ?
            Math.round(((run.completed_qty + qualityData.qty_good) /
                (run.completed_qty + qualityData.qty_good + run.rejected_qty + qualityData.qty_reject)) * 100) : 100}%
            </div>
            {(run.rejected_qty + qualityData.qty_reject) > 0 && (<p className="text-xs text-red-600 mt-1">
                {run.rejected_qty + qualityData.qty_reject} rejected
              </p>)}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Machine</card_1.CardTitle>
            <lucide_react_1.Package2 className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-sm font-bold">
              {run.machine?.name || 'No machine assigned'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {run.machine?.workcenter.replace('_', ' ')}
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {run.status === 'CREATED' && (<button_1.Button onClick={() => handleRunAction('start')} disabled={updating} className="bg-green-600 hover:bg-green-700">
            <lucide_react_1.Play className="w-4 h-4 mr-2"/>
            Start Run
          </button_1.Button>)}
        
        {run.status === 'IN_PROGRESS' && (<>
            <button_1.Button onClick={() => handleRunAction('pause')} disabled={updating} variant="outline">
              <lucide_react_1.Pause className="w-4 h-4 mr-2"/>
              Pause
            </button_1.Button>
            <button_1.Button onClick={() => handleRunAction('complete')} disabled={updating} className="bg-blue-600 hover:bg-blue-700">
              <lucide_react_1.Square className="w-4 h-4 mr-2"/>
              Complete Run
            </button_1.Button>
          </>)}

        {run.status === 'PAUSED' && (<button_1.Button onClick={() => handleRunAction('start')} disabled={updating} className="bg-green-600 hover:bg-green-700">
            <lucide_react_1.Play className="w-4 h-4 mr-2"/>
            Resume
          </button_1.Button>)}
      </div>

      <tabs_1.Tabs defaultValue="tracking" className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="tracking">Live Tracking</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="ashley-ai">Ashley AI</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="materials">Materials</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="quality">Quality Control</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="method">Method Details</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="tracking" className="space-y-4">
          {/* Live production tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Production Input</card_1.CardTitle>
                <card_1.CardDescription>Record production quantities in real-time</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="qty_good">Good Quantity</label_1.Label>
                    <input_1.Input id="qty_good" type="number" min="0" value={qualityData.qty_good} onChange={(e) => setQualityData({
            ...qualityData,
            qty_good: parseInt(e.target.value) || 0
        })}/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label htmlFor="qty_reject">Reject Quantity</label_1.Label>
                    <input_1.Input id="qty_reject" type="number" min="0" value={qualityData.qty_reject} onChange={(e) => setQualityData({
            ...qualityData,
            qty_reject: parseInt(e.target.value) || 0
        })}/>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label_1.Label htmlFor="notes">Production Notes</label_1.Label>
                  <textarea_1.Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Record any observations, issues, or notes..." rows={3}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Bundle Processing</card_1.CardTitle>
                <card_1.CardDescription>Scan and process bundles</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                {run.order.bundles.length > 0 ? (<div className="space-y-2">
                    {run.order.bundles.map((bundle) => (<div key={bundle.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{bundle.qr_code}</span>
                          <p className="text-sm text-muted-foreground">
                            Size: {bundle.size_code} | Qty: {bundle.qty}
                          </p>
                        </div>
                        <badge_1.Badge variant="outline">Pending</badge_1.Badge>
                      </div>))}
                  </div>) : (<div className="text-center text-muted-foreground py-8">
                    <lucide_react_1.Package2 className="w-8 h-8 mx-auto mb-2"/>
                    <p>No bundles available for processing</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="ashley-ai" className="space-y-4">
          <AshleyAIOptimization_1.default runId={runId} printMethod={run.method} quantity={run.target_qty} materials={materialData} machineId={run.machine?.id} orderData={{
            quality_requirements: run.order.line_items[0]?.description?.includes('premium') ? { high_quality: true } : {},
            rush_order: run.created_at && new Date().getTime() - new Date(run.created_at).getTime() < 24 * 60 * 60 * 1000
        }}/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="materials" className="space-y-4">
          <MaterialConsumption_1.default runId={runId} method={run.method} onUpdate={setMaterialData} readOnly={run.status === 'DONE'}/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="quality" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Quality Control & Rejects</card_1.CardTitle>
              <card_1.CardDescription>Record defects and quality issues</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Reject Reasons</h3>
                <button_1.Button size="sm" variant="outline" onClick={addRejectReason}>
                  <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                  Add Reason
                </button_1.Button>
              </div>
              
              {qualityData.reject_reasons.map((reason, index) => (<div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded">
                  <div className="space-y-2">
                    <label_1.Label>Reason</label_1.Label>
                    <select className="w-full p-2 border rounded" value={reason.reason_code} onChange={(e) => updateRejectReason(index, 'reason_code', e.target.value)}>
                      <option value="">Select reason</option>
                      <option value="MISALIGNMENT">Misalignment</option>
                      <option value="PEEL">Peel/Adhesion</option>
                      <option value="CRACK">Crack</option>
                      <option value="GHOST">Ghost Image</option>
                      <option value="PUCKERING">Puckering</option>
                      <option value="COLOR_OFF">Color Off</option>
                      <option value="INCOMPLETE">Incomplete Print</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Quantity</label_1.Label>
                    <input_1.Input type="number" min="1" value={reason.qty} onChange={(e) => updateRejectReason(index, 'qty', parseInt(e.target.value) || 1)}/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Attribution</label_1.Label>
                    <select className="w-full p-2 border rounded" value={reason.cost_attribution} onChange={(e) => updateRejectReason(index, 'cost_attribution', e.target.value)}>
                      <option value="COMPANY">Company</option>
                      <option value="SUPPLIER">Supplier</option>
                      <option value="STAFF">Staff</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Photo</label_1.Label>
                    <button_1.Button size="sm" variant="outline" className="w-full">
                      <lucide_react_1.Camera className="w-4 h-4 mr-2"/>
                      Capture
                    </button_1.Button>
                  </div>
                </div>))}
              
              {qualityData.reject_reasons.length === 0 && (<div className="text-center text-muted-foreground py-8">
                  <lucide_react_1.CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500"/>
                  <p>No reject reasons recorded</p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="method" className="space-y-4">
          <MethodSpecificPanel method={run.method} runId={runId} data={methodSpecificData} onUpdate={setMethodSpecificData} readOnly={run.status === 'DONE'}/>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
function MethodSpecificPanel({ method, runId, data, onUpdate, readOnly }) {
    switch (method) {
        case 'SILKSCREEN':
            return <SilkscreenWorkflow_1.default runId={runId} onUpdate={onUpdate} readOnly={readOnly}/>;
        case 'SUBLIMATION':
            return <SublimationWorkflow_1.default runId={runId} onUpdate={onUpdate} readOnly={readOnly}/>;
        case 'DTF':
            return <DTFWorkflow_1.default runId={runId} onUpdate={onUpdate} readOnly={readOnly}/>;
        case 'EMBROIDERY':
            return <EmbroideryWorkflow_1.default runId={runId} onUpdate={onUpdate} readOnly={readOnly}/>;
        default:
            return <div>Method-specific workflow not available</div>;
    }
}
