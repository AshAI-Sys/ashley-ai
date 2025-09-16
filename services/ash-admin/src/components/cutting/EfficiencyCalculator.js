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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EfficiencyCalculator;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
function EfficiencyCalculator({ data, onResultsChange }) {
    const [results, setResults] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (data.grossUsed > 0 && data.totalPiecesCut > 0) {
            calculateEfficiency();
        }
    }, [data]);
    const calculateEfficiency = async () => {
        setLoading(true);
        // Simulate Ashley AI calculation delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            const calculations = performCalculations();
            setResults(calculations);
            if (onResultsChange) {
                onResultsChange(calculations);
            }
        }
        catch (error) {
            console.error('Efficiency calculation error:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const performCalculations = () => {
        const { markerWidth, markerLength, plies, grossUsed, offcuts, defects, totalPiecesCut, patternAreaPerPiece, gsm } = data;
        // 1. Marker Efficiency (fabric utilization)
        const totalMarkerArea = (markerWidth || 160) * markerLength * 100; // cm²
        const estimatedPatternArea = patternAreaPerPiece || 2500; // cm² default for medium garment
        const totalPatternArea = totalPiecesCut * estimatedPatternArea;
        const markerEfficiency = Math.min(100, (totalPatternArea / totalMarkerArea) * 100);
        // 2. Material Yield (actual vs expected)
        const wasteAmount = offcuts + defects;
        const netUsed = grossUsed - wasteAmount;
        const wastePercentage = (wasteAmount / grossUsed) * 100;
        const materialYield = (netUsed / grossUsed) * 100;
        // 3. Expected vs Actual Pieces
        const fabricDensity = gsm || 200; // g/m²
        const expectedPiecesFromFabric = data.uom === 'KG'
            ? Math.floor((grossUsed * 1000) / ((estimatedPatternArea / 10000) * fabricDensity)) // KG to pieces
            : Math.floor((grossUsed * 100 * (markerWidth || 160)) / estimatedPatternArea); // M to pieces
        const actualYield = (totalPiecesCut / Math.max(expectedPiecesFromFabric, totalPiecesCut)) * 100;
        const pieceVariance = ((totalPiecesCut - expectedPiecesFromFabric) / Math.max(expectedPiecesFromFabric, 1)) * 100;
        // 4. Cutting Speed (estimated)
        const estimatedCuttingTime = (totalPiecesCut * 0.15) / 60; // 0.15 min per piece
        const cuttingSpeed = totalPiecesCut / Math.max(estimatedCuttingTime, 0.1);
        // 5. Recommendations based on Ashley AI analysis
        const recommendations = [];
        if (markerEfficiency < 75) {
            recommendations.push('Consider optimizing marker layout - efficiency below 75%');
        }
        if (wastePercentage > 8) {
            recommendations.push('High waste detected - check fabric handling and cutting precision');
        }
        if (pieceVariance < -10) {
            recommendations.push('Lower than expected yield - verify pattern placement and fabric relaxation');
        }
        if (pieceVariance > 10) {
            recommendations.push('Higher than expected yield - excellent cutting execution!');
        }
        if (markerEfficiency > 85 && wastePercentage < 5) {
            recommendations.push('Outstanding efficiency! Consider this as a benchmark for future lays');
        }
        if (recommendations.length === 0) {
            recommendations.push('Good cutting performance within acceptable parameters');
        }
        // 6. Ashley AI Overall Score (weighted)
        const ashleyScore = Math.round((markerEfficiency * 0.4) +
            (materialYield * 0.3) +
            (Math.max(0, 100 - Math.abs(pieceVariance)) * 0.2) +
            (Math.min(100, cuttingSpeed * 2) * 0.1));
        return {
            markerEfficiency: Math.round(markerEfficiency * 10) / 10,
            materialYield: Math.round(materialYield * 10) / 10,
            wastePercentage: Math.round(wastePercentage * 10) / 10,
            actualYield: Math.round(actualYield * 10) / 10,
            expectedPieces: expectedPiecesFromFabric,
            pieceVariance: Math.round(pieceVariance * 10) / 10,
            cuttingSpeed: Math.round(cuttingSpeed * 10) / 10,
            recommendations,
            ashleyScore: Math.max(0, Math.min(100, ashleyScore))
        };
    };
    const getEfficiencyColor = (value, thresholds) => {
        if (value >= thresholds.good)
            return 'text-green-600 bg-green-50';
        if (value >= thresholds.warning)
            return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };
    const getAshleyScoreLevel = (score) => {
        if (score >= 90)
            return { level: 'Excellent', color: 'text-green-600 bg-green-50', icon: lucide_react_1.CheckCircle };
        if (score >= 80)
            return { level: 'Good', color: 'text-blue-600 bg-blue-50', icon: lucide_react_1.Target };
        if (score >= 70)
            return { level: 'Average', color: 'text-yellow-600 bg-yellow-50', icon: lucide_react_1.TrendingUp };
        return { level: 'Needs Improvement', color: 'text-red-600 bg-red-50', icon: lucide_react_1.AlertTriangle };
    };
    if (loading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Calculator className="w-5 h-5 animate-pulse"/>
            Ashley AI Calculating...
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!results) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Calculator className="w-5 h-5"/>
            Efficiency Calculator
          </card_1.CardTitle>
        </card_1.CardContent>
        <card_1.CardContent>
          <p className="text-muted-foreground text-center py-8">
            Enter cutting data to see efficiency calculations
          </p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    const ashleyLevel = getAshleyScoreLevel(results.ashleyScore);
    const AshleyIcon = ashleyLevel.icon;
    return (<div className="space-y-6">
      {/* Ashley AI Overall Score */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Zap className="w-5 h-5 text-purple-600"/>
            Ashley AI Analysis Score
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${ashleyLevel.color}`}>
              <AshleyIcon className="w-6 h-6"/>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">{results.ashleyScore}</span>
                <span className="text-muted-foreground">/100</span>
                <badge_1.Badge className={ashleyLevel.color.replace('bg-', 'bg-').replace('text-', 'text-')}>
                  {ashleyLevel.level}
                </badge_1.Badge>
              </div>
              <progress_1.Progress value={results.ashleyScore} className="h-2"/>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Detailed Metrics */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Calculator className="w-5 h-5"/>
            Cutting Efficiency Metrics
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Marker Efficiency */}
            <div className={`text-center p-3 rounded-lg ${getEfficiencyColor(results.markerEfficiency, { good: 85, warning: 75 })}`}>
              <div className="text-2xl font-bold">{results.markerEfficiency}%</div>
              <div className="text-sm">Marker Efficiency</div>
            </div>

            {/* Material Yield */}
            <div className={`text-center p-3 rounded-lg ${getEfficiencyColor(results.materialYield, { good: 92, warning: 88 })}`}>
              <div className="text-2xl font-bold">{results.materialYield}%</div>
              <div className="text-sm">Material Yield</div>
            </div>

            {/* Waste Percentage */}
            <div className={`text-center p-3 rounded-lg ${getEfficiencyColor(100 - results.wastePercentage, { good: 95, warning: 92 })}`}>
              <div className="text-2xl font-bold">{results.wastePercentage}%</div>
              <div className="text-sm">Waste</div>
            </div>

            {/* Cutting Speed */}
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{results.cuttingSpeed}</div>
              <div className="text-sm text-blue-800">Pcs/Hour</div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold">Expected Pieces</div>
              <div className="text-2xl text-muted-foreground">{results.expectedPieces}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Actual Pieces</div>
              <div className="text-2xl text-blue-600">{data.totalPiecesCut}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Variance</div>
              <div className={`text-2xl ${results.pieceVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.pieceVariance > 0 ? '+' : ''}{results.pieceVariance}%
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* AI Recommendations */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.TrendingUp className="w-5 h-5 text-green-600"/>
            Ashley AI Recommendations
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-2">
            {results.recommendations.map((recommendation, index) => (<div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"/>
                <p className="text-sm">{recommendation}</p>
              </div>))}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
