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
exports.default = MachinesPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const tabs_1 = require("@/components/ui/tabs");
const dialog_1 = require("@/components/ui/dialog");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const workcenters = {
    PRINTING: { name: 'Screen Printing', icon: lucide_react_1.Palette, color: 'purple' },
    HEAT_PRESS: { name: 'Heat Press', icon: lucide_react_1.Zap, color: 'orange' },
    EMB: { name: 'Embroidery', icon: lucide_react_1.Shirt, color: 'green' },
    DRYER: { name: 'Dryer/Curing', icon: lucide_react_1.Package2, color: 'blue' }
};
const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
    BUSY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    OFFLINE: 'bg-red-100 text-red-800 border-red-200'
};
function MachinesPage() {
    const [machines, setMachines] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [filter, setFilter] = (0, react_1.useState)({
        workcenter: '',
        status: ''
    });
    const [showAddDialog, setShowAddDialog] = (0, react_1.useState)(false);
    const [editingMachine, setEditingMachine] = (0, react_1.useState)(null);
    const [newMachine, setNewMachine] = (0, react_1.useState)({
        name: '',
        workcenter: '',
        specifications: {
            bed_size: '',
            max_temp: '',
            lanes: '',
            capacity: '',
            power: ''
        },
        is_active: true
    });
    (0, react_1.useEffect)(() => {
        fetchMachines();
    }, [filter]);
    const fetchMachines = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.workcenter)
                params.append('workcenter', filter.workcenter);
            if (filter.status === 'active')
                params.append('active_only', 'true');
            const response = await fetch(`/api/printing/machines?${params}`);
            if (response.ok) {
                const data = await response.json();
                setMachines(data.data || []);
            }
            else {
                // Mock data for demo
                setMachines([
                    {
                        id: '1',
                        name: 'M&R Sportsman EX',
                        workcenter: 'PRINTING',
                        is_active: true,
                        specifications: {
                            bed_size: '16" x 18"',
                            stations: '6',
                            colors: '4'
                        },
                        status: 'BUSY',
                        current_run: {
                            id: 'run1',
                            method: 'SILKSCREEN',
                            status: 'IN_PROGRESS',
                            order: {
                                order_number: 'TCAS-2025-000001',
                                brand: { name: 'Trendy Casual', code: 'TCAS' }
                            }
                        },
                        utilization: 85,
                        maintenance_due: false,
                        created_at: '2025-01-01T00:00:00Z',
                        updated_at: '2025-01-01T00:00:00Z'
                    },
                    {
                        id: '2',
                        name: 'Epson SureColor F570',
                        workcenter: 'PRINTING',
                        is_active: true,
                        specifications: {
                            print_width: '24"',
                            resolution: '1440 dpi'
                        },
                        status: 'AVAILABLE',
                        current_run: null,
                        utilization: 65,
                        maintenance_due: false,
                        created_at: '2025-01-01T00:00:00Z',
                        updated_at: '2025-01-01T00:00:00Z'
                    },
                    {
                        id: '3',
                        name: 'Heat Press Pro 15x15',
                        workcenter: 'HEAT_PRESS',
                        is_active: true,
                        specifications: {
                            platen_size: '15" x 15"',
                            max_temp: '230°C',
                            max_pressure: '60 PSI'
                        },
                        status: 'AVAILABLE',
                        current_run: null,
                        utilization: 45,
                        maintenance_due: true,
                        created_at: '2025-01-01T00:00:00Z',
                        updated_at: '2025-01-01T00:00:00Z'
                    },
                    {
                        id: '4',
                        name: 'Tajima 16-Head',
                        workcenter: 'EMB',
                        is_active: true,
                        specifications: {
                            heads: '16',
                            max_speed: '1000 SPM',
                            max_area: '360mm x 500mm'
                        },
                        status: 'AVAILABLE',
                        current_run: null,
                        utilization: 75,
                        maintenance_due: false,
                        created_at: '2025-01-01T00:00:00Z',
                        updated_at: '2025-01-01T00:00:00Z'
                    }
                ]);
            }
        }
        catch (error) {
            console.error('Error fetching machines:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddMachine = async () => {
        try {
            const response = await fetch('/api/printing/machines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMachine)
            });
            if (response.ok) {
                setShowAddDialog(false);
                setNewMachine({
                    name: '',
                    workcenter: '',
                    specifications: {
                        bed_size: '',
                        max_temp: '',
                        lanes: '',
                        capacity: '',
                        power: ''
                    },
                    is_active: true
                });
                fetchMachines();
            }
        }
        catch (error) {
            console.error('Error adding machine:', error);
        }
    };
    const handleToggleActive = async (machineId, isActive) => {
        try {
            const response = await fetch(`/api/printing/machines/${machineId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !isActive })
            });
            if (response.ok) {
                fetchMachines();
            }
        }
        catch (error) {
            console.error('Error toggling machine active status:', error);
        }
    };
    const getFilteredMachines = () => {
        return machines.filter(machine => {
            if (filter.workcenter && machine.workcenter !== filter.workcenter)
                return false;
            if (filter.status === 'active' && !machine.is_active)
                return false;
            if (filter.status === 'busy' && machine.status !== 'BUSY')
                return false;
            if (filter.status === 'available' && machine.status !== 'AVAILABLE')
                return false;
            return true;
        });
    };
    const getMachineStats = () => {
        const total = machines.length;
        const active = machines.filter(m => m.is_active).length;
        const busy = machines.filter(m => m.status === 'BUSY').length;
        const maintenanceDue = machines.filter(m => m.maintenance_due).length;
        return { total, active, busy, maintenanceDue };
    };
    if (loading) {
        return (<div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <lucide_react_1.Settings className="w-8 h-8 mx-auto mb-4 animate-pulse"/>
            <p>Loading machines...</p>
          </div>
        </div>
      </div>);
    }
    const stats = getMachineStats();
    const filteredMachines = getFilteredMachines();
    return (<div className="container mx-auto py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <link_1.default href="/printing">
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
              Back to Printing
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-3xl font-bold">Machine Management</h1>
            <p className="text-muted-foreground">Monitor and manage printing equipment</p>
          </div>
        </div>
        <dialog_1.Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button className="bg-blue-600 hover:bg-blue-700">
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              Add Machine
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="max-w-2xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Add New Machine</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Configure a new printing machine
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label>Machine Name</label_1.Label>
                  <input_1.Input value={newMachine.name} onChange={(e) => setNewMachine({
            ...newMachine,
            name: e.target.value
        })} placeholder="e.g., M&R Sportsman EX"/>
                </div>
                <div className="space-y-2">
                  <label_1.Label>Workcenter</label_1.Label>
                  <select_1.Select value={newMachine.workcenter} onValueChange={(value) => setNewMachine({
            ...newMachine,
            workcenter: value
        })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select workcenter"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="PRINTING">Screen Printing</select_1.SelectItem>
                      <select_1.SelectItem value="HEAT_PRESS">Heat Press</select_1.SelectItem>
                      <select_1.SelectItem value="EMB">Embroidery</select_1.SelectItem>
                      <select_1.SelectItem value="DRYER">Dryer/Curing</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label>Specifications</label_1.Label>
                <div className="grid grid-cols-2 gap-4">
                  <input_1.Input placeholder="Bed Size (e.g., 16x18 inches)" value={newMachine.specifications.bed_size} onChange={(e) => setNewMachine({
            ...newMachine,
            specifications: {
                ...newMachine.specifications,
                bed_size: e.target.value
            }
        })}/>
                  <input_1.Input placeholder="Max Temperature (°C)" value={newMachine.specifications.max_temp} onChange={(e) => setNewMachine({
            ...newMachine,
            specifications: {
                ...newMachine.specifications,
                max_temp: e.target.value
            }
        })}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input_1.Input placeholder="Lanes/Stations" value={newMachine.specifications.lanes} onChange={(e) => setNewMachine({
            ...newMachine,
            specifications: {
                ...newMachine.specifications,
                lanes: e.target.value
            }
        })}/>
                  <input_1.Input placeholder="Hourly Capacity" value={newMachine.specifications.capacity} onChange={(e) => setNewMachine({
            ...newMachine,
            specifications: {
                ...newMachine.specifications,
                capacity: e.target.value
            }
        })}/>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button_1.Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </button_1.Button>
                <button_1.Button onClick={handleAddMachine}>
                  Add Machine
                </button_1.Button>
              </div>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Machines</card_1.CardTitle>
            <lucide_react_1.Settings className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Active</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Currently Busy</card_1.CardTitle>
            <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.busy}</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Maintenance Due</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.maintenanceDue}</div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <tabs_1.Tabs defaultValue="overview" className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="overview">Machine Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="utilization">Utilization</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="maintenance">Maintenance</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Filters</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label_1.Label>Workcenter</label_1.Label>
                  <select_1.Select value={filter.workcenter} onValueChange={(value) => setFilter({ ...filter, workcenter: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="All workcenters"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">All workcenters</select_1.SelectItem>
                      <select_1.SelectItem value="PRINTING">Screen Printing</select_1.SelectItem>
                      <select_1.SelectItem value="HEAT_PRESS">Heat Press</select_1.SelectItem>
                      <select_1.SelectItem value="EMB">Embroidery</select_1.SelectItem>
                      <select_1.SelectItem value="DRYER">Dryer/Curing</select_1.SelectItem>
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
                      <select_1.SelectItem value="all">All statuses</select_1.SelectItem>
                      <select_1.SelectItem value="active">Active only</select_1.SelectItem>
                      <select_1.SelectItem value="available">Available</select_1.SelectItem>
                      <select_1.SelectItem value="busy">Busy</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="flex items-end">
                  <button_1.Button variant="outline" onClick={() => setFilter({ workcenter: '', status: '' })}>
                    Clear Filters
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Machines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map((machine) => {
            const workcenterInfo = workcenters[machine.workcenter];
            const WorkcenterIcon = workcenterInfo.icon;
            return (<card_1.Card key={machine.id} className="hover:shadow-md transition-shadow">
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${workcenterInfo.color}-100`}>
                          <WorkcenterIcon className={`w-5 h-5 text-${workcenterInfo.color}-600`}/>
                        </div>
                        <div>
                          <card_1.CardTitle className="text-lg">{machine.name}</card_1.CardTitle>
                          <card_1.CardDescription>{workcenterInfo.name}</card_1.CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <badge_1.Badge className={statusColors[machine.status]}>
                          {machine.status}
                        </badge_1.Badge>
                        {machine.maintenance_due && (<badge_1.Badge variant="destructive" className="text-xs">
                            <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1"/>
                            Maintenance Due
                          </badge_1.Badge>)}
                      </div>
                    </div>
                  </card_1.CardHeader>

                  <card_1.CardContent className="space-y-4">
                    {/* Current Job */}
                    {machine.current_run ? (<div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Current Job</span>
                          <badge_1.Badge variant="outline">{machine.current_run.method}</badge_1.Badge>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{machine.current_run.order.order_number}</p>
                          <p className="text-muted-foreground">{machine.current_run.order.brand.name}</p>
                        </div>
                      </div>) : (<div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                        <lucide_react_1.CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600"/>
                        <span className="text-sm text-green-800">Available for production</span>
                      </div>)}

                    {/* Utilization */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Today's Utilization</span>
                        <span>{machine.utilization}%</span>
                      </div>
                      <progress_1.Progress value={machine.utilization}/>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Specifications</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {Object.entries(machine.specifications).map(([key, value]) => (<div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span>{value}</span>
                          </div>))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <button_1.Button size="sm" variant="outline" className="flex-1">
                        <lucide_react_1.Edit className="w-3 h-3 mr-1"/>
                        Edit
                      </button_1.Button>
                      <button_1.Button size="sm" variant="outline" onClick={() => handleToggleActive(machine.id, machine.is_active)} className={machine.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}>
                        {machine.is_active ? 'Disable' : 'Enable'}
                      </button_1.Button>
                      <button_1.Button size="sm" variant="outline">
                        <lucide_react_1.Wrench className="w-3 h-3 mr-1"/>
                        Maintain
                      </button_1.Button>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>);
        })}
          </div>

          {filteredMachines.length === 0 && (<card_1.Card>
              <card_1.CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <lucide_react_1.Settings className="w-8 h-8 mx-auto mb-2 text-muted-foreground"/>
                  <p className="text-muted-foreground">No machines found matching your filters</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="utilization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(workcenters).map(([key, workcenter]) => {
            const workcenterMachines = machines.filter(m => m.workcenter === key);
            const avgUtilization = workcenterMachines.length > 0
                ? workcenterMachines.reduce((sum, m) => sum + m.utilization, 0) / workcenterMachines.length
                : 0;
            return (<card_1.Card key={key}>
                  <card_1.CardHeader>
                    <div className="flex items-center gap-2">
                      <workcenter.icon className={`w-5 h-5 text-${workcenter.color}-600`}/>
                      <card_1.CardTitle>{workcenter.name}</card_1.CardTitle>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Utilization</span>
                        <span className="text-lg font-bold">{Math.round(avgUtilization)}%</span>
                      </div>
                      <progress_1.Progress value={avgUtilization}/>
                      
                      <div className="space-y-2">
                        {workcenterMachines.map((machine) => (<div key={machine.id} className="flex justify-between items-center text-sm">
                            <span>{machine.name}</span>
                            <div className="flex items-center gap-2">
                              <span>{machine.utilization}%</span>
                              <div className="w-16">
                                <progress_1.Progress value={machine.utilization}/>
                              </div>
                            </div>
                          </div>))}
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>);
        })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Machines Requiring Maintenance</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                {machines.filter(m => m.maintenance_due).length > 0 ? (<div className="space-y-3">
                    {machines.filter(m => m.maintenance_due).map((machine) => (<div key={machine.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{machine.name}</p>
                          <p className="text-sm text-muted-foreground">{workcenters[machine.workcenter].name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <badge_1.Badge variant="destructive">Due</badge_1.Badge>
                          <button_1.Button size="sm">
                            <lucide_react_1.Wrench className="w-4 h-4 mr-1"/>
                            Schedule
                          </button_1.Button>
                        </div>
                      </div>))}
                  </div>) : (<div className="text-center py-8">
                    <lucide_react_1.CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500"/>
                    <p className="text-muted-foreground">All machines are up to date</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Maintenance Schedule</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-center py-8">
                  <lucide_react_1.Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground"/>
                  <p className="text-muted-foreground">Maintenance scheduling coming soon</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
