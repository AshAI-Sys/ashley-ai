import * as React from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Progress } from "../progress";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import { 
  Factory, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Calendar
} from "lucide-react";

export interface ProductionLineCapacity {
  id: string;
  name: string;
  type: "CUT" | "PRINT" | "SEW" | "PACK" | "QC";
  color: string;
  totalCapacity: number; // hours per day
  utilizedCapacity: number; // hours currently used
  availableCapacity: number; // hours available
  utilizationRate: number; // percentage
  efficiency: number; // percentage
  workerCount: number;
  avgWorkerCount: number;
  status: "OPTIMAL" | "OVERLOADED" | "UNDERUTILIZED" | "OFFLINE";
  upcomingTasks: number;
  completedToday: number;
  bottleneckRisk: "LOW" | "MEDIUM" | "HIGH";
}

export interface WorkerCapacitySummary {
  totalWorkers: number;
  activeWorkers: number;
  availableWorkers: number;
  onLeave: number;
  overtime: number;
  avgEfficiency: number;
  skillDistribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface CapacityOverviewProps {
  productionLines: ProductionLineCapacity[];
  workerSummary: WorkerCapacitySummary;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onLineClick?: (line: ProductionLineCapacity) => void;
  className?: string;
}

const statusColors = {
  OPTIMAL: "bg-ash-green-100 text-ash-green-800 border-ash-green-200",
  OVERLOADED: "bg-red-100 text-red-800 border-red-200",
  UNDERUTILIZED: "bg-ash-orange-100 text-ash-orange-800 border-ash-orange-200",
  OFFLINE: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  OPTIMAL: <CheckCircle className="h-4 w-4" />,
  OVERLOADED: <AlertTriangle className="h-4 w-4" />,
  UNDERUTILIZED: <TrendingDown className="h-4 w-4" />,
  OFFLINE: <Clock className="h-4 w-4" />,
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

export const CapacityOverview = React.forwardRef<HTMLDivElement, CapacityOverviewProps>(
  ({ 
    productionLines, 
    workerSummary, 
    selectedDate = new Date(),
    onDateChange,
    onLineClick,
    className 
  }, ref) => {
    // Generate week days for quick selection
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

    // Calculate overall metrics
    const totalUtilization = productionLines.length > 0 
      ? productionLines.reduce((sum, line) => sum + line.utilizationRate, 0) / productionLines.length 
      : 0;
      
    const totalEfficiency = productionLines.length > 0
      ? productionLines.reduce((sum, line) => sum + line.efficiency, 0) / productionLines.length
      : 0;

    const criticalLines = productionLines.filter(line => 
      line.status === "OVERLOADED" || line.bottleneckRisk === "HIGH"
    ).length;


    const getEfficiencyTrend = (efficiency: number) => {
      if (efficiency > 85) return <TrendingUp className="h-4 w-4 text-ash-green-600" />;
      if (efficiency < 70) return <TrendingDown className="h-4 w-4 text-red-600" />;
      return <Clock className="h-4 w-4 text-ash-orange-600" />;
    };

    return (
      <div ref={ref} className={cn("space-y-6", className)}>
        {/* Header with Date Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Production Capacity</h2>
            <p className="text-muted-foreground">
              Monitor production line utilization and worker allocation
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {weekDays.map((day) => (
                <Button
                  key={day.toISOString()}
                  variant={isSameDay(day, selectedDate) ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDateChange?.(day)}
                  className="text-xs min-w-12"
                >
                  <div className="text-center">
                    <div>{format(day, "EEE")}</div>
                    <div>{format(day, "dd")}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Factory className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Overall Utilization</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {totalUtilization.toFixed(1)}%
                </div>
                <Progress value={totalUtilization} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Avg Efficiency</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {totalEfficiency.toFixed(1)}%
                </div>
                <div className="flex items-center mt-1">
                  {getEfficiencyTrend(totalEfficiency)}
                  <span className="text-xs text-muted-foreground ml-1">
                    vs. last week
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Workers</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {workerSummary.activeWorkers}/{workerSummary.totalWorkers}
                </div>
                <div className="text-xs text-muted-foreground">
                  {workerSummary.onLeave} on leave • {workerSummary.overtime} overtime
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Critical Lines</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-red-600">
                  {criticalLines}
                </div>
                <div className="text-xs text-muted-foreground">
                  Require immediate attention
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Production Lines</CardTitle>
            <CardDescription>
              Current capacity utilization for {format(selectedDate, "EEEE, MMMM dd, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productionLines.map((line) => (
                <div
                  key={line.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onLineClick?.(line)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Line Header */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: line.color }}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeIcons[line.type]}</span>
                          <h3 className="font-semibold">{line.name}</h3>
                        </div>
                        
                        <Badge 
                          variant="outline"
                          className={cn("ml-auto", statusColors[line.status])}
                        >
                          {statusIcons[line.status]}
                          <span className="ml-1">{line.status}</span>
                        </Badge>
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Utilization</div>
                          <div className="font-medium">
                            {line.utilizedCapacity}h / {line.totalCapacity}h
                          </div>
                          <Progress 
                            value={line.utilizationRate} 
                            className="mt-1 h-2" 
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {line.utilizationRate.toFixed(1)}%
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Efficiency</div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{line.efficiency}%</span>
                            {getEfficiencyTrend(line.efficiency)}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Workers</div>
                          <div className="font-medium">
                            {line.workerCount} active
                          </div>
                          <div className="text-xs text-muted-foreground">
                            avg. {line.avgWorkerCount} per day
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Tasks</div>
                          <div className="font-medium">
                            {line.completedToday} done • {line.upcomingTasks} pending
                          </div>
                          <div className={cn("text-xs font-medium", bottleneckColors[line.bottleneckRisk])}>
                            {line.bottleneckRisk} bottleneck risk
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Worker Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Workforce Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-3">Availability</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Available</span>
                    <span className="font-medium">{workerSummary.availableWorkers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">On Leave</span>
                    <span className="font-medium">{workerSummary.onLeave}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Overtime</span>
                    <span className="font-medium">{workerSummary.overtime}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Performance</h4>
                <div>
                  <div className="text-2xl font-bold mb-1">
                    {workerSummary.avgEfficiency}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average efficiency
                  </div>
                  <Progress value={workerSummary.avgEfficiency} className="mt-2" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Skill Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Advanced</span>
                    <span className="font-medium">{workerSummary.skillDistribution.advanced}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Intermediate</span>
                    <span className="font-medium">{workerSummary.skillDistribution.intermediate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Beginner</span>
                    <span className="font-medium">{workerSummary.skillDistribution.beginner}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

CapacityOverview.displayName = "CapacityOverview";