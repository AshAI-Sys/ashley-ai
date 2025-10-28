// Predictive Maintenance AI
// Uses machine learning to predict equipment failures before they happen

interface MaintenanceData {
  asset_id: string;
  asset_name: string;
  runtime_hours: number;
  temperature: number;
  vibration_level: number;
  noise_level: number;
  last_maintenance: Date;
  failure_history: Array<{
    date: Date;
    type: string;
    downtime_hours: number;
  }>;
}

interface PredictionResult {
  asset_id: string;
  asset_name: string;
  failure_probability: number; // 0-100%
  predicted_failure_date: Date | null;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommended_actions: string[];
  confidence: number; // 0-100%
  factors: Array<{
    name: string;
    impact: number; // 0-100%
    value: number;
    threshold: number;
  }>;
}

export class PredictiveMaintenanceAI {
  // Predict machine failure probability
  async predictFailure(data: MaintenanceData): Promise<PredictionResult> {
    // Calculate individual risk factors
    const runtimeRisk = this.calculateRuntimeRisk(
      data.runtime_hours,
      data.last_maintenance
    );
    const temperatureRisk = this.calculateTemperatureRisk(data.temperature);
    const vibrationRisk = this.calculateVibrationRisk(data.vibration_level);
    const noiseRisk = this.calculateNoiseRisk(data.noise_level);
    const historyRisk = this.calculateHistoryRisk(data.failure_history);

    // Weighted average (can be trained with ML model in production)
    const weights = {
      runtime: 0.25,
      temperature: 0.2,
      vibration: 0.25,
      noise: 0.15,
      history: 0.15,
    };

    const failureProbability =
      runtimeRisk * weights.runtime +
      temperatureRisk * weights.temperature +
      vibrationRisk * weights.vibration +
      noiseRisk * weights.noise +
      historyRisk * weights.history;

    // Determine risk level
    const riskLevel = this.determineRiskLevel(failureProbability);

    // Predict failure date based on probability
    const predictedFailureDate = this.estimateFailureDate(
      failureProbability,
      data.runtime_hours
    );

    // Generate recommendations
    const recommendedActions = this.generateRecommendations(
      failureProbability,
      {
        runtime: runtimeRisk,
        temperature: temperatureRisk,
        vibration: vibrationRisk,
        noise: noiseRisk,
      }
    );

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(data);

    return {
      asset_id: data.asset_id,
      asset_name: data.asset_name,
      failure_probability: Math.round(failureProbability * 100) / 100,
      predicted_failure_date: predictedFailureDate,
      risk_level: riskLevel,
      recommended_actions: recommendedActions,
      confidence: Math.round(confidence * 100) / 100,
      factors: [
        {
          name: "Runtime Hours",
          impact: runtimeRisk,
          value: data.runtime_hours,
          threshold: 2000,
        },
        {
          name: "Temperature",
          impact: temperatureRisk,
          value: data.temperature,
          threshold: 80,
        },
        {
          name: "Vibration",
          impact: vibrationRisk,
          value: data.vibration_level,
          threshold: 50,
        },
        {
          name: "Noise Level",
          impact: noiseRisk,
          value: data.noise_level,
          threshold: 85,
        },
        {
          name: "Failure History",
          impact: historyRisk,
          value: data.failure_history.length,
          threshold: 3,
        },
      ],
    };
  }

  // Batch prediction for all assets
  async predictAllAssets(
    assets: MaintenanceData[]
  ): Promise<PredictionResult[]> {
    const predictions = await Promise.all(
      assets.map(asset => this.predictFailure(asset))
    );

    // Sort by risk level and probability
    return predictions.sort(
      (a, b) => b.failure_probability - a.failure_probability
    );
  }

  // Calculate runtime risk
  private calculateRuntimeRisk(hours: number, lastMaintenance: Date): number {
    const daysSinceLastMaintenance =
      (Date.now() - new Date(lastMaintenance).getTime()) /
      (1000 * 60 * 60 * 24);

    // Risk increases with runtime hours and time since last maintenance
    const runtimeFactor = Math.min(hours / 2000, 1); // 2000 hours = 100% risk
    const maintenanceFactor = Math.min(daysSinceLastMaintenance / 180, 1); // 180 days = 100% risk

    return (runtimeFactor * 0.6 + maintenanceFactor * 0.4) * 100;
  }

  // Calculate temperature risk
  private calculateTemperatureRisk(temperature: number): number {
    // Normal operating temp: 40-70°C, Critical: >80°C
    if (temperature < 70) return 0;
    if (temperature >= 100) return 100;
    return ((temperature - 70) / 30) * 100;
  }

  // Calculate vibration risk
  private calculateVibrationRisk(vibration: number): number {
    // Normal: 0-30, Warning: 30-50, Critical: >50
    if (vibration < 30) return 0;
    if (vibration >= 70) return 100;
    return ((vibration - 30) / 40) * 100;
  }

  // Calculate noise risk
  private calculateNoiseRisk(noise: number): number {
    // Normal: 60-75 dB, Warning: 75-85 dB, Critical: >85 dB
    if (noise < 75) return 0;
    if (noise >= 95) return 100;
    return ((noise - 75) / 20) * 100;
  }

  // Calculate history-based risk
  private calculateHistoryRisk(
    history: MaintenanceData["failure_history"]
  ): number {
    if (history.length === 0) return 0;

    // More recent failures = higher risk
    const recentFailures = history.filter(f => {
      const daysSince =
        (Date.now() - new Date(f.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 90; // Last 90 days
    });

    const frequencyRisk = Math.min(recentFailures.length * 25, 100);
    return frequencyRisk;
  }

  // Determine risk level
  private determineRiskLevel(
    probability: number
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (probability >= 75) return "CRITICAL";
    if (probability >= 50) return "HIGH";
    if (probability >= 25) return "MEDIUM";
    return "LOW";
  }

  // Estimate failure date
  private estimateFailureDate(
    probability: number,
    _currentHours: number
  ): Date | null {
    if (probability < 25) return null;

    // Simple linear estimation (can be improved with ML)
    const averageHoursPerDay = 16; // Assuming 2 shifts
    const remainingHours = (100 - probability) * 20; // Estimation factor
    const daysUntilFailure = remainingHours / averageHoursPerDay;

    const failureDate = new Date();
    failureDate.setDate(failureDate.getDate() + Math.round(daysUntilFailure));

    return failureDate;
  }

  // Generate maintenance recommendations
  private generateRecommendations(
    probability: number,
    risks: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    if (probability >= 75) {
      recommendations.push(
        "⚠️ URGENT: Schedule immediate maintenance inspection"
      );
      recommendations.push(
        "Consider temporary shutdown to prevent catastrophic failure"
      );
    } else if (probability >= 50) {
      recommendations.push("Schedule maintenance within the next 7 days");
      recommendations.push("Monitor asset closely for unusual behavior");
    } else if (probability >= 25) {
      recommendations.push("Plan preventive maintenance in the next 2-4 weeks");
    }

    // Specific recommendations based on risk factors
    if ((risks.temperature ?? 0) > 60) {
      recommendations.push("Check cooling system and ventilation");
    }

    if ((risks.vibration ?? 0) > 60) {
      recommendations.push("Inspect bearings and alignment");
      recommendations.push("Check for loose components");
    }

    if ((risks.noise ?? 0) > 60) {
      recommendations.push("Inspect for worn gears or bearings");
      recommendations.push("Lubricate moving parts");
    }

    if ((risks.runtime ?? 0) > 70) {
      recommendations.push("Replace worn components proactively");
      recommendations.push("Update maintenance schedule");
    }

    // Always include general recommendation
    if (recommendations.length === 0) {
      recommendations.push("Continue normal operation with regular monitoring");
    }

    return recommendations;
  }

  // Calculate prediction confidence
  private calculateConfidence(data: MaintenanceData): number {
    let confidence = 100;

    // Reduce confidence if data is incomplete or outdated
    if (!data.temperature || data.temperature === 0) confidence -= 20;
    if (!data.vibration_level || data.vibration_level === 0) confidence -= 20;
    if (!data.noise_level || data.noise_level === 0) confidence -= 15;
    if (data.failure_history.length === 0) confidence -= 15;

    // Check data recency
    const daysSinceLastMaintenance =
      (Date.now() - new Date(data.last_maintenance).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysSinceLastMaintenance > 365) confidence -= 10;

    return Math.max(confidence, 0);
  }

  // Optimize maintenance schedule
  async optimizeSchedule(
    predictions: PredictionResult[],
    maintenanceCrew: number = 2
  ): Promise<{
    schedule: Array<{
      date: Date;
      assets: string[];
      priority: string;
      estimated_hours: number;
    }>;
    totalCost: number;
    preventedDowntime: number;
  }> {
    // Sort by risk and predicted failure date
    const sorted = predictions
      .filter(p => p.risk_level !== "LOW")
      .sort((a, b) => {
        if (a.risk_level === b.risk_level) {
          return (
            (a.predicted_failure_date?.getTime() || 0) -
            (b.predicted_failure_date?.getTime() || 0)
          );
        }
        const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return riskOrder[a.risk_level] - riskOrder[b.risk_level];
      });

    const schedule: any[] = [];
    const hoursPerMaintenance = 4;
    const dailyCapacity = maintenanceCrew * 8; // hours per day

    let currentDate = new Date();
    let currentDayAssets: string[] = [];
    let currentDayHours = 0;

    for (const prediction of sorted) {
      if (currentDayHours + hoursPerMaintenance > dailyCapacity) {
        // Schedule current batch
        if (currentDayAssets.length > 0) {
          schedule.push({
            date: new Date(currentDate),
            assets: [...currentDayAssets],
            priority:
              sorted.find(p => currentDayAssets.includes(p.asset_id))
                ?.risk_level || "MEDIUM",
            estimated_hours: currentDayHours,
          });
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
        currentDayAssets = [];
        currentDayHours = 0;
      }

      currentDayAssets.push(prediction.asset_id);
      currentDayHours += hoursPerMaintenance;
    }

    // Add remaining assets
    if (currentDayAssets.length > 0) {
      schedule.push({
        date: currentDate,
        assets: currentDayAssets,
        priority:
          sorted.find(p => currentDayAssets.includes(p.asset_id))?.risk_level ||
          "MEDIUM",
        estimated_hours: currentDayHours,
      });
    }

    // Calculate costs and benefits
    const costPerMaintenanceHour = 500; // PHP
    const costPerDowntimeHour = 5000; // PHP
    const totalCost = schedule.reduce(
      (sum, s) => sum + s.estimated_hours * costPerMaintenanceHour,
      0
    );
    const preventedDowntime = sorted.length * 8; // Assume 8 hours downtime per failure

    return {
      schedule,
      totalCost,
      preventedDowntime: preventedDowntime * costPerDowntimeHour,
    };
  }
}

// Export singleton
export const predictiveMaintenanceAI = new PredictiveMaintenanceAI();
