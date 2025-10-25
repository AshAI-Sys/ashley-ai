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
exports.CapacityOverview = void 0;
const React = __importStar(require("react"));
const date_fns_1 = require("date-fns");
const card_1 = require("../card");
const badge_1 = require("../badge");
const progress_1 = require("../progress");
const button_1 = require("../button");
const utils_1 = require("../../lib/utils");
const lucide_react_1 = require("lucide-react");
const statusColors = {
    OPTIMAL: "bg-ash-green-100 text-ash-green-800 border-ash-green-200",
    OVERLOADED: "bg-red-100 text-red-800 border-red-200",
    UNDERUTILIZED: "bg-ash-orange-100 text-ash-orange-800 border-ash-orange-200",
    OFFLINE: "bg-gray-100 text-gray-800 border-gray-200",
};
const statusIcons = {
    OPTIMAL: <lucide_react_1.CheckCircle className="h-4 w-4"/>,
    OVERLOADED: <lucide_react_1.AlertTriangle className="h-4 w-4"/>,
    UNDERUTILIZED: <lucide_react_1.TrendingDown className="h-4 w-4"/>,
    OFFLINE: <lucide_react_1.Clock className="h-4 w-4"/>,
};
const typeIcons = {
    CUT: "✂️",
    PRINT: "🖨️",
    SEW: "🧵",
    PACK: "📦",
    QC: "🔍",
};
const bottleneckColors = {
    LOW: "text-ash-green-600",
    MEDIUM: "text-ash-orange-600",
    HIGH: "text-red-600",
};
exports.CapacityOverview = React.forwardRef(({ productionLines, workerSummary, selectedDate = new Date(), onDateChange, onLineClick, className, }, ref) => {
    // Generate week days for quick selection
    const weekStart = (0, date_fns_1.startOfWeek)(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, index) => (0, date_fns_1.addDays)(weekStart, index));
    // Calculate overall metrics
    const totalUtilization = productionLines.length > 0
        ? productionLines.reduce((sum, line) => sum + line.utilizationRate, 0) /
            productionLines.length
        : 0;
    const totalEfficiency = productionLines.length > 0
        ? productionLines.reduce((sum, line) => sum + line.efficiency, 0) /
            productionLines.length
        : 0;
    const criticalLines = productionLines.filter(line => line.status === "OVERLOADED" || line.bottleneckRisk === "HIGH").length;
    const getEfficiencyTrend = (efficiency) => {
        if (efficiency > 85)
            return <lucide_react_1.TrendingUp className="text-ash-green-600 h-4 w-4"/>;
        if (efficiency < 70)
            return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>;
        return <lucide_react_1.Clock className="text-ash-orange-600 h-4 w-4"/>;
    };
    return (<div ref={ref} className={(0, utils_1.cn)("space-y-6", className)}>
        {/* Header with Date Selection */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Production Capacity</h2>
            <p className="text-muted-foreground">
              Monitor production line utilization and worker allocation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <lucide_react_1.Calendar className="text-muted-foreground h-4 w-4"/>
            <div className="flex gap-1">
              {weekDays.map(day => (<button_1.Button key={day.toISOString()} variant={(0, date_fns_1.isSameDay)(day, selectedDate) ? "default" : "outline"} size="sm" onClick={() => onDateChange?.(day)} className="min-w-12 text-xs">
                  <div className="text-center">
                    <div>{(0, date_fns_1.format)(day, "EEE")}</div>
                    <div>{(0, date_fns_1.format)(day, "dd")}</div>
                  </div>
                </button_1.Button>))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <lucide_react_1.Factory className="text-muted-foreground h-4 w-4"/>
                <span className="text-sm font-medium">Overall Utilization</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {totalUtilization.toFixed(1)}%
                </div>
                <progress_1.Progress value={totalUtilization} className="mt-2"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <lucide_react_1.TrendingUp className="text-muted-foreground h-4 w-4"/>
                <span className="text-sm font-medium">Avg Efficiency</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {totalEfficiency.toFixed(1)}%
                </div>
                <div className="mt-1 flex items-center">
                  {getEfficiencyTrend(totalEfficiency)}
                  <span className="text-muted-foreground ml-1 text-xs">
                    vs. last week
                  </span>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <lucide_react_1.Users className="text-muted-foreground h-4 w-4"/>
                <span className="text-sm font-medium">Active Workers</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {workerSummary.activeWorkers}/{workerSummary.totalWorkers}
                </div>
                <div className="text-muted-foreground text-xs">
                  {workerSummary.onLeave} on leave • {workerSummary.overtime}{" "}
                  overtime
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <lucide_react_1.AlertTriangle className="text-muted-foreground h-4 w-4"/>
                <span className="text-sm font-medium">Critical Lines</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-red-600">
                  {criticalLines}
                </div>
                <div className="text-muted-foreground text-xs">
                  Require immediate attention
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Production Lines */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Production Lines</card_1.CardTitle>
            <card_1.CardDescription>
              Current capacity utilization for{" "}
              {(0, date_fns_1.format)(selectedDate, "EEEE, MMMM dd, yyyy")}
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {productionLines.map(line => (<div key={line.id} className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md" onClick={() => onLineClick?.(line)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Line Header */}
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 flex-shrink-0 rounded-full" style={{ backgroundColor: line.color }}/>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {typeIcons[line.type]}
                          </span>
                          <h3 className="font-semibold">{line.name}</h3>
                        </div>

                        <badge_1.Badge variant="outline" className={(0, utils_1.cn)("ml-auto", statusColors[line.status])}>
                          {statusIcons[line.status]}
                          <span className="ml-1">{line.status}</span>
                        </badge_1.Badge>
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <div className="text-muted-foreground">
                            Utilization
                          </div>
                          <div className="font-medium">
                            {line.utilizedCapacity}h / {line.totalCapacity}h
                          </div>
                          <progress_1.Progress value={line.utilizationRate} className="mt-1 h-2"/>
                          <div className="text-muted-foreground mt-1 text-xs">
                            {line.utilizationRate.toFixed(1)}%
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">
                            Efficiency
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {line.efficiency}%
                            </span>
                            {getEfficiencyTrend(line.efficiency)}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Workers</div>
                          <div className="font-medium">
                            {line.workerCount} active
                          </div>
                          <div className="text-muted-foreground text-xs">
                            avg. {line.avgWorkerCount} per day
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Tasks</div>
                          <div className="font-medium">
                            {line.completedToday} done • {line.upcomingTasks}{" "}
                            pending
                          </div>
                          <div className={(0, utils_1.cn)("text-xs font-medium", bottleneckColors[line.bottleneckRisk])}>
                            {line.bottleneckRisk} bottleneck risk
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Worker Summary */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Users className="h-5 w-5"/>
              Workforce Overview
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <h4 className="mb-3 font-medium">Availability</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Available</span>
                    <span className="font-medium">
                      {workerSummary.availableWorkers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">On Leave</span>
                    <span className="font-medium">{workerSummary.onLeave}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Overtime</span>
                    <span className="font-medium">
                      {workerSummary.overtime}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-medium">Performance</h4>
                <div>
                  <div className="mb-1 text-2xl font-bold">
                    {workerSummary.avgEfficiency}%
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Average efficiency
                  </div>
                  <progress_1.Progress value={workerSummary.avgEfficiency} className="mt-2"/>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-medium">Skill Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Advanced</span>
                    <span className="font-medium">
                      {workerSummary.skillDistribution.advanced}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Intermediate</span>
                    <span className="font-medium">
                      {workerSummary.skillDistribution.intermediate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Beginner</span>
                    <span className="font-medium">
                      {workerSummary.skillDistribution.beginner}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
});
exports.CapacityOverview.displayName = "CapacityOverview";
