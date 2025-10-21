"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
} from "lucide-react";

interface EfficiencyData {
  markerWidth?: number;
  markerLength: number;
  plies: number;
  grossUsed: number;
  offcuts: number;
  defects: number;
  totalPiecesCut: number;
  uom: string;
  patternAreaPerPiece?: number; // cm² per piece
  gsm?: number; // fabric GSM for weight calculations
}

interface CalculationResults {
  markerEfficiency: number;
  materialYield: number;
  wastePercentage: number;
  actualYield: number;
  expectedPieces: number;
  pieceVariance: number;
  cuttingSpeed: number; // pieces per hour estimate
  recommendations: string[];
  ashleyScore: number; // Overall AI score 0-100
}

export default function EfficiencyCalculator({
  data,
  onResultsChange,
}: {
  data: EfficiencyData;
  onResultsChange?: (results: CalculationResults) => void;
}) {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    } catch (error) {
      console.error("Efficiency calculation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const performCalculations = (): CalculationResults => {
    const {
      markerWidth,
      markerLength,
      plies,
      grossUsed,
      offcuts,
      defects,
      totalPiecesCut,
      patternAreaPerPiece,
      gsm,
    } = data;

    // 1. Marker Efficiency (fabric utilization)
    const totalMarkerArea = (markerWidth || 160) * markerLength * 100; // cm²
    const estimatedPatternArea = patternAreaPerPiece || 2500; // cm² default for medium garment
    const totalPatternArea = totalPiecesCut * estimatedPatternArea;
    const markerEfficiency = Math.min(
      100,
      (totalPatternArea / totalMarkerArea) * 100
    );

    // 2. Material Yield (actual vs expected)
    const wasteAmount = offcuts + defects;
    const netUsed = grossUsed - wasteAmount;
    const wastePercentage = (wasteAmount / grossUsed) * 100;
    const materialYield = (netUsed / grossUsed) * 100;

    // 3. Expected vs Actual Pieces
    const fabricDensity = gsm || 200; // g/m²
    const expectedPiecesFromFabric =
      data.uom === "KG"
        ? Math.floor(
            (grossUsed * 1000) /
              ((estimatedPatternArea / 10000) * fabricDensity)
          ) // KG to pieces
        : Math.floor(
            (grossUsed * 100 * (markerWidth || 160)) / estimatedPatternArea
          ); // M to pieces

    const actualYield =
      (totalPiecesCut / Math.max(expectedPiecesFromFabric, totalPiecesCut)) *
      100;
    const pieceVariance =
      ((totalPiecesCut - expectedPiecesFromFabric) /
        Math.max(expectedPiecesFromFabric, 1)) *
      100;

    // 4. Cutting Speed (estimated)
    const estimatedCuttingTime = (totalPiecesCut * 0.15) / 60; // 0.15 min per piece
    const cuttingSpeed = totalPiecesCut / Math.max(estimatedCuttingTime, 0.1);

    // 5. Recommendations based on Ashley AI analysis
    const recommendations: string[] = [];

    if (markerEfficiency < 75) {
      recommendations.push(
        "Consider optimizing marker layout - efficiency below 75%"
      );
    }
    if (wastePercentage > 8) {
      recommendations.push(
        "High waste detected - check fabric handling and cutting precision"
      );
    }
    if (pieceVariance < -10) {
      recommendations.push(
        "Lower than expected yield - verify pattern placement and fabric relaxation"
      );
    }
    if (pieceVariance > 10) {
      recommendations.push(
        "Higher than expected yield - excellent cutting execution!"
      );
    }
    if (markerEfficiency > 85 && wastePercentage < 5) {
      recommendations.push(
        "Outstanding efficiency! Consider this as a benchmark for future lays"
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        "Good cutting performance within acceptable parameters"
      );
    }

    // 6. Ashley AI Overall Score (weighted)
    const ashleyScore = Math.round(
      markerEfficiency * 0.4 +
        materialYield * 0.3 +
        Math.max(0, 100 - Math.abs(pieceVariance)) * 0.2 +
        Math.min(100, cuttingSpeed * 2) * 0.1
    );

    return {
      markerEfficiency: Math.round(markerEfficiency * 10) / 10,
      materialYield: Math.round(materialYield * 10) / 10,
      wastePercentage: Math.round(wastePercentage * 10) / 10,
      actualYield: Math.round(actualYield * 10) / 10,
      expectedPieces: expectedPiecesFromFabric,
      pieceVariance: Math.round(pieceVariance * 10) / 10,
      cuttingSpeed: Math.round(cuttingSpeed * 10) / 10,
      recommendations,
      ashleyScore: Math.max(0, Math.min(100, ashleyScore)),
    };
  };

  const getEfficiencyColor = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value >= thresholds.good) return "text-green-600 bg-green-50";
    if (value >= thresholds.warning) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getAshleyScoreLevel = (score: number) => {
    if (score >= 90)
      return {
        level: "Excellent",
        color: "text-green-600 bg-green-50",
        icon: CheckCircle,
      };
    if (score >= 80)
      return { level: "Good", color: "text-blue-600 bg-blue-50", icon: Target };
    if (score >= 70)
      return {
        level: "Average",
        color: "text-yellow-600 bg-yellow-50",
        icon: TrendingUp,
      };
    return {
      level: "Needs Improvement",
      color: "text-red-600 bg-red-50",
      icon: AlertTriangle,
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 animate-pulse" />
            Ashley AI Calculating...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Efficiency Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Enter cutting data to see efficiency calculations
          </p>
        </CardContent>
      </Card>
    );
  }

  const ashleyLevel = getAshleyScoreLevel(results.ashleyScore);
  const AshleyIcon = ashleyLevel.icon;

  return (
    <div className="space-y-6">
      {/* Ashley AI Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Ashley AI Analysis Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-3 ${ashleyLevel.color}`}>
              <AshleyIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {results.ashleyScore}
                </span>
                <span className="text-muted-foreground">/100</span>
                <Badge
                  className={ashleyLevel.color
                    .replace("bg-", "bg-")
                    .replace("text-", "text-")}
                >
                  {ashleyLevel.level}
                </Badge>
              </div>
              <Progress value={results.ashleyScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cutting Efficiency Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Marker Efficiency */}
            <div
              className={`rounded-lg p-3 text-center ${getEfficiencyColor(results.markerEfficiency, { good: 85, warning: 75 })}`}
            >
              <div className="text-2xl font-bold">
                {results.markerEfficiency}%
              </div>
              <div className="text-sm">Marker Efficiency</div>
            </div>

            {/* Material Yield */}
            <div
              className={`rounded-lg p-3 text-center ${getEfficiencyColor(results.materialYield, { good: 92, warning: 88 })}`}
            >
              <div className="text-2xl font-bold">{results.materialYield}%</div>
              <div className="text-sm">Material Yield</div>
            </div>

            {/* Waste Percentage */}
            <div
              className={`rounded-lg p-3 text-center ${getEfficiencyColor(100 - results.wastePercentage, { good: 95, warning: 92 })}`}
            >
              <div className="text-2xl font-bold">
                {results.wastePercentage}%
              </div>
              <div className="text-sm">Waste</div>
            </div>

            {/* Cutting Speed */}
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.cuttingSpeed}
              </div>
              <div className="text-sm text-blue-800">Pcs/Hour</div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-lg font-semibold">Expected Pieces</div>
              <div className="text-2xl text-muted-foreground">
                {results.expectedPieces}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Actual Pieces</div>
              <div className="text-2xl text-blue-600">
                {data.totalPiecesCut}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Variance</div>
              <div
                className={`text-2xl ${results.pieceVariance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {results.pieceVariance > 0 ? "+" : ""}
                {results.pieceVariance}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Ashley AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded bg-gray-50 p-2"
              >
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
