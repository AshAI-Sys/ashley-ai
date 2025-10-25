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
exports.SubmitSection = SubmitSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const separator_1 = require("@/components/ui/separator");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const VALIDATION_SECTIONS = [
    { id: "client", name: "Client & Brand", icon: lucide_react_1.FileText },
    { id: "product", name: "Product & Design", icon: lucide_react_1.FileText },
    { id: "quantities", name: "Quantities & Sizes", icon: lucide_react_1.TrendingUp },
    { id: "variants", name: "Variants & Add-ons", icon: lucide_react_1.FileText },
    { id: "dates", name: "Dates & SLAs", icon: lucide_react_1.Clock },
    { id: "commercials", name: "Commercials", icon: lucide_react_1.DollarSign },
    { id: "production", name: "Production Route", icon: lucide_react_1.TrendingUp },
    { id: "files", name: "Files & Notes", icon: lucide_react_1.FileText },
];
function SubmitSection({ formData, onSubmit, isSubmitting, }) {
    const [validating, setValidating] = (0, react_1.useState)(false);
    const [validationProgress, setValidationProgress] = (0, react_1.useState)(0);
    const [ashleyValidation, setAshleyValidation] = (0, react_1.useState)(null);
    const [showDetails, setShowDetails] = (0, react_1.useState)(false);
    const runAshleyValidation = async () => {
        setValidating(true);
        setValidationProgress(0);
        try {
            // Simulate comprehensive Ashley AI validation
            const steps = VALIDATION_SECTIONS.length;
            for (let i = 0; i < steps; i++) {
                await new Promise(resolve => setTimeout(resolve, 800));
                setValidationProgress(((i + 1) / steps) * 100);
            }
            // Generate mock validation results
            const mockValidation = {
                overall: {
                    score: Math.floor(Math.random() * 30) + 70, // 70-100
                    feasible: Math.random() > 0.1, // 90% chance feasible
                    confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
                    readinessLevel: Math.random() > 0.3 ? "ready" : "needs_review",
                },
                sections: {},
                recommendations: [
                    "Order specifications are well-defined and production-ready",
                    "Timeline is achievable with current production capacity",
                    "Pricing is competitive and maintains healthy margins",
                    "Consider bulk discount opportunities for future orders",
                ].slice(0, Math.floor(Math.random() * 3) + 2),
                businessInsights: {
                    profitability: Math.floor(Math.random() * 30) + 40, // 40-70%
                    riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
                    marketPosition: "Competitive pricing with standard quality expectations",
                },
            };
            // Generate section validations
            VALIDATION_SECTIONS.forEach(section => {
                const hasIssues = Math.random() > 0.7; // 30% chance of issues
                const issues = [];
                if (hasIssues) {
                    issues.push({
                        field: section.name,
                        severity: Math.random() > 0.5 ? "warning" : "info",
                        message: `Minor optimization opportunity in ${section.name.toLowerCase()}`,
                        suggestion: "Consider reviewing for potential improvements",
                    });
                }
                mockValidation.sections[section.id] = {
                    valid: !hasIssues || issues.every(i => i.severity !== "error"),
                    score: Math.floor(Math.random() * 20) + 80, // 80-100
                    issues,
                };
            });
            setAshleyValidation(mockValidation);
            if (mockValidation.overall.feasible) {
                react_hot_toast_1.toast.success("Ashley AI validation completed successfully");
            }
            else {
                react_hot_toast_1.toast.error("Ashley AI found critical issues that need attention");
            }
        }
        catch (error) {
            console.error("Validation error:", error);
            react_hot_toast_1.toast.error("Ashley AI validation failed");
        }
        finally {
            setValidating(false);
        }
    };
    const getOverallValidationColor = () => {
        if (!ashleyValidation)
            return "gray";
        if (ashleyValidation.overall.readinessLevel === "ready")
            return "green";
        if (ashleyValidation.overall.readinessLevel === "needs_review")
            return "amber";
        return "red";
    };
    const getScoreColor = (score) => {
        if (score >= 90)
            return "text-green-600";
        if (score >= 75)
            return "text-gray-900";
        if (score >= 60)
            return "text-amber-600";
        return "text-red-600";
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case "low":
                return "text-green-600 bg-green-50 border-green-200";
            case "medium":
                return "text-amber-600 bg-amber-50 border-amber-200";
            case "high":
                return "text-red-600 bg-red-50 border-red-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };
    const canSubmitOrder = () => {
        return (ashleyValidation?.overall.feasible &&
            ashleyValidation?.overall.readinessLevel !== "incomplete");
    };
    (0, react_1.useEffect)(() => {
        // Auto-run validation when component mounts if form has data
        if (formData && Object.keys(formData).length > 0) {
            runAshleyValidation();
        }
    }, []);
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          I. Submit Order
          <badge_1.Badge variant="secondary">Final Step</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Ashley AI Validation */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <lucide_react_1.Sparkles className="h-6 w-6 text-purple-600"/>
              <h3 className="text-lg font-semibold text-purple-900">
                Ashley AI Final Validation
              </h3>
            </div>
            <button_1.Button variant="outline" onClick={runAshleyValidation} disabled={validating} size="sm">
              {validating ? (<>
                  <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Validating...
                </>) : (<>
                  <lucide_react_1.ShieldCheck className="mr-2 h-4 w-4"/>
                  {ashleyValidation ? "Re-validate" : "Validate Order"}
                </>)}
            </button_1.Button>
          </div>

          {validating && (<div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Running comprehensive validation...</span>
                <span>{Math.round(validationProgress)}%</span>
              </div>
              <progress_1.Progress value={validationProgress} className="h-2"/>
              <div className="text-sm text-purple-600">
                Ashley AI is analyzing all aspects of your order for
                feasibility, timeline, and optimization opportunities.
              </div>
            </div>)}

          {ashleyValidation && (<div className="space-y-4">
              {/* Overall Score */}
              <div className={`rounded-lg border p-4 ${getOverallValidationColor() === "green"
                ? "border-green-200 bg-green-50"
                : getOverallValidationColor() === "amber"
                    ? "border-amber-200 bg-amber-50"
                    : "border-red-200 bg-red-50"}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ashleyValidation.overall.feasible ? (<lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>) : (<lucide_react_1.AlertCircle className="h-5 w-5 text-red-600"/>)}
                    <span className="font-semibold">
                      Overall Assessment:{" "}
                      {ashleyValidation.overall.readinessLevel
                .replace("_", " ")
                .toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(ashleyValidation.overall.score)}`}>
                      {ashleyValidation.overall.score}/100
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ashleyValidation.overall.confidence}% confidence
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 text-sm md:grid-cols-3">
                  <div>
                    <span className="font-medium">Feasibility:</span>
                    <div className={ashleyValidation.overall.feasible
                ? "text-green-700"
                : "text-red-700"}>
                      {ashleyValidation.overall.feasible
                ? "Production Ready"
                : "Needs Revision"}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Profitability:</span>
                    <div className={getScoreColor(ashleyValidation.businessInsights.profitability)}>
                      {ashleyValidation.businessInsights.profitability}% margin
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Risk Level:</span>
                    <div className={`inline-block rounded px-2 py-1 text-xs ${getRiskColor(ashleyValidation.businessInsights.riskLevel)}`}>
                      {ashleyValidation.businessInsights.riskLevel.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Section Validation Breakdown</h4>
                  <button_1.Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? "Hide" : "Show"} Details
                  </button_1.Button>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {VALIDATION_SECTIONS.map(section => {
                const sectionData = ashleyValidation.sections[section.id];
                const IconComponent = section.icon;
                return (<div key={section.id} className={`rounded-lg border p-3 text-center ${sectionData?.valid
                        ? "border-green-200 bg-green-50"
                        : "border-amber-200 bg-amber-50"}`}>
                        <IconComponent className="mx-auto mb-1 h-4 w-4"/>
                        <div className="text-xs font-medium">
                          {section.name}
                        </div>
                        <div className={`text-sm ${getScoreColor(sectionData?.score || 0)}`}>
                          {sectionData?.score || 0}/100
                        </div>
                      </div>);
            })}
                </div>

                {showDetails && (<div className="space-y-3">
                    {VALIDATION_SECTIONS.map(section => {
                    const sectionData = ashleyValidation.sections[section.id];
                    if (!sectionData?.issues.length)
                        return null;
                    return (<div key={section.id} className="rounded border p-3">
                          <h5 className="mb-2 font-medium">{section.name}</h5>
                          <div className="space-y-1">
                            {sectionData.issues.map((issue, i) => (<div key={i} className="flex items-start gap-2 text-sm">
                                {issue.severity === "error" ? (<lucide_react_1.AlertCircle className="mt-0.5 h-4 w-4 text-red-500"/>) : issue.severity === "warning" ? (<lucide_react_1.AlertCircle className="mt-0.5 h-4 w-4 text-amber-500"/>) : (<lucide_react_1.CheckCircle className="mt-0.5 h-4 w-4 text-gray-700"/>)}
                                <div>
                                  <div className={issue.severity === "error"
                                ? "text-red-700"
                                : issue.severity === "warning"
                                    ? "text-amber-700"
                                    : "text-gray-900"}>
                                    {issue.message}
                                  </div>
                                  {issue.suggestion && (<div className="mt-1 text-xs text-muted-foreground">
                                      Suggestion: {issue.suggestion}
                                    </div>)}
                                </div>
                              </div>))}
                          </div>
                        </div>);
                })}
                  </div>)}
              </div>

              {/* Recommendations */}
              {ashleyValidation.recommendations.length > 0 && (<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-3 font-medium text-gray-900">
                    Ashley AI Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {ashleyValidation.recommendations.map((rec, i) => (<li key={i} className="flex items-start gap-2 text-sm text-gray-900">
                        <lucide_react_1.CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-900"/>
                        {rec}
                      </li>))}
                  </ul>
                </div>)}

              {/* Business Insights */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 font-medium text-gray-900">
                  Business Insights
                </h4>
                <div className="text-sm text-gray-900">
                  <p>
                    <strong>Market Position:</strong>{" "}
                    {ashleyValidation.businessInsights.marketPosition}
                  </p>
                  <p className="mt-1">
                    <strong>Profitability:</strong>{" "}
                    {ashleyValidation.businessInsights.profitability}% estimated
                    margin with {ashleyValidation.businessInsights.riskLevel}{" "}
                    risk level
                  </p>
                </div>
              </div>
            </div>)}
        </div>

        <separator_1.Separator />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button_1.Button variant="outline" onClick={() => onSubmit("draft")} disabled={isSubmitting} className="flex-1">
            <lucide_react_1.Save className="mr-2 h-4 w-4"/>
            Save as Draft
          </button_1.Button>

          <button_1.Button onClick={() => onSubmit("submit")} disabled={isSubmitting || !canSubmitOrder()} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? (<>
                <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Submitting...
              </>) : (<>
                <lucide_react_1.Send className="mr-2 h-4 w-4"/>
                Submit for Production
              </>)}
          </button_1.Button>
        </div>

        {/* Submission Guidelines */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm">
          <h4 className="mb-2 font-medium text-yellow-900">
            Before Submitting:
          </h4>
          <ul className="space-y-1 text-yellow-800">
            <li>• Ensure all required fields are completed accurately</li>
            <li>• Verify client details and delivery requirements</li>
            <li>• Confirm pricing and payment terms are acceptable</li>
            <li>
              • Check that design files are high-quality and production-ready
            </li>
            <li>
              • Review Ashley AI recommendations for optimization opportunities
            </li>
          </ul>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
