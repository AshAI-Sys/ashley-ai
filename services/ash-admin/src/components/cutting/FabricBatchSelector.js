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
exports.default = FabricBatchSelector;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const checkbox_1 = require("@/components/ui/checkbox");
const lucide_react_1 = require("lucide-react");
function FabricBatchSelector({ availableBatches, onSelectionChange, orderRequirement, allowMultiSelect = true, }) {
    const [selectedBatches, setSelectedBatches] = (0, react_1.useState)([]);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const [brandFilter, setBrandFilter] = (0, react_1.useState)("all");
    const [ashleyAnalysis, setAshleyAnalysis] = (0, react_1.useState)(null);
    const filteredBatches = availableBatches.filter(batch => {
        const matchesSearch = batch.lot_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            batch.brand.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBrand = brandFilter === "all" || batch.brand.code === brandFilter;
        return matchesSearch && matchesBrand;
    });
    const uniqueBrands = Array.from(new Set(availableBatches.map(b => b.brand.code)));
    (0, react_1.useEffect)(() => {
        onSelectionChange(selectedBatches);
        if (selectedBatches.length > 0) {
            performAshleyAnalysis();
        }
        else {
            setAshleyAnalysis(null);
        }
    }, [selectedBatches]);
    const performAshleyAnalysis = async () => {
        // Simulate Ashley AI analysis
        await new Promise(resolve => setTimeout(resolve, 500));
        const totalFabric = selectedBatches.reduce((sum, sel) => sum + sel.qty_to_use, 0);
        const totalEstimatedPieces = selectedBatches.reduce((sum, sel) => sum + sel.estimated_pieces, 0);
        const analysis = {
            totalFabricAllocated: totalFabric,
            estimatedTotalPieces: totalEstimatedPieces,
            fabricEfficiency: orderRequirement
                ? Math.min(100, (totalFabric / orderRequirement.estimatedFabricNeeded) * 100)
                : 0,
            recommendations: [],
            riskLevel: "low",
            optimizationScore: 85,
        };
        // Generate recommendations
        if (orderRequirement) {
            if (analysis.fabricEfficiency < 90) {
                analysis.recommendations.push("Consider allocating more fabric to meet target efficiently");
                analysis.riskLevel = "medium";
            }
            if (analysis.fabricEfficiency > 110) {
                analysis.recommendations.push("Excess fabric allocated - consider optimizing quantity");
            }
            if (selectedBatches.length > 3) {
                analysis.recommendations.push("Using multiple batches may affect color consistency");
                analysis.riskLevel = "medium";
            }
        }
        // Check batch compatibility
        const gsmValues = selectedBatches
            .map(sel => sel.batch.gsm)
            .filter(gsm => gsm !== undefined);
        if (gsmValues.length > 1) {
            const gsmVariation = Math.max(...gsmValues) - Math.min(...gsmValues);
            if (gsmVariation > 20) {
                analysis.recommendations.push("GSM variation detected - may affect garment consistency");
                analysis.riskLevel = "high";
            }
        }
        const widthValues = selectedBatches
            .map(sel => sel.batch.width_cm)
            .filter(w => w !== undefined);
        if (widthValues.length > 1) {
            const widthVariation = Math.max(...widthValues) - Math.min(...widthValues);
            if (widthVariation > 10) {
                analysis.recommendations.push("Fabric width variation - may require marker adjustments");
            }
        }
        if (analysis.recommendations.length === 0) {
            analysis.recommendations.push("Optimal batch selection for efficient cutting");
            analysis.optimizationScore = 95;
        }
        setAshleyAnalysis(analysis);
    };
    const handleBatchSelection = (batch, isSelected) => {
        if (!allowMultiSelect && isSelected) {
            // Single select mode - replace existing selection
            const estimatedPieces = calculateEstimatedPieces(batch, batch.qty_on_hand);
            setSelectedBatches([
                {
                    batch,
                    qty_to_use: batch.qty_on_hand,
                    estimated_pieces: estimatedPieces,
                },
            ]);
            return;
        }
        if (isSelected) {
            const _estimatedPieces = calculateEstimatedPieces(batch, batch.qty_on_hand);
            setSelectedBatches(prev => [
                ...prev,
                {
                    batch,
                    qty_to_use: Math.min(batch.qty_on_hand, 10), // Default to 10 units
                    estimated_pieces: calculateEstimatedPieces(batch, 10),
                },
            ]);
        }
        else {
            setSelectedBatches(prev => prev.filter(sel => sel.batch.id !== batch.id));
        }
    };
    const updateQuantity = (batchId, newQuantity) => {
        setSelectedBatches(prev => prev.map(sel => {
            if (sel.batch.id === batchId) {
                const clampedQty = Math.max(0.1, Math.min(newQuantity, sel.batch.qty_on_hand));
                return {
                    ...sel,
                    qty_to_use: clampedQty,
                    estimated_pieces: calculateEstimatedPieces(sel.batch, clampedQty),
                };
            }
            return sel;
        }));
    };
    const calculateEstimatedPieces = (batch, quantity) => {
        // Ashley AI estimation based on fabric properties
        if (batch.estimated_yield) {
            return Math.floor(quantity * batch.estimated_yield);
        }
        // Fallback calculation
        const gsm = batch.gsm || 200;
        const width = batch.width_cm || 150;
        if (batch.uom === "KG") {
            // Convert kg to approximate pieces (for medium garment)
            const areaPerPiece = 2500; // cm²
            const fabricArea = (quantity * 1000) / gsm; // cm² from kg
            return Math.floor(fabricArea / areaPerPiece);
        }
        else {
            // Convert meters to approximate pieces
            const fabricArea = quantity * 100 * width; // cm²
            const areaPerPiece = 2500; // cm²
            return Math.floor(fabricArea / areaPerPiece);
        }
    };
    const isSelected = (batchId) => selectedBatches.some(sel => sel.batch.id === batchId);
    const getRiskColor = (level) => {
        switch (level) {
            case "low":
                return "text-green-600 bg-green-50";
            case "medium":
                return "text-yellow-600 bg-yellow-50";
            case "high":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };
    return (<div className="space-y-6">
      {/* Search and Filter */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <input_1.Input placeholder="Search batches by lot number or brand..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9"/>
            </div>

            <div className="flex items-center gap-2">
              <lucide_react_1.Filter className="h-4 w-4 text-muted-foreground"/>
              <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="rounded border px-3 py-2">
                <option value="all">All Brands</option>
                {uniqueBrands.map(brand => (<option key={brand} value={brand}>
                    {brand}
                  </option>))}
              </select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Order Requirement Summary */}
      {orderRequirement && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg">Order Requirements</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className="font-medium">Garment:</span>
                <br />
                {orderRequirement.garmentType}
              </div>
              <div>
                <span className="font-medium">Target Pieces:</span>
                <br />
                <span className="text-lg font-bold text-blue-600">
                  {orderRequirement.totalPieces}
                </span>
              </div>
              <div>
                <span className="font-medium">Est. Fabric Needed:</span>
                <br />
                <span className="text-lg font-bold text-green-600">
                  {orderRequirement.estimatedFabricNeeded}{" "}
                  {orderRequirement.unitType}
                </span>
              </div>
              <div>
                <span className="font-medium">Selected:</span>
                <br />
                <span className="text-lg font-bold">
                  {selectedBatches
                .reduce((sum, sel) => sum + sel.qty_to_use, 0)
                .toFixed(1)}{" "}
                  {orderRequirement.unitType}
                </span>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Available Batches */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>
            Available Fabric Batches ({filteredBatches.length})
          </card_1.CardTitle>
          <card_1.CardDescription>
            Select fabric batches for cutting operation
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {filteredBatches.map(batch => {
            const selected = isSelected(batch.id);
            const selectedBatch = selectedBatches.find(sel => sel.batch.id === batch.id);
            return (<div key={batch.id} className={`rounded-lg border p-4 transition-all ${selected
                    ? "bg-blue-50 ring-2 ring-blue-500"
                    : "hover:bg-gray-50"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <checkbox_1.Checkbox checked={selected} onCheckedChange={checked => handleBatchSelection(batch, checked)} className="mt-1"/>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="font-semibold">{batch.lot_no}</h3>
                        <badge_1.Badge variant="secondary">{batch.brand.name}</badge_1.Badge>
                        {batch.color && (<badge_1.Badge variant="outline">{batch.color}</badge_1.Badge>)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground md:grid-cols-4">
                        <div>
                          <span className="font-medium">Available:</span>
                          <br />
                          <span className="font-semibold text-green-600">
                            {batch.qty_on_hand} {batch.uom}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">GSM:</span>
                          <br />
                          {batch.gsm || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Width:</span>
                          <br />
                          {batch.width_cm
                    ? `${batch.width_cm} cm`
                    : "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Est. Yield:</span>
                          <br />~{calculateEstimatedPieces(batch, 1)} pcs/
                          {batch.uom}
                        </div>
                      </div>

                      {selected && selectedBatch && (<div className="mt-4 rounded border bg-white p-3">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label_1.Label className="text-sm">Quantity to Use</label_1.Label>
                              <div className="mt-1 flex items-center gap-2">
                                <button_1.Button type="button" variant="outline" size="sm" onClick={() => updateQuantity(batch.id, selectedBatch.qty_to_use - 5)} disabled={selectedBatch.qty_to_use <= 5}>
                                  <lucide_react_1.Minus className="h-4 w-4"/>
                                </button_1.Button>
                                <input_1.Input type="number" min="0.1" max={batch.qty_on_hand} step="0.1" value={selectedBatch.qty_to_use} onChange={e => updateQuantity(batch.id, parseFloat(e.target.value) || 0.1)} className="w-20 text-center"/>
                                <span className="text-sm text-muted-foreground">
                                  {batch.uom}
                                </span>
                                <button_1.Button type="button" variant="outline" size="sm" onClick={() => updateQuantity(batch.id, selectedBatch.qty_to_use + 5)} disabled={selectedBatch.qty_to_use >=
                        batch.qty_on_hand}>
                                  <lucide_react_1.Plus className="h-4 w-4"/>
                                </button_1.Button>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                Est. Pieces:
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {selectedBatch.estimated_pieces}
                              </div>
                            </div>
                          </div>
                        </div>)}
                    </div>
                  </div>

                  <lucide_react_1.Package className={`h-5 w-5 ${selected ? "text-blue-600" : "text-gray-500"}`}/>
                </div>
              </div>);
        })}

          {filteredBatches.length === 0 && (<div className="py-8 text-center text-muted-foreground">
              <lucide_react_1.Package className="mx-auto mb-4 h-12 w-12 text-gray-600"/>
              <p>No fabric batches found matching your criteria</p>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Ashley AI Analysis */}
      {ashleyAnalysis && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Zap className="h-5 w-5 text-purple-600"/>
              Ashley AI Selection Analysis
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {ashleyAnalysis.totalFabricAllocated.toFixed(1)}
                </div>
                <div className="text-sm text-blue-800">Total Allocated</div>
              </div>

              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {ashleyAnalysis.estimatedTotalPieces}
                </div>
                <div className="text-sm text-green-800">Est. Pieces</div>
              </div>

              <div className={`rounded-lg p-3 text-center ${getRiskColor(ashleyAnalysis.riskLevel)}`}>
                <div className="text-2xl font-bold">
                  {ashleyAnalysis.optimizationScore}
                </div>
                <div className="text-sm">Optimization Score</div>
              </div>
            </div>

            {ashleyAnalysis.recommendations.length > 0 && (<div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium">
                  <lucide_react_1.Calculator className="h-4 w-4"/>
                  AI Recommendations:
                </h4>
                {ashleyAnalysis.recommendations.map((rec, index) => (<div key={index} className="flex items-start gap-2 rounded bg-gray-50 p-2">
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500"/>
                      <p className="text-sm">{rec}</p>
                    </div>))}
              </div>)}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
