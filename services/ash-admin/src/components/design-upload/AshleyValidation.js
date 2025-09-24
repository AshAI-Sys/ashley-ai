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
exports.default = AshleyValidation;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
function AshleyValidation({ designId, version, method, files, placements, palette, onValidationComplete, className = '' }) {
    const [validating, setValidating] = (0, react_1.useState)(false);
    const [validationResult, setValidationResult] = (0, react_1.useState)(null);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const runValidation = async () => {
        if (!method) {
            react_hot_toast_1.toast.error('Please select a print method first');
            return;
        }
        const hasFiles = Object.values(files).some((file) => file && file.length > 0);
        if (!hasFiles) {
            react_hot_toast_1.toast.error('Please upload at least one file first');
            return;
        }
        setValidating(true);
        setProgress(0);
        setValidationResult(null);
        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90)
                    return prev;
                return prev + Math.random() * 10;
            });
        }, 200);
        try {
            const response = await fetch('/api/ashley/validate-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: designId,
                    version: version,
                    method: method,
                    files: files,
                    placements: placements,
                    palette: palette,
                    color_count: palette.length || 1
                })
            });
            const result = await response.json();
            clearInterval(progressInterval);
            setProgress(100);
            if (response.ok) {
                setValidationResult(result);
                onValidationComplete?.(result);
                if (result.status === 'PASS') {
                    react_hot_toast_1.toast.success('Design validation passed! ✨');
                }
                else if (result.status === 'WARN') {
                    react_hot_toast_1.toast.warning(`Validation passed with ${result.issues?.length || 0} warnings`);
                }
                else {
                    react_hot_toast_1.toast.error(`Validation failed with ${result.issues?.length || 0} critical issues`);
                }
            }
            else {
                throw new Error(result.message || 'Validation failed');
            }
        }
        catch (error) {
            clearInterval(progressInterval);
            console.error('Validation failed:', error);
            react_hot_toast_1.toast.error('Ashley AI validation failed');
        }
        finally {
            setTimeout(() => {
                setValidating(false);
                setProgress(0);
            }, 500);
        }
    };
    const getStatusColor = (status) => {
        if (!status)
            return 'bg-gray-100 text-gray-800 border-gray-200';
        switch (status.toUpperCase()) {
            case 'PASS': return 'bg-green-100 text-green-800 border-green-200';
            case 'WARN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'FAIL': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getStatusIcon = (status) => {
        if (!status)
            return <lucide_react_1.Clock className="w-5 h-5 text-gray-600"/>;
        switch (status.toUpperCase()) {
            case 'PASS': return <lucide_react_1.CheckCircle className="w-5 h-5 text-green-600"/>;
            case 'WARN': return <lucide_react_1.AlertCircle className="w-5 h-5 text-yellow-600"/>;
            case 'FAIL': return <lucide_react_1.XCircle className="w-5 h-5 text-red-600"/>;
            default: return <lucide_react_1.Clock className="w-5 h-5 text-gray-600"/>;
        }
    };
    const getSeverityColor = (severity) => {
        if (!severity)
            return 'bg-gray-100 text-gray-800';
        switch (severity.toUpperCase()) {
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            case 'WARNING': return 'bg-yellow-100 text-yellow-800';
            case 'INFO': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (<div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <lucide_react_1.Zap className="w-5 h-5 text-blue-600"/>
          <h3 className="text-lg font-semibold">Ashley AI Validation</h3>
          {validationResult && (<badge_1.Badge className={getStatusColor(validationResult.status)}>
              {validationResult.status}
            </badge_1.Badge>)}
        </div>
        
        <button_1.Button onClick={runValidation} disabled={validating} className="bg-blue-600 hover:bg-blue-700">
          <lucide_react_1.Zap className="w-4 h-4 mr-2"/>
          {validating ? 'Analyzing...' : 'Run Validation'}
        </button_1.Button>
      </div>

      {/* Progress */}
      {validating && (<card_1.Card>
          <card_1.CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Clock className="w-5 h-5 text-blue-600 animate-spin"/>
                  <span className="font-medium">Ashley AI is analyzing your design...</span>
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <progress_1.Progress value={progress} className="h-2"/>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 20 ? 'bg-blue-600' : 'bg-gray-300'}`}/>
                  <span>File analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 40 ? 'bg-blue-600' : 'bg-gray-300'}`}/>
                  <span>Color validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 60 ? 'bg-blue-600' : 'bg-gray-300'}`}/>
                  <span>Placement check</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 80 ? 'bg-blue-600' : 'bg-gray-300'}`}/>
                  <span>Final analysis</span>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Validation Results */}
      {validationResult && !validating && (<div className="space-y-4">
          {/* Overall Status */}
          <card_1.Card className={`border-2 ${getStatusColor(validationResult.status)}`}>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(validationResult.status)}
                  <div>
                    <card_1.CardTitle>
                      Validation {validationResult.status === 'PASS' ? 'Passed' :
                validationResult.status === 'WARN' ? 'Passed with Warnings' : 'Failed'}
                    </card_1.CardTitle>
                    <card_1.CardDescription>
                      Analysis completed in {validationResult.analysis_time?.toFixed(1) || 0}s with {(validationResult.confidence * 100).toFixed(0)}% confidence
                    </card_1.CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {validationResult.issues?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Issues Found
                  </div>
                </div>
              </div>
            </card_1.CardHeader>
          </card_1.Card>

          {/* Issues */}
          {validationResult.issues && validationResult.issues.length > 0 && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.AlertCircle className="w-5 h-5"/>
                  Issues Found ({validationResult.issues.length})
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                {validationResult.issues.map((issue, index) => (<div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <badge_1.Badge className={getSeverityColor(issue.severity)} variant="outline">
                          {issue.severity}
                        </badge_1.Badge>
                        {issue.placement_ref && (<badge_1.Badge variant="outline">{issue.placement_ref}</badge_1.Badge>)}
                      </div>
                      <span className="text-xs text-muted-foreground">{issue.code}</span>
                    </div>
                    <p className="text-sm mb-2">{issue.message}</p>
                    {issue.suggestion && (<div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-800">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </p>
                      </div>)}
                  </div>))}
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Metrics */}
          {validationResult.metrics && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.TrendingUp className="w-5 h-5"/>
                  Analysis Metrics
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {validationResult.metrics.min_dpi && (<div className="text-center p-3 bg-gray-50 rounded">
                      <lucide_react_1.Eye className="w-6 h-6 mx-auto text-blue-600 mb-1"/>
                      <div className="text-2xl font-bold">{validationResult.metrics.min_dpi}</div>
                      <div className="text-xs text-muted-foreground">Min DPI</div>
                    </div>)}
                  
                  {validationResult.metrics.color_count && (<div className="text-center p-3 bg-gray-50 rounded">
                      <lucide_react_1.Palette className="w-6 h-6 mx-auto text-purple-600 mb-1"/>
                      <div className="text-2xl font-bold">{validationResult.metrics.color_count}</div>
                      <div className="text-xs text-muted-foreground">Colors</div>
                    </div>)}
                  
                  {validationResult.metrics.complexity_score && (<div className="text-center p-3 bg-gray-50 rounded">
                      <lucide_react_1.Ruler className="w-6 h-6 mx-auto text-green-600 mb-1"/>
                      <div className="text-2xl font-bold">{validationResult.metrics.complexity_score.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Complexity</div>
                    </div>)}
                  
                  {validationResult.metrics.estimated_cost && (<div className="text-center p-3 bg-gray-50 rounded">
                      <lucide_react_1.DollarSign className="w-6 h-6 mx-auto text-amber-600 mb-1"/>
                      <div className="text-2xl font-bold">₱{validationResult.metrics.estimated_cost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Est. Cost</div>
                    </div>)}
                  
                  {validationResult.metrics.expected_ink_g && (<div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{validationResult.metrics.expected_ink_g.toFixed(1)}g</div>
                      <div className="text-xs text-muted-foreground">Ink Usage</div>
                    </div>)}
                  
                  {validationResult.metrics.stitch_count && (<div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{validationResult.metrics.stitch_count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Stitches</div>
                    </div>)}
                  
                  {validationResult.metrics.production_time && (<div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{validationResult.metrics.production_time.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">Prod. Time</div>
                    </div>)}
                  
                  {validationResult.metrics.aop_area_cm2 && (<div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{validationResult.metrics.aop_area_cm2.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">Area cm²</div>
                    </div>)}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Recommendations */}
          {validationResult.recommendations && validationResult.recommendations.length > 0 && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Zap className="w-5 h-5"/>
                  Ashley's Recommendations
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {validationResult.recommendations.map((recommendation, index) => (<div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"/>
                      <p className="text-sm text-blue-900">{recommendation}</p>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>)}

      {/* Information Card */}
      {!validationResult && !validating && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>About Ashley AI Validation</card_1.CardTitle>
            <card_1.CardDescription>
              Get instant feedback on your design's printability and optimization
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">What Ashley Analyzes:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• File quality and resolution</li>
                  <li>• Color separation accuracy</li>
                  <li>• Placement feasibility</li>
                  <li>• Production cost estimation</li>
                  <li>• Print method compatibility</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Validation Results:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <span className="text-green-600">PASS</span> - Ready for production</li>
                  <li>• <span className="text-yellow-600">WARN</span> - Minor issues found</li>
                  <li>• <span className="text-red-600">FAIL</span> - Requires attention</li>
                </ul>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
