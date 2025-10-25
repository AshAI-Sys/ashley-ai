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
exports.GanttChart = void 0;
const React = __importStar(require("react"));
const date_fns_1 = require("date-fns");
const utils_1 = require("../../lib/utils");
const card_1 = require("../card");
const badge_1 = require("../badge");
const progress_1 = require("../progress");
const tooltip_1 = require("../tooltip");
const lucide_react_1 = require("lucide-react");
const statusColors = {
    PLANNED: "bg-gray-300",
    IN_PROGRESS: "bg-ash-blue-500",
    COMPLETED: "bg-ash-green-500",
    DELAYED: "bg-red-500",
    PAUSED: "bg-ash-orange-400",
};
const priorityColors = {
    LOW: "border-l-gray-400",
    NORMAL: "border-l-ash-blue-400",
    HIGH: "border-l-ash-orange-400",
    URGENT: "border-l-red-400",
};
const priorityIcons = {
    LOW: null,
    NORMAL: null,
    HIGH: <lucide_react_1.AlertTriangle className="text-ash-orange-600 h-3 w-3"/>,
    URGENT: <lucide_react_1.AlertTriangle className="h-3 w-3 text-red-600"/>,
};
const statusIcons = {
    PLANNED: <lucide_react_1.Calendar className="h-3 w-3 text-gray-600"/>,
    IN_PROGRESS: <lucide_react_1.Play className="text-ash-blue-600 h-3 w-3"/>,
    COMPLETED: <lucide_react_1.CheckCircle className="text-ash-green-600 h-3 w-3"/>,
    DELAYED: <lucide_react_1.AlertTriangle className="h-3 w-3 text-red-600"/>,
    PAUSED: <lucide_react_1.Pause className="text-ash-orange-600 h-3 w-3"/>,
};
exports.GanttChart = React.forwardRef(({ tasks, startDate: propStartDate, endDate: propEndDate, onTaskClick, className, }, ref) => {
    // Calculate date range
    const allDates = tasks
        .flatMap(task => [
        task.startDate,
        task.endDate,
        task.actualStart,
        task.actualEnd,
    ])
        .filter(Boolean);
    const startDate = propStartDate ||
        (allDates.length > 0
            ? (0, date_fns_1.startOfDay)(new Date(Math.min(...allDates.map(d => d.getTime()))))
            : (0, date_fns_1.startOfDay)(new Date()));
    const endDate = propEndDate ||
        (allDates.length > 0
            ? (0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(new Date(Math.max(...allDates.map(d => d.getTime()))), 1))
            : (0, date_fns_1.addDays)((0, date_fns_1.startOfDay)(new Date()), 30));
    const totalDays = (0, date_fns_1.differenceInDays)(endDate, startDate) + 1;
    const dayWidth = Math.max(40, Math.min(100, 800 / totalDays)); // Responsive day width
    // Generate date headers
    const dateHeaders = Array.from({ length: totalDays }, (_, index) => (0, date_fns_1.addDays)(startDate, index));
    // Group tasks by production line
    const tasksByLine = tasks.reduce((acc, task) => {
        const lineId = task.productionLine.id;
        if (!acc[lineId]) {
            acc[lineId] = {
                line: task.productionLine,
                tasks: [],
            };
        }
        acc[lineId].tasks.push(task);
        return acc;
    }, {});
    const calculateTaskPosition = (task) => {
        const taskStart = task.actualStart || task.startDate;
        const taskEnd = task.actualEnd || task.endDate;
        const startOffset = Math.max(0, (0, date_fns_1.differenceInDays)(taskStart, startDate));
        const duration = (0, date_fns_1.differenceInDays)(taskEnd, taskStart) + 1;
        return {
            left: startOffset * dayWidth,
            width: duration * dayWidth,
        };
    };
    const handleTaskClick = (task) => {
        onTaskClick?.(task);
    };
    return (<tooltip_1.TooltipProvider>
        <div ref={ref} className={(0, utils_1.cn)("space-y-6", className)}>
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center justify-between">
                <span>Production Schedule</span>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <span>
                    {(0, date_fns_1.format)(startDate, "MMM dd")} -{" "}
                    {(0, date_fns_1.format)(endDate, "MMM dd, yyyy")}
                  </span>
                  <span>{tasks.length} tasks</span>
                </div>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Timeline Header */}
                  <div className="sticky top-0 z-10 border-b bg-white">
                    <div className="flex">
                      {/* Task info column */}
                      <div className="w-80 flex-shrink-0 border-r bg-gray-50 p-4">
                        <div className="text-sm font-medium text-gray-700">
                          Production Tasks
                        </div>
                      </div>

                      {/* Date headers */}
                      <div className="flex bg-gray-50">
                        {dateHeaders.map((date, index) => (<div key={index} className="min-w-0 border-r border-gray-200 p-2 text-center" style={{ width: dayWidth }}>
                            <div className="text-xs font-medium text-gray-600">
                              {(0, date_fns_1.format)(date, "EEE")}
                            </div>
                            <div className="text-sm text-gray-900">
                              {(0, date_fns_1.format)(date, "dd")}
                            </div>
                          </div>))}
                      </div>
                    </div>
                  </div>

                  {/* Task Rows */}
                  <div className="space-y-2">
                    {Object.entries(tasksByLine).map(([lineId, { line, tasks: lineTasks }]) => (<div key={lineId} className="border-b border-gray-100">
                          {/* Production Line Header */}
                          <div className="bg-gray-25 flex">
                            <div className="w-80 flex-shrink-0 border-r p-3">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: line.color }}/>
                                <span className="font-medium text-gray-900">
                                  {line.name}
                                </span>
                              </div>
                            </div>
                            <div className="bg-gray-25 relative border-r" style={{ width: totalDays * dayWidth }}/>
                          </div>

                          {/* Tasks for this line */}
                          {lineTasks.map(task => {
                const { left, width } = calculateTaskPosition(task);
                return (<div key={task.id} className="hover:bg-gray-25 flex border-b border-gray-50">
                                {/* Task Info */}
                                <div className="w-80 flex-shrink-0 border-r p-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      {statusIcons[task.status]}
                                      {priorityIcons[task.priority]}
                                      <span className="truncate text-sm font-medium">
                                        {task.name}
                                      </span>
                                    </div>

                                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                      <span>{task.orderNumber}</span>
                                      <span>•</span>
                                      <span>{task.stage}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <badge_1.Badge variant={task.status === "COMPLETED"
                        ? "success"
                        : task.status === "DELAYED"
                            ? "destructive"
                            : task.status === "IN_PROGRESS"
                                ? "info"
                                : "outline"} className="text-xs">
                                        {task.status}
                                      </badge_1.Badge>

                                      {task.assignedTo && (<div className="flex items-center gap-1">
                                          <lucide_react_1.User className="h-3 w-3"/>
                                          <span className="max-w-20 truncate text-xs">
                                            {task.assignedTo.name}
                                          </span>
                                        </div>)}
                                    </div>

                                    {task.progress > 0 &&
                        task.progress < 100 && (<div className="space-y-1">
                                          <progress_1.Progress value={task.progress} className="h-1"/>
                                          <span className="text-muted-foreground text-xs">
                                            {task.progress}% complete
                                          </span>
                                        </div>)}
                                  </div>
                                </div>

                                {/* Timeline Bar */}
                                <div className="relative flex-1" style={{ minHeight: "80px" }}>
                                  <tooltip_1.Tooltip>
                                    <tooltip_1.TooltipTrigger asChild>
                                      <div className={(0, utils_1.cn)("absolute top-1/2 h-6 -translate-y-1/2 cursor-pointer rounded border-l-4 shadow-sm transition-shadow hover:shadow-md", statusColors[task.status], priorityColors[task.priority])} style={{
                        left: left,
                        width: Math.max(width, 20), // Minimum width for visibility
                    }} onClick={() => handleTaskClick(task)}>
                                        <div className="flex h-full items-center px-2">
                                          <span className="truncate text-xs font-medium text-white">
                                            {task.name}
                                          </span>
                                        </div>

                                        {/* Progress overlay */}
                                        {task.progress > 0 &&
                        task.progress < 100 && (<div className="bg-opacity-20 absolute top-0 left-0 h-full rounded-r bg-white" style={{
                            width: `${task.progress}%`,
                        }}/>)}
                                      </div>
                                    </tooltip_1.TooltipTrigger>

                                    <tooltip_1.TooltipContent side="top" className="max-w-sm">
                                      <div className="space-y-2">
                                        <div className="font-medium">
                                          {task.name}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                          <div>Order: {task.orderNumber}</div>
                                          <div>Stage: {task.stage}</div>
                                          <div>
                                            Duration:{" "}
                                            {(0, date_fns_1.format)(task.startDate, "MMM dd")} -{" "}
                                            {(0, date_fns_1.format)(task.endDate, "MMM dd")}
                                          </div>
                                          <div>Progress: {task.progress}%</div>
                                          {task.assignedTo && (<div>
                                              Assigned: {task.assignedTo.name}
                                            </div>)}
                                          <div className="flex items-center gap-1">
                                            <lucide_react_1.Clock className="h-3 w-3"/>
                                            <span>
                                              {task.estimatedHours}h estimated
                                              {task.actualHours &&
                        ` / ${task.actualHours}h actual`}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </tooltip_1.TooltipContent>
                                  </tooltip_1.Tooltip>

                                  {/* Today indicator */}
                                  {(0, date_fns_1.isWithinInterval)(new Date(), {
                        start: startDate,
                        end: endDate,
                    }) && (<div className="absolute top-0 bottom-0 z-10 w-0.5 bg-red-500" style={{
                            left: (0, date_fns_1.differenceInDays)(new Date(), startDate) * dayWidth,
                        }}/>)}
                                </div>
                              </div>);
            })}
                        </div>))}
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </tooltip_1.TooltipProvider>);
});
exports.GanttChart.displayName = "GanttChart";
