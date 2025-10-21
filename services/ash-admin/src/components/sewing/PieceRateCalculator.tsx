"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  Calculator,
  Clock,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  X,
} from "lucide-react";

interface PieceRateData {
  operation_name: string;
  standard_minutes: number;
  base_rate: number;
  pieces_completed: number;
  pieces_target: number;
  time_worked_minutes: number;
  efficiency_percentage: number;
  earned_amount: number;
  potential_amount: number;
  bonus_multiplier: number;
  quality_deduction: number;
  total_earnings: number;
}

interface PayrollBreakdown {
  base_earnings: number;
  efficiency_bonus: number;
  quality_penalty: number;
  overtime_bonus: number;
  total_gross: number;
  deductions: number;
  net_pay: number;
}

interface PieceRateCalculatorProps {
  runId?: string;
  operatorId?: string;
  operationName?: string;
  standardMinutes?: number;
  baseRate?: number;
  editable?: boolean;
  showBreakdown?: boolean;
  className?: string;
  onUpdate?: (data: PieceRateData) => void;
}

export default function PieceRateCalculator({
  runId,
  operatorId,
  operationName = "",
  standardMinutes = 0,
  baseRate = 0,
  editable = false,
  showBreakdown = true,
  className = "",
  onUpdate,
}: PieceRateCalculatorProps) {
  const [pieceRateData, setPieceRateData] = useState<PieceRateData | null>(
    null
  );
  const [payrollBreakdown, setPayrollBreakdown] =
    useState<PayrollBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    pieces_completed: "",
    pieces_target: "",
    time_worked: "",
    quality_deduction: "",
  });

  useEffect(() => {
    if (runId || (operationName && standardMinutes && baseRate)) {
      fetchPieceRateData();
    }
  }, [runId, operationName, standardMinutes, baseRate]);

  const fetchPieceRateData = async () => {
    setLoading(true);

    try {
      if (runId) {
        // Fetch from API for specific run
        const response = await fetch(`/api/sewing/runs/${runId}/piece-rates`);
        if (response.ok) {
          const data = await response.json();
          setPieceRateData(data.piece_rate);
          setPayrollBreakdown(data.payroll);
          return;
        }
      }

      // Mock data for demo
      const mockData: PieceRateData = {
        operation_name: operationName || "Join shoulders",
        standard_minutes: standardMinutes || 1.5,
        base_rate: baseRate || 2.25,
        pieces_completed: 15,
        pieces_target: 20,
        time_worked_minutes: 25,
        efficiency_percentage: 90,
        earned_amount: 33.75,
        potential_amount: 45.0,
        bonus_multiplier: 1.0,
        quality_deduction: 0,
        total_earnings: 33.75,
      };

      const mockPayroll: PayrollBreakdown = {
        base_earnings: 33.75,
        efficiency_bonus: 0,
        quality_penalty: 0,
        overtime_bonus: 0,
        total_gross: 33.75,
        deductions: 3.38,
        net_pay: 30.37,
      };

      setPieceRateData(mockData);
      setPayrollBreakdown(mockPayroll);

      setEditValues({
        pieces_completed: mockData.pieces_completed.toString(),
        pieces_target: mockData.pieces_target.toString(),
        time_worked: mockData.time_worked_minutes.toString(),
        quality_deduction: mockData.quality_deduction.toString(),
      });
    } catch (error) {
      console.error("Failed to fetch piece rate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatedValues = useMemo(() => {
    if (!pieceRateData) return null;

    const pieces =
      parseInt(editValues.pieces_completed) || pieceRateData.pieces_completed;
    const target =
      parseInt(editValues.pieces_target) || pieceRateData.pieces_target;
    const timeWorked =
      parseInt(editValues.time_worked) || pieceRateData.time_worked_minutes;
    const qualityDeduction =
      parseFloat(editValues.quality_deduction) ||
      pieceRateData.quality_deduction;

    const earnedMinutes = pieces * pieceRateData.standard_minutes;
    const efficiency = Math.round(
      (earnedMinutes / Math.max(timeWorked, 1)) * 100
    );
    const baseEarnings = pieces * pieceRateData.base_rate;

    // Efficiency bonus (10% bonus if efficiency >= 110%)
    const efficiencyBonus = efficiency >= 110 ? baseEarnings * 0.1 : 0;

    // Quality penalty
    const qualityPenalty = qualityDeduction;

    const totalEarnings = Math.max(
      0,
      baseEarnings + efficiencyBonus - qualityPenalty
    );

    return {
      pieces,
      target,
      timeWorked,
      efficiency,
      baseEarnings,
      efficiencyBonus,
      qualityPenalty,
      totalEarnings,
      completionRate: Math.round((pieces / Math.max(target, 1)) * 100),
      hourlyRate: timeWorked > 0 ? totalEarnings / (timeWorked / 60) : 0,
    };
  }, [pieceRateData, editValues]);

  const handleSaveChanges = async () => {
    if (!calculatedValues || !pieceRateData) return;

    const updatedData: PieceRateData = {
      ...pieceRateData,
      pieces_completed: calculatedValues.pieces,
      pieces_target: calculatedValues.target,
      time_worked_minutes: calculatedValues.timeWorked,
      efficiency_percentage: calculatedValues.efficiency,
      earned_amount: calculatedValues.baseEarnings,
      quality_deduction: calculatedValues.qualityPenalty,
      total_earnings: calculatedValues.totalEarnings,
    };

    if (runId) {
      try {
        const response = await fetch(`/api/sewing/runs/${runId}/piece-rates`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          setPieceRateData(updatedData);
          setIsEditing(false);
          if (onUpdate) onUpdate(updatedData);
          return;
        }
      } catch (error) {
        console.error("Failed to update piece rate data:", error);
      }
    }

    // Update locally for demo
    setPieceRateData(updatedData);
    setIsEditing(false);
    if (onUpdate) onUpdate(updatedData);
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 110) return "text-green-600";
    if (efficiency >= 100) return "text-blue-600";
    if (efficiency >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const getEfficiencyBadgeColor = (efficiency: number) => {
    if (efficiency >= 110)
      return "bg-green-100 text-green-800 border-green-200";
    if (efficiency >= 100) return "bg-blue-100 text-blue-800 border-blue-200";
    if (efficiency >= 90)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Calculator className="mr-2 h-6 w-6 animate-pulse" />
            <span>Calculating piece rates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pieceRateData || !calculatedValues) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <DollarSign className="mx-auto mb-2 h-8 w-8" />
            <p>No piece rate data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Piece Rate Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Piece Rate Calculator
              </CardTitle>
              <CardDescription>
                Real-time earnings calculation based on completed pieces
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={getEfficiencyBadgeColor(calculatedValues.efficiency)}
              >
                {calculatedValues.efficiency}% efficiency
              </Badge>
              {editable && !isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Earnings Display */}
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-green-600">
              ₱{calculatedValues.totalEarnings.toFixed(2)}
            </div>
            <p className="text-muted-foreground">
              Current earnings for {pieceRateData.operation_name}
            </p>
            <p className="text-sm text-muted-foreground">
              Hourly rate: ₱{calculatedValues.hourlyRate.toFixed(2)}/hour
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-blue-600">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues.pieces_completed}
                    onChange={e =>
                      setEditValues(prev => ({
                        ...prev,
                        pieces_completed: e.target.value,
                      }))
                    }
                    className="h-8 text-center"
                  />
                ) : (
                  calculatedValues.pieces
                )}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>

            <div className="rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-gray-600">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues.pieces_target}
                    onChange={e =>
                      setEditValues(prev => ({
                        ...prev,
                        pieces_target: e.target.value,
                      }))
                    }
                    className="h-8 text-center"
                  />
                ) : (
                  calculatedValues.target
                )}
              </div>
              <p className="text-xs text-muted-foreground">Target</p>
            </div>

            <div className="rounded-lg border p-3 text-center">
              <div
                className={`text-lg font-bold ${getEfficiencyColor(calculatedValues.efficiency)}`}
              >
                {calculatedValues.efficiency}%
              </div>
              <p className="text-xs text-muted-foreground">Efficiency</p>
            </div>

            <div className="rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-purple-600">
                {calculatedValues.completionRate}%
              </div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Calculator className="h-4 w-4" />
              Calculation Breakdown
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Base rate per piece:</span>
                  <span className="font-medium">
                    ₱{pieceRateData.base_rate.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pieces completed:</span>
                  <span className="font-medium">{calculatedValues.pieces}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Base earnings:</span>
                  <span className="font-medium">
                    ₱{calculatedValues.baseEarnings.toFixed(2)}
                  </span>
                </div>
                {calculatedValues.efficiencyBonus > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Efficiency bonus (10%):</span>
                    <span className="font-medium">
                      +₱{calculatedValues.efficiencyBonus.toFixed(2)}
                    </span>
                  </div>
                )}
                {calculatedValues.qualityPenalty > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Quality penalty:</span>
                    <span className="font-medium">
                      -₱{calculatedValues.qualityPenalty.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Standard minutes (SMV):</span>
                  <span className="font-medium">
                    {pieceRateData.standard_minutes}m
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time worked:</span>
                  <span className="font-medium">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.time_worked}
                        onChange={e =>
                          setEditValues(prev => ({
                            ...prev,
                            time_worked: e.target.value,
                          }))
                        }
                        className="h-6 w-20 text-right"
                      />
                    ) : (
                      `${calculatedValues.timeWorked}m`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Earned minutes:</span>
                  <span className="font-medium">
                    {calculatedValues.pieces * pieceRateData.standard_minutes}m
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Efficiency rate:</span>
                  <span
                    className={`font-medium ${getEfficiencyColor(calculatedValues.efficiency)}`}
                  >
                    {calculatedValues.efficiency}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quality Adjustment */}
            {(isEditing || calculatedValues.qualityPenalty > 0) && (
              <div className="rounded-lg border bg-red-50 p-3">
                <Label className="text-sm font-medium text-red-900">
                  Quality Deduction
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-red-700">₱</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editValues.quality_deduction}
                      onChange={e =>
                        setEditValues(prev => ({
                          ...prev,
                          quality_deduction: e.target.value,
                        }))
                      }
                      className="h-8 w-24"
                    />
                  ) : (
                    <span className="font-medium text-red-900">
                      {calculatedValues.qualityPenalty.toFixed(2)}
                    </span>
                  )}
                  <span className="text-sm text-red-700">
                    for quality issues
                  </span>
                </div>
              </div>
            )}

            {/* Total Calculation */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Earnings:</span>
                <span className="text-xl font-bold text-green-600">
                  ₱{calculatedValues.totalEarnings.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-2 pt-3">
                <Button size="sm" onClick={handleSaveChanges}>
                  <Save className="mr-1 h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Performance Insights */}
          <div className="space-y-3">
            {calculatedValues.efficiency >= 110 && (
              <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
                <Award className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Excellent Performance!
                  </p>
                  <p className="text-sm text-green-700">
                    You've earned a 10% efficiency bonus for working above 110%
                    efficiency.
                  </p>
                </div>
              </div>
            )}

            {calculatedValues.efficiency >= 100 &&
              calculatedValues.efficiency < 110 && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Meeting Target</p>
                    <p className="text-sm text-blue-700">
                      You're working at target efficiency. Reach 110% to earn a
                      bonus!
                    </p>
                  </div>
                </div>
              )}

            {calculatedValues.efficiency < 90 && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">
                    Below Target Performance
                  </p>
                  <p className="text-sm text-yellow-700">
                    Consider adjusting your pace or technique to reach target
                    efficiency.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payroll Breakdown */}
      {showBreakdown && payrollBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Payroll Breakdown
            </CardTitle>
            <CardDescription>
              Detailed breakdown for payroll processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Earnings:</span>
                <span className="font-medium">
                  ₱{payrollBreakdown.base_earnings.toFixed(2)}
                </span>
              </div>
              {payrollBreakdown.efficiency_bonus > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Efficiency Bonus:</span>
                  <span className="font-medium">
                    ₱{payrollBreakdown.efficiency_bonus.toFixed(2)}
                  </span>
                </div>
              )}
              {payrollBreakdown.quality_penalty > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Quality Penalty:</span>
                  <span className="font-medium">
                    -₱{payrollBreakdown.quality_penalty.toFixed(2)}
                  </span>
                </div>
              )}
              {payrollBreakdown.overtime_bonus > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Overtime Bonus:</span>
                  <span className="font-medium">
                    ₱{payrollBreakdown.overtime_bonus.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Gross Earnings:</span>
                <span className="font-medium">
                  ₱{payrollBreakdown.total_gross.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Deductions (10%):</span>
                <span className="font-medium">
                  -₱{payrollBreakdown.deductions.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Net Pay:</span>
                <span className="text-green-600">
                  ₱{payrollBreakdown.net_pay.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Export types
export type { PieceRateData, PayrollBreakdown, PieceRateCalculatorProps };
