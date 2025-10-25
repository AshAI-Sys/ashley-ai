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
exports.default = MobileProductionInterface;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const input_1 = require("@/components/ui/input");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
function MobileProductionInterface({ runId, operatorView = true, fullScreen = false, className = "", }) {
    const [currentRun, setCurrentRun] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [lastAction, setLastAction] = (0, react_1.useState)(null);
    const [showQRScanner, setShowQRScanner] = (0, react_1.useState)(false);
    const [completedCount, setCompletedCount] = (0, react_1.useState)("");
    const [rejectCount, setRejectCount] = (0, react_1.useState)("");
    // Touch-optimized state management
    const [touchStart, setTouchStart] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (runId) {
            fetchRunData();
        }
    }, [runId]);
    const fetchRunData = async () => {
        setLoading(true);
        try {
            // In real implementation, fetch from API
            // For demo, use mock data
            const mockRun = {
                id: runId || "mobile-run-001",
                operation_name: "Join shoulders",
                bundle_qty: 20,
                bundle_size: "M",
                completed: 12,
                rejected: 1,
                efficiency: 94,
                earnings: 27.0,
                status: "running",
                time_started: new Date(Date.now() - 1800000).toISOString(),
                estimated_completion: new Date(Date.now() + 900000).toISOString(),
            };
            setCurrentRun(mockRun);
            setCompletedCount(mockRun.completed.toString());
        }
        catch (error) {
            console.error("Failed to fetch run data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const quickActions = [
        {
            action: "complete_1",
            label: "+1 Done",
            icon: <lucide_react_1.Plus className="h-5 w-5"/>,
            color: "bg-green-600 hover:bg-green-700 text-white",
        },
        {
            action: "complete_5",
            label: "+5 Done",
            icon: <lucide_react_1.Plus className="h-5 w-5"/>,
            color: "bg-blue-600 hover:bg-blue-700 text-white",
        },
        {
            action: "reject_1",
            label: "+1 Reject",
            icon: <lucide_react_1.XCircle className="h-5 w-5"/>,
            color: "bg-red-600 hover:bg-red-700 text-white",
        },
        {
            action: "pause",
            label: "Pause",
            icon: <lucide_react_1.Pause className="h-5 w-5"/>,
            color: "bg-yellow-600 hover:bg-yellow-700 text-white",
        },
    ];
    const handleQuickAction = async (action) => {
        if (!currentRun)
            return;
        setLastAction(action);
        const updatedRun = { ...currentRun };
        switch (action) {
            case "complete_1":
                updatedRun.completed = Math.min(updatedRun.completed + 1, updatedRun.bundle_qty);
                updatedRun.earnings = updatedRun.completed * 2.25; // Base rate
                break;
            case "complete_5":
                updatedRun.completed = Math.min(updatedRun.completed + 5, updatedRun.bundle_qty);
                updatedRun.earnings = updatedRun.completed * 2.25;
                break;
            case "reject_1":
                updatedRun.rejected = updatedRun.rejected + 1;
                break;
            case "pause":
                updatedRun.status =
                    updatedRun.status === "running" ? "paused" : "running";
                break;
        }
        // Update efficiency based on progress
        const _progressPercentage = (updatedRun.completed / updatedRun.bundle_qty) * 100;
        const timeElapsed = (Date.now() - new Date(updatedRun.time_started).getTime()) / (1000 * 60);
        const expectedTime = updatedRun.completed * 1.5; // SMV
        updatedRun.efficiency = Math.round((expectedTime / Math.max(timeElapsed, 1)) * 100);
        setCurrentRun(updatedRun);
        setCompletedCount(updatedRun.completed.toString());
        // Provide haptic feedback for mobile
        if ("vibrate" in navigator) {
            navigator.vibrate(50);
        }
        // Clear action indicator after 1 second
        setTimeout(() => setLastAction(null), 1000);
    };
    const handleManualUpdate = () => {
        if (!currentRun)
            return;
        const completed = Math.max(0, Math.min(parseInt(completedCount) || 0, currentRun.bundle_qty));
        const rejected = Math.max(0, parseInt(rejectCount) || 0);
        const updatedRun = {
            ...currentRun,
            completed,
            rejected,
            earnings: completed * 2.25,
        };
        setCurrentRun(updatedRun);
        handleQuickAction("manual_update");
    };
    const getProgressPercentage = () => {
        if (!currentRun)
            return 0;
        return Math.round((currentRun.completed / currentRun.bundle_qty) * 100);
    };
    const getStatusColor = (status) => {
        if (!status)
            return "bg-gray-100 text-gray-800";
        switch (status.toLowerCase()) {
            case "running":
                return "bg-green-100 text-green-800";
            case "paused":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getTimeWorked = () => {
        if (!currentRun)
            return "0m";
        const minutes = Math.round((Date.now() - new Date(currentRun.time_started).getTime()) / (1000 * 60));
        return `${minutes}m`;
    };
    if (loading) {
        return (<div className={`flex min-h-screen items-center justify-center ${className}`}>
        <div className="text-center">
          <lucide_react_1.RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600"/>
          <p className="text-lg">Loading production interface...</p>
        </div>
      </div>);
    }
    if (!currentRun) {
        return (<div className={`flex min-h-screen flex-col items-center justify-center p-6 ${className}`}>
        <div className="max-w-md text-center">
          <lucide_react_1.Smartphone className="mx-auto mb-6 h-16 w-16 text-muted-foreground"/>
          <h2 className="mb-4 text-2xl font-bold">Production Interface</h2>
          <p className="mb-6 text-muted-foreground">
            Scan a bundle QR code or select an active run to begin
          </p>
          <button_1.Button size="lg" className="w-full" onClick={() => setShowQRScanner(true)}>
            <lucide_react_1.QrCode className="mr-2 h-5 w-5"/>
            Scan Bundle QR
          </button_1.Button>
        </div>
      </div>);
    }
    const containerClass = fullScreen
        ? "min-h-screen bg-gray-50"
        : "min-h-[600px]";
    return (<div className={`${containerClass} ${className}`}>
      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Header */}
        <card_1.Card className="border-2 border-blue-200 bg-blue-50">
          <card_1.CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <card_1.CardTitle className="text-lg">
                  {currentRun.operation_name}
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Bundle Size {currentRun.bundle_size} • {currentRun.bundle_qty}{" "}
                  pieces
                </card_1.CardDescription>
              </div>
              <badge_1.Badge className={getStatusColor(currentRun.status)}>
                {currentRun.status}
              </badge_1.Badge>
            </div>
          </card_1.CardHeader>
        </card_1.Card>

        {/* Progress Overview */}
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600">
                {getProgressPercentage()}%
              </div>
              <div className="text-lg text-muted-foreground">
                {currentRun.completed} of {currentRun.bundle_qty} complete
              </div>
              <progress_1.Progress value={getProgressPercentage()} className="mt-3 h-3"/>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-green-50 p-3">
                <lucide_react_1.CheckCircle className="mx-auto mb-1 h-6 w-6 text-green-600"/>
                <div className="text-xl font-bold text-green-600">
                  {currentRun.completed}
                </div>
                <div className="text-xs text-green-700">Completed</div>
              </div>

              <div className="rounded-lg bg-red-50 p-3">
                <lucide_react_1.XCircle className="mx-auto mb-1 h-6 w-6 text-red-600"/>
                <div className="text-xl font-bold text-red-600">
                  {currentRun.rejected}
                </div>
                <div className="text-xs text-red-700">Rejected</div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <lucide_react_1.Target className="mx-auto mb-1 h-6 w-6 text-gray-600"/>
                <div className="text-xl font-bold text-gray-600">
                  {currentRun.bundle_qty -
            currentRun.completed -
            currentRun.rejected}
                </div>
                <div className="text-xs text-gray-700">Remaining</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Performance Metrics */}
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <lucide_react_1.Zap className="mx-auto mb-1 h-6 w-6 text-blue-600"/>
                <div className="text-xl font-bold text-blue-600">
                  {currentRun.efficiency}%
                </div>
                <div className="text-xs text-blue-700">Efficiency</div>
              </div>

              <div className="rounded-lg bg-green-50 p-3 text-center">
                <lucide_react_1.DollarSign className="mx-auto mb-1 h-6 w-6 text-green-600"/>
                <div className="text-xl font-bold text-green-600">
                  ₱{currentRun.earnings.toFixed(2)}
                </div>
                <div className="text-xs text-green-700">Earned</div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <lucide_react_1.Clock className="h-4 w-4"/>
                <span>Time worked: {getTimeWorked()}</span>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Quick Actions */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-center">Quick Actions</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(action => (<button_1.Button key={action.action} onClick={() => handleQuickAction(action.action)} className={`${action.color} flex h-16 flex-col gap-1 text-lg font-semibold ${lastAction === action.action ? "animate-pulse" : ""}`} disabled={currentRun.status === "paused" && action.action !== "pause"}>
                  {action.icon}
                  {action.label}
                </button_1.Button>))}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Manual Entry */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-center text-sm">Manual Entry</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Completed
                  </label>
                  <input_1.Input type="number" value={completedCount} onChange={e => setCompletedCount(e.target.value)} className="h-12 text-center text-lg" min="0" max={currentRun.bundle_qty}/>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Rejected
                  </label>
                  <input_1.Input type="number" value={rejectCount} onChange={e => setRejectCount(e.target.value)} className="h-12 text-center text-lg" min="0"/>
                </div>
              </div>

              <button_1.Button onClick={handleManualUpdate} className="h-12 w-full text-lg" variant="outline">
                Update Progress
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Complete Bundle Button */}
        {getProgressPercentage() >= 80 && (<card_1.Card className="border-2 border-green-200 bg-green-50">
            <card_1.CardContent className="pt-6">
              <button_1.Button onClick={() => handleQuickAction("complete")} className="h-16 w-full bg-green-600 text-xl font-bold text-white hover:bg-green-700">
                <lucide_react_1.Square className="mr-2 h-6 w-6"/>
                Complete Bundle
              </button_1.Button>
              <p className="mt-2 text-center text-sm text-green-700">
                Bundle is nearly complete!
              </p>
            </card_1.CardContent>
          </card_1.Card>)}

        {/* Action Feedback */}
        {lastAction && (<div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
            <div className="rounded-lg bg-black bg-opacity-75 px-4 py-2 text-white">
              Action recorded: {lastAction.replace("_", " ")}
            </div>
          </div>)}

        {/* Emergency Actions */}
        <card_1.Card className="border border-orange-200">
          <card_1.CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3">
              <button_1.Button variant="outline" className="h-12 border-orange-600 text-orange-600" onClick={() => setShowQRScanner(true)}>
                <lucide_react_1.QrCode className="mr-2 h-5 w-5"/>
                New Bundle
              </button_1.Button>
              <button_1.Button variant="outline" className="h-12 border-blue-600 text-blue-600" onClick={fetchRunData}>
                <lucide_react_1.RefreshCw className="mr-2 h-5 w-5"/>
                Refresh
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
