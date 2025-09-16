import * as React from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Button } from "../button";
import { Progress } from "../progress";
import { Alert, AlertDescription } from "../alert";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import { cn } from "../../lib/utils";
import { 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  ShoppingCart,
  Calendar,
  DollarSign,
  Factory,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Equal
} from "lucide-react";

export interface MRPItem {
  id: string;
  materialName: string;
  currentStock: number;
  totalDemand: number;
  plannedSupply: number;
  projectedStock: number;
  shortfall: number;
  unit: string;
  reorderPoint: number;
  minimumStock: number;
  recommendedAction: "ORDER_NOW" | "ORDER_SOON" | "ADEQUATE" | "EXCESS";
  urgentOrders: Array<{
    id: string;
    orderNumber: string;
    requiredDate: Date;
    quantity: number;
  }>;
  supplier?: string;
  leadTime: number;
  costPerUnit: number;
}

export interface StockProjectionData {
  date: string;
  beginningStock: number;
  receipts: number;
  demands: number;
  endingStock: number;
  shortfall: number;
  actions: string[];
}

export interface MRPDashboardProps {
  materials: MRPItem[];
  projections?: StockProjectionData[];
  selectedMaterial?: string;
  onMaterialSelect?: (materialId: string) => void;
  onCreatePurchaseOrder?: (materialId: string, quantity: number) => void;
  onOptimizePlan?: () => void;
  className?: string;
}

const actionColors = {
  ORDER_NOW: "bg-red-100 text-red-800 border-red-200",
  ORDER_SOON: "bg-ash-orange-100 text-ash-orange-800 border-ash-orange-200",
  ADEQUATE: "bg-ash-green-100 text-ash-green-800 border-ash-green-200",
  EXCESS: "bg-gray-100 text-gray-800 border-gray-200",
};

const actionIcons = {
  ORDER_NOW: <AlertTriangle className="h-4 w-4" />,
  ORDER_SOON: <Clock className="h-4 w-4" />,
  ADEQUATE: <CheckCircle className="h-4 w-4" />,
  EXCESS: <ArrowUp className="h-4 w-4" />,
};

const getStockTrendIcon = (projected: number, current: number) => {
  if (projected > current * 1.1) return <ArrowUp className="h-4 w-4 text-ash-green-600" />;
  if (projected < current * 0.9) return <ArrowDown className="h-4 w-4 text-red-600" />;
  return <Equal className="h-4 w-4 text-gray-600" />;
};

export const MRPDashboard = React.forwardRef<HTMLDivElement, MRPDashboardProps>(
  ({ 
    materials, 
    projections,
    selectedMaterial,
    onMaterialSelect,
    onCreatePurchaseOrder,
    onOptimizePlan,
    className 
  }, ref) => {
    // Calculate summary metrics
    const totalMaterials = materials.length;
    const criticalMaterials = materials.filter(m => m.recommendedAction === "ORDER_NOW").length;
    const shortfallMaterials = materials.filter(m => m.shortfall > 0).length;
    const totalShortfallValue = materials.reduce((sum, m) => 
      sum + (m.shortfall * m.costPerUnit), 0
    );

    const handleCreatePO = (material: MRPItem) => {
      const quantity = material.shortfall > 0 ? material.shortfall : material.reorderPoint;
      onCreatePurchaseOrder?.(material.id, quantity);
    };

    const getStockStatus = (material: MRPItem) => {
      if (material.projectedStock <= 0) return "OUT_OF_STOCK";
      if (material.projectedStock < material.minimumStock) return "LOW_STOCK";
      if (material.currentStock < material.reorderPoint) return "REORDER_POINT";
      return "ADEQUATE";
    };

    const getStockStatusColor = (status: string) => {
      switch (status) {
        case "OUT_OF_STOCK": return "text-red-600";
        case "LOW_STOCK": return "text-ash-orange-600";
        case "REORDER_POINT": return "text-ash-blue-600";
        default: return "text-ash-green-600";
      }
    };

    return (
      <div ref={ref} className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Material Requirements Planning</h2>
            <p className="text-muted-foreground">
              Monitor inventory levels and optimize material procurement
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={onOptimizePlan} variant="outline">
              <Factory className="mr-2 h-4 w-4" />
              Optimize Plan
            </Button>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Bulk Purchase
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Materials</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{totalMaterials}</div>
                <div className="text-xs text-muted-foreground">
                  Tracked in inventory
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Critical Materials</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-red-600">
                  {criticalMaterials}
                </div>
                <div className="text-xs text-muted-foreground">
                  Require immediate ordering
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Shortfall Items</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-ash-orange-600">
                  {shortfallMaterials}
                </div>
                <div className="text-xs text-muted-foreground">
                  Materials below requirement
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Shortfall Value</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  ₱{totalShortfallValue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total procurement needed
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalMaterials > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{criticalMaterials} materials</strong> require immediate ordering to avoid production delays.
              Review and create purchase orders urgently.
            </AlertDescription>
          </Alert>
        )}

        {/* Materials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Material Requirements</CardTitle>
            <CardDescription>
              Current stock levels, demands, and recommended actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Demand</TableHead>
                    <TableHead>Projected</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Urgent Orders</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => {
                    const stockStatus = getStockStatus(material);
                    
                    return (
                      <TableRow 
                        key={material.id}
                        className={cn(
                          "cursor-pointer hover:bg-gray-50",
                          selectedMaterial === material.id && "bg-ash-blue-50"
                        )}
                        onClick={() => onMaterialSelect?.(material.id)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{material.materialName}</div>
                            <div className="text-xs text-muted-foreground">
                              {material.supplier || "No supplier"}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {material.currentStock.toLocaleString()} {material.unit}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Min: {material.minimumStock}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {material.totalDemand.toLocaleString()} {material.unit}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Supply: {material.plannedSupply}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "font-medium",
                              getStockStatusColor(stockStatus)
                            )}>
                              {material.projectedStock.toLocaleString()}
                            </div>
                            {getStockTrendIcon(material.projectedStock, material.currentStock)}
                          </div>
                          {material.shortfall > 0 && (
                            <div className="text-xs text-red-600">
                              Short: {material.shortfall}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={cn("", actionColors[material.recommendedAction])}
                          >
                            {actionIcons[material.recommendedAction]}
                            <span className="ml-1 text-xs">
                              {material.recommendedAction.replace("_", " ")}
                            </span>
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          {material.recommendedAction === "ORDER_NOW" && (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                Order: {material.shortfall} {material.unit}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Est: ₱{(material.shortfall * material.costPerUnit).toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Lead time: {material.leadTime} days
                              </div>
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {material.urgentOrders.length > 0 && (
                            <div className="space-y-1">
                              <Badge variant="destructive" className="text-xs">
                                {material.urgentOrders.length} urgent
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                Next: {format(material.urgentOrders[0].requiredDate, "MMM dd")}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {(material.recommendedAction === "ORDER_NOW" || 
                            material.recommendedAction === "ORDER_SOON") && (
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreatePO(material);
                              }}
                            >
                              Create PO
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Stock Projections */}
        {projections && projections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stock Projections (Next 30 Days)
              </CardTitle>
              <CardDescription>
                Daily stock level projections for selected material
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Beginning</TableHead>
                      <TableHead>Receipts</TableHead>
                      <TableHead>Demands</TableHead>
                      <TableHead>Ending</TableHead>
                      <TableHead>Shortfall</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projections.map((projection, index) => (
                      <TableRow 
                        key={index}
                        className={projection.shortfall > 0 ? "bg-red-50" : ""}
                      >
                        <TableCell>
                          <div className="font-medium">
                            {format(new Date(projection.date), "MMM dd")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(projection.date), "EEE")}
                          </div>
                        </TableCell>
                        <TableCell>{projection.beginningStock.toLocaleString()}</TableCell>
                        <TableCell className="text-ash-green-600">
                          +{projection.receipts.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-red-600">
                          -{projection.demands.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "font-medium",
                            projection.endingStock < 0 ? "text-red-600" : "text-gray-900"
                          )}>
                            {projection.endingStock.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {projection.shortfall > 0 && (
                            <span className="text-red-600 font-medium">
                              {projection.shortfall.toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {projection.actions.length > 0 && (
                            <div className="space-y-1">
                              {projection.actions.map((action, actionIndex) => (
                                <div key={actionIndex} className="text-xs text-red-600">
                                  {action}
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);

MRPDashboard.displayName = "MRPDashboard";