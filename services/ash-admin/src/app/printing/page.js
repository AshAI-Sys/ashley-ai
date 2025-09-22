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
exports.default = PrintingPage;
const react_1 = __importStar(require("react"));
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const AIInsightsDashboard_1 = __importDefault(require("@/components/printing/AIInsightsDashboard"));
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
function PrintingPage() {
    const [printRuns, setPrintRuns] = (0, react_1.useState)([]);
    const [machines, setMachines] = (0, react_1.useState)([]);
    const [dashboard, setDashboard] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [filter, setFilter] = (0, react_1.useState)({
        method: '',
        status: '',
        machine: ''
    });
    (0, react_1.useEffect)(() => {
        fetchData();
    }, [filter]);
    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch print runs with filters
            const runsParams = new URLSearchParams();
            if (filter.method)
                runsParams.append('method', filter.method);
            if (filter.status)
                runsParams.append('status', filter.status);
            const [runsResponse, machinesResponse, dashboardResponse] = await Promise.all([
                fetch(`/api/printing/runs?${runsParams}`),
                fetch('/api/printing/machines'),
                fetch('/api/printing/dashboard')
            ]);
            if (runsResponse.ok) {
                const runsData = await runsResponse.json();
                setPrintRuns(runsData.data || []);
            }
            else {
                // Mock data for demo
                setPrintRuns([
                    {
                        id: '1',
                        method: 'SILKSCREEN',
                        status: 'IN_PROGRESS',
                        order: {
                            order_number: 'TCAS-2025-000001',
                            brand: { name: 'Trendy Casual', code: 'TCAS' },
                            line_items: [{ description: 'Premium Hoodie' }]
                        },
                        machine: { name: 'M&R Sportsman EX', workcenter: 'PRINTING' },
                        target_qty: 100,
                        outputs: [{ qty_completed: 65 }],
                        rejects: [{ qty_rejected: 2 }],
                        started_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    },
                    {
                        id: '2',
                        method: 'EMBROIDERY',
                        status: 'CREATED',
                        order: {
                            order_number: 'URBN-2025-000001',
                            brand: { name: 'Urban Streetwear', code: 'URBN' },
                            line_items: [{ description: 'Logo T-Shirt' }]
                        },
                        machine: { name: 'Tajima 16-Head', workcenter: 'EMB' },
                        target_qty: 50,
                        outputs: [],
                        rejects: [],
                        created_at: new Date().toISOString()
                    }
                ]);
            }
            if (machinesResponse.ok) {
                const machinesData = await machinesResponse.json();
                setMachines(machinesData.data || []);
            }
            else {
                setMachines([
                    { id: '1', name: 'M&R Sportsman EX', workcenter: 'PRINTING', is_active: true },
                    { id: '2', name: 'Epson SureColor F570', workcenter: 'PRINTING', is_active: true },
                    { id: '3', name: 'Heat Press Pro 15x15', workcenter: 'HEAT_PRESS', is_active: true },
                    { id: '4', name: 'Tajima 16-Head', workcenter: 'EMB', is_active: true }
                ]);
            }
            if (dashboardResponse.ok) {
                const dashData = await dashboardResponse.json();
                setDashboard(dashData.data || null);
            }
            else {
                setDashboard({
                    active_runs: 3,
                    todays_runs: 12,
                    method_breakdown: [
                        { method: 'SILKSCREEN', _count: 8 },
                        { method: 'EMBROIDERY', _count: 3 },
                        { method: 'SUBLIMATION', _count: 1 }
                    ],
                    recent_rejects: []
                });
            }
        }
        catch (error) {
            console.error('Failed to fetch printing data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRunAction = async (runId, action) => {
        try {
            const endpoint = action === 'start' ? 'start' :
                action === 'pause' ? 'pause' : 'complete';
            const response = await fetch(`/api/printing/runs/${runId}/${endpoint}`, {
                method: 'POST'
            });
            if (response.ok) {
                fetchData(); // Refresh data
            }
            else {
                console.error(`Failed to ${action} print run`);
            }
        }
        catch (error) {
            console.error(`Error ${action}ing print run:`, error);
        }
    };
    const getCompletedQty = (run) => {
        return run.outputs.reduce((sum, output) => sum + output.qty_completed, 0);
    };
    const getRejectedQty = (run) => {
        return run.rejects.reduce((sum, reject) => sum + reject.qty_rejected, 0);
    };
    const getProgressPercentage = (run) => {
        const completed = getCompletedQty(run);
        return run.target_qty > 0 ? Math.round((completed / run.target_qty) * 100) : 0;
    };
    if (loading) {
        return (<div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <lucide_react_1.Printer className="w-8 h-8 mx-auto mb-4 animate-pulse"/>
            <p>Loading printing operations...</p>
          </div>
        </div>
      </div>);
    }
    return (<dashboard_layout_1.default>
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Printing Operations</h1>
          <p className="text-muted-foreground">Multi-method printing workflow management</p>
        </div>
        <div className="flex gap-2">
          <link_1.default href="/printing/create-run">
            <button_1.Button className="bg-blue-600 hover:bg-blue-700">
              <lucide_react_1.Printer className="w-4 h-4 mr-2"/>
              New Print Run
            </button_1.Button>
          </link_1.default>
        </div>
      </div>

      {/* Dashboard Cards */}
      {dashboard && (<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Active Runs</card_1.CardTitle>
              <lucide_react_1.Play className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboard.active_runs}</div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Today's Runs</card_1.CardTitle>
              <lucide_react_1.Printer className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboard.todays_runs}</div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Active Machines</card_1.CardTitle>
              <lucide_react_1.Package2 className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {machines.filter(m => m.is_active).length}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Methods Today</card_1.CardTitle>
              <lucide_react_1.Palette className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboard.method_breakdown.length}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      <tabs_1.Tabs defaultValue="runs" className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="runs">Print Runs</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="ashley-ai">Ashley AI</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="machines">Machines</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="runs" className="space-y-4">
          {/* Filters */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Filters</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label_1.Label>Method</label_1.Label>
                  <select_1.Select value={filter.method} onValueChange={(value) => setFilter({ ...filter, method: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="All methods"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="">All methods</select_1.SelectItem>
                      <select_1.SelectItem value="SILKSCREEN">Silkscreen</select_1.SelectItem>
                      <select_1.SelectItem value="SUBLIMATION">Sublimation</select_1.SelectItem>
                      <select_1.SelectItem value="DTF">DTF</select_1.SelectItem>
                      <select_1.SelectItem value="EMBROIDERY">Embroidery</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label>Status</label_1.Label>
                  <select_1.Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="All statuses"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="">All statuses</select_1.SelectItem>
                      <select_1.SelectItem value="CREATED">Created</select_1.SelectItem>
                      <select_1.SelectItem value="IN_PROGRESS">In Progress</select_1.SelectItem>
                      <select_1.SelectItem value="PAUSED">Paused</select_1.SelectItem>
                      <select_1.SelectItem value="DONE">Completed</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label>Machine</label_1.Label>
                  <select_1.Select value={filter.machine} onValueChange={(value) => setFilter({ ...filter, machine: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="All machines"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="">All machines</select_1.SelectItem>
                      {machines.map(machine => (<select_1.SelectItem key={machine.id} value={machine.id}>
                          {machine.name}
                        </select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Print Runs List */}
          <div className="space-y-4">
            {printRuns.map((run) => {
            const MethodIcon = methodIcons[run.method];
            const completed = getCompletedQty(run);
            const rejected = getRejectedQty(run);
            const progress = getProgressPercentage(run);
            return (<card_1.Card key={run.id} className="hover:shadow-md transition-shadow">
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${methodColors[run.method]}`}>
                          <MethodIcon className="w-5 h-5"/>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{run.order.order_number}</h3>
                            <badge_1.Badge variant="outline">{run.order.brand.code}</badge_1.Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {run.order.line_items[0]?.description}
                          </p>
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
                  </card_1.CardHeader>

                  <card_1.CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {completed} / {run.target_qty}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
                      </div>
                      {rejected > 0 && (<p className="text-sm text-red-600">
                          {rejected} rejected
                        </p>)}
                    </div>

                    {/* Machine and timing */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Machine:</span><br />
                        {run.machine.name}
                      </div>
                      <div>
                        <span className="font-medium">Started:</span><br />
                        {run.started_at
                    ? new Date(run.started_at).toLocaleString()
                    : 'Not started'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {run.status === 'CREATED' && (<button_1.Button size="sm" onClick={() => handleRunAction(run.id, 'start')} className="bg-green-600 hover:bg-green-700">
                          <lucide_react_1.Play className="w-4 h-4 mr-1"/>
                          Start
                        </button_1.Button>)}
                      
                      {run.status === 'IN_PROGRESS' && (<>
                          <button_1.Button size="sm" variant="outline" onClick={() => handleRunAction(run.id, 'pause')}>
                            <lucide_react_1.Pause className="w-4 h-4 mr-1"/>
                            Pause
                          </button_1.Button>
                          <button_1.Button size="sm" onClick={() => handleRunAction(run.id, 'complete')} className="bg-blue-600 hover:bg-blue-700">
                            <lucide_react_1.Square className="w-4 h-4 mr-1"/>
                            Complete
                          </button_1.Button>
                        </>)}

                      <link_1.default href={`/printing/runs/${run.id}`}>
                        <button_1.Button size="sm" variant="outline">
                          <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                          View Details
                        </button_1.Button>
                      </link_1.default>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>);
        })}

            {printRuns.length === 0 && (<card_1.Card>
                <card_1.CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <lucide_react_1.Printer className="w-8 h-8 mx-auto mb-2 text-muted-foreground"/>
                    <p className="text-muted-foreground">No print runs found</p>
                    <link_1.default href="/printing/create-run">
                      <button_1.Button className="mt-2" variant="outline">Create First Run</button_1.Button>
                    </link_1.default>
                  </div>
                </card_1.CardContent>
              </card_1.Card>)}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="ashley-ai" className="space-y-4">
          <AIInsightsDashboard_1.default />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="machines" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machines.map((machine) => (<card_1.Card key={machine.id}>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <card_1.CardTitle className="text-lg">{machine.name}</card_1.CardTitle>
                    <badge_1.Badge variant={machine.is_active ? "default" : "secondary"}>
                      {machine.is_active ? 'Active' : 'Inactive'}
                    </badge_1.Badge>
                  </div>
                  <card_1.CardDescription>
                    Workcenter: {machine.workcenter.replace('_', ' ')}
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-sm text-muted-foreground">
                    Currently {machine.is_active ? 'available for production' : 'offline'}
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          {dashboard && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Method Breakdown (Today)</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {dashboard.method_breakdown.map((item) => {
                const MethodIcon = methodIcons[item.method];
                return (<div key={item.method} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${methodColors[item.method]}`}>
                              <MethodIcon className="w-4 h-4"/>
                            </div>
                            <span>{item.method}</span>
                          </div>
                          <badge_1.Badge variant="outline">{item._count} runs</badge_1.Badge>
                        </div>);
            })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Recent Rejects</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {dashboard.recent_rejects.length > 0 ? (<div className="space-y-2">
                      {dashboard.recent_rejects.map((reject) => (<div key={reject.id} className="p-2 border rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{reject.run.order.order_number}</p>
                              <p className="text-xs text-muted-foreground">{reject.reason}</p>
                            </div>
                            <badge_1.Badge variant="destructive">{reject.qty_rejected}</badge_1.Badge>
                          </div>
                        </div>))}
                    </div>) : (<p className="text-sm text-muted-foreground">No recent rejects</p>)}
                </card_1.CardContent>
              </card_1.Card>
            </div>)}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
    </dashboard_layout_1.default>);
}
