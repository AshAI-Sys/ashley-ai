// AI-Powered Quality Defect Detection
// Uses computer vision and pattern recognition to detect quality defects

interface DefectImage {
  url: string;
  base64?: string;
  width?: number;
  height?: number;
}

interface DefectDetectionResult {
  defects_found: number;
  confidence: number; // 0-100%
  detected_defects: Array<{
    type: string;
    severity: "MINOR" | "MAJOR" | "CRITICAL";
    confidence: number;
    location?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    description: string;
    recommendation: string;
  }>;
  quality_score: number; // 0-100%
  pass_fail: "PASS" | "FAIL";
  analysis_time_ms: number;
  model_version: string;
}

interface PatternAnalysis {
  pattern_type: string;
  defect_rate: number;
  common_defects: Array<{
    type: string;
    frequency: number;
    avg_severity: number;
  }>;
  root_causes: string[];
  prevention_tips: string[];
}

// Simulated computer vision defect types (in production, would use TensorFlow.js or similar)
const DEFECT_PATTERNS = {
  // Fabric defects
  STAIN: {
    keywords: ["stain", "spot", "mark", "discoloration"],
    severity: "MAJOR",
    typical_locations: ["body", "sleeve", "collar"],
  },
  HOLE: {
    keywords: ["hole", "tear", "rip", "puncture"],
    severity: "CRITICAL",
    typical_locations: ["seam", "fabric"],
  },
  PILLING: {
    keywords: ["pill", "fuzz", "fuzzy"],
    severity: "MINOR",
    typical_locations: ["surface", "friction_areas"],
  },
  FADE: {
    keywords: ["fade", "fading", "color_loss"],
    severity: "MAJOR",
    typical_locations: ["overall"],
  },

  // Sewing defects
  LOOSE_THREAD: {
    keywords: ["loose", "thread", "hanging"],
    severity: "MINOR",
    typical_locations: ["seam", "edge"],
  },
  SKIP_STITCH: {
    keywords: ["skip", "missing_stitch", "gap"],
    severity: "MAJOR",
    typical_locations: ["seam"],
  },
  BROKEN_STITCH: {
    keywords: ["broken", "snapped"],
    severity: "CRITICAL",
    typical_locations: ["seam", "stress_point"],
  },
  PUCKERING: {
    keywords: ["pucker", "gather", "wrinkle"],
    severity: "MAJOR",
    typical_locations: ["seam", "zipper"],
  },
  UNEVEN_SEAM: {
    keywords: ["uneven", "crooked", "wavy"],
    severity: "MAJOR",
    typical_locations: ["seam"],
  },

  // Print defects
  PRINT_MISALIGNMENT: {
    keywords: ["misalign", "offset", "shifted"],
    severity: "CRITICAL",
    typical_locations: ["print_area"],
  },
  INCOMPLETE_PRINT: {
    keywords: ["incomplete", "partial", "missing"],
    severity: "CRITICAL",
    typical_locations: ["print_area"],
  },
  BLEEDING: {
    keywords: ["bleed", "smudge", "blur"],
    severity: "MAJOR",
    typical_locations: ["print_edge"],
  },
  CRACKING: {
    keywords: ["crack", "peel", "flake"],
    severity: "MAJOR",
    typical_locations: ["print_surface"],
  },

  // Measurement defects
  WRONG_SIZE: {
    keywords: ["size", "measurement", "dimension"],
    severity: "CRITICAL",
    typical_locations: ["garment"],
  },
  ASYMMETRY: {
    keywords: ["asymmetric", "uneven", "lopsided"],
    severity: "MAJOR",
    typical_locations: ["overall"],
  },
};

export class DefectDetectionAI {
  private modelVersion = "v1.0.0-simulated";

  // Main defect detection function
  async detectDefects(
    image: DefectImage,
    garmentType?: string
  ): Promise<DefectDetectionResult> {
    const startTime = Date.now();

    // In production, this would use a real computer vision model (TensorFlow.js, OpenCV.js, etc.)
    // For now, we'll simulate intelligent defect detection

    const detectedDefects = await this.analyzeImage(image, garmentType);
    const defectsFound = detectedDefects.length;

    // Calculate overall confidence (based on image quality and analysis)
    const avgConfidence =
      defectsFound > 0
        ? detectedDefects.reduce((sum, d) => sum + d.confidence, 0) /
          defectsFound
        : 95;

    // Calculate quality score
    const qualityScore = this.calculateQualityScore(detectedDefects);

    // Determine pass/fail
    const criticalDefects = detectedDefects.filter(
      d => d.severity === "CRITICAL"
    ).length;
    const majorDefects = detectedDefects.filter(
      d => d.severity === "MAJOR"
    ).length;
    const passFail = criticalDefects > 0 || majorDefects > 2 ? "FAIL" : "PASS";

    const analysisTime = Date.now() - startTime;

    return {
      defects_found: defectsFound,
      confidence: Math.round(avgConfidence * 100) / 100,
      detected_defects: detectedDefects,
      quality_score: qualityScore,
      pass_fail: passFail,
      analysis_time_ms: analysisTime,
      model_version: this.modelVersion,
    };
  }

  // Batch defect detection for multiple images
  async detectDefectsBatch(
    images: DefectImage[],
    garmentType?: string
  ): Promise<DefectDetectionResult[]> {
    return Promise.all(images.map(img => this.detectDefects(img, garmentType)));
  }

  // Analyze image for defects (simulated CV analysis)
  private async analyzeImage(
    _image: DefectImage,
    garmentType?: string
  ): Promise<DefectDetectionResult["detected_defects"]> {
    const defects: DefectDetectionResult["detected_defects"] = [];

    // Simulate image analysis
    // In production, would use actual computer vision model

    // Simulate random defect detection based on realistic probabilities
    const defectProbability = Math.random();

    if (defectProbability < 0.15) {
      // 15% chance of critical defect
      const criticalDefect = this.generateDefect("CRITICAL", garmentType);
      if (criticalDefect) defects.push(criticalDefect);
    }

    if (defectProbability < 0.35) {
      // 35% chance of major defect
      const majorDefect = this.generateDefect("MAJOR", garmentType);
      if (majorDefect) defects.push(majorDefect);
    }

    if (defectProbability < 0.6) {
      // 60% chance of minor defect
      const minorDefect = this.generateDefect("MINOR", garmentType);
      if (minorDefect) defects.push(minorDefect);
    }

    // Add simulated locations for detected defects
    defects.forEach((defect, _idx) => {
      defect.location = {
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 1000),
        width: 50 + Math.floor(Math.random() * 100),
        height: 50 + Math.floor(Math.random() * 100),
      };
    });

    return defects;
  }

  // Generate a simulated defect
  private generateDefect(
    severity: "MINOR" | "MAJOR" | "CRITICAL",
    garmentType?: string
  ): DefectDetectionResult["detected_defects"][0] | null {
    // Get defect types matching severity
    const matchingDefects = Object.entries(DEFECT_PATTERNS).filter(
      ([_, pattern]) => pattern.severity === severity
    );

    if (matchingDefects.length === 0) return null;

    const [defectType, pattern] =
      matchingDefects[Math.floor(Math.random() * matchingDefects.length)];

    // Generate confidence (higher for more severe defects)
    const baseConfidence =
      severity === "CRITICAL" ? 90 : severity === "MAJOR" ? 80 : 70;
    const confidence = baseConfidence + Math.random() * 10;

    // Generate description
    const description = this.generateDefectDescription(
      defectType,
      pattern,
      garmentType
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(defectType, severity);

    return {
      type: defectType,
      severity,
      confidence: Math.round(confidence * 100) / 100,
      description,
      recommendation,
    };
  }

  // Generate defect description
  private generateDefectDescription(
    defectType: string,
    pattern: (typeof DEFECT_PATTERNS)[keyof typeof DEFECT_PATTERNS],
    garmentType?: string
  ): string {
    const location =
      pattern.typical_locations[
        Math.floor(Math.random() * pattern.typical_locations.length)
      ];

    const descriptions: Record<string, string> = {
      STAIN: `Stain detected on ${location}`,
      HOLE: `Hole or tear found in ${location}`,
      PILLING: `Fabric pilling observed on ${location}`,
      FADE: `Color fading detected`,
      LOOSE_THREAD: `Loose thread found at ${location}`,
      SKIP_STITCH: `Skipped stitches detected in ${location}`,
      BROKEN_STITCH: `Broken stitching found at ${location}`,
      PUCKERING: `Fabric puckering observed at ${location}`,
      UNEVEN_SEAM: `Uneven seam detected`,
      PRINT_MISALIGNMENT: `Print misalignment in ${location}`,
      INCOMPLETE_PRINT: `Incomplete or partial print in ${location}`,
      BLEEDING: `Ink bleeding at ${location}`,
      CRACKING: `Print cracking observed on ${location}`,
      WRONG_SIZE: `Measurement discrepancy detected`,
      ASYMMETRY: `Asymmetrical construction observed`,
    };

    return descriptions[defectType] || `Defect of type ${defectType} detected`;
  }

  // Generate recommendation for defect
  private generateRecommendation(defectType: string, _severity: string): string {
    const recommendations: Record<string, string> = {
      STAIN: "Re-wash or replace fabric. Inspect washing process.",
      HOLE: "REJECT - Replace garment. Check cutting blades and handling procedures.",
      PILLING: "Minor - Can be trimmed. Consider fabric quality upgrade.",
      FADE: "REJECT - Check dye quality and washing process.",
      LOOSE_THREAD: "Trim loose threads. Retrain operator on thread cutting.",
      SKIP_STITCH: "Re-sew seam. Check sewing machine tension and timing.",
      BROKEN_STITCH:
        "REJECT - Re-sew completely. Inspect thread quality and machine settings.",
      PUCKERING: "Re-press or re-sew. Check fabric feed and tension.",
      UNEVEN_SEAM: "Re-sew for uniformity. Retrain operator on seam alignment.",
      PRINT_MISALIGNMENT:
        "REJECT - Reprint required. Calibrate printing equipment.",
      INCOMPLETE_PRINT:
        "REJECT - Reprint. Check ink levels and print pressure.",
      BLEEDING: "REJECT - Check print curing process and ink quality.",
      CRACKING: "REJECT - Review curing temperature and fabric compatibility.",
      WRONG_SIZE: "REJECT - Verify pattern and cutting accuracy.",
      ASYMMETRY: "REJECT - Re-cut or re-sew. Check pattern alignment.",
    };

    return (
      recommendations[defectType] ||
      "Consult quality supervisor for resolution."
    );
  }

  // Calculate overall quality score
  private calculateQualityScore(
    defects: DefectDetectionResult["detected_defects"]
  ): number {
    let score = 100;

    defects.forEach(defect => {
      if (defect.severity === "CRITICAL") score -= 30;
      else if (defect.severity === "MAJOR") score -= 15;
      else if (defect.severity === "MINOR") score -= 5;
    });

    return Math.max(score, 0);
  }

  // Analyze defect patterns across multiple inspections
  async analyzeDefectPatterns(
    inspections: Array<{
      date: Date;
      operator_id?: string;
      station?: string;
      defects: DefectDetectionResult["detected_defects"];
    }>
  ): Promise<PatternAnalysis> {
    // Count defect frequencies
    const defectCounts: Record<
      string,
      { count: number; totalSeverity: number }
    > = {};

    inspections.forEach(inspection => {
      inspection.defects.forEach(defect => {
        if (!defectCounts[defect.type]) {
          defectCounts[defect.type] = { count: 0, totalSeverity: 0 };
        }
        defectCounts[defect.type]!.count++;
        const severityScore =
          defect.severity === "CRITICAL"
            ? 3
            : defect.severity === "MAJOR"
              ? 2
              : 1;
        defectCounts[defect.type]!.totalSeverity += severityScore;
      });
    });

    // Calculate defect rate
    const totalInspections = inspections.length;
    const inspectionsWithDefects = inspections.filter(
      i => i.defects.length > 0
    ).length;
    const defectRate = (inspectionsWithDefects / totalInspections) * 100;

    // Identify common defects
    const commonDefects = Object.entries(defectCounts)
      .map(([type, data]) => ({
        type,
        frequency: (data.count / totalInspections) * 100,
        avg_severity: data.totalSeverity / data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Determine pattern type
    let patternType = "RANDOM";
    if (defectRate > 50) {
      patternType = "SYSTEMIC";
    } else if (commonDefects.length > 0 && commonDefects[0]!.frequency > 30) {
      patternType = "RECURRING";
    } else if (defectRate < 10) {
      patternType = "SPORADIC";
    }

    // Identify root causes
    const rootCauses = this.identifyRootCauses(commonDefects, patternType);

    // Generate prevention tips
    const preventionTips = this.generatePreventionTips(commonDefects);

    return {
      pattern_type: patternType,
      defect_rate: Math.round(defectRate * 100) / 100,
      common_defects: commonDefects,
      root_causes: rootCauses,
      prevention_tips: preventionTips,
    };
  }

  // Identify root causes
  private identifyRootCauses(
    commonDefects: PatternAnalysis["common_defects"],
    patternType: string
  ): string[] {
    const causes: string[] = [];

    if (patternType === "SYSTEMIC") {
      causes.push("Equipment malfunction or misconfiguration");
      causes.push("Inadequate operator training");
      causes.push("Poor quality raw materials");
    }

    commonDefects.forEach(defect => {
      if (defect.type.includes("STITCH") || defect.type.includes("SEAM")) {
        causes.push("Sewing machine maintenance required");
        causes.push("Incorrect machine settings (tension, speed)");
      }
      if (defect.type.includes("PRINT")) {
        causes.push("Printing equipment calibration needed");
        causes.push("Ink or substrate quality issues");
      }
      if (defect.type.includes("STAIN") || defect.type.includes("FADE")) {
        causes.push("Fabric quality or handling issues");
        causes.push("Washing or dyeing process problems");
      }
    });

    // Remove duplicates
    return [...new Set(causes)];
  }

  // Generate prevention tips
  private generatePreventionTips(
    commonDefects: PatternAnalysis["common_defects"]
  ): string[] {
    const tips: string[] = [
      "Implement regular equipment maintenance schedule",
      "Conduct operator training and skill assessments",
      "Improve incoming material quality inspection",
    ];

    commonDefects.forEach(defect => {
      if (defect.type.includes("STITCH")) {
        tips.push("Daily sewing machine check and cleaning routine");
      }
      if (defect.type.includes("PRINT")) {
        tips.push("Pre-production print test and calibration");
      }
      if (defect.frequency > 25) {
        tips.push(
          `Focus on reducing ${defect.type.toLowerCase()} defects through targeted training`
        );
      }
    });

    return [...new Set(tips)].slice(0, 7);
  }

  // Compare quality between operators/stations
  async compareQuality(
    data: Array<{
      entity_id: string;
      entity_name: string;
      inspections: DefectDetectionResult[];
    }>
  ): Promise<
    Array<{
      entity_id: string;
      entity_name: string;
      avg_quality_score: number;
      defect_rate: number;
      critical_defects: number;
      ranking: number;
    }>
  > {
    const results = data.map(entity => {
      const totalInspections = entity.inspections.length;
      const avgQualityScore =
        entity.inspections.reduce((sum, i) => sum + i.quality_score, 0) /
        totalInspections;
      const totalDefects = entity.inspections.reduce(
        (sum, i) => sum + i.defects_found,
        0
      );
      const criticalDefects = entity.inspections.reduce(
        (sum, i) =>
          sum +
          i.detected_defects.filter(d => d.severity === "CRITICAL").length,
        0
      );
      const defectRate = (totalDefects / totalInspections) * 100;

      return {
        entity_id: entity.entity_id,
        entity_name: entity.entity_name,
        avg_quality_score: Math.round(avgQualityScore * 100) / 100,
        defect_rate: Math.round(defectRate * 100) / 100,
        critical_defects: criticalDefects,
        ranking: 0, // Will be set after sorting
      };
    });

    // Sort by quality score descending
    results.sort((a, b) => b.avg_quality_score - a.avg_quality_score);

    // Assign rankings
    results.forEach((result, idx) => {
      result.ranking = idx + 1;
    });

    return results;
  }
}

// Export singleton
export const defectDetectionAI = new DefectDetectionAI();

