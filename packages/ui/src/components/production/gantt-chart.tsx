import * as React from "react";
import { format, startOfDay, addDays, differenceInDays, isWithinInterval } from "date-fns";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Progress } from "../progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";
import { 
  Calendar, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Pause 
} from "lucide-react";

export interface GanttTask {
  id: string;
  name: string;
  orderId: string;
  orderNumber: string;
  stage: string;
  startDate: Date;
  endDate: Date;
  actualStart?: Date;
  actualEnd?: Date;
  progress: number; // 0-100
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED" | "PAUSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  productionLine: {
    id: string;
    name: string;
    color: string;
  };
  dependencies?: string[]; // task IDs
  estimatedHours: number;
  actualHours?: number;
}

export interface GanttChartProps {
  tasks: GanttTask[];
  startDate?: Date;
  endDate?: Date;
  onTaskClick?: (task: GanttTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  className?: string;
}

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
  HIGH: <AlertTriangle className="h-3 w-3 text-ash-orange-600" />,
  URGENT: <AlertTriangle className="h-3 w-3 text-red-600" />,
};

const statusIcons = {
  PLANNED: <Calendar className="h-3 w-3 text-gray-600" />,
  IN_PROGRESS: <Play className="h-3 w-3 text-ash-blue-600" />,
  COMPLETED: <CheckCircle className="h-3 w-3 text-ash-green-600" />,
  DELAYED: <AlertTriangle className="h-3 w-3 text-red-600" />,
  PAUSED: <Pause className="h-3 w-3 text-ash-orange-600" />,
};

export const GanttChart = React.forwardRef<HTMLDivElement, GanttChartProps>(
  ({ 
    tasks, 
    startDate: propStartDate, 
    endDate: propEndDate, 
    onTaskClick, 
    onTaskUpdate,
    className 
  }, ref) => {
    // Calculate date range
    const allDates = tasks.flatMap(task => [
      task.startDate,
      task.endDate,
      task.actualStart,
      task.actualEnd,
    ]).filter(Boolean) as Date[];

    const startDate = propStartDate || 
      (allDates.length > 0 ? 
        startOfDay(new Date(Math.min(...allDates.map(d => d.getTime())))) : 
        startOfDay(new Date()));
        
    const endDate = propEndDate || 
      (allDates.length > 0 ? 
        startOfDay(addDays(new Date(Math.max(...allDates.map(d => d.getTime()))), 1)) : 
        addDays(startOfDay(new Date()), 30));

    const totalDays = differenceInDays(endDate, startDate) + 1;
    const dayWidth = Math.max(40, Math.min(100, 800 / totalDays)); // Responsive day width

    // Generate date headers
    const dateHeaders = Array.from({ length: totalDays }, (_, index) => 
      addDays(startDate, index)
    );

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
    }, {} as Record<string, { line: GanttTask["productionLine"]; tasks: GanttTask[] }>);

    const calculateTaskPosition = (task: GanttTask) => {
      const taskStart = task.actualStart || task.startDate;
      const taskEnd = task.actualEnd || task.endDate;
      
      const startOffset = Math.max(0, differenceInDays(taskStart, startDate));
      const duration = differenceInDays(taskEnd, taskStart) + 1;
      
      return {
        left: startOffset * dayWidth,
        width: duration * dayWidth,
      };
    };

    const handleTaskClick = (task: GanttTask) => {
      onTaskClick?.(task);
    };

    return (
      <TooltipProvider>
        <div ref={ref} className={cn("space-y-6", className)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Production Schedule</span>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{format(startDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")}</span>
                  <span>{tasks.length} tasks</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Timeline Header */}
                  <div className="sticky top-0 z-10 bg-white border-b">
                    <div className="flex">
                      {/* Task info column */}
                      <div className="w-80 flex-shrink-0 border-r bg-gray-50 p-4">
                        <div className="text-sm font-medium text-gray-700">
                          Production Tasks
                        </div>
                      </div>
                      
                      {/* Date headers */}
                      <div className="flex bg-gray-50">
                        {dateHeaders.map((date, index) => (
                          <div
                            key={index}
                            className="border-r border-gray-200 p-2 text-center min-w-0"
                            style={{ width: dayWidth }}
                          >
                            <div className="text-xs font-medium text-gray-600">
                              {format(date, "EEE")}
                            </div>
                            <div className="text-sm text-gray-900">
                              {format(date, "dd")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Task Rows */}
                  <div className="space-y-2">
                    {Object.entries(tasksByLine).map(([lineId, { line, tasks: lineTasks }]) => (
                      <div key={lineId} className="border-b border-gray-100">
                        {/* Production Line Header */}
                        <div className="flex bg-gray-25">
                          <div className="w-80 flex-shrink-0 border-r p-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: line.color }}
                              />
                              <span className="font-medium text-gray-900">
                                {line.name}
                              </span>
                            </div>
                          </div>
                          <div 
                            className="relative bg-gray-25 border-r"
                            style={{ width: totalDays * dayWidth }}
                          />
                        </div>

                        {/* Tasks for this line */}
                        {lineTasks.map((task) => {
                          const { left, width } = calculateTaskPosition(task);
                          
                          return (
                            <div key={task.id} className="flex border-b border-gray-50 hover:bg-gray-25">
                              {/* Task Info */}
                              <div className="w-80 flex-shrink-0 border-r p-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {statusIcons[task.status]}
                                    {priorityIcons[task.priority]}
                                    <span className="text-sm font-medium truncate">
                                      {task.name}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{task.orderNumber}</span>
                                    <span>•</span>
                                    <span>{task.stage}</span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <Badge 
                                      variant={
                                        task.status === "COMPLETED" ? "success" :
                                        task.status === "DELAYED" ? "destructive" :
                                        task.status === "IN_PROGRESS" ? "info" :
                                        "outline"
                                      }
                                      className="text-xs"
                                    >
                                      {task.status}
                                    </Badge>
                                    
                                    {task.assignedTo && (
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span className="text-xs truncate max-w-20">
                                          {task.assignedTo.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {task.progress > 0 && task.progress < 100 && (
                                    <div className="space-y-1">
                                      <Progress value={task.progress} className="h-1" />
                                      <span className="text-xs text-muted-foreground">
                                        {task.progress}% complete
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Timeline Bar */}
                              <div 
                                className="relative flex-1"
                                style={{ minHeight: "80px" }}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        "absolute top-1/2 -translate-y-1/2 h-6 rounded cursor-pointer border-l-4 shadow-sm hover:shadow-md transition-shadow",
                                        statusColors[task.status],
                                        priorityColors[task.priority]
                                      )}
                                      style={{
                                        left: left,
                                        width: Math.max(width, 20), // Minimum width for visibility
                                      }}
                                      onClick={() => handleTaskClick(task)}
                                    >
                                      <div className="h-full flex items-center px-2">
                                        <span className="text-xs text-white font-medium truncate">
                                          {task.name}
                                        </span>
                                      </div>

                                      {/* Progress overlay */}
                                      {task.progress > 0 && task.progress < 100 && (
                                        <div
                                          className="absolute top-0 left-0 h-full bg-white bg-opacity-20 rounded-r"
                                          style={{ width: `${task.progress}%` }}
                                        />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  
                                  <TooltipContent side="top" className="max-w-sm">
                                    <div className="space-y-2">
                                      <div className="font-medium">{task.name}</div>
                                      <div className="text-sm space-y-1">
                                        <div>Order: {task.orderNumber}</div>
                                        <div>Stage: {task.stage}</div>
                                        <div>
                                          Duration: {format(task.startDate, "MMM dd")} - {format(task.endDate, "MMM dd")}
                                        </div>
                                        <div>Progress: {task.progress}%</div>
                                        {task.assignedTo && (
                                          <div>Assigned: {task.assignedTo.name}</div>
                                        )}
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {task.estimatedHours}h estimated
                                            {task.actualHours && ` / ${task.actualHours}h actual`}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>

                                {/* Today indicator */}
                                {isWithinInterval(new Date(), { start: startDate, end: endDate }) && (
                                  <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                                    style={{
                                      left: differenceInDays(new Date(), startDate) * dayWidth,
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }
);

GanttChart.displayName = "GanttChart";