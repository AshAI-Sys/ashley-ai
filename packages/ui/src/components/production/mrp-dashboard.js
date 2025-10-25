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
exports.MRPDashboard = void 0;
const React = __importStar(require("react"));
const date_fns_1 = require("date-fns");
const card_1 = require("../card");
const badge_1 = require("../badge");
const button_1 = require("../button");
const alert_1 = require("../alert");
const table_1 = require("../table");
const utils_1 = require("../../lib/utils");
const lucide_react_1 = require("lucide-react");
const actionColors = {
    ORDER_NOW: "bg-red-100 text-red-800 border-red-200",
    ORDER_SOON: "bg-ash-orange-100 text-ash-orange-800 border-ash-orange-200",
    ADEQUATE: "bg-ash-green-100 text-ash-green-800 border-ash-green-200",
    EXCESS: "bg-gray-100 text-gray-800 border-gray-200",
};
const actionIcons = {
    ORDER_NOW: <lucide_react_1.AlertTriangle className="h-4 w-4"/>,
    ORDER_SOON: <lucide_react_1.Clock className="h-4 w-4"/>,
    ADEQUATE: <lucide_react_1.CheckCircle className="h-4 w-4"/>,
    EXCESS: <lucide_react_1.ArrowUp className="h-4 w-4"/>,
};
const getStockTrendIcon = (projected, current) => {
    if (projected > current * 1.1)
        return <lucide_react_1.ArrowUp className="text-ash-green-600 h-4 w-4"/>;
    if (projected < current * 0.9)
        return <lucide_react_1.ArrowDown className="h-4 w-4 text-red-600"/>;
    return <lucide_react_1.Equal className="h-4 w-4 text-gray-600"/>;
};
exports.MRPDashboard = React.forwardRef(({ materials, projections, selectedMaterial, onMaterialSelect, onCreatePurchaseOrder, onOptimizePlan, className, }, ref) => {
    // Calculate summary metrics
    const totalMaterials = materials.length;
    const criticalMaterials = materials.filter(m => m.recommendedAction === "ORDER_NOW").length;
    const shortfallMaterials = materials.filter(m => m.shortfall > 0).length;
    const totalShortfallValue = materials.reduce((sum, m) => sum + m.shortfall * m.costPerUnit, 0);
    const handleCreatePO = (material) => {
        const quantity = material.shortfall > 0 ? material.shortfall : material.reorderPoint;
        onCreatePurchaseOrder?.(material.id, quantity);
    };
    const getStockStatus = (material) => {
        if (material.projectedStock <= 0)
            return "OUT_OF_STOCK";
        if (material.projectedStock < material.minimumStock)
            return "LOW_STOCK";
        if (material.currentStock < material.reorderPoint)
            return "REORDER_POINT";
        return "ADEQUATE";
    };
    const getStockStatusColor = (status) => {
        switch (status) {
            case "OUT_OF_STOCK":
                return "text-red-600";
            case "LOW_STOCK":
                return "text-ash-orange-600";
            case "REORDER_POINT":
                return "text-ash-blue-600";
            default:
                return "text-ash-green-600";
        }
    };
    return (<div ref={ref} className={(0, utils_1.cn)("space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Material Requirements Planning
            </h2>
            <p className="text-muted-foreground">
              Monitor inventory levels and optimize material procurement
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button_1.Button onClick={onOptimizePlan} variant="outline">
              <lucide_react_1.Factory className="mr-2 h-4 w-4"/>
              Optimize Plan
            </button_1.Button>
            <button_1.Button>
              <lucide_react_1.ShoppingCart className="mr-2 h-4 w-4"/>
              Bulk Purchase
            </button_1.Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <lucide_react_1.Package className="text-muted-foreground h-4 w-4"/>
                <span className="text-sm font-medium">Total Materials</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{totalMaterials}</div>
                <div className="text-muted-foreground text-xs">
                  Tracked in inventory
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <lucide_react_1.AlertTriangle className="text-muted-foreground h-4 w-4"/>
                <span className="text-sm font-medium">Critical Materials</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-red-600">
                  {criticalMaterials}
                </div>
                <div className="text-muted-foreground text-xs">
                  Require immediate ordering
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <lucide_react_1.TrendingDown className="text-muted-foreground h-4 w-4"/>
                <span className="text-sm font-medium">Shortfall Items</span>
              </div>
              <div className="mt-2">
                <div className="text-ash-orange-600 text-2xl font-bold">
                  {shortfallMaterials}
                </div>
                <div className="text-muted-foreground text-xs">
                  Materials below requirement
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <lucide_react_1.DollarSign className="text-muted-foreground h-4 w-4"/>
                <span className="text-sm font-medium">Shortfall Value</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  ₱{totalShortfallValue.toLocaleString()}
                </div>
                <div className="text-muted-foreground text-xs">
                  Total procurement needed
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Critical Alerts */}
        {criticalMaterials > 0 && (<alert_1.Alert className="border-red-200 bg-red-50">
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600"/>
            <alert_1.AlertDescription className="text-red-800">
              <strong>{criticalMaterials} materials</strong> require immediate
              ordering to avoid production delays. Review and create purchase
              orders urgently.
            </alert_1.AlertDescription>
          </alert_1.Alert>)}

        {/* Materials Table */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Material Requirements</card_1.CardTitle>
            <card_1.CardDescription>
              Current stock levels, demands, and recommended actions
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="overflow-x-auto">
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Material</table_1.TableHead>
                    <table_1.TableHead>Current Stock</table_1.TableHead>
                    <table_1.TableHead>Demand</table_1.TableHead>
                    <table_1.TableHead>Projected</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Action</table_1.TableHead>
                    <table_1.TableHead>Urgent Orders</table_1.TableHead>
                    <table_1.TableHead></table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {materials.map(material => {
            const stockStatus = getStockStatus(material);
            return (<table_1.TableRow key={material.id} className={(0, utils_1.cn)("cursor-pointer hover:bg-gray-50", selectedMaterial === material.id && "bg-ash-blue-50")} onClick={() => onMaterialSelect?.(material.id)}>
                        <table_1.TableCell>
                          <div>
                            <div className="font-medium">
                              {material.materialName}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {material.supplier || "No supplier"}
                            </div>
                          </div>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {material.currentStock.toLocaleString()}{" "}
                              {material.unit}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Min: {material.minimumStock}
                            </div>
                          </div>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {material.totalDemand.toLocaleString()}{" "}
                              {material.unit}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Supply: {material.plannedSupply}
                            </div>
                          </div>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <div className="flex items-center gap-2">
                            <div className={(0, utils_1.cn)("font-medium", getStockStatusColor(stockStatus))}>
                              {material.projectedStock.toLocaleString()}
                            </div>
                            {getStockTrendIcon(material.projectedStock, material.currentStock)}
                          </div>
                          {material.shortfall > 0 && (<div className="text-xs text-red-600">
                              Short: {material.shortfall}
                            </div>)}
                        </table_1.TableCell>

                        <table_1.TableCell>
                          <badge_1.Badge variant="outline" className={(0, utils_1.cn)("", actionColors[material.recommendedAction])}>
                            {actionIcons[material.recommendedAction]}
                            <span className="ml-1 text-xs">
                              {material.recommendedAction.replace("_", " ")}
                            </span>
                          </badge_1.Badge>
                        </table_1.TableCell>

                        <table_1.TableCell>
                          {material.recommendedAction === "ORDER_NOW" && (<div className="space-y-1">
                              <div className="text-sm font-medium">
                                Order: {material.shortfall} {material.unit}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Est: ₱
                                {(material.shortfall * material.costPerUnit).toLocaleString()}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Lead time: {material.leadTime} days
                              </div>
                            </div>)}
                        </table_1.TableCell>

                        <table_1.TableCell>
                          {material.urgentOrders.length > 0 && (<div className="space-y-1">
                              <badge_1.Badge variant="destructive" className="text-xs">
                                {material.urgentOrders.length} urgent
                              </badge_1.Badge>
                              <div className="text-muted-foreground text-xs">
                                Next:{" "}
                                {(0, date_fns_1.format)(material.urgentOrders[0].requiredDate, "MMM dd")}
                              </div>
                            </div>)}
                        </table_1.TableCell>

                        <table_1.TableCell>
                          {(material.recommendedAction === "ORDER_NOW" ||
                    material.recommendedAction === "ORDER_SOON") && (<button_1.Button size="sm" onClick={e => {
                        e.stopPropagation();
                        handleCreatePO(material);
                    }}>
                              Create PO
                            </button_1.Button>)}
                        </table_1.TableCell>
                      </table_1.TableRow>);
        })}
                </table_1.TableBody>
              </table_1.Table>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Stock Projections */}
        {projections && projections.length > 0 && (<card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-5 w-5"/>
                Stock Projections (Next 30 Days)
              </card_1.CardTitle>
              <card_1.CardDescription>
                Daily stock level projections for selected material
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="overflow-x-auto">
                <table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Date</table_1.TableHead>
                      <table_1.TableHead>Beginning</table_1.TableHead>
                      <table_1.TableHead>Receipts</table_1.TableHead>
                      <table_1.TableHead>Demands</table_1.TableHead>
                      <table_1.TableHead>Ending</table_1.TableHead>
                      <table_1.TableHead>Shortfall</table_1.TableHead>
                      <table_1.TableHead>Actions</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {projections.map((projection, index) => (<table_1.TableRow key={index} className={projection.shortfall > 0 ? "bg-red-50" : ""}>
                        <table_1.TableCell>
                          <div className="font-medium">
                            {(0, date_fns_1.format)(new Date(projection.date), "MMM dd")}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {(0, date_fns_1.format)(new Date(projection.date), "EEE")}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {projection.beginningStock.toLocaleString()}
                        </table_1.TableCell>
                        <table_1.TableCell className="text-ash-green-600">
                          +{projection.receipts.toLocaleString()}
                        </table_1.TableCell>
                        <table_1.TableCell className="text-red-600">
                          -{projection.demands.toLocaleString()}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <span className={(0, utils_1.cn)("font-medium", projection.endingStock < 0
                    ? "text-red-600"
                    : "text-gray-900")}>
                            {projection.endingStock.toLocaleString()}
                          </span>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {projection.shortfall > 0 && (<span className="font-medium text-red-600">
                              {projection.shortfall.toLocaleString()}
                            </span>)}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {projection.actions.length > 0 && (<div className="space-y-1">
                              {projection.actions.map((action, actionIndex) => (<div key={actionIndex} className="text-xs text-red-600">
                                  {action}
                                </div>))}
                            </div>)}
                        </table_1.TableCell>
                      </table_1.TableRow>))}
                  </table_1.TableBody>
                </table_1.Table>
              </div>
            </card_1.CardContent>
          </card_1.Card>)}
      </div>);
});
exports.MRPDashboard.displayName = "MRPDashboard";
