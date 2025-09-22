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
exports.default = SewingRunDetailsPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
function SewingRunDetailsPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const runId = params.id;
    const [sewingRun, setSewingRun] = (0, react_1.useState)(null);
    const [timeEntries, setTimeEntries] = (0, react_1.useState)([]);
    const [qualityRejects, setQualityRejects] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [actionLoading, setActionLoading] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    // Quality control state
    const [rejectQty, setRejectQty] = (0, react_1.useState)('');
    const [rejectReason, setRejectReason] = (0, react_1.useState)('');
    const [rejectPhoto, setRejectPhoto] = (0, react_1.useState)(null);
    // Progress update state
    const [goodQty, setGoodQty] = (0, react_1.useState)('');
    const [progressNotes, setProgressNotes] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        if (runId) {
            fetchRunDetails();
        }
    }, [runId]);
    const fetchRunDetails = async () => {
        try {
            setLoading(true);
            const [runResponse, timeResponse, rejectsResponse] = await Promise.all([
                fetch(`/api/sewing/runs/${runId}`),
                fetch(`/api/sewing/runs/${runId}/time-entries`),
                fetch(`/api/sewing/runs/${runId}/rejects`)
            ]);
            if (runResponse.ok) {
                const runData = await runResponse.json();
                setSewingRun(runData.data);
                setGoodQty(runData.data.qty_good.toString());
            }
            else {
                // Mock data for demo
                const mockRun = {
                    id: runId,
                    operation_name: 'Join shoulders',
                    status: 'IN_PROGRESS',
                    order: {
                        order_number: 'TCAS-2025-000001',
                        brand: { name: 'Trendy Casual', code: 'TCAS' },
                        line_items: [{ description: 'Premium Hoodie' }]
                    },
                    operator: {
                        first_name: 'Maria',
                        last_name: 'Santos',
                        employee_number: 'EMP001'
                    },
                    bundle: {
                        id: 'bundle-001',
                        size_code: 'M',
                        qty: 20,
                        qr_code: 'ash://bundle/001'
                    },
                    routing_step: {
                        id: 'step-001',
                        step_name: 'Sewing - Join shoulders',
                        estimated_hours: 0.5
                    },
                    qty_good: 15,
                    qty_reject: 1,
                    earned_minutes: 22.5,
                    actual_minutes: 25,
                    efficiency_pct: 90,
                    piece_rate_pay: 33.75,
                    started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setSewingRun(mockRun);
                setGoodQty('15');
            }
            if (timeResponse.ok) {
                const timeData = await timeResponse.json();
                setTimeEntries(timeData.data || []);
            }
            else {
                setTimeEntries([
                    { id: '1', action: 'START', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
                    { id: '2', action: 'PAUSE', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), notes: 'Short break' },
                    { id: '3', action: 'RESUME', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
                ]);
            }
            if (rejectsResponse.ok) {
                const rejectsData = await rejectsResponse.json();
                setQualityRejects(rejectsData.data || []);
            }
            else {
                setQualityRejects([
                    { id: '1', qty: 1, reason: 'Uneven stitching', created_at: new Date().toISOString() }
                ]);
            }
        }
        catch (error) {
            console.error('Failed to fetch run details:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRunAction = async (action) => {
        try {
            setActionLoading(true);
            const response = await fetch(`/api/sewing/runs/${runId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: progressNotes || undefined })
            });
            if (response.ok) {
                await fetchRunDetails();
                setProgressNotes('');
            }
            else {
                // For demo, simulate the action
                setSewingRun(prev => prev ? {
                    ...prev,
                    status: action === 'complete' ? 'DONE' : action === 'start' || action === 'resume' ? 'IN_PROGRESS' : 'IN_PROGRESS',
                    ended_at: action === 'complete' ? new Date().toISOString() : prev.ended_at,
                    actual_minutes: action === 'complete' ? (prev.actual_minutes || 0) + 5 : prev.actual_minutes
                } : null);
                const newEntry = {
                    id: Date.now().toString(),
                    action: action.toUpperCase(),
                    timestamp: new Date().toISOString(),
                    notes: progressNotes || undefined
                };
                setTimeEntries(prev => [...prev, newEntry]);
                setProgressNotes('');
            }
        }
        catch (error) {
            console.error(`Failed to ${action} run:`, error);
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleUpdateProgress = async () => {
        try {
            const response = await fetch(`/api/sewing/runs/${runId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    qty_good: parseInt(goodQty),
                    notes: progressNotes
                })
            });
            if (response.ok) {
                await fetchRunDetails();
                setProgressNotes('');
            }
            else {
                // For demo, update locally
                setSewingRun(prev => prev ? {
                    ...prev,
                    qty_good: parseInt(goodQty),
                    earned_minutes: parseInt(goodQty) * 1.5, // SMV of 1.5 minutes
                    piece_rate_pay: parseInt(goodQty) * 2.25,
                    efficiency_pct: Math.round((parseInt(goodQty) * 1.5) / ((prev.actual_minutes || 25)) * 100)
                } : null);
            }
        }
        catch (error) {
            console.error('Failed to update progress:', error);
        }
    };
    const handleRejectSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('qty', rejectQty);
            formData.append('reason', rejectReason);
            if (rejectPhoto) {
                formData.append('photo', rejectPhoto);
            }
            const response = await fetch(`/api/sewing/runs/${runId}/rejects`, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                await fetchRunDetails();
                setRejectQty('');
                setRejectReason('');
                setRejectPhoto(null);
            }
            else {
                // For demo, add locally
                const newReject = {
                    id: Date.now().toString(),
                    qty: parseInt(rejectQty),
                    reason: rejectReason,
                    created_at: new Date().toISOString()
                };
                setQualityRejects(prev => [...prev, newReject]);
                setSewingRun(prev => prev ? {
                    ...prev,
                    qty_reject: prev.qty_reject + parseInt(rejectQty)
                } : null);
                setRejectQty('');
                setRejectReason('');
                setRejectPhoto(null);
            }
        }
        catch (error) {
            console.error('Failed to submit reject:', error);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'CREATED': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
            case 'DONE': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getEfficiencyColor = (efficiency) => {
        if (!efficiency)
            return 'text-gray-500';
        if (efficiency >= 95)
            return 'text-green-600';
        if (efficiency >= 85)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const getTimeWorked = () => {
        if (!sewingRun?.started_at)
            return 0;
        const startTime = new Date(sewingRun.started_at);
        const endTime = sewingRun.ended_at ? new Date(sewingRun.ended_at) : new Date();
        return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    };
    const getCompletionPercentage = () => {
        if (!sewingRun)
            return 0;
        return Math.round((sewingRun.qty_good / sewingRun.bundle.qty) * 100);
    };
    if (loading) {
        return (<div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <lucide_react_1.RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin"/>
            <p>Loading run details...</p>
          </div>
        </div>
      </div>);
    }
    if (!sewingRun) {
        return (<div className="container mx-auto py-6">
        <card_1.Card>
          <card_1.CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <lucide_react_1.XCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground"/>
              <p className="text-muted-foreground">Sewing run not found</p>
              <link_1.default href="/sewing">
                <button_1.Button className="mt-2" variant="outline">Back to Sewing</button_1.Button>
              </link_1.default>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <link_1.default href="/sewing">
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
              Back to Sewing
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-3xl font-bold">Run #{sewingRun.id}</h1>
            <p className="text-muted-foreground">
              {sewingRun.operation_name} • {sewingRun.order.order_number}
            </p>
          </div>
        </div>
        <badge_1.Badge className={getStatusColor(sewingRun.status)}>
          {sewingRun.status.replace('_', ' ')}
        </badge_1.Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Progress</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
            <p className="text-xs text-muted-foreground">
              {sewingRun.qty_good} of {sewingRun.bundle.qty} pieces
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Efficiency</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className={`text-2xl font-bold ${getEfficiencyColor(sewingRun.efficiency_pct)}`}>
              {sewingRun.efficiency_pct || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current performance
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Time Worked</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{sewingRun.actual_minutes || getTimeWorked()}m</div>
            <p className="text-xs text-muted-foreground">
              Est: {sewingRun.earned_minutes || 0}m
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Earnings</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">₱{sewingRun.piece_rate_pay?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Current earned
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Rejects</card_1.CardTitle>
            <lucide_react_1.XCircle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">{sewingRun.qty_reject}</div>
            <p className="text-xs text-muted-foreground">
              {((sewingRun.qty_reject / sewingRun.bundle.qty) * 100).toFixed(1)}% rate
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Quick Actions */}
      <card_1.Card>
        <card_1.CardContent className="py-4">
          <div className="flex gap-2 flex-wrap">
            {sewingRun.status === 'CREATED' && (<button_1.Button onClick={() => handleRunAction('start')} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                <lucide_react_1.Play className="w-4 h-4 mr-2"/>
                Start Run
              </button_1.Button>)}
            
            {sewingRun.status === 'IN_PROGRESS' && (<>
                <button_1.Button onClick={() => handleRunAction('pause')} disabled={actionLoading} variant="outline">
                  <lucide_react_1.Pause className="w-4 h-4 mr-2"/>
                  Pause
                </button_1.Button>
                <button_1.Button onClick={() => handleRunAction('complete')} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
                  <lucide_react_1.Square className="w-4 h-4 mr-2"/>
                  Complete
                </button_1.Button>
              </>)}

            <button_1.Button variant="outline" onClick={fetchRunDetails}>
              <lucide_react_1.RefreshCw className="w-4 h-4 mr-2"/>
              Refresh
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="progress">Progress</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="quality">Quality</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="timeline">Timeline</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="ashley-ai">Ashley AI</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order & Bundle Info */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Package className="w-5 h-5"/>
                  Order & Bundle Details
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                    <p className="font-medium">{sewingRun.order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Brand</p>
                    <p className="font-medium">{sewingRun.order.brand.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Product</p>
                    <p className="font-medium">{sewingRun.order.line_items[0]?.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bundle Size</p>
                    <p className="font-medium">{sewingRun.bundle.size_code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                    <p className="font-medium">{sewingRun.bundle.qty} pieces</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">QR Code</p>
                    <p className="font-mono text-sm">{sewingRun.bundle.qr_code}</p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Operator & Operation */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.User className="w-5 h-5"/>
                  Operation Details
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Operator</p>
                    <p className="font-medium">{sewingRun.operator.first_name} {sewingRun.operator.last_name}</p>
                    <p className="text-sm text-muted-foreground">{sewingRun.operator.employee_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Operation</p>
                    <p className="font-medium">{sewingRun.operation_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Routing Step</p>
                    <p className="font-medium">{sewingRun.routing_step.step_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Started At</p>
                    <p className="font-medium">
                      {sewingRun.started_at
            ? new Date(sewingRun.started_at).toLocaleString()
            : 'Not started'}
                    </p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="progress" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Update Progress</card_1.CardTitle>
              <card_1.CardDescription>
                Update the number of completed pieces and add notes
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="good_qty">Completed Pieces</label_1.Label>
                  <input_1.Input id="good_qty" type="number" min="0" max={sewingRun.bundle.qty} value={goodQty} onChange={(e) => setGoodQty(e.target.value)}/>
                  <p className="text-sm text-muted-foreground">
                    Current: {sewingRun.qty_good} / {sewingRun.bundle.qty}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label_1.Label htmlFor="notes">Notes (Optional)</label_1.Label>
                  <textarea_1.Textarea id="notes" value={progressNotes} onChange={(e) => setProgressNotes(e.target.value)} placeholder="Add any notes about progress..." className="resize-none h-20"/>
                </div>
              </div>
              
              <button_1.Button onClick={handleUpdateProgress} disabled={!goodQty || parseInt(goodQty) < 0 || parseInt(goodQty) > sewingRun.bundle.qty}>
                <lucide_react_1.Edit className="w-4 h-4 mr-2"/>
                Update Progress
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Progress Visualization */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Progress Overview</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Progress</span>
                    <span>{getCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${getCompletionPercentage()}%` }}/>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{sewingRun.qty_good}</p>
                    <p className="text-sm text-green-700">Completed</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{sewingRun.qty_reject}</p>
                    <p className="text-sm text-red-700">Rejected</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">
                      {sewingRun.bundle.qty - sewingRun.qty_good - sewingRun.qty_reject}
                    </p>
                    <p className="text-sm text-gray-700">Remaining</p>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="quality" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Report Quality Issue</card_1.CardTitle>
              <card_1.CardDescription>
                Record rejected pieces with reason and optional photo
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="reject_qty">Quantity to Reject</label_1.Label>
                  <input_1.Input id="reject_qty" type="number" min="1" max={sewingRun.bundle.qty - sewingRun.qty_good - sewingRun.qty_reject} value={rejectQty} onChange={(e) => setRejectQty(e.target.value)}/>
                </div>
                
                <div className="space-y-2">
                  <label_1.Label htmlFor="reject_reason">Reject Reason</label_1.Label>
                  <input_1.Input id="reject_reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g., Uneven stitching, misaligned seam"/>
                </div>
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="reject_photo">Photo Evidence (Optional)</label_1.Label>
                <div className="flex items-center gap-2">
                  <input_1.Input id="reject_photo" type="file" accept="image/*" onChange={(e) => setRejectPhoto(e.target.files?.[0] || null)}/>
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.Camera className="w-4 h-4 mr-2"/>
                    Take Photo
                  </button_1.Button>
                </div>
              </div>
              
              <button_1.Button onClick={handleRejectSubmit} disabled={!rejectQty || !rejectReason} variant="destructive">
                <lucide_react_1.XCircle className="w-4 h-4 mr-2"/>
                Submit Reject Report
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Quality History */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Quality Issues</card_1.CardTitle>
              <card_1.CardDescription>History of rejected pieces for this run</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {qualityRejects.length > 0 ? (<div className="space-y-3">
                  {qualityRejects.map((reject) => (<div key={reject.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{reject.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reject.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <badge_1.Badge variant="destructive">{reject.qty} pieces</badge_1.Badge>
                        {reject.photo_url && (<p className="text-xs text-muted-foreground mt-1">Photo attached</p>)}
                      </div>
                    </div>))}
                </div>) : (<p className="text-center text-muted-foreground py-8">
                  No quality issues reported for this run
                </p>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="timeline" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Time Tracking</card_1.CardTitle>
              <card_1.CardDescription>Complete timeline of this sewing run</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {timeEntries.map((entry) => (<div key={entry.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${entry.action === 'START' || entry.action === 'RESUME' ? 'bg-green-100' :
                entry.action === 'PAUSE' ? 'bg-yellow-100' :
                    entry.action === 'COMPLETE' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {entry.action === 'START' || entry.action === 'RESUME' ? <lucide_react_1.Play className="w-4 h-4 text-green-600"/> :
                entry.action === 'PAUSE' ? <lucide_react_1.Pause className="w-4 h-4 text-yellow-600"/> :
                    entry.action === 'COMPLETE' ? <lucide_react_1.Square className="w-4 h-4 text-blue-600"/> :
                        <lucide_react_1.Clock className="w-4 h-4 text-gray-600"/>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{entry.action.toLowerCase().replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.notes && (<p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>)}
                    </div>
                  </div>))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="ashley-ai" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center gap-2">
                  <lucide_react_1.Brain className="w-5 h-5 text-purple-600"/>
                  <card_1.CardTitle>Performance Analysis</card_1.CardTitle>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="p-3 border rounded-lg bg-green-50">
                  <div className="flex items-start gap-2">
                    <lucide_react_1.CheckCircle className="w-4 h-4 text-green-600 mt-0.5"/>
                    <div>
                      <p className="font-medium text-green-900">On Track Performance</p>
                      <p className="text-sm text-green-700">
                        Current efficiency of {sewingRun.efficiency_pct}% is above target. 
                        Maintain current pace to complete on time.
                      </p>
                    </div>
                  </div>
                </div>

                {sewingRun.qty_reject > 0 && (<div className="p-3 border rounded-lg bg-yellow-50">
                    <div className="flex items-start gap-2">
                      <lucide_react_1.AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5"/>
                      <div>
                        <p className="font-medium text-yellow-900">Quality Alert</p>
                        <p className="text-sm text-yellow-700">
                          {sewingRun.qty_reject} rejected pieces detected. 
                          Consider reviewing technique for "Join shoulders" operation.
                        </p>
                      </div>
                    </div>
                  </div>)}

                <div className="p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-start gap-2">
                    <lucide_react_1.Timer className="w-4 h-4 text-blue-600 mt-0.5"/>
                    <div>
                      <p className="font-medium text-blue-900">Time Optimization</p>
                      <p className="text-sm text-blue-700">
                        Working {getTimeWorked()} minutes so far. 
                        Projected completion in {Math.round(((sewingRun.bundle.qty - sewingRun.qty_good) * 1.5))} minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Smart Recommendations</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Quality Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on reject patterns, focus on consistent seam alignment. 
                    Consider using guide markers for better accuracy.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Efficiency Tips</h4>
                  <p className="text-sm text-muted-foreground">
                    Current rhythm is good. Take a 5-minute break every 45 minutes 
                    to maintain this efficiency level.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Next Operation</h4>
                  <p className="text-sm text-muted-foreground">
                    After completing "Join shoulders", the bundle will be ready for 
                    "Attach collar" operation. Estimated queue time: 15 minutes.
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
